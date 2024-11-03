import { SetMetadata } from '@nestjs/common';

export const RETRY_METADATA_KEY = 'RETRY_METADATA_KEY';

export function RetryWithBackoff(
  maxRetries: number = 3,
  baseDelay: number = 1000,
) {
  return SetMetadata(RETRY_METADATA_KEY, { maxRetries, baseDelay });
}
