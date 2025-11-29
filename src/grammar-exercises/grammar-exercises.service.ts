import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GrammarExercise, GrammarExerciseDocument } from './schemas/grammar-exercise.schema';
import { CreateGrammarExerciseDto } from './dto/create-grammar-exercise.dto';
import { UpdateGrammarExerciseDto } from './dto/update-grammar-exercise.dto';
import { CheckAnswerResponseDto } from './dto/check-answer.dto';
import { toObjectId, validateObjectId } from '../common/utils/objectid-validation.util';

@Injectable()
export class GrammarExercisesService {
  constructor(
    @InjectModel(GrammarExercise.name)
    private grammarExerciseModel: Model<GrammarExerciseDocument>,
  ) {}

  async create(createDto: CreateGrammarExerciseDto): Promise<GrammarExercise> {
    const created = new this.grammarExerciseModel({
      ...createDto,
      topicId: toObjectId(createDto.topicId, 'topicId'),
    });
    return created.save();
  }

  async findAll(): Promise<GrammarExercise[]> {
    return this.grammarExerciseModel.find().populate('topicId').exec();
  }

  async findByTopic(topicId: string): Promise<GrammarExercise[]> {
    return this.grammarExerciseModel
      .find({ topicId: toObjectId(topicId, 'topicId') })
      .exec();
  }

  async findByDifficulty(difficulty: string): Promise<GrammarExercise[]> {
    return this.grammarExerciseModel.find({ difficulty }).exec();
  }

  async findOne(id: string): Promise<GrammarExercise> {
    validateObjectId(id, 'Exercise ID');
    const exercise = await this.grammarExerciseModel
      .findById(id)
      .populate('topicId')
      .exec();
    if (!exercise) {
      throw new NotFoundException(`Grammar exercise with ID ${id} not found`);
    }
    return exercise;
  }

  async update(
    id: string,
    updateDto: UpdateGrammarExerciseDto,
  ): Promise<GrammarExercise> {
    validateObjectId(id, 'Exercise ID');
    const updateData: any = { ...updateDto };
    if (updateDto.topicId) {
      updateData.topicId = toObjectId(updateDto.topicId, 'topicId');
    }

    const updated = await this.grammarExerciseModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Grammar exercise with ID ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    validateObjectId(id, 'Exercise ID');
    const result = await this.grammarExerciseModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Grammar exercise with ID ${id} not found`);
    }
  }

  async checkAnswer(
    exerciseId: string,
    userAnswer: string,
  ): Promise<CheckAnswerResponseDto> {
    const exercise = await this.findOne(exerciseId);

    const correct =
      userAnswer.trim().toLowerCase() === exercise.answer.trim().toLowerCase();

    return {
      correct,
      correctAnswer: exercise.answer,
      explanation: exercise.explanation,
    };
  }

  async getRandomExercises(topicId: string, limit: number = 5): Promise<GrammarExercise[]> {
    return this.grammarExerciseModel
      .aggregate([
        { $match: { topicId: toObjectId(topicId, 'topicId') } },
        { $sample: { size: limit } },
      ])
      .exec();
  }
}

