import { Body, Controller, Get, HttpCode, HttpStatus, NotFoundException, Param, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { GetUser } from 'src/auth/common/decorators';
import { User } from '@prisma/client';
import { UpdateUserDto } from './dto/update-user.dto';

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

  @Patch('/:id')
  @HttpCode(HttpStatus.OK)
  async updateUserSettings(@Param('id') id: string, @Body() dto: UpdateUserDto): Promise<User> {
    console.log(dto);

    const user = await this.userService.updateUserSettings(id, dto);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
