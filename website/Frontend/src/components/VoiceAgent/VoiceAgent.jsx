import React, { useState, useCallback } from 'react';
import {
  LiveKitRoom,
  useVoiceAssistant,
  BarVisualizer,
  VoiceAssistantControlBar,
  RoomAudioRenderer,
} from '@livekit/components-react';
import '@livekit/components-styles';
import './VoiceAgent.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function statusLabel(state) {
  if (state === 'speaking') return 'Speaking...';
  if (state === 'listening') return 'Listening...';
  if (state === 'thinking') return 'Thinking...';
  return 'Ready';
}

function VoiceAgentInner({ onClose }) {
  const { state, audioTrack } = useVoiceAssistant();

  return (
    <div className="voice-agent-modal">
      <div className="voice-agent-header">
        <div className="ace-avatar">🎓</div>
        <div>
          <h3 className="ace-name">Ace</h3>
          <span className="ace-status">{statusLabel(state)}</span>
        </div>
        <button className="close-btn" onClick={onClose} aria-label="Close">✕</button>
      </div>
      <div className="voice-visualizer">
        <BarVisualizer state={state} trackRef={audioTrack} barCount={12} />
      </div>
      <VoiceAssistantControlBar />
    </div>
  );
}

export default function VoiceAgent() {
  const [isOpen, setIsOpen] = useState(false);
  const [token, setToken] = useState(null);
  const [wsUrl, setWsUrl] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const startSession = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const resp = await fetch(`${API_BASE}/api/voice/token`);
      if (!resp.ok) throw new Error('Could not reach Ace. Try again shortly.');
      const data = await resp.json();
      setToken(data.token);
      setWsUrl(data.url);
      setIsOpen(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setToken(null);
    setWsUrl(null);
  }, []);

  return (
    <>
      <button
        className="voice-fab"
        onClick={startSession}
        disabled={loading}
        title="Talk to Ace"
      >
        🎤 {loading ? 'Connecting...' : 'Talk to Ace'}
      </button>

      {error && (
        <div className="voice-error">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {isOpen && token && wsUrl && (
        <LiveKitRoom
          token={token}
          serverUrl={wsUrl}
          connect={true}
          audio={true}
          video={false}
          onDisconnected={handleClose}
        >
          <RoomAudioRenderer />
          <VoiceAgentInner onClose={handleClose} />
        </LiveKitRoom>
      )}
    </>
  );
}
