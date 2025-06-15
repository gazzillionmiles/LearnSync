
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { users } from '../../shared/schema';
import { db } from '../storage';
import { eq } from 'drizzle-orm';
import type { User, AuthResponse } from '../../shared/types';
import type { RegisterInput, LoginInput } from '../../shared/schema';

export class AuthService {
  private static JWT_SECRET = process.env.JWT_SECRET;
  private static JWT_EXPIRES_IN = '7d';

  static async hashPassword(password: string): Promise<string> {
    const saltRounds = 12;
    return bcrypt.hash(password, saltRounds);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateToken(userId: number): string {
    if (!this.JWT_SECRET) {
      throw new Error('JWT_SECRET environment variable is not set');
    }
    
    return jwt.sign(
      { userId },
      this.JWT_SECRET,
      { expiresIn: this.JWT_EXPIRES_IN }
    );
  }

  static async register(data: RegisterInput): Promise<AuthResponse> {
    try {
      // Check if user already exists
      const existingUser = await db
        .select()
        .from(users)
        .where(eq(users.email, data.email))
        .limit(1);

      if (existingUser.length > 0) {
        throw new Error('User with this email already exists');
      }

      // Check if username is taken
      const existingUsername = await db
        .select()
        .from(users)
        .where(eq(users.username, data.username))
        .limit(1);

      if (existingUsername.length > 0) {
        throw new Error('Username is already taken');
      }

      // Hash password
      const hashedPassword = await this.hashPassword(data.password);

      // Create user
      const newUser = await db
        .insert(users)
        .values({
          email: data.email,
          password: hashedPassword,
          username: data.username,
          isVerified: true, // Auto-verify for now
        })
        .returning();

      const user = newUser[0];
      const token = this.generateToken(user.id);

      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          isVerified: user.isVerified || false,
          createdAt: user.createdAt || new Date(),
          updatedAt: user.updatedAt || new Date(),
        },
        token,
      };
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  static async login(data: LoginInput): Promise<AuthResponse> {
    try {
      // Find user by email
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.email, data.email))
        .limit(1);

      if (userResult.length === 0) {
        throw new Error('Invalid email or password');
      }

      const user = userResult[0];

      // Check password
      const isPasswordValid = await this.comparePassword(data.password, user.password);
      
      if (!isPasswordValid) {
        throw new Error('Invalid email or password');
      }

      const token = this.generateToken(user.id);

      return {
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          isVerified: user.isVerified || false,
          createdAt: user.createdAt || new Date(),
          updatedAt: user.updatedAt || new Date(),
        },
        token,
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  static async getUserById(id: number): Promise<User | null> {
    try {
      const userResult = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      if (userResult.length === 0) {
        return null;
      }

      const user = userResult[0];
      return {
        id: user.id,
        email: user.email,
        username: user.username,
        isVerified: user.isVerified || false,
        createdAt: user.createdAt || new Date(),
        updatedAt: user.updatedAt || new Date(),
      };
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }
}
