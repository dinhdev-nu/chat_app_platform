import { API_ENDPOINTS } from "@/constants/config";
import type { ApiEnvelope } from "@/types/api";
import type { AuthUser, UpdateUserRequest } from "@/types/user";
import { http, normalizeApiError, unwrapApiData } from "./http";

function toNullableString(value?: string) {
  const trimmedValue = value?.trim();

  return trimmedValue ? trimmedValue : undefined;
}

export const userService = {
  async updateCurrentUser(payload: UpdateUserRequest) {
    try {
      const response = await http.patch<ApiEnvelope<AuthUser>>(API_ENDPOINTS.user.current, {
        name: toNullableString(payload.name),
        avatarUrl: toNullableString(payload.avatarUrl),
        bio: toNullableString(payload.bio),
      });

      return unwrapApiData(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
};
