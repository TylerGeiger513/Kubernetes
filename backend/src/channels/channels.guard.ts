import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ChannelsService } from './channels.service';

/**
 * @class ChannelsGuard
 * @description Guards channel endpoints by ensuring that the authenticated user is a participant of the channel.
 */
@Injectable()
export class ChannelsGuard implements CanActivate {
    constructor(private readonly channelsService: ChannelsService) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const userId = request.session?.userId;
        const channelId = request.params?.channelId || request.body?.channelId;

        if (!userId || !channelId) {
            throw new ForbiddenException('Missing authentication or channel identifier.');
        }

        const channel = await this.channelsService.getChannelById(channelId);
        if (!channel) {
            throw new ForbiddenException('Channel not found.');
        }
        if (!channel.participants.includes(userId)) {
            throw new ForbiddenException('You are not a participant of this channel.');
        }
        return true;
    }
}
