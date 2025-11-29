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
import { UserGrammarProgressService } from './user-grammar-progress.service';
import { CreateUserGrammarProgressDto } from './dto/create-user-grammar-progress.dto';
import { UpdateUserGrammarProgressDto } from './dto/update-user-grammar-progress.dto';
import { RecordExerciseResultDto } from './dto/record-exercise-result.dto';

@Controller('user-grammar-progress')
export class UserGrammarProgressController {
  constructor(
    private readonly progressService: UserGrammarProgressService,
  ) {}

  @Post()
  create(@Body() createDto: CreateUserGrammarProgressDto) {
    return this.progressService.create(createDto);
  }

  @Get('user/:userId')
  findByUser(
    @Param('userId') userId: string,
    @Query('status') status?: string,
  ) {
    if (status) {
      return this.progressService.findByUserAndStatus(userId, status);
    }
    return this.progressService.findByUser(userId);
  }

  @Get('user/:userId/stats')
  getUserStats(@Param('userId') userId: string) {
    return this.progressService.getUserStats(userId);
  }

  @Get(':userId/:topicId')
  findOne(@Param('userId') userId: string, @Param('topicId') topicId: string) {
    return this.progressService.findOne(userId, topicId);
  }

  @Post('record-result')
  recordExerciseResult(@Body() dto: RecordExerciseResultDto) {
    return this.progressService.recordExerciseResult(dto);
  }

  @Patch(':userId/:topicId')
  update(
    @Param('userId') userId: string,
    @Param('topicId') topicId: string,
    @Body() updateDto: UpdateUserGrammarProgressDto,
  ) {
    return this.progressService.update(userId, topicId, updateDto);
  }

  @Delete(':userId/:topicId')
  remove(@Param('userId') userId: string, @Param('topicId') topicId: string) {
    return this.progressService.remove(userId, topicId);
  }
}

