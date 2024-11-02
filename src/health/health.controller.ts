import { Controller, Get } from '@nestjs/common';
import { SkipThrottle } from '@nestjs/throttler';
import { ResourceService } from './health.service';

@Controller('health')
export class ResourceController {
  constructor(private resourceService: ResourceService) {}

  @Get()
  @SkipThrottle()
  getResourceInfo() {
    return {
      avg_cpu_usage: this.resourceService.getCPUUsage(),
      avg_free_memory: this.resourceService.getFreeMemory(),
    };
  }
}
