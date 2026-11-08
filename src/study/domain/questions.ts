import type { Question, SourcePage } from './types';

export const PAGE_LIMIT = 3;
export const PAGE_TEXT_LIMIT = 10_000;
export const QUIZ_LIMIT = 15;

const ARTICLE = /^(?:el|la|los|las) /iu;
const WORD = /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:-[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+)*/g;
const STOP_WORDS = new Set(
  ('acerca además ahora algunos ambos antes aquel aquella así aun aunque cada casi como con cual cuya cuyo desde donde durante ella ellas ellos entre ' +
    'esta estas este estos esto estaba estaban existe forma fueron hacia hasta incluso mismo misma muchas muchos ninguna ninguno nosotros otra ' +
    'otras otro otros para parte pasan pero podemos porque puede pueden pues qué quien salvo según siempre sobre solo también tanto toda todas todo todos ' +
    'tras tiene tienen través unas unos usted ustedes varias varios veces viene mientras mediante primero ejemplo llamado llamada llamados llamadas')
    .split(' ').map(comparable),
);

export function comparable(value: string): string {
  return value.normalize('NFD').replace(/[\u0301\u0308]/g, '').normalize('NFC')
    .toLocaleLowerCase('es').trim().replace(/\s+/g, ' ').replace(/^[¿¡«"“]+|[.!?;:»"”]+$/g, '').trim();
}

function termKey(value: string): string {
  return comparable(value).replace(ARTICLE, '');
}

type Candidate = Omit<Question, 'id' | 'options'> & {
  group: 'term' | 'year' | 'word';
  fingerprint: string;
  article?: string;
};

function countYearMentions(text: string): number {
  return Array.from(text.matchAll(/\b\d{4}\b/g)).length;
}

