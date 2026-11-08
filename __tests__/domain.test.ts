jest.mock('react-native-image-picker', () => ({
  launchCamera: jest.fn(),
  launchImageLibrary: jest.fn(),
}));
jest.mock('rn-mlkit-ocr', () => ({
  recognizeText: jest.fn(),
}));

import { cleanOcrText, suggestTitleFromText } from '../src/study/data/imageText';
import { comparable, generateQuestions } from '../src/study/domain/questions';
import { checkAnswer, getStudyQuestions, grade, recordAttempt, shuffle } from '../src/study/domain/study';
import type { Attempt, Question, Quiz } from '../src/study/domain/types';

describe('data/imageText OCR post-processing', () => {
  test('cleanOcrText unifies hyphenated words at line breaks', () => {
    const raw = 'de for-\nma aislada y con-\nclusión';
    expect(cleanOcrText(raw)).toBe('de forma aislada y conclusión');
  });

  test('suggestTitleFromText extracts first meaningful heading', () => {
    const raw = `LA GUIA HUMANÍSTICA\n2. VERDAD Y VALIDEZ\n2.1. La verdad`;
    expect(suggestTitleFromText(raw)).toBe('La guia humanística');

    const numbered = `2. VERDAD Y VALIDEZ\nTexto explicativo...`;
    expect(suggestTitleFromText(numbered)).toBe('Verdad y validez');
  });
});

describe('domain/questions', () => {
  test('comparable normalizes accents, punctuation and casing', () => {
    expect(comparable('¡Memoria Sensorial!')).toBe('memoria sensorial');
    expect(comparable('¿Canción?')).toBe('cancion');
    expect(comparable('Año')).toBe('año'); // preserves ñ
  });

  test('generateQuestions generates questions from source text', () => {
    const text = 'La memoria sensorial conserva por instantes la información. Hermann Ebbinghaus publicó su estudio sobre la memoria en 1885.';
    const questions = generateQuestions([{ text }]);
    expect(questions.length).toBeGreaterThan(0);
    expect(questions[0]).toHaveProperty('prompt');
    expect(questions[0]).toHaveProperty('answer');
    expect(questions[0]).toHaveProperty('evidence');
  });

  test('generateQuestions supports colon definitions (key-value pairs)', () => {
    const text = `Variable independiente: enseñanza con herramientas virtuales
Variable dependiente: rendimiento académico en el curso de biología
Variables controladas: alumnos preuniversitarios del distrito de Comas
Grupo experimental: alumnos a quienes se les enseñará biología con herramientas virtuales.
Grupo de control: alumnos a quienes se les enseñará biología de modo tradicional.`;
    const questions = generateQuestions([{ text }]);
    expect(questions.length).toBeGreaterThan(0);
    const answers = questions.map(q => q.answer);
    expect(answers.some(a => a.includes('Variable') || a.includes('Grupo'))).toBe(true);
  });

  test('generateQuestions supports author theory questions and condition questions', () => {
    const text = `Chaim Perelman sostiene que argumentar implica influir sobre un auditorio y modificar sus disposiciones.
Stephen Toulmin sostiene que argumentar es el acto de justificar nuestras afirmaciones mediante razones.
Si las notas del grupo experimental son mayores que las del grupo de control, entonces se acepta la hipótesis propuesta al inicio.`;
    const questions = generateQuestions([{ text }]);
    expect(questions.length).toBeGreaterThan(0);
    const authorQuestion = questions.find(q => q.prompt.includes('¿Qué autor'));
    expect(authorQuestion).toBeDefined();
    expect(['Chaim Perelman', 'Stephen Toulmin']).toContain(authorQuestion?.answer);

    const condQuestion = questions.find(q => q.prompt.includes('Si las notas'));
    expect(condQuestion).toBeDefined();
    expect(condQuestion?.answer).toContain('se acepta la hipótesis');
  });
});

describe('domain/study', () => {
  const dummyQuestion: Question = {
    id: 'q1',
    prompt: 'La ___ conserva información.',
    answer: 'memoria sensorial',
    options: ['memoria sensorial', 'memoria episódica'],
    evidence: { page: 1, text: 'evidencia' },
  };

  test('checkAnswer validates multiple-choice and open text', () => {
    expect(checkAnswer(dummyQuestion, 'memoria sensorial')).toBe(true);
    expect(checkAnswer(dummyQuestion, 'incorrecto')).toBe(false);

    const openQuestion: Question = {
      ...dummyQuestion,
      options: [],
    };
    expect(checkAnswer(openQuestion, 'la memoria sensorial')).toBe(true);
    expect(checkAnswer(openQuestion, 'Memoria Sensorial')).toBe(true);
  });

  test('grade evaluates responses and returns an Attempt', () => {
    const attempt = grade('exam', [dummyQuestion], { q1: 'memoria sensorial' });
    expect(attempt.mode).toBe('exam');
    expect(attempt.answers).toHaveLength(1);
    expect(attempt.answers[0].correct).toBe(true);
  });

  test('recordAttempt updates pendingErrors in Quiz', () => {
    const baseQuiz: Quiz = {
      id: 'quiz-1',
      title: 'Test Quiz',
      createdAt: Date.now(),
      pages: [{ text: 'Página 1' }],
      questions: [dummyQuestion],
      marked: [],
      pendingErrors: [],
      attempts: [],
    };

    const failedAttempt: Attempt = {
      id: 'att-1',
      mode: 'exam',
      finishedAt: Date.now(),
      answers: [{ questionId: 'q1', response: 'errónea', correct: false }],
    };

    const quizWithErrors = recordAttempt(baseQuiz, failedAttempt);
    expect(quizWithErrors.pendingErrors).toContain('q1');
    expect(quizWithErrors.attempts).toHaveLength(1);

    const passedAttempt: Attempt = {
      id: 'att-2',
      mode: 'errors',
      finishedAt: Date.now(),
      answers: [{ questionId: 'q1', response: 'memoria sensorial', correct: true }],
    };

    const quizResolved = recordAttempt(quizWithErrors, passedAttempt);
    expect(quizResolved.pendingErrors).not.toContain('q1');
    expect(quizResolved.attempts).toHaveLength(2);
  });

  test('getStudyQuestions filters questions according to mode', () => {
    const quiz: Quiz = {
      id: 'quiz-1',
      title: 'Test',
      createdAt: Date.now(),
      pages: [],
      questions: [dummyQuestion],
      marked: ['q1'],
      pendingErrors: ['q1'],
      attempts: [],
    };

    expect(getStudyQuestions(quiz, 'exam')).toHaveLength(1);
    expect(getStudyQuestions(quiz, 'errors')).toHaveLength(1);
    expect(getStudyQuestions(quiz, 'marked')).toHaveLength(1);
  });

  test('shuffle preserves array length and elements', () => {
    const items = [1, 2, 3, 4, 5];
    const shuffled = shuffle(items);
    expect(shuffled).toHaveLength(5);
    expect(shuffled.sort()).toEqual(items.sort());
  });
});

