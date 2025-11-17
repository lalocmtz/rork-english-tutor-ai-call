import { router, useLocalSearchParams } from "expo-router";
import { Mic, MicOff, Phone, X, Subtitles } from "lucide-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Animated, Pressable, StyleSheet, Text, View } from "react-native";
import Colors from "@/constants/colors";
import { TUTORS } from "@/constants/tutors";
import { useAppState } from "@/providers/AppStateProvider";
import { useRealtimeCall } from "@/hooks/useRealtimeCall";

export default function CallScreen() {
  const { tutorId } = useLocalSearchParams<{ tutorId: string }>();
  const { selectedStyle, selectedLanguage, addMinutes } = useAppState();
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [callDuration, setCallDuration] = useState<number>(0);
  const [showSubtitles, setShowSubtitles] = useState<boolean>(true);
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const tutor = TUTORS.find((t) => t.id === tutorId);

  const { isConnected, isSpeaking, transcript, startCall, endCall, toggleMute } = useRealtimeCall({
    tutorName: tutor?.name || "Tutor",
    tutorStyle: selectedStyle,
    tutorLanguage: selectedLanguage,
  });

  useEffect(() => {
    startCall();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (isSpeaking) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.15,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      pulseAnim.setValue(1);
    }
  }, [isSpeaking]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleEndCall = useCallback(() => {
    endCall();
    const minutes = Math.ceil(callDuration / 60);
    addMinutes(minutes);
    router.replace(`/rating?tutorId=${tutorId}`);
  }, [callDuration, tutorId, addMinutes]);

  const handleToggleMute = () => {
    toggleMute();
    setIsMuted(!isMuted);
  };

  if (!tutor) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.tutorName}>{tutor.name}</Text>
        <Text style={styles.duration}>{formatTime(callDuration)}</Text>
      </View>

      <View style={styles.avatarContainer}>
        <Animated.View
          style={[
            styles.avatar,
            {
              transform: [{ scale: pulseAnim }],
            },
          ]}
        >
          <Phone size={48} color={Colors.white} />
        </Animated.View>
        {isConnected && (
          <Text style={styles.statusText}>
            {isSpeaking ? "Hablando..." : "Escuchando..."}
          </Text>
        )}
        
        {showSubtitles && transcript && (
          <View style={styles.subtitleContainer}>
            <Text style={styles.subtitleText}>{transcript}</Text>
          </View>
        )}
      </View>

      <View style={styles.controls}>
        <Pressable
          style={[styles.controlButton, isMuted && styles.controlButtonActive]}
          onPress={handleToggleMute}
        >
          {isMuted ? (
            <MicOff size={28} color={Colors.white} />
          ) : (
            <Mic size={28} color={Colors.black} />
          )}
        </Pressable>

        <Pressable
          style={[styles.controlButton, showSubtitles && styles.controlButtonActive]}
          onPress={() => setShowSubtitles(!showSubtitles)}
        >
          <Subtitles size={28} color={showSubtitles ? Colors.white : Colors.black} />
        </Pressable>

        <Pressable style={styles.endCallButton} onPress={handleEndCall}>
          <X size={32} color={Colors.white} />
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
    paddingBottom: 60,
  },
  header: {
    alignItems: "center",
    marginBottom: 60,
  },
  tutorName: {
    fontSize: 28,
    fontWeight: "600" as const,
    color: Colors.black,
    marginBottom: 8,
  },
  duration: {
    fontSize: 16,
    color: Colors.gray[600],
  },
  avatarContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: Colors.black,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  statusText: {
    fontSize: 16,
    color: Colors.gray[600],
  },
  subtitleContainer: {
    marginTop: 24,
    paddingHorizontal: 32,
    paddingVertical: 16,
    backgroundColor: Colors.black,
    borderRadius: 20,
    maxWidth: "90%",
    minHeight: 60,
    justifyContent: "center",
    alignItems: "center",
  },
  subtitleText: {
    fontSize: 18,
    fontWeight: "600" as const,
    color: Colors.white,
    textAlign: "center",
    lineHeight: 24,
  },
  controls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 24,
    paddingHorizontal: 24,
  },
  controlButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.gray[100],
    alignItems: "center",
    justifyContent: "center",
  },
  controlButtonActive: {
    backgroundColor: Colors.gray[700],
  },
  endCallButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.red,
    alignItems: "center",
    justifyContent: "center",
  },
});
