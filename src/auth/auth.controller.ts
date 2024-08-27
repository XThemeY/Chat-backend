import { Controller, Post, Body, HttpStatus, HttpCode, Res, BadRequestException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto, LoginAuthDto } from './dto/index';
import { AccessToken } from './types/index';
import { GetCurrentUser, Public } from './common/decorators';
import { Response } from 'express';
import { Cookies } from './common/decorators/cookie.decorator';

@Controller('auth')
export class AuthController {
  secure: boolean;

  constructor(private readonly authService: AuthService) {
    this.secure = false;
  }

  @Public()
  @Post('/register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: CreateAuthDto, @Res({ passthrough: true }) res: Response): Promise<AccessToken> {
    const { accessToken, refreshToken } = await this.authService.register(dto);
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: this.secure });
    return { accessToken };
  }

  @Public()
  @Post('/login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() dto: LoginAuthDto, @Res({ passthrough: true }) res: Response): Promise<AccessToken> {
    const { accessToken, refreshToken } = await this.authService.login(dto);
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: this.secure });
    return { accessToken };
  }

  @Post('/logout')
  @HttpCode(HttpStatus.OK)
  async logout(@GetCurrentUser('userId') userId: string, @Res({ passthrough: true }) res: Response) {
    res.clearCookie('refreshToken');
    return this.authService.logout(userId);
  }

  @Public()
  @Post('/refresh')
  @HttpCode(HttpStatus.OK)
  async refreshTokens(@Cookies('refreshToken') refreshToken: string, @Res({ passthrough: true }) res: Response) {
    if (!refreshToken) {
      throw new BadRequestException('Refresh token is not found');
    }
    const tokens = await this.authService.refreshTokens(refreshToken);
    res.cookie('refreshToken', tokens.refreshToken, { httpOnly: true, secure: this.secure });
    return { accessToken: tokens.accessToken };
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
