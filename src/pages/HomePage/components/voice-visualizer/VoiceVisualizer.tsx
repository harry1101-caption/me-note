import React, { useEffect, useRef, useState } from "react";
import "./VoiceVisualizer.css";

interface VoiceVisualizerProps {
  stream?: MediaStream | null;
}

const VoiceVisualizer: React.FC<VoiceVisualizerProps> = ({ stream }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Uint8Array | null>(null);
  const [animationFrameId, setAnimationFrameId] = useState<number | null>(null);

  useEffect(() => {
    if (!stream) return;

    const audioContext = new AudioContext();
    const source = audioContext.createMediaStreamSource(stream);
    const analyser = audioContext.createAnalyser();

    analyser.fftSize = 2048;
    const bufferLength = analyser.fftSize;
    const dataArray = new Uint8Array(bufferLength);

    analyserRef.current = analyser;
    dataArrayRef.current = dataArray;
    audioContextRef.current = audioContext;

    source.connect(analyser);

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let x = 0;
    const draw = () => {
      if (!ctx || !analyserRef.current || !dataArrayRef.current) return;

      const { width, height } = canvas;
      analyserRef.current.getByteTimeDomainData(dataArrayRef.current);

      // scroll left
      const imageData = ctx.getImageData(1, 0, width - 1, height);
      ctx.putImageData(imageData, 0, 0);
      ctx.clearRect(width - 1, 0, 1, height);

      // draw new line at right edge
      const sliceHeight = height / 2;
      const amplitude = dataArrayRef.current[0] / 128.0;
      const y = amplitude * sliceHeight;

      ctx.beginPath();
      ctx.moveTo(width - 1, sliceHeight);
      ctx.lineTo(width - 1, y);
      ctx.strokeStyle = "#ff3b3b";
      ctx.lineWidth = 2;
      ctx.stroke();

      const id = requestAnimationFrame(draw);
      setAnimationFrameId(id);
    };

    draw();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      if (audioContext.state !== "closed") audioContext.close();
    };
  }, [stream]);

  return (
    <div className="visualizer-scroll-container">
      <canvas ref={canvasRef} width={600} height={80}></canvas>
    </div>
  );
};

export default VoiceVisualizer;
