/**
 * @file session.service.ts
 * @description Provides methods to retrieve and manage session data directly.
 * This service is used to validate sessions outside of HTTP requests (e.g., WebSocket connections).
 */

import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ConfigService } from '../config/config.service';
import { EncryptionService } from '../encryption/encryption.service';

@Injectable()
export class SessionService {
    private readonly logger = new Logger(SessionService.name);

    constructor(
        private readonly databaseService: DatabaseService,
        private readonly configService: ConfigService,
        private readonly encryptionService: EncryptionService,
    ) { }

    /**
     * Retrieves a session from Redis using the provided session ID.
     * The session data is decrypted and parsed before being returned.
     * @param sessionId - The unsigned session ID from the request cookie.
     * @returns A promise resolving to the session object or null if not found.
     */
    async getSession(sessionId: string): Promise<any | null> {
        const redisKey = `session:${sessionId}`;
        const sessionData = await this.databaseService.redisClient.get(redisKey);
        if (!sessionData) {
            this.logger.warn(`No session data found for key ${redisKey}`);
            return null;
        }
        try {
            const decrypted = this.encryptionService.decrypt(sessionData);
            return JSON.parse(decrypted);
        } catch (err) {
            this.logger.error('Failed to decrypt or parse session data:', err);
            return null;
        }
    }


    /**
   * Destroys a session by removing it from Redis.
   * @param sessionId - The session identifier.
   * @returns A promise that resolves when the session is removed.
   */
    async destroySession(sessionId: string): Promise<void> {
        const redisKey = `session:${sessionId}`;
        try {
            await this.databaseService.redisClient.del(redisKey);
            this.logger.log(`Session ${sessionId} destroyed successfully.`);
        } catch (error) {
            this.logger.error(`Failed to destroy session ${sessionId}:`, error);
            throw error;
        }
    }



}
