import React, { useState } from 'react';
import { Mic, Square, Volume2 } from 'lucide-react';

const VoiceInput = ({ onSpeechInput }) => {
  // States: 'idle' | 'listening' | 'stopped'
  const [voiceState, setVoiceState] = useState('idle');

  const toggleRecording = () => {
    if (voiceState === 'idle') {
      setVoiceState('listening');

      // Local frontend interactive UI preview (no synthetic text injection or backend processing)
      setTimeout(() => {
        setVoiceState('stopped');
      }, 3000);
    } else {
      setVoiceState('stopped');
    }
  };

  const handleReset = () => {
    setVoiceState('idle');
  };

  return (
    <div className="voice-input-container">
      <button
        type="button"
        className={`voice-mic-btn ${voiceState === 'listening' ? 'listening' : 'idle'}`}
        onClick={voiceState === 'stopped' ? handleReset : toggleRecording}
        title={
          voiceState === 'idle'
            ? 'Click to dictate request'
            : voiceState === 'listening'
            ? 'Listening... Click to stop'
            : 'Click to record again'
        }
        aria-label="Voice input dictate button"
      >
        {voiceState === 'idle' && <Mic size={20} />}
        {voiceState === 'listening' && <Square size={16} />}
        {voiceState === 'stopped' && <Volume2 size={20} />}
      </button>

      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-text-primary)' }}>
            {voiceState === 'idle' && 'Voice Dictation'}
            {voiceState === 'listening' && 'Listening to microphone...'}
            {voiceState === 'stopped' && 'Recording stopped'}
          </span>
          <span className="badge badge-neutral" style={{ fontSize: '0.6875rem' }}>
            Local UI
          </span>
        </div>

        <p style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '0.15rem' }}>
          {voiceState === 'idle' && 'Click the microphone icon to test voice input capture.'}
          {voiceState === 'listening' && 'Simulating audio input stream.'}
          {voiceState === 'stopped' && 'Audio capture ended. Click microphone to test again.'}
        </p>
      </div>
    </div>
  );
};

export default VoiceInput;
