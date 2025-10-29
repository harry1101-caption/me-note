import { useState, useCallback } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;
const TOKEN_KEY = 'anonymous-token';

// Get or create anonymous token
const getAnonymousToken = (): string => {
  let token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    token = uuidv4();
    localStorage.setItem(TOKEN_KEY, token);
  }
  return token;
};

export interface Note {
  _id: string;
  title: string;
  content?: string;
  draftContent?: string;
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
  aiSummary?: {
    summary: {
      title: string;
      attendees: string[];
      actionItems: string[];
      notes: string;
    };
  };
  recordingMetadata?: {
    filename: string;
    duration_seconds: number;
    processing_time_seconds: number;
    decoding_method: string;
    model: string;
    rtf: number;
    sample_rate: number;
    total_time_seconds: number;
    fileUuid: string;
  };
  isDeleted: boolean;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
  jsonData?: Record<string, unknown>;
  summarizedContent?: string;
}

interface UseNotesReturn {
  data: Note[] | null;
  loading: boolean;
  error: string | null;
  fetchNotes: () => Promise<void>;
  searchNotes: (query: string, options?: { limit?: number }) => Promise<void>;
  fetchNoteById: (id: string) => Promise<Note | null>;
  deleteNote: (id: string, title: string, summarizedContent: string) => Promise<void>;
  addNote: (note: Note) => void;
  createNote: (noteData: Omit<Note, '_id' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt' | 'isDeleted'>) => Promise<Note>;
}

export const useNotes = (): UseNotesReturn => {
  const [data, setData] = useState<Note[] | null>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNotes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getAnonymousToken();
      const response = await axios.get(`${API_BASE_URL}/notes`, {
        headers: {
          'anonymous-token': token,
        },
      });
      
      // Ensure the data is an array
      const responseData = response.data;
      if (Array.isArray(responseData)) {
        setData(responseData);
      } else {
        console.warn('API response is not an array:', responseData);
        setData([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notes');
      console.error('Error fetching notes:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const searchNotes = useCallback(async (query: string, options?: { limit?: number }) => {
    setLoading(true);
    setError(null);
    try {
      const token = getAnonymousToken();
      const response = await axios.get(`${API_BASE_URL}/notes`, {
        headers: {
          'anonymous-token': token,
        },
        params: {
          search: query,
          limit: options?.limit,
        },
      });
      
      // Ensure the data is an array
      const responseData = response.data;
      if (Array.isArray(responseData)) {
        setData(responseData);
      } else {
        console.warn('API response is not an array:', responseData);
        setData([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search notes');
      console.error('Error searching notes:', err);
      setData([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchNoteById = useCallback(async (id: string): Promise<Note | null> => {
    try {
      const token = getAnonymousToken();
      const response = await axios.get(`${API_BASE_URL}/note`, {
        headers: {
          'anonymous-token': token,
        },
        params: {
          id: id,
        },
      });
      
      return response.data;
    } catch (err) {
      console.error('Error fetching note by ID:', err);
      throw err;
    }
  }, []);

  const deleteNote = useCallback(async (id: string, title: string, summarizedContent: string): Promise<void> => {
    try {
      const token = getAnonymousToken();
      await axios.delete(`${API_BASE_URL}/note`, {
        headers: {
          'anonymous-token': token,
          'Content-Type': 'application/json',
        },
        params: {
          id: id,
        },
        data: {
          title,
          summarizedContent,
        },
      });
      
      // Update local state by removing the deleted note
      setData((prevData) => {
        if (Array.isArray(prevData)) {
          return prevData.filter(note => note._id !== id);
        }
        return prevData;
      });
    } catch (err) {
      console.error('Error deleting note:', err);
      throw err;
    }
  }, []);

  const addNote = useCallback((note: Note) => {
    // Add new note to the beginning of the list
    setData((prevData) => {
      if (Array.isArray(prevData)) {
        return [note, ...prevData];
      }
      return [note];
    });
  }, []);

  const createNote = useCallback(async (noteData: Omit<Note, '_id' | 'createdBy' | 'updatedBy' | 'createdAt' | 'updatedAt' | 'isDeleted'>): Promise<Note> => {
    try {
      const token = getAnonymousToken();
      const newNote: Note = {
        ...noteData,
        _id: uuidv4(),
        isDeleted: false,
        createdBy: token,
        updatedBy: token,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      
      // Add to local state
      addNote(newNote);
      
      return newNote;
    } catch (err) {
      console.error('Error creating note:', err);
      throw err;
    }
  }, [addNote]);

  return {
    data,
    loading,
    error,
    fetchNotes,
    searchNotes,
    fetchNoteById,
    deleteNote,
    addNote,
    createNote,
  };
};

