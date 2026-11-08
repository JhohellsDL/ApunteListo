import { type ReactNode } from 'react';
import {
  ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export const color = {
  background: '#F4F6FB',
  white: '#FFFFFF',
  ink: '#17223B',
  muted: '#53617A',
  line: '#DCE3F1',
  primary: '#3D43A6',
  primarySoft: '#EDEEFF',
  blue: '#25316E',
  mint: '#CCF4E5',
  green: '#16604D',
  rose: '#FDE9E8',
  red: '#963732',
};

export function Screen({ children }: { children: ReactNode }) {
  return <SafeAreaView style={styles.safe}>
    <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.column}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  </SafeAreaView>;
}

export function Header({ back, label, title, subtitle }: {
  back?: () => void; label: string; title: string; subtitle?: string;
}) {
  return <View style={styles.header}>
    {back && <Button label="‹  Volver" onPress={back} variant="quiet" />}
    <Text style={styles.eyebrow}>{label}</Text>
    <Text accessibilityRole="header" style={styles.title}>{title}</Text>
    {subtitle && <Text style={styles.body}>{subtitle}</Text>}
  </View>;
}

type Variant = 'primary' | 'secondary' | 'quiet' | 'danger';

export function Button({ label, onPress, variant = 'primary', disabled, loading, selected }: {
  label: string; onPress: () => void; variant?: Variant; disabled?: boolean; loading?: boolean; selected?: boolean;
}) {
  const foreground = variant === 'primary' ? color.white : variant === 'danger' ? color.red : color.primary;
  return <Pressable
    accessibilityRole="button"
    accessibilityState={{ disabled: Boolean(disabled || loading), busy: Boolean(loading), selected }}
    disabled={disabled || loading}
    onPress={onPress}
    style={({ pressed }) => [styles.button, variants[variant], selected && styles.selected,
      (disabled || loading) && styles.disabled, pressed && styles.pressed]}>
    {loading && <ActivityIndicator size="small" color={foreground} />}
    <Text style={[styles.buttonLabel, { color: foreground }]}>{label}</Text>
  </Pressable>;
}

export function Panel({ children, tone = 'white' }: { children: ReactNode; tone?: 'white' | 'soft' | 'success' | 'error' }) {
  return <View style={[styles.panel, panels[tone]]}>{children}</View>;
}

export function Progress({ value, total }: { value: number; total: number }) {
  const percent = Math.max(0, Math.min(100, total ? (value / total) * 100 : 0));
  return <View accessibilityRole="progressbar" accessibilityValue={{ min: 0, max: total, now: value }} style={styles.track}>
    <View style={[styles.bar, { width: `${percent}%` }]} />
  </View>;
}

export function Notice({ message }: { message: string }) {
  return <Panel tone="error"><Text accessibilityRole="alert" accessibilityLiveRegion="polite" style={styles.error}>{message}</Text></Panel>;
}

export function Evidence({ page, text }: { page: number; text: string }) {
  return <View style={styles.evidence}>
    <Text style={styles.eyebrow}>FUENTE · PÁGINA {page}</Text>
    <Text selectable style={styles.body}>{text}</Text>
  </View>;
}

export const styles = StyleSheet.create({
  fill: { flex: 1 },
  safe: { flex: 1, backgroundColor: color.background },
  scroll: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 34, flexGrow: 1 },
  column: { width: '100%', maxWidth: 640, alignSelf: 'center', gap: 16 },
  header: { gap: 6, marginBottom: 4 },
  eyebrow: { fontSize: 12, fontWeight: '800', letterSpacing: 1.4, color: color.primary },
  title: { fontSize: 34, fontWeight: '800', letterSpacing: -0.9, color: color.ink },
  heading: { fontSize: 22, lineHeight: 28, fontWeight: '800', color: color.ink },
  subheading: { fontSize: 17, lineHeight: 23, fontWeight: '800', color: color.ink },
  body: { color: color.muted, fontSize: 15, lineHeight: 22 },
  small: { color: color.muted, fontSize: 13, lineHeight: 19 },
  bold: { color: color.ink, fontWeight: '700' },
  error: { color: color.red, fontSize: 15, lineHeight: 22, fontWeight: '600' },
  good: { color: color.green, fontSize: 15, lineHeight: 22, fontWeight: '700' },
  row: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 8 },
  spread: { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  stack: { gap: 9 },
  panel: { borderWidth: 1, borderColor: color.line, padding: 17, borderRadius: 20, gap: 10 },
  button: { minHeight: 48, paddingHorizontal: 15, paddingVertical: 10, borderRadius: 14, borderWidth: 1,
    justifyContent: 'center', alignItems: 'center', flexDirection: 'row', gap: 8 },
  buttonLabel: { fontWeight: '800', fontSize: 15, textAlign: 'center', flexShrink: 1 },
  selected: { borderWidth: 2, borderColor: color.primary, backgroundColor: color.primarySoft },
  disabled: { opacity: 0.5 },
  pressed: { opacity: 0.72 },
  track: { height: 8, borderRadius: 10, backgroundColor: color.line, overflow: 'hidden' },
  bar: { height: 8, backgroundColor: color.primary },
  evidence: { borderLeftWidth: 3, borderLeftColor: '#A3ACEE', paddingLeft: 12, gap: 5 },
  input: { borderColor: '#BCC8E0', borderWidth: 1, borderRadius: 13, paddingHorizontal: 13, paddingVertical: 12,
    color: color.ink, backgroundColor: color.white, fontSize: 16, minHeight: 49 },
  multiline: { minHeight: 145, textAlignVertical: 'top' },
});

const variants = StyleSheet.create({
  primary: { backgroundColor: color.primary, borderColor: color.primary },
  secondary: { backgroundColor: color.white, borderColor: '#BCC8E0' },
  quiet: { alignSelf: 'flex-start', backgroundColor: 'transparent', borderColor: 'transparent', paddingHorizontal: 4 },
  danger: { alignSelf: 'flex-start', backgroundColor: color.rose, borderColor: 'transparent' },
});

const panels = StyleSheet.create({
  white: { backgroundColor: color.white },
  soft: { backgroundColor: color.primarySoft, borderColor: '#D8DAFD' },
  success: { backgroundColor: color.mint, borderColor: '#A6DFCB' },
  error: { backgroundColor: color.rose, borderColor: '#F5CCCA' },
});
