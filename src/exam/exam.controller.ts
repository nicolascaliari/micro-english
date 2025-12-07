import { Controller, Get, Param } from '@nestjs/common';
import { ExamService } from './exam.service';

@Controller('exam')
export class ExamController {
    constructor(private readonly examService: ExamService) { }

    /**
     * GET /exam/final/:userId
     * Get final exam with mixed vocabulary and grammar questions
     */
    @Get('final/:userId')
    async getFinalExam(@Param('userId') userId: string) {
        return this.examService.getFinalExam(userId);
    }

    /**
     * GET /exam/step/:stepId
     * Get exam questions filtered by the step's category
     */
    @Get('step/:stepId')
    async getExamByStep(@Param('stepId') stepId: string) {
        return this.examService.getExamByStep(stepId);
    }
}
