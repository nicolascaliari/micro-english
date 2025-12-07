import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { validateObjectId } from '../common/utils/objectid-validation.util';

@Injectable()
export class CategoriesService {
  constructor(
    @InjectModel(Category.name)
    private categoryModel: Model<CategoryDocument>,
  ) {}

  async findAll(): Promise<Category[]> {
    return this.categoryModel
      .find()
      .sort({ order: 1 })
      .exec();
  }

  async findOne(id: string): Promise<Category> {
    validateObjectId(id, 'Category ID');
    const category = await this.categoryModel.findById(id).exec();
    if (!category) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return category;
  }

  async create(createDto: CreateCategoryDto): Promise<Category> {
    const category = new this.categoryModel(createDto);
    return category.save();
  }

  async update(id: string, updateDto: UpdateCategoryDto): Promise<Category> {
    validateObjectId(id, 'Category ID');
    const updated = await this.categoryModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!updated) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return updated;
  }

  async remove(id: string): Promise<void> {
    validateObjectId(id, 'Category ID');
    const result = await this.categoryModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
  }
}

