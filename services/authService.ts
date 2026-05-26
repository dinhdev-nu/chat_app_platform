import { API_ENDPOINTS } from "@/constants/config";
import type { ApiEnvelope } from "@/types/api";
import type { LoginResponse, SendOtpResponse, VerifyOtpRequest } from "@/types/auth";
import { http, normalizeApiError, unwrapApiData } from "./http";

export function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export const authService = {
  async sendOtp(email: string) {
    try {
      const response = await http.post<ApiEnvelope<SendOtpResponse>>(API_ENDPOINTS.auth.sendOtp, {
        email: normalizeEmail(email),
      });

      return unwrapApiData(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async verifyOtp(payload: VerifyOtpRequest) {
    try {
      const response = await http.post<ApiEnvelope<LoginResponse>>(API_ENDPOINTS.auth.verifyOtp, {
        ...payload,
        email: normalizeEmail(payload.email),
      });

      return unwrapApiData(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async logout() {
    try {
      await http.post(API_ENDPOINTS.auth.logout);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
};
