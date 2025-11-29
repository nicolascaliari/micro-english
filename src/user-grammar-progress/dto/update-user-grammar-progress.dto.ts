export class UpdateUserGrammarProgressDto {
  status?: 'not_started' | 'in_progress' | 'completed';
  exercisesCompleted?: number;
  correctRatio?: number;
  lastPractice?: Date;
}

