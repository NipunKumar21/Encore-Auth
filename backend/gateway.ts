//auth handlers

import { Gateway,APIError } from "encore.dev/api";
import { authHandler, AuthHandler } from "encore.dev/auth";
import {AuthParams,AuthData } from "./types";
import {verifyAccessToken,verifyRefreshToken}from "./jwt"

export const auth=authHandler<AuthParams, AuthData>(async (params)=>{
    try{
        const token =params.authorization.replace("Bearer ","");
        const payload=await verifyAccessToken(token);
        
        if(payload.type!=="access"){
            throw APIError.unauthenticated("Invalid token type");
        }
        return {userID:payload.userID};
    }catch(error){
        throw APIError.unauthenticated("Invalid token type");
    }
});

export const gateway = new Gateway({
    authHandler: auth,
  });