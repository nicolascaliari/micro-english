import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { LearningStepsService } from '../learning-steps/learning-steps.service';
import { UserProgressService } from '../user-progress/user-progress.service';
import { StepAttemptsService } from '../step-attempts/step-attempts.service';
import { LearningStep } from '../learning-steps/schemas/learning-step.schema';
import { CompleteStepDto } from '../step-attempts/dto/complete-step.dto';
import { UserProgress } from '../user-progress/schemas/user-progress.schema';

@Injectable()
export class LearningPathService {
  constructor(
    private learningStepsService: LearningStepsService,
    private userProgressService: UserProgressService,
    private stepAttemptsService: StepAttemptsService,
  ) { }

  /**
   * GET /api/learning-path
   * Obtener todos los pasos con el progreso del usuario
   */
  async getLearningPath(userId: string) {
    // Obtener todos los pasos activos con populate de categoryId
    const allSteps = await this.learningStepsService.findAllWithCategory();

    // Obtener progreso del usuario (sin validar ObjectId aún, puede ser un ID simple)
    let userProgress: UserProgress[] = [];
    let completedStepIds: Types.ObjectId[] = [];

    try {
      userProgress = await this.userProgressService.findByUser(userId);
      completedStepIds = await this.userProgressService.getCompletedSteps(userId);
    } catch (error) {
      // Si falla (por ejemplo, userId no es ObjectId válido), devolver progreso vacío
      // Esto permite que usuarios con IDs simples (1, 2, 3) también funcionen
      console.log(`User ${userId} has no progress yet or invalid ID format`);
    }

    const completedIds = completedStepIds.map(id => id.toString());

    // Obtener los orders de los pasos completados para verificar unlock_requirements
    const completedOrders = new Set<number>();
    for (const progress of userProgress) {
      if (progress.status === 'completed') {
        const step = progress.stepId as any;
        if (step?.order) {
          completedOrders.add(step.order);
        }
      }
    }

    // Combinar información
    const steps = await Promise.all(
      allSteps.map(async (step: any) => {
        // Find progress for this step - handle both populated and non-populated stepId
        const progress = userProgress.find((p: any) => {
          const progressStepId = (p.stepId as any)?._id || p.stepId;
          const stepId = step._id;

          // Compare as strings
          const progressIdStr = progressStepId?.toString() || progressStepId;
          const stepIdStr = stepId?.toString() || stepId;

          return progressIdStr === stepIdStr;
        });

        // Verificar si está desbloqueado basado en los orders completados
        const unlocked = this.isStepUnlockedByOrders(step, completedOrders);

        return {
          id: step._id,
          title: step.title,
          description: step.description,
          emoji: step.emoji,
          type: step.type,
          order: step.order,
          categoryId: step.categoryId,
          color: step.color,
          bg_color: step.bg_color,
          route: step.route,
          required_score: step.required_score,
          status: progress ? progress.status : 'locked',
          score: progress ? progress.score : 0,
          unlocked,
          attempts_count: progress ? progress.attempts_count : 0,
        };
      }),
    );

    // Encontrar el paso actual (primer paso desbloqueado no completado)
    const currentStep = steps.find(
      (s) => s.unlocked && s.status !== 'completed',
    );

    return {
      steps: steps.sort((a, b) => a.order - b.order),
      current_step: currentStep ? currentStep.id : null,
    };
  }

  /**
   * POST /api/steps/:stepId/start
   * Iniciar un paso
   */
  async startStep(userId: string, stepId: string) {
    // Verificar que el paso existe
    const step = await this.learningStepsService.findOne(stepId);

    // Verificar que está desbloqueado
    // Necesitamos obtener los orders de los pasos completados
    const userProgress = await this.userProgressService.findByUser(userId);
    const completedOrders = new Set<number>();

    for (const progress of userProgress) {
      if (progress.status === 'completed') {
        const progressStep = progress.stepId as any;
        if (progressStep?.order) {
          completedOrders.add(progressStep.order);
        }
      }
    }

    const stepData = step as any;
    if (!this.isStepUnlockedByOrders(stepData, completedOrders)) {
      throw new BadRequestException('This step is locked. Complete required steps first.');
    }

    // Crear o actualizar progreso
    await this.userProgressService.unlockStep(userId, stepId);

    // Crear intento
    const attempt = await this.stepAttemptsService.startAttempt(userId, stepId);

    // Obtener el progreso actualizado (puede que no exista aún)
    let progress;
    try {
      progress = await this.userProgressService.findOne(userId, stepId);
    } catch (error) {
      // Si no existe, crearlo
      progress = await this.userProgressService.unlockStep(userId, stepId);
    }

    return {
      message: 'Paso iniciado',
      progress: {
        stepId: (progress.stepId as any)?._id || progress.stepId,
        status: progress.status,
        unlocked_at: progress.unlocked_at,
      },
      attempt_id: (attempt as any)._id,
    };
  }

