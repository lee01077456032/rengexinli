export interface MBTIPersonality {
  id: string;
  name: string;
  code: string;
  category: "Analysts" | "Diplomats" | "Sentinels" | "Explorers";
  categoryName: string;
  avatar: string;
  summary: string;
  traits: string[];
  strengths: string[];
  weaknesses: string[];
  growthAdvice: string[];
  careerSuggestions: string[];
}

export interface EnneagramPersonality {
  id: number;
  name: string;
  englishName: string;
  group: "Instinctive" | "Feeling" | "Thinking";
  groupName: string;
  summary: string;
  scaredOf: string;
  desires: string;
  strengths: string[];
  weaknesses: string[];
  growthAdvice: string[];
}

export interface BigFiveTrait {
  id: string;
  name: string;
  englishName: string;
  description: string;
  highTraits: string;
  lowTraits: string;
}

export interface ChatMessage {
  role: "user" | "model";
  content: string;
  timestamp: string;
}

export interface QuizQuestion {
  id: number;
  text: string;
  options: {
    label: string;
    value: number; // For Big Five points or dimensions
    dimension?: string;
  }[];
  dimension?: string;
}
