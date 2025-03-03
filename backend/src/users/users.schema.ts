import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string; // Hashed password

  @Prop({ required: true })
  campus: string; // e.g., "West Chester"

  @Prop({ default: [] })
  friends: string[]; // List of friend user IDs
}

export const UserSchema = SchemaFactory.createForClass(User);
