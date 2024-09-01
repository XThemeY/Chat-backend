import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { User } from './entities/user.entity';

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

      return new User(user);
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

      if (!users) {
        return [];
      }

      const mapUsers = users.map((user) => {
        return new User(user);
      });

      return mapUsers;
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
