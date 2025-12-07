import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type VocabularyDocument = Vocabulary & Document;

@Schema({ timestamps: false })
export class Vocabulary {
  @Prop({ required: true })
  word: string;

  @Prop({ required: true })
  translation: string;

  @Prop({ required: true })
  example: string;

  @Prop({ required: true })
  level: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId: Types.ObjectId;

  @Prop({ type: [String], required: false })
  tags: string[];

  @Prop({ required: false })
  audioUrl: string;

  @Prop({ required: false })
  imageUrl: string;

  @Prop({ default: Date.now })
  createdAt: Date;
}

export const VocabularySchema = SchemaFactory.createForClass(Vocabulary);

