import { Module } from '@nestjs/common';
import { RetryWithBackoffInterceptor } from './retry-with-backoff/retry-with-backoff.interceptor';

@Module({
  providers: [RetryWithBackoffInterceptor],
  exports: [RetryWithBackoffInterceptor],
})
export class InterceptorsModule {}
