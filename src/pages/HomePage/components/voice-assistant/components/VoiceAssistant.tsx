import React, { useEffect } from "react";
import { useVoiceAssistant } from "../hooks/useVoiceAssistant";
import { VoiceAssistantProps } from "../types";
import clsx from "clsx";

const VoiceAssistant: React.FC<VoiceAssistantProps> = ({
  token,
  apiUrl,
  config,
  onStatusChange,
}) => {
  const { status, startSession, disconnect } = useVoiceAssistant({
    token,
    apiUrl,
    config,
  });

  // Notify parent of status changes
  useEffect(() => {
    onStatusChange?.(status);
  }, [status, onStatusChange]);

  // Auto-start voice session when connected
  useEffect(() => {
    if (status.isConnected && !status.sessionActive && !status.isConnecting) {
      startSession();
    }
  }, [
    status.isConnected,
    status.sessionActive,
    status.isConnecting,
    startSession,
  ]);

  const getIndicator = () => {
    if (status.isRecording) {
      return (
        <>
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-white">Recording</span>
        </>
      );
    }
    if (status.isConnecting) {
      return (
        <>
          <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse" />
          <span className="text-sm font-medium text-white">Connecting…</span>
        </>
      );
    }
    // if (status.isConnected) {
    //   return (
    //     <>
    //       <div className="w-3 h-3 rounded-full bg-green-500" />
    //       <span className="text-sm font-medium text-white">Ready</span>
    //     </>
    //   );
    // }
    return (
      <>
        <div className="w-3 h-3 rounded-full bg-red-500" />
        <span className="text-sm font-medium text-white">Disconnected</span>
      </>
    );
  };

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 px-4 h-10 bg-black/80 rounded-full shadow-2xl backdrop-blur">
        {getIndicator()}
        {/* Disconnect control */}
        {/* {(status.isConnected || status.isConnecting || status.isRecording) && (
          <button
            onClick={disconnect}
            className="ml-2 p-1 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            aria-label="Disconnect"
          >
            <div className="w-3 h-3 rounded-full bg-white" />
          </button>
        )} */}
      </div>
    </div>
  );
};

export default VoiceAssistant;
