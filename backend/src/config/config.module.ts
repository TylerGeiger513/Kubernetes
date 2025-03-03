import { Module } from '@nestjs/common';
import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { envValidationSchema } from './env.validation';
import { ConfigService } from './config.service';

@Module({
    imports: [
        NestConfigModule.forRoot({
            isGlobal: true,
            validationSchema: envValidationSchema,
            envFilePath: '.env',
        }),
    ],
    providers: [ConfigService],
    exports: [ConfigService],
})
export class ConfigModule { }
