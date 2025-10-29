import React, { useRef, useState, useEffect } from 'react';
import { Square } from 'lucide-react';
import RecordRTC from 'recordrtc';
import './RecordingInterface.css';

interface RecordingInterfaceProps {
  isRecording?: boolean;
  onStop?: () => void;
  onRecordingComplete?: (blob: Blob) => void;
}

const RecordingInterface: React.FC<RecordingInterfaceProps> = ({
  isRecording = true,
  onStop,
  onRecordingComplete,
}) => {
  const [recordingTime, setRecordingTime] = useState(0);

  const mediaStreamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const recorderRef = useRef<RecordRTC | null>(null);

  useEffect(() => {
    if (!isRecording) return;

    const startRecording = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        });

        mediaStreamRef.current = stream;

        recorderRef.current = new RecordRTC(stream, {
          type: 'audio',
          mimeType: 'audio/webm',
          numberOfAudioChannels: 1,
        });
        recorderRef.current.startRecording();

        const audioContext = new AudioContext();
        audioContextRef.current = audioContext;
      } catch (error) {
        console.error('Error accessing microphone:', error);
        alert('Microphone access denied. Please allow microphone access.');
      }
    };

    startRecording();

    return () => {
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach(track => track.stop());
      }
      if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
    };
  }, [isRecording]);

  useEffect(() => {
    if (!isRecording) return;

    const interval = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 10);

    return () => clearInterval(interval);
  }, [isRecording]);

  const handleStop = () => {
    if (recorderRef.current) {
      recorderRef.current.stopRecording(() => {
        const blob = recorderRef.current?.getBlob();
        if (blob && onRecordingComplete) {
          onRecordingComplete(blob);
        }
        if (onStop) {
          onStop();
        }
      });
    } else if (onStop) {
      onStop();
    }
  };

  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 100);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const ms = milliseconds % 100;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}.${ms.toString().padStart(2, '0')}`;
  };

  return (
    <div className="recording-interface">
      <div className="recording-indicator">
              <span className="status-dot"></span>
              <span className="status-text">Recording</span>
            </div>
      <div className="recording-content">
        <div className="recording-time-wrapper">
          <div className="recording-time">{formatTime(recordingTime)}</div>
          <button className="stop-button" onClick={handleStop} aria-label="Stop recording">
            <Square size={20} color="#fff" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RecordingInterface;
