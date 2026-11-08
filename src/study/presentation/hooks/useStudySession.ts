import { useCallback, useRef, useState } from 'react';
import { Alert } from 'react-native';
import { grade } from '../../domain/study';
import type { Attempt, Question, Quiz, StudyMode } from '../../domain/types';

type StudySessionHookOptions = {
  quiz: Quiz;
  questions: Question[];
  mode: StudyMode;
  onFinish: (attempt?: Attempt) => Promise<boolean>;
};

export function useStudySession({ quiz, questions, mode, onFinish }: StudySessionHookOptions) {
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState(false);
  const pendingAttempt = useRef<Attempt | null>(null);

  const question = questions[index];
  const response = responses[question?.id] ?? '';
  const isCards = mode === 'cards';
  const isExam = mode === 'exam';
  const isLast = index === questions.length - 1;
  const isMarked = question ? quiz.marked.includes(question.id) : false;
  const answeredCount = questions.filter(item => responses[item.id]?.trim()).length;

  const setResponse = useCallback((value: string) => {
    if (!question) return;
    pendingAttempt.current = null;
    setResponses(current => ({ ...current, [question.id]: value }));
  }, [question]);

  const move = useCallback((target: number) => {
    setIndex(target);
    setRevealed(false);
  }, []);

  const toggleRevealed = useCallback(() => {
    setRevealed(current => !current);
  }, []);

  const reveal = useCallback(() => {
    setRevealed(true);
  }, []);

  const finish = useCallback(() => {
    if (mode === 'cards') {
      onFinish().catch(() => {});
      return;
    }

    const submit = () => {
      pendingAttempt.current ??= grade(mode, questions, responses);
      onFinish(pendingAttempt.current).catch(() => {});
    };

    const missing = questions.length - answeredCount;
    if (isExam && missing > 0) {
      Alert.alert(
        'Entregar simulacro',
        `Quedan ${missing} sin responder. Se registrarán como errores.`,
        [
          { text: 'Seguir respondiendo', style: 'cancel' },
          { text: 'Entregar', onPress: submit },
        ],
      );
      return;
    }
    submit();
  }, [answeredCount, isExam, mode, onFinish, questions, responses]);

  return {
    index,
    question,
    response,
    responses,
    revealed,
    isCards,
    isExam,
    isLast,
    isMarked,
    answeredCount,
    setResponse,
    move,
    toggleRevealed,
    reveal,
    finish,
  };
}
