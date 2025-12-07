import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { GrammarTopic, GrammarTopicDocument } from './schemas/grammar-topic.schema';
import { CreateGrammarTopicDto } from './dto/create-grammar-topic.dto';
import { UpdateGrammarTopicDto } from './dto/update-grammar-topic.dto';
import { validateObjectId } from '../common/utils/objectid-validation.util';

@Injectable()
export class GrammarTopicsService {
  constructor(
    @InjectModel(GrammarTopic.name)
    private grammarTopicModel: Model<GrammarTopicDocument>,
  ) {}

  async create(createDto: CreateGrammarTopicDto): Promise<GrammarTopic> {
    const created = new this.grammarTopicModel(createDto);
    return created.save();
  }

  async findAll(): Promise<GrammarTopic[]> {
    console.log('findAll');
    return this.grammarTopicModel.find().exec();
  }

  async findByLevel(level: string): Promise<GrammarTopic[]> {
    return this.grammarTopicModel.find({ level }).exec();
  }

  async findByCategory(categoryId: string): Promise<GrammarTopic[]> {
    validateObjectId(categoryId, 'Category ID');
    return this.grammarTopicModel.find({ categoryId }).exec();
  }

  async findOne(id: string): Promise<GrammarTopic> {
    validateObjectId(id, 'Topic ID');
    const topic = await this.grammarTopicModel.findById(id).exec();
    if (!topic) {
      throw new NotFoundException(`Grammar topic with ID ${id} not found`);
    }
    return topic;
  }

  async update(id: string, updateDto: UpdateGrammarTopicDto): Promise<GrammarTopic> {
    validateObjectId(id, 'Topic ID');
    const updated = await this.grammarTopicModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Grammar topic with ID ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    validateObjectId(id, 'Topic ID');
    const result = await this.grammarTopicModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Grammar topic with ID ${id} not found`);
    }
  }
}

