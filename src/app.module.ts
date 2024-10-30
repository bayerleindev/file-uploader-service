import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UploadModule } from './upload/upload.module';
import { ResourceModule } from './resource/resource.module';
import { RateLimitModule } from './rate_limit/rate.limit.module';

@Module({
  imports: [
    UploadModule,
    ThrottlerModule.forRoot([
      {
        ttl: 10000,
        limit: 1,
      },
    ]),
    ResourceModule,
    RateLimitModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
