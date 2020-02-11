import {EventEmitter, Injectable, Inject, InjectionToken, Optional} from '@angular/core';
import {Observable} from 'rxjs';
import {TokenStorage} from './storage';
import {Subscriber} from 'rxjs';
import {Subscription} from 'rxjs';
import {
    ConnectionBackend,
    Headers,
    Http,
    Request,
    RequestOptions,
    RequestOptionsArgs,
    Response
} from '@angular/http';

export const BACKEND_HOST = new InjectionToken('BACKEND_HOST');

export class BackendEvent {
    public static get TOKEN_EXPIRED(): number {
        return 0;
    }

    constructor(public type: Number, public request: Request, public response: Response) {
    }
}

interface ResponseError {
    message: string;
    code: number;
}

@Injectable()
export class Backend extends Http {

    private _accessKey: string;
    private _backendEvent: EventEmitter<BackendEvent>;
    private _storage: TokenStorage;

    constructor(@Inject(BACKEND_HOST) private _host: string,
                backend: ConnectionBackend,
                @Optional() defaultOptions: RequestOptions) {
        super(backend, defaultOptions ? defaultOptions : new RequestOptions());
        this._backendEvent = new EventEmitter<BackendEvent>(true);
    }

    url(uri: string): string {
        if (this._accessKey === undefined || this._accessKey === null) {
            return this._host + uri;
        }

        if (uri.indexOf('?') !== -1) {
            uri += '&access_token=' + this._accessKey;
        } else {
            uri += '?access_token=' + this._accessKey;
        }

        return this._host + uri;
    }

    request(url: string | Request, options: RequestOptionsArgs): Observable<Response> {
        const request: Request = url as Request;

        request.url = this._host + request.url;

        const response: Observable<Response> = this._backend.createConnection(request).response;

        return new Observable<Response>((subscriber: Subscriber<Response>) => {
            const subscription: Subscription = response.subscribe(
                (r: Response) => subscriber.next(r),
                (r: Response) => {
                    if (r.status === 404) {
                        subscriber.error(new Response({body: {}, status: 404, headers: new Headers(), url: r.url, merge: null}));
                        return;
                    }

                    const error: ResponseError = r.json() as ResponseError;

                    switch (error.code) {
                        case 200: // token expired
                            this._backendEvent.emit(new BackendEvent(BackendEvent.TOKEN_EXPIRED, request, r));
                            break;
                        case 100:
                        case 101:
                        case 102:
                        case 103:
                            this._backendEvent.emit(new BackendEvent(BackendEvent.TOKEN_EXPIRED, request, r));
                            break;
                    }

                    subscription.unsubscribe();
                    subscriber.error(r);
                },
                () => subscriber.complete()
            );

            subscriber.add(() => subscription.unsubscribe());
        });
    }

    getTokenStorage(): TokenStorage {
        return this._storage;
    }

    setTokenStorage(storage: TokenStorage): void {
        this._storage = storage;

        if (!this._defaultOptions.headers) {
            this._defaultOptions.headers = new Headers();
        }

        const headers: Headers = this._defaultOptions.headers;

        this._accessKey = storage.get();

        if (this._accessKey) {
            headers.set('Authorization', 'Bearer ' + this._accessKey);
        }

        storage.change().subscribe(
            (state: boolean) => {
                if (state) {
                    this._accessKey = storage.get();
                    headers.set('Authorization', 'Bearer ' + this._accessKey);
                } else {
                    this._accessKey = null;
                    headers.delete('Authorization');
                }
            }
        );
    }

    get events(): Observable<BackendEvent> {
        return this._backendEvent.asObservable();
    }
}
