import { Body, Controller, Post } from '@nestjs/common';
import { ApiBody, ApiResponse } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';
import { UsersService } from './users.service';

@Controller('users')
@SkipThrottle()
export class UsersController {
  constructor(private userService: UsersService) {}

  @Post()
  @ApiBody({
    description: 'User registration details',
    schema: {
      type: 'object',
      properties: {
        username: {
          type: 'string',
          example: 'john_doe',
        },
        password: {
          type: 'string',
          example: 'password123',
        },
      },
      required: ['username', 'password'],
    },
  })
  @ApiResponse({
    status: 201,
    description: 'The user has been successfully created.',
    schema: {
      type: 'object',
      properties: {
        id: {
          type: 'number',
          example: 1,
        },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Bad request.' })
  @ApiResponse({ status: 500, description: 'Internal server error.' })
  async createUser(
    @Body() user: { username: string; password: string },
  ): Promise<{ id: number }> {
    return await this.userService.create(user);
  }
}
