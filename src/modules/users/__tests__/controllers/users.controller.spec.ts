import { Test, TestingModule } from '@nestjs/testing';
import { Role, Status } from '@common/enums';
import { AuthenticatedUser } from '@common/interfaces';
import { UsersController } from '../../controllers/users.controller';
import { User } from '../../entities/user.entity';
import { UsersService } from '../../services/users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<UsersService>;

  const currentUser: AuthenticatedUser = {
    id: '4f1c2b8e-7d8a-4b5b-9d56-0a6b1f3c9e21',
    name: 'Jane Doe',
    email: 'jane@example.com',
    role: Role.USER,
  };
  const mockUser = { ...currentUser, status: Status.ACTIVE } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: {
            create: jest.fn(),
            findAll: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            updateProfile: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get(UsersController);
    service = module.get(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('updateProfile should update the authenticated user only', async () => {
    service.updateProfile.mockResolvedValue(mockUser);

    await expect(
      controller.updateProfile(currentUser, { name: 'Janet' }),
    ).resolves.toEqual(mockUser);
    expect(service.updateProfile).toHaveBeenCalledWith(currentUser.id, {
      name: 'Janet',
    });
  });

  it('create should delegate to the service', async () => {
    const dto = {
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'Password123!',
    };
    service.create.mockResolvedValue(mockUser);

    await expect(controller.create(dto)).resolves.toEqual(mockUser);
    expect(service.create).toHaveBeenCalledWith(dto);
  });

  it('findAll should pass the pagination query through', async () => {
    const page = {
      data: [mockUser],
      meta: { total: 1, page: 1, limit: 20, lastPage: 1 },
    };
    service.findAll.mockResolvedValue(page);

    await expect(controller.findAll({ page: 1, limit: 20 })).resolves.toEqual(
      page,
    );
    expect(service.findAll).toHaveBeenCalledWith({ page: 1, limit: 20 });
  });

  it('findOne should delegate to the service', async () => {
    service.findOne.mockResolvedValue(mockUser);

    await expect(controller.findOne(mockUser.id)).resolves.toEqual(mockUser);
    expect(service.findOne).toHaveBeenCalledWith(mockUser.id);
  });

  it('update should delegate to the service', async () => {
    service.update.mockResolvedValue(mockUser);

    await expect(
      controller.update(mockUser.id, { role: Role.ADMIN }),
    ).resolves.toEqual(mockUser);
    expect(service.update).toHaveBeenCalledWith(mockUser.id, {
      role: Role.ADMIN,
    });
  });

  it('remove should delegate to the service', async () => {
    service.remove.mockResolvedValue(undefined);

    await controller.remove(mockUser.id);

    expect(service.remove).toHaveBeenCalledWith(mockUser.id);
  });
});
