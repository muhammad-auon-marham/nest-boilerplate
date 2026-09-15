import { Role } from '../enums';

/**
 * Shape of `request.user` after `JwtStrategy` validates a token.
 */
export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}
