/**
 * useVoice — Patient Web
 * React hook for voice input/output in the intake flow.
 */
import { useState, useCallback, useRef } from "react";
import { voiceService } from "../services/api/voice";

export interface VoiceState {
  isRecording: boolean;
  isTranscribing: boolean;
  transcription: string;
  error: string | null;
}

export function useVoice(language?: string) {
  const [state, setState] = useState<VoiceState>({
    isRecording: false,
    isTranscribing: false,
    transcription: "",
    error: null,
  });

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    setState((s) => ({ ...s, error: null, transcription: "" }));
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.start();
      setState((s) => ({ ...s, isRecording: true }));
    } catch (err) {
      setState((s) => ({
        ...s,
        error: err instanceof Error ? err.message : "Microphone access denied",
      }));
    }
  }, []);

  const stopRecording = useCallback(async () => {
    return new Promise<string>((resolve, reject) => {
      const recorder = mediaRecorderRef.current;
      if (!recorder) {
        reject(new Error("No active recording"));
        return;
      }

      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        // Stop all tracks
        recorder.stream.getTracks().forEach((t) => t.stop());
        setState((s) => ({ ...s, isRecording: false, isTranscribing: true }));

        try {
          const result = await voiceService.transcribe(blob, language);
          setState((s) => ({ ...s, isTranscribing: false, transcription: result.text }));
          resolve(result.text);
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Transcription failed";
          setState((s) => ({ ...s, isTranscribing: false, error: msg }));
          reject(new Error(msg));
        }
      };

      recorder.stop();
    });
  }, [language]);

  const speak = useCallback(
    async (text: string) => {
      try {
        await voiceService.textToSpeech(text, language);
      } catch (err) {
        console.warn("TTS failed:", err);
      }
    },
    [language]
  );

  const clearTranscription = useCallback(() => {
    setState((s) => ({ ...s, transcription: "", error: null }));
  }, []);

  return {
    ...state,
    startRecording,
    stopRecording,
    speak,
    clearTranscription,
  };
}
