import { ResourceService } from '../health/health.service';
import { DynamicRateLimit } from './dynamic-rate-limit.service';

jest.mock('../health/health.service');

describe('DynamicRateLimit', () => {
  let resourceService: ResourceService;

  beforeEach(() => {
    resourceService = new ResourceService();
    DynamicRateLimit.resource = resourceService;
  });

  describe('dynamicTtl', () => {
    it('should return default TTL when CPU and memory are normal', () => {
      jest.spyOn(resourceService, 'getCPUUsage').mockReturnValue(50);
      jest.spyOn(resourceService, 'getUsedMemory').mockReturnValue(50);

      const result = DynamicRateLimit.dynamicTtl();

      expect(result).toBe(DynamicRateLimit.defaultTTL);
    });

    it('should return a TTL adjusted upwards for high CPU usage', () => {
      jest.spyOn(resourceService, 'getCPUUsage').mockReturnValue(80);
      jest.spyOn(resourceService, 'getUsedMemory').mockReturnValue(50);

      const result = DynamicRateLimit.dynamicTtl();

      expect(result).toBeGreaterThan(DynamicRateLimit.defaultTTL);
    });

    it('should return a TTL adjusted downwards for low CPU usage', () => {
      jest.spyOn(resourceService, 'getCPUUsage').mockReturnValue(20);
      jest.spyOn(resourceService, 'getUsedMemory').mockReturnValue(50);

      const result = DynamicRateLimit.dynamicTtl();

      expect(result).toBeLessThan(DynamicRateLimit.defaultTTL);
    });

    it('should cap TTL to max value', () => {
      jest.spyOn(resourceService, 'getCPUUsage').mockReturnValue(100);
      jest.spyOn(resourceService, 'getUsedMemory').mockReturnValue(100);

      const result = DynamicRateLimit.dynamicTtl();

      expect(result).toBeLessThanOrEqual(DynamicRateLimit.defaultTTL * 5);
    });
  });

  describe('dynamicLimit', () => {
    it('should return an adjusted limit based on CPU and memory usage', () => {
      jest.spyOn(resourceService, 'getCPUUsage').mockReturnValue(50);
      jest.spyOn(resourceService, 'getUsedMemory').mockReturnValue(50);

      const result = DynamicRateLimit.dynamicLimit();

      expect(result).toBeGreaterThan(DynamicRateLimit.defaultLimit);
    });

    it('should not exceed maximum limit', () => {
      jest.spyOn(resourceService, 'getCPUUsage').mockReturnValue(90);
      jest.spyOn(resourceService, 'getUsedMemory').mockReturnValue(90);

      const result = DynamicRateLimit.dynamicLimit();

      expect(result).toBeLessThanOrEqual(1000);
    });
  });
});
