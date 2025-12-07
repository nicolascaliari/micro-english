import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type LearningStepDocument = LearningStep & Document;

@Schema({ timestamps: true, collection: 'learning_steps' })
export class LearningStep {
  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  emoji: string;

  @Prop({
    required: true,
    enum: ['vocabulary', 'grammar', 'tips', 'reading', 'listening', 'speaking'],
  })
  type: string;

  @Prop({ required: true })
  order: number;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId: Types.ObjectId;

  @Prop({ required: true, default: 80 })
  required_score: number;

  @Prop({ type: [Number], default: [] })
  unlock_requirements: number[]; // IDs de los pasos que deben estar completos

  @Prop({ required: true })
  route: string;

  @Prop({ required: true })
  color: string;

  @Prop({ required: true })
  bg_color: string;

  @Prop({ default: true })
  is_active: boolean;
}

export const LearningStepSchema = SchemaFactory.createForClass(LearningStep);

// Índice para orden
LearningStepSchema.index({ order: 1 });
LearningStepSchema.index({ is_active: 1 });

