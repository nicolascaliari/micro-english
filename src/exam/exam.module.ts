import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ExamController } from './exam.controller';
import { ExamService } from './exam.service';
import { Vocabulary, VocabularySchema } from '../vocabulary/schemas/vocabulary.schema';
import { GrammarExercise, GrammarExerciseSchema } from '../grammar-exercises/schemas/grammar-exercise.schema';
import { GrammarTopic, GrammarTopicSchema } from '../grammar-topics/schemas/grammar-topic.schema';
import { LearningStep, LearningStepSchema } from '../learning-steps/schemas/learning-step.schema';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Vocabulary.name, schema: VocabularySchema },
            { name: GrammarExercise.name, schema: GrammarExerciseSchema },
            { name: GrammarTopic.name, schema: GrammarTopicSchema },
            { name: LearningStep.name, schema: LearningStepSchema },
        ]),
    ],
    controllers: [ExamController],
    providers: [ExamService],
    exports: [ExamService],
})
export class ExamModule { }
