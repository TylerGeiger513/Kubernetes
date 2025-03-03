import { Global, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { databaseProviders } from './database.service';

@Global()
@Module({
  imports: [
    ConfigModule, 
    MongooseModule.forRootAsync({
      imports: [ConfigModule], 
      inject: [ConfigService], 
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),
  ],
  providers: [databaseProviders.redisClient],
  exports: [databaseProviders.redisClient],
})
export class DatabaseModule {}
