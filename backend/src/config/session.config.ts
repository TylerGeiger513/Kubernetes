import * as session from 'express-session';
import { createClient } from 'redis';
import { RedisStore } from 'connect-redis';
import * as crypto from 'crypto';
import { ConfigService } from './config.service';
import { config } from 'dotenv';

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

function getKey(secretKey: string): Buffer {
    return crypto.createHash('sha256').update(secretKey).digest();
}

function encrypt(text: string, secretKey: string): string {
    const key = getKey(secretKey);
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return iv.toString('hex') + ':' + encrypted;
}

function decrypt(text: string, secretKey: string): string {
    const key = getKey(secretKey);
    const parts = text.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedText = parts[1];
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

export function createSessionMiddleware(configService: ConfigService) {
    const SECRET_KEY = configService.encryptionKey;
    const redisUrl = configService.redisUri;

    const redisClient = createClient({
        url: redisUrl,
        socket: {
            reconnectStrategy: (retries) => Math.min(retries * 50, 1000),
        },
    });

    redisClient.on('connect', () => console.log('✅ Redis session store connected'));
    redisClient.on('error', (err) => console.error('❌ Redis session store error:', err));
    redisClient.connect().catch((err) => console.error('❌ Failed to connect to Redis:', err));

    const store = new RedisStore({
        client: redisClient,
        prefix: 'session:',
        ttl: 86400, // 1 day in seconds
        serializer: {
            parse: (s: string) => {
                const decrypted = decrypt(s, SECRET_KEY);
                return JSON.parse(decrypted);
            },
            stringify: (s: any) => {
                const stringified = JSON.stringify(s);
                return encrypt(stringified, SECRET_KEY);
            },
        },
    });

    return session({
        store,
        secret: configService.sessionSecret,
        resave: false,
        saveUninitialized: false,
        cookie: {
            httpOnly: true,
            secure: configService.cookieSecure,
            sameSite: 'strict',
            maxAge: 24 * 60 * 60 * 1000, // 1 day
        },
    });
}
