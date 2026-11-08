import { useCallback, useRef, useState } from 'react';
import {
  pickStudyImages as defaultPickImages,
  recognizeImage as defaultRecognizeImage,
  suggestTitleFromText,
} from '../../data/imageText';
import { EXAMPLE_PAGES, EXAMPLE_TITLE } from '../../domain/example';
import { generateQuestions, PAGE_LIMIT, PAGE_TEXT_LIMIT } from '../../domain/questions';
import { makeId } from '../../domain/study';
import type { Question, Quiz } from '../../domain/types';

export type DraftPage = { id: string; text: string; uri?: string };

type QuizBuilderHookOptions = {
  onSave: (quiz: Quiz) => Promise<boolean>;
  saving: boolean;
  pickImages?: typeof defaultPickImages;
  recognizeText?: typeof defaultRecognizeImage;
};

export function useQuizBuilder({
  onSave,
  saving,
  pickImages = defaultPickImages,
  recognizeText = defaultRecognizeImage,
}: QuizBuilderHookOptions) {
  const [title, setTitle] = useState('');
  const [pages, setPages] = useState<DraftPage[]>([]);
  const [preview, setPreview] = useState<Question[] | null>(null);
  const [error, setError] = useState('');
  const [status, setStatus] = useState('');
  const [busy, setBusy] = useState<'camera' | 'library' | null>(null);
  const importing = useRef(false);
  const quizId = useRef(makeId());

  const unavailable = busy !== null || saving;
  const hasContent = pages.some(p => p.text.trim().length > 0);

  const importImages = useCallback(async (source: 'camera' | 'library') => {
    if (importing.current || pages.length >= PAGE_LIMIT || saving) return;
    importing.current = true;
    setBusy(source);
    setError('');
    setStatus('');
    try {
      const uris = await pickImages(source, PAGE_LIMIT - pages.length);
      const added: DraftPage[] = [];
      let failed = 0;
      let clipped = 0;
      for (let index = 0; index < uris.length; index += 1) {
        const uri = uris[index];
        setStatus(`Leyendo imagen ${index + 1} de ${uris.length}…`);
        let text = '';
        try {
          text = await recognizeText(uri);
          if (text.length > PAGE_TEXT_LIMIT) clipped += 1;
          if (!text) failed += 1;
        } catch {
          failed += 1;
        }
        added.push({ id: makeId(), text: text.slice(0, PAGE_TEXT_LIMIT), uri });
      }
      setPages(current => [...current, ...added]);

      // Sugerir título automáticamente si el usuario no ha ingresado uno
      setTitle(current => {
        if (current.trim()) return current;
        const suggested = suggestTitleFromText(added.map(p => p.text).join('\n'));
        return suggested || current;
      });

      if (failed || clipped) {
        const notes: string[] = [];
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
  }, [pages.length, pickImages, recognizeText, saving]);

  const movePage = useCallback((index: number, offset: -1 | 1) => {
    setPages(current => {
      const next = [...current];
      const target = index + offset;
      if (target < 0 || target >= next.length) return current;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }, []);

  const removePage = useCallback((id: string) => {
    setPages(current => current.filter(item => item.id !== id));
  }, []);

  const updatePageText = useCallback((id: string, text: string) => {
    setPages(current => current.map(item => item.id === id ? { ...item, text } : item));
  }, []);

  const addEmptyPage = useCallback(() => {
    setPages(current => current.length < PAGE_LIMIT ? [...current, { id: makeId(), text: '' }] : current);
  }, []);

  const loadExample = useCallback(() => {
    setTitle(current => current.trim() ? current : EXAMPLE_TITLE);
    setPages(EXAMPLE_PAGES.map(page => ({ ...page, id: makeId() })));
    setError('');
  }, []);

  const generate = useCallback(() => {
    setError('');
    const hasAnyText = pages.some(p => p.text.trim().length > 0);
    if (!hasAnyText) {
      setError('Agrega al menos una página con texto para generar preguntas.');
      return;
    }

    let finalTitle = title.trim();
    if (!finalTitle) {
      const suggested = suggestTitleFromText(pages.map(p => p.text).join('\n'));
      if (suggested) {
        finalTitle = suggested;
        setTitle(suggested);
      } else {
        setError('Por favor ingresa un nombre para tu quiz antes de generar.');
        return;
      }
    }

    const questions = generateQuestions(pages);
    if (!questions.length) {
      setError('Encontramos poco texto que sirva para una pregunta. Agrega oraciones completas o corrige la lectura.');
      return;
    }
    setPreview(questions);
  }, [pages, title]);

  const removePreviewQuestion = useCallback((id: string) => {
    setPreview(current => current?.filter(item => item.id !== id) ?? null);
  }, []);

  const resetToEditing = useCallback(() => {
    setPreview(null);
    setError('');
  }, []);

  const save = useCallback(async () => {
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
  }, [onSave, pages, preview, title]);

  return {
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
  };
}
