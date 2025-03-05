/**
 * @file session.middleware.ts
 * @description This middleware intercepts incoming HTTP requests, extracts the session token (cookie or JWT),
 * decrypts it using the EncryptionService, and attaches the resulting session data to the request object.
 * This abstraction ensures that session management is pluggable and can easily switch between mechanisms.
 */

import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { EncryptionService } from '../encryption/encryption.service';
import { ConfigService } from '../config/config.service';
import { DatabaseService } from '../database/database.service';
import * as session from 'express-session';
import { RedisStore } from 'connect-redis';
import { createClient } from 'redis';

@Injectable()
export class SessionMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SessionMiddleware.name);
  private sessionMiddleware: any;

  constructor(
    private readonly configService: ConfigService,
    private readonly encryptionService: EncryptionService,
    private readonly databaseService: DatabaseService,
  ) {
    // Create a Redis client for session storage.
    const redisClient = createClient({
      url: this.configService.redisUri,
      socket: { reconnectStrategy: (retries) => Math.min(retries * 50, 1000) },
    });

    redisClient.on('connect', () =>
      this.logger.log('✅ Redis session store connected'),
    );
    redisClient.on('error', (err) =>
      this.logger.error('❌ Redis session store error:', err),
    );
    redisClient.connect().catch((err) =>
      this.logger.error('❌ Failed to connect to Redis:', err),
    );

    // Create a RedisStore that uses the EncryptionService to secure session data.
    const store = new RedisStore({
      client: redisClient,
      prefix: 'session:',
      ttl: 86400, // 1 day TTL
      serializer: {
        parse: (data: string) => {
          const decrypted = this.encryptionService.decrypt(data);
          return JSON.parse(decrypted);
        },
        stringify: (data: any) => {
          const stringified = JSON.stringify(data);
          return this.encryptionService.encrypt(stringified);
        },
      },
    });

    // Initialize the express-session middleware.
    this.sessionMiddleware = session({
      store,
      secret: this.configService.sessionSecret,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: this.configService.cookieSecure,
        sameSite: 'strict',
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      },
    });
  }

  /**
   * Executes the session middleware to attach the session to the request.
   * @param req - Express Request object.
   * @param res - Express Response object.
   * @param next - Function to call the next middleware.
   */
  use(req: Request, res: Response, next: NextFunction): void {
    // Ensure req.url is defined
    if (!req.url) {
      req.url = '/';
    }
    // Safely assign _parsedUrl if not already defined
    if (!(req as any)._parsedUrl) {
      (req as any)._parsedUrl = { pathname: req.url };
    }
    this.sessionMiddleware(req, res, next);
  }
}
