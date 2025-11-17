import { router, useLocalSearchParams } from "expo-router";
import { Star } from "lucide-react-native";
import React, { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { TUTORS } from "@/constants/tutors";

export default function RatingScreen() {
  const { tutorId } = useLocalSearchParams<{ tutorId: string }>();
  const [rating, setRating] = useState<number>(0);

  const tutor = TUTORS.find((t) => t.id === tutorId);

  const handleContinue = () => {
    console.log(`Rated ${tutor?.name} with ${rating} stars`);
    router.replace("/");
  };

  if (!tutor) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Gracias por hablar con {tutor.name}</Text>
        <Text style={styles.subtitle}>¿Cómo estuvo tu sesión?</Text>

        <View style={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <Pressable
              key={star}
              onPress={() => setRating(star)}
              style={styles.starButton}
            >
              <Star
                size={48}
                color={star <= rating ? Colors.black : Colors.gray[300]}
                fill={star <= rating ? Colors.black : "transparent"}
              />
            </Pressable>
          ))}
        </View>

        <Pressable
          style={[styles.continueButton, rating === 0 && styles.continueButtonDisabled]}
          onPress={handleContinue}
          disabled={rating === 0}
        >
          <Text
            style={[
              styles.continueButtonText,
              rating === 0 && styles.continueButtonTextDisabled,
            ]}
          >
            Continuar
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white,
    paddingTop: 60,
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "600" as const,
    color: Colors.black,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray[600],
    textAlign: "center",
    marginBottom: 48,
  },
  starsContainer: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 48,
  },
  starButton: {
    padding: 4,
  },
  continueButton: {
    backgroundColor: Colors.black,
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 48,
    minWidth: 200,
    alignItems: "center",
  },
  continueButtonDisabled: {
    backgroundColor: Colors.gray[200],
  },
  continueButtonText: {
    fontSize: 17,
    fontWeight: "600" as const,
    color: Colors.white,
  },
  continueButtonTextDisabled: {
    color: Colors.gray[500],
  },
});
