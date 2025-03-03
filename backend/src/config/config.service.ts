import { Injectable, Logger } from '@nestjs/common';
import { ConfigService as NestConfigService } from '@nestjs/config';

@Injectable()
export class ConfigService {
    private readonly logger = new Logger(ConfigService.name);

    constructor(private readonly nestConfigService: NestConfigService) { }

    private getRequiredEnv(key: string): string {
        const value = this.nestConfigService.get<string>(key);
        if (!value) {
            this.logger.error(`Missing required environment variable: ${key}`);
            throw new Error(`Missing required environment variable: ${key}`);
        }
        return value;
    }

    get nodeEnv(): string {
        return this.nestConfigService.get<string>('NODE_ENV') || 'development';
    }

    get port(): number {
        const port = this.nestConfigService.get<number>('PORT');
        if (!port) {
            this.logger.error(`Missing required environment variable: PORT`);
            throw new Error('Missing required environment variable: PORT');
        }
        return port;
    }

    get apiPrefix(): string {
        return this.nestConfigService.get<string>('API_PREFIX') || 'api';
    }

    get corsOrigin(): string {
        return this.nestConfigService.get<string>('CORS_ORIGIN') || '*';
    }

    get mongoUri(): string {
        return this.getRequiredEnv('MONGO_URI');
    }

    get redisUri(): string {
        return this.getRequiredEnv('REDIS_URI');
    }

    get cookieSecure(): boolean {
        return this.nestConfigService.get<boolean>('COOKIE_SECURE')!;
    }

    get sessionSecret(): string {
        return this.getRequiredEnv('SESSION_SECRET');
    }

    get encryptionKey(): string {
        return this.getRequiredEnv('ENCRYPTION_KEY');
    }
}
