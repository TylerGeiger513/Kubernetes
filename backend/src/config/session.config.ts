import * as session from 'express-session';
import { createClient } from 'redis';
import { RedisStore }  from 'connect-redis';
import { ConfigService } from '@nestjs/config';

export function createSessionMiddleware(configService: ConfigService) {
  const redisUrl = configService.get<string>('REDIS_URI');
  const redisClient = createClient({
    url: redisUrl,
    socket: {
      reconnectStrategy: (retries) => Math.min(retries * 50, 1000), // Auto-reconnect strategy
    },
  });

  redisClient.on('connect', () => console.log('✅ Redis session store connected'));
  redisClient.on('error', (err) => console.error('❌ Redis session store error:', err));

  // Ensure Redis is connected before initializing session store
  redisClient.connect().catch((err) => console.error('❌ Failed to connect to Redis:', err));

  return session({
    store: new RedisStore({
      client: redisClient,
      prefix: 'session:', // Optional prefix for keys
      ttl: 86400, // 1 day
      disableTouch: false, // Ensures session TTL updates on every request
    }),
    secret: configService.get<string>('SESSION_SECRET') || 'default_secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: configService.get<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    },
  });
}
