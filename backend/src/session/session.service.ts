import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { ConfigService } from '../config/config.service';
import * as crypto from 'crypto';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

function getKey(secretKey: string): Buffer {
  return crypto.createHash('sha256').update(secretKey).digest();
}

function decrypt(text: string, secretKey: string): string {
  const key = getKey(secretKey);
  const parts = text.split(':');
  if (parts.length !== 2) {
    throw new Error('Invalid encrypted text format.');
  }
  const iv = Buffer.from(parts[0], 'hex');
  const encryptedText = parts[1];
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

@Injectable()
export class SessionService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Retrieves and decrypts a session from Redis.
   * @param sessionId The session ID (unsinged) extracted from the cookie.
   */
  async getSession(sessionId: string): Promise<any | null> {
    const redisKey = `session:${sessionId}`;
    const sessionData = await this.databaseService.redisClient.get(redisKey);
    if (!sessionData) {
      return null;
    }
    try {
      const decrypted = decrypt(sessionData, this.configService.encryptionKey);
      return JSON.parse(decrypted);
    } catch (err) {
      console.error('Failed to decrypt or parse session data:', err);
      return null;
    }
  }
}
