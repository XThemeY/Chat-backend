import { Controller, Get, HttpCode, HttpStatus, NotFoundException, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { GetUser } from 'src/auth/common/decorators';
import { User } from '@prisma/client';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(@Param('id') id: string): Promise<User> {
    const user = await this.userService.getCurrentUser(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  @Get('/')
  @HttpCode(HttpStatus.OK)
  async getUsers(@GetUser('userId') userId: string): Promise<User[]> {
    const users = await this.userService.getUsers(userId);
    return users;
  }
}
