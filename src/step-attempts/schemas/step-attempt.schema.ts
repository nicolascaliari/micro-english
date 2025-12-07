import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type StepAttemptDocument = StepAttempt & Document;

@Schema({ timestamps: true, collection: 'step_attempts' })
export class StepAttempt {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'LearningStep', required: true })
  stepId: Types.ObjectId;

  @Prop({ required: true, min: 0, max: 100 })
  score: number;

  @Prop({ required: true, min: 0 })
  total_questions: number;

  @Prop({ required: true, min: 0 })
  correct_answers: number;

  @Prop({ required: true, default: Date.now })
  started_at: Date;

  @Prop({ type: Date })
  completed_at: Date;

  @Prop({ required: true, default: false })
  passed: boolean;
}

export const StepAttemptSchema = SchemaFactory.createForClass(StepAttempt);

// Índices
StepAttemptSchema.index({ userId: 1, stepId: 1 });
StepAttemptSchema.index({ userId: 1, completed_at: -1 });

