import { NoteResponse } from '../../core/services/api';

/**
 * Utility functions for HomePage component
 */

export interface MeetingDisplayData {
  id: string;
  title: string;
  date: string;
  time: string;
  note: NoteResponse;
  isLoading?: boolean;
  isPending?: boolean;
}

/**
 * Convert NoteResponse to display format for HomePage
 */
export const convertNoteToMeetingDisplay = (note: NoteResponse): MeetingDisplayData => {
  // Prioritize recordingMetadata.duration_seconds, fallback to duration field
  const durationSeconds = note.recordingMetadata?.duration_seconds ?? note.duration;
  
  return {
    id: note._id,
    title: note.title,
    date: new Date(note.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    }),
    time: formatDuration(durationSeconds),
    note: note,
  };
};

/**
 * Format duration from seconds to MM:SS or HH:MM:SS
 */
export const formatDuration = (seconds: number): string => {
  // Round to nearest second for display
  const totalSeconds = Math.round(seconds);
  
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const remainingSeconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  } else {
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
};

/**
 * Get relative time string (e.g., "2 hours ago", "Yesterday")
 */
export const getRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffInMs = now.getTime() - date.getTime();
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
  const diffInDays = Math.floor(diffInHours / 24);

  if (diffInHours < 1) {
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    return diffInMinutes < 1 ? 'Vừa xong' : `${diffInMinutes} phút trước`;
  } else if (diffInHours < 24) {
    return `${diffInHours} giờ trước`;
  } else if (diffInDays === 1) {
    return 'Hôm qua';
  } else if (diffInDays < 7) {
    return `${diffInDays} ngày trước`;
  } else {
    return date.toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  }
};

/**
 * Truncate text to specified length
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

/**
 * Get meeting status based on note data
 */
export const getMeetingStatus = (note: NoteResponse): 'completed' | 'processing' | 'recording' => {
  // If note exists in database, it's completed
  if (note._id) {
    return 'completed';
  }
  
  // You can add more logic here based on your business rules
  // For example, check if transcription is complete, etc.
  return 'completed';
};

/**
 * Get meeting priority based on date and content
 */
export const getMeetingPriority = (note: NoteResponse): 'high' | 'medium' | 'low' => {
  const meetingDate = new Date(note.meetingTime);
  const now = new Date();
  const diffInDays = Math.floor((now.getTime() - meetingDate.getTime()) / (1000 * 60 * 60 * 24));
  
  // Recent meetings (within 3 days) are high priority
  if (diffInDays <= 3) {
    return 'high';
  }
  
  // Meetings within a week are medium priority
  if (diffInDays <= 7) {
    return 'medium';
  }
  
  // Older meetings are low priority
  return 'low';
};

/**
 * Create a pending/loading meeting item
 */
export const createPendingMeeting = (tempId: string): MeetingDisplayData => {
  const now = new Date();
  return {
    id: tempId,
    title: 'Đang xử lý...',
    date: now.toLocaleDateString('en-US', {
      month: 'short',
      day: '2-digit',
      year: 'numeric'
    }),
    time: '0:00',
    isLoading: true,
    isPending: true,
    note: {
      _id: tempId,
      title: 'Đang xử lý...',
      meetingTime: now.toISOString(),
      duration: 0,
      transcription: '',
      recordings: [],
      isDeleted: false,
      createdBy: '',
      updatedBy: '',
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    } as NoteResponse,
  };
};
