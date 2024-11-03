import {
  Injectable,
  CallHandler,
  ExecutionContext,
  NestInterceptor,
  InternalServerErrorException,
} from '@nestjs/common';
import { Observable, throwError, timer } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { RETRY_METADATA_KEY } from './retry-with-backoff.decorator';

@Injectable()
export class RetryWithBackoffInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const retryConfig = this.reflector.get<{
      maxRetries: number;
      baseDelay: number;
    }>(RETRY_METADATA_KEY, context.getHandler());

    if (!retryConfig) {
      return next.handle();
    }

    const { maxRetries, baseDelay } = retryConfig;

    return next.handle().pipe(
      retry({
        count: maxRetries,

        delay: (error, attempt) => {
          if (!(error instanceof InternalServerErrorException)) {
            throw error; // Stop retrying immediately
          }
          return timer(baseDelay * Math.pow(2, attempt));
        },
      }),
      catchError((error) => {
        return throwError(() => error);
      }),
    );
  }
}
