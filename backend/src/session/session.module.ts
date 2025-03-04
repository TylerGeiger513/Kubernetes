import { Module } from '@nestjs/common';
import { SessionService } from './session.service';
import { ConfigModule } from '../config/config.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [ConfigModule, DatabaseModule],
  providers: [SessionService],
  exports: [SessionService],
})
export class SessionModule {}
