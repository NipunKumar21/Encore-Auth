import { api, APIError } from "encore.dev/api";
import { getAuthData } from "~encore/auth";
import { AuthData } from "./types";
import { db } from "../db";
import * as bcrypt from "bcrypt";

// User interface
interface User {
  id: string;
  email: string;
  role: string;
  twoFactorEnabled: boolean;
  joinedDate: string;
}

// Response interface for getUsers endpoint
interface UsersResponse {
  users: User[];
}

// Extended AuthData interface to include role
interface ExtendedAuthData {
  id: string;
  email: string;
  role: string;
}

// Helper function to check admin access
const checkAdminAccess = (authData: AuthData): ExtendedAuthData => {
  if (!authData.role || authData.role !== 'admin') {
    throw APIError.permissionDenied('Only admins can access user management');
  }
  
  // Create a properly typed ExtendedAuthData object
  const extendedAuthData: ExtendedAuthData = {
    id: authData.userID,
    email: '', // We'll get this from the database if needed
    role: authData.role
  };
  
  return extendedAuthData;
};

// Get all users endpoint
export const getUsers = api(
  { method: "GET", path: "/users" },
  async (): Promise<UsersResponse> => {
    // Check if the user is an admin
    const authData = getAuthData();
    if (!authData) {
      throw APIError.unauthenticated("Not authenticated");
    }
    checkAdminAccess(authData);

    try {
      // Fetch all users from the database
      const result = await db.query<User>`
        SELECT 
          id, 
          email, 
          role,
          two_factor_enabled as "twoFactorEnabled", 
          created_at as "joinedDate"
        FROM users
        ORDER BY created_at DESC
      `;
      
      // Convert the result to an array
      const users: User[] = [];
      for await (const user of result) {
        users.push(user);
      }

      return { users };
    } catch (error) {
      console.error("Error fetching users:", error);
      throw APIError.internal("Failed to fetch users");
    }
  }
);

// Create user endpoint
export const createUser = api(
  { method: "POST", path: "/users" },
  async (params: { email: string; password: string; role: string }): Promise<void> => {
    // Check if the user is an admin
    const authData = getAuthData();
    if (!authData) {
      throw APIError.unauthenticated("Not authenticated");
    }
    checkAdminAccess(authData);

    try {
      // Check if the email already exists
      const existingUser = await db.queryRow<{ id: string }>`
        SELECT id FROM users WHERE email = ${params.email}
      `;

      if (existingUser) {
        throw APIError.invalidArgument("Email already exists");
      }

      // Hash the password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(params.password, salt);

      // Insert the new user
      await db.exec`
        INSERT INTO users (email, password_hash, role, email_verified, two_factor_enabled)
        VALUES (${params.email}, ${hashedPassword}, ${params.role}, true, false)
      `;

      console.log(`User created: ${params.email}`);
    } catch (error) {
      console.error("Error creating user:", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw APIError.internal("Failed to create user");
    }
  }
);

// Update user endpoint
export const updateUser = api(
  { method: "PUT", path: "/users/:id" },
  async (params: { id: string; email: string; role: string }): Promise<void> => {
    // Check if the user is an admin
    const authData = getAuthData();
    if (!authData) {
      throw APIError.unauthenticated("Not authenticated");
    }
    checkAdminAccess(authData);

    try {
      // Check if the user exists
      const existingUser = await db.queryRow<{ id: string }>`
        SELECT id FROM users WHERE id = ${params.id}
      `;

      if (!existingUser) {
        throw APIError.notFound("User not found");
      }

      // Check if the email is already taken by another user
      const emailExists = await db.queryRow<{ id: string }>`
        SELECT id FROM users WHERE email = ${params.email} AND id != ${params.id}
      `;

      if (emailExists) {
        throw APIError.invalidArgument("Email already exists");
      }

      // Update the user
      await db.exec`
        UPDATE users 
        SET email = ${params.email}, role = ${params.role}
        WHERE id = ${params.id}
      `;

      console.log(`User updated: ${params.email}`);
    } catch (error) {
      console.error("Error updating user:", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw APIError.internal("Failed to update user");
    }
  }
);

// Delete user endpoint
export const deleteUser = api(
  { method: "DELETE", path: "/users/:id" },
  async (params: { id: string }): Promise<void> => {
    // Check if the user is an admin
    const authData = getAuthData();
    if (!authData) {
      throw APIError.unauthenticated("Not authenticated");
    }
    checkAdminAccess(authData);

    try {
      // Check if the user exists
      const existingUser = await db.queryRow<{ id: string }>`
        SELECT id FROM users WHERE id = ${params.id}
      `;

      if (!existingUser) {
        throw APIError.notFound("User not found");
      }

      // Delete the user
      await db.exec`
        DELETE FROM users WHERE id = ${params.id}
      `;

      console.log(`User deleted: ${params.id}`);
    } catch (error) {
      console.error("Error deleting user:", error);
      if (error instanceof APIError) {
        throw error;
      }
      throw APIError.internal("Failed to delete user");
    }
  }
); 