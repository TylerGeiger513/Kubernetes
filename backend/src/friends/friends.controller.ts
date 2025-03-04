// src/friends/friends.controller.ts
import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { FriendsService } from './friends.service';
import { AuthGuard } from '../auth/auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';
import { FriendRequestDto } from './dtos/friend-request.dto';

@Controller('friends')
@UseGuards(AuthGuard)
export class FriendsController {
  constructor(private readonly friendsService: FriendsService) {}

  /**
   * Send a friend request.
   * Body: { friendId: string }
   */
  @Post('add')
  async sendFriendRequest(
    @CurrentUser() currentUserId: string,
    @Body() friendRequestDto: FriendRequestDto,
  ) {
    await this.friendsService.sendFriendRequest(currentUserId, friendRequestDto.friendId);
    return { message: 'Friend request sent.' };
  }

  /**
   * Accept a friend request.
   * Body: { friendId: string }
   */
  @Post('accept')
  async acceptFriendRequest(
    @CurrentUser() currentUserId: string,
    @Body() friendRequestDto: FriendRequestDto,
  ) {
    await this.friendsService.acceptFriendRequest(currentUserId, friendRequestDto.friendId);
    return { message: 'Friend request accepted.' };
  }

  /**
   * Reject a friend request.
   * Body: { friendId: string }
   */
  @Post('reject')
  async rejectFriendRequest(
    @CurrentUser() currentUserId: string,
    @Body() friendRequestDto: FriendRequestDto,
  ) {
    await this.friendsService.rejectFriendRequest(currentUserId, friendRequestDto.friendId);
    return { message: 'Friend request rejected.' };
  }

  /**
   * Remove a friend.
   * Body: { friendId: string }
   */
  @Post('remove')
  async removeFriend(
    @CurrentUser() currentUserId: string,
    @Body() friendRequestDto: FriendRequestDto,
  ) {
    await this.friendsService.removeFriend(currentUserId, friendRequestDto.friendId);
    return { message: 'Friend removed.' };
  }

  /**
   * Block a user.
   * Body: { friendId: string }
   */
  @Post('block')
  async blockUser(
    @CurrentUser() currentUserId: string,
    @Body() friendRequestDto: FriendRequestDto,
  ) {
    await this.friendsService.blockUser(currentUserId, friendRequestDto.friendId);
    return { message: 'User blocked.' };
  }

  /**
   * Unblock a user.
   * Body: { friendId: string }
   */
  @Post('unblock')
  async unblockUser(
    @CurrentUser() currentUserId: string,
    @Body() friendRequestDto: FriendRequestDto,
  ) {
    await this.friendsService.unblockUser(currentUserId, friendRequestDto.friendId);
    return { message: 'User unblocked.' };
  }

  /**
   * Get the current user's friend list.
   */
  @Get('list')
  async getFriends(@CurrentUser() currentUserId: string) {
    const friends = await this.friendsService.getFriendsList(currentUserId);
    return { friends };
  }

  /**
   * Get incoming friend requests.
   */
  @Get('requests')
  async getFriendRequests(@CurrentUser() currentUserId: string) {
    const requests = await this.friendsService.getFriendRequests(currentUserId);
    return { requests };
  }
}
