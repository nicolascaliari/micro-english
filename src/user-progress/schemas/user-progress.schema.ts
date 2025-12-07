import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserProgressDocument = UserProgress & Document;

@Schema({ timestamps: true, collection: 'user_progress' })
export class UserProgress {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId | string;

  @Prop({ type: Types.ObjectId, ref: 'LearningStep', required: true })
  stepId: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['locked', 'in_progress', 'completed'],
    default: 'locked',
  })
  status: string;

  @Prop({ default: 0, min: 0, max: 100 })
  score: number;

  @Prop({ default: 0, min: 0 })
  attempts_count: number;

  @Prop({ type: Date })
  completed_at: Date;

  @Prop({ type: Date })
  unlocked_at: Date;
}

export const UserProgressSchema = SchemaFactory.createForClass(UserProgress);

// Índices compuestos
UserProgressSchema.index({ userId: 1, stepId: 1 }, { unique: true });
UserProgressSchema.index({ userId: 1, status: 1 });

