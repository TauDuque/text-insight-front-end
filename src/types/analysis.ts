export interface AnalysisResult {
  basic: {
    characterCount: number;
    characterCountNoSpaces: number;
    wordCount: number;
    sentenceCount: number;
    paragraphCount: number;
    averageWordsPerSentence: number;
    averageCharactersPerWord: number;
  };
  linguistic: {
    sentiment: {
      score: number;
      comparative: number;
      classification: "positive" | "negative" | "neutral";
      positive: string[];
      negative: string[];
    };
    readability: {
      fleschKincaidGrade: number;
      fleschReadingEase: number;
      difficulty:
        | "very easy"
        | "easy"
        | "fairly easy"
        | "standard"
        | "fairly difficult"
        | "difficult"
        | "very difficult";
    };
    keywords: string[];
    entities: {
      people: string[];
      places: string[];
      organizations: string[];
    };
  };
  advanced: {
    languageDetection: string;
    textComplexity: number;
    uniqueWords: number;
    lexicalDiversity: number;
    mostFrequentWords: Array<{ word: string; count: number }>;
  };
}

// ✅ NOVO: Resposta da fila (sempre retornada primeiro)
export interface QueueResponse {
  queueId: string;
  message: string;
  estimatedTime: number;
  textSize: number;
}

export interface Analysis {
  id: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED";
  results?: AnalysisResult;
  error?: string;
  createdAt: string;
  completedAt?: string;
  processingTime?: number;
  jobId?: string;
  progress?: number;
  estimatedTime?: string;
  message?: string;
  text?: string;
  queuePosition?: number;
}

export interface AnalysisHistory {
  id: string;
  status: string;
  createdAt: string;
  completedAt?: string;
  processingTime?: number;
  textPreview: string;
  error?: string;
}
