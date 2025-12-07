import {
  Controller,
  Get,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import { LearningPathService } from './learning-path.service';
import { CompleteStepDto } from '../step-attempts/dto/complete-step.dto';

@Controller('learning-path')
export class LearningPathController {
  constructor(private readonly learningPathService: LearningPathService) {}

  /**
   * GET /api/learning-path/:userId
   * Obtener el laberinto completo con progreso del usuario
   */
  @Get(':userId')
  getLearningPath(@Param('userId') userId: string) {
    return this.learningPathService.getLearningPath(userId);
  }

  /**
   * POST /api/learning-path/:userId/steps/:stepId/start
   * Iniciar un paso
   */
  @Post(':userId/steps/:stepId/start')
  startStep(@Param('userId') userId: string, @Param('stepId') stepId: string) {
    return this.learningPathService.startStep(userId, stepId);
  }

  /**
   * POST /api/learning-path/:userId/steps/:stepId/complete
   * Completar un paso
   */
  @Post(':userId/steps/:stepId/complete')
  completeStep(
    @Param('userId') userId: string,
    @Param('stepId') stepId: string,
    @Body() completeDto: CompleteStepDto,
  ) {
    return this.learningPathService.completeStep(userId, stepId, completeDto);
  }

  /**
   * GET /api/learning-path/:userId/current-step
   * Obtener el paso actual del usuario
   */
  @Get(':userId/current-step')
  getCurrentStep(@Param('userId') userId: string) {
    return this.learningPathService.getCurrentStep(userId);
  }
}

