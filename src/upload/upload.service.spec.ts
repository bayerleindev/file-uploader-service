import { Test, TestingModule } from '@nestjs/testing';
import { UploadService } from './upload.service';
import { UploadAgentPool } from './upload.agent.pool';
import { createWriteStream, existsSync, mkdirSync } from 'fs';

const mockWriteStream = {
  on: jest.fn().mockImplementation(function (this, event, handler) {
    if (event === 'finish') {
      handler();
    }
    return this;
  }),
  write: jest.fn(),
  end: jest.fn(),
  once: jest.fn(),
  emit: jest.fn(),
};

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  createWriteStream: jest.fn(),
}));

describe('UploadService', () => {
  let service: UploadService;
  let agentPool: UploadAgentPool;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UploadService,
        {
          provide: UploadAgentPool,
          useValue: {
            allocateAgent: jest.fn(),
            releaseAgent: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UploadService>(UploadService);
    agentPool = module.get<UploadAgentPool>(UploadAgentPool);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('upload', () => {
    const mockFile = {
      originalname: 'test.txt',
      size: 1024,
      buffer: Buffer.from('test content'),
    } as Express.Multer.File;

    const username = 'testUser';

    it('should upload file successfully', async () => {
      (agentPool.allocateAgent as jest.Mock).mockResolvedValue(true);

      (createWriteStream as jest.Mock).mockReturnValue(mockWriteStream);

      await service.upload(mockFile, username);

      expect(agentPool.allocateAgent).toHaveBeenCalled();
      expect(agentPool.releaseAgent).toHaveBeenCalled();
    });

    it('should throw an error if no agents are available', async () => {
      (agentPool.allocateAgent as jest.Mock).mockResolvedValue(false);

      await expect(service.upload(mockFile, username)).rejects.toThrow(
        'No agents available.',
      );

      expect(agentPool.allocateAgent).toHaveBeenCalled();
    });

    it('should handle errors during file writing', async () => {
      (agentPool.allocateAgent as jest.Mock).mockResolvedValue(true);

      (createWriteStream as jest.Mock).mockReturnValue(mockWriteStream);

      await service.upload(mockFile, username);

      expect(agentPool.allocateAgent).toHaveBeenCalled();
      expect(agentPool.releaseAgent).toHaveBeenCalled();
    });
  });

  describe('prepareFilePath', () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it('should create folder if it does not exist', () => {
      (existsSync as jest.Mock).mockReturnValue(false);

      const result = service['prepareFilePath']('testUser', 'test.txt');

      expect(existsSync).toHaveBeenCalled();
      expect(mkdirSync).toHaveBeenCalledWith(expect.any(String), {
        recursive: true,
      });
      expect(result).toContain('uploads/testUser/test.txt');
    });

    it('should not create folder if it exists', () => {
      (existsSync as jest.Mock).mockReturnValue(true);

      const result = service['prepareFilePath']('testUser', 'test.txt');

      expect(existsSync).toHaveBeenCalled();
      expect(mkdirSync).not.toHaveBeenCalled();
      expect(result).toContain('uploads/testUser/test.txt');
    });
  });
});
