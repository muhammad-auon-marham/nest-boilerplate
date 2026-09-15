import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Status } from '@common/enums';
import { AuthenticatedUser, JwtPayload } from '@common/interfaces';
import { PasswordUtil } from '@common/utils';
import { User } from '@modules/users/entities/user.entity';
import { UsersService } from '@modules/users/services/users.service';
import { ChangePasswordDto, RegisterDto } from '../dto';
import { AuthResponse, AuthTokens } from '../interfaces';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Used by `LocalStrategy`. Returns the user when the credentials are valid and the account is active.
   */
  async validateUser(
    email: string,
    password: string,
  ): Promise<AuthenticatedUser | null> {
    const user = await this.usersService.findByEmailWithPassword(email);

    if (
      !user ||
      user.status !== Status.ACTIVE ||
      !(await PasswordUtil.verify(password, user.password))
    ) {
      return null;
    }

    return this.toAuthenticatedUser(user);
  }

  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    const user = await this.usersService.create(registerDto);

    return this.login(this.toAuthenticatedUser(user));
  }

  async login(user: AuthenticatedUser): Promise<AuthResponse> {
    await this.usersService.recordLogin(user.id);

    return {
      ...(await this.issueTokens(user)),
      user,
    };
  }

  async refreshToken(refreshToken: string): Promise<AuthResponse> {
    let payload: JwtPayload;

    try {
      payload = await this.jwtService.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findActiveById(payload.sub);

    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const authenticatedUser = this.toAuthenticatedUser(user);

    return {
      ...(await this.issueTokens(authenticatedUser)),
      user: authenticatedUser,
    };
  }

  async getProfile(userId: string): Promise<User> {
    return this.usersService.findOne(userId);
  }

  async changePassword(
    userId: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<{ message: string }> {
    const { currentPassword, newPassword, confirmPassword } = changePasswordDto;

    if (newPassword !== confirmPassword) {
      throw new BadRequestException(
        'New password and confirm password do not match',
      );
    }

    const user = await this.usersService.findByIdWithPassword(userId);

    if (!(await PasswordUtil.verify(currentPassword, user.password))) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    await this.usersService.updatePassword(userId, newPassword);

    return { message: 'Password changed successfully' };
  }

  private async issueTokens(user: AuthenticatedUser): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('jwt.refreshSecret'),
        expiresIn: this.configService.get('jwt.refreshExpiresIn'),
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private toAuthenticatedUser(user: User): AuthenticatedUser {
    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }
}
