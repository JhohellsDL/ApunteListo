import { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Alert, BackHandler, Text } from 'react-native';
import { deleteQuiz, loadQuizzes, storeQuiz } from '../data/quizRepository';
import { getStudyQuestions, recordAttempt, startStudy } from '../domain/study';
import type { Attempt, Question, Quiz, StudyMode } from '../domain/types';
import { QuizBuilder } from './QuizBuilder';
import { QuizDetail, QuizMaterial, StudyHome } from './StudyLibrary';
import { StudyResult, StudySession } from './StudySession';
import { Button, color, Header, Notice, Panel, Screen, styles } from './ui';

type Route =
  | { name: 'home' }
  | { name: 'builder' }
  | { name: 'detail' | 'material'; quizId: string }
  | { name: 'session'; quizId: string; mode: StudyMode; questions: Question[] }
  | { name: 'result'; quizId: string; attempt: Attempt };

export function StudyApp({ onExit }: { onExit?: () => void }) {
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [route, setRoute] = useState<Route>({ name: 'home' });
  const [phase, setPhase] = useState<'loading' | 'error' | 'ready'>('loading');
  const [saving, setSaving] = useState(false);
  const writing = useRef(false);

  const reload = useCallback(async () => {
    setPhase('loading');
    try {
      setQuizzes(await loadQuizzes());
      setPhase('ready');
    } catch {
      setPhase('error');
    }
  }, []);

  useEffect(() => { void reload(); }, [reload]);

  const goBack = useCallback((): boolean => {
    if (writing.current) return true;
    switch (route.name) {
      case 'home':
        if (!onExit) return false;
        onExit();
        return true;
      case 'detail':
        setRoute({ name: 'home' });
        return true;
      case 'material':
      case 'result':
        setRoute({ name: 'detail', quizId: route.quizId });
        return true;
      case 'builder':
        Alert.alert('Salir del editor', 'El borrador se descartará.', [
          { text: 'Seguir editando', style: 'cancel' },
          { text: 'Descartar', style: 'destructive', onPress: () => setRoute({ name: 'home' }) },
        ]);
        return true;
      case 'session':
        if (route.mode === 'cards') {
          setRoute({ name: 'detail', quizId: route.quizId });
          return true;
        }
        Alert.alert('Salir del repaso', 'Las respuestas de este intento se descartarán. Tus estrellas se conservan.', [
          { text: 'Seguir estudiando', style: 'cancel' },
          { text: 'Salir', style: 'destructive', onPress: () => setRoute({ name: 'detail', quizId: route.quizId }) },
        ]);
        return true;
    }
  }, [onExit, route]);

  useEffect(() => {
    const listener = BackHandler.addEventListener('hardwareBackPress', goBack);
    return () => listener.remove();
  }, [goBack]);

  async function write(operation: () => Promise<void>): Promise<boolean> {
    if (writing.current) return false;
    writing.current = true;
    setSaving(true);
    try {
      await operation();
      return true;
    } catch {
      Alert.alert('No pudimos guardar el cambio', 'Intenta otra vez. Tus quizzes guardados siguen disponibles.');
      return false;
    } finally {
      writing.current = false;
      setSaving(false);
    }
  }

  async function persist(quiz: Quiz) {
    await storeQuiz(quiz);
    setQuizzes(current => current.some(item => item.id === quiz.id)
      ? current.map(item => item.id === quiz.id ? quiz : item)
      : [quiz, ...current]);
  }

  const quiz = 'quizId' in route ? quizzes.find(item => item.id === route.quizId) : undefined;

  function start(active: Quiz, mode: StudyMode, onlyMarked = false) {
    if (writing.current) return;
    const questions = startStudy(getStudyQuestions(active, mode, onlyMarked));
    if (questions.length) setRoute({ name: 'session', quizId: active.id, mode, questions });
  }

  function mark(active: Quiz, id: string) {
    const marked = active.marked.includes(id) ? active.marked.filter(item => item !== id) : [...active.marked, id];
    void write(() => persist({ ...active, marked }));
  }

  if (phase !== 'ready') return <Screen>
    <Header back={onExit} label="REPASO OFFLINE" title="Mis quizzes" />
    {phase === 'loading'
      ? <Panel><ActivityIndicator color={color.primary} /><Text style={styles.body}>Cargando tus quizzes…</Text></Panel>
      : <>
        <Notice message="No pudimos abrir tus quizzes guardados." />
        <Button label="Volver a intentar" onPress={() => void reload()} />
      </>}
  </Screen>;

  if (route.name === 'builder') return <QuizBuilder onBack={goBack} saving={saving} onSave={created => write(async () => {
    await persist(created);
    setRoute({ name: 'detail', quizId: created.id });
  })} />;

  if (quiz) {
    if (route.name === 'detail') return <QuizDetail quiz={quiz} saving={saving} onBack={goBack}
      onStart={(mode, onlyMarked) => start(quiz, mode, onlyMarked)}
      onMaterial={() => setRoute({ name: 'material', quizId: quiz.id })}
      onDelete={() => Alert.alert('Eliminar quiz', `Se eliminará «${quiz.title}» y su progreso.`, [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: () => void write(async () => {
          await deleteQuiz(quiz.id);
          setQuizzes(current => current.filter(item => item.id !== quiz.id));
          setRoute({ name: 'home' });
        }) },
      ])} />;

    if (route.name === 'material') return <QuizMaterial quiz={quiz} onBack={goBack} />;

    if (route.name === 'session') return <StudySession quiz={quiz} questions={route.questions}
      mode={route.mode} onBack={goBack} saving={saving} onMark={id => mark(quiz, id)}
      onFinish={attempt => {
        if (!attempt) {
          setRoute({ name: 'detail', quizId: quiz.id });
          return Promise.resolve(true);
        }
        return write(async () => {
          await persist(recordAttempt(quiz, attempt));
          setRoute({ name: 'result', quizId: quiz.id, attempt });
        });
      }} />;

    if (route.name === 'result') return <StudyResult quiz={quiz} attempt={route.attempt} saving={saving}
      onBack={goBack} onMark={id => mark(quiz, id)} onErrors={() => start(quiz, 'errors')} />;
  }

  return <StudyHome quizzes={quizzes} onExit={onExit} onNew={() => setRoute({ name: 'builder' })}
    onOpen={quizId => setRoute({ name: 'detail', quizId })} />;
}
