import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { IUser, User, UserDocument } from './users.schema';

/**
 * @interface IUsersRepository
 * @description Defines the contract for user data access.
 */
export interface IUsersRepository {
    createUser(email: string, username: string, hashedPassword: string, campus: string): Promise<IUser>;
    findByEmail(email: string): Promise<IUser | null>;
    findByIdentifier(identifier: { id?: string; email?: string; username?: string }): Promise<IUser | null>;
    updateUser(userId: string, update: Partial<IUser>): Promise<IUser>;
}

/**
 * @class UsersRepository
 * @description Implements IUsersRepository using Mongoose with lean queries.
 */
@Injectable()
export class UsersRepository implements IUsersRepository {
    private readonly logger = new Logger(UsersRepository.name);

    constructor(
        @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    ) { }

    /**
     * Creates a new user.
     * @param email - User's email.
     * @param username - User's username.
     * @param hashedPassword - User's hashed password.
     * @param campus - User's campus.
     * @returns The created user as a plain object.
     */
    async createUser(email: string, username: string, hashedPassword: string, campus: string): Promise<IUser> {
        this.logger.log(`Creating user: ${email}`);
        const createdUser = new this.userModel({ email, username, password: hashedPassword, campus });
        // Save and convert to plain object with lean.
        const savedUser = await createdUser.save();
        const plainUser = savedUser.toObject() as IUser;
        if (plainUser._id) {
            plainUser._id = plainUser._id.toString();
        }
        return plainUser;
    }

    /**
     * Finds a user by email.
     * @param email - Email to search for.
     * @returns The user as a plain object if found; otherwise, null.
     */
    async findByEmail(email: string): Promise<IUser | null> {
        const user = await this.userModel.findOne({ email }).lean().exec();
        return user ? { ...user, _id: user._id.toString() } : null;
    }

    /**
     * Finds a user by any identifier (id, email, or username).
     * @param identifier - Object containing an id, email, or username.
     * @returns The user as a plain object if found; otherwise, null.
     */
    async findByIdentifier(identifier: { id?: string; email?: string; username?: string }): Promise<IUser | null> {
        const query: any = {};
        if (identifier.id) query._id = identifier.id;
        if (identifier.email) query.email = identifier.email;
        if (identifier.username) query.username = identifier.username;

        this.logger.log(`Finding user by identifier: ${JSON.stringify(query)}`);
        const user = await this.userModel.findOne(query).lean().exec();
        if (user && user._id) {
            user._id = user._id.toString();
            this.logger.log(`User found: ${user.username}`);
            return user ? { ...user, _id: user._id.toString() } : null;
        }
        this.logger.warn(`User not found for identifier: ${JSON.stringify(identifier)}`);
        return null;
    }
    /**
     * Updates a user with the given update object.
     * @param userId - ID of the user to update.
     * @param update - Partial user object with updated fields.
     * @returns The updated user as a plain object.
     */
    async updateUser(userId: string, update: Partial<IUser>): Promise<IUser> {
        const updatedUser = await this.userModel.findByIdAndUpdate(userId, update, { new: true }).lean().exec();
        if (updatedUser && updatedUser._id) {
            updatedUser._id = updatedUser._id.toString();
        }
        if (!updatedUser) {
            throw new Error('User not found');
        }
        return { ...updatedUser, _id: updatedUser._id.toString() };
    }
}
