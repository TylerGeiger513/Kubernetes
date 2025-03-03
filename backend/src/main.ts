import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { createSessionMiddleware } from './config/session.config';


async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    app.setGlobalPrefix(configService.apiPrefix);

    await app.listen(configService.port);

    app.use(createSessionMiddleware(configService as ConfigService));
    // use CORS using config
    app.enableCors({
        origin: configService.corsOrigin,
        sameSite: configService.cookieSameSite,
        credentials: true,
    });

    console.log(`🚀 Server running on http://localhost:${configService.port}`);
}
bootstrap();
