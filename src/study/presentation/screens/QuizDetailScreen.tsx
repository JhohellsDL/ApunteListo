import React from 'react';
import { Text, View } from 'react-native';
import { MODE_LABEL } from '../../domain/study';
import type { Quiz, StudyMode } from '../../domain/types';
import { Button, Header, Panel, Screen, styles } from '../ui';

export function QuizDetailScreen({
  quiz,
  saving,
  onBack,
  onStart,
  onMaterial,
  onDelete,
}: {
  quiz: Quiz;
  saving: boolean;
  onBack: () => void;
  onStart: (mode: StudyMode, onlyMarked?: boolean) => void;
  onMaterial: () => void;
  onDelete: () => void;
}) {
  const lastExam = quiz.attempts.find(attempt => attempt.mode === 'exam');

  return (
    <Screen>
      <Header
        back={saving ? undefined : onBack}
        label="MI QUIZ"
        title={quiz.title}
        subtitle={`${quiz.questions.length} preguntas · ${quiz.pages.length} ${
          quiz.pages.length === 1 ? 'página' : 'páginas'
        }`}
      />

      <Panel tone="soft">
        <Text style={styles.eyebrow}>PREPARACIÓN DE EXAMEN</Text>
        <Text style={styles.heading}>Rinde un simulacro</Text>
        <Text style={styles.body}>
          Responde a tu ritmo. La nota y las correcciones aparecen cuando entregas.
        </Text>
        <Button label="Empezar simulacro" disabled={saving} onPress={() => onStart('exam')} />
        {lastExam && (
          <Text style={styles.small}>
            Último simulacro:{' '}
            {lastExam.answers.filter(answer => answer.correct).length}/{lastExam.answers.length}
          </Text>
        )}
      </Panel>

      <Text accessibilityRole="header" style={styles.heading}>
        Tu repaso
      </Text>

      <Panel>
        <View style={styles.spread}>
          <Text style={styles.subheading}>Repasar errores</Text>
          <Text style={styles.eyebrow}>{quiz.pendingErrors.length} PENDIENTES</Text>
        </View>
        <Text style={styles.body}>
          Cuando aciertas una pregunta en el repaso, sale de tus errores pendientes.
        </Text>
        <Button
          variant="secondary"
          label="Practicar errores"
          disabled={saving || !quiz.pendingErrors.length}
          onPress={() => onStart('errors')}
        />
      </Panel>

      <Panel>
        <View style={styles.spread}>
          <Text style={styles.subheading}>Preguntas marcadas</Text>
          <Text style={styles.eyebrow}>{quiz.marked.length} MARCADAS</Text>
        </View>
        <Text style={styles.body}>
          Usa la estrella en cualquier pregunta para guardarla aquí.
        </Text>
        <Button
          variant="secondary"
          label="Practicar marcadas"
          disabled={saving || !quiz.marked.length}
          onPress={() => onStart('marked')}
        />
      </Panel>

      <Panel>
        <Text style={styles.subheading}>Modo tarjeta</Text>
        <Text style={styles.body}>
          Intenta recordar la respuesta y voltea la tarjeta para comprobarla.
        </Text>
        <Button
          variant="secondary"
          label="Ver todas las tarjetas"
          disabled={saving}
          onPress={() => onStart('cards')}
        />
        {quiz.marked.length > 0 && (
          <Button
            variant="quiet"
            label="Ver solo las marcadas"
            disabled={saving}
            onPress={() => onStart('cards', true)}
          />
        )}
      </Panel>

      <Button variant="secondary" label="Ver texto original" disabled={saving} onPress={onMaterial} />

      {quiz.attempts.length > 0 && (
        <Panel>
          <Text accessibilityRole="header" style={styles.subheading}>
            Intentos recientes
          </Text>
          {quiz.attempts.slice(0, 5).map(attempt => (
            <View key={attempt.id} style={styles.spread}>
              <Text style={styles.body}>
                {MODE_LABEL[attempt.mode]} ·{' '}
                {new Date(attempt.finishedAt).toLocaleDateString('es-PE')}
              </Text>
              <Text style={styles.bold}>
                {attempt.answers.filter(answer => answer.correct).length}/{attempt.answers.length}
              </Text>
            </View>
          ))}
        </Panel>
      )}

      <Button variant="danger" label="Eliminar quiz" loading={saving} onPress={onDelete} />
    </Screen>
  );
}

