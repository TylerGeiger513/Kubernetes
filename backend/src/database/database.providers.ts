import { MongooseModuleAsyncOptions } from '@nestjs/mongoose';
import { ConfigService } from '../config/config.service';
import { Logger } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

const logger = new Logger('DatabaseProviders');

export const mongoProvider: MongooseModuleAsyncOptions = {
    inject: [ConfigService],
    useFactory: (configService: ConfigService) => {
        const uri = configService.mongoUri;
        logger.log(`✅ Connecting to MongoDB at ${uri}`);
        return {
            uri,
            useNewUrlParser: true,
            useUnifiedTopology: true,
        };
    },
};

export const redisProvider = {
    provide: 'REDIS_CLIENT',
    inject: [ConfigService],
    useFactory: async (configService: ConfigService): Promise<RedisClientType> => {
        const client: RedisClientType = createClient({ url: configService.redisUri });
        client.on('error', (err) => logger.error('❌ Redis Error:', err));
        await client.connect();
        logger.log('✅ Redis Connected');
        return client;
    },
};
