import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Vocabulary } from '../vocabulary/schemas/vocabulary.schema';
import { GrammarExercise } from '../grammar-exercises/schemas/grammar-exercise.schema';
import { GrammarTopic } from '../grammar-topics/schemas/grammar-topic.schema';
import { LearningStep } from '../learning-steps/schemas/learning-step.schema';

@Injectable()
export class ExamService {
    constructor(
        @InjectModel(Vocabulary.name) private vocabularyModel: Model<Vocabulary>,
        @InjectModel(GrammarExercise.name)
        private grammarExerciseModel: Model<GrammarExercise>,
        @InjectModel(GrammarTopic.name) private grammarTopicModel: Model<GrammarTopic>,
        @InjectModel(LearningStep.name) private learningStepModel: Model<LearningStep>,
    ) { }

    /**
     * Get final exam for a specific step, filtering content by that step's category
     */
    async getExamByStep(stepId: string) {
        // 1. Get the exam step to find its category
        const examStep = await this.learningStepModel.findById(stepId);
        if (!examStep) {
            throw new NotFoundException('Exam step not found');
        }

        if (!examStep.categoryId) {
            throw new NotFoundException('Exam step has no category associated');
        }

        const categoryId = examStep.categoryId;
        const categoryIdObj = new Types.ObjectId(categoryId.toString());

        console.log(`Generating exam for category: ${categoryId}`);

        // 2. Get vocabulary questions for this category
        const vocabularyQuestions = await this.vocabularyModel
            .aggregate([
                {
                    $match: {
                        $or: [
                            { categoryId: categoryIdObj },
                            { categoryId: categoryId.toString() }
                        ]
                    },
                },
                { $sample: { size: 10 } },
                {
                    $project: {
                        _id: 1,
                        word: 1,
                        translation: 1,
                        answer: '$translation',
                        level: 1,
                        type: { $literal: 'vocabulary' },
                    },
                },
            ])
            .exec();

        console.log(`Found ${vocabularyQuestions.length} vocabulary questions for category ${categoryId}`);

        // 3. Get grammar questions for this category
        // First find topics in this category
        const topics = await this.grammarTopicModel
            .find({
                $or: [
                    { categoryId: categoryIdObj },
                    { categoryId: categoryId.toString() }
                ]
            })
            .select('_id')
            .exec();

        const topicIds = topics.map((t) => t._id);
        const topicIdsStr = topics.map((t) => t._id.toString());

        console.log(`Found ${topics.length} grammar topics for category ${categoryId}`, topicIds);

        const grammarQuestions = await this.grammarExerciseModel
            .aggregate([
                {
                    $match: {
                        $or: [
                            { topicId: { $in: topicIds } },
                            { topicId: { $in: topicIdsStr } }
                        ]
                    },
                },
                { $sample: { size: 10 } },
                {
                    $project: {
                        _id: 1,
                        question: 1,
                        type: { $literal: 'grammar' },
                        exerciseType: '$type',
                        options: 1,
                        answer: 1,
                        explanation: 1,
                        difficulty: 1,
                        sentenceParts: 1,
                    },
                },
            ])
            .exec();

        console.log(`Found ${grammarQuestions.length} grammar questions`);

        // Combine and shuffle questions
        const allQuestions = [...vocabularyQuestions, ...grammarQuestions];
        const shuffled = this.shuffleArray(allQuestions);

        return {
            questions: shuffled,
            total: shuffled.length,
            required_score: examStep.required_score || 85,
            time_limit: 30 * 60, // 30 minutes in seconds
        };
    }

    // Legacy method - keeping for backward compatibility if needed, but updated to be safer
    async getFinalExam(userId: string) {
        // This method is deprecated in favor of getExamByStep
        // Fallback behavior: get generic mix

        const vocabularyQuestions = await this.vocabularyModel
            .aggregate([
                { $sample: { size: 10 } },
                {
                    $project: {
                        _id: 1,
                        word: 1,
                        translation: 1,
                        level: 1,
                        type: { $literal: 'vocabulary' },
                    },
                },
            ])
            .exec();

        const grammarQuestions = await this.grammarExerciseModel
            .aggregate([
                { $sample: { size: 10 } },
                {
                    $project: {
                        _id: 1,
                        question: 1,
                        type: { $literal: 'grammar' },
                        exerciseType: '$type',
                        options: 1,
                        answer: 1,
                        explanation: 1,
                        difficulty: 1,
                        sentenceParts: 1,
                    },
                },
            ])
            .exec();

        const allQuestions = [...vocabularyQuestions, ...grammarQuestions];
        const shuffled = this.shuffleArray(allQuestions);

        return {
            questions: shuffled,
            total: shuffled.length,
            required_score: 85,
            time_limit: 30 * 60,
        };
    }

    private shuffleArray<T>(array: T[]): T[] {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
}
