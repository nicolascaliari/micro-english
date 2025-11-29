import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { GrammarTopicsService } from './grammar-topics.service';
import { CreateGrammarTopicDto } from './dto/create-grammar-topic.dto';
import { UpdateGrammarTopicDto } from './dto/update-grammar-topic.dto';

@Controller('grammar-topics')
export class GrammarTopicsController {
  constructor(private readonly grammarTopicsService: GrammarTopicsService) {}

  @Post()
  create(@Body() createDto: CreateGrammarTopicDto) {
    return this.grammarTopicsService.create(createDto);
  }

  @Get()
  findAll(@Query('level') level?: string, @Query('category') category?: string) {
    if (level) {
      return this.grammarTopicsService.findByLevel(level);
    }
    if (category) {
      return this.grammarTopicsService.findByCategory(category);
    }
    return this.grammarTopicsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.grammarTopicsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateGrammarTopicDto) {
    return this.grammarTopicsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.grammarTopicsService.remove(id);
  }
}

