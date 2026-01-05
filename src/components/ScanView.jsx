import { useState, useRef } from 'react';
import ReasoningCard from './ReasoningCard';
import VoiceFeedback from './VoiceFeedback';
import HealthChat from './HealthChat';
import { analyzeIngredients, DEMO_PRODUCTS, getProductSafetyStatus } from '../ai/reasoningEngine';
import Tesseract from 'tesseract.js';

export default function ScanView({ voiceEnabled, userProfile, extraContext }) {
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null);
  const [scanStatus, setScanStatus] = useState('');
  const [chatActive, setChatActive] = useState(false);
  const [manualEntryActive, setManualEntryActive] = useState(false);
  const [manualText, setManualText] = useState('');

  // Camera States
  const [cameraActive, setCameraActive] = useState(false);
  const [torchOn, setTorchOn] = useState(false);
  const [stream, setStream] = useState(null);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // --- CAMERA LOGIC ---
  const startCamera = async () => {
    setCameraActive(true);
    setResult(null);
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      setStream(newStream);
      if (videoRef.current) videoRef.current.srcObject = newStream;
    } catch (err) {
      console.error("Camera access denied:", err);
      setCameraActive(false);
      alert("CAMERA ERROR: Please allow permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
    setTorchOn(false);
  };

  const toggleTorch = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    const capabilities = track.getCapabilities();
    if (capabilities.torch) {
      try {
        await track.applyConstraints({ advanced: [{ torch: !torchOn }] });
        setTorchOn(!torchOn);
      } catch (e) {
        console.error("Torch error:", e);
      }
    } else {
      alert("Light/Torch not supported.");
    }
  };

  const captureFrame = async () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const cropWidth = video.videoWidth * 0.8;
    const cropHeight = video.videoHeight * 0.4;
    const startX = (video.videoWidth - cropWidth) / 2;
    const startY = (video.videoHeight - cropHeight) / 2;
    canvas.width = cropWidth;
    canvas.height = cropHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, startX, startY, cropWidth, cropHeight, 0, 0, cropWidth, cropHeight);
    const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.9));
    stopCamera();
    processImage(blob);
  };

  // --- OCR / TEXT FLOW ---
  const processImage = async (fileOrBlob) => {
    if (!fileOrBlob) return;
    setScanning(true);
    setScanStatus('PROCESSING LABEL...');
    try {
      const { data: { text } } = await Tesseract.recognize(fileOrBlob, 'eng', {
        logger: m => {
          if (m.status === 'recognizing text') {
            setScanStatus(`READING: ${Math.floor(m.progress * 100)}%`);
          }
        }
      });
      setScanStatus('THINKING...');
      const analysis = await analyzeIngredients(text, null, null, userProfile, extraContext);
      setResult(analysis);
    } catch (err) {
      console.error(err);
      setScanStatus('SCANNER FAILED');
      setTimeout(() => setScanning(false), 2000);
    } finally {
      setScanning(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleManualSubmit = async () => {
    if (!manualText.trim()) return;
    setManualEntryActive(false);
    setScanning(true);
    setScanStatus('SEARCHING BRAIN...');
    try {
      const analysis = await analyzeIngredients(manualText, null, null, userProfile, extraContext);
      setResult(analysis);
      setManualText('');
    } catch (err) {
      console.error("Manual Entry Error:", err);
      setScanStatus('ANALYSIS ERROR');
      setTimeout(() => setScanning(false), 2000);
    } finally {
      if (scanStatus !== 'ANALYSIS ERROR') setScanning(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) processImage(file);
  };

  const handleDemoSelect = async (product) => {
    setScanning(true);
    setScanStatus(`MATCHING ${product.name.toUpperCase()}...`);
    const analysis = await analyzeIngredients(null, null, product.id, userProfile, extraContext);
    setResult(analysis);
    setScanning(false);
  };

  // --- RENDERING ---
  if (cameraActive) {
    return (
      <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#000', zIndex: 1000, display: 'flex', flexDirection: 'column' }}>
        <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '80%', height: '30%', border: '2px solid var(--primary-neon)', borderRadius: '12px', boxShadow: '0 0 0 1000px rgba(0,0,0,0.5)', pointerEvents: 'none' }}>
          <div className="scanner-line"></div>
        </div>
        <div style={{ position: 'absolute', top: '20px', left: '20px', right: '20px', display: 'flex', justifyContent: 'space-between' }}>
          <button onClick={stopCamera} style={{ background: 'rgba(0,0,0,0.5)', border: 'none', color: '#fff', padding: '10px', borderRadius: '50%', width: '40px', height: '40px' }}>✕</button>
          <button onClick={toggleTorch} style={{ background: torchOn ? 'var(--primary-neon)' : 'rgba(0,0,0,0.5)', border: 'none', color: torchOn ? '#000' : '#fff', borderRadius: '50%', padding: '0 10px', fontSize: '0.7rem' }}>{torchOn ? 'LIGHT ON' : 'LIGHT OFF'}</button>
        </div>
        <div style={{ position: 'absolute', bottom: '40px', left: 0, right: 0, textAlign: 'center' }}>
          <button onClick={captureFrame} style={{ width: '75px', height: '75px', borderRadius: '50%', border: '4px solid #fff', backgroundColor: 'transparent', padding: '6px' }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', backgroundColor: '#fff' }}></div>
          </button>
        </div>
      </div>
    );
  }

  if (scanning) {
    return (
      <div className="glass-panel" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="scanner-line" style={{ top: '50%', boxShadow: '0 0 30px var(--primary-neon)' }}></div>
        <div style={{ textAlign: 'center' }}>
          <h2 className="animate-fade-in" style={{ marginTop: '20px', color: 'var(--primary-neon)', letterSpacing: '2px' }}>{scanStatus}</h2>
          <p className="mono" style={{ fontSize: '0.7rem', opacity: 0.6, marginTop: '8px' }}>NutriDoc is analyzing visual tokens...</p>
        </div>
      </div>
    );
  }

  if (result && result.canIEat === 'NO_INGREDIENTS') {
    return (
      <div className="glass-panel animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        <div style={{ fontSize: '4rem', marginBottom: '20px' }}>🔍</div>
        <h2 style={{ color: '#FF0055', marginBottom: '10px' }}>NO INGREDIENTS IDENTIFIED</h2>
        <p style={{ maxWidth: '80%', opacity: 0.8, marginBottom: '30px' }}>
          This doesn't look like a food ingredient label. NutriDoc only scans food items to keep you safe.
        </p>
        <button onClick={() => setResult(null)} className="btn-primary" style={{ padding: '12px 24px', borderRadius: '12px' }}>TRY AGAIN</button>
      </div>
    );
  }

  if (result) {
    return (
      <div className="animate-fade-in" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        <ReasoningCard data={result} onBack={() => setResult(null)} onChat={() => setChatActive(true)} />
        <VoiceFeedback text={result.voiceSummary} active={voiceEnabled} />
        {chatActive && (
          <HealthChat
            productData={result}
            userProfile={userProfile}
            extraContext={extraContext}
            onClose={() => setChatActive(false)}
          />
        )}
      </div>
    );
  }

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Dynamic Reference Grid */}
      <div className="glass-panel" style={{ flex: 1, padding: '20px', overflowY: 'auto', marginBottom: '100px' }}>
        <h2 className="mono" style={{ fontSize: '0.7rem', marginBottom: '15px', textAlign: 'center', color: 'var(--accent-blue)', opacity: 0.6, letterSpacing: '2px' }}>
          REFERENCE SCANS ({userProfile === 'PREGNANCY' ? `Month ${extraContext.month}` : userProfile})
        </h2>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
          {DEMO_PRODUCTS.map(product => {
            const safety = getProductSafetyStatus(product.id, userProfile, extraContext);
            const statusColor = safety === 'CONTRAINDICATED' ? '#FF3B30' : safety === 'CAUTION ADVISED' ? '#FFCC00' : '#34C759';
            return (
              <button
                key={product.id}
                onClick={() => handleDemoSelect(product)}
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid ${statusColor}33`,
                  borderRadius: '12px',
                  padding: '12px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  textAlign: 'left',
                  transition: 'all 0.2s',
                  position: 'relative'
                }}
              >
                <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px', background: statusColor }}></div>
                <span style={{ fontSize: '1.5rem', opacity: 0.8 }}>{product.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h3 style={{ fontSize: '0.75rem', color: '#fff' }}>{product.name}</h3>
                    <span style={{ fontSize: '0.55rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '4px', background: `${statusColor}22`, color: statusColor }}>{safety === 'CONTRAINDICATED' ? 'CONTRAINDICATED' : safety === 'CAUTION ADVISED' ? 'CAUTION' : 'SAFE'}</span>
                  </div>
                  <p className="mono" style={{ fontSize: '0.6rem', color: 'var(--text-muted)', marginTop: '4px' }}>{product.ingredients.substring(0, 45)}...</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual Entry Modal */}
      {manualEntryActive && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '400px', padding: '24px', border: '1px solid var(--primary-neon)' }}>
            <h3 className="mono" style={{ marginBottom: '20px', color: 'var(--primary-neon)' }}>SEARCH PRODUCT / TEXT</h3>
            <textarea
              autoFocus
              value={manualText}
              onChange={(e) => setManualText(e.target.value)}
              placeholder="Type product name or paste ingredient text..."
              style={{ width: '100%', height: '120px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', borderRadius: '12px', color: '#fff', padding: '12px', fontSize: '0.9rem', marginBottom: '20px', outline: 'none' }}
            />
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setManualEntryActive(false)} style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-muted)' }}>CANCEL</button>
              <button
                onClick={handleManualSubmit}
                disabled={!manualText.trim()}
                className="btn-primary"
                style={{ flex: 2, padding: '12px', borderRadius: '12px', fontWeight: 'bold' }}
              >
                ANALYZE TEXT
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Primary Actions */}
      <div style={{ position: 'fixed', bottom: '30px', left: '50%', transform: 'translateX(-50%)', zIndex: 50, display: 'flex', gap: '8px', width: '95%', maxWidth: '450px' }}>
        <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileUpload} style={{ display: 'none' }} />
        <button onClick={() => setManualEntryActive(true)} style={{ flex: 1, padding: '16px 8px', borderRadius: '16px', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)', color: '#fff', fontWeight: 'bold', fontSize: '0.65rem' }}>📝 MANUAL</button>
        <button onClick={() => fileInputRef.current.click()} style={{ flex: 1, padding: '16px 8px', borderRadius: '16px', background: 'var(--bg-surface)', border: '1px solid var(--primary-neon)', color: 'var(--primary-neon)', fontWeight: 'bold', fontSize: '0.65rem' }}>📁 UPLOAD</button>
        <button onClick={startCamera} className="btn-primary" style={{ flex: 2, padding: '16px 8px', borderRadius: '16px', fontWeight: 'bold', fontSize: '0.7rem' }}>📷 LIVE SCANNER</button>
      </div>
    </div>
  );
}
