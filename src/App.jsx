import { useState, useEffect } from 'react';
import ScanView from "./components/ScanView";

export default function App() {
  const [introFinished, setIntroFinished] = useState(false);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [userProfile, setUserProfile] = useState('NONE');
  const [pregMonth, setPregMonth] = useState(1);

  useEffect(() => {
    const timer = setTimeout(() => setIntroFinished(true), 1500);
    return () => clearTimeout(timer);
  }, []);

  if (!introFinished) {
    return (
      <div className="app" style={{ justifyContent: 'center', alignItems: 'center' }}>
        <h1 className="animate-fade-in" style={{ fontSize: '3rem', letterSpacing: '0.1em' }}>NutriDoc</h1>
        <p className="mono animate-fade-in" style={{ animationDelay: '0.5s', opacity: 0.8 }}>A doctor copilot for your daily life help</p>
      </div>
    );
  }

  const profiles = ['NONE', 'DIABETES', 'HIGH BP', 'LOW BP', 'THYROID', 'PCOD', 'KIDNEY', 'PREGNANCY'];

  return (
    <div className="app animate-fade-in">
      <header className="header" style={{ marginBottom: '10px' }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', margin: 0, letterSpacing: '1px' }}>NutriDoc</h1>
          <p className="mono" style={{ fontSize: '0.6rem', opacity: 0.7, color: 'var(--primary-neon)' }}>DR. COPILOT GUIDE</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setVoiceEnabled(!voiceEnabled)}
            style={{
              background: 'transparent', border: '1px solid var(--glass-border)',
              color: voiceEnabled ? 'var(--primary-neon)' : 'var(--text-muted)',
              padding: '6px 10px', borderRadius: '8px', cursor: 'pointer', fontSize: '1.2rem'
            }}
          >
            {voiceEnabled ? '🔊' : '🔇'}
          </button>
        </div>
      </header>

      {/* Profile Selector */}
      <div style={{ marginBottom: '15px', display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '8px', borderBottom: '1px solid var(--glass-border)' }}>
        {profiles.map(p => (
          <button
            key={p}
            onClick={() => setUserProfile(p)}
            style={{
              flexShrink: 0, padding: '8px 16px', borderRadius: '20px', fontSize: '0.7rem',
              background: userProfile === p ? 'var(--primary-neon)' : 'rgba(255,255,255,0.05)',
              color: userProfile === p ? '#000' : 'var(--text-main)',
              border: 'none', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s'
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Pregnancy Month Selector (Conditional) */}
      {userProfile === 'PREGNANCY' && (
        <div className="animate-fade-in" style={{ marginBottom: '20px', padding: '15px', borderRadius: '16px', background: 'rgba(255,0,148,0.1)', border: '1px solid rgba(255,0,148,0.2)' }}>
          <p className="mono" style={{ fontSize: '0.65rem', color: '#ff0094', marginBottom: '10px', textAlign: 'center' }}>SELECT PREGNANCY STAGE (MONTH)</p>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '5px' }}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(m => (
              <button
                key={m}
                onClick={() => setPregMonth(m)}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: '8px', border: 'none',
                  background: pregMonth === m ? '#ff0094' : 'rgba(255,255,255,0.05)',
                  color: pregMonth === m ? '#fff' : 'var(--text-muted)',
                  fontSize: '0.75rem', fontWeight: 'bold', cursor: 'pointer'
                }}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      )}

      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ScanView
          voiceEnabled={voiceEnabled}
          userProfile={userProfile}
          extraContext={{ month: pregMonth }}
        />
      </main>
    </div>
  );
}
