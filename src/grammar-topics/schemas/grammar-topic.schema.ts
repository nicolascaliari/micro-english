import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type GrammarTopicDocument = GrammarTopic & Document;

class Example {
  @Prop({ required: true })
  en: string;

  @Prop({ required: true })
  es: string;

  @Prop()
  note?: string;
}

class StructureExample {
  @Prop({ required: true })
  en: string;

  @Prop({ required: true })
  es: string;
}

class GrammarStructure {
  @Prop({ required: true })
  rule: string;

  @Prop({ required: true })
  pattern: string;

  @Prop({ type: [StructureExample], default: [] })
  examples: StructureExample[];
}

@Schema({ timestamps: true })
export class GrammarTopic {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({
    required: true,
    enum: ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'],
  })
  level: string;

  @Prop({ type: Types.ObjectId, ref: 'Category', required: true })
  categoryId: Types.ObjectId;

  @Prop({ type: [GrammarStructure], default: [] })
  structure: GrammarStructure[];

  @Prop({ type: [Example], default: [] })
  examples: Example[];

  @Prop({ type: [String], default: [] })
  tips: string[];

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;
}

export const GrammarTopicSchema = SchemaFactory.createForClass(GrammarTopic);

// Middleware para actualizar updatedAt
GrammarTopicSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

