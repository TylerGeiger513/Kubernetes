import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { HealthModule } from './health/health.module';
import { FriendsModule } from './friends/friends.module';
import { UsersModule } from './users/users.module';
import { SessionModule } from './session/session.module';
import { NotificationsModule } from './notifications/notifications.module';

@Module({
  imports: [
    EventEmitterModule.forRoot(), // Enables event-driven architecture (for notifications, etc.)
    ConfigModule,
    DatabaseModule,
    AuthModule,
    HealthModule,
    FriendsModule,
    UsersModule,
    SessionModule,
    NotificationsModule,
  ],
})
export class AppModule {}
