import { comparable } from './questions';
import type { Attempt, GradedMode, Question, Quiz, StudyMode } from './types';

export const MODE_LABEL: Record<StudyMode, string> = {
  exam: 'Simulacro',
  errors: 'Repasar errores',
  marked: 'Repasar marcadas',
  cards: 'Tarjetas',
};

export function makeId(): string {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

export function shuffle<T>(items: T[], random = Math.random): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swap = Math.floor(random() * (index + 1));
    [result[index], result[swap]] = [result[swap], result[index]];
  }
  return result;
}

export function getStudyQuestions(quiz: Quiz, mode: StudyMode, onlyMarked = false): Question[] {
  if (mode === 'errors') return quiz.questions.filter(question => quiz.pendingErrors.includes(question.id));
  if (mode === 'marked' || (mode === 'cards' && onlyMarked)) {
    return quiz.questions.filter(question => quiz.marked.includes(question.id));
  }
  return quiz.questions;
}

export function startStudy(questions: Question[]): Question[] {
  return shuffle(questions).map(question => ({ ...question, options: shuffle(question.options) }));
}

export function checkAnswer(question: Question, response: string): boolean {
  if (question.options.length) return response === question.answer;
  const clean = (value: string) => comparable(value).replace(/^(?:el|la|los|las|un|una) /u, '');
  return clean(question.answer) === clean(response);
}

export function grade(mode: GradedMode, questions: Question[], responses: Record<string, string>): Attempt {
  return {
    id: makeId(),
    mode,
    finishedAt: Date.now(),
    answers: questions.map(question => {
      const response = (responses[question.id] ?? '').trim();
      return { questionId: question.id, response, correct: checkAnswer(question, response) };
    }),
  };
}

export function recordAttempt(quiz: Quiz, attempt: Attempt): Quiz {
  if (quiz.attempts.some(item => item.id === attempt.id)) return quiz;
  const pendingErrors = new Set(quiz.pendingErrors);
  for (const answer of attempt.answers) {
    if (answer.correct) pendingErrors.delete(answer.questionId);
    else pendingErrors.add(answer.questionId);
  }
  return { ...quiz, pendingErrors: Array.from(pendingErrors), attempts: [attempt, ...quiz.attempts].slice(0, 30) };
}
