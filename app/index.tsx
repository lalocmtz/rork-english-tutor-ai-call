import { router } from "expo-router";
import { Phone, Settings, Flame, Clock } from "lucide-react-native";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { TUTORS } from "@/constants/tutors";
import { useAppState } from "@/providers/AppStateProvider";

export default function HomeScreen() {
  const { userName, hasCompletedOnboarding, selectedTutorId, updateTutorId, streakDays, minutesUsedThisMonth } = useAppState();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  const handleTutorSelect = (tutorId: string) => {
    updateTutorId(tutorId);
    
    if (hasCompletedOnboarding) {
      router.push(`/call?tutorId=${tutorId}`);
    } else {
      router.push(`/pre-call?tutorId=${tutorId}`);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}, {userName}</Text>
            <Text style={styles.subtitle}>¿Listo para tu sesión de inglés?</Text>
          </View>
          <Pressable
            onPress={() => router.push("/settings")}
            style={styles.settingsButton}
          >
            <Settings size={24} color={Colors.gray[700]} />
          </Pressable>
        </View>
        
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Flame size={24} color={Colors.orange} />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statValue}>{streakDays}</Text>
              <Text style={styles.statLabel}>días de racha</Text>
            </View>
          </View>
          
          <View style={styles.statCard}>
            <View style={styles.statIconContainer}>
              <Clock size={24} color={Colors.blue} />
            </View>
            <View style={styles.statTextContainer}>
              <Text style={styles.statValue}>{minutesUsedThisMonth}</Text>
              <Text style={styles.statLabel}>minutos este mes</Text>
            </View>
          </View>
        </View>
      </View>

      <View style={styles.tutorsContainer}>
        {TUTORS.map((tutor) => (
          <Pressable
            key={tutor.id}
            style={styles.tutorCard}
            onPress={() => handleTutorSelect(tutor.id)}
          >
            <View style={styles.tutorIconContainer}>
              <View style={styles.tutorIcon}>
                <Phone size={32} color={Colors.white} />
              </View>
            </View>
            <View style={styles.tutorInfo}>
              <Text style={styles.tutorName}>{tutor.name}</Text>
              <Text style={styles.tutorDescription}>{tutor.description}</Text>
              <Text style={styles.tutorVoice}>
                {tutor.voice === "female" ? "Voz Femenina" : "Voz Masculina"}
              </Text>
            </View>
          </Pressable>
        ))}
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
  header: {
    paddingHorizontal: 24,
    marginBottom: 32,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  greeting: {
    fontSize: 28,
    fontWeight: "600" as const,
    color: Colors.black,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.gray[600],
  },
  settingsButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
  tutorsContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  tutorCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  tutorIconContainer: {
    marginRight: 16,
  },
  tutorIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.black,
    alignItems: "center",
    justifyContent: "center",
  },
  tutorInfo: {
    flex: 1,
  },
  tutorName: {
    fontSize: 22,
    fontWeight: "600" as const,
    color: Colors.black,
    marginBottom: 4,
  },
  tutorDescription: {
    fontSize: 14,
    color: Colors.gray[600],
    marginBottom: 4,
  },
  tutorVoice: {
    fontSize: 13,
    color: Colors.gray[500],
  },
  statsContainer: {
    flexDirection: "row",
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: Colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  statIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.gray[50],
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  statTextContainer: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700" as const,
    color: Colors.black,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.gray[600],
  },
});
