import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as cookie from 'cookie';
import * as signature from 'cookie-signature';
import { ConfigService } from '../config/config.service';
import { SessionService } from '../session/session.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway({
    namespace: '/api/notifications',
    path: '/api/notifications/socket.io',
    cors: { origin: 'http://localhost', credentials: true },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server!: Server;
    private readonly logger = new Logger(NotificationsGateway.name);

    // Map to track connected clients by user ID.
    private connectedClients: Map<string, Socket> = new Map();

    constructor(
        private readonly configService: ConfigService,
        private readonly sessionService: SessionService,
    ) { }

    async handleConnection(client: Socket) {
        try {
            this.logger.log('Client connected with ID: ' + client.id, client.handshake.headers.cookie);

            // Parse cookies from the handshake headers.
            const cookies = cookie.parse(client.handshake.headers.cookie || '');
            const rawCookie = cookies['connect.sid']; // Adjust if your cookie name is different.
            if (!rawCookie) {
                this.logger.error('No session cookie found.');
                client.disconnect();
                return;
            }

            // URL-decode the cookie value.
            const decodedCookie = decodeURIComponent(rawCookie);
            this.logger.log(`Decoded cookie: ${decodedCookie}`);

            // Unsign the decoded cookie using the session secret.
            const encryptedPayload = signature.unsign(decodedCookie, this.configService.sessionSecret);
            if (!encryptedPayload) {
                this.logger.error('Invalid session cookie. Check if your session secret matches.');
                client.disconnect();
                return;
            }

            // Retrieve and validate the session using the SessionService.
            const session = await this.sessionService.getSession(encryptedPayload);
            if (!session || !session.userId) {
                this.logger.error('Unauthenticated session.');
                client.disconnect();
                return;
            }

            // Store the connection using the authenticated userId.
            this.connectedClients.set(session.userId, client);
            this.logger.log(`Client connected with userId: ${session.userId}`);
            console.log(`Client connected with userId: ${session.userId}`);
        } catch (error) {
            console.error('Error during WebSocket authentication:', error);
            client.disconnect();
        }
    }


    handleDisconnect(client: Socket) {
        // Remove the client from the connectedClients map.
        this.connectedClients.forEach((socket, userId) => {
            if (socket.id === client.id) {
                this.connectedClients.delete(userId);
                this.logger.log(`Client disconnected with userId: ${userId}`);
            }
        });
    }

    /**
     * Sends a friend request notification to a specific user.
     * @param targetUserId The ID of the user to notify.
     * @param payload The payload to send.
     */
    sendFriendRequestNotification(targetUserId: string, payload: any) {
        this.logger.log(`Attempting to send friend request notification to: ${targetUserId}`);
        const client = this.connectedClients.get(targetUserId);
        if (client) {
            this.logger.log(`Sending friend request notification to: ${targetUserId} with payload: ${JSON.stringify(payload)}`);
            client.emit('friendRequest', payload);
        }
    }
}
