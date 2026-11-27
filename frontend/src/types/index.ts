export type Role = 'admin' | 'member';
export type Status = 'active' | 'deactivated';

export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: Role;
  status: Status;
  created_at: string;
}

export interface Invitation {
  id: string;
  email: string;
  role: Role;
  token: string;
  expires_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number;
}

export interface SignInResponse extends TokenResponse {
  user: User;
}

export interface AcceptInvitationResponse extends TokenResponse {
  user: User;
}

export interface PaginatedResponse<T> {
  items: T[];
  page: number;
  page_size: number;
  total: number;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}

export interface AccessTokenClaims {
  sub: string;
  role: Role;
  exp: number;
  iat: number;
}

export interface SignInRequest {
  email: string;
  password: string;
}

export interface RefreshRequest {
  refresh_token: string;
}

export interface SignOutRequest {
  refresh_token: string;
}

export interface UpdateProfileRequest {
  first_name?: string;
  last_name?: string;
}

export interface ChangePasswordRequest {
  current_password: string;
  new_password: string;
}

export interface UpdateUserRequest {
  first_name?: string;
  last_name?: string;
  role?: Role;
}

export interface InviteUserRequest {
  email: string;
  role: Role;
}

export interface AcceptInvitationRequest {
  token: string;
  first_name: string;
  last_name: string;
  password: string;
}

export interface InvitationLookupResponse {
  email: string;
  role: Role;
}

export interface UserListParams {
  page?: number;
  page_size?: number;
  search?: string;
  sort?: 'name' | 'email' | 'created_at';
  order?: 'asc' | 'desc';
  status?: Status;
}
