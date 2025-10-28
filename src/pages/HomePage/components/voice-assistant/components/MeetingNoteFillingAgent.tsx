import React, {
  useState,
  useRef,
  useImperativeHandle,
  forwardRef,
} from "react";
import {
  IDynamicToolSchema,
  VoiceAssistantConfig,
  ConnectionStatus,
  MeetingNoteData,
} from "../types";
import VoiceAssistant from "./VoiceAssistant";
import { MEETING_ASSISTANT_PROMPT } from "../utils/prompts";
import { useNotes } from "../../../../../core";
import { TranscriptionEntry, CreateNoteDto, NoteResponse } from "../../../../../core/services/api";

export interface MeetingNoteFillingAgentHandle {
  saveNote: () => Promise<void>;
  disconnect?: () => void;
}

interface MeetingNoteFillingAgentProps {
  onUpdateNotes: (data: MeetingNoteData) => void;
  onStatusChange?: (status: ConnectionStatus) => void;
  createPendingNote?: (dto: CreateNoteDto) => Promise<NoteResponse>;
}

const updateMeetingSchema: IDynamicToolSchema = {
  type: "object",
  properties: {
    attendees: { type: "array", items: { type: "string" } },
    meetingTitle: { type: "string" },
    meetingNotes: { type: "string" },
    actionItems: { type: "array", items: { type: "string" } },
  },
  required: ["attendees", "meetingTitle", "meetingNotes", "actionItems"],
};

const MeetingNoteFillingAgent = forwardRef<
  MeetingNoteFillingAgentHandle,
  MeetingNoteFillingAgentProps
>(({ onUpdateNotes, onStatusChange, createPendingNote }, ref) => {
  const [transcriptionBuffer, setTranscriptionBuffer] = useState<
    TranscriptionEntry[]
  >([]);
  const sessionStartTime = useRef<number>(0);
  const [capturedMeetingData, setCapturedMeetingData] = useState<Record<string, unknown>>({});
  const { createNote: createNoteFromHook } = useNotes();

  const handleStatusChange = (status: ConnectionStatus) => {
    if (status.isRecording && sessionStartTime.current === 0) {
      sessionStartTime.current = Date.now();
      setTranscriptionBuffer([]);
      setCapturedMeetingData({});
    }
    onStatusChange?.(status);
  };

  const handleUpdateMeetingNotes = (data: MeetingNoteData) => {
    setCapturedMeetingData((prev: Record<string, unknown>) => ({ ...prev, ...data }));
    onUpdateNotes(data);
  };

  const handleSaveMeetingNote = async () => {
    if (!sessionStartTime.current) return;

    const noteDto = {
      title:
        (capturedMeetingData.meetingTitle as string) ||
        `Meeting ${new Date().toLocaleDateString()}`,
      content: (capturedMeetingData.meetingNotes as string) || "",
      meetingTime: new Date(sessionStartTime.current),
      duration: Math.floor((Date.now() - sessionStartTime.current) / 1000),
      transcription: transcriptionBuffer,
      summary: {
        attendees: (capturedMeetingData.attendees as string[]) || [],
        actionItems: (capturedMeetingData.actionItems as string[]) || [],
        notes: (capturedMeetingData.meetingNotes as string) || "",
      },
      recordings: [],
    };

    // Use the passed-in function if available, otherwise use the local hook
    const saveFunction = createPendingNote || createNoteFromHook;
    await saveFunction(noteDto);
    sessionStartTime.current = 0;
    setTranscriptionBuffer([]);
    setCapturedMeetingData({});
  };

  useImperativeHandle(ref, () => ({
    saveNote: handleSaveMeetingNote,
    disconnect: () => {
      // Disconnect handled by VoiceAssistant
    },
  }));

  const config: VoiceAssistantConfig = {
    instructions: MEETING_ASSISTANT_PROMPT,
    eventHandlers: {
      writing: (data: unknown) => {
        const writingData = data as { role: string; text: string };
        const entry: TranscriptionEntry = {
          role: writingData.role as "user" | "assistant",
          text: writingData.text,
          timestamp: Date.now() - sessionStartTime.current,
        };
        setTranscriptionBuffer((prev) => [...prev, entry]);
      },
    },
    wsEventHandlers: {
      update_meetting_notes: {
        schema: updateMeetingSchema,
        toolDescription: "Update meeting notes in real-time.",
        handler: (data: Record<string, unknown>) => {
          handleUpdateMeetingNotes(data as unknown as MeetingNoteData);
        },
      },
    },
    metadata: {},
  };

  return (
    <VoiceAssistant
      token="123"
      config={config}
      onStatusChange={handleStatusChange}
    />
  );
});

MeetingNoteFillingAgent.displayName = "MeetingNoteFillingAgent";
export default MeetingNoteFillingAgent;
