import { Body, Controller, Post } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { UsersService } from './users.service';

@Controller('users')
@SkipThrottle()
export class UsersController {
  constructor(private userService: UsersService) {}

  @Post()
  async createUser(@Body() user: { username: string; password: string }) {
    return await this.userService.create(user);
  }
}
