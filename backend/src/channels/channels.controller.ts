import { Controller, Get, Post, Body, UseGuards, Req, ForbiddenException, BadRequestException } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { MessageService } from './message.service';
import { ChannelsGuard } from './channels.guard';
import { Request } from 'express';
import { CreateMessageDto } from './dtos/create-message.dto';

interface SessionRequest extends Request {
    session: {
        userId?: string;
    };
}

/**
 * @class ChannelsController
 * @description Exposes HTTP endpoints for channel and message operations.
 * Endpoints are guarded to ensure that only channel participants can interact.
 * In addition to guard validation, the controller verifies that session data exists.
 */
@Controller('channels')
export class ChannelsController {
    constructor(
        private readonly channelsService: ChannelsService,
        private readonly messageService: MessageService,
    ) { }

    /**
     * Retrieves all channels for the authenticated user.
     * @param req - Express request containing session data.
     */
    @Get()
    @UseGuards(ChannelsGuard)
    async getChannels(@Req() req: SessionRequest) {
        if (!req.session || !req.session.userId) {
            throw new ForbiddenException('User not authenticated.');
        }
        return this.channelsService.getChannelsForUser(req.session.userId);
    }

    /**
     * Sends a message in a channel.
     * @param dto - Data for creating a message.
     * @param req - Express request containing session data.
     */
    @Post('message')
    @UseGuards(ChannelsGuard)
    async sendMessage(@Body() dto: CreateMessageDto, @Req() req: SessionRequest) {
        if (!req.session || !req.session.userId) {
            throw new ForbiddenException('User not authenticated.');
        }
        if (!dto.content || dto.content.trim() === '') {
            throw new BadRequestException('Message content is required.');
        }
        // Expect channelId to be provided as part of the DTO (or modify accordingly).
        if (!dto['channelId']) {
            throw new BadRequestException('Channel identifier is required.');
        }
        const senderId = req.session.userId;
        return this.messageService.sendMessage({ ...dto, senderId });
    }

    /**
     * Retrieves messages for a channel.
     * @param req - Express request containing session data and channelId in params.
     * @returns Array of messages.
     */
    @Get(':channelId/messages')
    @UseGuards(ChannelsGuard)
    async getMessages(@Req() req: SessionRequest) {
        const channelId = req.params.channelId;
        if (!channelId) {
            throw new BadRequestException('Channel identifier is required.');
        }
        // Validate channel existence before proceeding.
        const channel = await this.channelsService.getChannelById(channelId);
        if (!channel) {
            throw new ForbiddenException('Channel not found.');
        }
        return this.messageService.getMessages(channelId);
    }


    /**
     * Edits an existing message and validates that the user is the sender.
     * @param req - Express request containing session data and messageId in params.
     * @param content - The new message content.
     */
    @Post('message/:messageId/edit')
    @UseGuards(ChannelsGuard)
    async editMessage(@Body('content') content: string, @Req() req: SessionRequest) {
        const messageId = req.params.messageId;
        if (!content || content.trim() === '') {
            throw new BadRequestException('Content is required.');
        }
        if (!messageId) {
            throw new BadRequestException('Message identifier is required.');
        }
        if (!req.session || !req.session.userId) {
            throw new ForbiddenException('User not authenticated.');
        }
        return this.messageService.editMessage(messageId, content, req.session.userId);
    }

    /**
     * Deletes a message.
     * @param req - Express request containing session data and messageId in params.
     * @returns Success message.
     */
    @Post('message/:messageId/delete')
    @UseGuards(ChannelsGuard)
    async deleteMessage(@Req() req: SessionRequest) {
        const messageId = req.params.messageId;
        if (!messageId) {
            throw new BadRequestException('Message identifier is required.');
        }
        if (!req.session || !req.session.userId) {
            throw new ForbiddenException('User not authenticated.');
        }
        return this.messageService.deleteMessage(messageId, req.session.userId);
    }
}
