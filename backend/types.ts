import { Header } from "encore.dev/api";

export interface AuthTokens{
    accessToken: string;
    refreshToken: string;
}
export interface TokenPayload{
    userID: string;
    type:"access"|"refresh";
    exp:number;
    role?: string;
}

export interface AuthParams{
    authorization:Header<"Authorization">;
}

export interface AuthData{
    userID: string;
    role?: string;
}

export interface RefreshParams{
    refreshToken:string;
}
