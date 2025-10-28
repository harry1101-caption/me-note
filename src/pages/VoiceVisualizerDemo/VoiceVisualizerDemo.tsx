import React, { useState } from 'react';
import VoiceVisualizer from '../../components/VoiceVisualizer';
import './VoiceVisualizerDemo.css';

const VoiceVisualizerDemo: React.FC = () => {
  const [isActive, setIsActive] = useState(false);

  const handleStart = () => {
    console.log('Voice visualizer started');
  };

  const handleStop = () => {
    console.log('Voice visualizer stopped');
  };

  return (
    <div className="voice-visualizer-demo">
      <div className="demo-container">
        <h1>Voice Visualizer Demo</h1>
        
        <div className="visualizer-section">
          <VoiceVisualizer 
            isActive={isActive}
            onStart={handleStart}
            onStop={handleStop}
          />
        </div>

        <div className="controls">
          <button 
            className={`control-button ${isActive ? 'active' : ''}`}
            onClick={() => setIsActive(!isActive)}
          >
            {isActive ? 'Stop Visualizer' : 'Start Visualizer'}
          </button>
        </div>

        <div className="variants">
          <h3>Size Variants:</h3>
          <div className="variant-examples">
            <div className="variant-item">
              <h4>Compact</h4>
              <VoiceVisualizer 
                isActive={isActive}
                className="compact"
              />
            </div>
            
            <div className="variant-item">
              <h4>Default</h4>
              <VoiceVisualizer 
                isActive={isActive}
              />
            </div>
            
            <div className="variant-item">
              <h4>Large</h4>
              <VoiceVisualizer 
                isActive={isActive}
                className="large"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VoiceVisualizerDemo;
