import { Module } from '@nestjs/common';
import { ResourceService } from './health.service';
import { ResourceController } from './health.controller';

@Module({
  providers: [ResourceService],
  exports: [ResourceService],
  controllers: [ResourceController],
})
export class ResourceModule {}
