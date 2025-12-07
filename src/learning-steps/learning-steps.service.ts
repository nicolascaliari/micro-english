import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { LearningStep, LearningStepDocument } from './schemas/learning-step.schema';
import { CreateLearningStepDto } from './dto/create-learning-step.dto';
import { UpdateLearningStepDto } from './dto/update-learning-step.dto';
import { validateObjectId } from '../common/utils/objectid-validation.util';

@Injectable()
export class LearningStepsService {
  constructor(
    @InjectModel(LearningStep.name)
    private learningStepModel: Model<LearningStepDocument>,
  ) {}

  async create(createDto: CreateLearningStepDto): Promise<LearningStep> {
    const created = new this.learningStepModel(createDto);
    return created.save();
  }

  async findAll(): Promise<LearningStep[]> {
    return this.learningStepModel
      .find({ is_active: true })
      .sort({ order: 1 })
      .exec();
  }

  async findAllWithCategory(): Promise<LearningStep[]> {
    return this.learningStepModel
      .find({ is_active: true })
      .populate('categoryId')
      .sort({ order: 1 })
      .exec();
  }

  async findOne(id: string): Promise<LearningStep> {
    validateObjectId(id, 'Learning Step ID');
    const step = await this.learningStepModel.findById(id).exec();
    if (!step) {
      throw new NotFoundException(`Learning step with ID ${id} not found`);
    }
    return step;
  }

  async update(id: string, updateDto: UpdateLearningStepDto): Promise<LearningStep> {
    validateObjectId(id, 'Learning Step ID');
    const updated = await this.learningStepModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Learning step with ID ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    validateObjectId(id, 'Learning Step ID');
    const result = await this.learningStepModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Learning step with ID ${id} not found`);
    }
  }

  async findByType(type: string): Promise<LearningStep[]> {
    return this.learningStepModel
      .find({ type, is_active: true })
      .sort({ order: 1 })
      .exec();
  }
}

