import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthenticatedUser, JwtPayload } from '@common/interfaces';
import { UsersService } from '@modules/users/services/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    configService: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('jwt.secret'),
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = payload.sub
      ? await this.usersService.findActiveById(payload.sub)
      : null;

    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return { id: user.id, name: user.name, email: user.email, role: user.role };
  }
}
