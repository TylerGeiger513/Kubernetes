import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { FriendRequestDto } from './dtos/friend-request.dto';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

/**
 * @class FriendsController
 * @description Exposes endpoints for managing friend relationships.
 */
@Controller('friends')
@UseGuards(AuthGuard)
export class FriendsController {
    constructor(private readonly friendsService: FriendsService) { }

    @Post('request')
    async sendFriendRequest(
        @CurrentUser() currentUserId: string,
        @Body() dto: FriendRequestDto,
    ): Promise<any> {
        await this.friendsService.sendFriendRequest(currentUserId, dto.target);
        return { message: 'Friend request sent.' };
    }

    @Post('accept')
    async acceptFriendRequest(
        @CurrentUser() currentUserId: string,
        @Body() dto: FriendRequestDto,
    ): Promise<any> {
        await this.friendsService.acceptFriendRequest(currentUserId, dto.target);
        return { message: 'Friend request accepted.' };
    }

    @Post('deny')
    async denyFriendRequest(
        @CurrentUser() currentUserId: string,
        @Body() dto: FriendRequestDto,
    ): Promise<any> {
        await this.friendsService.denyFriendRequest(currentUserId, dto.target);
        return { message: 'Friend request denied.' };
    }

    @Post('remove')
    async removeFriend(
        @CurrentUser() currentUserId: string,
        @Body() dto: FriendRequestDto,
    ): Promise<any> {
        await this.friendsService.removeFriend(currentUserId, dto.target);
        return { message: 'Friend removed.' };
    }

    @Post('cancel')
    async cancelFriendRequest(
        @CurrentUser() currentUserId: string,
        @Body() dto: FriendRequestDto,
    ): Promise<any> {
        await this.friendsService.cancelFriendRequest(currentUserId, dto.target);
        return { message: 'Friend request cancelled.' };
    }

    @Post('block')
    async blockUser(
        @CurrentUser() currentUserId: string,
        @Body() dto: FriendRequestDto,
    ): Promise<any> {
        await this.friendsService.blockUser(currentUserId, dto.target);
        return { message: 'User blocked.' };
    }

    @Post('unblock')
    async unblockUser(
        @CurrentUser() currentUserId: string,
        @Body() dto: FriendRequestDto,
    ): Promise<any> {
        await this.friendsService.unblockUser(currentUserId, dto.target);
        return { message: 'User unblocked.' };
    }
}
