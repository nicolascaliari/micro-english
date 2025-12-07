import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { VocabularyModule } from './vocabulary/vocabulary.module';
import { GrammarTopicsModule } from './grammar-topics/grammar-topics.module';
import { GrammarExercisesModule } from './grammar-exercises/grammar-exercises.module';
import { UserGrammarProgressModule } from './user-grammar-progress/user-grammar-progress.module';
import { LearningStepsModule } from './learning-steps/learning-steps.module';
import { UserProgressModule } from './user-progress/user-progress.module';
import { StepAttemptsModule } from './step-attempts/step-attempts.module';
import { LearningPathModule } from './learning-path/learning-path.module';
import { CategoriesModule } from './categories/categories.module';
import { ExamModule } from './exam/exam.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(
      process.env.MONGODB_URI ||
      'mongodb+srv://nicolascaliari28:KCQa6YRnjYQSIXEV@cluster-fluxenet-dev.cwhkn.mongodb.net/english-learning',
    ),
    UsersModule,
    VocabularyModule,
    GrammarTopicsModule,
    GrammarExercisesModule,
    UserGrammarProgressModule,
    LearningStepsModule,
    UserProgressModule,
    StepAttemptsModule,
    LearningPathModule,
    CategoriesModule,
    ExamModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
