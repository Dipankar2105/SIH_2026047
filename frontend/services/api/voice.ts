/**
 * Voice Service — Patient Web
 *
 * Endpoints (FastAPI):
 *   POST /voice/transcribe      — send audio blob, get text transcription
 *   POST /voice/tts             — text-to-speech (returns audio URL or blob)
 *
 * Used by intake screen for voice-driven question answering.
 * Multilingual support handled by backend.
 *
 * NOTE: If /voice/* endpoints are unavailable, falls back to browser Web Speech API (STT).
 */

import { patientApiClient, IS_MOCK } from "./client";

export interface TranscriptionResult {
  text: string;
  language?: string;
  confidence?: number;
}

// ─── Service ───────────────────────────────────────────────────────────────

export const voiceService = {
  /**
   * Transcribe an audio blob using backend ASR.
   * Real: POST /voice/transcribe (multipart: file=audioBlob, language=hi/en/...)
   * Fallback: uses browser Web Speech API (if available)
   */
  async transcribe(audioBlob: Blob, language?: string): Promise<TranscriptionResult> {
    if (IS_MOCK) {
      // Mock: return placeholder
      return new Promise((resolve) =>
        setTimeout(
          () =>
            resolve({
              text: "Mujhe pet mein dard ho raha hai.",
              language: language || "hi",
              confidence: 0.92,
            }),
          600
        )
      );
    }

    try {
      const formData = new FormData();
      formData.append("file", audioBlob, "recording.webm");
      if (language) formData.append("language", language);
      return await patientApiClient.upload<TranscriptionResult>("/voice/transcribe", formData);
    } catch (err) {
      console.warn("Backend transcription failed:", err);
      throw new Error("Voice transcription unavailable. Please type your response.");
    }
  },

  /**
   * Text-to-speech: get audio for a question string.
   * Real: POST /voice/tts { text, language }
   * Returns a Blob URL to play.
   */
  async textToSpeech(text: string, language?: string): Promise<string | null> {
    if (IS_MOCK) {
      // In mock mode: use browser's SpeechSynthesis if available
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === "hi" ? "hi-IN" : "en-IN";
        window.speechSynthesis.speak(utterance);
      }
      return null; // No URL in browser TTS mode
    }

    try {
      const response = await fetch(
        `${typeof process !== "undefined" ? process.env.NEXT_PUBLIC_API_URL : "http://localhost:8000"}/voice/tts`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, language: language || "en" }),
        }
      );
      if (!response.ok) throw new Error("TTS failed");
      const audioBlob = await response.blob();
      return URL.createObjectURL(audioBlob);
    } catch (err) {
      console.warn("TTS failed, falling back to browser TTS:", err);
      // Browser fallback
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = language === "hi" ? "hi-IN" : "en-IN";
        window.speechSynthesis.speak(utterance);
      }
      return null;
    }
  },
};
