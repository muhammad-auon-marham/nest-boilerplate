import { BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { Role, Status } from '@common/enums';
import { PasswordUtil } from '@common/utils';
import { User } from '@modules/users/entities/user.entity';
import { UsersService } from '@modules/users/services/users.service';
import { AuthService } from '../../services/auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: jest.Mocked<UsersService>;
  let jwtService: jest.Mocked<JwtService>;

  const user = {
    id: '4f1c2b8e-7d8a-4b5b-9d56-0a6b1f3c9e21',
    name: 'Jane Doe',
    email: 'jane@example.com',
    role: Role.USER,
    status: Status.ACTIVE,
  } as User;
  const authenticatedUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            findActiveById: jest.fn(),
            findByEmailWithPassword: jest.fn(),
            findByIdWithPassword: jest.fn(),
            updatePassword: jest.fn(),
            recordLogin: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest
              .fn()
              .mockResolvedValueOnce('access-token')
              .mockResolvedValueOnce('refresh-token'),
            verifyAsync: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(
              (key: string) =>
                ({
                  'jwt.refreshSecret': 'refresh-secret',
                  'jwt.refreshExpiresIn': '7d',
                })[key],
            ),
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    usersService = module.get(UsersService);
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return the user for valid credentials', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue({
        ...user,
        password: await PasswordUtil.hash('Password123!'),
      } as User);

      await expect(
        service.validateUser(user.email, 'Password123!'),
      ).resolves.toEqual(authenticatedUser);
    });

    it('should return null for a wrong password', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue({
        ...user,
        password: await PasswordUtil.hash('Password123!'),
      } as User);

      await expect(
        service.validateUser(user.email, 'wrong'),
      ).resolves.toBeNull();
    });

    it('should return null for an inactive account', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue({
        ...user,
        status: Status.SUSPENDED,
        password: await PasswordUtil.hash('Password123!'),
      } as User);

      await expect(
        service.validateUser(user.email, 'Password123!'),
      ).resolves.toBeNull();
    });

    it('should return null for an unknown email', async () => {
      usersService.findByEmailWithPassword.mockResolvedValue(null);

      await expect(
        service.validateUser('nobody@example.com', 'Password123!'),
      ).resolves.toBeNull();
    });
  });

  describe('login', () => {
    it('should issue an access and refresh token pair', async () => {
      const result = await service.login(authenticatedUser);

      expect(result).toEqual({
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
        user: authenticatedUser,
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: user.id,
        email: user.email,
        role: user.role,
      });
      expect(jwtService.signAsync).toHaveBeenCalledWith(
        { sub: user.id, email: user.email, role: user.role },
        { secret: 'refresh-secret', expiresIn: '7d' },
      );
      expect(usersService.recordLogin).toHaveBeenCalledWith(user.id);
    });
  });

  describe('register', () => {
    it('should create the user and log them in', async () => {
      usersService.create.mockResolvedValue(user);
      const dto = {
        name: user.name,
        email: user.email,
        password: 'Password123!',
      };

      const result = await service.register(dto);

      expect(usersService.create).toHaveBeenCalledWith(dto);
      expect(result.user).toEqual(authenticatedUser);
      expect(result.accessToken).toBe('access-token');
    });
  });

  describe('refreshToken', () => {
    it('should issue new tokens for a valid refresh token', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: user.id,
        email: user.email,
        role: user.role,
      });
      usersService.findActiveById.mockResolvedValue(user);

      const result = await service.refreshToken('valid');

      expect(jwtService.verifyAsync).toHaveBeenCalledWith('valid', {
        secret: 'refresh-secret',
      });
      expect(result.user).toEqual(authenticatedUser);
    });

    it('should throw UnauthorizedException for an invalid token', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('jwt malformed'));

      await expect(service.refreshToken('invalid')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException when the user is no longer active', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: user.id,
        email: user.email,
        role: user.role,
      });
      usersService.findActiveById.mockResolvedValue(null);

      await expect(service.refreshToken('valid')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('changePassword', () => {
    const dto = {
      currentPassword: 'Password123!',
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    };

    it('should update the password when the current password matches', async () => {
      usersService.findByIdWithPassword.mockResolvedValue({
        ...user,
        password: await PasswordUtil.hash('Password123!'),
      } as User);

      await expect(service.changePassword(user.id, dto)).resolves.toEqual({
        message: 'Password changed successfully',
      });
      expect(usersService.updatePassword).toHaveBeenCalledWith(
        user.id,
        'NewPassword123!',
      );
    });

    it('should reject mismatched confirmation', async () => {
      await expect(
        service.changePassword(user.id, {
          ...dto,
          confirmPassword: 'Other123!',
        }),
      ).rejects.toThrow(BadRequestException);
      expect(usersService.updatePassword).not.toHaveBeenCalled();
    });

    it('should reject a wrong current password', async () => {
      usersService.findByIdWithPassword.mockResolvedValue({
        ...user,
        password: await PasswordUtil.hash('Different123!'),
      } as User);

      await expect(service.changePassword(user.id, dto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(usersService.updatePassword).not.toHaveBeenCalled();
    });
  });
});
