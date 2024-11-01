import { ResourceService } from '../resource/resource.service';

export class DynamicRateLimit {
  static defaultTTL = 10000;
  static defaultLimit = 1;
  static resource = new ResourceService();

  static dynamicTtl() {
    const cpu = DynamicRateLimit.resource.getCPUUsage();

    console.log(cpu);

    if (cpu < 20) {
      return DynamicRateLimit.defaultTTL / 2;
    } else if (cpu > 80) {
      return DynamicRateLimit.defaultTTL * 2;
    }
    return DynamicRateLimit.defaultTTL;
  }
  static dynamicLimit() {
    const cpu = DynamicRateLimit.resource.getCPUUsage();
    console.log(cpu);

    if (cpu < 20) {
      return DynamicRateLimit.defaultLimit * 2;
    } else if (cpu > 80) {
      return DynamicRateLimit.defaultLimit / 2;
    }
    return DynamicRateLimit.defaultLimit;
  }
}
