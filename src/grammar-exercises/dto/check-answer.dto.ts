export class CheckAnswerDto {
  exerciseId: string;
  userAnswer: string;
}

export class CheckAnswerResponseDto {
  correct: boolean;
  correctAnswer: string;
  explanation?: string;
}

