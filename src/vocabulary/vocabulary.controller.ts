import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { VocabularyService } from './vocabulary.service';
import { CreateVocabularyDto } from './dto/create-vocabulary.dto';
import { UpdateVocabularyDto } from './dto/update-vocabulary.dto';
import { UpdateLevelDto } from './dto/update-level.dto';

@Controller('vocabulary')
export class VocabularyController {
  constructor(private readonly vocabularyService: VocabularyService) {}

  @Get()
  async getAll() {
    const vocabulary = await this.vocabularyService.findAll();
    return vocabulary;
  }

  @Get(':id')
  async getById(@Param('id') id: string) {
    const vocabulary = await this.vocabularyService.findOne(id);
    return vocabulary;
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createVocabularyDto: CreateVocabularyDto) {
    const vocabulary = await this.vocabularyService.create(createVocabularyDto);
    return {
      message: 'Vocabulario registrado con éxito',
      vocabulary,
    };
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateVocabularyDto: UpdateVocabularyDto,
  ) {
    const vocabulary = await this.vocabularyService.update(
      id,
      updateVocabularyDto,
    );
    return {
      message: 'Vocabulario actualizado',
      vocabulary,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async delete(@Param('id') id: string) {
    await this.vocabularyService.remove(id);
    return {
      message: 'Vocabulario eliminado con éxito',
    };
  }

  @Patch(':id/level')
  async updateLevel(
    @Param('id') id: string,
    @Body() updateLevelDto: UpdateLevelDto,
  ) {
    const vocabulary = await this.vocabularyService.updateLevel(
      id,
      updateLevelDto,
    );
    return {
      message: 'Nivel actualizado',
      vocabulary,
    };
  }
}

