import { router } from "expo-router";
import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { TUTOR_LANGUAGES, TUTOR_STYLES } from "@/constants/tutors";
import { useAppState } from "@/providers/AppStateProvider";

export default function SettingsScreen() {
  const {
    userName,
    selectedVoice,
    selectedStyle,
    selectedLanguage,
    minutesUsedThisMonth,
    streakDays,
    updateStyle,
    updateLanguage,
    resetMinutes,
  } = useAppState();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Configuración</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Usuario</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Nombre</Text>
          <Text style={styles.infoValue}>{userName}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferencias</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Voz Preferida</Text>
          <Text style={styles.infoValue}>
            {selectedVoice === "female" ? "Femenina" : "Masculina"}
          </Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estilo de Enseñanza</Text>
        {TUTOR_STYLES.map((style) => (
          <Pressable
            key={style.id}
            style={[
              styles.optionCard,
              selectedStyle === style.id && styles.optionCardSelected,
            ]}
            onPress={() => updateStyle(style.id)}
          >
            <Text
              style={[
                styles.optionLabel,
                selectedStyle === style.id && styles.optionLabelSelected,
              ]}
            >
              {style.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Idioma</Text>
        {TUTOR_LANGUAGES.map((language) => (
          <Pressable
            key={language.id}
            style={[
              styles.optionCard,
              selectedLanguage === language.id && styles.optionCardSelected,
            ]}
            onPress={() => updateLanguage(language.id)}
          >
            <Text
              style={[
                styles.optionLabel,
                selectedLanguage === language.id && styles.optionLabelSelected,
              ]}
            >
              {language.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Uso</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Minutos este mes</Text>
          <Text style={styles.infoValue}>{minutesUsedThisMonth}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoLabel}>Racha</Text>
          <Text style={styles.infoValue}>{streakDays} días</Text>
        </View>
      </View>

      <Pressable style={styles.resetButton} onPress={resetMinutes}>
        <Text style={styles.resetButtonText}>Reiniciar Minutos</Text>
      </Pressable>

      <Pressable style={styles.backButton} onPress={() => router.back()}>
        <Text style={styles.backButtonText}>Volver al Inicio</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  content: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "600" as const,
    color: Colors.black,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.black,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: Colors.gray[600],
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.black,
  },
  optionCard: {
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: Colors.gray[50],
  },
  optionCardSelected: {
    backgroundColor: Colors.black,
    borderColor: Colors.black,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.black,
  },
  optionLabelSelected: {
    color: Colors.white,
  },
  resetButton: {
    backgroundColor: Colors.gray[100],
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginBottom: 12,
  },
  resetButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.gray[700],
  },
  backButton: {
    backgroundColor: Colors.black,
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.white,
  },
});
