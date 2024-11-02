import {
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
  Logger,
  BadRequestException,
  HttpException,
  HttpStatus,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { AuthGuard } from '../auth/basich.auth.guard';
import { DynamicRateLimit } from '../rate-limit/dynamic-rate-limit.service';
import { UploadService } from './upload.service';
import { Request } from 'express';
import { NoAgentsAvailableError } from './errors';
import { ApiBasicAuth, ApiOperation, ApiParam, ApiResponse } from '@nestjs/swagger';

@Controller('upload')
@UseGuards(AuthGuard)
@ApiBasicAuth()
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly uploadService: UploadService) {}

  @Post()
  @Throttle({
    default: {
      ttl: () => DynamicRateLimit.dynamicTtl(),
      limit: () => DynamicRateLimit.dynamicLimit(),
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'File upload' })
  @ApiResponse({ status: 201, description: 'File uploaded succesfully.' })
  @ApiResponse({ status: 400, description: 'File upload failed.' })
  @ApiResponse({ status: 401, description: 'Unauthorized.' })
  @ApiParam({ name: 'file', type: 'file', description: 'file to upload' })
  async upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({
            maxSize: (Number(process.env.MAX_FILE_SIZE_MB) || 250) * 1e6,
          }),
          new FileTypeValidator({ fileType: 'text/csv' }),
        ],
      }),
    )
    file: Express.Multer.File,
    @Req() request: Request,
  ) {
    if (!file) {
      this.logger.error('File is missing in the request');
      throw new BadRequestException('File is required');
    }

    const username = request['user']?.username;

    if (!username) {
      this.logger.error('Username is missing in the request');
      throw new BadRequestException('Username is required');
    }

    try {
      return await this.uploadService.upload(file, username);
    } catch (error) {
      if (error instanceof NoAgentsAvailableError)
        throw new HttpException(error.message, HttpStatus.TOO_MANY_REQUESTS);
    }
  }
}
