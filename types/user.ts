export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  createdAt?: string;
}

export interface UpdateUserRequest {
  name?: string;
  avatarUrl?: string;
  bio?: string;
}

export enum ContactStatus {
  Pending = 1,
  Accepted = 2,
  Blocked = 3,
}

export interface ContactUserResponse {
  id: string;
  username: string;
  avatarUrl?: string | null;
  bio?: string | null;
  lastSeenAt?: string | null;
  isOnline?: boolean | null;
  createdAt?: string;
  outgoingStatus?: ContactStatus | null;
  incomingStatus?: ContactStatus | null;
}

export type SearchUser = ContactUserResponse;

export interface CursorPaginationParams {
  cursor?: string;
  limit?: number;
}

export interface SearchUsersParams extends CursorPaginationParams {
  q?: string;
}

export interface ContactRequestStatusResponse {
  status: "pending" | "accepted";
}
