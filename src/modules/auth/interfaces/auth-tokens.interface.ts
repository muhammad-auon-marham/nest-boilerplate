import { AuthenticatedUser } from '@common/interfaces';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: AuthenticatedUser;
}
