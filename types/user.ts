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
