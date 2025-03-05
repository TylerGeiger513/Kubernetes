import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import { IMessage, Message } from './message.schema';

@Injectable()
export class MessageRepository {
    private readonly logger = new Logger(MessageRepository.name);

    constructor(@InjectModel(Message.name) private readonly messageModel: Model<IMessage & Document>) { }

    /**
     * Retrieves all messages in a channel, sorted by creation time.
     */
    async getMessages(channelId: string): Promise<IMessage[]> {
        // Check if at least one message exists for the channel (or optionally check for channel existence in another way)
        const messageExists = await this.messageModel.exists({ channelId });
        if (!messageExists) {
            throw new ForbiddenException('Channel not found.');
        }
        // Retrieve all messages, sort them by createdAt, and lean() them to get plain JS objects.
        const messages = await this.messageModel.find({ channelId }).sort({ createdAt: 1 }).lean().exec();
        return messages.map(m => ({ ...m, _id: m._id.toString() }));
    }

    /**
     * Creates (sends) a new message.
     */
    async sendMessage(dto: Partial<IMessage>): Promise<IMessage> {
        const created = new this.messageModel(dto);
        const saved = await created.save();
        const plain = saved.toObject();
        if (plain._id) {
            plain._id = plain._id.toString();
        }
        return plain;
    }

    /**
     * Edits an existing message.
     */
    async editMessage(messageId: string, content: string, userId: string): Promise<IMessage | null> {
        const message = await this.messageModel.findById(messageId).exec();
        if (!message) {
            return null;
        }
        if (userId !== message.senderId) {
            throw new Error('Unauthorized');
        }
        message.content = content;
        message.edited = true;
        await message.save();
        return message.toObject();
    }


    /**
     * Deletes a message.
     */
    async deleteMessage(messageId: string, userId: string): Promise<void> {
        const message = await this.messageModel.findById(messageId).exec();
        if (!message) {
            throw new Error('Message not found');
        }
        if (userId !== message.senderId) {
            throw new Error('Unauthorized');
        }
        await this.messageModel.findByIdAndDelete(messageId).exec();

    }
}
