export type TutorVoice = "female" | "male";
export type TutorStyle = "strict" | "friendly" | "coach";
export type TutorLanguage = "english" | "spanish" | "mixed";

export interface Tutor {
  id: string;
  name: string;
  voice: TutorVoice;
  description: string;
}

export const TUTORS: Tutor[] = [
  {
    id: "maya",
    name: "Maya",
    voice: "female",
    description: "Tutora profesional de inglés",
  },
  {
    id: "miles",
    name: "Miles",
    voice: "male",
    description: "Coach de idiomas experimentado",
  },
];

export const TUTOR_STYLES = [
  { id: "strict" as const, label: "Maestro Estricto", description: "Enfocado en correcciones" },
  { id: "friendly" as const, label: "Maestro Amigable", description: "Alentador y paciente" },
  { id: "coach" as const, label: "Coach Bilingüe", description: "Flexible y adaptable" },
];

export const TUTOR_LANGUAGES = [
  { id: "english" as const, label: "Inglés", description: "Solo inglés" },
  { id: "spanish" as const, label: "Español", description: "Solo español" },
  { id: "mixed" as const, label: "Mixto", description: "Detecta tu idioma" },
];
