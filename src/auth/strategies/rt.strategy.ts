import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

type JwtPayload = {
  userId: string;
  login: string;
};

export class RtJWTStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => {
          return req.cookies.authentication;
        }
      ]),
      secretOrKey: process.env.REFRESH_JWT_SECRET
    });
  }

  async validate(payload: JwtPayload) {
    return payload;
  }
}
