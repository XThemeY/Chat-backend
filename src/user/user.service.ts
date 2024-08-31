import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserDto } from './dto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getCurrentUser(id: string): Promise<UserDto> {
    try {
      const user = await this.prisma.user.findUnique({
        where: {
          id
        }
      });

      if (!user) {
        return null;
      }

      return new UserDto(user);
    } catch (error) {
      throw new InternalServerErrorException(error);
    }
  }
}
