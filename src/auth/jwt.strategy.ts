// auth/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ResponseMessageEnum } from 'src/common/enums/response-message.enum';
import { RedisService } from 'src/redis/redis.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly redisService: RedisService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secret',
      passReqToCallback: true
    });
  }

  async validate(req: Request, payload: any) {
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    const isBlacklisted = await this.redisService.isTokenBlacklisted(token);

    if (isBlacklisted) throw new UnauthorizedException(ResponseMessageEnum.TOKEN_EXPIRED);

    return { userId: payload.sub, role: payload.role, email: payload.email };
  }
}
