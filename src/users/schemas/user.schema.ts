import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: false })
export class User {
  @Prop({
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true, trim: true })
  name: string;

  @Prop({
    type: String,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
    default: 'A1',
  })
  level: string;

  @Prop({ default: 0, min: 0 })
  points: number;

  @Prop({ default: 0, min: 0 })
  streak: number;

  @Prop({ default: Date.now })
  lastActivity: Date;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);

