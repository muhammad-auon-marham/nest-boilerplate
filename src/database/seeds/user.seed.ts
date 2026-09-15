import { DataSource } from 'typeorm';
import { Role } from '@common/enums';
import { PasswordUtil } from '@common/utils';
import { User } from '@modules/users/entities/user.entity';
import { UserFactory } from '../factories';

export interface AdminSeedOptions {
  email: string;
  password: string;
}

export class UserSeed {
  static async run(
    dataSource: DataSource,
    { email, password }: AdminSeedOptions,
  ): Promise<void> {
    const userRepository = dataSource.getRepository(User);

    if (await userRepository.exists({ where: { email } })) {
      return;
    }

    await userRepository.save(
      userRepository.create(
        UserFactory.build({
          name: 'Super Admin',
          email,
          role: Role.SUPER_ADMIN,
          password: await PasswordUtil.hash(password),
        }),
      ),
    );
  }
}
