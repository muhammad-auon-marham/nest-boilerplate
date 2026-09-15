import 'reflect-metadata';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateUserDto } from '../../dto/create-user.dto';

describe('CreateUserDto', () => {
  const valid = {
    name: 'Jane Doe',
    email: 'jane@example.com',
    password: 'Password123!',
  };

  it('should pass validation with valid data', async () => {
    const errors = await validate(plainToInstance(CreateUserDto, valid));

    expect(errors).toHaveLength(0);
  });

  it('should normalise the email to lowercase', () => {
    const dto = plainToInstance(CreateUserDto, {
      ...valid,
      email: '  Jane@Example.COM ',
    });

    expect(dto.email).toBe('jane@example.com');
  });

  it('should fail validation when email is invalid', async () => {
    const errors = await validate(
      plainToInstance(CreateUserDto, { ...valid, email: 'invalid-email' }),
    );

    expect(
      errors.find((e) => e.property === 'email')?.constraints,
    ).toHaveProperty('isEmail');
  });

  it('should fail validation for a weak password', async () => {
    const errors = await validate(
      plainToInstance(CreateUserDto, { ...valid, password: 'password' }),
    );

    expect(errors.find((e) => e.property === 'password')).toBeDefined();
  });

  it('should reject an unknown role', async () => {
    const errors = await validate(
      plainToInstance(CreateUserDto, { ...valid, role: 'owner' }),
    );

    expect(
      errors.find((e) => e.property === 'role')?.constraints,
    ).toHaveProperty('isEnum');
  });
});
