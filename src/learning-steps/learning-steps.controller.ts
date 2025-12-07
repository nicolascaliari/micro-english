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
import { LearningStepsService } from './learning-steps.service';
import { CreateLearningStepDto } from './dto/create-learning-step.dto';
import { UpdateLearningStepDto } from './dto/update-learning-step.dto';

@Controller('learning-steps')
export class LearningStepsController {
  constructor(private readonly learningStepsService: LearningStepsService) {}

  @Post()
  create(@Body() createDto: CreateLearningStepDto) {
    return this.learningStepsService.create(createDto);
  }

  @Get()
  findAll(@Query('type') type?: string) {
    if (type) {
      return this.learningStepsService.findByType(type);
    }
    return this.learningStepsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.learningStepsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateLearningStepDto) {
    return this.learningStepsService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.learningStepsService.remove(id);
  }
}

