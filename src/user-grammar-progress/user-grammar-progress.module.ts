import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserGrammarProgressController } from './user-grammar-progress.controller';
import { UserGrammarProgressService } from './user-grammar-progress.service';
import {
  UserGrammarProgress,
  UserGrammarProgressSchema,
} from './schemas/user-grammar-progress.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserGrammarProgress.name, schema: UserGrammarProgressSchema },
    ]),
  ],
  controllers: [UserGrammarProgressController],
  providers: [UserGrammarProgressService],
  exports: [UserGrammarProgressService],
})
export class UserGrammarProgressModule {}

