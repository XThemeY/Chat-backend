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
      secretOrKey: 'rt-secret'
    });
  }

  async validate(payload: JwtPayload) {
    return payload;
  }
}
