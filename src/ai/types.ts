// ── Core Types ──────────────────────────────────────

export interface TranscriptionSegment {
  start: number; // seconds
  end: number; // seconds
  text: string;
}

export interface TranscriptionResult {
  fullText: string;
  segments: TranscriptionSegment[];
  language: string;
}

export interface ExtractedQuestion {
  questionText: string;
  answerText: string | null;
  context: string; // surrounding transcript snippet
  suggestedCategory: string | null;
  suggestedTags: string[];
  suggestedDifficulty: number | null;
  confidence: number; // 0-1
}

export interface AIProviderMetadata {
  providerName: string;
  modelName: string;
  tokensUsed?: number;
  cost?: number; // estimated USD
  latencyMs: number;
}

// ── Provider Interfaces ─────────────────────────────

export interface TranscriptionProvider {
  readonly name: string;
  transcribe(
    audioBuffer: Buffer,
    options?: { language?: string; prompt?: string }
  ): Promise<{ result: TranscriptionResult; metadata: AIProviderMetadata }>;
}

export interface QuestionExtractionProvider {
  readonly name: string;
  extractQuestions(
    transcript: TranscriptionResult,
    options?: { maxQuestions?: number }
  ): Promise<{ questions: ExtractedQuestion[]; metadata: AIProviderMetadata }>;
}

export interface AnswerEvaluationProvider {
  readonly name: string;
  evaluate(
    question: string,
    idealAnswer: string,
    userAnswer: string
  ): Promise<{
    score: number; // 0-100
    feedback: string;
    gapAreas: string[];
    metadata: AIProviderMetadata;
  }>;
}

// ── Union Provider ──────────────────────────────────

export interface AIProvider {
  transcription?: TranscriptionProvider;
  questionExtraction?: QuestionExtractionProvider;
  answerEvaluation?: AnswerEvaluationProvider;
}
