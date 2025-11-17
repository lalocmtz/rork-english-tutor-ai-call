import { router, useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { TUTOR_LANGUAGES, TUTOR_STYLES, TUTORS } from "@/constants/tutors";
import { useAppState } from "@/providers/AppStateProvider";

export default function PreCallScreen() {
  const { tutorId } = useLocalSearchParams<{ tutorId: string }>();
  const { selectedStyle, selectedLanguage, updateStyle, updateLanguage, completeOnboarding } = useAppState();
  const [localStyle, setLocalStyle] = useState(selectedStyle);
  const [localLanguage, setLocalLanguage] = useState(selectedLanguage);

  const tutor = TUTORS.find((t) => t.id === tutorId);

  if (!tutor) {
    return null;
  }

  const handleStartCall = () => {
    updateStyle(localStyle);
    updateLanguage(localLanguage);
    completeOnboarding();
    router.push(`/call?tutorId=${tutorId}`);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.title}>Configura Tu Sesión</Text>
        <Text style={styles.subtitle}>con {tutor.name}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Estilo de Enseñanza</Text>
        <View style={styles.optionsContainer}>
          {TUTOR_STYLES.map((style) => (
            <Pressable
              key={style.id}
              style={[
                styles.optionCard,
                localStyle === style.id && styles.optionCardSelected,
              ]}
              onPress={() => setLocalStyle(style.id)}
            >
              <Text
                style={[
                  styles.optionLabel,
                  localStyle === style.id && styles.optionLabelSelected,
                ]}
              >
                {style.label}
              </Text>
              <Text
                style={[
                  styles.optionDescription,
                  localStyle === style.id && styles.optionDescriptionSelected,
                ]}
              >
                {style.description}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Idioma</Text>
        <View style={styles.optionsContainer}>
          {TUTOR_LANGUAGES.map((language) => (
            <Pressable
              key={language.id}
              style={[
                styles.optionCard,
                localLanguage === language.id && styles.optionCardSelected,
              ]}
              onPress={() => setLocalLanguage(language.id)}
            >
              <Text
                style={[
                  styles.optionLabel,
                  localLanguage === language.id && styles.optionLabelSelected,
                ]}
              >
                {language.label}
              </Text>
              <Text
                style={[
                  styles.optionDescription,
                  localLanguage === language.id && styles.optionDescriptionSelected,
                ]}
              >
                {language.description}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      <Pressable style={styles.startButton} onPress={handleStartCall}>
        <Text style={styles.startButtonText}>Iniciar Llamada</Text>
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
    paddingTop: 24,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 28,
    fontWeight: "600" as const,
    color: Colors.black,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray[600],
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
  optionsContainer: {
    gap: 12,
  },
  optionCard: {
    backgroundColor: Colors.gray[50],
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: Colors.gray[100],
  },
  optionCardSelected: {
    backgroundColor: Colors.black,
    borderColor: Colors.black,
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.black,
    marginBottom: 4,
  },
  optionLabelSelected: {
    color: Colors.white,
  },
  optionDescription: {
    fontSize: 14,
    color: Colors.gray[600],
  },
  optionDescriptionSelected: {
    color: Colors.gray[300],
  },
  startButton: {
    backgroundColor: Colors.black,
    borderRadius: 12,
    padding: 18,
    alignItems: "center",
    marginTop: 8,
  },
  startButtonText: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: Colors.white,
  },
});
