import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import Cookies from "js-cookie";

import { AUTH_STORAGE_KEY } from "@/constants/config";
import { authService, normalizeEmail } from "@/services/authService";
import { setAccessTokenProvider } from "@/services/http";
import { userService } from "@/services/userService";
import type { AuthUser, UpdateUserRequest } from "@/types/user";

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  expiresAt: string | null;
  deviceId: string | null;
  otpEmail: string | null;
  otpExpiresAt: string | null;
  error: string | null;
  hasHydrated: boolean;
  isSendingOtp: boolean;
  isVerifyingOtp: boolean;
  isLoggingOut: boolean;
  isUpdatingProfile: boolean;
  sendOtp: (email: string) => Promise<void>;
  verifyOtp: (email: string, otp: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<AuthUser>;
  updateProfile: (payload: UpdateUserRequest) => Promise<AuthUser>;
  clearError: () => void;
  clearSession: () => void;
  ensureDeviceId: () => string;
  setHasHydrated: (hasHydrated: boolean) => void;
}

function createDeviceId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (char) =>
    (Number(char) ^ (Math.random() * 16) >> (Number(char) / 4)).toString(16),
  );
}

function getDeviceName() {
  if (typeof navigator === "undefined") return undefined;

  const platform = navigator.platform || "Web";
  const browser = navigator.userAgent.match(/(Chrome|Firefox|Safari|Edg|OPR)\/[\d.]+/)?.[0];

  return browser ? `${platform} (${browser})` : platform;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      expiresAt: null,
      deviceId: null,
      otpEmail: null,
      otpExpiresAt: null,
      error: null,
      hasHydrated: false,
      isSendingOtp: false,
      isVerifyingOtp: false,
      isLoggingOut: false,
      isUpdatingProfile: false,

      ensureDeviceId: () => {
        const currentDeviceId = get().deviceId;
        if (currentDeviceId) return currentDeviceId;

        const deviceId = createDeviceId();
        set({ deviceId });

        return deviceId;
      },

      clearError: () => set({ error: null }),

      setHasHydrated: (hasHydrated) => set({ hasHydrated }),

      clearSession: () => {
        const deviceId = get().deviceId;
        
        set({
          user: null,
          accessToken: null,
          expiresAt: null,
          otpEmail: null,
          otpExpiresAt: null,
          error: null,
          deviceId,
        });
      },

      sendOtp: async (email) => {
        const normalizedEmail = normalizeEmail(email);

        set({ isSendingOtp: true, error: null });

        try {
          const result = await authService.sendOtp(normalizedEmail);

          set({
            otpEmail: normalizedEmail,
            otpExpiresAt: new Date(Date.now() + result.expiresIn * 1000).toISOString(),
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : "Không thể gửi mã OTP";
          set({ error: message });
          throw error;
        } finally {
          set({ isSendingOtp: false });
        }
      },

      verifyOtp: async (email, otp) => {
        const normalizedEmail = normalizeEmail(email);
        const deviceId = get().ensureDeviceId();

        set({ isVerifyingOtp: true, error: null });

        try {
          const result = await authService.verifyOtp({
            email: normalizedEmail,
            otp,
            deviceId,
            deviceName: getDeviceName(),
          });
          
          set({
            user: result.user,
            accessToken: result.accessToken,
            expiresAt: result.expiresAt,
            otpEmail: null,
            otpExpiresAt: null,
          });

          return result.user;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Không thể xác thực OTP";
          set({ error: message });
          throw error;
        } finally {
          set({ isVerifyingOtp: false });
        }
      },

      logout: async () => {
        const hasAccessToken = Boolean(get().accessToken);

        set({ isLoggingOut: true, error: null });

        try {
          if (hasAccessToken) {
            await authService.logout();
          }
        } catch (error) {
          const message = error instanceof Error ? error.message : "Không thể đăng xuất";
          set({ error: message });
        } finally {
          get().clearSession();
          set({ isLoggingOut: false });
        }
      },

      refreshProfile: async () => {
        set({ error: null });

        try {
          const currentUser = await userService.getCurrentUser();

          set({ user: currentUser });

          return currentUser;
        } catch (error) {
          const message = error instanceof Error ? error.message : "KhÃ´ng thá»ƒ táº£i há»“ sÆ¡";
          set({ error: message });
          throw error;
        }
      },

      updateProfile: async (payload) => {
        set({ isUpdatingProfile: true, error: null });

        try {
          const updatedUser = await userService.updateCurrentUser(payload);

          set({ user: updatedUser });

          return updatedUser;
        } catch (error) {
          const message = error instanceof Error ? error.message : "Không thể cập nhật hồ sơ";
          set({ error: message });
          throw error;
        } finally {
          set({ isUpdatingProfile: false });
        }
      },
    }),
    {
      name: AUTH_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
        expiresAt: state.expiresAt,
        deviceId: state.deviceId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);

setAccessTokenProvider(() => useAuthStore.getState().accessToken);

// Tự động đồng bộ accessToken vào cookie "token" mỗi khi Zustand thay đổi
useAuthStore.subscribe((state) => {
  if (state.accessToken) {
    Cookies.set("token", state.accessToken, { expires: 30, path: "/", sameSite: "Lax" });
  } else {
    Cookies.remove("token", { path: "/" });
  }
});
