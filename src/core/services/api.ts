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

// Define CreateNoteDto interface
export interface CreateNoteDto {
  title: string;
  content?: string;
  meetingTime: string;
  duration: number;
  transcription: string;
  recordings: string[];
  summary?: {
    attendees: string[];
    actionItems: string[];
    notes: string;
    decisions?: string[];
  };
}

// Define noteApi object
export const noteApi = {
  createNote: async (noteData: CreateNoteDto) => {
    // This would typically make an API call
    // For now, return a mock response
    return Promise.resolve({
      _id: 'mock-id',
      ...noteData,
      isDeleted: false,
      createdBy: 'user',
      updatedBy: 'user',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  },
  search: async (query: string) => {
    // Mock search implementation
    return Promise.resolve([]);
  },
  findAll: async (includeDeleted: boolean = false) => {
    // Mock findAll implementation
    return Promise.resolve([]);
  }
};
