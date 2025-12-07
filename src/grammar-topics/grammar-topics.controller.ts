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
  findAll(@Query('level') level?: string, @Query('categoryId') categoryId?: string) {
    if (level) {
      return this.grammarTopicsService.findByLevel(level);
    }
    if (categoryId) {
      return this.grammarTopicsService.findByCategory(categoryId);
    }
    return this.grammarTopicsService.findAll();
  }

  @Get('category/:categoryId')
  async findByCategory(@Param('categoryId') categoryId: string) {
    return this.grammarTopicsService.findByCategory(categoryId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    let topic = await this.grammarTopicsService.findOne(id);
    console.log('topic', topic);
    return topic;
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

