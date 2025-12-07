import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Vocabulary, VocabularyDocument } from './schemas/vocabulary.schema';
import { UserVocabulary, UserVocabularyDocument } from './schemas/user-vocabulary.schema';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { UpdateVocabularyDto } from './dto/update-vocabulary.dto';
import { UpdateLevelDto } from './dto/update-level.dto';
import { validateObjectId } from '../common/utils/objectid-validation.util';

@Injectable()
export class VocabularyService {
  constructor(
    @InjectModel(Vocabulary.name)
    private vocabularyModel: Model<VocabularyDocument>,
    @InjectModel(UserVocabulary.name)
    private userVocabularyModel: Model<UserVocabularyDocument>,
  ) { }

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

  async findByCategory(categoryId: string): Promise<Vocabulary[]> {
    try {
      if (!categoryId) {
        throw new BadRequestException('Category ID is required');
      }

      // Validar que sea un ObjectId válido
      if (!Types.ObjectId.isValid(categoryId)) {
        throw new BadRequestException(`Invalid Category ID: ${categoryId}`);
      }

      console.log(`🔍 Searching vocabulary for category: ${categoryId}`);

      const vocabularies = await this.vocabularyModel
        .find({ categoryId: categoryId })
        .exec();

      console.log(`✅ Found ${vocabularies.length} words for category ${categoryId}`);

      return vocabularies;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      console.error('Error al obtener vocabulario por categoría:', error);
      throw error;
    }
  }

  async getPracticeWords(userId: string): Promise<Vocabulary[]> {
    try {
      validateObjectId(userId, 'User ID');
      const now = new Date();

      // 1. Obtener palabras que necesitan repaso (nextReview <= now)
      const dueVocabularies = await this.userVocabularyModel
        .find({
          userId: new Types.ObjectId(userId),
          nextReview: { $lte: now },
        })
        .populate('vocabularyId')
        .limit(20)
        .exec();

      // Extraer los documentos de vocabulario real
      let practiceWords = dueVocabularies.map((uv: any) => uv.vocabularyId);

      // 2. Si hay pocas palabras para repasar, agregar nuevas palabras
      if (practiceWords.length < 10) {
        // Obtener IDs de palabras ya estudiadas para excluirlas
        const studiedIds = await this.userVocabularyModel
          .find({ userId: new Types.ObjectId(userId) })
          .distinct('vocabularyId')
          .exec();

        const newWords = await this.vocabularyModel
          .find({ _id: { $nin: studiedIds } })
          .limit(10 - practiceWords.length)
          .exec();

        practiceWords = [...practiceWords, ...newWords];
      }

      return practiceWords;
    } catch (error) {
      console.error('Error fetching practice words:', error);
      throw error;
    }
  }

  async saveProgress(
    userId: string,
    vocabularyId: string,
    rating: 'again' | 'hard' | 'good' | 'easy'
  ): Promise<any> {
    try {
      validateObjectId(userId, 'User ID');
      validateObjectId(vocabularyId, 'Vocabulary ID');

      let userVocab = await this.userVocabularyModel.findOne({
        userId: new Types.ObjectId(userId),
        vocabularyId: new Types.ObjectId(vocabularyId),
      });

      if (!userVocab) {
        userVocab = new this.userVocabularyModel({
          userId: new Types.ObjectId(userId),
          vocabularyId: new Types.ObjectId(vocabularyId),
          nextReview: new Date(),
          interval: 0,
          easeFactor: 2.5,
          repetitions: 0,
        });
      }

      // SM-2 Algorithm Simplified
      // Rating: again=0, hard=1, good=2, easy=3 (internal mapping)
      // Actually standard SM-2 uses 0-5. Let's map:
      // again -> 0 (Fail)
      // hard -> 3 (Pass, hard)
      // good -> 4 (Pass, good)
      // easy -> 5 (Pass, perfect)

      let grade = 0;
      switch (rating) {
        case 'again': grade = 0; break;
        case 'hard': grade = 3; break;
        case 'good': grade = 4; break;
        case 'easy': grade = 5; break;
      }

      const prevInterval = userVocab.interval;
      const prevEF = userVocab.easeFactor;
      const prevReps = userVocab.repetitions;

      let nextInterval = 0;
      let nextEF = prevEF;
      let nextReps = prevReps;

      if (grade >= 3) {
        // Correct response
        // TESTING: Using minutes instead of days
        if (prevReps === 0) {
          nextInterval = 1; // 1 day normally, keeping as 1 for now
        } else if (prevReps === 1) {
          nextInterval = 6; // 6 days normally
        } else {
          nextInterval = Math.round(prevInterval * prevEF);
        }
        nextReps = prevReps + 1;

        // Update Ease Factor
        // EF' = EF + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02))
        nextEF = prevEF + (0.1 - (5 - grade) * (0.08 + (5 - grade) * 0.02));
        if (nextEF < 1.3) nextEF = 1.3;
      } else {
        // Incorrect response
        nextReps = 0;
        nextInterval = 1; // Start over
        // EF unchanged or decreased? SM-2 says unchanged usually for fail, but some versions decrease it.
        // Let's keep it unchanged for simplicity or slight penalty could be added.
      }

      const nextReviewDate = new Date();
      // TESTING: For 'hard' rating, use 1 minute instead of days
      if (rating === 'hard') {
        nextReviewDate.setMinutes(nextReviewDate.getMinutes() + 1);
      } else {
        nextReviewDate.setDate(nextReviewDate.getDate() + nextInterval);
      }

      userVocab.interval = nextInterval;
      userVocab.easeFactor = nextEF;
      userVocab.repetitions = nextReps;
      userVocab.nextReview = nextReviewDate;
      userVocab.lastReviewed = new Date();

      return await userVocab.save();

    } catch (error) {
      console.error('Error saving vocabulary progress:', error);
      throw error;
    }
  }
}
