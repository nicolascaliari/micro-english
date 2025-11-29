import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GrammarExercisesController } from './grammar-exercises.controller';
import { GrammarExercisesService } from './grammar-exercises.service';
import { GrammarExercise, GrammarExerciseSchema } from './schemas/grammar-exercise.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GrammarExercise.name, schema: GrammarExerciseSchema },
    ]),
  ],
  controllers: [GrammarExercisesController],
  providers: [GrammarExercisesService],
  exports: [GrammarExercisesService],
})
export class GrammarExercisesModule {}

