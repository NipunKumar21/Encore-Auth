import { api, APIError } from "encore.dev/api";
import { db } from "./db";
import { generateTokens } from "./jwt";
import { AuthTokens } from "./types";
import { getAuthData } from "~encore/auth";
import * as bcrypt from "bcrypt";
import nodemailer from "nodemailer";
import crypto from "crypto";

interface LoginParams {
  email: string;
  password: string;
}

interface Enable2FAParams {
  email: string;
  password:string;
}

interface Disable2FAParams{
  email:string;
}

interface VerifyOTPParams {
  email: string;
  otp: string;
  purpose: 'verification' | 'login';
}

interface LoginResponse {
  requires2FA: boolean;
  tokens?: AuthTokens;
}


// Helper function to generate and store OTP
async function generateAndStoreOTP(userId: string, purpose: 'verification' | 'login'): Promise<string> {

  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 3 * 60 * 1000); // 3 minutes

  console.log(`Generating OTP for user ${userId}: ${otp}`);
  console.log(`OTP will expire at: ${expiresAt.toISOString()}`);

  try {
    // Store the OTP
    const result = await db.queryRow<{ id: string }>`
      INSERT INTO otps (user_id, otp, purpose, expires_at)
      VALUES (${userId}, ${otp}, ${purpose}, ${expiresAt})
      RETURNING id
    `;
    
    if (!result) {
      throw new Error('Failed to insert OTP');
    }

    console.log('Successfully stored OTP in database with ID:', result.id);

    // Wait a small amount of time to ensure the transaction is committed
    await new Promise(resolve => setTimeout(resolve, 100));

    // Verify the OTP was stored correctly
    const storedOTP = await db.queryRow<{ id: string; otp: string; expires_at: Date }>`
      SELECT id, otp, expires_at 
      FROM otps 
      WHERE id = ${result.id}
    `;

    console.log('Verified stored OTP:', storedOTP);

    if (!storedOTP) {
      console.error('Failed to verify OTP storage');
      throw new Error('Failed to store OTP');
    }

    return otp;
  } catch (error) {
    console.error('Error storing OTP:', error);
    throw error;
  }
}

