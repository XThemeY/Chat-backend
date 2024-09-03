import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}
  async getCurrentUser(id: string): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id
        }
      });

      if (!user) {
        return null;
      }

      return user;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }

  async getUsers(excludeId?: string): Promise<User[]> {
    try {
      const users = await this.prisma.user.findMany({
        orderBy: {
          createdAt: 'desc'
        },
        where: {
          NOT: {
            id: excludeId ?? ''
          }
        }
      });

      return users;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
