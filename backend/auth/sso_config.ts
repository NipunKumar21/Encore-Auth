import {secret} from "encore.dev/config";

export interface SSOConfig{
    google:{
        clientId:string;
        clientSecret:string;
        redirectUri:string;
    };
}

//defining secrets for sso providers

export const googleClientId = secret("GOOGLE_CLIENT_ID");
export const googleClientSecret = secret("GOOGLE_CLIENT_SECRET");