// Helper function to send OTP via email
async function sendOTP(email: string, otp: string) {
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
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP code is ${otp}. It is valid for 3 minutes.`,
  });
}

async function cleanupExpiredOTPs() {
  try {
    await db.queryRow`
      DELETE FROM otps 
      WHERE (used = false AND expires_at < NOW())
      OR (used = true AND expires_at < NOW() - INTERVAL '1 day')
    `;
    console.log('Cleaned up expired and old used OTPs');
  } catch (error) {
    console.error('Error cleaning up expired OTPs:', error);
  }
}

// Helper function to verify OTP
async function verifyOTP(userId: string, otp: string, purpose: 'verification' | 'login'): Promise<boolean> {

  await cleanupExpiredOTPs(); 
  console.log(`Verifying OTP for user ${userId}: ${otp}, purpose: ${purpose}`);

  const result = await db.queryRow<{ id: string }>`
    SELECT id FROM otps 
    WHERE user_id = ${userId} 
    AND otp = ${otp}
    AND purpose = ${purpose}
    AND used = false
    AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1
  `;

  console.log('OTP verification result:', result);

  if (result) {
    await db.query`
      UPDATE otps SET used = true WHERE id = ${result.id}
    `;
    return true;
  }
  return false;
}

// Enable 2FA endpoint
export const enable2FA = api(
  { method: "POST", path: "/auth/enable-2fa" },
  async (params: Enable2FAParams): Promise<void> => {
    const user = await db.queryRow<{ id: string ,password_hash:string}>`
      SELECT id,password_hash FROM users WHERE email = ${params.email}
    `;

    if (!user) {
      throw APIError.invalidArgument("User not found");
    }
    const validPassword = await bcrypt.compare(params.password, user.password_hash);
    if (!validPassword) {
      throw APIError.invalidArgument("Invalid credentials");
    }

    // Generate and send OTP for verification
    const otp = await generateAndStoreOTP(user.id, 'verification');
    console.log(`Generated verification OTP for user ${user.id}: ${otp}`);
    
    await sendOTP(params.email, otp);
    console.log(`Sent verification OTP to ${params.email}`);

    // Note: We no longer enable 2FA here, we wait for verification
  }
);

// Verify 2FA setup endpoint
export const verify2FASetup = api(
  { method: "POST", path: "/auth/verify-2fa-setup" },
  async (params: { email: string; otp: string }): Promise<void> => {
    console.log(`Verifying 2FA setup for email: ${params.email}`);
    
    const user = await db.queryRow<{ id: string }>`
      SELECT id FROM users WHERE email = ${params.email}
    `;

    if (!user) {
      throw APIError.invalidArgument("User not found");
    }

    console.log(`Found user with ID: ${user.id}`);

    // First, let's check if there's a valid OTP in the database
    const otpRecord = await db.queryRow<{ id: string; otp: string; expires_at: Date }>`
      SELECT id, otp, expires_at 
      FROM otps 
      WHERE user_id = ${user.id} 
      AND purpose = 'verification'
      AND used = false
      AND expires_at > NOW()
      ORDER BY created_at DESC
      LIMIT 1
    `;

    console.log('OTP record:', otpRecord);

    if (!otpRecord) {
      throw APIError.invalidArgument("No valid OTP found. Please request a new OTP.");
    }

    if (otpRecord.otp !== params.otp) {
      throw APIError.invalidArgument("Invalid OTP");
    }

    // Mark OTP as used
    await db.query`
      UPDATE otps SET used = true WHERE id = ${otpRecord.id}
    `;

    // Check current 2FA status before update
    const beforeStatus = await db.queryRow<{ two_factor_enabled: boolean }>`
      SELECT two_factor_enabled FROM users WHERE id = ${user.id}
    `;
    console.log('2FA status before update:', beforeStatus);

    // Enable 2FA for the user
    const updateResult = await db.queryRow<{ two_factor_enabled: boolean }>`
      UPDATE users 
      SET two_factor_enabled = true
      WHERE id = ${user.id}
      RETURNING two_factor_enabled
    `;

    console.log('Update result:', updateResult);

    // Verify the update
    const afterStatus = await db.queryRow<{ two_factor_enabled: boolean }>`
      SELECT two_factor_enabled FROM users WHERE id = ${user.id}
    `;
    console.log('2FA status after update:', afterStatus);

    if (!afterStatus?.two_factor_enabled) {
      console.error('Failed to enable 2FA - database update did not take effect');
      throw APIError.internal('Failed to enable 2FA');
    }

    console.log(`Successfully enabled 2FA for user ${user.id}`);
  }
);

// Modified login endpoint to handle 2FA
export const loginWith2FA = api(
  { method: "POST", path: "/auth/login-2fa" },
  async (params: LoginParams): Promise<LoginResponse> => {
    console.log(`Attempting login for email: ${params.email}`);

    const user = await db.queryRow<{
      id: string;
      password_hash: string;
      email_verified: boolean;
      two_factor_enabled: boolean;
      role: string;
    }>`
      SELECT id, password_hash, email_verified, two_factor_enabled, role
      FROM users 
      WHERE email = ${params.email}
    `;

    if (!user) {
      throw APIError.invalidArgument("Invalid credentials");
    }

    console.log('User found:', {
      id: user.id,
      email_verified: user.email_verified,
      two_factor_enabled: user.two_factor_enabled,
      role: user.role
    });

    if (!user.email_verified) {
      throw APIError.invalidArgument("Email not verified. Please verify your email before logging in");
    }

    const validPassword = await bcrypt.compare(params.password, user.password_hash);
    if (!validPassword) {
      throw APIError.invalidArgument("Invalid credentials");
    }

    if (user.two_factor_enabled) {
      console.log('2FA is enabled, generating OTP');
      // Generate and send OTP for 2FA
      const otp = await generateAndStoreOTP(user.id, 'login');
      await sendOTP(params.email, otp);
      return { requires2FA: true };
    } else {
      console.log('2FA is not enabled, proceeding with normal login');
      // If 2FA is not enabled, proceed with normal login
      const tokens = await generateTokens(user.id, user.role);
      await db.exec`
        INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
        VALUES (${user.id}, ${tokens.refreshToken}, NOW() + INTERVAL '7 days')
      `;
      return { requires2FA: false, tokens };
    }
  }
);

// Verify 2FA OTP endpoint
export const verify2FAOTP = api(
  { method: "POST", path: "/auth/verify-2fa-otp" },
  async (params: VerifyOTPParams): Promise<AuthTokens> => {
    const user = await db.queryRow<{ id: string; role: string }>`
      SELECT id, role FROM users WHERE email = ${params.email}
    `;

    if (!user) {
      throw APIError.invalidArgument("User not found");
    }

    const isValid = await verifyOTP(user.id, params.otp, params.purpose);
    if (!isValid) {
      throw APIError.invalidArgument("Invalid or expired OTP");
    }

    // Generate tokens after successful 2FA verification
    const tokens = await generateTokens(user.id, user.role);
    await db.exec`
      INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
      VALUES (${user.id}, ${tokens.refreshToken}, NOW() + INTERVAL '7 days')
    `;

    return tokens;
  }
);

// Check 2FA status endpoint
export const check2FAStatus = api(
  { method: "GET", path: "/auth/2fa-status" },
  async (params: { email: string }): Promise<{ enabled: boolean }> => {
    console.log(`Checking 2FA status for email: ${params.email}`);
    
    const user = await db.queryRow<{ two_factor_enabled: boolean }>`
      SELECT two_factor_enabled 
      FROM users 
      WHERE email = ${params.email}
    `;

    if (!user) {
      throw APIError.invalidArgument("User not found");
    }

    console.log('2FA status:', user.two_factor_enabled);
    return { enabled: user.two_factor_enabled };
  }
);

//endpoint to disable 2fa 
export const disable2FA = api(
  { method: "POST", path: "/auth/disable-2fa" },
  async (params: Disable2FAParams): Promise<void> => {
    const user = await db.queryRow<{ id: string }>`
      SELECT id FROM users WHERE email = ${params.email}
    `;
    
    if (!user) {
      throw APIError.invalidArgument("User not found");
    }

    console.log("User ID:", user.id);

    try {
      const updateResult = await db.queryRow<{ two_factor_enabled: boolean }>`
        UPDATE users SET two_factor_enabled = false WHERE id = ${user.id}
      `;
      
      if (!updateResult) {
        throw new Error("No rows affected. User may not exist or 2FA was already disabled.");
      }

      console.log('2FA disabled successfully');
    } catch (error) {
      console.error("Error disabling 2FA:", error);
      throw APIError.internal("Failed to disable 2FA");
    }
  }
);