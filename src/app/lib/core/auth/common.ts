export enum AuthState {
    TokenExpired = -1,
    NotLogged = 0,
    Logged = 1
}

export class AuthEvent {
    constructor(public state: AuthState, public me?: any, public userEvent?: boolean) {}
}

export declare interface Token {
    access_token: string;
    token_type: 'bearer';
    expires_in: number;

    refresh_token?: string;
    scope?: string;
}
