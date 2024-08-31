import { Controller, Get, HttpCode, HttpStatus, NotFoundException, Param } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto } from './dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/:id')
  @HttpCode(HttpStatus.OK)
  async getCurrentUser(@Param('id') id: string): Promise<UserDto> {
    const user = await this.userService.getCurrentUser(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
