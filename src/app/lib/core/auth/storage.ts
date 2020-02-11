import {environment} from '../../../../environments/environment';
import {Injectable, Inject, InjectionToken, Optional, EventEmitter} from '@angular/core';
import {Cookie} from '../common/cookie';
import {Observable} from 'rxjs';
import {Token} from './common';

export interface TokenStorage {
    get(): string;

    put(token: Token): void;

    destroy(): void;

    change(): Observable<boolean>;
}

export const STORAGE_TOKEN_NAME = new InjectionToken('STORAGE_TOKEN_NAME');

@Injectable()
export class CookieTokenStorage implements TokenStorage {

    private readonly name: string;

    private changeEventEmitter: EventEmitter<boolean>;

    constructor(@Optional() @Inject(STORAGE_TOKEN_NAME) name: string) {
        this.name = name || 'token';
        this.changeEventEmitter = new EventEmitter<boolean>(true);

        const search = window.location.search.substring(1);

        if (search) {
            const params = new URLSearchParams(search);

            if (params.has('access_token')) {
                Cookie.put(this.name, params.get('access_token'), environment.COOKIE_DOMAIN, 1);
            }
        }
    }

    get(): string {
        return Cookie.get(this.name);
    }

    put(token: Token): void {
        const expire = new Date();
        expire.setSeconds(expire.getSeconds() + token.expires_in);
        Cookie.put(this.name, token.access_token, environment.COOKIE_DOMAIN, expire);
        this.changeEventEmitter.next(true);
    }

    destroy(): void {
        Cookie.put(this.name, '', environment.COOKIE_DOMAIN, -1);
        Cookie.delete(this.name, environment.COOKIE_DOMAIN);
        this.changeEventEmitter.next(false);
    }

    change(): Observable<boolean> {
        return this.changeEventEmitter.asObservable();
    }
}
