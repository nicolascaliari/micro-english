import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GrammarTopicsController } from './grammar-topics.controller';
import { GrammarTopicsService } from './grammar-topics.service';
import { GrammarTopic, GrammarTopicSchema } from './schemas/grammar-topic.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GrammarTopic.name, schema: GrammarTopicSchema },
    ]),
  ],
  controllers: [GrammarTopicsController],
  providers: [GrammarTopicsService],
  exports: [GrammarTopicsService],
})
export class GrammarTopicsModule {}

