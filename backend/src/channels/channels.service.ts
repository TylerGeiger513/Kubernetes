import { Injectable, Logger } from '@nestjs/common';
import { ChannelsRepository } from './channels.repository';
import { IChannel } from './channel.schema';

@Injectable()
export class ChannelsService {
    private readonly logger = new Logger(ChannelsService.name);

    constructor(private readonly channelsRepository: ChannelsRepository) { }

    /**
     * Retrieves all channels that a user participates in.
     */
    async getChannelsForUser(userId: string): Promise<IChannel[]> {
        return this.channelsRepository.findChannelsForUser(userId);
    }

    /**
     * Gets an existing DM channel between two users or creates one if none exists.
     */
    async getOrCreateDMChannel(userId1: string, userId2: string): Promise<IChannel> {
        const existing = await this.channelsRepository.findDMChannel(userId1, userId2);
        this.logger.log(`Found existing DM channel: ${existing}`);
        if (existing) {
            return existing;
        }
        this.logger.log(`Creating new DM channel between ${userId1} and ${userId2}.`);
        return this.channelsRepository.createChannel({
            type: 'DM',
            participants: [userId1, userId2],
        });
    }

    // /**
    //  * Creates a new group channel.
    //  * @param name - The channel name.
    //  * @param participants - Array of user IDs.
    //  * Later this will be implemented as a separate feature.
    //  */ 
    // async createGroupChannel(name: string, participants: string[]): Promise<IChannel> {
    //     return this.channelsRepository.createChannel({
    //         type: 'GROUP',
    //         name,
    //         participants,
    //     });
    // }

    /**
     * Retrieves a channel by its ID.
     */
    async getChannelById(channelId: string): Promise<IChannel | null> {
        return this.channelsRepository.findChannelById(channelId);
    }
}
