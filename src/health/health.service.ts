import { Injectable } from '@nestjs/common';
import * as os from 'os';

@Injectable()
export class ResourceService {
  getCPUUsage(): number {
    const cpus = os.cpus();
    const totalIdle = cpus.reduce((acc, cpu) => acc + cpu.times.idle, 0);
    const totalTick = cpus.reduce((acc, cpu) => {
      return acc + Object.values(cpu.times).reduce((a, b) => a + b, 0);
    }, 0);
    const idlePercentage = (totalIdle / totalTick) * 100;
    return 100 - idlePercentage;
  }

  getFreeMemory(): number {
    return os.freemem();
  }

  isOverloaded(cpuThreshold: number, memoryThreshold: number): boolean {
    const cpuUsage = this.getCPUUsage();
    const freeMemory = this.getFreeMemory();
    return cpuUsage > cpuThreshold || freeMemory > memoryThreshold;
  }
}
