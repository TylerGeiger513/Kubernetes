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
}

export const UserSchema = SchemaFactory.createForClass(User);
