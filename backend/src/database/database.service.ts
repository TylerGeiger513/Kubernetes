import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '../config/config.service';
import { RedisClientType } from 'redis';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class DatabaseService {
    private readonly logger = new Logger(DatabaseService.name);

    constructor(
        private readonly configService: ConfigService,
        @Inject('REDIS_CLIENT') private readonly redisClient: RedisClientType,
        @InjectConnection() private readonly connection: Connection,
    ) { }

    async pingRedis(): Promise<string> {
        try {
            const reply = await this.redisClient.ping();
            this.logger.log(`✅ Redis PONG: ${reply}`);
            return reply;
        } catch (err) {
            this.logger.error('❌ Redis Error:', err);
            throw err;
        }
    }

    async mongoHealthCheck(): Promise<void> {
        // Use the injected connection rather than the global mongoose.connection
        const readyState = this.connection.readyState;
        this.logger.log(`Mongoose connection readyState: ${readyState}`);
        // readyState: 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
        if (readyState !== 1) {
            const errorMessage = 'MongoDB is not connected';
            this.logger.error(errorMessage);
            throw new Error(errorMessage);
        }
    }
}
