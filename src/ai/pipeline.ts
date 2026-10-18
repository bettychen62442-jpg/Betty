import { getAIProvider } from "./provider-registry";
import { TranscriptionResult, ExtractedQuestion } from "./types";

export interface AudioProcessingResult {
  transcript: TranscriptionResult;
  questions: ExtractedQuestion[];
}

/**
 * Full audio processing pipeline:
 * 1. Transcribe audio to text
 * 2. Extract interview questions from transcript
 */
export async function processAudio(audioBuffer: Buffer): Promise<AudioProcessingResult> {
  const provider = getAIProvider();

  if (!provider.transcription) {
    throw new Error("No transcription provider configured");
  }
  if (!provider.questionExtraction) {
    throw new Error("No question extraction provider configured");
  }

  // Step 1: Transcribe
  const { result: transcript } = await provider.transcription.transcribe(audioBuffer);

  // Step 2: Extract questions
  const { questions } = await provider.questionExtraction.extractQuestions(transcript);

  return { transcript, questions };
}

/**
 * Transcribe audio only
 */
export async function transcribeAudio(audioBuffer: Buffer): Promise<TranscriptionResult> {
  const provider = getAIProvider();
  if (!provider.transcription) {
    throw new Error("No transcription provider configured");
  }
  const { result } = await provider.transcription.transcribe(audioBuffer);
  return result;
}

/**
 * Extract questions from transcript only
 */
export async function extractQuestions(
  transcript: TranscriptionResult
): Promise<ExtractedQuestion[]> {
  const provider = getAIProvider();
  if (!provider.questionExtraction) {
    throw new Error("No question extraction provider configured");
  }
  const { questions } = await provider.questionExtraction.extractQuestions(transcript);
  return questions;
}
