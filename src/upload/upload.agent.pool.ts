import { Injectable } from '@nestjs/common';
import { Mutex } from 'async-mutex';

@Injectable()
export class UploadAgentPool {
  private maxAgents = Number(process.env.MAX_AGENTS_NUMBER || 5);
  private activeAgents = 0;
  private mutex = new Mutex();

  async allocateAgent(): Promise<boolean> {
    const release = await this.mutex.acquire();
    try {
      if (this.activeAgents < this.maxAgents) {
        this.activeAgents++;
        return true;
      }
      return false;
    } finally {
      release();
    }
  }

  async releaseAgent(): Promise<void> {
    const release = await this.mutex.acquire();
    try {
      if (this.activeAgents > 0) {
        this.activeAgents--;
      }
    } finally {
      release();
    }
  }
}
