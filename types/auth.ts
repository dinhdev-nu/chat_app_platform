import type { AuthUser } from "./user";

export interface SendOtpRequest {
  email: string;
}

export interface SendOtpResponse {
  message: string;
  email: string;
  expiresIn: number;
}

export interface VerifyOtpRequest {
  email: string;
  otp: string;
  deviceId: string;
  deviceName?: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresAt: string;
  user: AuthUser;
}
