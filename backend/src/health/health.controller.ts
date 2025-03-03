import { Controller, Get, Inject } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { Redis } from 'ioredis';

@Controller('health')
export class HealthController {
  constructor(
    @InjectConnection() private readonly mongoConnection: Connection,
    @Inject('REDIS_CLIENT') private readonly redisClient: Redis,
  ) {}

  @Get()
  async checkHealth() {
    const mongoStatus = this.mongoConnection.readyState === 1 ? 'Connected' : 'Disconnected';

    try {
      await this.redisClient.ping();
      return {
        status: 'OK',
        mongo: mongoStatus,
        redis: 'Connected',
      };
    } catch (error) {
      return {
        status: 'ERROR',
        mongo: mongoStatus,
        redis: 'Disconnected',
      };
    }
  }
}