function getSentences(text: string): string[] {
  const paragraphs = text.trim().split(/\n\s*\n/);
  return paragraphs.flatMap(paragraph => {
    const flat = paragraph.split('\n').map(line => line.trim())
      .filter(line => !/^(?:(?:pág(?:ina)?\.?\s*)?\d+)$/iu.test(line)).join(' ')
      .replace(/\u00ad/g, '').replace(/\s+/g, ' ');
    // Decimal points have no following space, and these abbreviations stay in context.
    const boundary = /[.!?]\s+(?=[¿¡«“"A-ZÁÉÍÓÚÜÑ0-9])/g;
    const sentences: string[] = [];
    let start = 0;
    for (const match of flat.matchAll(boundary)) {
      const end = match.index + 1;
      const sentence = flat.slice(start, end);
      if (/\b(?:Sr|Sra|Dr|Dra|pág|núm|aprox|ej)\.$/iu.test(sentence)) continue;
      sentences.push(sentence);
      start = match.index + match[0].length;
    }
    if (start < flat.length) sentences.push(flat.slice(start));
    return sentences.filter(sentence =>
      sentence.length >= 32 && sentence.length <= 270 &&
      (sentence.match(WORD)?.length ?? 0) >= 6 &&
      !/^[¿¡]|[?!]$/.test(sentence),
    );
  });
}

function identifyCandidate(text: string, page: number): Candidate | undefined {
  const evidence = { page, text };
  const definition = text.match(/^((?:El|La|Los|Las)\s+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ -]{3,60}?)\s+(se define como|se denomina|consiste en|es|son)\s+(.+?)[.!]?$/u);
  if (definition) {
    const [, term, verb, meaning] = definition;
    const article = term.match(ARTICLE)?.[0] ?? '';
    const answer = term.slice(article.length).trim();
    const nameLength = answer.split(/\s+/).length;
    const meaningWords = meaning.match(WORD)?.length ?? 0;
    if (nameLength <= 5 && meaningWords >= 4 &&
      !comparable(meaning).includes(termKey(answer)) &&
      !/^(?:una?|unos|unas|el|la|los|las) de\b/iu.test(meaning) &&
      !/^(?:esto|eso|aquello|lo mismo)\b/iu.test(meaning)) {
      return {
        prompt: `${article}___ ${verb} ${meaning}.`,
        answer,
        evidence,
        group: 'term',
        fingerprint: comparable(meaning),
        article: comparable(article),
      };
    }
  }

  const year = text.match(/\ben ((?:1\d{3}|20\d{2}))\b/iu);
  if (year?.index !== undefined && countYearMentions(text) === 1 &&
    !/\b(?:alrededor|aproximadamente|hacia|siglo)\b/iu.test(text)) {
    const answer = year[1];
    const start = year.index + year[0].length - answer.length;
    return { prompt: text.slice(0, start) + '___' + text.slice(start + answer.length),
      answer, evidence, group: 'year', fingerprint: comparable(text) };
  }

  if ((text.match(WORD)?.length ?? 0) < 9) return;
  if (/^(?:Además|También|Luego|Esto|Eso|Así|Por ello|En cambio|Sin embargo|Después)\b/u.test(text)) return;
  const words = Array.from(text.matchAll(WORD));
  // Prefer a distinctive lowercase term with enough context on both sides.
  const target = words.slice(3, -1).filter(word => {
    const key = comparable(word[0]);
    return word[0].length >= 7 && word[0] === word[0].toLocaleLowerCase('es') &&
      !STOP_WORDS.has(key) && !/(?:mente|ando|iendo|ar|er|ir)$/u.test(key) &&
      words.filter(other => comparable(other[0]) === key).length === 1;
  }).sort((a, b) => b[0].length - a[0].length)[0];
  if (!target || target.index === undefined) return;
  const answer = target[0];
  return {
    prompt: text.slice(0, target.index) + '___' + text.slice(target.index + answer.length),
    answer, evidence, group: 'word', fingerprint: comparable(text),
  };
}

export function generateQuestions(pages: SourcePage[]): Question[] {
  const seen = new Set<string>();
  const candidates = pages.flatMap((page, index) => getSentences(page.text)
    .flatMap(sentence => {
      const key = comparable(sentence);
      if (seen.has(key)) return [];
      seen.add(key);
      const candidate = identifyCandidate(sentence, index + 1);
      return candidate ? [candidate] : [];
    }));

  const ordered = ['term', 'year', 'word'].flatMap(group =>
    candidates.filter(candidate => candidate.group === group),
  );

  const prompts = new Set<string>();
  const answers = new Set<string>();
  const questions: Question[] = [];
  for (const candidate of ordered) {
    const prompt = comparable(candidate.prompt);
    const answer = termKey(candidate.answer);
    if (prompts.has(prompt) || answers.has(answer)) continue;
    // If the same template could have different correct answers, omit it.
    if (candidates.some(other =>
      comparable(other.prompt) === prompt && termKey(other.answer) !== answer,
    )) continue;
    if (candidate.group === 'term' && candidates.some(other =>
      other.group === 'term' && other.fingerprint === candidate.fingerprint &&
      termKey(other.answer) !== answer,
    )) continue;

    const alternatives = new Map<string, string>();
    const evidence = comparable(candidate.evidence.text);
    for (const other of candidates) {
      if (candidate.group === 'word' || candidate.group !== other.group) continue;
      const otherKey = termKey(other.answer);
      if (otherKey === answer || evidence.includes(otherKey)) continue;
      const matchingYear = candidate.group === 'year' && other.group === 'year';
      const matchingTerm = candidate.group === 'term' && other.group === 'term' &&
        candidate.article === other.article && candidate.fingerprint !== other.fingerprint &&
        !answer.includes(otherKey) && !otherKey.includes(answer);
      if (matchingYear || matchingTerm) alternatives.set(otherKey, other.answer);
    }
    const options = alternatives.size >= 2
      ? [candidate.answer, ...Array.from(alternatives.values()).slice(0, 3)].sort()
      : [];
    prompts.add(prompt);
    answers.add(answer);
    questions.push({
      id: `q${questions.length + 1}`,
      prompt: candidate.prompt,
      answer: candidate.answer,
      options,
      evidence: candidate.evidence,
    });
    if (questions.length >= QUIZ_LIMIT) break;
  }
  return questions;
}
