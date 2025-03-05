import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
} from '@nestjs/websockets';
import { OnModuleInit } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import * as cookie from 'cookie';
import { ConfigService } from '../config/config.service';
import { SessionService } from '../session/session.service';
import { EventEmitter2 } from '@nestjs/event-emitter'; // <-- Import EventEmitter2

/**
 * @class ChannelsGateway
 * @description Handles WebSocket connections for channel messaging.
 * Authenticates clients via session cookies and lets them join Socket.IO rooms.
 */
@WebSocketGateway({
    namespace: '/channels',
    path: '/channels/socket.io',
    cors: {
        origin: '*', // For production, set this to trusted origins.
        credentials: true,
    },
})
export class ChannelsGateway implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(ChannelsGateway.name);
    private clients: Map<string, Socket> = new Map();

    constructor(
        private readonly configService: ConfigService,
        private readonly sessionService: SessionService,
        private readonly eventEmitter: EventEmitter2, // <-- Inject EventEmitter2
    ) {}

    onModuleInit() {
        // Subscribe to the message.sent event
        this.eventEmitter.on('message.sent', (message) => {
            if (message && message.channelId) {
                // Broadcast the message to the channel room.
                this.server.to(message.channelId).emit('messageReceived', message);
                this.logger.log(`Emitted message to channel ${message.channelId}`);
            }
        });
    }

    async handleConnection(client: Socket) {
        try {
            const cookies = cookie.parse(client.handshake.headers.cookie || '');
            const rawCookie = cookies['connect.sid'];
            if (!rawCookie) {
                this.logger.error('No session cookie found. Disconnecting client.');
                client.disconnect();
                return;
            }
            this.logger.log(`Client connected: rawCookie=${rawCookie}`);

            // Retrieve the session directly using the raw cookie.
            const session = await this.sessionService.getSessionFromRawCookie(rawCookie);
            if (!session || !session.userId) {
                this.logger.error('Unauthenticated session. Disconnecting client.');
                client.disconnect();
                return;
            }

            // Store the client by userId.
            this.clients.set(session.userId, client);
            this.logger.log(`Client connected: userId=${session.userId}`);
        } catch (error) {
            this.logger.error('Error during connection authentication:', error);
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        for (const [userId, socket] of this.clients.entries()) {
            if (socket.id === client.id) {
                this.clients.delete(userId);
                this.logger.log(`Client disconnected: userId=${userId}`);
                break;
            }
        }
    }

    /**
     * Allows a client to join a channel room.
     * @param client - The connected socket.
     * @param channelId - The channel identifier.
     * @returns The socket.
     */
    @SubscribeMessage('joinChannel')
    handleJoinChannel(client: Socket, channelId: string): Socket {
        client.join(channelId);
        this.logger.log(`Client ${client.id} joined channel ${channelId}`);
        return client;
    }

    /**
     * (Optional) If you want to process incoming 'sendMessage' events via WebSocket,
     * you can have this handler call MessageService, which will emit the event.
     * Otherwise, you can rely on your HTTP flow to trigger MessageService.sendMessage().
     */
    @SubscribeMessage('sendMessage')
    async handleSendMessage(client: Socket, payload: { channelId: string; senderId: string; content: string }): Promise<void> {
        const { channelId, senderId, content } = payload;
        if (!channelId || !senderId || !content) {
            client.emit('error', 'Missing required fields in message payload');
            return;
        }
        // In this minimal modification we simply log the receipt.
        // The actual broadcasting is triggered by the MessageService event emitter.
        this.logger.log(`Received sendMessage from ${senderId} for channel ${channelId}`);
    }
}
