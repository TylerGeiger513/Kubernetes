import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Channel, ChannelSchema } from './channel.schema';
import { Message, MessageSchema } from './message.schema';
import { ChannelsRepository } from './channels.repository';
import { ChannelsService } from './channels.service';
import { MessageRepository } from './message.repository';
import { MessageService } from './message.service';
import { ChannelsGateway } from './channels.gateway';
import { ChannelsController } from './channels.controller';
import { ChannelsGuard } from './channels.guard';
import { ConfigModule } from '../config/config.module';
import { SessionModule } from '../session/session.module';

@Module({
  imports: [
    ConfigModule,
    SessionModule,
    MongooseModule.forFeature([{ name: Channel.name, schema: ChannelSchema }]),
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
  ],
  providers: [
    ChannelsRepository,
    ChannelsService,
    MessageRepository,
    MessageService,
    ChannelsGateway,
    ChannelsGuard,
  ],
  controllers: [ChannelsController],
  exports: [
    ChannelsService,
    MessageService,
    ChannelsGateway,
  ],
})
export class ChannelsModule {}
