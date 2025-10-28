// Re-export Note type as NoteResponse for backwards compatibility
export type { Note as NoteResponse } from '../hooks/useNotes';

// Define TranscriptionEntry interface
export interface TranscriptionEntry {
  role: string;
  text: string;
  timestamp: number;
  diarization?: {
    speaker: string;
  };
}
