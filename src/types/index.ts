export type Category =
  | 'space'
  | 'animals'
  | 'plants'
  | 'human-body'
  | 'weather'
  | 'chemistry'
  | 'physics'
  | 'earth'
  | 'oceans'
  | 'dinosaurs'
  | 'energy'
  | 'magnets';

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number; // Index of correct option
  category: Category;
  difficulty: Difficulty;
  funFact: string;
  imageHint?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  category: Category;
  difficulty: Difficulty;
  imageHint?: string;
}

export interface AnswerResult {
  correct: boolean;
  message: string;
  funFact: string;
  correctAnswer: string;
  score: number;
  streak: number;
  totalAnswered: number;
  correctAnswered: number;
}

export interface QuizSession {
  score: number;
  streak: number;
  totalAnswered: number;
  correctAnswered: number;
  questionsAnswered: string[];
}

export interface CategoryInfo {
  id: Category;
  name: string;
  emoji: string;
  description: string;
}
