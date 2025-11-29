export class CreateGrammarExerciseDto {
  topicId: string;
  type: 'multiple_choice' | 'fill_blank' | 'sentence_order' | 'writing';
  question: string;
  options?: string[];
  answer: string;
  sentenceParts?: string[];
  explanation?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}