  /**
   * POST /api/steps/:stepId/complete
   * Completar un paso
   */
  async completeStep(userId: string, stepId: string, completeDto: CompleteStepDto) {
    const { score, total_questions, correct_answers } = completeDto;

    // Obtener el paso
    const step = await this.learningStepsService.findOne(stepId);

    // Verificar si pasó
    const passed = score >= (step as any).required_score;

    // Guardar intento
    const attempts = await this.stepAttemptsService.findByUserAndStep(userId, stepId);
    const currentAttempt = attempts.find(a => !a.completed_at);

    if (currentAttempt) {
      await this.stepAttemptsService.completeAttempt(
        (currentAttempt as any)._id.toString(),
        score,
        total_questions,
        correct_answers,
        passed,
      );
    } else {
      // Si no hay intento activo, crear uno nuevo
      await this.stepAttemptsService.create({
        userId,
        stepId,
        score,
        total_questions,
        correct_answers,
        passed,
        started_at: new Date(),
        completed_at: new Date(),
      });
    }

    // Obtener progreso actual antes de actualizar
    let progress;
    try {
      progress = await this.userProgressService.findOne(userId, stepId);
    } catch (error) {
      // Si no existe, crearlo primero
      await this.userProgressService.unlockStep(userId, stepId);
      progress = await this.userProgressService.findOne(userId, stepId);
    }

    // Si pasó, actualizar progreso y desbloquear siguientes pasos
    const unlockedSteps: string[] = [];

    if (passed) {
      await this.userProgressService.completeStep(userId, stepId, score);
      const unlocked = await this.unlockNextSteps(userId, stepId);
      unlockedSteps.push(...unlocked);
    } else {
      // Incrementar intentos pero mantener en progreso
      progress.attempts_count += 1;
      await progress.save();
    }

    return {
      success: true,
      passed,
      score,
      required_score: (step as any).required_score,
      unlocked_steps: unlockedSteps,
      message: passed
        ? '¡Felicitaciones! Has completado el paso.'
        : 'Intenta de nuevo para alcanzar el score requerido.',
    };
  }

  /**
   * GET /api/user/current-step
   * Obtener el paso actual del usuario
   */
  async getCurrentStep(userId: string) {
    const path = await this.getLearningPath(userId);
    const currentStep = path.steps.find(
      (s) => s.unlocked && s.status !== 'completed',
    );

    if (!currentStep) {
      return {
        message: 'All steps completed!',
        current_step: null,
      };
    }

    return currentStep;
  }

  /**
   * Verificar si un paso está desbloqueado basado en los orders completados
   * Los unlock_requirements son números que corresponden a los "order" de los pasos
   */
  private isStepUnlockedByOrders(step: any, completedOrders: Set<number>): boolean {
    // Si no tiene requisitos, está desbloqueado
    if (!step.unlock_requirements || step.unlock_requirements.length === 0) {
      return true;
    }

    // Verificar que todos los requisitos estén completados
    return step.unlock_requirements.every((reqOrder: number) =>
      completedOrders.has(reqOrder)
    );
  }

  /**
   * Desbloquear los siguientes pasos
   * Retorna array de IDs de pasos desbloqueados
   * Los unlock_requirements son números que corresponden a los "order" de los pasos
   */
  private async unlockNextSteps(userId: string, completedStepId: string): Promise<string[]> {
    // Obtener todos los pasos
    const allSteps = await this.learningStepsService.findAll();

    // Obtener el progreso del usuario para saber qué pasos están completados
    const userProgress = await this.userProgressService.findByUser(userId);

    // Obtener los orders de los pasos completados
    // unlock_requirements contiene números que son los "order" de los pasos
    const completedOrders = new Set<number>();
    for (const progress of userProgress) {
      if (progress.status === 'completed') {
        const step = progress.stepId as any;
        if (step?.order) {
          completedOrders.add(step.order);
        }
      }
    }

    const unlockedStepIds: string[] = [];

    // Buscar pasos que ahora se pueden desbloquear
    for (const step of allSteps) {
      const stepData = step as any;

      // Si no tiene requisitos, ya está desbloqueado (se maneja en isStepUnlocked)
      if (!stepData.unlock_requirements || stepData.unlock_requirements.length === 0) {
        continue;
      }

      // Verificar que todos los requisitos estén completados
      // unlock_requirements son números que corresponden a los "order" de los pasos
      const allRequirementsMet = stepData.unlock_requirements.every((reqOrder: number) => {
        return completedOrders.has(reqOrder);
      });

      if (allRequirementsMet) {
        // Verificar si ya existe el progreso
        try {
          const existing = await this.userProgressService.findOne(userId, stepData._id.toString());
          // Si ya existe pero está locked, actualizarlo
          if (existing.status === 'locked') {
            await this.userProgressService.unlockStep(userId, stepData._id.toString());
            unlockedStepIds.push(stepData._id.toString());
          }
        } catch (error) {
          // Si no existe, desbloquearlo
          await this.userProgressService.unlockStep(userId, stepData._id.toString());
          unlockedStepIds.push(stepData._id.toString());
        }
      }
    }

    return unlockedStepIds;
  }
}

