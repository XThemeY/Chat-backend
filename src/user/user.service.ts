import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class UserService {
  //   constructor(private prisma: PrismaService) {}
  //   async findOne(userId: string): Promise<User> {
  //     try {
  //       const user = await this.prisma.user.findUnique({
  //         where: {
  //           id: userId
  //         }
  //       });
  //     } catch (error) {
  //       throw new InternalServerErrorException(error);
  //     }
  //   }
}
