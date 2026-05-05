import { BadRequestException } from '@nestjs/common';
import { GLOBAL_CONFIG } from '../../configs/global.config';

export function assertPasswordPolicy(password: string): void {
  const policy = GLOBAL_CONFIG.security.password;
  const errors: string[] = [];

  if (!password || password.length < policy.minLength) {
    errors.push(`at least ${policy.minLength} characters`);
  }
  if (policy.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('one uppercase letter');
  }
  if (policy.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('one lowercase letter');
  }
  if (policy.requireDigit && !/\d/.test(password)) {
    errors.push('one digit');
  }
  if (policy.requireSymbol && !/[^A-Za-z0-9]/.test(password)) {
    errors.push('one symbol');
  }

  if (errors.length > 0) {
    throw new BadRequestException(
      `Password does not meet policy. Required: ${errors.join(', ')}.`,
    );
  }
}
