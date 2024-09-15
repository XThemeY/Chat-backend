import { Controller, Post, Body, HttpStatus, HttpCode, Res, UseGuards, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/index';
import { AccessToken, LoginInfo } from './types/index';
import { GetUser, Public } from './common/decorators';
import { Response } from 'express';
import { Cookies } from './common/decorators/cookie.decorator';
import { RtJWTGuard } from './common/guards';
import { ConfigService } from '@nestjs/config';

@Controller('auth')
export class AuthController {
  #secure: boolean;
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {
    this.#secure = false; //this.configService.get('NODE_ENV') === 'production';
  }

  @Public()
  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: LoginAuthDto): Promise<void> {
    await this.authService.register(dto);
  }

  @Public()
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginAuthDto, @Res({ passthrough: true }) res: Response): Promise<LoginInfo> {
    const { user, account, refresh_token } = await this.authService.login(dto);
    res.cookie('authentication', refresh_token, { httpOnly: true, secure: this.#secure, sameSite: 'lax' });
    return {
      user,
      account
    };
  }

  @Post('/logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  async logout(
    @GetUser('provider') provider: string,
    @GetUser('providerAccountId') providerAccountId: string,
    @Res({ passthrough: true }) res: Response
  ) {
    const isLogout = await this.authService.logout(provider, providerAccountId);
    if (isLogout) {
      res.clearCookie('authentication');
    } else {
      throw new BadRequestException('Logout failed');
    }
  }
  index = 0;
  @Public()
  @UseGuards(RtJWTGuard)
  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @Cookies('authentication') refreshToken: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<AccessToken> {
    const tokens = await this.authService.refreshTokens(refreshToken);
    res.cookie('authentication', tokens.refreshToken, { httpOnly: true, secure: this.#secure, sameSite: 'lax' });

    return tokens.accessToken;
  }
}
