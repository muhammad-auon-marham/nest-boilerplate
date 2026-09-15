import { Role, Status } from '@common/enums';
import { StringUtil } from '@common/utils';
import { User } from '@modules/users/entities/user.entity';

/**
 * Builds an unsaved User with sensible defaults. `password` must already be hashed before saving.
 */
export class UserFactory {
  static build(overrides: Partial<User> = {}): Partial<User> {
    const suffix = StringUtil.generateAccessToken(8);

    return {
      name: `Test User ${suffix}`,
      email: `user-${suffix}@example.com`,
      role: Role.USER,
      status: Status.ACTIVE,
      ...overrides,
    };
  }
}
