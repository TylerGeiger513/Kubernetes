import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
    NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
    PORT: Joi.number().default(3000),
    API_PREFIX: Joi.string().default('api'),
    CORS_ORIGIN: Joi.string().default('*'),
    MONGO_URI: Joi.string().required(),
    REDIS_URI: Joi.string().required(),
    SESSION_SECRET: Joi.string().default('default-session-secret'),
    ENCRYPTION_KEY: Joi.string().default('supersecret'),
    COOKIE_SECURE: Joi.boolean().default(false),
    // Add other variables as needed
});
