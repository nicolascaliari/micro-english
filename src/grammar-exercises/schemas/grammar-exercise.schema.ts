import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GrammarExerciseDocument = GrammarExercise & Document;

@Schema({ timestamps: true })
export class GrammarExercise {
  @Prop({ type: Types.ObjectId, ref: 'GrammarTopic', required: true })
  topicId: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['multiple_choice', 'fill_blank', 'sentence_order', 'writing'],
  })
  type: string;

  @Prop({ required: true })
  question: string;

  @Prop({ type: [String], default: [] })
  options: string[]; // Solo para multiple_choice

  @Prop({ required: true })
  answer: string;

  @Prop({ type: [String], default: [] })
  sentenceParts: string[]; // Solo para sentence_order

  @Prop()
  explanation: string;

  @Prop({
    required: true,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  })
  difficulty: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const GrammarExerciseSchema = SchemaFactory.createForClass(GrammarExercise);

// Hook pre-save: convertir topicId a ObjectId si viene como string
GrammarExerciseSchema.pre('save', function (next) {
  if (this.topicId && typeof this.topicId === 'string') {
    this.topicId = new Types.ObjectId(this.topicId);
  }
  next();
});

// Hook pre-update: convertir topicId a ObjectId si viene como string
GrammarExerciseSchema.pre(['updateOne', 'findOneAndUpdate'], function (next) {
  const update = this.getUpdate() as any;
  if (update && update.topicId && typeof update.topicId === 'string') {
    update.topicId = new Types.ObjectId(update.topicId);
  }
  next();
});

// Índice para búsquedas por topicId
GrammarExerciseSchema.index({ topicId: 1 });

