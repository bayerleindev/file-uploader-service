import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { DynamicRateLimit } from 'src/rate_limit/dynamic.rate.limit.service';
import { UploadService } from './upload.service';

@Controller('upload')
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post()
  @Throttle({
    default: {
      ttl: () => DynamicRateLimit.dynamicTtl(),
      limit: () => DynamicRateLimit.dynamicLimit(),
      // generateKey: () => UploadController.key(),
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    console.log(DynamicRateLimit.dynamicTtl());
    this.uploadService.upload(file);
  }
}
