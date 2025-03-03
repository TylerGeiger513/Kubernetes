import { Injectable, Logger } from '@nestjs/common';
import { MongooseModuleAsyncOptions } from '@nestjs/mongoose';
import { ConfigService } from '../config/config.service';
import createClient from 'ioredis';

@Injectable()
export class DatabaseService {
  private readonly logger = new Logger(DatabaseService.name);

  constructor(private configService: ConfigService) {}

  createRedisClient() {
    const redisUri = this.configService.redisUri;
    this.logger.log(`Connecting to Redis at ${redisUri}`);

    const client = new createClient(redisUri);

    client.on('connect', () => this.logger.log('✅ Redis Connected'));
    client.on('error', (err) => this.logger.error('❌ Redis Error:', err));

    return client;
  }
}

export const databaseProviders = {
  mongoConfig: {
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
      const uri = configService.mongoUri;
      const logger = new Logger('MongoDB');
      logger.log(`Connecting to MongoDB at ${uri}`);
      return { uri };
    },
  } as MongooseModuleAsyncOptions,

  redisClient: {
    provide: 'REDIS_CLIENT',
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
      return new DatabaseService(configService).createRedisClient();
    },
  },
};
