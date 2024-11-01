import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly userService: UsersService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();

    const authHeader = request.headers['authorization'];
    if (!authHeader) {
      throw new UnauthorizedException('Authorization header missing');
    }

    const [authType, base64Credentials] = authHeader.split(' ');
    if (authType !== 'Basic') {
      throw new UnauthorizedException('Invalid authentication type');
    }

    const credentials = Buffer.from(base64Credentials, 'base64').toString(
      'utf-8',
    );
    const [username, password] = credentials.split(':');

    const user = await this.userService.findOne(username);

    if (user && (await bcrypt.compare(password, user.password))) {
      request.user = { username: user.username };
      return true;
    }

    throw new UnauthorizedException('Invalid credentials');
  }
}
