export interface ApiErrorBody {
  code: string;
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

  constructor(message: string, options?: { code?: string; status?: number }) {
    super(message);
    this.name = "ApiClientError";
    this.code = options?.code;
    this.status = options?.status;
  }
}
