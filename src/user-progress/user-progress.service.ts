import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { UserProgress, UserProgressDocument } from './schemas/user-progress.schema';
import { CreateUserProgressDto } from './dto/create-user-progress.dto';
import { UpdateUserProgressDto } from './dto/update-user-progress.dto';
import { toObjectId } from '../common/utils/objectid-validation.util';

@Injectable()
export class UserProgressService {
  constructor(
    @InjectModel(UserProgress.name)
    private userProgressModel: Model<UserProgressDocument>,
  ) {}

  async create(createDto: CreateUserProgressDto): Promise<UserProgress> {
    const created = new this.userProgressModel({
      ...createDto,
      userId: toObjectId(createDto.userId, 'userId'),
      stepId: toObjectId(createDto.stepId, 'stepId'),
    });
    return created.save();
  }

  async findByUser(userId: string): Promise<UserProgress[]> {
    // Intentar buscar por ObjectId o por string directo
    try {
      const objectId = toObjectId(userId, 'userId');
      return await this.userProgressModel
        .find({ userId: objectId })
        .populate('stepId')
        .sort({ 'stepId.order': 1 })
        .exec();
    } catch (error) {
      // Si no es un ObjectId válido, buscar por string directo
      return await this.userProgressModel
        .find({ userId: userId as any })
        .populate('stepId')
        .sort({ 'stepId.order': 1 })
        .exec();
    }
  }

  async findOne(userId: string, stepId: string): Promise<UserProgress> {
    const progress = await this.userProgressModel
      .findOne({
        userId: toObjectId(userId, 'userId'),
        stepId: toObjectId(stepId, 'stepId'),
      })
      .populate('stepId')
      .exec();

    if (!progress) {
      throw new NotFoundException(
        `Progress not found for user ${userId} and step ${stepId}`,
      );
    }
    return progress;
  }

  async update(
    userId: string,
    stepId: string,
    updateDto: UpdateUserProgressDto,
  ): Promise<UserProgress> {
    const updated = await this.userProgressModel
      .findOneAndUpdate(
        {
          userId: toObjectId(userId, 'userId'),
          stepId: toObjectId(stepId, 'stepId'),
        },
        updateDto,
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(
        `Progress not found for user ${userId} and step ${stepId}`,
      );
    }
    return updated;
  }

  async upsert(
    userId: string,
    stepId: string,
    updateDto: Partial<UserProgress>,
  ): Promise<UserProgress> {
    const userObjectId = toObjectId(userId, 'userId');
    const stepObjectId = toObjectId(stepId, 'stepId');
    
    // Preparar el update object
    const updateObject: any = {
      $set: updateDto,
      $setOnInsert: {
        userId: userObjectId,
        stepId: stepObjectId,
      }
    };
    
    // Solo agregar valores por defecto en $setOnInsert si NO están en updateDto
    if (updateDto.status === undefined) {
      updateObject.$setOnInsert.status = 'locked';
    }
    if (updateDto.score === undefined) {
      updateObject.$setOnInsert.score = 0;
    }
    if (updateDto.attempts_count === undefined) {
      updateObject.$setOnInsert.attempts_count = 0;
    }
    
    const result = await this.userProgressModel
      .findOneAndUpdate(
        {
          userId: userObjectId,
          stepId: stepObjectId,
        },
        updateObject,
        { new: true, upsert: true },
      )
      .exec();

    return result;
  }

  async getCompletedSteps(userId: string): Promise<Types.ObjectId[]> {
    try {
      const objectId = toObjectId(userId, 'userId');
      const completed = await this.userProgressModel
        .find({
          userId: objectId,
          status: 'completed',
        })
        .select('stepId')
        .exec();

      return completed.map((p) => p.stepId);
    } catch (error) {
      // Si no es un ObjectId válido, buscar por string directo
      const completed = await this.userProgressModel
        .find({
          userId: userId as any,
          status: 'completed',
        })
        .select('stepId')
        .exec();

      return completed.map((p) => p.stepId);
    }
  }

  async unlockStep(userId: string, stepId: string): Promise<UserProgress> {
    return this.upsert(userId, stepId, {
      status: 'in_progress',
      unlocked_at: new Date(),
    } as any);
  }

  async completeStep(
    userId: string,
    stepId: string,
    score: number,
  ): Promise<UserProgress> {
    const userObjectId = toObjectId(userId, 'userId');
    const stepObjectId = toObjectId(stepId, 'stepId');
    
    // Usar findOneAndUpdate con upsert para evitar duplicados
    // Esto garantiza atomicidad y previene race conditions
    const result = await this.userProgressModel
      .findOneAndUpdate(
        {
          userId: userObjectId,
          stepId: stepObjectId,
        },
        {
          $set: {
            status: 'completed',
            score: score,
            completed_at: new Date(),
          },
          $inc: {
            attempts_count: 1,
          },
          $setOnInsert: {
            userId: userObjectId,
            stepId: stepObjectId,
            unlocked_at: new Date(),
          }
        },
        { 
          new: true, 
          upsert: true,
        },
      )
      .exec();

    return result;
  }
}

