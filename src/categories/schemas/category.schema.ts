import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CategoryDocument = Category & Document;

@Schema({ timestamps: false })
export class Category {
  @Prop({ required: true, unique: true })
  name: string;

  @Prop({ required: true })
  order: number;
}

export const CategorySchema = SchemaFactory.createForClass(Category);

