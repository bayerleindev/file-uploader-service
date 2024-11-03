import { ResourceService } from './health.service';
import * as os from 'os';

jest.mock('os');

describe('ResourceService', () => {
  let resourceService: ResourceService;

  beforeEach(() => {
    jest.clearAllMocks();

    (os.cpus as jest.Mock).mockReturnValue([
      { times: { idle: 200, user: 800, sys: 500, irq: 0, nice: 0 } },
      { times: { idle: 250, user: 750, sys: 500, irq: 0, nice: 0 } },
    ]);

    resourceService = new ResourceService();
  });

  describe('getCPUUsage', () => {
    it('should calculate CPU usage based on mocked CPU times', () => {
      resourceService.getCPUUsage();

      (os.cpus as jest.Mock).mockReturnValue([
        { times: { idle: 220, user: 880, sys: 520, irq: 0, nice: 0 } },
        { times: { idle: 270, user: 870, sys: 510, irq: 0, nice: 0 } },
      ]);

      const cpuUsage = resourceService.getCPUUsage();

      expect(cpuUsage).toBeGreaterThan(0);
      expect(cpuUsage).toBeLessThan(100);
    });
  });

  describe('getFreeMemory', () => {
    it('should return the mocked free memory value', () => {
      (os.freemem as jest.Mock).mockReturnValue(500000000);

      const freeMemory = resourceService.getFreeMemory();

      expect(freeMemory).toBe(500000000);
    });
  });

  describe('isOverloaded', () => {
    beforeEach(() => {
      (os.cpus as jest.Mock).mockReturnValue([
        { times: { idle: 300, user: 700, sys: 500, irq: 0, nice: 0 } },
        { times: { idle: 350, user: 650, sys: 500, irq: 0, nice: 0 } },
      ]);

      resourceService.getCPUUsage();
    });

    it('should return true if CPU usage exceeds the threshold', () => {
      (os.cpus as jest.Mock).mockReturnValue([
        { times: { idle: 200, user: 800, sys: 500, irq: 0, nice: 0 } },
        { times: { idle: 250, user: 750, sys: 500, irq: 0, nice: 0 } },
      ]);
      (os.freemem as jest.Mock).mockReturnValue(500000000);

      const isOverloaded = resourceService.isOverloaded(50, 300000000);
      expect(isOverloaded).toBe(true);
    });

    it('should return true if free memory is below the threshold', () => {
      (os.cpus as jest.Mock).mockReturnValue([
        { times: { idle: 300, user: 700, sys: 500, irq: 0, nice: 0 } },
        { times: { idle: 350, user: 650, sys: 500, irq: 0, nice: 0 } },
      ]);
      (os.freemem as jest.Mock).mockReturnValue(100);

      const isOverloaded = resourceService.isOverloaded(80, 50);
      expect(isOverloaded).toBe(true);
    });

    it('should return false if neither CPU nor memory exceeds the threshold', () => {
      (os.cpus as jest.Mock).mockReturnValue([
        { times: { idle: 350, user: 650, sys: 500, irq: 0, nice: 0 } },
        { times: { idle: 400, user: 600, sys: 500, irq: 0, nice: 0 } },
      ]);
      (os.freemem as jest.Mock).mockReturnValue(6);

      const isOverloaded = resourceService.isOverloaded(800, 60);
      expect(isOverloaded).toBe(false);
    });
  });
});
