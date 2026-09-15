import { Test, TestingModule } from '@nestjs/testing';
import { Role } from '@common/enums';
import { User } from '@modules/users/entities/user.entity';
import { AuthController } from '../../controllers/auth.controller';
import { AuthService } from '../../services/auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let service: jest.Mocked<AuthService>;

  const user = {
    id: '4f1c2b8e-7d8a-4b5b-9d56-0a6b1f3c9e21',
    name: 'Jane Doe',
    email: 'jane@example.com',
    role: Role.USER,
  };
  const authResponse = { accessToken: 'access', refreshToken: 'refresh', user };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            login: jest.fn(),
            refreshToken: jest.fn(),
            getProfile: jest.fn(),
            changePassword: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(AuthController);
    service = module.get(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('register should delegate to the service', async () => {
    const dto = {
      name: user.name,
      email: user.email,
      password: 'Password123!',
    };
    service.register.mockResolvedValue(authResponse);

    await expect(controller.register(dto)).resolves.toEqual(authResponse);
    expect(service.register).toHaveBeenCalledWith(dto);
  });

  it('login should issue tokens for the user resolved by LocalAuthGuard', async () => {
    service.login.mockResolvedValue(authResponse);

    await expect(
      controller.login({ email: user.email, password: 'Password123!' }, user),
    ).resolves.toEqual(authResponse);
    expect(service.login).toHaveBeenCalledWith(user);
  });

  it('refresh should delegate to the service', async () => {
    service.refreshToken.mockResolvedValue(authResponse);

    await expect(
      controller.refresh({ refreshToken: 'refresh' }),
    ).resolves.toEqual(authResponse);
    expect(service.refreshToken).toHaveBeenCalledWith('refresh');
  });

  it('me should return the authenticated user profile', async () => {
    service.getProfile.mockResolvedValue(user as User);

    await expect(controller.me(user)).resolves.toEqual(user);
    expect(service.getProfile).toHaveBeenCalledWith(user.id);
  });

  it('changePassword should delegate to the service', async () => {
    const dto = {
      currentPassword: 'a',
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!',
    };
    service.changePassword.mockResolvedValue({
      message: 'Password changed successfully',
    });

    await controller.changePassword(user, dto);

    expect(service.changePassword).toHaveBeenCalledWith(user.id, dto);
  });
});
