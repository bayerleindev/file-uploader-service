import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, HttpException, HttpStatus } from '@nestjs/common';
import { RetryWithBackoffInterceptor } from './retry-with-backoff.interceptor';
import { Reflector } from '@nestjs/core';
import { of, throwError } from 'rxjs';
import { BadRequestException } from '@nestjs/common';

describe('RetryWithBackoffInterceptor', () => {
  let interceptor: RetryWithBackoffInterceptor;
  let reflector: Reflector;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RetryWithBackoffInterceptor, Reflector],
    }).compile();

    interceptor = module.get<RetryWithBackoffInterceptor>(
      RetryWithBackoffInterceptor,
    );
    reflector = module.get<Reflector>(Reflector);
  });

  it('should pass through without retrying if no retry configuration is provided', async () => {
    const context = {
      getHandler: jest.fn().mockReturnValue({}),
    } as unknown as ExecutionContext;

    const next = {
      handle: jest.fn().mockReturnValue(of('result')),
    };

    const result = await interceptor.intercept(context, next).toPromise();

    expect(result).toEqual('result');
    expect(next.handle).toHaveBeenCalled();
  });

  it('should retry the specified number of times and stop for BadRequestException', async () => {
    const context = {
      getHandler: jest.fn().mockReturnValue({}),
    } as unknown as ExecutionContext;

    const next = {
      handle: jest.fn().mockReturnValue(throwError(new BadRequestException())),
    };

    reflector.get = jest
      .fn()
      .mockReturnValue({ maxRetries: 3, baseDelay: 1000 });

    try {
      await interceptor.intercept(context, next).toPromise();
    } catch (error) {
      expect(error).toBeInstanceOf(BadRequestException);
      expect(next.handle).toHaveBeenCalledTimes(1);
    }
  });

  it('should throw an error if the error is not InternalServerErrorException', async () => {
    const context = {
      getHandler: jest.fn().mockReturnValue({}),
    } as unknown as ExecutionContext;

    const next = {
      handle: jest
        .fn()
        .mockReturnValue(
          throwError(new HttpException('Error', HttpStatus.FORBIDDEN)),
        ),
    };

    reflector.get = jest
      .fn()
      .mockReturnValue({ maxRetries: 2, baseDelay: 1000 });

    try {
      await interceptor.intercept(context, next).toPromise();
    } catch (error) {
      expect(error).toBeInstanceOf(HttpException);
      expect(next.handle).toHaveBeenCalledTimes(1);
    }
  });
});
