import { Module } from '@nestjs/common';
import { ResourceService } from './resource.service';
import { ResourceController } from './resource.controller';

@Module({
  providers: [ResourceService],
  exports: [ResourceService],
  controllers: [ResourceController],
})
export class ResourceModule {}
