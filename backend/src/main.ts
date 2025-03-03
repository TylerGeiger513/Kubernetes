import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ConfigService } from './config/config.service';
import { createSessionMiddleware } from './config/session.config';
import { Request, Response, NextFunction } from 'express';


async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // Global configuration service
    const configService = app.get(ConfigService);
    // Setup session middleware (Redis-backed, with secure serialization)
    app.use(createSessionMiddleware(configService));

    // Global prefix for API routes
    app.setGlobalPrefix(configService.apiPrefix);

    // Apply global middleware and filters
    const loggerMiddleware = new LoggerMiddleware();
    app.use((req: Request, res: Response, next: NextFunction) => loggerMiddleware.use(req, res, next));
    app.useGlobalFilters(new HttpExceptionFilter());

    // Enable CORS with secure options
    app.enableCors({
        origin: configService.corsOrigin,
        credentials: true,
    });

    await app.listen(configService.port);
    console.log(`🚀 Server running on http://localhost:${configService.port}`);
}
bootstrap();
