import { ConflictException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { Role, Status } from '@common/enums';
import { PasswordUtil } from '@common/utils';
import { LoggerService } from '@core/logger/logger.service';
import { User } from '../../entities/user.entity';
import { UserRepository } from '../../repositories/user.repository';
import { UsersService } from '../../services/users.service';

describe('UsersService', () => {
  let service: UsersService;
  let repository: jest.Mocked<UserRepository>;

  const mockUser = {
    id: '4f1c2b8e-7d8a-4b5b-9d56-0a6b1f3c9e21',
    name: 'Jane Doe',
    email: 'jane@example.com',
    role: Role.USER,
    status: Status.ACTIVE,
  } as User;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: {
            findById: jest.fn(),
            findActiveById: jest.fn(),
            findByEmailWithPassword: jest.fn(),
            findByIdWithPassword: jest.fn(),
            existsByEmail: jest.fn(),
            findPaginated: jest.fn(),
            createAndSave: jest.fn(),
            updateById: jest.fn(),
            softDeleteById: jest.fn(),
          },
        },
        { provide: LoggerService, useValue: { log: jest.fn() } },
      ],
    }).compile();

    service = module.get(UsersService);
    repository = module.get(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should hash the password and return the created user', async () => {
      repository.existsByEmail.mockResolvedValue(false);
      repository.createAndSave.mockResolvedValue(mockUser);
      repository.findById.mockResolvedValue(mockUser);

      const result = await service.create({
        name: 'Jane Doe',
        email: 'jane@example.com',
        password: 'Password123!',
      });

      const saved = repository.createAndSave.mock.calls[0][0];
      expect(saved.password).not.toBe('Password123!');
      expect(
        await PasswordUtil.verify('Password123!', saved.password as string),
      ).toBe(true);
      expect(result).toEqual(mockUser);
    });

    it('should throw ConflictException when the email is taken', async () => {
      repository.existsByEmail.mockResolvedValue(true);

      await expect(
        service.create({
          name: 'Jane Doe',
          email: 'jane@example.com',
          password: 'Password123!',
        }),
      ).rejects.toThrow(ConflictException);
      expect(repository.createAndSave).not.toHaveBeenCalled();
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      repository.findPaginated.mockResolvedValue([[mockUser], 21]);

      const result = await service.findAll({ page: 2, limit: 10 });

      expect(repository.findPaginated).toHaveBeenCalledWith({
        page: 2,
        limit: 10,
      });
      expect(result).toEqual({
        data: [mockUser],
        meta: { total: 21, page: 2, limit: 10, lastPage: 3 },
      });
    });
  });

  describe('findOne', () => {
    it('should return the user when found', async () => {
      repository.findById.mockResolvedValue(mockUser);

      await expect(service.findOne(mockUser.id)).resolves.toEqual(mockUser);
    });

    it('should throw NotFoundException when the user does not exist', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.findOne('missing')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should reject changing the email to one that is already taken', async () => {
      repository.findById.mockResolvedValue(mockUser);
      repository.existsByEmail.mockResolvedValue(true);

      await expect(
        service.update(mockUser.id, { email: 'taken@example.com' }),
      ).rejects.toThrow(ConflictException);
      expect(repository.updateById).not.toHaveBeenCalled();
    });

    it('should update and return the fresh user', async () => {
      const updated = { ...mockUser, name: 'Janet' } as User;
      repository.findById
        .mockResolvedValueOnce(mockUser)
        .mockResolvedValueOnce(updated);

      const result = await service.update(mockUser.id, { name: 'Janet' });

      expect(repository.updateById).toHaveBeenCalledWith(mockUser.id, {
        name: 'Janet',
      });
      expect(result).toEqual(updated);
    });
  });

  describe('updatePassword', () => {
    it('should store a hash, never the plain password', async () => {
      await service.updatePassword(mockUser.id, 'NewPassword123!');

      const [, data] = repository.updateById.mock.calls[0];
      expect(data.password).not.toBe('NewPassword123!');
      expect(
        await PasswordUtil.verify('NewPassword123!', data.password as string),
      ).toBe(true);
    });
  });

  describe('remove', () => {
    it('should soft-delete an existing user', async () => {
      repository.findById.mockResolvedValue(mockUser);

      await service.remove(mockUser.id);

      expect(repository.softDeleteById).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw NotFoundException for an unknown user', async () => {
      repository.findById.mockResolvedValue(null);

      await expect(service.remove('missing')).rejects.toThrow(
        NotFoundException,
      );
      expect(repository.softDeleteById).not.toHaveBeenCalled();
    });
  });
});
