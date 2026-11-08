import { useRef, useState } from 'react';
import { Image, Text, TextInput, View } from 'react-native';
import { pickStudyImages, recognizeImage } from '../data/imageText';
import { EXAMPLE_PAGES, EXAMPLE_TITLE } from '../domain/example';
import { generateQuestions, PAGE_LIMIT, PAGE_TEXT_LIMIT, QUIZ_LIMIT } from '../domain/questions';
import { makeId } from '../domain/study';
import type { Question, Quiz } from '../domain/types';
import { Button, color, Evidence, Header, Notice, Panel, Screen, styles } from './ui';

type DraftPage = { id: string; text: string; uri?: string };

export function QuizBuilder({ onBack, onSave, saving }: {
  onBack: () => void; onSave: (quiz: Quiz) => Promise<boolean>; saving: boolean;
}) {
  const [title, setTitle] = useState('');
  const [pages, setPages] = useState<DraftPage[]>([]);
  const [preview, setPreview] = useState<Question[] | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState<'camera' | 'library' | null>(null);
  const importing = useRef(false);
  const quizId = useRef(makeId());
  const unavailable = busy !== null || saving;

  async function importImages(source: 'camera' | 'library') {
    if (importing.current || pages.length >= PAGE_LIMIT || saving) return;
    importing.current = true;
    setBusy(source);
    setError('');
    setStatus('');
    try {
      const uris = await pickStudyImages(source, PAGE_LIMIT - pages.length);
      const added: DraftPage[] = [];
      let failed = 0;
      let clipped = 0;
      for (let index = 0; index < uris.length; index += 1) {
        const uri = uris[index];
        setStatus(`Leyendo imagen ${index + 1} de ${uris.length}…`);
        let text = '';
        try {
          text = await recognizeImage(uri);
          if (text.length > PAGE_TEXT_LIMIT) clipped += 1;
          if (!text) failed += 1;
        } catch {
          failed += 1;
        }
        added.push({ id: makeId(), text: text.slice(0, PAGE_TEXT_LIMIT), uri });
      }
      setPages(current => [...current, ...added]);
      if (failed || clipped) {
        const notes = [];
        if (failed) notes.push(`No se pudo leer el texto de ${failed} ${failed === 1 ? 'imagen' : 'imágenes'}. Corrige la página, pega su texto o reemplázala.`);
        if (clipped) notes.push('Se alcanzó el límite de texto de una o más páginas. Revisa el contenido extraído.');
        setError(notes.join(' '));
      }
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'No pudimos agregar las imágenes.');
    } finally {
      importing.current = false;
      setBusy(null);
      setStatus('');
    }
  }

  function move(index: number, offset: -1 | 1) {
    setPages(current => {
      const next = [...current];
      const target = index + offset;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  function generate() {
    setError('');
    const questions = generateQuestions(pages);
    if (!questions.length) {
      setError('Encontramos poco texto que sirva para una pregunta. Agrega oraciones completas o corrige la lectura.');
      return;
    }
    setPreview(questions);
  }

  async function save() {
    if (!preview?.length || !title.trim()) return;
    await onSave({
      id: quizId.current,
      title: title.trim(),
      createdAt: Date.now(),
      pages: pages.map(page => ({ text: page.text.trim() })),
      questions: preview,
      attempts: [],
      marked: [],
      pendingErrors: [],
    });
  }

  if (preview) return <Screen key="preview">
    <Header back={saving ? undefined : () => { setPreview(null); setError(''); }} label="PASO 2 DE 2 · REVISIÓN"
      title="Revisa tu quiz" subtitle="Comprueba las respuestas y retira las preguntas que prefieras omitir." />
    <Panel tone="soft">
      <Text style={styles.subheading}>{title.trim()} · {preview.length} {preview.length === 1 ? 'pregunta' : 'preguntas'}</Text>
      <Text style={styles.body}>El quiz y su texto se guardarán en este dispositivo.</Text>
    </Panel>
    {preview.map((question, index) => <Panel key={question.id}>
      <Text style={styles.eyebrow}>{String(index + 1).padStart(2, '0')} · {question.options.length ? 'SELECCIÓN ÚNICA' : 'COMPLETAR'}</Text>
      <Text style={styles.subheading}>{question.prompt}</Text>
      {question.options.length > 0 && <Text style={styles.small}>{question.options.join(' · ')}</Text>}
      <Text style={styles.good}>Respuesta: {question.answer}</Text>
      <Evidence {...question.evidence} />
      <Button variant="quiet" label={`Retirar pregunta ${index + 1}`} disabled={saving}
        onPress={() => setPreview(current => current?.filter(item => item.id !== question.id) ?? null)} />
    </Panel>)}
    {!preview.length && <Panel><Text style={styles.body}>El quiz necesita al menos una pregunta. Edita el texto para volver a generarlo.</Text></Panel>}
    <Button label="Guardar quiz" disabled={!preview.length} loading={saving} onPress={() => void save()} />
    <Button label="Editar texto" variant="secondary" disabled={saving} onPress={() => setPreview(null)} />
  </Screen>;

  return <Screen key="material">
    <Header back={unavailable ? undefined : onBack} label="PASO 1 DE 2 · MATERIAL" title="Crea un quiz"
      subtitle="Usa hasta tres fotos, capturas de un PDF o páginas de texto." />
    <Panel>
      <Text style={styles.subheading}>Nombre del quiz</Text>
      <TextInput accessibilityLabel="Nombre del quiz" style={styles.input} placeholder="Ej. Biología · La célula"
        placeholderTextColor={color.muted} value={title} onChangeText={setTitle} editable={!unavailable} maxLength={80} />
    </Panel>
    <Panel tone="soft">
      <View style={styles.spread}>
        <Text style={styles.subheading}>Agrega tus páginas</Text>
        <Text style={styles.eyebrow}>{pages.length}/{PAGE_LIMIT}</Text>
      </View>
      <View style={styles.row}>
        <Button label="Tomar foto" variant="secondary" disabled={unavailable || pages.length >= PAGE_LIMIT}
          loading={busy === 'camera'} onPress={() => void importImages('camera')} />
        <Button label="Subir capturas" variant="secondary" disabled={unavailable || pages.length >= PAGE_LIMIT}
          loading={busy === 'library'} onPress={() => void importImages('library')} />
        <Button label="Pegar texto" variant="quiet" disabled={unavailable || pages.length >= PAGE_LIMIT}
          onPress={() => setPages(current => current.length < PAGE_LIMIT ? [...current, { id: makeId(), text: '' }] : current)} />
      </View>
      {status ? <Text accessibilityLiveRegion="polite" style={styles.body}>{status}</Text> : null}
      {pages.length === 0 && !busy && <Button label="Probar con un texto de ejemplo" variant="quiet" onPress={() => {
        setTitle(current => current.trim() ? current : EXAMPLE_TITLE);
        setPages(EXAMPLE_PAGES.map(page => ({ ...page, id: makeId() })));
        setError('');
      }} />}
    </Panel>
    {error ? <Notice message={error} /> : null}
    {pages.map((page, index) => <Panel key={page.id}>
      <Text style={styles.subheading}>Página {index + 1}</Text>
      {page.uri && <Image source={{ uri: page.uri }} accessibilityLabel={`Imagen de página ${index + 1}`}
        accessible resizeMode="contain" style={{ height: 125, width: '100%', backgroundColor: color.background, borderRadius: 12 }} />}
      <TextInput accessibilityLabel={`Texto de la página ${index + 1}`} style={[styles.input, styles.multiline]}
        placeholder="Pega o corrige el texto aquí" placeholderTextColor={color.muted} multiline
        value={page.text} editable={!unavailable} maxLength={PAGE_TEXT_LIMIT}
        onChangeText={text => setPages(current => current.map(item => item.id === page.id ? { ...item, text } : item))} />
      <View style={styles.row}>
        <Button label="↑ Subir" variant="quiet" disabled={unavailable || index === 0} onPress={() => move(index, -1)} />
        <Button label="↓ Bajar" variant="quiet" disabled={unavailable || index === pages.length - 1} onPress={() => move(index, 1)} />
        <Button label="Quitar página" variant="danger" disabled={unavailable}
          onPress={() => setPages(current => current.filter(item => item.id !== page.id))} />
      </View>
    </Panel>)}
    <Button label="Generar preguntas" disabled={unavailable || !title.trim()} onPress={generate} />
    <Text style={styles.small}>Hasta {QUIZ_LIMIT} preguntas, según el texto disponible. Puedes revisar cada respuesta antes de guardar.</Text>
  </Screen>;
}
