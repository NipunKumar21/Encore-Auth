import { api, APIError } from "encore.dev/api";
import { db } from "./db";
import { generateTokens, verifyRefreshToken } from "./jwt";
import { AuthTokens, RefreshParams } from "./types";
import { getAuthData } from "~encore/auth";
import * as bcrypt from "bcrypt";
import { throws } from "assert";
import nodemailer from "nodemailer";
import crypto from "crypto";
import { loginWith2FA } from "./2fa";

// In-memory store for OTPs
const otpStore: Map<string, { otp: string; expiresAt: Date }> = new Map();

interface RegisterParams {
  email: string;
  password: string;
}

interface LoginParams {
  email: string;
  password: string;
}

interface UserData {
  email: string;
}

//generate and send otp
const sendOTP = async (params: {email:string}) => {
  // Generate OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // OTP valid for 15 minutes

  // Store OTP in the in-memory store
  otpStore.set(params.email, { otp, expiresAt: otpExpiry });

  // Send OTP via email
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      //user: "ressie.satterfield32@ethereal.email",
      //pass: "fe873T1gMESqTWCWA9",
      user: "2nipunkumar1623400iit@gmail.com",
      pass: "rwwu jexa emry tobk",
    },
  });
  console.log("created");
  await transporter.sendMail({
    from: '"Your App" <2nipunkumar1623400iit@gmail.com>',
    to: params.email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It is valid for 15 minutes.`,
  });
};

//Registration endpoint
export const register = api(
  { method: "POST", path: "/auth/register" },
  async (params: RegisterParams): Promise<AuthTokens> => {
    if (!params.email || !params.email.includes("@")) {
      throw APIError.invalidArgument("Invalid email");
    }
    if (!params.password || params.password.length < 8) {
      throw APIError.invalidArgument(
        "Password must be at least 8 characters long"
      );
    }

    try {
      const existingUser = await db.queryRow<{ id: string }>`
        SELECT id FROM users WHERE LOWER(email) = LOWER(${params.email})`;
      if (existingUser) {
        throw APIError.invalidArgument("User already registered");
      }

      const saltRounds = 10;
      const password_hash = await bcrypt.hash(params.password, saltRounds);

      const user = await db.queryRow<{ id: string }>`
        INSERT INTO users(email, password_hash)
        VALUES(${params.email}, ${password_hash})
        RETURNING id`;

      if (!user) {
        throw APIError.internal("Failed to create user");
      }

      //await sendOTP(params);
      return { accessToken: "", refreshToken: "" }; // Return tokens as needed
    } catch (error) {
      console.error("Registration error:", error);
      if (error instanceof APIError) {
        throw error;
      }
      // Type assertion to handle unknown error
      throw APIError.internal(
        "Failed to register user: " + (error as Error).message
      );
    }
  }
);

//send otp endpoint
export const sendOtp = api(
  { method: "POST", path: "/auth/send-otp" },
  async (params: {email:string}): Promise<void> => {
    try {
      await sendOTP({email:params.email});
    } catch (error) {
      throw APIError.internal("Failed to send OTP:" + (error as Error).message);
    }
  }
);

// Login endpoint
export const login = api(
  { method: "POST", path: "/auth/login" },
  async (params: LoginParams): Promise<AuthTokens> => {
    // Verify credentials (example implementation)
    const user = await db.queryRow<{
      id: string;
      password_hash: string;
      email_verified: boolean;
    }>`
            SELECT id, password_hash,email_verified FROM users WHERE email = ${params.email}
        `;

    if (!user) {
      throw APIError.invalidArgument("Invalid credentials");
    }

    if (!user.email_verified) {
      throw APIError.invalidArgument(
        "Email not verified . please verify your email before logging in "
      );
    }

    // Verify password
    const validPassword = await bcrypt.compare(
      params.password,
      user.password_hash
    );
    if (!validPassword) {
      throw APIError.invalidArgument("Invalid credentials");
    }

    // Generate tokens
    const tokens = await generateTokens(user.id);

    // Store refresh token hash in database
    await db.exec`
            INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
            VALUES (${user.id}, ${tokens.refreshToken}, NOW() + INTERVAL '7 days')
        `;

    return tokens;
  }
);

// Refresh token endpoint
export const refresh = api(
  { method: "POST", path: "/auth/refresh" },
  async (params: RefreshParams): Promise<AuthTokens> => {
    try {
      const payload = await verifyRefreshToken(params.refreshToken);

      if (payload.type !== "refresh") {
        throw APIError.invalidArgument("Invalid token type");
      }

      // Verify refresh token exists in database
      const tokenExists = await db.queryRow`
                SELECT 1 FROM refresh_tokens 
                WHERE user_id = ${payload.userID} 
                AND token_hash = ${params.refreshToken}
                AND expires_at > NOW()
            `;

      if (!tokenExists) {
        throw APIError.invalidArgument("Invalid refresh token");
      }

      // Generate new tokens
      const tokens = await generateTokens(payload.userID);

      // Replace old refresh token
      await db.exec`
                UPDATE refresh_tokens 
                SET token_hash = ${tokens.refreshToken},
                    expires_at = NOW() + INTERVAL '7 days'
                WHERE user_id = ${payload.userID}
                AND token_hash = ${params.refreshToken}
            `;

      return tokens;
    } catch (err) {
      throw APIError.invalidArgument("Invalid or expired refresh token");
    }
  }
);

// OTP verification endpoint
export const verifyOtp = api(
  { method: "POST", path: "/auth/verify-otp" },
  async (params: { email: string; otp: string }): Promise<void> => {
    const storedOtpData = otpStore.get(params.email);

    if (
      !storedOtpData ||
      storedOtpData.otp !== params.otp ||
      storedOtpData.expiresAt < new Date()
    ) {
      throw APIError.invalidArgument("Invalid or expired OTP");
    }

    // Mark email as verified
    await db.exec`UPDATE users SET email_verified = true WHERE email = ${params.email}`;

    // Remove the OTP from the in-memory store
    otpStore.delete(params.email);
  }
);

const isTokenExpired = (token: string): boolean => {
  if (!token || !token.includes('.')) {
    console.error("Invalid token format:", token);
    return true; // Treat as expired if the format is invalid
  }
  const payload = JSON.parse(atob(token.split('.')[1]));
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
};

// Forgot Password endpoint
export const forgotPassword = api(
  { method: "POST", path: "/auth/forgot-password" },
  async (params: { email: string }): Promise<{ message: string }> => {
    const user = await db.queryRow<{ id: string }>`
      SELECT id FROM users WHERE LOWER(email) = LOWER(${params.email})`;
    if (!user) {
      throw APIError.invalidArgument("User not found");
    }

    // Generate OTP
    const otp = crypto.randomInt(100000, 999999).toString();
    const otpExpiry = new Date(Date.now() + 15 * 60 * 1000); // OTP valid for 15 minutes

    // Store OTP in the in-memory store
    otpStore.set(params.email, { otp, expiresAt: otpExpiry });

    // Send OTP via email
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      auth: {
        user: "2nipunkumar1623400iit@gmail.com",
        pass: "rwwu jexa emry tobk",
      },
    });

    await transporter.sendMail({
      from: '"Your App" <2nipunkumar1623400iit@gmail.com>',
      to: params.email,
      subject: "Password Reset OTP",
      text: `Your OTP for password reset is ${otp}. It is valid for 15 minutes.`,
    });
    return { message: "Password reset OTP sent to your email." }; // Add this line
  }
);

// Reset Password endpoint
export const resetPassword = api(
  { method: "POST", path: "/auth/reset-password" },
  async (params: {
    email: string;
    otp: string;
    oldPassword: string;
    newPassword: string;
  }): Promise<void> => {
    const storedOtpData = otpStore.get(params.email);

    if (
      !storedOtpData ||
      storedOtpData.otp !== params.otp ||
      storedOtpData.expiresAt < new Date()
    ) {
      throw APIError.invalidArgument("Invalid or expired OTP");
    }

    const user = await db.queryRow<{ id: string; password_hash: string }>`
      SELECT id, password_hash FROM users WHERE email = ${params.email}
    `;
    if (!user) {
      throw APIError.invalidArgument("User not found");
    }

    // Verify the old password
    const validOldPassword = await bcrypt.compare(
      params.oldPassword,
      user.password_hash
    );
    if (!validOldPassword) {
      throw APIError.invalidArgument("Old password is incorrect");
    }

    // Check if the new password is the same as the old password
    if (params.oldPassword === params.newPassword) {
      throw APIError.invalidArgument(
        "New password cannot be the same as the old password"
      );
    }

    const saltRounds = 10;
    const newPasswordHash = await bcrypt.hash(params.newPassword, saltRounds);

    await db.exec`
      UPDATE users SET password_hash = ${newPasswordHash} WHERE email = ${params.email}
    `;

    // Remove the OTP from the in-memory store
    otpStore.delete(params.email);
  }
);

// Logout endpoint
export const logout = api(
  { method: "POST", path: "/auth/logout", auth: true },
  async (): Promise<void> => {
    const authData = getAuthData();
    if (!authData) throw APIError.unauthenticated("not authenticated");
    const { userID } = authData;

    // Remove refresh tokens for user
    await db.exec`
              DELETE FROM refresh_tokens WHERE user_id = ${userID}
          `;
  }
);

export const getUserData = api(
  { method: "GET", path: "/auth/user", auth: true },
  async (): Promise<UserData> => {
    const authData = getAuthData();
    if (!authData) throw APIError.unauthenticated("not authenticated");

    //fetch user data from db
    const user = await db.queryRow<UserData>`
    SELECT email FROM users WHERE id=${authData.userID}
    `;
    if (!user) throw APIError.notFound("user not found");
    return user;
  }
);
