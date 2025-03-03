import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

// Checks if the redis and mongo connections are healthy.

@Injectable()
export class HealthService {
    constructor(private readonly databaseService: DatabaseService) { }

    // New method to check database connections
    async checkDatabaseHealth(): Promise<{ redis: string; mongo: string }> {
        const redis = await this.databaseService.pingRedis();
        await this.databaseService.mongoHealthCheck();
        return { redis, mongo: 'healthy' };
    }
}

