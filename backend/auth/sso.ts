import {api,APIError} from "encore.dev/api";
import {db} from "../db";
import {generateTokens} from "./jwt";
import {AuthTokens} from "../user/types";
import {googleClientId ,googleClientSecret} from "./sso_config";

interface GoogleTokenResponse {
    access_token: string;
    token_type: string;
    expires_in: number;
    refresh_token?: string;
    scope: string;
}

interface GoogleUserInfo {
    id: string;
    email: string;
    name?: string;
    picture?: string;
    locale?: string;
}

interface SSOUserInfo{
    id:string;
    email:string;
    name?:string;
    provider:string;
}

//google oauth endpoints
export const googleAuth =api(
    {method:"GET",path:"/auth/google"},
    async(): Promise<{authUrl:string}>=>{
        const clientId = googleClientId();
        console.log("Google Client ID:", clientId);
        const redirectUri ="http://localhost:5173/oauth/google/callback";
        const scope ="email profile";

        // Ensure clientId is not empty
        if (!clientId) {
            throw new Error("Google Client ID is not configured");
        }

        const authUrl =`https://accounts.google.com/o/oauth2/v2/auth?`+
        `response_type=code&`+
        `client_id=${encodeURIComponent(clientId)}&`+
        `redirect_uri=${encodeURIComponent(redirectUri)}&`+
        `scope=${encodeURIComponent(scope)}&`+
        `access_type=offline&`+
        `prompt=consent`;
        
        console.log("Auth URL:", authUrl);
        return {authUrl};
    }
);

export const googleCallback = api(
    {method:"GET",path:"/auth/google/callback"},
    async(params:{code:string}):Promise<AuthTokens>=>{
        //exchange code for tokens
        const tokenResponse = await fetch("https://oauth2.googleapis.com/token",{
            method:"POST",
            headers:{"Content-Type":"application/x-www-form-urlencoded"},
            body:new URLSearchParams({
                code:params.code,
                client_id:googleClientId(),
                client_secret:googleClientSecret(),
                redirect_uri:"http://localhost:5173/oauth/google/callback",
                grant_type:"authorization_code",
            }),
        });

        const tokens=await tokenResponse.json() as GoogleTokenResponse;

        //get user info
        const userInfoResponse = await fetch("https://www.googleapis.com/oauth2/v2/userinfo",{
            headers:{authorization:`Bearer ${tokens.access_token}`},
        });

        const userInfo= await userInfoResponse.json() as GoogleUserInfo;

        //handle user creation/login
        return await handleSSOUser({
            id:userInfo.id,
            email:userInfo.email,
            name:userInfo.name,
            provider:"google",
        });
    }
);

//helper function to handle sso user creation/login
async function handleSSOUser(userInfo:SSOUserInfo):Promise<AuthTokens>{
    // First check if user exists with this SSO provider and ID
    const existingSSOUser=await db.queryRow<{ id:string; role:string}>`
    SELECT id,role FROM users
    WHERE sso_provider=${userInfo.provider} AND sso_id=${userInfo.id}
    `;

    if(existingSSOUser){
        //user already exists with this SSO provider, return/generate tokens
        return await generateTokens(existingSSOUser.id,existingSSOUser.role);
    }

    // Check if user exists with this email
    const existingEmailUser=await db.queryRow<{ id:string; role:string}>`
    SELECT id,role FROM users
    WHERE email=${userInfo.email}
    `;

    if(existingEmailUser){
        // User exists with this email, update their SSO info
        await db.exec`
        UPDATE users
        SET sso_provider=${userInfo.provider},
            sso_id=${userInfo.id}
        WHERE id=${existingEmailUser.id}
        `;
        return await generateTokens(existingEmailUser.id,existingEmailUser.role);
    }

    //Create new user
    const result = await db.queryRow<{id:string}>`
    INSERT INTO users(
    email,
    sso_provider,
    sso_id,
    role,
    email_verified,
    two_factor_enabled,
    password_hash
    )
    VALUES(
    ${userInfo.email},
    ${userInfo.provider},
    ${userInfo.id},
    'user',
    true,
    false,
    '__NO_PASSWORD__'
    )
    RETURNING id
    `;

    //generate tokens for new user 
    if (!result) {
        throw new Error("Failed to create user");
    }
    return await generateTokens(result.id,"user");
}