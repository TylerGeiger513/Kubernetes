import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

/**
 * @interface IMessage
 * @description Represents a message within a channel.
 */
export interface IMessage {
    _id?: string;
    channelId: string;
    senderId: string;
    content: string;
    edited?: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

/**
 * @class Message
 * @description Mongoose schema for messages.
 */
@Schema({ timestamps: true })
export class Message implements IMessage {
    @Prop({ required: true })
    channelId!: string;

    @Prop({ required: true })
    senderId!: string;

    @Prop({ required: true })
    content!: string;

    @Prop({ default: false })
    edited?: boolean;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
