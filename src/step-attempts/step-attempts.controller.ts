import {
  Controller,
  Get,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import { StepAttemptsService } from './step-attempts.service';
import { CreateStepAttemptDto } from './dto/create-step-attempt.dto';

@Controller('step-attempts')
export class StepAttemptsController {
  constructor(private readonly stepAttemptsService: StepAttemptsService) {}

  @Post()
  create(@Body() createDto: CreateStepAttemptDto) {
    return this.stepAttemptsService.create(createDto);
  }

  @Get('user/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.stepAttemptsService.findByUser(userId);
  }

  @Get(':userId/:stepId')
  findByUserAndStep(
    @Param('userId') userId: string,
    @Param('stepId') stepId: string,
  ) {
    return this.stepAttemptsService.findByUserAndStep(userId, stepId);
  }

  @Get(':userId/:stepId/stats')
  getAttemptStats(
    @Param('userId') userId: string,
    @Param('stepId') stepId: string,
  ) {
    return this.stepAttemptsService.getAttemptStats(userId, stepId);
  }
}

