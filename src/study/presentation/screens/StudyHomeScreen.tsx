import React from 'react';
import { Pressable, RefreshControl, StyleSheet, Text, View } from 'react-native';
import type { Quiz } from '../../domain/types';
import { Button, color, Panel, Screen, styles } from '../ui';

export function StudyHomeScreen({
  quizzes,
  refreshing = false,
  onRefresh,
  onNew,
  onOpen,
  onExit,
}: {
  quizzes: Quiz[];
  refreshing?: boolean;
  onRefresh?: () => void;
  onNew: () => void;
  onOpen: (id: string) => void;
  onExit?: () => void;
}) {
  return (
    <Screen
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={color.primary}
            colors={[color.primary]}
          />
        ) : undefined
      }>
      {onExit && <Button label="‹  Salir de Repaso" variant="quiet" onPress={onExit} />}
      <View style={local.brandRow}>
        <View style={local.brandMark}>
          <Text style={local.brandMarkText}>R</Text>
        </View>
        <Text accessibilityRole="header" style={local.brand}>
          Repaso
        </Text>
        <Text style={local.badge}>OFFLINE</Text>
      </View>

      <View style={local.hero}>
        <View style={local.heroTop}>
          <Text style={local.heroEyebrow}>TU ESPACIO DE ESTUDIO</Text>
          <View style={local.heroArt} accessible={false} importantForAccessibility="no-hide-descendants">
            <View style={[local.paper, local.paperBack]} />
            <View style={local.paper}>
              <View style={local.paperLine} />
              <View style={[local.paperLine, local.paperLineShort]} />
              <Text style={local.paperCheck}>✓</Text>
            </View>
          </View>
        </View>
        <View style={local.heroText}>
          <Text accessibilityRole="header" style={local.heroTitle}>
            De tus páginas{'\n'}a tu próximo examen.
          </Text>
          <Text style={local.heroBody}>
            Convierte fotos y capturas en preguntas para practicar a tu ritmo.
          </Text>
        </View>
      </View>

      <Button label="+  Crear un quiz" onPress={onNew} />

      <View style={styles.spread}>
        <Text accessibilityRole="header" style={styles.heading}>
          Mis quizzes
        </Text>
        <Text style={styles.eyebrow}>{quizzes.length} GUARDADOS</Text>
      </View>

      {quizzes.length === 0 && (
        <Panel>
          <Text style={styles.subheading}>Tu primer quiz empieza aquí</Text>
          <Text style={styles.body}>
            Sube una captura o prueba con el texto de ejemplo al crear un quiz.
          </Text>
        </Panel>
      )}

      {quizzes.map(quiz => (
        <Pressable
          key={quiz.id}
          accessibilityRole="button"
          accessibilityLabel={`Abrir ${quiz.title}`}
          onPress={() => onOpen(quiz.id)}
          style={({ pressed }) => pressed && styles.pressed}>
          <Panel>
            <View style={styles.spread}>
              <Text style={[styles.subheading, styles.flexOne]}>{quiz.title}</Text>
              <Text style={local.chevron}>›</Text>
            </View>
            <Text style={styles.body}>
              {quiz.questions.length} preguntas · {quiz.pages.length}{' '}
              {quiz.pages.length === 1 ? 'página' : 'páginas'}
            </Text>
            {quiz.pendingErrors.length > 0 && (
              <Text style={styles.small}>{quiz.pendingErrors.length} por repasar</Text>
            )}
          </Panel>
        </Pressable>
      ))}
    </Screen>
  );
}

const local = StyleSheet.create({
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 2 },
  brandMark: { width: 38, height: 38, borderRadius: 12, backgroundColor: color.primary, alignItems: 'center', justifyContent: 'center' },
  brandMarkText: { color: color.white, fontSize: 20, fontWeight: '900' },
  brand: { fontSize: 23, fontWeight: '900', color: color.ink, flex: 1 },
  badge: { color: color.green, backgroundColor: color.mint, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6, fontSize: 10, fontWeight: '900', letterSpacing: 1 },
  hero: { backgroundColor: color.blue, borderRadius: 26, padding: 22, gap: 8, overflow: 'hidden' },
  heroTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  heroText: { gap: 8 },
  heroEyebrow: { color: '#BFC7FD', letterSpacing: 1.3, fontSize: 10, fontWeight: '800', flexShrink: 1 },
  heroTitle: { color: color.white, fontSize: 31, fontWeight: '900', letterSpacing: -0.65, lineHeight: 36, maxWidth: 340 },
  heroBody: { color: '#E1E5FD', fontSize: 15, lineHeight: 22, maxWidth: 295 },
  heroArt: { width: 55, height: 52 },
  paper: { width: 43, height: 47, borderRadius: 10, backgroundColor: color.mint, transform: [{ rotate: '12deg' }], paddingHorizontal: 8, paddingTop: 8, gap: 4 },
  paperBack: { position: 'absolute', backgroundColor: '#858BE1', right: 4, top: 2, transform: [{ rotate: '29deg' }] },
  paperLine: { height: 3, borderRadius: 3, backgroundColor: '#74BBA7' },
  paperLineShort: { width: '65%' },
  paperCheck: { fontSize: 16, lineHeight: 18, fontWeight: '900', color: color.green, alignSelf: 'flex-end' },
  chevron: { fontSize: 26, fontWeight: '800', color: color.primary },
});

