export interface Config {
  nest: NestConfig;
  cors: CorsConfig;
  swagger: SwaggerConfig;
  security: SecurityConfig;
}

export interface NestConfig {
  port: number;
}

export interface CorsConfig {
  enabled: boolean;
}

export interface SwaggerConfig {
  enabled: boolean;
  title: string;
  description: string;
  version: string;
  path: string;
}

export interface GraphqlConfig {
  playgroundEnabled: boolean;
  debug: boolean;
  schemaDestination: string;
  sortSchema: boolean;
}

export interface SecurityConfig {
  expiresIn: number;
  bcryptSaltOrRound: string | number;
  password: PasswordPolicyConfig;
  lockout: LockoutConfig;
}

export interface PasswordPolicyConfig {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireDigit: boolean;
  requireSymbol: boolean;
}

export interface LockoutConfig {
  maxFailedAttempts: number;
  lockoutMinutes: number;
}
