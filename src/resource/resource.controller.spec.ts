import { Test, TestingModule } from '@nestjs/testing';
import { ResourceController } from './resource.controller';
import { ResourceService } from './resource.service';

describe('ResourceController', () => {
  let resourceController: ResourceController;
  let resourceService: ResourceService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ResourceController],
      providers: [
        {
          provide: ResourceService,
          useValue: {
            getCPUUsage: jest.fn(),
            getFreeMemory: jest.fn(),
          },
        },
      ],
    }).compile();

    resourceController = module.get<ResourceController>(ResourceController);
    resourceService = module.get<ResourceService>(ResourceService);
  });

  describe('getResourceInfo', () => {
    it('should return CPU usage and free memory', () => {
      const mockCPUUsage = 45.5;
      const mockFreeMemory = 1500000000;

      jest.spyOn(resourceService, 'getCPUUsage').mockReturnValue(mockCPUUsage);
      jest
        .spyOn(resourceService, 'getFreeMemory')
        .mockReturnValue(mockFreeMemory);

      const result = resourceController.getResourceInfo();

      expect(result).toEqual({
        avg_cpu_usage: mockCPUUsage,
        avg_free_memory: mockFreeMemory,
      });

      expect(resourceService.getCPUUsage).toHaveBeenCalled();
      expect(resourceService.getFreeMemory).toHaveBeenCalled();
    });
  });
});
