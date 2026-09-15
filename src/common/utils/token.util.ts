import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { JwtPayload } from '../interfaces';

/**
 * Reads the user id from an optional Bearer token without failing the request.
 * Useful on `@Public()` routes that personalise the response when a token is present.
 */
export function extractUserId(
  jwtService: JwtService,
  configService: ConfigService,
  req: any,
): string | null {
  const token = req?.headers?.authorization?.split(' ')[1];

  if (!token) {
    return null;
  }

  try {
    const payload = jwtService.verify<JwtPayload>(token, {
      secret: configService.get<string>('jwt.secret'),
    });
    return payload.sub;
  } catch {
    return null;
  }
}
