import { MiddlewareConsumer, Module } from '@nestjs/common';
import { UsersModule } from '../users/users.module';
import { RequestIdMiddleware } from '../middlewares/request-id.middleware';
import { UploadAgentPool } from './upload.agent.pool';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  controllers: [UploadController],
  providers: [UploadService, UploadAgentPool],
  imports: [UsersModule],
})
export class UploadModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestIdMiddleware).forRoutes(UploadController);
  }
}
