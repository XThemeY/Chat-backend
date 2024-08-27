import { ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { Tokens } from './types/index';
import { CreateAuthDto, LoginAuthDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    //  private userService: UserService,
    private jwtService: JwtService
  ) {}

  async register(dto: CreateAuthDto): Promise<Tokens> {
    try {
      const hashedPassword = await this.hashData(dto.password);
      const newUser = await this.prisma.user.create({
        data: {
          name: dto.name,
          login: dto.login,
          hashedPassword,
          gender: null,
          image: ''
        }
      });

      const tokens = await this.getTokens(newUser.id, newUser.login);
      await this.updateRtHash(newUser.id, tokens.refreshToken);
      return tokens;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async login(dto: LoginAuthDto): Promise<Tokens> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          login: dto.login
        }
      });

      if (!user) {
        throw new ForbiddenException('Invalid credentials');
      }

      const passwordMatches = await bcrypt.compare(dto.password, user.hashedPassword);

      if (!passwordMatches) {
        throw new ForbiddenException('Invalid credentials');
      }

      const tokens = await this.getTokens(user.id, user.login);
      await this.updateRtHash(user.id, tokens.refreshToken);
      return tokens;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async logout(userId: string) {
    try {
      await this.prisma.account.update({
        where: {
          userId
        },
        data: {
          accessToken: null,
          refreshToken: null
        }
      });
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async refreshTokens(refreshToken: string): Promise<Tokens> {
    try {
      const { userId } = await this.jwtService.verify(refreshToken, { secret: 'rt-secret' });

      const user = await this.prisma.user.findUnique({
        where: {
          id: userId
        }
      });

      if (!user) {
        throw new ForbiddenException('Access denied');
      }
      const auth = await this.prisma.account.findUnique({
        where: {
          userId
        }
      });
      if (!auth) {
        throw new ForbiddenException('Access denied');
      }

      const refreshTokenMatches = await bcrypt.compare(refreshToken, auth.refreshToken);

      if (!refreshTokenMatches) {
        throw new ForbiddenException('Access denied');
      }
      const tokens = await this.getTokens(user.id, user.login);
      await this.updateRtHash(user.id, tokens.refreshToken);
      return tokens;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  //   async validateUser(username: string, pass: string): Promise<any> {
  //     const user = await this.userService.findOne(username);
  //     if (user && user.password === pass) {
  //       const { password, ...result } = user;
  //       return result;
  //     }
  //     return null;
  //   }

  //   async updateUser(params: { where: Prisma.UserWhereUniqueInput; data: Prisma.UserUpdateInput }): Promise<User> {
  //     const { where, data } = params;
  //     return this.prisma.user.update({
  //       data,
  //       where
  //     });
  //   }

  //   async deleteUser(where: Prisma.UserWhereUniqueInput): Promise<User> {
  //     return this.prisma.user.delete({
  //       where
  //     });
  //   }

  async hashData(data: string) {
    return bcrypt.hash(data, 10);
  }

  async getTokens(userId: string, username: string): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.sign(
        {
          userId,
          username
        },
        { secret: 'at-secret', expiresIn: '15m' }
      ),
      this.jwtService.sign(
        {
          userId,
          username
        },
        { secret: 'rt-secret', expiresIn: '1w' }
      )
    ]);

    return {
      accessToken,
      refreshToken
    };
  }

  async deleteRtHash(userId: string): Promise<void> {
    await this.prisma.account.update({
      where: {
        userId
      },
      data: {
        refreshToken: null
      }
    });
  }

  async updateRtHash(userId: string, refreshToken: string): Promise<void> {
    const refreshTokenHash = await this.hashData(refreshToken);
    const auth = await this.prisma.account.findFirst({
      where: {
        userId
      }
    });

    if (!auth) {
      return;
    }
    await this.prisma.account.update({
      where: {
        userId
      },
      data: {
        refreshToken: refreshTokenHash
      }
    });
  }
}
