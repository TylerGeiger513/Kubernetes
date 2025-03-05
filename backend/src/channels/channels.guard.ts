import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { Logger } from '@nestjs/common';

const bypassedEndpoints: RegExp[] = [/\/channel\/getDMChannel/];

@Injectable()
export class ChannelsGuard implements CanActivate {
    constructor(
        private readonly channelsService: ChannelsService,
        private readonly logger: Logger,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const userId = request.session?.userId;
        const channelId = request.params?.channelId || request.body?.channelId;
        if (bypassedEndpoints.some(regex => regex.test(request.route.path)) && userId) {
            return true;
        }

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
