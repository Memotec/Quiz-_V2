export interface Option {
  key: string;
  text: string;
}

export interface Question {
  id: string;
  stt: number;
  category: string;
  title: string;
  options: Option[];
  answer: string;
}

export type QuizMode = 'practice' | 'exam';

export interface UserAnswer {
  questionId: string;
  selectedOptionKey: string | null; // e.g. 'a', 'b', etc
  isCorrect: boolean | null;         // null if in exam mode (revealed only at the end)
  isFlagged: boolean;               // flagged for review
}

export interface QuizSession {
  mode: QuizMode;
  questions: Question[];
  currentIndex: number;
  answers: Record<string, UserAnswer>; // key: questionId
  startTime: number;
  durationSeconds: number; // For exam mode countdown
  timeRemaining: number;
  isCompleted: boolean;
  score: number;
}

export interface SavedQuizSession {
  mode: QuizMode;
  questionCount: number;
  selectedCategories: string[];
  shuffle: boolean;
  durationMinutes: number;
  sessionQuestions: Question[];
  currentIndex: number;
  answers: Record<string, UserAnswer>;
  timeRemaining: number;
  timeSpent: number;
}

export interface ExamHistoryItem {
  id: string;
  date: string;
  mode: QuizMode;
  categoryName: string; // "Tất cả" or a specific category
  totalQuestions: number;
  correctAnswersCount: number;
  score: number;        // e.g. out of 10.0 scale
  timeSpentSeconds: number;
  passed: boolean;
}

export interface AppStats {
  totalPractices: number;
  totalExams: number;
  averageExamScore: number;
  passingRate: number; // percentage
  categoryCorrectRate: Record<string, { correct: number; total: number }>;
}
