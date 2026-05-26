export type ApiErrorCode =
  | "INTERNAL_SERVER_ERROR"
  | "VALIDATION_ERROR"
  | "INVALID_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "BAD_REQUEST"
  | "CONFLICT"
  | "TOO_MANY_REQUESTS"
  | "INVALID_CREDENTIALS"
  | "TOKEN_MISSING"
  | "TOKEN_INVALID"
  | "USER_NOT_FOUND"
  | "CONVERSATION_NOT_FOUND"
  | "INVALID_CURSOR"
  | "NOT_A_MEMBER"
  | "MESSAGE_NOT_FOUND"
  | "MESSAGE_DELETED"
  | "CANNOT_EDIT_MESSAGE"
  | "CANNOT_DELETE_MESSAGE"
  | "INVALID_INPUT"
  | "CANNOT_SEND_CONTACT_REQUEST";

export interface ApiErrorBody {
  code: ApiErrorCode | (string & {});
  message: string;
}

export interface ApiEnvelope<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface PaginationMeta {
  limit: number;
  hasNext: boolean;
  nextCursor?: string;
}

export interface ApiPaginatedEnvelope<T> extends ApiEnvelope<T[]> {
  meta: {
    pagination: PaginationMeta;
  };
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiErrorEnvelope {
  success: false;
  message: string;
  error: ApiErrorBody;
}

export class ApiClientError extends Error {
  code?: string;
  status?: number;
  serverMessage?: string;

  constructor(message: string, options?: { code?: string; status?: number; serverMessage?: string }) {
    super(message);
    this.name = "ApiClientError";
    this.code = options?.code;
    this.status = options?.status;
    this.serverMessage = options?.serverMessage;
  }
}
