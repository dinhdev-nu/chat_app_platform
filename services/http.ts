import axios from "axios";
import type { AxiosError } from "axios";

import { getApiErrorMessageByCode } from "@/constants/api-errors";
import { API_BASE_URL } from "@/constants/config";
import { ApiClientError } from "@/types/api";
import type { ApiErrorEnvelope, ApiEnvelope, ApiPaginatedEnvelope, PaginatedResult } from "@/types/api";

let accessTokenProvider: () => string | null | undefined = () => null;

export function setAccessTokenProvider(provider: () => string | null | undefined) {
  accessTokenProvider = provider;
}

export const http = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 20000,
});

http.interceptors.request.use((config) => {
  const accessToken = accessTokenProvider();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

export function unwrapApiData<T>(body: ApiEnvelope<T>): T {
  return body.data;
}

export function unwrapPaginatedApiData<T>(body: ApiPaginatedEnvelope<T>): PaginatedResult<T> {
  return {
    data: body.data,
    pagination: body.meta.pagination,
  };
}

export function normalizeApiError(error: unknown): ApiClientError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorEnvelope>;
    const responseError = axiosError.response?.data?.error;

    if (responseError?.code || responseError?.message) {
      return new ApiClientError(getApiErrorMessageByCode(responseError.code) ?? responseError.message, {
        code: responseError.code,
        status: axiosError.response?.status,
        serverMessage: responseError.message,
      });
    }

    if (axiosError.response?.status) {
      return new ApiClientError(axiosError.response.statusText || "Request failed", {
        status: axiosError.response.status,
      });
    }

    return new ApiClientError(axiosError.message || "Network error");
  }

  if (error instanceof ApiClientError) return error;
  if (error instanceof Error) return new ApiClientError(error.message);

  return new ApiClientError("Unknown error");
}

export function getApiErrorMessage(error: unknown) {
  return normalizeApiError(error).message;
}
