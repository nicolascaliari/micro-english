import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { GrammarExercisesService } from './grammar-exercises.service';
import { CreateGrammarExerciseDto } from './dto/create-grammar-exercise.dto';
import { UpdateGrammarExerciseDto } from './dto/update-grammar-exercise.dto';
import { CheckAnswerDto } from './dto/check-answer.dto';

@Controller('grammar-exercises')
export class GrammarExercisesController {
  constructor(
    private readonly grammarExercisesService: GrammarExercisesService,
  ) {}

  @Post()
  create(@Body() createDto: CreateGrammarExerciseDto) {
    return this.grammarExercisesService.create(createDto);
  }

  @Get()
  findAll(
    @Query('topicId') topicId?: string,
    @Query('difficulty') difficulty?: string,
  ) {
    if (topicId) {
      return this.grammarExercisesService.findByTopic(topicId);
    }
    if (difficulty) {
      return this.grammarExercisesService.findByDifficulty(difficulty);
    }
    return this.grammarExercisesService.findAll();
  }

  @Get('random/:topicId')
  getRandomExercises(
    @Param('topicId') topicId: string,
    @Query('limit') limit?: number,
  ) {
    return this.grammarExercisesService.getRandomExercises(
      topicId,
      limit || 5,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.grammarExercisesService.findOne(id);
  }

  @Post('check-answer')
  checkAnswer(@Body() checkAnswerDto: CheckAnswerDto) {
    return this.grammarExercisesService.checkAnswer(
      checkAnswerDto.exerciseId,
      checkAnswerDto.userAnswer,
    );
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateGrammarExerciseDto) {
    return this.grammarExercisesService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.grammarExercisesService.remove(id);
  }
}

