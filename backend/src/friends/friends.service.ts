import { Injectable, BadRequestException, NotFoundException, Logger } from '@nestjs/common';
import { UsersRepository } from '../users/users.repository';
import { IUser } from '../users/users.schema';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class FriendsService {
    private readonly logger = new Logger(FriendsService.name);

    constructor(
        private readonly usersRepository: UsersRepository,
        private readonly notificationsService: NotificationsService,
    ) { }

    /**
     * Retrieves a user by any identifier.
     * @param identifier - A string that can be an id, email, or username.
     * @returns The user if found.
     * @throws NotFoundException if no user is found.
     */
    private async getUser(identifier: string): Promise<IUser> {
        const user = await this.usersRepository.findByIdentifier({
            id: identifier,
            email: identifier,
            username: identifier,
        });
        if (!user) {
            throw new NotFoundException(`User not found for identifier: ${identifier}`);
        }
        return user;
    }

    /**
     * Sends a friend request from the current user to a target user.
     * @param currentUserId - ID of the sender.
     * @param targetIdentifier - Identifier (id, email, or username) of the target.
     */
    async sendFriendRequest(currentUserId: string, targetIdentifier: string): Promise<void> {
        if (currentUserId === targetIdentifier) {
            throw new BadRequestException('Cannot send a friend request to yourself.');
        }

        const targetUser = await this.getUser(targetIdentifier);
        const currentUser = await this.getUser(currentUserId);

        // Check if they are already friends.
        if (currentUser.friends?.includes(targetUser._id as string)) {
            throw new BadRequestException('Already friends.');
        }
        // Check if request was already sent.
        if (targetUser.friendRequests?.includes(currentUserId)) {
            throw new BadRequestException('Friend request already sent.');
        }

        // Update target user's friendRequests.
        await this.usersRepository.updateUser(targetUser._id as string, {
            friendRequests: [...(targetUser.friendRequests || [] as string[]), currentUserId],
        });
        // Update current user's sentFriendRequests.
        await this.usersRepository.updateUser(currentUserId, {
            sentFriendRequests: [...(currentUser.sentFriendRequests || [] as string[]), targetUser._id as string],
        });

        // Notify the target user in real time.
        this.notificationsService.notifyFriendRequest(targetUser._id as string, currentUserId);
    }

    /**
     * Accepts a friend request.
     * @param currentUserId - ID of the user accepting the request.
     * @param requesterIdentifier - Identifier of the user who sent the request.
     */
    async acceptFriendRequest(currentUserId: string, requesterIdentifier: string): Promise<void> {
        const currentUser = await this.getUser(currentUserId);
        const requesterUser = await this.getUser(requesterIdentifier);

        if (!currentUser.friendRequests?.includes(requesterUser._id as string)) {
            throw new BadRequestException('No friend request from this user.');
        }

        const updatedCurrentRequests = currentUser.friendRequests.filter(id => id !== requesterUser._id);
        const updatedRequesterSent = requesterUser.sentFriendRequests?.filter(id => id !== currentUserId) || [];
        const updatedCurrentFriends = [...(currentUser.friends || []), requesterUser._id as string];
        const updatedRequesterFriends = [...(requesterUser.friends || []), currentUserId];

        await this.usersRepository.updateUser(currentUserId, {
            friendRequests: updatedCurrentRequests,
            friends: updatedCurrentFriends,
        });
        await this.usersRepository.updateUser(requesterUser._id as string, {
            sentFriendRequests: updatedRequesterSent,
            friends: updatedRequesterFriends,
        });

        // Notify the requester that their friend request has been accepted.
        this.notificationsService.notifyFriendRequestAccepted(requesterUser._id as string, currentUserId);
    }

    /**
     * Denies a friend request.
     * @param currentUserId - ID of the user denying the request.
     * @param requesterIdentifier - Identifier of the user who sent the request.
     */
    async denyFriendRequest(currentUserId: string, requesterIdentifier: string): Promise<void> {
        const currentUser = await this.getUser(currentUserId);
        if (!currentUser.friendRequests || !currentUser.friendRequests.includes(requesterIdentifier)) {
            throw new BadRequestException('No friend request from this user.');
        }
        const updatedRequests = currentUser.friendRequests.filter(id => id !== requesterIdentifier);
        await this.usersRepository.updateUser(currentUserId, { friendRequests: updatedRequests });
    }

    /**
     * Removes a friend.
     * @param currentUserId - ID of the current user.
     * @param friendIdentifier - Identifier of the friend to remove.
     */
    async removeFriend(currentUserId: string, friendIdentifier: string): Promise<void> {
        const currentUser = await this.getUser(currentUserId);
        const friendUser = await this.getUser(friendIdentifier);
        if (!currentUser.friends || !currentUser.friends.includes(friendUser._id as string)) {
            throw new BadRequestException('Not friends with this user.');
        }
        const updatedCurrentFriends = currentUser.friends.filter(id => id !== friendUser._id);
        const updatedFriendFriends = friendUser.friends ? friendUser.friends.filter(id => id !== currentUserId) : [];
        await this.usersRepository.updateUser(currentUserId, { friends: updatedCurrentFriends });
        await this.usersRepository.updateUser(friendUser._id as string, { friends: updatedFriendFriends });
    }

    /**
     * Cancels a sent friend request.
     * @param currentUserId - ID of the sender.
     * @param targetIdentifier - Identifier of the target user.
     */
    async cancelFriendRequest(currentUserId: string, targetIdentifier: string): Promise<void> {
        const currentUser = await this.getUser(currentUserId);
        const targetUser = await this.getUser(targetIdentifier);
        const updatedSent = currentUser.sentFriendRequests?.filter(id => id !== targetUser._id) || [];
        const updatedTargetRequests = targetUser.friendRequests?.filter(id => id !== currentUserId) || [];
        await this.usersRepository.updateUser(currentUserId, { sentFriendRequests: updatedSent });
        await this.usersRepository.updateUser(targetUser._id as string, { friendRequests: updatedTargetRequests });
    }

    /**
     * Blocks a user.
     * @param currentUserId - ID of the current user.
     * @param targetIdentifier - Identifier of the user to block.
     */
    async blockUser(currentUserId: string, targetIdentifier: string): Promise<void> {
        const currentUser = await this.getUser(currentUserId);
        const targetUser = await this.getUser(targetIdentifier);
        if (currentUser.blockedUsers?.includes(targetUser._id as string)) {
            throw new BadRequestException('User is already blocked.');
        }
        const updatedFriends = (currentUser.friends || []).filter(id => id !== targetUser._id);
        const updatedFriendRequests = (currentUser.friendRequests || []).filter(id => id !== targetUser._id);
        const updatedSentRequests = (currentUser.sentFriendRequests || []).filter(id => id !== targetUser._id);
        await this.usersRepository.updateUser(currentUserId, {
            friends: updatedFriends,
            friendRequests: updatedFriendRequests,
            sentFriendRequests: updatedSentRequests,
            blockedUsers: [...(currentUser.blockedUsers || [] as string[]), targetUser._id as string],
        });
    }

    /**
     * Unblocks a user.
     * @param currentUserId - ID of the current user.
     * @param targetIdentifier - Identifier of the user to unblock.
     */
    async unblockUser(currentUserId: string, targetIdentifier: string): Promise<void> {
        const currentUser = await this.getUser(currentUserId);
        if (!currentUser.blockedUsers || !currentUser.blockedUsers.includes(targetIdentifier)) {
            throw new BadRequestException('User is not blocked.');
        }
        const updatedBlocked = currentUser.blockedUsers.filter(id => id !== targetIdentifier);
        await this.usersRepository.updateUser(currentUserId, { blockedUsers: updatedBlocked });
    }
}
