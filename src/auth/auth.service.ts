import { ForbiddenException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import bcrypt from 'bcrypt';
import { LoginInfo, Tokens } from './types/index';
import { LoginAuthDto } from './dto';
import { Account } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    //  private userService: UserService,
    private jwtService: JwtService
  ) {}

  async register(dto: LoginAuthDto): Promise<boolean> {
    try {
      let newUser;
      if (dto.provider !== 'credentials') {
        const account = await this.getAccount(dto.provider, dto.providerAccountId);
        if (!account) {
          newUser = await this.prisma.user.create({
            data: {
              name: dto.name,
              image: dto.image ?? `https://avatar.iran.liara.run/username?username=${dto.name}`,
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
            image: `https://avatar.iran.liara.run/username?username=${dto.name}`
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
    await this.deleteRtHash(provider, providerAccountId);
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
        { secret: 'at-secret', expiresIn: '10s' }
      ),
      this.jwtService.sign(
        {
          userId,
          provider,
          providerAccountId
        },
        { secret: 'rt-secret', expiresIn: '15s' }
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

  async deleteRtHash(provider: string, providerAccountId: string): Promise<void> {
    try {
      const account = await this.prisma.account.findFirst({ where: { provider, providerAccountId } });

      await this.prisma.account.update({
        where: {
          id: account.id
        },
        data: {
          refresh_token: null
        }
      });
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
