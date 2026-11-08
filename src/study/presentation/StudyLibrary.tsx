import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MODE_LABEL } from '../domain/study';
import type { Quiz, StudyMode } from '../domain/types';
import { Button, color, Header, Panel, Screen, styles } from './ui';

export function StudyHome({ quizzes, onNew, onOpen, onExit }: {
  quizzes: Quiz[]; onNew: () => void; onOpen: (id: string) => void; onExit?: () => void;
}) {
  return <Screen>
    {onExit && <Button label="‹  Salir de Repaso" variant="quiet" onPress={onExit} />}
    <View style={local.brandRow}>
      <View style={local.brandMark}><Text style={local.brandMarkText}>R</Text></View>
      <Text accessibilityRole="header" style={local.brand}>Repaso</Text>
      <Text style={local.badge}>OFFLINE</Text>
    </View>
    <View style={local.hero}>
      <View style={local.heroTop}>
        <Text style={local.heroEyebrow}>TU ESPACIO DE ESTUDIO</Text>
        <View style={local.heroArt} accessible={false} importantForAccessibility="no-hide-descendants">
          <View style={[local.paper, local.paperBack]} />
          <View style={local.paper}>
            <View style={local.paperLine} /><View style={[local.paperLine, { width: '65%' }]} />
            <Text style={local.paperCheck}>✓</Text>
          </View>
        </View>
      </View>
      <View style={local.heroText}>
        <Text accessibilityRole="header" style={local.heroTitle}>De tus páginas{ '\n' }a tu próximo examen.</Text>
        <Text style={local.heroBody}>Convierte fotos y capturas en preguntas para practicar a tu ritmo.</Text>
      </View>
    </View>
    <Button label="+  Crear un quiz" onPress={onNew} />
    <View style={styles.spread}>
      <Text accessibilityRole="header" style={styles.heading}>Mis quizzes</Text>
      <Text style={styles.eyebrow}>{quizzes.length} GUARDADOS</Text>
    </View>
    {quizzes.length === 0 && <Panel>
      <Text style={styles.subheading}>Tu primer quiz empieza aquí</Text>
      <Text style={styles.body}>Sube una captura o prueba con el texto de ejemplo al crear un quiz.</Text>
    </Panel>}
    {quizzes.map(quiz => <Pressable key={quiz.id} accessibilityRole="button" accessibilityLabel={`Abrir ${quiz.title}`}
      onPress={() => onOpen(quiz.id)} style={({ pressed }) => pressed && styles.pressed}>
      <Panel>
        <View style={styles.spread}>
          <Text style={[styles.subheading, { flex: 1 }]}>{quiz.title}</Text>
          <Text style={local.chevron}>›</Text>
        </View>
        <Text style={styles.body}>{quiz.questions.length} preguntas · {quiz.pages.length} {quiz.pages.length === 1 ? 'página' : 'páginas'}</Text>
        {quiz.pendingErrors.length > 0 && <Text style={styles.small}>{quiz.pendingErrors.length} por repasar</Text>}
      </Panel>
    </Pressable>)}
  </Screen>;
}

