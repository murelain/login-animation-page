import {TokenStorage} from './';
import {CanActivateChild} from '@angular/router/router';
import {EventEmitter, Injectable, InjectionToken, Inject} from '@angular/core';
import {Observable} from 'rxjs';
import {Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot} from '@angular/router';
import {ValueSubject} from '../common/valuesubject';
import {Token, AuthEvent, AuthState} from './common';
import {Backend, BackendEvent} from './backend';
import {Response, Headers, RequestOptionsArgs} from '@angular/http';
import {User} from '../../../models';
import {isNullOrUndefined} from 'util';

export const TOKEN_STORAGE = new InjectionToken('TOKEN_STORAGE');

export const ME_CLASS = new InjectionToken('ME_CLASS');

@Injectable()
export class Auth {

    public static get TOKEN_LIFETIME(): number {
        return 1000 * 60 * 4; // 5 min backend lifetime
    }

    private readonly _authChangeEvent: EventEmitter<AuthEvent>;
    private _state: AuthState = AuthState.NotLogged;
    private _me: ValueSubject<User> = new ValueSubject<User>();

    constructor(private _backend: Backend,
                @Inject(TOKEN_STORAGE) private _tokenStorage: any,
                @Inject(ME_CLASS) private _meClass) {
        this._backend.setTokenStorage(_tokenStorage);
        this._backend.events.subscribe(this.onBackendEvent.bind(this));
        this._authChangeEvent = new EventEmitter<AuthEvent>(true);
        setTimeout(this.fetch.bind(this));
    }

    public emitState(state: AuthState, me: any, userEvent: boolean): void {

        this._state = state;
        if (me) {
            this._me.value = this.createMeObject(me);
        }

        this._authChangeEvent.emit(new AuthEvent(state, me, userEvent));
    }

    private createMeObject(raw: any) {
        const inst = new this._meClass;
        if (!inst.hydrate) {
            throw new Error('Auth class should be a Hydratable object');
        }
        inst.hydrate(raw);
        return inst;
    }

    private fetch(): void {
        const token = this._tokenStorage.get();

        if (!token) {
            return this.emitState(AuthState.NotLogged, null, false);
        }

        this._backend.get('/me').subscribe(
            (response: Response) => this.emitState(AuthState.Logged, this.createMeObject(response.json()), false),
            () => this.emitState(AuthState.NotLogged, null, false)
        );
    }

    private refresh(): void {
        /*        this._backend.get('/auth/refresh').subscribe(
                    (response: Response) => {
                        const data: any = response.json();
                        if (data && data.token) {
                            this._tokenStorage.put(data.token);
                        }
                    },
                    (err: Response) => {
                    }
                );*/

        setTimeout(this.refresh.bind(this), Auth.TOKEN_LIFETIME);
    }

    get storage(): TokenStorage {
        return this._tokenStorage;
    }

    private onBackendEvent(event: BackendEvent): void {
        switch (event.type) {
            case BackendEvent.TOKEN_EXPIRED:
                this._tokenStorage.destroy();
                this.emitState(AuthState.TokenExpired, null, false);
                break;
        }
    }

    public onLoginSuccess(response: Response): void {
        const data: Token = response.json();

        if (!data.access_token) {
            return this.emitState(AuthState.NotLogged, null, false);
        }

        this._tokenStorage.put(data);

        setTimeout(() => this.fetch());

        setTimeout(this.refresh.bind(this), Auth.TOKEN_LIFETIME);
    }

    public login(username: string, password: string): EventEmitter<AuthEvent> {
        const headers = new Headers({
            'Content-Type': 'application/x-www-form-urlencoded',
        });

        const options: RequestOptionsArgs = {
            headers: headers,
        };

        const params: URLSearchParams = new URLSearchParams();
        params.set('grant_type', 'password');
        params.set('username', username);
        params.set('password', password);

        this._backend.post('/auth/token', params.toString(), options).subscribe(
            (response: Response) => this.onLoginSuccess(response),
            (error: any) => this.emitState(AuthState.NotLogged, null, true)
        );

        return this._authChangeEvent;
    }

    public loginWithAdapter(adapter: string, data: any): EventEmitter<AuthEvent> {
        this._backend.post('/auth/' + adapter, data).subscribe(
            (response: Response) => this.onLoginSuccess(response),
            (error: any) => this.emitState(AuthState.NotLogged, null, true)
        );

        return this._authChangeEvent;
    }

    public logout() {
        this._me.value = null;
        this._tokenStorage.destroy();
        this.emitState(AuthState.NotLogged, null, false);
        setTimeout(() => location.reload(), 50); // force a refresh to temporary fix a very weird messenger bug
    }

    get change(): Observable<AuthEvent> {
        return this._authChangeEvent.asObservable();
    }

    get state(): AuthState {
        return this._state;
    }

    get me(): Observable<User> {
        return this._me.asObservable();
    }

    public refreshUser(u?: User): void {
        if (u !== undefined) {
            this.emitState(AuthState.Logged, u, true);
        } else {
            this._backend.get('/me').subscribe((res: Response) => this.emitState(AuthState.Logged, new User(res.json()), true));
        }
    }
}

@Injectable()
export class IsLogged implements CanActivate {

    constructor(private _auth: Auth,
                private _router: Router) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return new Observable(s => {

            if (this._auth.state === AuthState.Logged) {
                s.next(true);
                s.complete();
                return;
            }

            this._auth.change.subscribe(event => {
                if (event.state === AuthState.NotLogged) {
                    this._router.navigateByUrl('/login');
                    s.next(false);
                    return;
                }

                s.next(true);
                s.complete();
            });
        });
    }
}

@Injectable()
export class IsAffiliate implements CanActivate {
    constructor(private _auth: Auth, private _router: Router) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return new Observable(s => {
            this._auth.me.subscribe((user: User) => {
                if (isNullOrUndefined(user)) {
                    this._router.navigateByUrl('/login');
                    s.next(false);
                    return;
                }

                if (user.isAffiliate()) {
                    s.next(true);
                    s.complete();
                } else {
                    this._router.navigateByUrl('/dashboard');
                    s.next(false);
                    return;
                }
                return;
            });
        });
    }
}

@Injectable()
export class IsRegularUser implements CanActivate {
    constructor(private _auth: Auth, private _router: Router) {
    }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return new Observable(s => {
            this._auth.me.subscribe((user: User) => {
                if (isNullOrUndefined(user)) {
                    this._router.navigateByUrl('/login');
                    s.next(false);
                    return;
                }

                if (!user.isAffiliate()) {
                    s.next(true);
                    s.complete();
                } else {
                    this._router.navigateByUrl('/dashboard');
                    s.next(false);
                    return;
                }
                return;
            });
        });
    }
}

@Injectable()
export class IsLoggedChild implements CanActivateChild {

    constructor(private _auth: Auth,
                private _router: Router) {
    }

    canActivateChild(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> | Promise<boolean> | boolean {
        return new Observable(s => {

            if (this._auth.state === AuthState.Logged) {
                s.next(true);
                s.complete();
                return;
            }

            this._auth.change.subscribe(
                event => {

                    if (event.state === AuthState.NotLogged) {
                        this._router.navigateByUrl('/login');
                        s.next(false);
                        return;
                    }

                    s.next(true);
                    s.complete();
                }
            );
        });
    }
}
