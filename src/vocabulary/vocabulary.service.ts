import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Vocabulary, VocabularyDocument } from './schemas/vocabulary.schema';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { UpdateVocabularyDto } from './dto/update-vocabulary.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { validateObjectId } from '../common/utils/objectid-validation.util';

@Injectable()
export class VocabularyService {
  constructor(
    @InjectModel(Vocabulary.name)
    private vocabularyModel: Model<VocabularyDocument>,
  ) {}

  async findAll(): Promise<Vocabulary[]> {
    try {
      return await this.vocabularyModel.find({}).exec();
    } catch (error) {
      console.error('Error al obtener vocabulario:', error);
      throw error;
    }
  }

  async findOne(id: string): Promise<Vocabulary> {
    try {
      validateObjectId(id, 'Vocabulary ID');
      const vocabulary = await this.vocabularyModel.findById(id).exec();
      if (!vocabulary) {
        throw new NotFoundException('Vocabulario no encontrado');
      }
      return vocabulary;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error al obtener vocabulario:', error);
      throw error;
    }
  }

  async create(createVocabularyDto: CreateVocabularyDto): Promise<Vocabulary> {
    try {
      const { word, translation, example, level, tags, audioUrl, imageUrl } =
        createVocabularyDto;

      // Validar campos requeridos
      if (!word || !translation || !example || !level) {
        throw new BadRequestException(
          'Word, translation, example y level son requeridos',
        );
      }

      // Verificar si la palabra ya existe
      const existingVocabulary = await this.vocabularyModel
        .findOne({ word })
        .exec();
      if (existingVocabulary) {
        throw new ConflictException('La palabra ya está registrada');
      }

      const newVocabulary = new this.vocabularyModel({
        word,
        translation,
        example,
        level: level || 'A1',
        tags,
        audioUrl,
        imageUrl,
      });

      return await newVocabulary.save();
    } catch (error) {
      if (
        error instanceof BadRequestException ||
        error instanceof ConflictException
      ) {
        throw error;
      }
      console.error('Error al crear vocabulario:', error);
      throw error;
    }
  }

  async update(
    id: string,
    updateVocabularyDto: UpdateVocabularyDto,
  ): Promise<Vocabulary> {
    try {
      validateObjectId(id, 'Vocabulary ID');
      const updateData: any = {};

      if (updateVocabularyDto.word) updateData.word = updateVocabularyDto.word;
      if (updateVocabularyDto.translation)
        updateData.translation = updateVocabularyDto.translation;
      if (updateVocabularyDto.example)
        updateData.example = updateVocabularyDto.example;
      if (updateVocabularyDto.level)
        updateData.level = updateVocabularyDto.level;
      if (updateVocabularyDto.tags) updateData.tags = updateVocabularyDto.tags;
      if (updateVocabularyDto.audioUrl)
        updateData.audioUrl = updateVocabularyDto.audioUrl;
      if (updateVocabularyDto.imageUrl)
        updateData.imageUrl = updateVocabularyDto.imageUrl;

      const updatedVocabulary = await this.vocabularyModel
        .findByIdAndUpdate(id, updateData, { new: true, runValidators: true })
        .exec();

      if (!updatedVocabulary) {
        throw new NotFoundException('Vocabulario no encontrado');
      }

      return updatedVocabulary;
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error al actualizar vocabulario:', error);
      throw error;
    }
  }

  async remove(id: string): Promise<void> {
    try {
      validateObjectId(id, 'Vocabulary ID');
      const deletedVocabulary = await this.vocabularyModel
        .findByIdAndDelete(id)
        .exec();
      if (!deletedVocabulary) {
        throw new NotFoundException('Vocabulario no encontrado');
      }
    } catch (error) {
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error al eliminar vocabulario:', error);
      throw error;
    }
  }

  async updateLevel(id: string, updateLevelDto: UpdateLevelDto): Promise<Vocabulary> {
    try {
      validateObjectId(id, 'Vocabulary ID');
      const { level } = updateLevelDto;

      if (!level) {
        throw new BadRequestException('El nivel es requerido');
      }

      const vocabulary = await this.vocabularyModel
        .findByIdAndUpdate(id, { level }, { new: true, runValidators: true })
        .exec();

      if (!vocabulary) {
        throw new NotFoundException('Vocabulario no encontrado');
      }

      return vocabulary;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      console.error('Error al actualizar nivel:', error);
      throw error;
    }
  }
}

