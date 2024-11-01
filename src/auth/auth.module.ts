import { Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { AuthGuard } from './basich.auth.guard';

@Module({
  providers: [AuthGuard],
  imports: [UsersModule],
})
export class AuthModule {}
