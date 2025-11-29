export class CreateUserGrammarProgressDto {
  userId: string;
  topicId: string;
  status?: 'not_started' | 'in_progress' | 'completed';
}

