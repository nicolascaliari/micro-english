import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { VocabularyController } from './vocabulary.controller';
import { VocabularyService } from './vocabulary.service';
import { Vocabulary, VocabularySchema } from './schemas/vocabulary.schema';
import { UserVocabulary, UserVocabularySchema } from './schemas/user-vocabulary.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Vocabulary.name, schema: VocabularySchema },
      { name: UserVocabulary.name, schema: UserVocabularySchema },
    ]),
  ],
  controllers: [VocabularyController],
  providers: [VocabularyService],
  exports: [VocabularyService],
})
export class VocabularyModule { }

