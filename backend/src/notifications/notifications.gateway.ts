import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as cookie from 'cookie';
import * as signature from 'cookie-signature';
import { ConfigService } from '../config/config.service';
import { SessionService } from '../session/session.service';
import { Logger } from '@nestjs/common';

/**
 * @class NotificationsGateway
 * @description Handles WebSocket connections and dispatches notifications.
 * Uses session-based authentication to map clients to user IDs.
 */
@WebSocketGateway({
    namespace: '/notifications',
    cors: {
        origin: '*', // Update this as needed for security.
        credentials: true,
    },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(NotificationsGateway.name);
    // Map to store connected client sockets by user ID.
    private clients: Map<string, Socket> = new Map();

    constructor(
        private readonly configService: ConfigService,
        private readonly sessionService: SessionService,
    ) { }

    async handleConnection(client: Socket) {
        try {
            // Extract cookies from handshake headers.
            const cookies = cookie.parse(client.handshake.headers.cookie || '');
            const rawCookie = cookies['connect.sid'];
            if (!rawCookie) {
                this.logger.error('No session cookie found. Disconnecting client.');
                client.disconnect();
                return;
            }
            // Unsign cookie using session secret.
            const unsigned = signature.unsign(rawCookie, this.configService.sessionSecret);
            if (!unsigned) {
                this.logger.error('Invalid session signature. Disconnecting client.');
                client.disconnect();
                return;
            }
            // Retrieve session data using SessionService.
            const session = { userId: 'test' }
            if (!session || !session.userId) {
                this.logger.error('Unauthenticated session. Disconnecting client.');
                client.disconnect();
                return;
            }
            // Map the socket by userId.
            this.clients.set(session.userId, client);
            this.logger.log(`Client connected: userId=${session.userId}`);
        } catch (error) {
            this.logger.error('Error during connection authentication:', error);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        // Remove the disconnected client from the map.
        for (const [userId, socket] of this.clients.entries()) {
            if (socket.id === client.id) {
                this.clients.delete(userId);
                this.logger.log(`Client disconnected: userId=${userId}`);
                break;
            }
        }
    }

    /**
     * Sends a notification to a specific user.
     * @param userId - The target user ID.
     * @param payload - The notification payload.
     */
    sendNotification(userId: string, payload: any): void {
        const client = this.clients.get(userId);
        if (client) {
            client.emit('notification', payload);
            this.logger.log(`Notification sent to user ${userId}: ${JSON.stringify(payload)}`);
        } else {
            this.logger.warn(`Attempted to notify user ${userId}, but they are not connected.`);
        }
    }

    // Example of a handler for an incoming event (if needed).
    @SubscribeMessage('ping')
    handlePing(client: Socket, payload: any): void {
        client.emit('pong', payload);
    }
}
