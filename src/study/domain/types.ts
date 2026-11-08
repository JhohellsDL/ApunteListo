export type SourcePage = { text: string };

export type Question = {
  id: string;
  prompt: string;
  answer: string;
  options: string[];
  evidence: { page: number; text: string };
};

export type GradedMode = 'exam' | 'errors' | 'marked';
export type StudyMode = GradedMode | 'cards';

export type GradedAnswer = {
  questionId: string;
  response: string;
  correct: boolean;
};

export type Attempt = {
  id: string;
  mode: GradedMode;
  finishedAt: number;
  answers: GradedAnswer[];
};

export type Quiz = {
  id: string;
  title: string;
  createdAt: number;
  pages: SourcePage[];
  questions: Question[];
  marked: string[];
  pendingErrors: string[];
  attempts: Attempt[];
};
