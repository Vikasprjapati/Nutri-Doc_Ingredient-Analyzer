import { useState } from 'react';
import { askChat } from '../ai/reasoningEngine';

export default function HealthChat({ productData, userProfile, onClose }) {
    const [messages, setMessages] = useState([
        { role: 'ai', text: `Hi! I've analyzed this product. Do you have any specific questions about how it affects your ${userProfile}?` }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const response = await askChat(userMsg, productData, userProfile);
            setMessages(prev => [...prev, { role: 'ai', text: response }]);
        } catch (err) {
            setMessages(prev => [...prev, { role: 'ai', text: "I'm having trouble connecting to the neural link." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="glass-panel" style={{
            position: 'fixed', bottom: 0, left: 0, right: 0, top: '100px',
            zIndex: 2000, display: 'flex', flexDirection: 'column',
            borderBottomLeftRadius: 0, borderBottomRightRadius: 0,
            animation: 'fade-in-up 0.3s ease'
        }}>
            <div style={{ padding: '15px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 className="mono" style={{ color: 'var(--primary-neon)', fontSize: '0.9rem' }}>NutriDoc CHAT</h2>
                <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#fff', fontSize: '1.2rem' }}>✕</button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {messages.map((m, idx) => (
                    <div key={idx} style={{
                        alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
                        maxWidth: '80%', padding: '12px', borderRadius: '12px',
                        background: m.role === 'user' ? 'var(--primary-neon)' : 'rgba(255,255,255,0.05)',
                        color: m.role === 'user' ? '#000' : '#fff',
                        fontSize: '0.9rem', lineHeight: '1.4'
                    }}>
                        {m.text}
                    </div>
                ))}
                {loading && <div className="mono" style={{ fontSize: '0.7rem', opacity: 0.5 }}>SYNTHESIZING...</div>}
            </div>

            <div style={{ padding: '20px', background: 'rgba(0,0,0,0.3)', display: 'flex', gap: '10px' }}>
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    placeholder="Ask NutriDoc anything..."
                    style={{
                        flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
                        padding: '12px', borderRadius: '8px', color: '#fff', outline: 'none'
                    }}
                />
                <button onClick={handleSend} className="btn-primary" style={{ padding: '12px' }}>SEND</button>
            </div>
        </div>
    );
}
