import { ResourceService } from '../health/health.service';

export class DynamicRateLimit {
  static defaultTTL = 10000;
  static defaultLimit = 1;
  static resource = new ResourceService();

  static dynamicTtl() {
    const cpu = DynamicRateLimit.resource.getCPUUsage();

    console.log(cpu);

    if (cpu < 20) {
      return Math.max(Math.floor(DynamicRateLimit.defaultTTL / 2), this.defaultLimit);
    } else if (cpu > 80) {
      return Math.max(DynamicRateLimit.defaultTTL * 2, this.defaultLimit);
    }
    return DynamicRateLimit.defaultTTL;
  }
  static dynamicLimit() {
    const cpu = DynamicRateLimit.resource.getCPUUsage();

    if (cpu < 20) {
      return DynamicRateLimit.defaultLimit * 2;
    } else if (cpu > 80) {
      return DynamicRateLimit.defaultLimit / 2;
    }
    return DynamicRateLimit.defaultLimit;
  }
}
