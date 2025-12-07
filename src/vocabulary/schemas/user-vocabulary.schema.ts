import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserVocabularyDocument = UserVocabulary & Document;

@Schema({ timestamps: true, collection: 'user_vocabularies' })
export class UserVocabulary {
    @Prop({ type: Types.ObjectId, ref: 'User', required: true })
    userId: Types.ObjectId;

    @Prop({ type: Types.ObjectId, ref: 'Vocabulary', required: true })
    vocabularyId: Types.ObjectId;

    @Prop({ required: true, default: Date.now })
    nextReview: Date;

    @Prop({ required: true, default: Date.now })
    lastReviewed: Date;

    @Prop({ required: true, default: 0 })
    interval: number; // Intervalo en días

    @Prop({ required: true, default: 2.5 })
    easeFactor: number;

    @Prop({ required: true, default: 0 })
    repetitions: number;
}

export const UserVocabularySchema = SchemaFactory.createForClass(UserVocabulary);

UserVocabularySchema.index({ userId: 1, vocabularyId: 1 }, { unique: true });
UserVocabularySchema.index({ userId: 1, nextReview: 1 });
