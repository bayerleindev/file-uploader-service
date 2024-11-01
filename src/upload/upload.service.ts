import { Injectable, Logger } from '@nestjs/common';
import { existsSync, mkdirSync, createWriteStream } from 'fs';
import { join } from 'path';
import { Readable, Stream, Writable } from 'stream';
import { NoAgentsAvailableError, UploadServiceError } from './errors';
import { UploadAgentPool } from './upload.agent.pool';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  constructor(private agentPool: UploadAgentPool) {}

  async upload(file: Express.Multer.File, username: string) {
    const startTime = performance.now();
    this.logger.log({
      message: 'Processing started',
      fileName: file.originalname,
      fileSize: file.size,
      username,
    });

    if (!(await this.agentPool.allocateAgent())) {
      throw new NoAgentsAvailableError('No agents available.');
    }

    try {
      const filePath = this.prepareFilePath(username, file.originalname);
      const readStream = this.createReadStream(file.buffer);
      const writeStream = this.createWriteStream(filePath);

      await this.processFileUpload(readStream, writeStream, file, username);
    } catch (error) {
      await this.onUploadError(file, username, error as Error);
      throw new UploadServiceError((error as Error).message);
    } finally {
      const endTime = performance.now(); // End timing
      this.logger.log({
        message: 'Upload completed',
        duration: `${(endTime - startTime).toFixed(2)} ms`, // Log the duration
        fileName: file.originalname,
        username,
      });
    }
    return { message: 'File uploaded successfully' };
  }

  private prepareFilePath(username: string, fileName: string): string {
    const uploadDir = join(__dirname, '..', `uploads/${username}`);
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }
    return join(uploadDir, fileName);
  }

  private createReadStream(buffer: Buffer): Readable {
    const readStream = new Stream.Readable();
    readStream.push(buffer);
    readStream.push(null);
    return readStream;
  }

  private createWriteStream(filePath: string): Writable {
    return createWriteStream(filePath);
  }

  private async processFileUpload(
    readStream: Readable,
    writeStream: Writable,
    file: Express.Multer.File,
    username: string,
  ): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      readStream.pipe(writeStream);

      writeStream.on('finish', async () => {
        await this.onUploadFinished(file, username);
        resolve();
      });

      writeStream.on('error', async (error) => {
        await this.onUploadError(file, username, error);
        reject(error);
      });
    });
  }

  private async onUploadFinished(file: Express.Multer.File, username: string) {
    this.logger.log({
      message: 'Processing finished',
      fileName: file.originalname,
      fileSize: file.size,
      username,
    });
    await this.agentPool.releaseAgent();
  }

  private async onUploadError(
    file: Express.Multer.File,
    username: string,
    error: Error,
  ) {
    this.logger.error({
      message: 'Error processing file',
      fileName: file.originalname,
      username,
      error: error.message,
    });
    await this.agentPool.releaseAgent();
  }
}