export function QuizDetail({ quiz, saving, onBack, onStart, onMaterial, onDelete }: {
  quiz: Quiz; saving: boolean; onBack: () => void; onStart: (mode: StudyMode, onlyMarked?: boolean) => void;
  onMaterial: () => void; onDelete: () => void;
}) {
  const lastExam = quiz.attempts.find(attempt => attempt.mode === 'exam');
  return <Screen>
    <Header back={saving ? undefined : onBack} label="MI QUIZ" title={quiz.title}
      subtitle={`${quiz.questions.length} preguntas · ${quiz.pages.length} ${quiz.pages.length === 1 ? 'página' : 'páginas'}`} />
    <Panel tone="soft">
      <Text style={styles.eyebrow}>PREPARACIÓN DE EXAMEN</Text>
      <Text style={styles.heading}>Rinde un simulacro</Text>
      <Text style={styles.body}>Responde a tu ritmo. La nota y las correcciones aparecen cuando entregas.</Text>
      <Button label="Empezar simulacro" disabled={saving} onPress={() => onStart('exam')} />
      {lastExam && <Text style={styles.small}>
        Último simulacro: {lastExam.answers.filter(answer => answer.correct).length}/{lastExam.answers.length}
      </Text>}
    </Panel>

    <Text accessibilityRole="header" style={styles.heading}>Tu repaso</Text>
    <Panel>
      <View style={styles.spread}>
        <Text style={styles.subheading}>Repasar errores</Text>
        <Text style={styles.eyebrow}>{quiz.pendingErrors.length} PENDIENTES</Text>
      </View>
      <Text style={styles.body}>Cuando aciertas una pregunta en el repaso, sale de tus errores pendientes.</Text>
      <Button variant="secondary" label="Practicar errores" disabled={saving || !quiz.pendingErrors.length}
        onPress={() => onStart('errors')} />
    </Panel>
    <Panel>
      <View style={styles.spread}>
        <Text style={styles.subheading}>Preguntas marcadas</Text>
        <Text style={styles.eyebrow}>{quiz.marked.length} MARCADAS</Text>
      </View>
      <Text style={styles.body}>Usa la estrella en cualquier pregunta para guardarla aquí.</Text>
      <Button variant="secondary" label="Practicar marcadas" disabled={saving || !quiz.marked.length}
        onPress={() => onStart('marked')} />
    </Panel>
    <Panel>
      <Text style={styles.subheading}>Modo tarjeta</Text>
      <Text style={styles.body}>Intenta recordar la respuesta y voltea la tarjeta para comprobarla.</Text>
      <Button variant="secondary" label="Ver todas las tarjetas" disabled={saving} onPress={() => onStart('cards')} />
      {quiz.marked.length > 0 && <Button variant="quiet" label="Ver solo las marcadas" disabled={saving}
        onPress={() => onStart('cards', true)} />}
    </Panel>
    <Button variant="secondary" label="Ver texto original" disabled={saving} onPress={onMaterial} />
    {quiz.attempts.length > 0 && <Panel>
      <Text accessibilityRole="header" style={styles.subheading}>Intentos recientes</Text>
      {quiz.attempts.slice(0, 5).map(attempt => <View key={attempt.id} style={styles.spread}>
        <Text style={styles.body}>{MODE_LABEL[attempt.mode]} · {new Date(attempt.finishedAt).toLocaleDateString('es-PE')}</Text>
        <Text style={styles.bold}>{attempt.answers.filter(answer => answer.correct).length}/{attempt.answers.length}</Text>
      </View>)}
    </Panel>}
    <Button variant="danger" label="Eliminar quiz" loading={saving} onPress={onDelete} />
  </Screen>;
}

export function QuizMaterial({ quiz, onBack }: { quiz: Quiz; onBack: () => void }) {
  return <Screen>
    <Header back={onBack} label="MATERIAL DE ESTUDIO" title={quiz.title} subtitle="Texto revisado al crear este quiz." />
    {quiz.pages.map((page, index) => <Panel key={index}>
      <Text style={styles.eyebrow}>PÁGINA {index + 1}</Text>
      <Text selectable style={styles.body}>{page.text || 'Esta página quedó sin texto.'}</Text>
    </Panel>)}
  </Screen>;
}

const local = StyleSheet.create({
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 2 },
  brandMark: { width: 38, height: 38, borderRadius: 12, backgroundColor: color.primary, alignItems: 'center', justifyContent: 'center' },
  brandMarkText: { color: color.white, fontSize: 20, fontWeight: '900' },
  brand: { fontSize: 23, fontWeight: '900', color: color.ink, flex: 1 },
  badge: { color: color.green, backgroundColor: color.mint, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6,
    fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  hero: { backgroundColor: color.blue, borderRadius: 26, padding: 22, gap: 8, overflow: 'hidden' },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  heroText: { gap: 8 },
  heroEyebrow: { color: '#BFC7FD', letterSpacing: 1.3, fontSize: 10, fontWeight: '800', flexShrink: 1 },
  heroTitle: { color: color.white, fontSize: 31, fontWeight: '900', letterSpacing: -0.65, lineHeight: 36, maxWidth: 340 },
  heroBody: { color: '#E1E5FD', fontSize: 15, lineHeight: 22, maxWidth: 295 },
  heroArt: { width: 55, height: 52 },
  paper: { width: 43, height: 47, borderRadius: 10, backgroundColor: color.mint,
    transform: [{ rotate: '12deg' }], paddingHorizontal: 8, paddingTop: 8, gap: 4 },
  paperBack: { position: 'absolute', backgroundColor: '#858BE1', right: 4, top: 2, transform: [{ rotate: '29deg' }] },
  paperLine: { height: 3, borderRadius: 3, backgroundColor: '#74BBA7' },
  paperCheck: { fontSize: 16, lineHeight: 18, fontWeight: '900', color: color.green, alignSelf: 'flex-end' },
  chevron: { fontSize: 26, fontWeight: '800', color: color.primary },
});
