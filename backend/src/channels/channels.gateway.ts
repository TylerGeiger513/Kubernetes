import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';
import * as cookie from 'cookie';
import * as signature from 'cookie-signature';
import { ConfigService } from '../config/config.service';
import { SessionService } from '../session/session.service';

/**
 * @class ChannelsGateway
 * @description Handles WebSocket connections for channel messaging.
 * Authenticates clients via session cookies and lets them join Socket.IO rooms.
 */
@WebSocketGateway({
    namespace: '/channels',
    cors: {
        origin: '*', // For production, set this to trusted origins.
        credentials: true,
    },
})
export class ChannelsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(ChannelsGateway.name);
    private clients: Map<string, Socket> = new Map();

    constructor(
        private readonly configService: ConfigService,
        private readonly sessionService: SessionService,
    ) { }

    async handleConnection(client: Socket) {
        try {
            const cookies = cookie.parse(client.handshake.headers.cookie || '');
            const rawCookie = cookies['connect.sid'];
            if (!rawCookie) {
                this.logger.error('No session cookie found. Disconnecting client.');
                client.disconnect();
                return;
            }
            const unsigned = signature.unsign(rawCookie, this.configService.sessionSecret);
            if (!unsigned) {
                this.logger.error('Invalid session signature. Disconnecting client.');
                client.disconnect();
                return;
            }
            const session = await this.sessionService.getSession(unsigned);
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
     * Broadcasts an event to all clients in a given channel (room).
     * @param channelId - The room identifier.
     * @param event - The event name.
     * @param payload - The payload to send.
     */
    sendChannelEvent(channelId: string, event: string, payload: any): void {
        this.server.to(channelId).emit(event, payload);
        this.logger.log(`Event "${event}" sent to channel ${channelId}: ${JSON.stringify(payload)}`);
    }

    /**
     * Example message handler that echoes received messages.
     * Clients should provide a payload including channelId, senderId, and content.
     */
    @SubscribeMessage('sendMessage')
    async handleSendMessage(client: Socket, payload: any): Promise<void> {
        const { channelId, senderId, content } = payload;
        if (!channelId || !senderId || !content) {
            client.emit('error', 'Missing required fields in message payload');
            return;
        }
        // In a real implementation, you would validate that the sender is part of the channel.
        this.server.to(channelId).emit('messageReceived', { senderId, content });
        this.logger.log(`Message from ${senderId} broadcasted in channel ${channelId}: ${content}`);
    }
}
