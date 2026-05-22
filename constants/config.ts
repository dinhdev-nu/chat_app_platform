export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1";

export const AUTH_STORAGE_KEY = "chat-platform";

export const API_ENDPOINTS = {
  auth: {
    sendOtp: "/auth/send-otp",
    verifyOtp: "/auth/verify-otp",
    logout: "/auth/logout",
  },
  user: {
    current: "/users/me",
    search: "/users/search",
  },
  contacts: {
    list: "/contacts",
    requests: "/contacts/requests",
    incomingRequests: "/contacts/requests/incoming",
    acceptRequest: "/contacts/requests/accept",
  },
} as const;
