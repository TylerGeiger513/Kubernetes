// src/users/users.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email!: string;

  @Prop({ required: true })
  password!: string; // Hashed password

  @Prop({ required: true })
  campus!: string; // e.g., "West Chester"

  // Array of friend user IDs
  @Prop({ type: [String], default: [] })
  friends!: string[];

  // Array of incoming friend request user IDs
  @Prop({ type: [String], default: [] })
  friendRequests!: string[];

  // Array of blocked user IDs
  @Prop({ type: [String], default: [] })
  blockedUsers!: string[];
}

export const UserSchema = SchemaFactory.createForClass(User);
