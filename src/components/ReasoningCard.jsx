import { useState } from 'react';

export default function ReasoningCard({ data, onBack, onChat }) {
  const isSafe = data.canIEat === 'YES';
  const isDanger = data.canIEat === 'NO';
  const isLimited = data.canIEat === 'LIMITED';

  const scoreStyles = {
    'SAFE SELECTION': { color: '#34C759', border: '1px solid #34C759', bg: 'rgba(52,199,89,0.1)', icon: '✅' },
    'CAUTION ADVISED': { color: '#FFCC00', border: '1px solid #FFCC00', bg: 'rgba(255,204,0,0.1)', icon: '⚠️' },
    'CONTRAINDICATED': { color: '#FF3B30', border: '1px solid #FF3B30', bg: 'rgba(255,59,48,0.1)', icon: '🚫' },
    'Neutral': { color: '#fff', border: '1px solid #888', bg: 'rgba(255,255,255,0.05)', icon: '🔍' }
  }[data.score] || { color: '#fff', border: '1px solid #888', bg: 'none', icon: '❓' };

  return (
    <div className="glass-panel" style={{ padding: '24px', animation: 'fade-in-up 0.4s ease', height: '100%', display: 'flex', flexDirection: 'column', border: `1px solid ${scoreStyles.color}44` }}>

      {/* Medical Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <p className="mono" style={{ fontSize: '0.6rem', color: 'var(--accent-blue)', marginBottom: '10px', opacity: 0.8 }}>CLINICAL ANALYSIS REPORT</p>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px',
          padding: '16px', borderRadius: '16px', background: scoreStyles.bg, border: scoreStyles.border,
          boxShadow: `0 8px 16px ${scoreStyles.color}15`
        }}>
          <span style={{ fontSize: '1.5rem' }}>{scoreStyles.icon}</span>
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ fontSize: '1.1rem', margin: 0, color: scoreStyles.color }}>{data.score}</h2>
            <p style={{ fontSize: '0.65rem', margin: 0, opacity: 0.8, fontWeight: 'bold' }}>
              {isSafe ? "SAFE FOR CONSUMPTION" : isDanger ? "NOT RECOMMENDED FOR YOU" : "USE WITH CAUTION"}
            </p>
          </div>
        </div>
      </div>

      {/* Analysis Grid */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', paddingRight: '5px' }}>
        {data.breakdown.map((item, idx) => {
          const isCritical = item.label === 'Internal Impact' || item.label === 'Potential Consequences';
          return (
            <div key={idx} style={{
              background: isCritical ? 'rgba(255,255,255,0.03)' : 'transparent',
              padding: isCritical ? '12px' : '0',
              borderRadius: '10px',
              borderLeft: `3px solid ${item.label.includes('Impact') ? '#FF3B30' : item.label.includes('Guide') ? 'var(--primary-neon)' : 'var(--glass-border)'}`,
              paddingLeft: '16px'
            }}>
              <h3 style={{ fontSize: '0.65rem', color: 'var(--accent-blue)', marginBottom: '6px', letterSpacing: '1px' }}>
                {item.label.toUpperCase()}
              </h3>
              <p style={{ fontSize: '0.9rem', lineHeight: '1.6', color: isCritical ? '#fff' : 'var(--text-main)', fontWeight: item.label === 'Health Fit' ? 'bold' : 'normal' }}>
                {item.content}
              </p>
            </div>
          );
        })}
      </div>

      {/* Final Action Hub */}
      <div style={{ marginTop: '24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <button
          className="btn-primary"
          onClick={onChat}
          style={{
            width: '100%', background: 'var(--primary-neon)', color: '#001A0F',
            fontWeight: '800', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
          }}
        >
          <span>👩‍⚕️</span> CONSULT NUTRIDOC ADVISOR
        </button>

        <button
          onClick={onBack}
          style={{
            width: '100%', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
            color: 'var(--text-muted)', padding: '12px', borderRadius: '12px', fontSize: '0.8rem',
            fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s'
          }}
        >
          CLOSE REPORT
        </button>
      </div>
    </div>
  );
}
