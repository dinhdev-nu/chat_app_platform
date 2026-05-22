import { API_ENDPOINTS } from "@/constants/config";
import type { ApiEnvelope, ApiPaginatedEnvelope } from "@/types/api";
import type {
  AuthUser,
  ContactRequestStatusResponse,
  ContactUserResponse,
  CursorPaginationParams,
  SearchUser,
  SearchUsersParams,
  UpdateUserRequest,
} from "@/types/user";
import { http, normalizeApiError, unwrapApiData, unwrapPaginatedApiData } from "./http";

function toOptionalTrimmedString(value?: string) {
  const trimmedValue = value?.trim();

  return trimmedValue ? trimmedValue : undefined;
}

function toCursorParams({ cursor, limit = 20 }: CursorPaginationParams = {}) {
  return {
    limit,
    ...(cursor ? { cursor } : {}),
  };
}

function toSearchParams({ q = "", cursor, limit = 20 }: SearchUsersParams = {}) {
  return {
    q: q.trim(),
    ...toCursorParams({ cursor, limit }),
  };
}

export const userService = {
  async getCurrentUser() {
    try {
      const response = await http.get<ApiEnvelope<AuthUser>>(API_ENDPOINTS.user.current);

      return unwrapApiData(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async updateCurrentUser(payload: UpdateUserRequest) {
    try {
      const response = await http.put<ApiEnvelope<AuthUser>>(API_ENDPOINTS.user.current, {
        name: toOptionalTrimmedString(payload.name),
        avatarUrl: toOptionalTrimmedString(payload.avatarUrl),
        bio: toOptionalTrimmedString(payload.bio),
      });

      return unwrapApiData(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async searchUsers(params: SearchUsersParams = {}) {
    try {
      const response = await http.get<ApiPaginatedEnvelope<SearchUser>>(API_ENDPOINTS.user.search, {
        params: toSearchParams(params),
      });

      return unwrapPaginatedApiData(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async sendContactRequest(targetUserId: string) {
    try {
      const response = await http.post<ApiEnvelope<ContactRequestStatusResponse>>(
        API_ENDPOINTS.contacts.requests,
        { targetUserId },
      );

      return unwrapApiData(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async getIncomingContactRequests(params: CursorPaginationParams = {}) {
    try {
      const response = await http.get<ApiPaginatedEnvelope<SearchUser>>(
        API_ENDPOINTS.contacts.incomingRequests,
        { params: toCursorParams(params) },
      );

      return unwrapPaginatedApiData(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async acceptContactRequest(senderUserId: string) {
    try {
      await http.put(API_ENDPOINTS.contacts.acceptRequest, { senderUserId });
    } catch (error) {
      throw normalizeApiError(error);
    }
  },

  async getContacts(params: CursorPaginationParams = {}) {
    try {
      const response = await http.get<ApiPaginatedEnvelope<ContactUserResponse>>(
        API_ENDPOINTS.contacts.list,
        { params: toCursorParams(params) },
      );

      return unwrapPaginatedApiData(response.data);
    } catch (error) {
      throw normalizeApiError(error);
    }
  },
};
