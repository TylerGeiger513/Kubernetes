import { Module, Global } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '../config/config.module';
import { ConfigService } from '../config/config.service';
import { mongoProvider, redisProvider } from './database.providers';
import { DatabaseService } from './database.service';

@Global()
@Module({
    imports: [
        ConfigModule,
        MongooseModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: mongoProvider.useFactory,
        }),
    ],
    providers: [redisProvider, DatabaseService],
    exports: [redisProvider, MongooseModule, DatabaseService],
})
export class DatabaseModule { }
