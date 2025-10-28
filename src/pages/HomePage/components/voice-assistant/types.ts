// Core types for VoiceAssistant

export enum VoiceToolType {
  UPDATE_FORM = "update_form",
  // Add more tools as needed
}

export interface IDynamicToolSchemaProperty {
  type: "string" | "number" | "boolean" | "object" | "array";
  description?: string;
  properties?: Record<string, IDynamicToolSchemaProperty>;
  items?: IDynamicToolSchemaProperty;
  required?: string[];
}

export interface IDynamicToolSchema {
  type: "object";
  properties: Record<string, IDynamicToolSchemaProperty>;
  required?: string[];
}

// Pre-defined types for common use cases
export type FormUpdateData = {
  formId: string;
  fieldUpdates: Array<{
    attributeId: string;
    value: string;
  }>;
};

export interface VoiceAssistantConfig {
  instructions?: string; // Complete prompt/instructions
  eventHandlers?: {
    [eventName: string]: (data: unknown) => void; // Event handlers
  };
  wsEventHandlers?: {
    [eventName: string]: {
      schema: IDynamicToolSchema;
      toolDescription: string;
      handler: (data: Record<string, unknown>) => void; // Frontend handler function
    };
  };
  metadata?: Record<string, unknown>; // Additional metadata
}

export interface VoiceAssistantProps {
  token: string; // Required: Authentication token
  apiUrl?: string; // Optional: API URL
  enableVoiceResponse?: boolean;
  // onToolCall?: (toolName: string, params: any) => void;
  // onToolEnd
  // onMessage
  config: VoiceAssistantConfig;
  onStatusChange?: (status: ConnectionStatus) => void; // Optional: Status change callback
}

export interface ConnectionStatus {
  isConnected: boolean;
  isConnecting: boolean;
  isRecording: boolean;
  sessionActive: boolean;
  error?: string;
}

export interface UseVoiceAssistantOptions {
  token: string;
  apiUrl?: string;
  config: VoiceAssistantConfig;
}

export interface UseVoiceAssistantReturn {
  status: ConnectionStatus;
  connect: () => Promise<void>;
  disconnect: () => void;
  startSession: () => Promise<void>;
  stopSession: () => void;
  toggleRecording: () => Promise<void>;
  startRecording: () => Promise<void>;
}
export interface WSEventData { data: MeetingNoteData; eventName: string; sessionId: string; timestamp: string; } 
export interface MeetingNoteData { attendees: string[]; meetingTitle: string; meetingNotes: string; actionItems: string[]; }