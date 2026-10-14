import { StatusBar } from "expo-status-bar";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, useColorScheme, View } from "react-native";
import { SafeAreaProvider, SafeAreaView } from "react-native-safe-area-context";
import { Fhsa } from "./src/Fhsa";
import { Rrsp } from "./src/Rrsp";
import { Tfsa } from "./src/Tfsa";
import { PaletteContext, palettes } from "./src/ui";

const TABS = [
  { id: "tfsa", label: "TFSA", Screen: Tfsa },
  { id: "rrsp", label: "RRSP", Screen: Rrsp },
  { id: "fhsa", label: "FHSA", Screen: Fhsa },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function App() {
  const scheme = useColorScheme();
  const c = scheme === "dark" ? palettes.dark : palettes.light;
  const [tab, setTab] = useState<TabId>("tfsa");
  const { Screen } = TABS.find((t) => t.id === tab)!;

  return (
    <SafeAreaProvider>
      <PaletteContext.Provider value={c}>
        <SafeAreaView style={[styles.flex, { backgroundColor: c.bg }]} edges={["top", "left", "right"]}>
          <StatusBar style={scheme === "dark" ? "light" : "dark"} />
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets>
            <Text style={[styles.title, { color: c.text }]}>RoomCheck</Text>
            <Text style={{ color: c.muted }}>How much you can still put into your TFSA, RRSP and FHSA.</Text>

            <View style={[styles.tabs, { backgroundColor: c.surface, borderColor: c.border }]} accessibilityRole="tablist">
              {TABS.map((t) => {
                const active = t.id === tab;
                return (
                  <Pressable
                    key={t.id}
                    accessibilityRole="tab"
                    accessibilityState={{ selected: active }}
                    onPress={() => setTab(t.id)}
                    style={[styles.tab, active && { backgroundColor: c.accent }]}
                  >
                    <Text style={[styles.tabText, { color: active ? c.surface : c.muted }]}>{t.label}</Text>
                  </Pressable>
                );
              })}
            </View>

            <Screen key={tab} />

            <Text style={[styles.footer, { color: c.muted }]}>
              Estimates only. Your CRA My Account and Notice of Assessment are the official record of your room.
            </Text>
          </ScrollView>
        </SafeAreaView>
      </PaletteContext.Provider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 16, gap: 16, paddingBottom: 48 },
  title: { fontSize: 28, fontWeight: "700", letterSpacing: -0.5 },
  tabs: { flexDirection: "row", padding: 4, borderRadius: 10, borderWidth: 1, gap: 4 },
  tab: { flex: 1, alignItems: "center", paddingVertical: 10, borderRadius: 7 },
  tabText: { fontWeight: "600", fontSize: 15 },
  footer: { fontSize: 12, marginTop: 8 },
});
