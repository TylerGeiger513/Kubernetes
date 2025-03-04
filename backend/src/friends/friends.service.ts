import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { UserDocument } from '../users/users.schema';

@Injectable()
export class FriendsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Send a friend request from the current user to a target user.
   */
  async sendFriendRequest(currentUserId: string, friendId: string): Promise<void> {
    if (currentUserId === friendId) {
      throw new BadRequestException("Cannot send a friend request to yourself.");
    }

    const currentUser = await this.usersService.findById(currentUserId);
    const friend = await this.usersService.findById(friendId);
    if (!friend) {
      throw new NotFoundException("Friend user not found.");
    }
    if (!currentUser) {
      throw new NotFoundException("Current user not found.");
    }
    if (currentUser.friends.includes(friendId)) {
      throw new BadRequestException("You are already friends.");
    }
    if (friend.friendRequests.includes(currentUserId)) {
      throw new BadRequestException("Friend request already sent.");
    }
    if (friend.blockedUsers.includes(currentUserId) || currentUser.blockedUsers.includes(friendId)) {
      throw new BadRequestException("Cannot send friend request due to block status.");
    }

    // Add the friend request to the target user's friendRequests array
    friend.friendRequests.push(currentUserId);
    await friend.save();

    // Emit an event so that the Notifications module can notify the target user in real time.
    this.eventEmitter.emit('friend.request.sent', { from: currentUserId, to: friendId });
  }

  /**
   * Accept a friend request.
   */
  async acceptFriendRequest(currentUserId: string, friendId: string): Promise<void> {
    const currentUser = await this.usersService.findById(currentUserId);
    const friend = await this.usersService.findById(friendId);
    if (!friend) {
      throw new NotFoundException("Friend user not found.");
    }
    if (!currentUser || !currentUser.friendRequests.includes(friendId)) {
      throw new BadRequestException("No friend request from this user.");
    }

    // Remove the friend request and add each other as friends
    currentUser.friendRequests = currentUser.friendRequests.filter(id => id !== friendId);
    currentUser.friends.push(friendId);
    friend.friends.push(currentUserId);
    await currentUser.save();
    await friend.save();
  }

  /**
   * Reject a friend request.
   */
  async rejectFriendRequest(currentUserId: string, friendId: string): Promise<void> {
    const currentUser = await this.usersService.findById(currentUserId);
    if (!currentUser || !currentUser.friendRequests.includes(friendId)) {
      throw new BadRequestException("No friend request from this user.");
    }

    currentUser.friendRequests = currentUser.friendRequests.filter(id => id !== friendId);
    await currentUser.save();
  }

  /**
   * Remove a friend.
   */
  async removeFriend(currentUserId: string, friendId: string): Promise<void> {
    const currentUser = await this.usersService.findById(currentUserId);
    const friend = await this.usersService.findById(friendId);
    if (!friend) {
      throw new NotFoundException("Friend user not found.");
    }
    if (!currentUser || !currentUser.friends.includes(friendId)) {
      throw new BadRequestException("Not friends with this user.");
    }

    currentUser.friends = currentUser.friends.filter(id => id !== friendId);
    friend.friends = friend.friends.filter(id => id !== currentUserId);
    await currentUser.save();
    await friend.save();
  }

  /**
   * Block a user.
   */
  async blockUser(currentUserId: string, targetId: string): Promise<void> {
    if (currentUserId === targetId) {
      throw new BadRequestException("Cannot block yourself.");
    }
    const currentUser = await this.usersService.findById(currentUserId);
    const targetUser = await this.usersService.findById(targetId);
    if (!targetUser) {
      throw new NotFoundException("Target user not found.");
    }
    if (currentUser && currentUser.blockedUsers.includes(targetId)) {
      throw new BadRequestException("User is already blocked.");
    }
    
    // Remove any existing friend relationship or pending friend requests.
    if (!currentUser) {
      throw new BadRequestException("Current user not found.");
    }
    currentUser.friendRequests = currentUser.friendRequests.filter(id => id !== targetId);
    currentUser.friends = currentUser.friends.filter(id => id !== targetId);
    targetUser.friends = targetUser.friends.filter(id => id !== currentUserId);
    
    currentUser.blockedUsers.push(targetId);
    await currentUser.save();
    await targetUser.save();
  }

  /**
   * Unblock a user.
   */
  async unblockUser(currentUserId: string, targetId: string): Promise<void> {
    const currentUser = await this.usersService.findById(currentUserId);
    if (!currentUser || !currentUser.blockedUsers.includes(targetId)) {
      throw new BadRequestException("User is not blocked.");
    }
    currentUser.blockedUsers = currentUser.blockedUsers.filter(id => id !== targetId);
    await currentUser.save();
  }

  /**
   * Get the list of friends for the current user.
   */
  async getFriendsList(currentUserId: string): Promise<UserDocument[]> {
    const currentUser = await this.usersService.findById(currentUserId);
    if (!currentUser) {
      throw new NotFoundException("Current user not found.");
    }
    const friendIds = currentUser.friends;
    const friends = await Promise.all(friendIds.map(id => this.usersService.findById(id)));
    return friends.filter(f => !!f) as UserDocument[];
  }

  /**
   * Get incoming friend requests for the current user.
   */
  async getFriendRequests(currentUserId: string): Promise<UserDocument[]> {
    const currentUser = await this.usersService.findById(currentUserId);
    if (!currentUser) {
      throw new NotFoundException("Current user not found.");
    }
    const requestIds = currentUser.friendRequests;
    const requests = await Promise.all(requestIds.map(id => this.usersService.findById(id)));
    return requests.filter(r => !!r) as UserDocument[];
  }
}
