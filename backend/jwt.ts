import{secret} from "encore.dev/config";
import{SignJWT,jwtVerify} from "jose";
import { TokenPayload } from "./types";

//defining secrets for jwt signing
const JWT_SECRET=secret("JWT_SECRET");
const REFRESH_SECRET=secret("REFRESH_SECRET");

//setting token expiration times
const ACCESS_TOKEN_EXPIRATION="5m";
const REFRESH_TOKEN_EXPIRATION="10m";

export async function generateTokens(userID:string, role?: string): Promise<{
    accessToken:string;
    refreshToken:string;
}>{
    // Create a payload with userID and role (if provided)
    const payload: any = { userID, type: "access" };
    if (role) {
        payload.role = role;
    }
    
    const accessToken = await new SignJWT(payload)
        .setProtectedHeader({alg:"HS256"})
        .setExpirationTime(ACCESS_TOKEN_EXPIRATION)
        .sign(new TextEncoder().encode(JWT_SECRET()));

    const refreshToken = await new SignJWT({ userID, type: "refresh" })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime(REFRESH_TOKEN_EXPIRATION)
        .sign(new TextEncoder().encode(REFRESH_SECRET()));

    // Log expiration details
    const accessPayload = JSON.parse(atob(accessToken.split('.')[1]));
    const refreshPayload = JSON.parse(atob(refreshToken.split('.')[1]));
    
    console.log('Access Token Expiration:', new Date(accessPayload.exp * 1000).toString());
    console.log('Refresh Token Expiration:', new Date(refreshPayload.exp * 1000).toString());
    console.log('Access Token Payload:', accessPayload);

    return { accessToken, refreshToken };
}

export async function verifyAccessToken(token:string):Promise<TokenPayload>{
    try{
        const {payload}=await jwtVerify(token,new TextEncoder().encode(JWT_SECRET()));
        return {
            userID: payload.userID as string,
            type: payload.type as "access" | "refresh",
            exp: payload.exp as number,
            role: payload.role as string | undefined
        };
    }catch(error){
        throw new Error("Invalid or expired access token")
    }
}

export async function verifyRefreshToken(token:string):Promise<TokenPayload>{
    try{
        const {payload}=await jwtVerify(token,new TextEncoder().encode(REFRESH_SECRET()));
        return {userID: payload.userID as string,
            type: payload.type as "access" | "refresh",
            exp: payload.exp as number};
    }catch(error){
        throw new Error("Invalid or expired refresh token")
    }
}
    





