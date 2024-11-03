import { ResourceService } from '../health/health.service';

export class DynamicRateLimit {
  static defaultTTL = 10000;
  static defaultLimit = 1;
  static resource = new ResourceService();

  static dynamicTtl() {
    const cpu = DynamicRateLimit.resource.getCPUUsage();
    const memory = DynamicRateLimit.resource.getUsedMemory();

    const alpha = 0.02; // Weight for CPU impact on TTL
    const beta = 0.01; // Weight for memory impact on TTL

    const adjustedTtl =
      DynamicRateLimit.defaultTTL *
      Math.exp(alpha * (cpu - 50) + beta * (memory - 50));

    return Math.max(
      Math.min(adjustedTtl, DynamicRateLimit.defaultTTL * 5),
      this.defaultLimit,
    );
  }

  static dynamicLimit() {
    const cpu = DynamicRateLimit.resource.getCPUUsage();
    const memory = DynamicRateLimit.resource.getUsedMemory();

    const k = 2;
    const base = this.defaultLimit;
    const max = 1000;
    const alpha = 0.01;
    const utilization = cpu + memory;

    const rateLimit = base + (max - base) * Math.exp(-alpha * k * utilization);
    return Math.round(rateLimit);
  }
}
