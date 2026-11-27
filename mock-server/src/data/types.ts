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
  expires_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: 'Bearer';
  expires_in: number;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}
