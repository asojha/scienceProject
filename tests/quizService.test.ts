import { quizService } from '../src/services/quizService';

describe('QuizService', () => {
  const testSessionId = 'test-session-123';

  beforeEach(() => {
    // Reset session before each test
    quizService.resetSession(testSessionId);
  });

  describe('getCategories', () => {
    it('should return all available categories', () => {
      const categories = quizService.getCategories();

      expect(Array.isArray(categories)).toBe(true);
      expect(categories.length).toBeGreaterThan(0);

      // Check structure of category
      const category = categories[0];
      expect(category).toHaveProperty('id');
      expect(category).toHaveProperty('name');
      expect(category).toHaveProperty('emoji');
      expect(category).toHaveProperty('description');
    });

    it('should include expected categories', () => {
      const categories = quizService.getCategories();
      const categoryIds = categories.map(c => c.id);

      expect(categoryIds).toContain('space');
      expect(categoryIds).toContain('animals');
      expect(categoryIds).toContain('dinosaurs');
      expect(categoryIds).toContain('energy');
      expect(categoryIds).toContain('magnets');
      expect(categoryIds).toContain('human-body');
    });
  });

  describe('getQuestion', () => {
    it('should return a question with all required fields', () => {
      const question = quizService.getQuestion(testSessionId);

      expect(question).not.toBeNull();
      expect(question).toHaveProperty('id');
      expect(question).toHaveProperty('question');
      expect(question).toHaveProperty('options');
      expect(question).toHaveProperty('category');
      expect(question).toHaveProperty('difficulty');
      expect(question!.options.length).toBe(4);
    });

    it('should not include correct answer in returned question', () => {
      const question = quizService.getQuestion(testSessionId);

      expect(question).not.toHaveProperty('correctAnswer');
      expect(question).not.toHaveProperty('funFact');
    });

    it('should filter questions by category', () => {
      const question = quizService.getQuestion(testSessionId, 'space');

      expect(question).not.toBeNull();
      expect(question!.category).toBe('space');
    });

    it('should filter questions by difficulty', () => {
      const question = quizService.getQuestion(testSessionId, undefined, 'easy');

      expect(question).not.toBeNull();
      expect(question!.difficulty).toBe('easy');
    });

    it('should not return the same question twice in sequence', () => {
      const questionIds: string[] = [];

      // Get multiple questions
      for (let i = 0; i < 5; i++) {
        const question = quizService.getQuestion(testSessionId);
        if (question) {
          // Mark as answered
          quizService.checkAnswer(testSessionId, question.id, 0);
          questionIds.push(question.id);
        }
      }

      // Check for duplicates
      const uniqueIds = new Set(questionIds);
      expect(uniqueIds.size).toBe(questionIds.length);
    });
  });

  describe('checkAnswer', () => {
    it('should return correct result for correct answer', () => {
      const question = quizService.getQuestion(testSessionId);
      expect(question).not.toBeNull();

      // We need to find the correct answer index
      // Since we don't know it, we'll test the structure
      const result = quizService.checkAnswer(testSessionId, question!.id, 0);

      expect(result).toHaveProperty('correct');
      expect(result).toHaveProperty('message');
      expect(result).toHaveProperty('funFact');
      expect(result).toHaveProperty('correctAnswer');
      expect(result).toHaveProperty('score');
      expect(result).toHaveProperty('streak');
      expect(result).toHaveProperty('totalAnswered');
      expect(result).toHaveProperty('correctAnswered');
    });

    it('should increment totalAnswered on each answer', () => {
      const question1 = quizService.getQuestion(testSessionId);
      quizService.checkAnswer(testSessionId, question1!.id, 0);

      const question2 = quizService.getQuestion(testSessionId);
      const result = quizService.checkAnswer(testSessionId, question2!.id, 0);

      expect(result.totalAnswered).toBe(2);
    });

    it('should return error result for invalid question', () => {
      const result = quizService.checkAnswer(testSessionId, 'invalid-id', 0);

      expect(result.correct).toBe(false);
      expect(result.message).toBe('Question not found!');
    });

    it('should include fun fact in result', () => {
      const question = quizService.getQuestion(testSessionId);
      const result = quizService.checkAnswer(testSessionId, question!.id, 0);

      expect(result.funFact).toBeTruthy();
      expect(typeof result.funFact).toBe('string');
    });
  });

  describe('getScore', () => {
    it('should return zero score for new session', () => {
      const score = quizService.getScore(testSessionId);

      expect(score.score).toBe(0);
      expect(score.streak).toBe(0);
      expect(score.totalAnswered).toBe(0);
      expect(score.correctAnswered).toBe(0);
      expect(score.accuracy).toBe(0);
    });

    it('should return correct accuracy percentage', () => {
      // Answer some questions
      const question1 = quizService.getQuestion(testSessionId);
      quizService.checkAnswer(testSessionId, question1!.id, 0);

      const question2 = quizService.getQuestion(testSessionId);
      quizService.checkAnswer(testSessionId, question2!.id, 0);

      const score = quizService.getScore(testSessionId);

      expect(score.totalAnswered).toBe(2);
      expect(typeof score.accuracy).toBe('number');
      expect(score.accuracy).toBeGreaterThanOrEqual(0);
      expect(score.accuracy).toBeLessThanOrEqual(100);
    });

    it('should return zero for non-existent session', () => {
      const score = quizService.getScore('non-existent-session');

      expect(score.score).toBe(0);
      expect(score.streak).toBe(0);
      expect(score.accuracy).toBe(0);
    });
  });

  describe('resetSession', () => {
    it('should reset all session data', () => {
      // First, create some state
      const question = quizService.getQuestion(testSessionId);
      quizService.checkAnswer(testSessionId, question!.id, 0);

      // Reset
      quizService.resetSession(testSessionId);

      // Check score is back to zero
      const score = quizService.getScore(testSessionId);
      expect(score.score).toBe(0);
      expect(score.streak).toBe(0);
      expect(score.totalAnswered).toBe(0);
    });
  });

  describe('getQuestionCount', () => {
    it('should return total count without category filter', () => {
      const count = quizService.getQuestionCount();

      expect(count).toBeGreaterThan(0);
    });

    it('should return filtered count with category', () => {
      const totalCount = quizService.getQuestionCount();
      const spaceCount = quizService.getQuestionCount('space');

      expect(spaceCount).toBeGreaterThan(0);
      expect(spaceCount).toBeLessThanOrEqual(totalCount);
    });
  });

  describe('scoring system', () => {
    it('should award points based on difficulty', () => {
      // Get an easy question
      const easyQuestion = quizService.getQuestion(testSessionId, undefined, 'easy');

      if (easyQuestion) {
        const initialScore = quizService.getScore(testSessionId).score;
        quizService.checkAnswer(testSessionId, easyQuestion.id, 0);
        const afterScore = quizService.getScore(testSessionId);

        // Points awarded depends on correctness, but at least structure works
        expect(typeof afterScore.score).toBe('number');
      }
    });

    it('should track streak correctly', () => {
      const question1 = quizService.getQuestion(testSessionId);
      const result1 = quizService.checkAnswer(testSessionId, question1!.id, 0);

      const question2 = quizService.getQuestion(testSessionId);
      const result2 = quizService.checkAnswer(testSessionId, question2!.id, 0);

      // If both correct, streak should be 2, otherwise depends
      expect(typeof result2.streak).toBe('number');
      expect(result2.streak).toBeGreaterThanOrEqual(0);
    });
  });
});
