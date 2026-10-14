import { createContext, useContext, type ReactNode } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

const light = {
  bg: "#f6f7f4",
  surface: "#ffffff",
  text: "#1c2321",
  muted: "#5d6764",
  border: "#dde2de",
  accent: "#0b6e4f",
  accentSoft: "#e3f1ea",
  warn: "#a8341f",
  warnSoft: "#fbe9e4",
};

const dark: typeof light = {
  bg: "#121615",
  surface: "#1b211f",
  text: "#e7ece9",
  muted: "#9aa5a1",
  border: "#2d3532",
  accent: "#4fc49a",
  accentSoft: "#1d3029",
  warn: "#f08d78",
  warnSoft: "#3a2420",
};

export type Palette = typeof light;
export const palettes = { light, dark };
export const PaletteContext = createContext<Palette>(light);
export const usePalette = () => useContext(PaletteContext);

export function Card({ children }: { children: ReactNode }) {
  const c = usePalette();
  return <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>{children}</View>;
}

interface FieldProps {
  label: string;
  hint?: string;
  children: ReactNode;
}

function Field({ label, hint, children }: FieldProps) {
  const c = usePalette();
  return (
    <View style={styles.field}>
      <Text style={[styles.label, { color: c.text }]}>{label}</Text>
      {children}
      {hint && <Text style={[styles.hint, { color: c.muted }]}>{hint}</Text>}
    </View>
  );
}

interface MoneyFieldProps {
  label: string;
  hint?: string;
  value: string;
  onChange: (value: string) => void;
}

export function MoneyField({ label, hint, value, onChange }: MoneyFieldProps) {
  const c = usePalette();
  return (
    <Field label={label} hint={hint}>
      <View style={[styles.input, { borderColor: c.border, backgroundColor: c.bg }]}>
        <Text style={{ color: c.muted, fontSize: 16 }}>$</Text>
        <TextInput
          accessibilityLabel={label}
          style={[styles.textInput, { color: c.text }]}
          keyboardType="decimal-pad"
          placeholder="0"
          placeholderTextColor={c.muted}
          value={value}
          onChangeText={onChange}
        />
      </View>
    </Field>
  );
}

interface YearFieldProps {
  label: string;
  hint?: string;
  value: number;
  min: number;
  max: number;
  onChange: (value: number) => void;
  emptyLabel?: string;
}

export function YearField({ label, hint, value, min, max, onChange, emptyLabel }: YearFieldProps) {
  const c = usePalette();
  const floor = emptyLabel ? min - 1 : min;
  const shown = emptyLabel && value < min ? emptyLabel : String(value);
  const step = (d: number) => onChange(Math.min(max, Math.max(floor, value + d)));
  return (
    <Field label={label} hint={hint}>
      <View style={[styles.input, styles.stepper, { borderColor: c.border, backgroundColor: c.bg }]}>
        <StepButton label="−" disabled={value <= floor} onPress={() => step(-1)} />
        <Text style={[styles.stepValue, { color: c.text }]}>{shown}</Text>
        <StepButton label="+" disabled={value >= max} onPress={() => step(1)} />
      </View>
    </Field>
  );
}

function StepButton({ label, disabled, onPress }: { label: string; disabled: boolean; onPress: () => void }) {
  const c = usePalette();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label === "+" ? "Increase" : "Decrease"}
      disabled={disabled}
      onPress={onPress}
      hitSlop={8}
      style={styles.stepButton}
    >
      <Text style={{ fontSize: 22, fontWeight: "600", color: disabled ? c.border : c.accent }}>{label}</Text>
    </Pressable>
  );
}

interface ResultProps {
  headline: string;
  amount: string;
  tone?: "ok" | "warn";
  children?: ReactNode;
}

export function Result({ headline, amount, tone = "ok", children }: ResultProps) {
  const c = usePalette();
  const warn = tone === "warn";
  return (
    <View style={[styles.result, { backgroundColor: warn ? c.warnSoft : c.accentSoft }]}>
      <Text style={[styles.label, { color: c.muted }]}>{headline}</Text>
      <Text style={[styles.amount, { color: warn ? c.warn : c.accent }]}>{amount}</Text>
      {children}
    </View>
  );
}

export function Row({ label, value }: { label: string; value: string }) {
  const c = usePalette();
  return (
    <View style={[styles.row, { borderTopColor: c.border }]}>
      <Text style={[styles.rowLabel, { color: c.muted }]}>{label}</Text>
      <Text style={[styles.rowValue, { color: c.text }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 12, padding: 16, gap: 18 },
  field: { gap: 6 },
  label: { fontSize: 15, fontWeight: "600" },
  hint: { fontSize: 13 },
  input: { flexDirection: "row", alignItems: "center", gap: 6, borderWidth: 1, borderRadius: 8, paddingHorizontal: 12 },
  textInput: { flex: 1, fontSize: 16, paddingVertical: 10 },
  stepper: { justifyContent: "space-between", paddingVertical: 4 },
  stepButton: { paddingHorizontal: 10, paddingVertical: 2 },
  stepValue: { fontSize: 16, fontVariant: ["tabular-nums"] },
  result: { borderRadius: 12, padding: 16 },
  amount: { fontSize: 40, fontWeight: "700", fontVariant: ["tabular-nums"], marginBottom: 8 },
  row: { flexDirection: "row", justifyContent: "space-between", gap: 16, paddingVertical: 8, borderTopWidth: 1 },
  rowLabel: { flex: 1, fontSize: 14 },
  rowValue: { fontSize: 14, fontWeight: "600", fontVariant: ["tabular-nums"] },
});
