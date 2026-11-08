import { useRef, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { checkAnswer, grade, MODE_LABEL } from '../domain/study';
import type { Attempt, Question, Quiz, StudyMode } from '../domain/types';
import { Button, color, Evidence, Header, Panel, Progress, Screen, styles } from './ui';

type SessionProps = {
  quiz: Quiz;
  questions: Question[];
  mode: StudyMode;
  onBack: () => void;
  onFinish: (attempt?: Attempt) => Promise<boolean>;
  onMark: (id: string) => void;
  saving: boolean;
};

export function MarkButton({ marked, disabled, onPress }: {
  marked: boolean; disabled: boolean; onPress: () => void;
}) {
  return <Button label={marked ? '★  Marcada · quitar' : '☆  Marcar para repasar'}
    variant="quiet" selected={marked} disabled={disabled} onPress={onPress} />;
}

export function StudySession({ quiz, questions, mode, onBack, onFinish, onMark, saving }: SessionProps) {
  const [index, setIndex] = useState(0);
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [revealed, setRevealed] = useState(false);
  const pendingAttempt = useRef<Attempt | null>(null);

  const question = questions[index];
  const response = responses[question.id] ?? '';
  const isCards = mode === 'cards';
  const isExam = mode === 'exam';
  const last = index === questions.length - 1;
  const marked = quiz.marked.includes(question.id);
  const answered = questions.filter(item => responses[item.id]?.trim()).length;

  function setResponse(value: string) {
    pendingAttempt.current = null;
    setResponses(current => ({ ...current, [question.id]: value }));
  }

  function move(target: number) {
    setIndex(target);
    setRevealed(false);
  }

  function finish() {
    if (mode === 'cards') {
      void onFinish();
      return;
    }

    const submit = () => {
      pendingAttempt.current ??= grade(mode, questions, responses);
      void onFinish(pendingAttempt.current);
    };

    const missing = questions.length - answered;
    if (isExam && missing > 0) {
      Alert.alert('Entregar simulacro', `Quedan ${missing} sin responder. Se registrarán como errores.`, [
        { text: 'Seguir respondiendo', style: 'cancel' },
        { text: 'Entregar', onPress: submit },
      ]);
      return;
    }
    submit();
  }

  return <Screen key={question.id}>
    <Header back={saving ? undefined : onBack} label={MODE_LABEL[mode].toUpperCase()} title={quiz.title} />
    <View style={styles.spread}>
      <Text style={styles.eyebrow}>{isCards ? 'TARJETA' : 'PREGUNTA'} {index + 1} DE {questions.length}</Text>
      {isExam && <Text style={styles.small}>{answered} respondidas</Text>}
    </View>
    <Progress value={index + 1} total={questions.length} />
    <Panel tone={isCards ? 'soft' : 'white'}>
      <Text style={styles.eyebrow}>{isCards ? 'RECUERDA ANTES DE VOLTEAR' : question.options.length ? 'ELIGE UNA OPCIÓN' : 'COMPLETA LA FRASE'}</Text>
      <Text style={styles.heading}>{question.prompt}</Text>
      {!isCards && question.options.length > 0 && <View style={styles.stack}>
        {question.options.map((option, position) => <Button key={option} label={`${String.fromCharCode(65 + position)}.  ${option}`}
          variant="secondary" selected={response === option} disabled={revealed || saving}
          onPress={() => setResponse(option)} />)}
      </View>}
      {!isCards && question.options.length === 0 && <TextInput key={question.id}
        accessibilityLabel="Tu respuesta" placeholder="Escribe lo que falta" placeholderTextColor={color.muted}
        style={styles.input} value={response} onChangeText={setResponse} editable={!revealed && !saving}
        maxLength={120} autoCorrect={false} autoCapitalize="none" />}
      <MarkButton marked={marked} disabled={saving} onPress={() => onMark(question.id)} />
    </Panel>

    {revealed && <Panel tone={isCards || checkAnswer(question, response) ? 'success' : 'error'}>
      <Text accessibilityLiveRegion="polite" style={styles.subheading}>
        {isCards ? 'Respuesta' : checkAnswer(question, response) ? '¡Correcto!' : 'Revisa esta respuesta'}
      </Text>
      <Text style={styles.heading}>{question.answer}</Text>
      <Evidence {...question.evidence} />
    </Panel>}

    {isCards && <>
      <Button label={revealed ? 'Ocultar respuesta' : 'Voltear tarjeta'}
        variant={revealed ? 'secondary' : 'primary'} onPress={() => setRevealed(current => !current)} />
      <Button label={last ? 'Terminar tarjetas' : 'Siguiente tarjeta'} variant={revealed ? 'primary' : 'secondary'}
        onPress={() => last ? finish() : move(index + 1)} />
      <Button label="Anterior" variant="quiet" disabled={index === 0} onPress={() => move(index - 1)} />
    </>}

    {isExam && <>
      <Button label={last ? 'Entregar simulacro' : 'Siguiente pregunta'} loading={saving}
        onPress={() => last ? finish() : move(index + 1)} />
      <View style={styles.row}>
        <Button label="Anterior" variant="secondary" disabled={index === 0 || saving} onPress={() => move(index - 1)} />
        {!last && <Button label="Entregar ahora" variant="quiet" disabled={saving} onPress={finish} />}
      </View>
      <Text style={styles.small}>Puedes volver a las preguntas anteriores. Verás la corrección al entregar.</Text>
    </>}

    {!isExam && !isCards && (!revealed ? <>
      <Button label="Comprobar respuesta" disabled={!response.trim() || saving} onPress={() => setRevealed(true)} />
      <Button label="No la sé · mostrar respuesta" variant="quiet" disabled={saving}
        onPress={() => { setResponse(''); setRevealed(true); }} />
    </> : <Button label={last ? 'Ver resultado' : 'Continuar'} loading={saving}
      onPress={() => last ? finish() : move(index + 1)} />)}
  </Screen>;
}

export function StudyResult({ quiz, attempt, saving, onBack, onErrors, onMark }: {
  quiz: Quiz; attempt: Attempt; saving: boolean; onBack: () => void; onErrors: () => void; onMark: (id: string) => void;
}) {
  const correct = attempt.answers.filter(answer => answer.correct).length;
  const total = attempt.answers.length;
  return <Screen>
    <Header back={saving ? undefined : onBack} label={MODE_LABEL[attempt.mode].toUpperCase()} title="Tu resultado" subtitle={quiz.title} />
    <View style={resultStyles.score}>
      <Text style={resultStyles.scoreLabel}>RESPUESTAS CORRECTAS</Text>
      <Text style={resultStyles.scoreValue}>{correct}/{total}</Text>
      <Text style={resultStyles.scoreText}>
        {correct === total ? '¡Completaste todas correctamente!' : 'Puedes practicar con tus errores pendientes.'}
      </Text>
    </View>
    {quiz.pendingErrors.length > 0 && <Button label={`Repasar errores · ${quiz.pendingErrors.length}`} disabled={saving} onPress={onErrors} />}
    <Button label="Volver a mi quiz" variant="secondary" disabled={saving} onPress={onBack} />
    <Text style={styles.heading}>Revisa tus respuestas</Text>
    {attempt.answers.map((entry, index) => {
      const question = quiz.questions.find(item => item.id === entry.questionId);
      if (!question) return null;
      return <Panel key={entry.questionId}>
        <Text style={entry.correct ? styles.good : styles.error}>
          {index + 1} · {entry.correct ? 'Correcta' : entry.response ? 'Incorrecta' : 'Sin responder'}
        </Text>
        <Text style={styles.subheading}>{question.prompt}</Text>
        {entry.response ? <Text style={styles.body}>Tu respuesta: {entry.response}</Text> : null}
        <Text style={styles.good}>Respuesta: {question.answer}</Text>
        <Evidence {...question.evidence} />
        <MarkButton marked={quiz.marked.includes(question.id)} disabled={saving} onPress={() => onMark(question.id)} />
      </Panel>;
    })}
  </Screen>;
}

const resultStyles = StyleSheet.create({
  score: { padding: 24, borderRadius: 24, backgroundColor: color.blue, gap: 7 },
  scoreLabel: { color: '#D7DBFC', fontSize: 12, fontWeight: '800', letterSpacing: 1.2 },
  scoreValue: { color: '#FFFFFF', fontSize: 54, fontWeight: '800' },
  scoreText: { color: '#E6E9FD', fontSize: 16, lineHeight: 23 },
});
