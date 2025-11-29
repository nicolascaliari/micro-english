import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserGrammarProgressDocument = UserGrammarProgress & Document;

@Schema({ timestamps: true })
export class UserGrammarProgress {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'GrammarTopic', required: true })
  topicId: Types.ObjectId;

  @Prop({
    required: true,
    enum: ['not_started', 'in_progress', 'completed'],
    default: 'not_started',
  })
  status: string;

  @Prop({ default: 0, min: 0 })
  exercisesCompleted: number;

  @Prop({ default: 0, min: 0, max: 100 })
  correctRatio: number; // Porcentaje de ejercicios correctos

  @Prop({ default: Date.now })
  lastPractice: Date;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const UserGrammarProgressSchema = SchemaFactory.createForClass(
  UserGrammarProgress,
);

// Índices compuestos para búsquedas eficientes
UserGrammarProgressSchema.index({ userId: 1, topicId: 1 }, { unique: true });
UserGrammarProgressSchema.index({ userId: 1, status: 1 });

