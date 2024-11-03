import { UsersService } from '../users/users.service';
import { UnauthorizedException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { User } from '../users/user.repository';
import { AuthGuard } from './basich.auth.guard';

describe('AuthGuard', () => {
  let authGuard: AuthGuard;
  let userService: UsersService;

  beforeEach(() => {
    userService = { findOne: jest.fn() } as unknown as UsersService;
    authGuard = new AuthGuard(userService);
  });

  it('should throw UnauthorizedException if no authorization header is provided', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
      }),
    } as unknown as ExecutionContext;

    await expect(authGuard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(authGuard.canActivate(context)).rejects.toThrow(
      'Authorization header missing',
    );
  });

  it('should throw UnauthorizedException if authorization type is not Basic', async () => {
    const context = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: { authorization: 'Bearer token' } }),
      }),
    } as unknown as ExecutionContext;

    await expect(authGuard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(authGuard.canActivate(context)).rejects.toThrow(
      'Invalid authentication type',
    );
  });

  it('should throw UnauthorizedException if credentials are invalid', async () => {
    const mockUsername = 'user';
    const mockPassword = 'wrongPassword';
    const mockUser = new User();
    mockUser.username = 'mockUsername';
    mockUser.password = 'hashedPassword';

    jest.spyOn(userService, 'findOne').mockResolvedValue(mockUser);
    jest.spyOn(bcrypt, 'compare').mockResolvedValue(false);

    const context = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {
            authorization:
              'Basic ' +
              Buffer.from(`${mockUsername}:${mockPassword}`).toString('base64'),
          },
        }),
      }),
    } as unknown as ExecutionContext;

    await expect(authGuard.canActivate(context)).rejects.toThrow(
      UnauthorizedException,
    );
    await expect(authGuard.canActivate(context)).rejects.toThrow(
      'Invalid credentials',
    );
  });
});
