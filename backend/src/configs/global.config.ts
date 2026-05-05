import { API_PREFIX } from '../shared/constants/global.constants';

import { Config } from './config.interface';

export const GLOBAL_CONFIG: Config = {
  nest: {
    port: 3001,
  },
  cors: {
    enabled: true,
  },
  swagger: {
    enabled: true,
    title: 'Nestjs Prisma Starter',
    description: 'The nestjs API description',
    version: '1.5',
    path: API_PREFIX,
  },
  security: {
    expiresIn: 3600 * 24, // 24h
    bcryptSaltOrRound: 10,
    password: {
      minLength: parseInt(process.env.PWD_MIN_LENGTH ?? '8', 10),
      requireUppercase: (process.env.PWD_REQUIRE_UPPER ?? 'true') === 'true',
      requireLowercase: (process.env.PWD_REQUIRE_LOWER ?? 'true') === 'true',
      requireDigit: (process.env.PWD_REQUIRE_DIGIT ?? 'true') === 'true',
      requireSymbol: (process.env.PWD_REQUIRE_SYMBOL ?? 'false') === 'true',
    },
    lockout: {
      maxFailedAttempts: parseInt(process.env.LOCKOUT_MAX_ATTEMPTS ?? '5', 10),
      lockoutMinutes: parseInt(process.env.LOCKOUT_MINUTES ?? '15', 10),
    },
  },
};
