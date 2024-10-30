import { Injectable } from '@nestjs/common';
import { existsSync, mkdirSync, createWriteStream } from 'fs';
import { join } from 'path';
import { Stream } from 'stream';
import { UploadAgentPool } from './upload.agent.pool';

@Injectable()
export class UploadService {
  constructor(private agentPool: UploadAgentPool) {
    const uploadDir = join(__dirname, '..', 'uploads');
    if (!existsSync(uploadDir)) {
      mkdirSync(uploadDir, { recursive: true });
    }
  }

  async upload(file: Express.Multer.File) {
    if (!(await this.agentPool.allocateAgent())) throw new Error('no agents');

    const filePath = join(__dirname, '..', 'uploads', file.originalname);

    const readStream = new Stream.Readable();
    readStream.push(file.buffer);
    readStream.push(null);

    const writeStream = createWriteStream(filePath);

    await new Promise<void>((resolve, reject) => {
      readStream.pipe(writeStream);
      writeStream.on('finish', async () => await this.agentPool.releaseAgent());
      writeStream.on('error', reject);
    });
  }
}
