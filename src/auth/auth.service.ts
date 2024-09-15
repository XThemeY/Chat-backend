import { ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { LoginInfo, Tokens } from './types/index';
import { LoginAuthDto } from './dto';
import { Account, User } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    //  private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService
  ) {}

  async register(dto: LoginAuthDto): Promise<boolean> {
    try {
      let newUser: User;
      if (dto.provider !== 'credentials') {
        const account = await this.getAccount(dto.provider, dto.providerAccountId);
        if (!account) {
          newUser = await this.prisma.user.create({
            data: {
              name: dto.name,
              image: dto.image ?? `https://ui-avatars.com/api/?name=${dto.name}?format=png`,
              email: dto.email
            }
          });
          await this.createAccount(newUser.id, dto.type, dto.provider, dto.providerAccountId);
        }
      } else {
        const hashedPassword = await this.hashData(dto.password);
        newUser = await this.prisma.user.create({
          data: {
            name: dto.name,
            login: dto.login,
            hashedPassword,
            image: `https://ui-avatars.com/api/?name=${dto.name}?format=png`
          }
        });
        await this.createAccount(newUser.id, dto.type, dto.provider);
      }

      return true;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }

  async login(dto: LoginAuthDto): Promise<LoginInfo> {
    try {
      let user = await this.prisma.user.findFirst({
        omit: {
          hashedPassword: false
        },
        where: {
          OR: [{ login: dto?.login }, { email: dto?.email }]
        }
      });

      if (!user && dto.provider !== 'credentials') {
        await this.register(dto);
        user = await this.prisma.user.findFirst({
          where: {
            OR: [{ login: dto?.login }, { email: dto?.email }]
          }
        });
      } else if (!user) {
        throw new ForbiddenException('Invalid credentials');
      }
      let tokens: Tokens;
      let response: LoginInfo;
      if (dto.provider !== 'credentials') {
        tokens = await this.getTokens(user.id, dto.provider, dto.providerAccountId);
        await this.updateTokenHash(dto.provider, dto.providerAccountId, tokens);
        response = {
          user: { id: user.id, name: user.name, email: user.email, image: user.image },
          account: {
            type: dto.type,
            provider: dto.provider,
            providerAccountId: dto.providerAccountId,
            access_token: tokens.accessToken.access_token,
            expires_at: tokens.accessToken.expires_at
          },
          refresh_token: tokens.refreshToken
        };
      } else {
        const passwordMatches = await bcrypt.compare(dto.password, user.hashedPassword);

        if (!passwordMatches) {
          throw new ForbiddenException('Invalid credentials');
        }
        tokens = await this.getTokens(user.id, dto.provider, user.id);
        await this.updateTokenHash(dto.provider, user.id, tokens);
        response = {
          user: { id: user.id, name: user.name, login: user.login, image: user.image },
          account: {
            type: dto.type,
            provider: dto.provider,
            providerAccountId: user.id,
            access_token: tokens.accessToken.access_token,
            expires_at: tokens.accessToken.expires_at
          },
          refresh_token: tokens.refreshToken
        };
      }
      return response;
    } catch (error) {
      console.log(error);
      throw new InternalServerErrorException(error);
    }
  }

  async logout(provider: string, providerAccountId: string) {
    const isLogout = await this.deleteRtHash(provider, providerAccountId);

    if (isLogout) {
      return true;
    }
    return false;
  }

  async refreshTokens(refreshToken: string): Promise<Tokens> {
    try {
      const { userId, provider, providerAccountId } = await this.jwtService.verify(refreshToken, {
        secret: 'rt-secret'
      });

      const user = await this.prisma.user.findUnique({
        where: {
          id: userId
        }
      });

      if (!user) {
        throw new ForbiddenException('Access denied');
      }
      const auth = await this.prisma.account.findFirst({
        where: {
          provider,
          providerAccountId
        }
      });
      if (!auth) {
        throw new ForbiddenException('Access denied');
      }

      const refreshTokenMatches = await bcrypt.compare(refreshToken, auth.refresh_token);

      if (!refreshTokenMatches) {
        throw new ForbiddenException('Access denied');
      }
      const tokens = await this.getTokens(user.id, provider, providerAccountId);
      await this.updateTokenHash(provider, providerAccountId, tokens);
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

  async getTokens(userId: string, provider: string, providerAccountId: string): Promise<Tokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.sign(
        {
          userId,
          provider,
          providerAccountId
        },
        {
          secret: this.configService.get('ACCESS_JWT_SECRET') ?? 'rAEAKyObPHQuJM+eUczlOP25irE0QSj/0JMXpzpjU/A=',
          expiresIn: this.configService.get('ACCESS_TOKEN_EXPIRES') ?? '15m'
        }
      ),
      this.jwtService.sign(
        {
          userId,
          provider,
          providerAccountId
        },
        {
          secret: this.configService.get('REFRESH_JWT_SECRET') ?? 'L2Xfc9t3EwC+viFQIb05MgPKKAlTyMNS0xRY/os2Gko=',
          expiresIn: this.configService.get('REFRESH_TOKEN_EXPIRES') ?? '30d'
        }
      )
    ]);

    return {
      accessToken: {
        access_token: accessToken,
        expires_at: this.jwtService.decode(accessToken).exp * 1000
      },
      refreshToken
    };
  }

  async deleteRtHash(provider: string, providerAccountId: string): Promise<boolean> {
    try {
      const account = await this.prisma.account.findFirst({ where: { provider, providerAccountId } });

      if (!account) return false;

      await this.prisma.account.update({
        where: {
          id: account.id
        },
        data: {
          refresh_token: null,
          expires_at: null
        }
      });

      return true;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async updateTokenHash(provider: string, providerAccountId: string, tokens: Tokens): Promise<void> {
    const refreshTokenHash = await this.hashData(tokens.refreshToken);

    const expires_at = this.jwtService.decode(tokens.refreshToken).exp;
    const account = await this.prisma.account.findFirst({ where: { provider, providerAccountId } });
    await this.prisma.account.update({
      where: { id: account.id },
      data: {
        refresh_token: refreshTokenHash,
        expires_at
      }
    });
  }

  async createAccount(userId: string, type: string, provider: string, providerAccountId?: string): Promise<void> {
    await this.prisma.account.create({
      data: {
        type: type,
        user: {
          connect: { id: userId }
        },
        provider: provider,
        providerAccountId: providerAccountId || userId
      }
    });
  }

  async getAccount(provider: string, providerAccountId: string): Promise<Account | null> {
    const account = await this.prisma.account.findFirst({
      where: {
        provider,
        providerAccountId
      }
    });

    if (!account) {
      return null;
    }
    return account;
  }
}
