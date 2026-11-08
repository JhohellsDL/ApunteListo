import React from 'react';
import { Text, TextInput, View } from 'react-native';
import { checkAnswer, MODE_LABEL } from '../../domain/study';
import type { Attempt, Question, Quiz, StudyMode } from '../../domain/types';
import { useStudySession } from '../hooks/useStudySession';
import { Button, color, Evidence, Header, Panel, Progress, Screen, styles } from '../ui';

export function MarkButton({
  marked,
  disabled,
  onPress,
}: {
  marked: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  return (
    <Button
      label={marked ? '★  Marcada · quitar' : '☆  Marcar para repasar'}
      variant="quiet"
      selected={marked}
      disabled={disabled}
      onPress={onPress}
    />
  );
}

export function StudySessionScreen({
  quiz,
  questions,
  mode,
  onBack,
  onFinish,
  onMark,
  saving,
}: {
  quiz: Quiz;
  questions: Question[];
  mode: StudyMode;
  onBack: () => void;
  onFinish: (attempt?: Attempt) => Promise<boolean>;
  onMark: (id: string) => void;
  saving: boolean;
}) {
  const {
    index,
    question,
    response,
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
  } = useStudySession({ quiz, questions, mode, onFinish });

  if (!question) return null;

  return (
    <Screen key={question.id}>
      <Header
        back={saving ? undefined : onBack}
        label={MODE_LABEL[mode].toUpperCase()}
        title={quiz.title}
      />

      <View style={styles.spread}>
        <Text style={styles.eyebrow}>
          {isCards ? 'TARJETA' : 'PREGUNTA'} {index + 1} DE {questions.length}
        </Text>
        {isExam && <Text style={styles.small}>{answeredCount} respondidas</Text>}
      </View>

      <Progress value={index + 1} total={questions.length} />

      <Panel tone={isCards ? 'soft' : 'white'}>
        <Text style={styles.eyebrow}>
          {isCards
            ? 'RECUERDA ANTES DE VOLTEAR'
            : question.options.length
            ? 'ELIGE UNA OPCIÓN'
            : 'COMPLETA LA FRASE'}
        </Text>
        <Text style={styles.heading}>{question.prompt}</Text>

        {!isCards && question.options.length > 0 && (
          <View style={styles.stack}>
            {question.options.map((option, position) => (
              <Button
                key={option}
                label={`${String.fromCharCode(65 + position)}.  ${option}`}
                variant="secondary"
                selected={response === option}
                disabled={revealed || saving}
                onPress={() => setResponse(option)}
              />
            ))}
          </View>
        )}

        {!isCards && question.options.length === 0 && (
          <TextInput
            key={question.id}
            accessibilityLabel="Tu respuesta"
            placeholder="Escribe lo que falta"
            placeholderTextColor={color.muted}
            style={styles.input}
            value={response}
            onChangeText={setResponse}
            editable={!revealed && !saving}
            maxLength={120}
            autoCorrect={false}
            autoCapitalize="none"
          />
        )}

        <MarkButton
          marked={isMarked}
          disabled={saving}
          onPress={() => onMark(question.id)}
        />
      </Panel>

      {revealed && (
        <Panel tone={isCards || checkAnswer(question, response) ? 'success' : 'error'}>
          <Text accessibilityLiveRegion="polite" style={styles.subheading}>
            {isCards
              ? 'Respuesta'
              : checkAnswer(question, response)
              ? '¡Correcto!'
              : 'Revisa esta respuesta'}
          </Text>
          <Text style={styles.heading}>{question.answer}</Text>
          <Evidence {...question.evidence} />
        </Panel>
      )}

      {isCards && (
        <>
          <Button
            label={revealed ? 'Ocultar respuesta' : 'Voltear tarjeta'}
            variant={revealed ? 'secondary' : 'primary'}
            onPress={toggleRevealed}
          />
          <Button
            label={isLast ? 'Terminar tarjetas' : 'Siguiente tarjeta'}
            variant={revealed ? 'primary' : 'secondary'}
            onPress={() => (isLast ? finish() : move(index + 1))}
          />
          <Button
            label="Anterior"
            variant="quiet"
            disabled={index === 0}
            onPress={() => move(index - 1)}
          />
        </>
      )}

      {isExam && (
        <>
          <Button
            label={isLast ? 'Entregar simulacro' : 'Siguiente pregunta'}
            loading={saving}
            onPress={() => (isLast ? finish() : move(index + 1))}
          />
          <View style={styles.row}>
            <Button
              label="Anterior"
              variant="secondary"
              disabled={index === 0 || saving}
              onPress={() => move(index - 1)}
            />
            {!isLast && (
              <Button
                label="Entregar ahora"
                variant="quiet"
                disabled={saving}
                onPress={finish}
              />
            )}
          </View>
          <Text style={styles.small}>
            Puedes volver a las preguntas anteriores. Verás la corrección al entregar.
          </Text>
        </>
      )}

      {!isExam &&
        !isCards &&
        (!revealed ? (
          <>
            <Button
              label="Comprobar respuesta"
              disabled={!response.trim() || saving}
              onPress={reveal}
            />
            <Button
              label="No la sé · mostrar respuesta"
              variant="quiet"
              disabled={saving}
              onPress={() => {
                setResponse('');
                reveal();
              }}
            />
          </>
        ) : (
          <Button
            label={isLast ? 'Ver resultado' : 'Continuar'}
            loading={saving}
            onPress={() => (isLast ? finish() : move(index + 1))}
          />
        ))}
    </Screen>
  );
}

