import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { StepAttempt, StepAttemptDocument } from './schemas/step-attempt.schema';
import { CreateStepAttemptDto } from './dto/create-step-attempt.dto';
import { toObjectId } from '../common/utils/objectid-validation.util';

@Injectable()
export class StepAttemptsService {
  constructor(
    @InjectModel(StepAttempt.name)
    private stepAttemptModel: Model<StepAttemptDocument>,
  ) {}

  async create(createDto: CreateStepAttemptDto): Promise<StepAttempt> {
    const created = new this.stepAttemptModel({
      ...createDto,
      userId: toObjectId(createDto.userId, 'userId'),
      stepId: toObjectId(createDto.stepId, 'stepId'),
    });
    return created.save();
  }

  async findByUser(userId: string): Promise<StepAttempt[]> {
    return this.stepAttemptModel
      .find({ userId: toObjectId(userId, 'userId') })
      .populate('stepId')
      .sort({ started_at: -1 })
      .exec();
  }

  async findByUserAndStep(userId: string, stepId: string): Promise<StepAttempt[]> {
    return this.stepAttemptModel
      .find({
        userId: toObjectId(userId, 'userId'),
        stepId: toObjectId(stepId, 'stepId'),
      })
      .sort({ started_at: -1 })
      .exec();
  }

  async startAttempt(userId: string, stepId: string): Promise<StepAttempt> {
    // Buscar si ya existe un intento activo (sin completar) para este usuario y step
    const existingAttempt = await this.stepAttemptModel
      .findOne({
        userId: toObjectId(userId, 'userId'),
        stepId: toObjectId(stepId, 'stepId'),
        completed_at: null, // Solo intentos no completados
      })
      .sort({ started_at: -1 }) // El más reciente
      .exec();

    // Si ya existe un intento activo, retornarlo
    if (existingAttempt) {
      return existingAttempt;
    }

    // Si no existe, crear uno nuevo
    const attempt = new this.stepAttemptModel({
      userId: toObjectId(userId, 'userId'),
      stepId: toObjectId(stepId, 'stepId'),
      score: 0,
      total_questions: 0,
      correct_answers: 0,
      started_at: new Date(),
      passed: false,
    });
    return attempt.save();
  }

  async completeAttempt(
    attemptId: string,
    score: number,
    total_questions: number,
    correct_answers: number,
    passed: boolean,
  ): Promise<StepAttempt> {
    const attempt = await this.stepAttemptModel.findById(attemptId).exec();
    if (!attempt) {
      throw new NotFoundException('Attempt not found');
    }

    attempt.score = score;
    attempt.total_questions = total_questions;
    attempt.correct_answers = correct_answers;
    attempt.completed_at = new Date();
    attempt.passed = passed;

    return attempt.save();
  }

  async getBestScore(userId: string, stepId: string): Promise<number> {
    const attempts = await this.stepAttemptModel
      .find({
        userId: toObjectId(userId, 'userId'),
        stepId: toObjectId(stepId, 'stepId'),
        passed: true,
      })
      .sort({ score: -1 })
      .limit(1)
      .exec();

    return attempts.length > 0 ? attempts[0].score : 0;
  }

  async getAttemptStats(userId: string, stepId: string) {
    const attempts = await this.findByUserAndStep(userId, stepId);
    
    return {
      total_attempts: attempts.length,
      passed_attempts: attempts.filter(a => a.passed).length,
      best_score: attempts.length > 0 ? Math.max(...attempts.map(a => a.score)) : 0,
      average_score: attempts.length > 0 
        ? attempts.reduce((sum, a) => sum + a.score, 0) / attempts.length 
        : 0,
      last_attempt: attempts.length > 0 ? attempts[0] : null,
    };
  }
}

