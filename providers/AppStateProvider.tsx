import AsyncStorage from "@react-native-async-storage/async-storage";
import createContextHook from "@nkzw/create-context-hook";
import { useCallback, useEffect, useMemo, useState } from "react";
import { TutorLanguage, TutorStyle, TutorVoice } from "@/constants/tutors";

interface AppState {
  userName: string;
  selectedVoice: TutorVoice;
  selectedStyle: TutorStyle;
  selectedLanguage: TutorLanguage;
  selectedTutorId: string | null;
  minutesUsedThisMonth: number;
  streakDays: number;
  lastUsedDate: string | null;
  hasCompletedOnboarding: boolean;
}

const DEFAULT_STATE: AppState = {
  userName: "Eduardo",
  selectedVoice: "female",
  selectedStyle: "friendly",
  selectedLanguage: "mixed",
  selectedTutorId: null,
  minutesUsedThisMonth: 0,
  streakDays: 0,
  lastUsedDate: null,
  hasCompletedOnboarding: false,
};

const STORAGE_KEY = "english-tutor-app-state";

export const [AppStateProvider, useAppState] = createContextHook(() => {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);

  useEffect(() => {
    loadState();
  }, []);

  const loadState = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as AppState;
        setState(parsed);
      }
    } catch (error) {
      console.error("Failed to load app state:", error);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveState = async (newState: AppState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newState));
      setState(newState);
    } catch (error) {
      console.error("Failed to save app state:", error);
    }
  };

  const updateVoice = useCallback((voice: TutorVoice) => {
    saveState({ ...state, selectedVoice: voice });
  }, [state]);

  const updateStyle = useCallback((style: TutorStyle) => {
    saveState({ ...state, selectedStyle: style });
  }, [state]);

  const updateLanguage = useCallback((language: TutorLanguage) => {
    saveState({ ...state, selectedLanguage: language });
  }, [state]);

  const updateTutorId = useCallback((tutorId: string) => {
    saveState({ ...state, selectedTutorId: tutorId });
  }, [state]);

  const completeOnboarding = useCallback(() => {
    saveState({ ...state, hasCompletedOnboarding: true });
  }, [state]);

  const addMinutes = useCallback((minutes: number) => {
    const newMinutes = state.minutesUsedThisMonth + minutes;
    
    const today = new Date().toISOString().split("T")[0];
    let newStreak = state.streakDays;
    
    if (state.lastUsedDate) {
      const lastDate = new Date(state.lastUsedDate);
      const todayDate = new Date(today);
      const daysDiff = Math.floor((todayDate.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff === 1) {
        newStreak = state.streakDays + 1;
      } else if (daysDiff > 1) {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }
    
    saveState({
      ...state,
      minutesUsedThisMonth: newMinutes,
      streakDays: newStreak,
      lastUsedDate: today,
    });
  }, [state]);

  const resetMinutes = useCallback(() => {
    saveState({ ...state, minutesUsedThisMonth: 0 });
  }, [state]);

  return useMemo(() => ({
    ...state,
    isLoaded,
    updateVoice,
    updateStyle,
    updateLanguage,
    updateTutorId,
    completeOnboarding,
    addMinutes,
    resetMinutes,
  }), [state, isLoaded, updateVoice, updateStyle, updateLanguage, updateTutorId, completeOnboarding, addMinutes, resetMinutes]);
});
