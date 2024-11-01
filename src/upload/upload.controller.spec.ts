import { Test, TestingModule } from '@nestjs/testing';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { AuthGuard } from '../auth/basich.auth.guard';
import { BadRequestException, HttpException, HttpStatus } from '@nestjs/common';
import { NoAgentsAvailableError } from './errors';
import { Request } from 'express';

describe('UploadController', () => {
  let controller: UploadController;
  let uploadService: UploadService;

  const mockRequest = (username?: string) =>
    ({
      user: username ? { username } : undefined,
    }) as unknown as Request;

  const mockFile: Express.Multer.File = {
    fieldname: 'file',
    originalname: 'test.txt',
    encoding: '7bit',
    mimetype: 'text/plain',
    size: 1024,
    buffer: Buffer.from('test content'),
    stream: null,
    destination: '',
    filename: '',
    path: '',
  };

  const uploadServiceMock = {
    upload: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [{ provide: UploadService, useValue: uploadServiceMock }],
    })
      .overrideGuard(AuthGuard)
      .useValue({ canActivate: jest.fn(() => true) }) // Mock the AuthGuard
      .compile();

    controller = module.get<UploadController>(UploadController);
    uploadService = module.get<UploadService>(UploadService);
    jest.spyOn(uploadService, 'upload'); // Cria um mock para uploadService.upload
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should throw BadRequestException if username is missing', async () => {
    const req = mockRequest();

    await expect(controller.upload(mockFile, req)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should throw BadRequestException if file is missing', async () => {
    const req = mockRequest('testUser');

    await expect(controller.upload(null, req)).rejects.toThrow(
      BadRequestException,
    );
  });

  it('should call uploadService with correct parameters', async () => {
    const req = mockRequest('testUser');
    await controller.upload(mockFile, req);

    expect(uploadService.upload).toHaveBeenCalledWith(mockFile, 'testUser');
  });

  it('should throw HttpException with TOO_MANY_REQUESTS status when NoAgentsAvailableError is thrown', async () => {
    const req = mockRequest('testUser');
    (uploadService.upload as jest.Mock).mockRejectedValue(
      new NoAgentsAvailableError('No Agntes available.'),
    );

    await expect(controller.upload(mockFile, req)).rejects.toThrow(
      new HttpException('No Agntes available.', HttpStatus.TOO_MANY_REQUESTS),
    );
  });
});
