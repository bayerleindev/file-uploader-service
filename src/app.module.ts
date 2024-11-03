import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { UploadModule } from './upload/upload.module';
import { ResourceModule } from './health/health.module';
import { RateLimitModule } from './rate-limit/rate-limit.module';
import { AuthModule } from './auth/auth.module';
import { MiddlewaresModule } from './middlewares/middlewares.module';
import { LoggerModule } from 'nestjs-pino';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InterceptorsModule } from './interceptors/interceptors.module';
import typeormConfig from './config/typeorm';

@Module({
  imports: [
    UploadModule,
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 1,
        generateKey: (req) => {
          return req.switchToHttp().getRequest().headers['authorization'];
        },
      },
    ]),
    ResourceModule,
    RateLimitModule,
    AuthModule,
    MiddlewaresModule,
    LoggerModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [typeormConfig],
    }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) =>
        configService.get('typeorm'),
    }),
    UsersModule,
    InterceptorsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
