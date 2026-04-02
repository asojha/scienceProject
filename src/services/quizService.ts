import { v4 as uuidv4 } from 'uuid';
import { scienceQuestions, categories } from '../data/questions';
import { Question, QuizQuestion, QuizSession, Category, Difficulty, AnswerResult, CategoryInfo } from '../types';

// Session storage
const sessions: Map<string, QuizSession> = new Map();

// Encouragement messages
const CORRECT_MESSAGES = [
  "Amazing! You're a science superstar! 🌟",
  "Brilliant! Your brain is on fire! 🔥",
  "Fantastic! You really know your stuff! 🎉",
  "Incredible! You're a genius! 🧠",
  "Spectacular! Science high-five! ✋",
  "Outstanding! Einstein would be proud! 👨‍🔬",
  "Magnificent! You're rocking this quiz! 🎸",
  "Wonderful! Keep up the great work! 💪",
];

const INCORRECT_MESSAGES = [
  "Good try! Science is all about learning! 📚",
  "Not quite, but now you know something new! 🌱",
  "Oops! But hey, every scientist makes mistakes! 🔬",
  "Close! Keep exploring and you'll get it next time! 🔭",
  "That's okay! Learning is an adventure! 🗺️",
];

function getRandomMessage(messages: string[]): string {
  return messages[Math.floor(Math.random() * messages.length)];
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export const quizService = {
  getCategories(): CategoryInfo[] {
    return categories;
  },

  getQuestion(
    sessionId: string,
    category?: Category,
    difficulty?: Difficulty
  ): QuizQuestion | null {
    let availableQuestions = [...scienceQuestions];

    // Filter by category if specified
    if (category && category !== 'all' as any) {
      availableQuestions = availableQuestions.filter(q => q.category === category);
    }

    // Filter by difficulty if specified
    if (difficulty) {
      availableQuestions = availableQuestions.filter(q => q.difficulty === difficulty);
    }

    // Get or create session
    let session = sessions.get(sessionId);
    if (!session) {
      session = {
        score: 0,
        streak: 0,
        totalAnswered: 0,
        correctAnswered: 0,
        questionsAnswered: [],
      };
      sessions.set(sessionId, session);
    }

    // Filter out already answered questions
    availableQuestions = availableQuestions.filter(
      q => !session!.questionsAnswered.includes(q.id)
    );

    if (availableQuestions.length === 0) {
      // Reset if all questions answered
      session.questionsAnswered = [];
      availableQuestions = category
        ? scienceQuestions.filter(q => q.category === category)
        : [...scienceQuestions];
    }

    // Pick a random question
    const question = availableQuestions[Math.floor(Math.random() * availableQuestions.length)];

    // Return question without correct answer
    return {
      id: question.id,
      question: question.question,
      options: question.options,
      category: question.category,
      difficulty: question.difficulty,
      imageHint: question.imageHint,
    };
  },

  checkAnswer(sessionId: string, questionId: string, answerIndex: number): AnswerResult {
    const question = scienceQuestions.find(q => q.id === questionId);

    if (!question) {
      return {
        correct: false,
        message: 'Question not found!',
        funFact: '',
        correctAnswer: '',
        score: 0,
        streak: 0,
        totalAnswered: 0,
        correctAnswered: 0,
      };
    }

    // Get or create session
    let session = sessions.get(sessionId);
    if (!session) {
      session = {
        score: 0,
        streak: 0,
        totalAnswered: 0,
        correctAnswered: 0,
        questionsAnswered: [],
      };
      sessions.set(sessionId, session);
    }

    const isCorrect = answerIndex === question.correctAnswer;
    session.totalAnswered++;
    session.questionsAnswered.push(questionId);

    if (isCorrect) {
      session.correctAnswered++;
      session.streak++;

      // Points based on difficulty
      const points = question.difficulty === 'easy' ? 10
        : question.difficulty === 'medium' ? 20
        : 30;

      session.score += points;

      // Streak bonus
      if (session.streak >= 3) {
        session.score += 5;
      }
    } else {
      session.streak = 0;
    }

    sessions.set(sessionId, session);

    return {
      correct: isCorrect,
      message: isCorrect ? getRandomMessage(CORRECT_MESSAGES) : getRandomMessage(INCORRECT_MESSAGES),
      funFact: question.funFact,
      correctAnswer: question.options[question.correctAnswer],
      score: session.score,
      streak: session.streak,
      totalAnswered: session.totalAnswered,
      correctAnswered: session.correctAnswered,
    };
  },

  getScore(sessionId: string) {
    const session = sessions.get(sessionId);
    if (!session) {
      return {
        score: 0,
        streak: 0,
        totalAnswered: 0,
        correctAnswered: 0,
        accuracy: 0,
      };
    }

    return {
      score: session.score,
      streak: session.streak,
      totalAnswered: session.totalAnswered,
      correctAnswered: session.correctAnswered,
      accuracy: session.totalAnswered > 0
        ? Math.round((session.correctAnswered / session.totalAnswered) * 100)
        : 0,
    };
  },

  resetSession(sessionId: string): void {
    sessions.delete(sessionId);
  },

  getQuestionCount(category?: Category): number {
    if (category) {
      return scienceQuestions.filter(q => q.category === category).length;
    }
    return scienceQuestions.length;
  },
};
