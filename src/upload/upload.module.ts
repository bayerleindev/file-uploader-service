import { Module } from '@nestjs/common';
import { UploadAgentPool } from './upload.agent.pool';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  controllers: [UploadController],
  providers: [UploadService, UploadAgentPool],
})
export class UploadModule {}
