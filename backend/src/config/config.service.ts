import { Injectable, Logger } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
  private readonly logger = new Logger(ConfigService.name);

  constructor(private nestConfigService: NestConfigService) {}

  private getEnv(key: string, defaultValue: string): string {
    const value = this.nestConfigService.get<string>(key);
    if (!value) {
      this.logger.warn(`Environment variable ${key} is missing. Falling back to default: ${defaultValue}`);
      return defaultValue;
    }
    return value;
  }

  get nodeEnv(): string {
    return this.getEnv('NODE_ENV', 'development');
  }

  get siteDomain(): string {
    return this.getEnv('SITE_DOMAIN', 'localhost');
  }

  get apiPrefix(): string {
    return this.getEnv('API_PREFIX', 'api');
  }

  get port(): number {
    return Number(this.getEnv('PORT', '3000'));
  }

  get restApiBase(): string {
    return this.getEnv('REST_API_BASE', '/api');
  }

  get sessionLifetime(): number {
    return Number(this.getEnv('SESSION_LIFETIME', '86400000'));
  }

  get cookieSecure(): boolean {
    return this.getEnv('COOKIE_SECURE', 'false') === 'true';
  }

  get cookieSameSite(): string {
    return this.getEnv('COOKIE_SAME_SITE', 'lax');
  }

  get corsOrigin(): string {
    return this.getEnv('CORS_ORIGIN', '*');
  }

  get mongoUri(): string {
    return this.getEnv('MONGO_URI', 'mongodb://mongo:27017/campusconnect_db');
  }

  get redisUri(): string {
    return this.getEnv('REDIS_URI', 'redis://redis:6379');
  }

  get redisHost(): string {
    return this.getEnv('REDIS_HOST', 'redis');
  }

  get redisPort(): number {
    return Number(this.getEnv('REDIS_PORT', '6379'));
  }

  get redisPassword(): string {
    return this.getEnv('REDIS_PASSWORD', '');
  }

  get sessionSecret(): string {
    return this.getEnv('SESSION_SECRET', 'super_secret_key');
  }
}
