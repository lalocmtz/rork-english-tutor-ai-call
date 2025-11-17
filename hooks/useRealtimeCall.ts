import { Audio } from "expo-av";
import { useCallback, useEffect, useRef, useState } from "react";
import { Platform } from "react-native";
import { SOUND_URLS } from "@/constants/sounds";
import { TutorLanguage, TutorStyle } from "@/constants/tutors";

interface UseRealtimeCallProps {
  tutorName: string;
  tutorStyle: TutorStyle;
  tutorLanguage: TutorLanguage;
}

export function useRealtimeCall({
  tutorName,
  tutorStyle,
  tutorLanguage,
}: UseRealtimeCallProps) {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [transcript, setTranscript] = useState<string>("");

  const wsRef = useRef<WebSocket | null>(null);
  const recordingRef = useRef<Audio.Recording | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const soundObjectRef = useRef<Audio.Sound | null>(null);
  const audioQueueRef = useRef<string[]>([]);
  const isPlayingRef = useRef<boolean>(false);

  const playSound = async (url: string) => {
    try {
      const { sound } = await Audio.Sound.createAsync({ uri: url });
      await sound.playAsync();
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync();
        }
      });
    } catch (error) {
      console.error("Error playing sound:", error);
    }
  };

  const getSystemPrompt = () => {
    const styleInstructions = {
      strict: "Eres un maestro de inglés estricto. Enfócate en correcciones y gramática apropiada. Sé directo y exhaustivo.",
      friendly: "Eres un maestro de inglés amigable. Sé alentador, paciente y haz que aprender sea divertido.",
      coach: "Eres un coach bilingüe. Sé flexible y adaptable, cambiando entre inglés y español según sea necesario.",
    };

    const languageInstructions = {
      english: "Habla solo en inglés a menos que el estudiante específicamente pida ayuda en español.",
      spanish: "Habla solo en español a menos que el estudiante específicamente pida ayuda en inglés.",
      mixed: "Detecta qué idioma está usando el estudiante y responde en ese idioma. Alterna naturalmente entre inglés y español. Inicia la conversación en inglés para practicar, pero si el estudiante responde en español, ayuda en español y luego vuelve al inglés.",
    };

    return `${styleInstructions[tutorStyle]} Estás hablando con Eduardo, un mexicano que quiere mejorar su inglés. ${languageInstructions[tutorLanguage]} 
    
    Habla con un tono natural y conversacional. Corrige la pronunciación suavemente y solo cuando sea útil. 
    Haz preguntas sobre su día, vida, hábitos y experiencias. Anímalo a hablar. 
    Mantén tus respuestas cortas y naturales, como una llamada telefónica real.
    Cuando el usuario se conecte, salúdalo de inmediato sin esperar a que hable primero. Di algo como "Hey Eduardo, good to hear from you. How's your day going so far?" o similar según el estilo y idioma. 
    Recuerda todo lo que Eduardo te cuenta durante esta llamada para mantener una conversación coherente y personalizada.`;
  };

  const pcm16ToWav = (pcm16Base64: string): string => {
    try {
      const binaryString = atob(pcm16Base64);
      const len = binaryString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      const sampleRate = 24000;
      const numChannels = 1;
      const bitsPerSample = 16;
      const byteRate = (sampleRate * numChannels * bitsPerSample) / 8;
      const blockAlign = (numChannels * bitsPerSample) / 8;
      const dataSize = bytes.length;
      const header = new ArrayBuffer(44);
      const view = new DataView(header);

      const writeString = (offset: number, string: string) => {
        for (let i = 0; i < string.length; i++) {
          view.setUint8(offset + i, string.charCodeAt(i));
        }
      };

      writeString(0, "RIFF");
      view.setUint32(4, 36 + dataSize, true);
      writeString(8, "WAVE");
      writeString(12, "fmt ");
      view.setUint32(16, 16, true);
      view.setUint16(20, 1, true);
      view.setUint16(22, numChannels, true);
      view.setUint32(24, sampleRate, true);
      view.setUint32(28, byteRate, true);
      view.setUint16(32, blockAlign, true);
      view.setUint16(34, bitsPerSample, true);
      writeString(36, "data");
      view.setUint32(40, dataSize, true);

      const wavBytes = new Uint8Array(44 + dataSize);
      wavBytes.set(new Uint8Array(header), 0);
      wavBytes.set(bytes, 44);

      let binary = "";
      for (let i = 0; i < wavBytes.length; i++) {
        binary += String.fromCharCode(wavBytes[i]);
      }
      return btoa(binary);
    } catch (error) {
      console.error("Error converting PCM16 to WAV:", error);
      return "";
    }
  };

  const processAudioQueue = async () => {
    if (isPlayingRef.current || audioQueueRef.current.length === 0) {
      return;
    }

    isPlayingRef.current = true;

    while (audioQueueRef.current.length > 0) {
      const base64Audio = audioQueueRef.current.shift();
      if (!base64Audio) continue;

      try {
        if (Platform.OS === "web") {
          if (!audioContextRef.current) {
            audioContextRef.current = new AudioContext({ sampleRate: 24000 });
          }

          const audioContext = audioContextRef.current;
          const wavBase64 = pcm16ToWav(base64Audio);
          const binaryString = atob(wavBase64);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }

          const audioBuffer = await audioContext.decodeAudioData(bytes.buffer);
          const source = audioContext.createBufferSource();
          source.buffer = audioBuffer;
          source.connect(audioContext.destination);

          await new Promise<void>((resolve) => {
            source.onended = () => resolve();
            source.start();
          });
        } else {
          const wavBase64 = pcm16ToWav(base64Audio);

          if (soundObjectRef.current) {
            try {
              await soundObjectRef.current.unloadAsync();
            } catch (e) {
              console.log("Sound already unloaded");
            }
          }

          const { sound } = await Audio.Sound.createAsync(
            { uri: `data:audio/wav;base64,${wavBase64}` },
            { shouldPlay: false }
          );

          soundObjectRef.current = sound;

          await sound.playAsync();

          await new Promise<void>((resolve) => {
            sound.setOnPlaybackStatusUpdate((status) => {
              if (status.isLoaded && status.didJustFinish) {
                resolve();
              }
            });
          });
        }
      } catch (error) {
        console.error("Error playing audio chunk:", error);
      }
    }

    isPlayingRef.current = false;
  };

  const playAudioChunk = (base64Audio: string) => {
    audioQueueRef.current.push(base64Audio);
    processAudioQueue();
  };

  const setupWebSocket = (ws: WebSocket) => {
    console.log("Setting up WebSocket...");

    ws.onopen = () => {
      console.log("✅ WebSocket connected successfully");

      const sessionUpdate = {
        type: "session.update",
        session: {
          modalities: ["text", "audio"],
          instructions: getSystemPrompt(),
          voice: "alloy",
          input_audio_format: "pcm16",
          output_audio_format: "pcm16",
          input_audio_transcription: {
            model: "whisper-1",
          },
          turn_detection: {
            type: "server_vad",
            threshold: 0.5,
            prefix_padding_ms: 300,
            silence_duration_ms: 500,
          },
        },
      };

      ws.send(JSON.stringify(sessionUpdate));
      console.log("✅ Session update sent");
      
      setTimeout(() => {
        const createResponse = {
          type: "response.create",
        };
        ws.send(JSON.stringify(createResponse));
        console.log("✅ Triggered initial greeting");
      }, 500);
      
      setIsConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        console.log("📩 Realtime EVENT:", data.type);

        switch (data.type) {
          case "session.created":
            console.log("✅ Session created successfully", data);
            break;

          case "session.updated":
            console.log("✅ Session updated successfully", data);
            break;

          case "response.audio.delta":
            if (data.delta) {
              console.log("🎵 Received audio delta, length:", data.delta.length);
              playAudioChunk(data.delta);
              setIsSpeaking(true);
            }
            break;

          case "response.audio.done":
            console.log("✅ Audio response complete");
            setIsSpeaking(false);
            break;

          case "response.audio_transcript.delta":
            if (data.delta) {
              setTranscript((prev) => prev + data.delta);
            }
            break;

          case "response.audio_transcript.done":
            if (data.transcript) {
              console.log("📝 Transcript:", data.transcript);
              setTranscript(data.transcript);
            }
            setTimeout(() => setTranscript(""), 3000);
            break;

          case "conversation.item.input_audio_transcription.completed":
            console.log("👤 User said:", data.transcript);
            break;

          case "input_audio_buffer.speech_started":
            console.log("🎤 User started speaking");
            break;

          case "input_audio_buffer.speech_stopped":
            console.log("🎤 User stopped speaking");
            break;

          case "response.done":
            console.log("✅ Response complete");
            break;

          case "error":
            console.error("❌ WebSocket error:", data.error);
            break;

          default:
            console.log("📩 Unhandled event type:", data.type);
        }
      } catch (error) {
        console.error("❌ Error parsing WebSocket message:", error);
      }
    };

    ws.onerror = (error) => {
      console.error("❌ WebSocket connection error:", error);
      try {
        console.error("❌ Error stringified:", JSON.stringify(error, null, 2));
        console.error("❌ Error with getOwnPropertyNames:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
        if (error && typeof error === "object") {
          console.error("❌ Error keys:", Object.keys(error));
          console.error("❌ Error entries:", Object.entries(error));
        }
      } catch (e) {
        console.error("❌ Error object (toString):", String(error));
        console.error("❌ Error type:", typeof error);
      }
    };

    ws.onclose = (event) => {
      console.log("🔌 WebSocket disconnected.");
      console.log("   - Code:", event.code);
      console.log("   - Reason:", event.reason || "(no reason provided)");
      console.log("   - Was clean:", event.wasClean);
      
      if (event.code === 1002 || event.code === 1003 || event.code === 1008) {
        console.error("❌ WebSocket closed due to protocol/authentication error");
        console.error("❌ This usually means the API key is invalid or the auth format is wrong");
        console.error("❌ Check that EXPO_PUBLIC_OPENAI_API_KEY is set correctly");
      } else if (event.code === 1006) {
        console.error("❌ WebSocket closed abnormally (no close frame)");
        console.error("❌ This could be a network issue or server rejection");
        
        setTimeout(() => {
          console.log("🔄 Attempting to reconnect in 3 seconds...");
          if (wsRef.current === null) {
            connectWebSocket();
          }
        }, 3000);
      }
      
      setIsConnected(false);
    };

    wsRef.current = ws;
  };

  const connectWebSocket = useCallback(() => {
    if (Platform.OS === "web") {
      console.error("❌ Realtime voice only funciona en dispositivo físico via Expo Go.");
      return;
    }

    const apiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

    console.log("🔑 API KEY LENGTH:", apiKey?.length || 0);

    if (!apiKey || apiKey === "undefined" || apiKey.length === 0) {
      console.error("❌ API key not loaded");
      console.error("❌ Please set EXPO_PUBLIC_OPENAI_API_KEY in Rork Integrations → Environment Variables");
      throw new Error("API key not loaded");
    }

    console.log("✅ API key loaded");
    console.log("🔌 Connecting to OpenAI Realtime API...");

    const wsUrl = "wss://api.openai.com/v1/realtime?model=gpt-4o-realtime-preview-2024-12-17";
    console.log("🔗 Connecting to:", wsUrl);

    try {
      const ws = new WebSocket(wsUrl, [], {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "OpenAI-Beta": "realtime=v1",
        },
      });

      if (ws.binaryType) {
        ws.binaryType = "arraybuffer";
      }

      setupWebSocket(ws);
    } catch (error) {
      console.error("❌ Error connecting WebSocket:", error);
      console.error("❌ Error details:", JSON.stringify(error, Object.getOwnPropertyNames(error)));
    }
  }, [tutorStyle, tutorLanguage]);

  const requestPermissions = async () => {
    try {
      if (Platform.OS === "web") {
        console.log("🎤 Requesting web microphone access...");
        await navigator.mediaDevices.getUserMedia({ audio: true });
        console.log("✅ Web microphone access granted");
        return true;
      }

      console.log("🎤 Requesting native microphone permissions...");
      const { status, granted } = await Audio.requestPermissionsAsync();
      console.log("📱 Permission status:", status, "granted:", granted);

      if (status !== "granted" && !granted) {
        console.error("❌ Microphone permission denied");
        return false;
      }

      console.log("✅ Microphone permission granted");
      return true;
    } catch (error) {
      console.error("❌ Error requesting permissions:", error);
      return false;
    }
  };

  const startRecording = async () => {
    try {
      console.log("🎤 Starting recording...");

      const hasPermission = await requestPermissions();
      if (!hasPermission) {
        console.error("❌ Cannot start recording: No microphone permission");
        return;
      }

      if (Platform.OS === "web") {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            sampleRate: 24000,
            channelCount: 1,
            echoCancellation: true,
            noiseSuppression: true,
          },
        });

        const mediaRecorder = new MediaRecorder(stream, {
          mimeType: "audio/webm",
        });

        mediaRecorder.ondataavailable = async (event) => {
          if (event.data.size > 0 && wsRef.current?.readyState === WebSocket.OPEN) {
            const arrayBuffer = await event.data.arrayBuffer();
            const base64Audio = btoa(
              String.fromCharCode(...new Uint8Array(arrayBuffer))
            );

            wsRef.current?.send(
              JSON.stringify({
                type: "input_audio_buffer.append",
                audio: base64Audio,
              })
            );
            console.log("🎤 Sent audio chunk to WebSocket, size:", event.data.size);
          }
        };

        mediaRecorder.start(250);
        mediaRecorderRef.current = mediaRecorder;
        console.log("✅ Web recording started");
      } else {
        await Audio.setAudioModeAsync({
          allowsRecordingIOS: true,
          playsInSilentModeIOS: true,
          staysActiveInBackground: true,
          shouldDuckAndroid: false,
          playThroughEarpieceAndroid: false,
        });

        const recording = new Audio.Recording();
        await recording.prepareToRecordAsync({
          android: {
            extension: ".m4a",
            outputFormat: Audio.AndroidOutputFormat.MPEG_4,
            audioEncoder: Audio.AndroidAudioEncoder.AAC,
            sampleRate: 24000,
            numberOfChannels: 1,
            bitRate: 128000,
          },
          ios: {
            extension: ".wav",
            outputFormat: Audio.IOSOutputFormat.LINEARPCM,
            audioQuality: Audio.IOSAudioQuality.HIGH,
            sampleRate: 24000,
            numberOfChannels: 1,
            bitRate: 128000,
            linearPCMBitDepth: 16,
            linearPCMIsBigEndian: false,
            linearPCMIsFloat: false,
          },
          web: {},
        });

        recording.setOnRecordingStatusUpdate((status) => {
          if (status.isRecording) {
            console.log("🎤 Recording... metering:", status.metering);
          }
        });

        recording.setProgressUpdateInterval(250);

        await recording.startAsync();
        recordingRef.current = recording;

        let lastPosition = 0;
        const sendAudioChunks = setInterval(async () => {
          if (
            recordingRef.current &&
            wsRef.current?.readyState === WebSocket.OPEN
          ) {
            try {
              const status = await recordingRef.current.getStatusAsync();
              if (status.isRecording && status.durationMillis > lastPosition + 250) {
                const uri = recording.getURI();
                if (uri) {
                  const response = await fetch(uri);
                  const blob = await response.blob();
                  const arrayBuffer = await blob.arrayBuffer();
                  const base64Audio = btoa(
                    String.fromCharCode(...new Uint8Array(arrayBuffer))
                  );
                  
                  wsRef.current?.send(
                    JSON.stringify({
                      type: "input_audio_buffer.append",
                      audio: base64Audio,
                    })
                  );
                  
                  console.log("🎤 Sent native audio chunk, duration:", status.durationMillis);
                  lastPosition = status.durationMillis;
                }
              }
            } catch (error) {
              console.error("❌ Error sending audio chunk:", error);
            }
          }
        }, 250);

        (recording as any)._audioChunkInterval = sendAudioChunks;

        console.log("✅ Native recording started");
      }
    } catch (error) {
      console.error("❌ Error starting recording:", error);
    }
  };

  const stopRecording = async () => {
    try {
      console.log("⏹️ Stopping recording...");

      if (Platform.OS === "web") {
        if (mediaRecorderRef.current) {
          mediaRecorderRef.current.stop();
          mediaRecorderRef.current.stream
            .getTracks()
            .forEach((track) => track.stop());
          mediaRecorderRef.current = null;
          console.log("✅ Web recording stopped");
        } else {
          console.log("ℹ️ No web recording to stop");
        }
      } else {
        if (recordingRef.current) {
          try {
            const interval = (recordingRef.current as any)._audioChunkInterval;
            if (interval) {
              clearInterval(interval);
            }

            const status = await recordingRef.current.getStatusAsync();
            if (status.canRecord || status.isRecording) {
              await recordingRef.current.stopAndUnloadAsync();
            }
            
            await Audio.setAudioModeAsync({
              allowsRecordingIOS: false,
              playsInSilentModeIOS: true,
              staysActiveInBackground: false,
              shouldDuckAndroid: false,
              playThroughEarpieceAndroid: false,
            });
            recordingRef.current = null;
            console.log("✅ Native recording stopped");
          } catch (recordingError) {
            console.log("ℹ️ Recording already stopped or not started:", recordingError);
            recordingRef.current = null;
          }
        } else {
          console.log("ℹ️ No native recording to stop");
        }
      }
    } catch (error) {
      console.error("❌ Error stopping recording:", error);
    }
  };

  const startCall = useCallback(async () => {
    try {
      console.log("📞 Starting call...");

      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        shouldDuckAndroid: false,
        playThroughEarpieceAndroid: false,
      });

      await playSound(SOUND_URLS.dialTone);

      setTimeout(async () => {
        await playSound(SOUND_URLS.callAnswer);

        setTimeout(async () => {
          connectWebSocket();
          await startRecording();
        }, 500);
      }, 1200);
    } catch (error) {
      console.error("❌ Error starting call:", error);
    }
  }, [connectWebSocket]);

  const endCall = useCallback(async () => {
    try {
      console.log("📞 Ending call...");

      await stopRecording();

      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }

      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }

      if (soundObjectRef.current) {
        try {
          await soundObjectRef.current.unloadAsync();
          soundObjectRef.current = null;
        } catch (e) {
          console.log("Sound already unloaded");
        }
      }

      audioQueueRef.current = [];
      isPlayingRef.current = false;

      setIsConnected(false);
      setIsSpeaking(false);
      setTranscript("");

      console.log("✅ Call ended");
    } catch (error) {
      console.error("❌ Error ending call:", error);
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => {
      const newMuted = !prev;
      console.log(newMuted ? "🔇 Muted" : "🔊 Unmuted");
      return newMuted;
    });
  }, []);

  useEffect(() => {
    return () => {
      endCall();
    };
  }, []);

  return {
    isConnected,
    isSpeaking,
    isMuted,
    transcript,
    startCall,
    endCall,
    toggleMute,
  };
}
