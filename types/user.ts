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
  createdAt?: string;
}

export interface SearchUser extends ContactUserResponse {
  outgoingStatus?: ContactStatus;
  incomingStatus?: ContactStatus;
}

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
