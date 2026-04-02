import { Router, Request, Response } from 'express';
import { quizService } from '../services/quizService';
import { Category, Difficulty } from '../types';

const router = Router();

// Health check
router.get('/health', (_req: Request, res: Response) => {
  res.json({ success: true, status: 'UP', message: 'Science Quest is running!' });
});

// Get all categories
router.get('/categories', (_req: Request, res: Response) => {
  const categories = quizService.getCategories();
  res.json({
    success: true,
    data: categories,
  });
});

// Get a question
router.get('/question', (req: Request, res: Response) => {
  const sessionId = (req.query.sessionId as string) || 'default';
  const category = req.query.category as Category | undefined;
  const difficulty = req.query.difficulty as Difficulty | undefined;

  const question = quizService.getQuestion(sessionId, category, difficulty);

  if (!question) {
    return res.status(404).json({
      success: false,
      error: 'No questions available',
    });
  }

  res.json({
    success: true,
    data: question,
  });
});

// Submit an answer
router.post('/answer', (req: Request, res: Response) => {
  const sessionId = (req.query.sessionId as string) || 'default';
  const questionId = req.query.questionId as string;
  const answerIndex = parseInt(req.query.answerIndex as string, 10);

  if (!questionId || isNaN(answerIndex)) {
    return res.status(400).json({
      success: false,
      error: 'Missing questionId or answerIndex',
    });
  }

  const result = quizService.checkAnswer(sessionId, questionId, answerIndex);

  res.json({
    success: true,
    data: result,
  });
});

// Get current score
router.get('/score', (req: Request, res: Response) => {
  const sessionId = (req.query.sessionId as string) || 'default';
  const score = quizService.getScore(sessionId);

  res.json({
    success: true,
    data: score,
  });
});

// Reset session
router.post('/reset', (req: Request, res: Response) => {
  const sessionId = (req.query.sessionId as string) || 'default';
  quizService.resetSession(sessionId);

  res.json({
    success: true,
    message: 'Session reset! Ready for a new adventure!',
  });
});

// Get question count
router.get('/count', (req: Request, res: Response) => {
  const category = req.query.category as Category | undefined;
  const count = quizService.getQuestionCount(category);

  res.json({
    success: true,
    data: { count },
  });
});

export default router;
