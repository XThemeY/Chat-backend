import { Controller, Post, Body, HttpStatus, HttpCode, Res, Req, Get, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginAuthDto } from './dto/index';
import { AccessToken, LoginInfo } from './types/index';
import { GetCurrentUser, Public } from './common/decorators';
import { Response, Request } from 'express';
import { Cookies } from './common/decorators/cookie.decorator';
import { RtJWTGuard } from './common/guards';

@Controller('auth')
export class AuthController {
  secure: boolean;

  constructor(private readonly authService: AuthService) {
    this.secure = false;
  }

  @Public()
  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: LoginAuthDto): Promise<void> {
    await this.authService.register(dto);
  }

  @Get('/log')
  @HttpCode(HttpStatus.OK)
  async log(@Req() req: Request): Promise<void> {
    console.log('cookies', req.cookies);
    console.log('headers', req.headers);
  }

  @Public()
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Req() req: Request,
    @Body() dto: LoginAuthDto,
    @Res({ passthrough: true }) res: Response
  ): Promise<LoginInfo> {
    const { user, account, refresh_token } = await this.authService.login(dto);
    console.log('access', account.access_token);

    res.cookie('authentication', refresh_token, { httpOnly: true, secure: this.secure });

    return {
      user,
      account
    };
  }

  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  async logout(@GetCurrentUser('userId') userId: string, @Res({ passthrough: true }) res: Response) {
    res.clearCookie('authentication');
    return this.authService.logout(userId, userId);
  }

  @Public()
  @UseGuards(RtJWTGuard)
  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(
    @Cookies('authentication') refreshToken: string,
    @Res({ passthrough: true }) res: Response
  ): Promise<AccessToken> {
    const tokens = await this.authService.refreshTokens(refreshToken);
    res.cookie('authentication', tokens.refreshToken, { httpOnly: true, secure: this.secure });
    return tokens.accessToken;
  }

  //   @Post('/reset')
  //   reset() {
  //     return this.authService.reset();
  //   }

  //   @Post('/send-email')
  //   sendEmail() {
  //     return this.authService.sendEmail();
  //   }

  //   @Post('/verify-email')
  //   verifyEmail() {
  //     return this.authService.verifyEmail();
  //   }
}
