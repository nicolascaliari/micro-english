import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  UserGrammarProgress,
  UserGrammarProgressDocument,
} from './schemas/user-grammar-progress.schema';
import { CreateUserGrammarProgressDto } from './dto/create-user-grammar-progress.dto';
import { UpdateUserGrammarProgressDto } from './dto/update-user-grammar-progress.dto';
import { RecordExerciseResultDto } from './dto/record-exercise-result.dto';
import { toObjectId } from '../common/utils/objectid-validation.util';

@Injectable()
export class UserGrammarProgressService {
  constructor(
    @InjectModel(UserGrammarProgress.name)
    private progressModel: Model<UserGrammarProgressDocument>,
  ) {}

  async create(
    createDto: CreateUserGrammarProgressDto,
  ): Promise<UserGrammarProgress> {
    const created = new this.progressModel({
      ...createDto,
      userId: toObjectId(createDto.userId, 'userId'),
      topicId: toObjectId(createDto.topicId, 'topicId'),
    });
    return created.save();
  }

  async findByUser(userId: string): Promise<UserGrammarProgress[]> {
    return this.progressModel
      .find({ userId: toObjectId(userId, 'userId') })
      .populate('topicId')
      .exec();
  }

  async findByUserAndStatus(
    userId: string,
    status: string,
  ): Promise<UserGrammarProgress[]> {

    console.log('userId', userId);
    console.log('status', status);
    return this.progressModel
      .find({
        userId: toObjectId(userId, 'userId'),
        status,
      })
      .populate('topicId')
      .exec();
  }

  async findOne(userId: string, topicId: string): Promise<UserGrammarProgress> {
    const progress = await this.progressModel
      .findOne({
        userId: toObjectId(userId, 'userId'),
        topicId: toObjectId(topicId, 'topicId'),
      })
      .populate('topicId')
      .exec();

    if (!progress) {
      throw new NotFoundException(
        `Progress not found for user ${userId} and topic ${topicId}`,
      );
    }
    return progress;
  }

  async update(
    userId: string,
    topicId: string,
    updateDto: UpdateUserGrammarProgressDto,
  ): Promise<UserGrammarProgress> {
    const updated = await this.progressModel
      .findOneAndUpdate(
        {
          userId: toObjectId(userId, 'userId'),
          topicId: toObjectId(topicId, 'topicId'),
        },
        updateDto,
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(
        `Progress not found for user ${userId} and topic ${topicId}`,
      );
    }
    return updated;
  }

  async remove(userId: string, topicId: string): Promise<void> {
    const result = await this.progressModel
      .findOneAndDelete({
        userId: toObjectId(userId, 'userId'),
        topicId: toObjectId(topicId, 'topicId'),
      })
      .exec();

    if (!result) {
      throw new NotFoundException(
        `Progress not found for user ${userId} and topic ${topicId}`,
      );
    }
  }

  async recordExerciseResult(
    dto: RecordExerciseResultDto,
  ): Promise<UserGrammarProgress> {
    const { userId, topicId, correct } = dto;

    // Buscar o crear el progreso
    let progress = await this.progressModel
      .findOne({
        userId: toObjectId(userId, 'userId'),
        topicId: toObjectId(topicId, 'topicId'),
      })
      .exec();

    if (!progress) {
      // Crear nuevo progreso si no existe
      progress = new this.progressModel({
        userId: toObjectId(userId, 'userId'),
        topicId: toObjectId(topicId, 'topicId'),
        status: 'in_progress',
        exercisesCompleted: 0,
        correctRatio: 0,
      });
    }

    // Actualizar estadísticas
    progress.exercisesCompleted += 1;
    progress.lastPractice = new Date();

    // Calcular nuevo ratio de correctas
    const totalCorrect = Math.round(
      (progress.correctRatio / 100) * (progress.exercisesCompleted - 1),
    );
    const newTotalCorrect = correct ? totalCorrect + 1 : totalCorrect;
    progress.correctRatio = Math.round(
      (newTotalCorrect / progress.exercisesCompleted) * 100,
    );

    // Actualizar estado si es necesario
    if (progress.status === 'not_started') {
      progress.status = 'in_progress';
    }

    // Marcar como completado si tiene buen ratio y suficientes ejercicios
    if (progress.exercisesCompleted >= 10 && progress.correctRatio >= 80) {
      progress.status = 'completed';
    }

    return progress.save();
  }

  async getUserStats(userId: string) {
    const allProgress = await this.findByUser(userId);

    const stats = {
      total: allProgress.length,
      notStarted: allProgress.filter((p) => p.status === 'not_started').length,
      inProgress: allProgress.filter((p) => p.status === 'in_progress').length,
      completed: allProgress.filter((p) => p.status === 'completed').length,
      totalExercises: allProgress.reduce(
        (sum, p) => sum + p.exercisesCompleted,
        0,
      ),
      averageCorrectRatio:
        allProgress.length > 0
          ? Math.round(
              allProgress.reduce((sum, p) => sum + p.correctRatio, 0) /
                allProgress.length,
            )
          : 0,
    };

    return stats;
  }
}

