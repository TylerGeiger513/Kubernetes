import { Injectable} from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { NotificationsGateway } from './notifications.gateway';
import { Logger } from '@nestjs/common';

@Injectable()
export class NotificationsService {
    private readonly logger = new Logger(NotificationsService.name);
    constructor(private readonly notificationsGateway: NotificationsGateway) { }

    /**
     * Listens for the 'friend.request.sent' event and notifies the target user.
     */
    @OnEvent('friend.request.sent')
    handleFriendRequestNotification(payload: { from: string; to: string }) {
        this.logger.log(`Sending friend request notification to ${payload.to}`);
        this.notificationsGateway.sendFriendRequestNotification(payload.to, {
            type: 'FRIEND_REQUEST',
            from: payload.from,
            message: 'You have a new friend request.',
        });
    }
}
