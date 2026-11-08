import React from 'react';
import { Image, Text, TextInput, View } from 'react-native';
import { PAGE_LIMIT, QUIZ_LIMIT, PAGE_TEXT_LIMIT } from '../../domain/questions';
import type { Quiz } from '../../domain/types';
import { useQuizBuilder } from '../hooks/useQuizBuilder';
import { Button, color, Evidence, Header, Notice, Panel, Screen, styles } from '../ui';

export function QuizBuilderScreen({
  onBack,
  onSave,
  saving,
}: {
  onBack: () => void;
  onSave: (quiz: Quiz) => Promise<boolean>;
  saving: boolean;
}) {
  const {
    title,
    setTitle,
    pages,
    preview,
    error,
    status,
    busy,
    unavailable,
    hasContent,
    importImages,
    movePage,
    removePage,
    updatePageText,
    addEmptyPage,
    loadExample,
    generate,
    removePreviewQuestion,
    resetToEditing,
    save,
  } = useQuizBuilder({ onSave, saving });

  if (preview) {
    return (
      <Screen key="preview">
        <Header
          back={saving ? undefined : resetToEditing}
          label="PASO 2 DE 2 · REVISIÓN"
          title="Revisa tu quiz"
          subtitle="Comprueba las respuestas y retira las preguntas que prefieras omitir."
        />
        <Panel tone="soft">
          <Text style={styles.subheading}>
            {title.trim()} · {preview.length} {preview.length === 1 ? 'pregunta' : 'preguntas'}
          </Text>
          <Text style={styles.body}>El quiz y su texto se guardarán en este dispositivo.</Text>
        </Panel>
        {preview.map((question, index) => (
          <Panel key={question.id}>
            <Text style={styles.eyebrow}>
              {String(index + 1).padStart(2, '0')} ·{' '}
              {question.options.length ? 'SELECCIÓN ÚNICA' : 'COMPLETAR'}
            </Text>
            <Text style={styles.subheading}>{question.prompt}</Text>
            {question.options.length > 0 && (
              <Text style={styles.small}>{question.options.join(' · ')}</Text>
            )}
            <Text style={styles.good}>Respuesta: {question.answer}</Text>
            <Evidence {...question.evidence} />
            <Button
              variant="quiet"
              label={`Retirar pregunta ${index + 1}`}
              disabled={saving}
              onPress={() => removePreviewQuestion(question.id)}
            />
          </Panel>
        ))}
        {!preview.length && (
          <Panel>
            <Text style={styles.body}>
              El quiz necesita al menos una pregunta. Edita el texto para volver a generarlo.
            </Text>
          </Panel>
        )}
        <Button
          label="Guardar quiz"
          disabled={!preview.length}
          loading={saving}
          onPress={() => {
            save().catch(() => { });
          }}
        />
        <Button
          label="Editar texto"
          variant="secondary"
          disabled={saving}
          onPress={resetToEditing}
        />
      </Screen>
    );
  }

  return (
    <Screen key="material">
      <Header
        back={unavailable ? undefined : onBack}
        label="PASO 1 DE 2 · MATERIAL"
        title="Crea un quiz"
        subtitle="Usa hasta tres fotos, capturas de un PDF o páginas de texto."
      />
      <Panel>
        <View style={styles.spread}>
          <Text style={styles.subheading}>Nombre del quiz</Text>
          {!title.trim() && <Text style={styles.small}>Obligatorio</Text>}
        </View>
        <TextInput
          accessibilityLabel="Nombre del quiz"
          style={styles.input}
          placeholder="Ej. Biología · La célula"
          placeholderTextColor={color.muted}
          value={title}
          onChangeText={setTitle}
          editable={!unavailable}
          maxLength={80}
        />
      </Panel>
      <Panel tone="soft">
        <View style={styles.spread}>
          <Text style={styles.subheading}>Agrega tus páginas</Text>
          <Text style={styles.eyebrow}>
            {pages.length}/{PAGE_LIMIT}
          </Text>
        </View>
        <View style={styles.row}>
          <Button
            label="Tomar foto"
            variant="secondary"
            disabled={unavailable || pages.length >= PAGE_LIMIT}
            loading={busy === 'camera'}
            onPress={() => {
              importImages('camera').catch(() => { });
            }}
          />
          <Button
            label="Subir capturas"
            variant="secondary"
            disabled={unavailable || pages.length >= PAGE_LIMIT}
            loading={busy === 'library'}
            onPress={() => {
              importImages('library').catch(() => { });
            }}
          />
          <Button
            label="Pegar texto"
            variant="quiet"
            disabled={unavailable || pages.length >= PAGE_LIMIT}
            onPress={addEmptyPage}
          />
        </View>
        {status ? (
          <Text accessibilityLiveRegion="polite" style={styles.body}>
            {status}
          </Text>
        ) : null}
        {pages.length === 0 && !busy && (
          <Button
            label="Probar con un texto de ejemplo"
            variant="quiet"
            onPress={loadExample}
          />
        )}
      </Panel>
      {error ? <Notice message={error} /> : null}
      {pages.map((page, index) => (
        <Panel key={page.id}>
          <Text style={styles.subheading}>Página {index + 1}</Text>
          {page.uri && (
            <Image
              source={{ uri: page.uri }}
              accessibilityLabel={`Imagen de página ${index + 1}`}
              accessible
              resizeMode="contain"
              style={styles.imageThumbnail}
            />
          )}
          <TextInput
            accessibilityLabel={`Texto de la página ${index + 1}`}
            style={[styles.input, styles.multiline]}
            placeholder="Pega o corrige el texto aquí"
            placeholderTextColor={color.muted}
            multiline
            value={page.text}
            editable={!unavailable}
            maxLength={PAGE_TEXT_LIMIT}
            onChangeText={text => updatePageText(page.id, text)}
          />
          <View style={styles.row}>
            <Button
              label="↑ Subir"
              variant="quiet"
              disabled={unavailable || index === 0}
              onPress={() => movePage(index, -1)}
            />
            <Button
              label="↓ Bajar"
              variant="quiet"
              disabled={unavailable || index === pages.length - 1}
              onPress={() => movePage(index, 1)}
            />
            <Button
              label="Quitar página"
              variant="danger"
              disabled={unavailable}
              onPress={() => removePage(page.id)}
            />
          </View>
        </Panel>
      ))}
      <Button
        label="Generar preguntas"
        disabled={unavailable || !hasContent}
        onPress={generate}
      />
      <Text style={styles.small}>
        Hasta {QUIZ_LIMIT} preguntas, según el texto disponible. Puedes revisar cada respuesta
        antes de guardar.
      </Text>
    </Screen>
  );
}

