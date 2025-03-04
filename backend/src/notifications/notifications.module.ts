import { Module } from '@nestjs/common';
import { ConfigModule } from '../config/config.module';
import { SessionModule } from '../session/session.module';
import { NotificationsGateway } from './notifications.gateway';
import { NotificationsService } from './notifications.service';

@Module({
  imports: [ConfigModule, SessionModule], // Import the module that exports ConfigService
  providers: [NotificationsGateway, NotificationsService],
  exports: [NotificationsService],
})
export class NotificationsModule {}
