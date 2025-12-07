export interface Resource {
  title: string;
  url: string;
  summary: string;
  relevance: number;
}

export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  ease: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface StudyTopic {
  id: string;
  title: string;
  description: string;
  resources: Resource[];
  flashcards: Flashcard[];
  quiz: QuizQuestion[];
  prerequisites: string;
  keyConcepts: string;
  practiceIdeas: string;
  isLoaded: boolean;
}

export interface StudySession {
  id: string;
  userId: string;
  topic: string;
  createdAt: number;
  plan: StudyTopic[];
}