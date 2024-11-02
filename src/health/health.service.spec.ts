import { ResourceService } from './health.service';
import * as os from 'os';

jest.mock('os');

describe('ResourceService', () => {
  let resourceService: ResourceService;

  beforeEach(() => {
    // Clear previous mocks
    jest.clearAllMocks();
    // Mock a realistic structure for os.cpus()
    (os.cpus as jest.Mock).mockReturnValue([
      { times: { idle: 200, user: 800, sys: 500, irq: 0, nice: 0 } },
      { times: { idle: 250, user: 750, sys: 500, irq: 0, nice: 0 } },
    ]);

    // Instantiate the service
    resourceService = new ResourceService();
  });

  describe('getCPUUsage', () => {
    it('should calculate CPU usage based on mocked CPU times', () => {
      // Initial call to set up previous values
      resourceService.getCPUUsage();

      // Update mocked CPU times to simulate CPU usage
      (os.cpus as jest.Mock).mockReturnValue([
        { times: { idle: 220, user: 880, sys: 520, irq: 0, nice: 0 } },
        { times: { idle: 270, user: 870, sys: 510, irq: 0, nice: 0 } },
      ]);

      const cpuUsage = resourceService.getCPUUsage();

      // Assert the calculated CPU usage based on mock data
      expect(cpuUsage).toBeGreaterThan(0);
      expect(cpuUsage).toBeLessThan(100);
    });
  });

  describe('getFreeMemory', () => {
    it('should return the mocked free memory value', () => {
      (os.freemem as jest.Mock).mockReturnValue(500000000); // Mock 500 MB

      const freeMemory = resourceService.getFreeMemory();

      expect(freeMemory).toBe(500000000);
    });
  });

  describe('isOverloaded', () => {
    beforeEach(() => {
      // Set initial CPU values within threshold limits
      (os.cpus as jest.Mock).mockReturnValue([
        { times: { idle: 300, user: 700, sys: 500, irq: 0, nice: 0 } },
        { times: { idle: 350, user: 650, sys: 500, irq: 0, nice: 0 } },
      ]);

      resourceService.getCPUUsage(); // Initial snapshot
    });

    it('should return true if CPU usage exceeds the threshold', () => {
      // Set CPU values to simulate high CPU usage
      (os.cpus as jest.Mock).mockReturnValue([
        { times: { idle: 200, user: 800, sys: 500, irq: 0, nice: 0 } },
        { times: { idle: 250, user: 750, sys: 500, irq: 0, nice: 0 } },
      ]);
      (os.freemem as jest.Mock).mockReturnValue(500000000); // Mock 500 MB

      const isOverloaded = resourceService.isOverloaded(50, 300000000);
      expect(isOverloaded).toBe(true);
    });

    it('should return true if free memory is below the threshold', () => {
      // Set CPU within normal limits but memory low
      (os.cpus as jest.Mock).mockReturnValue([
        { times: { idle: 300, user: 700, sys: 500, irq: 0, nice: 0 } },
        { times: { idle: 350, user: 650, sys: 500, irq: 0, nice: 0 } },
      ]);
      (os.freemem as jest.Mock).mockReturnValue(100);

      const isOverloaded = resourceService.isOverloaded(80, 50);
      expect(isOverloaded).toBe(true);
    });

    it('should return false if neither CPU nor memory exceeds the threshold', () => {
      // Ensure both CPU and memory are within safe limits
      (os.cpus as jest.Mock).mockReturnValue([
        { times: { idle: 350, user: 650, sys: 500, irq: 0, nice: 0 } },
        { times: { idle: 400, user: 600, sys: 500, irq: 0, nice: 0 } },
      ]);
      (os.freemem as jest.Mock).mockReturnValue(6); // Mock 600 MB

      const isOverloaded = resourceService.isOverloaded(800, 60);
      expect(isOverloaded).toBe(false);
    });
  });
});
