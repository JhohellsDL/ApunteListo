import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { MODE_LABEL } from '../../domain/study';
import type { Attempt, Quiz } from '../../domain/types';
import { Button, color, Evidence, Header, Panel, Screen, styles } from '../ui';
import { MarkButton } from './StudySessionScreen';

export function StudyResultScreen({
  quiz,
  attempt,
  saving,
  onBack,
  onErrors,
  onMark,
}: {
  quiz: Quiz;
  attempt: Attempt;
  saving: boolean;
  onBack: () => void;
  onErrors: () => void;
  onMark: (id: string) => void;
}) {
  const correct = attempt.answers.filter(answer => answer.correct).length;
  const total = attempt.answers.length;

  return (
    <Screen>
      <Header
        back={saving ? undefined : onBack}
        label={MODE_LABEL[attempt.mode].toUpperCase()}
        title="Tu resultado"
        subtitle={quiz.title}
      />
      <View style={resultStyles.score}>
        <Text style={resultStyles.scoreLabel}>RESPUESTAS CORRECTAS</Text>
        <Text style={resultStyles.scoreValue}>
          {correct}/{total}
        </Text>
        <Text style={resultStyles.scoreText}>
          {correct === total
            ? '¡Completaste todas correctamente!'
            : 'Puedes practicar con tus errores pendientes.'}
        </Text>
      </View>

      {quiz.pendingErrors.length > 0 && (
        <Button
          label={`Repasar errores · ${quiz.pendingErrors.length}`}
          disabled={saving}
          onPress={onErrors}
        />
      )}
      <Button label="Volver a mi quiz" variant="secondary" disabled={saving} onPress={onBack} />

      <Text style={styles.heading}>Revisa tus respuestas</Text>

      {attempt.answers.map((entry, index) => {
        const question = quiz.questions.find(item => item.id === entry.questionId);
        if (!question) return null;
        return (
          <Panel key={entry.questionId}>
            <Text style={entry.correct ? styles.good : styles.error}>
              {index + 1} ·{' '}
              {entry.correct ? 'Correcta' : entry.response ? 'Incorrecta' : 'Sin responder'}
            </Text>
            <Text style={styles.subheading}>{question.prompt}</Text>
            {entry.response ? (
              <Text style={styles.body}>Tu respuesta: {entry.response}</Text>
            ) : null}
            <Text style={styles.good}>Respuesta: {question.answer}</Text>
            <Evidence {...question.evidence} />
            <MarkButton
              marked={quiz.marked.includes(question.id)}
              disabled={saving}
              onPress={() => onMark(question.id)}
            />
          </Panel>
        );
      })}
    </Screen>
  );
}

const resultStyles = StyleSheet.create({
  score: { padding: 24, borderRadius: 24, backgroundColor: color.blue, gap: 7 },
  scoreLabel: { color: '#D7DBFC', fontSize: 12, fontWeight: '800', letterSpacing: 1.2 },
  scoreValue: { color: '#FFFFFF', fontSize: 54, fontWeight: '800' },
  scoreText: { color: '#E6E9FD', fontSize: 16, lineHeight: 23 },
});

