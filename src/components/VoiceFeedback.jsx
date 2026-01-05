import { useState, useEffect } from 'react';

const VoiceFeedback = ({ text, active = false }) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    if (!('speechSynthesis' in window)) {
      setSupported(false);
    }
  }, []);

  useEffect(() => {
    if (active && text && supported) {
      speak(text);
    } else {
      stop();
    }
    // Cleanup on unmount or when text changes significantly
    return () => stop();
  }, [text, active]);

  const speak = (msg) => {
    // Cancel any current speaking
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(msg);
    utterance.rate = 1.0;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stop = () => {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  };

  if (!active || !isSpeaking) return null;

  return (
    <div style={{
      position: 'fixed',
      bottom: '100px',
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      gap: '4px',
      zIndex: 100,
      padding: '10px 20px',
      background: 'rgba(0,0,0,0.6)',
      borderRadius: '30px',
      backdropFilter: 'blur(4px)',
      border: '1px solid var(--primary-neon)'
    }}>
      {/* Visualizer Bars */}
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          style={{
            width: '4px',
            height: '16px',
            background: 'var(--primary-neon)',
            borderRadius: '2px',
            animation: `pulse-height 0.5s ease-in-out infinite alternate`,
            animationDelay: `${i * 0.1}s`
          }}
        />
      ))}
      <style>{`
        @keyframes pulse-height {
          0% { height: 8px; opacity: 0.5; }
          100% { height: 24px; opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default VoiceFeedback;
