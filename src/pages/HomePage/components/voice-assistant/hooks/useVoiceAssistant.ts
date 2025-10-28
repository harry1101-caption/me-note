/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef, useEffect, useCallback } from "react";
import { io, Socket } from "socket.io-client";
import {
  ConnectionStatus,
  UseVoiceAssistantOptions,
  UseVoiceAssistantReturn,
  VoiceAssistantConfig,
} from "../types";
import {
  SAMPLE_RATE,
  CHANNELS,
  f32ToPcm16,
  pcm16ToF32,
  createAudioProcessorBlobUrl,
} from "../utils/audioUtils";

export const useVoiceAssistant = ({
  token,
  apiUrl,
  config,
}: UseVoiceAssistantOptions): UseVoiceAssistantReturn => {
  // State
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isConnecting: false,
    isRecording: false,
    sessionActive: false,
  });

  // Refs
  const socketRef = useRef<Socket | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const audioSourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const actualSampleRateRef = useRef<number>(SAMPLE_RATE);
  const silentGainNodeRef = useRef<GainNode | null>(null);

  // Get API URL
  const baseUrl =
    apiUrl || import.meta.env.VITE_API_URL || "http://localhost:3001";

  // Initialize connection on mount
  useEffect(() => {
    connect();
    return () => {
      disconnect();
    };
  }, [ config.instructions]); // Re-connect if  or instructions change

  const connect = useCallback(async () => {
    if (!token) {
      setStatus((prev) => ({
        ...prev,
        error: "Authentication token required",
      }));
      return;
    }

    setStatus((prev) => ({ ...prev, isConnecting: true, error: undefined }));

    try {
      // Create socket connection
      const socket = io(`${baseUrl}/voice`, {
        transports: ["websocket"],
        auth: { token: token },
        extraHeaders: { "x-token": token },
        
      });

      socketRef.current = socket;

      // Set up event listeners
      socket.on("connected", (data) => {
        console.log("Voice connection established:", data);
        setStatus((prev) => ({
          ...prev,
          isConnected: true,
          isConnecting: false,
          error: undefined,
        }));
      });

      socket.on("session.started", (data) => {
        console.log("Voice session started:", data);
        setStatus((prev) => ({ ...prev, sessionActive: true }));
      });

      socket.on("session.stopped", () => {
        console.log("Voice session stopped");
        setStatus((prev) => ({
          ...prev,
          sessionActive: false,
          isRecording: false,
        }));
      });

      socket.on("speaker", (audioData: any) => {
        console.log("Received audio data:", typeof audioData, audioData);

        let arrayBuffer: ArrayBuffer;

        if (audioData instanceof ArrayBuffer) {
          arrayBuffer = audioData;
        } else if (audioData instanceof Buffer) {
          arrayBuffer = audioData.buffer.slice(
            audioData.byteOffset,
            audioData.byteOffset + audioData.byteLength
          ) as ArrayBuffer;
        } else if (audioData instanceof Uint8Array) {
          arrayBuffer = audioData.buffer.slice(
            audioData.byteOffset,
            audioData.byteOffset + audioData.byteLength
          ) as ArrayBuffer;
        } else if (
          audioData &&
          typeof audioData === "object" &&
          audioData.data
        ) {
          const wrappedData = audioData.data;
          if (wrappedData instanceof ArrayBuffer) {
            arrayBuffer = wrappedData;
          } else if (wrappedData instanceof Buffer) {
            arrayBuffer = wrappedData.buffer.slice(
              wrappedData.byteOffset,
              wrappedData.byteOffset + wrappedData.byteLength
            ) as ArrayBuffer;
          } else {
            console.error(
              "Unsupported wrapped audio data type:",
              typeof wrappedData
            );
            return;
          }
        } else {
          console.error("Unsupported audio data type:", typeof audioData);
          return;
        }

        playAudio(arrayBuffer);
      });

      socket.on("speaker.end", () => {
        console.log("AI finished speaking");
      });

      socket.on("writing", (data) => {
        if (config.eventHandlers?.["writing"]) {
          config.eventHandlers["writing"](data);
        }
      });

      // Set up dynamic WebSocket event handlers
      if (config.wsEventHandlers) {
        Object.entries(config.wsEventHandlers).forEach(
          ([eventName, config]) => {
            socket.on(eventName, config.handler);
          }
        );
      }

      socket.on("error", (error: any) => {
        const IGNORED_ERRORS = ["conversation_already_has_active_response"];
        if (!IGNORED_ERRORS.includes(error?.error?.code)) {
          console.error("Voice session error:", error);
          setStatus((prev) => ({
            ...prev,
            error: error.message || "Voice session error",
            isConnecting: false,
          }));

          // Call custom error handler if provided
          if (config.eventHandlers?.["error"]) {
            config.eventHandlers["error"](error);
          }
        }
      });

      socket.on("disconnect", () => {
        console.log("Voice connection disconnected");
        setStatus((prev) => ({
          ...prev,
          isConnected: false,
          sessionActive: false,
          isRecording: false,
        }));
      });
    } catch (error: any) {
      console.error("Failed to connect to voice service:", error);
      setStatus((prev) => ({
        ...prev,
        error: error.message || "Connection failed",
        isConnecting: false,
      }));
    }
  }, [token, baseUrl, config]);

  const disconnect = useCallback(() => {
    stopRecording();

    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }

    setStatus((prev) => ({
      ...prev,
      isConnected: false,
      sessionActive: false,
      isRecording: false,
    }));
  }, []);

  const startSession = useCallback(async () => {
    if (!socketRef.current?.connected) {
      setStatus((prev) => ({
        ...prev,
        error: "Not connected to voice service",
      }));
      return;
    }

    try {
      await ensureAudio();

      // Send start message with config
      socketRef.current.emit("start", {
        type: "start",
        config: {
          instructions: config.instructions,
          wsEventHandlers: config.wsEventHandlers,
          metadata: {
            ...config.metadata,
          },
          audio: {
            sampleRate: actualSampleRateRef.current ?? SAMPLE_RATE,
            channels: CHANNELS,
          },
        },
      });
    } catch (error: any) {
      console.error("Failed to start session:", error);
      setStatus((prev) => ({ ...prev, error: error.message }));
    }
  }, [ config]);

  const stopSession = useCallback(() => {
    if (socketRef.current?.connected) {
      socketRef.current.emit("stop");
    }
    stopRecording();
  }, []);

  const ensureAudio = useCallback(async () => {
    if (
      !audioContextRef.current ||
      audioContextRef.current.state === "closed"
    ) {
      audioContextRef.current = new (window.AudioContext ||
        (window as any).webkitAudioContext)({
        sampleRate: SAMPLE_RATE,
      });
      const resolvedSampleRate =
        audioContextRef.current?.sampleRate ?? SAMPLE_RATE;
      actualSampleRateRef.current = resolvedSampleRate;
      await audioContextRef.current.resume();
    }

    // Register AudioWorklet processor
    try {
      await audioContextRef.current.audioWorklet.addModule(
        new URL(createAudioProcessorBlobUrl(), import.meta.url)
      );
    } catch (error) {
      console.warn(
        "AudioWorklet not supported, falling back to ScriptProcessor"
      );
    }

    if (!mediaStreamRef.current) {
      mediaStreamRef.current = await navigator.mediaDevices.getUserMedia({
        audio: {
          channelCount: CHANNELS,
          sampleRate: SAMPLE_RATE,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
    }
  }, []);

  const startRecording = useCallback(async () => {
    // Ensure audio is initialized first
    await ensureAudio();

    if (!audioContextRef.current || !mediaStreamRef.current) {
      setStatus((prev) => ({ ...prev, error: "Audio not initialized" }));
      return;
    }

    try {
      const source = audioContextRef.current.createMediaStreamSource(
        mediaStreamRef.current
      );

      let processor;

      const connectProcessorSilently = (node: AudioNode) => {
        if (!audioContextRef.current) {
          return;
        }

        // Ensure we tear down any previous silent monitor
        if (silentGainNodeRef.current) {
          try {
            silentGainNodeRef.current.disconnect();
          } catch (disconnectError) {
            console.warn(
              "Failed to disconnect previous silent gain node",
              disconnectError
            );
          }
          silentGainNodeRef.current = null;
        }

        const silentGain = audioContextRef.current.createGain();
        silentGain.gain.value = 0;
        node.connect(silentGain);
        silentGain.connect(audioContextRef.current.destination);
        silentGainNodeRef.current = silentGain;
      };

      const processAndSendChunk = (chunk: Float32Array) => {
        const sourceRate = actualSampleRateRef.current ?? SAMPLE_RATE;

        try {
          const processed =
            sourceRate === SAMPLE_RATE
              ? chunk
              : resampleToTarget(chunk, sourceRate, SAMPLE_RATE);
          const pcm16 = f32ToPcm16(processed);

          if (socketRef.current?.connected) {
            socketRef.current.emit("audio", pcm16);
          }
        } catch (resampleError: any) {
          console.error("Failed to resample audio chunk:", resampleError);
          setStatus((prev) => ({
            ...prev,
            error:
              resampleError?.message || "Unable to process audio for streaming",
          }));
        }
      };

      // Try AudioWorkletNode first, fallback to ScriptProcessor
      try {
        processor = new AudioWorkletNode(
          audioContextRef.current,
          "audio-processor",
          {
            processorOptions: { bufferSize: 4096 },
          }
        );

        processor.port.onmessage = (e) => {
          const audioData = new Float32Array(e.data);
          processAndSendChunk(audioData);
        };
        connectProcessorSilently(processor);
      } catch (workletError) {
        // Fallback to deprecated ScriptProcessor
        processor = audioContextRef.current.createScriptProcessor(
          4096,
          CHANNELS,
          CHANNELS
        );

        processor.onaudioprocess = (e) => {
          const inputData = new Float32Array(e.inputBuffer.getChannelData(0));
          processAndSendChunk(inputData);
        };
        connectProcessorSilently(processor);
      }

      source.connect(processor);

      audioSourceRef.current = source;
      processorRef.current = processor;

      setStatus((prev) => ({ ...prev, isRecording: true }));
    } catch (error: any) {
      console.error("Failed to start recording:", error);
      setStatus((prev) => ({ ...prev, error: error.message }));
    }
  }, [ensureAudio]);

  const stopRecording = useCallback(() => {
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }

    if (silentGainNodeRef.current) {
      try {
        silentGainNodeRef.current.disconnect();
      } catch (error) {
        console.warn("Failed to disconnect silent gain node", error);
      }
      silentGainNodeRef.current = null;
    }

    if (audioSourceRef.current) {
      audioSourceRef.current.disconnect();
      audioSourceRef.current = null;
    }

    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }

    if (audioContextRef.current && audioContextRef.current.state !== "closed") {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }

    setStatus((prev) => ({ ...prev, isRecording: false }));
  }, []);

  const playAudio = useCallback((audioData: ArrayBuffer) => {
    try {
      console.log("Audio play skiped for now");
      return;
      const ac =
        audioContextRef.current ??
        new AudioContext({ sampleRate: SAMPLE_RATE });
      audioContextRef.current = ac;

      const f32 = pcm16ToF32(audioData);
      const buffer = ac.createBuffer(CHANNELS, f32.length, SAMPLE_RATE);
      buffer.getChannelData(0).set(f32);

      const src = ac.createBufferSource();
      src.buffer = buffer;
      src.connect(ac.destination);
      src.start();
    } catch (error: any) {
      console.error("Audio playback error:", error);
      setStatus((prev) => ({
        ...prev,
        error: `Audio playback error: ${error.message}`,
      }));
    }
  }, []);

  const toggleRecording = useCallback(async () => {
    if (!status.sessionActive) {
      // Start session and immediately start recording
      await startSession();
      // No delay - start recording immediately
      startRecording();
    } else {
      stopSession();
    }
  }, [status.sessionActive, startSession, stopSession, startRecording]);

  // Auto-start recording when session becomes active
  useEffect(() => {
    if (status.sessionActive && !status.isRecording) {
      startRecording();
    }
  }, [status.sessionActive, status.isRecording, startRecording]);

  return {
    status,
    connect,
    disconnect,
    startSession,
    stopSession,
    toggleRecording,
    startRecording,
  };
};
