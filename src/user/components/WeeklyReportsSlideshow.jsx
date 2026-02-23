import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Image as ImageIcon, X, Tag, Play, Pause, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getOfficers } from '../../utils/storage';

// ─── Config ───────────────────────────────────────────────────────────────────
const CATEGORY_CONFIG = {
  Event:       { color: '#1d4ed8', bg: 'rgba(29,78,216,0.08)',  border: 'rgba(29,78,216,0.2)',  emoji: '📅' },
  Training:    { color: '#166534', bg: 'rgba(22,101,52,0.08)',  border: 'rgba(22,101,52,0.2)',  emoji: '🎯' },
  Advisory:    { color: '#92400e', bg: 'rgba(146,64,14,0.08)', border: 'rgba(146,64,14,0.2)', emoji: '📢' },
  Achievement: { color: '#5b21b6', bg: 'rgba(91,33,182,0.08)',  border: 'rgba(91,33,182,0.2)',  emoji: '🏆' },
  Birthday:    { color: '#9d174d', bg: 'rgba(157,23,77,0.08)',  border: 'rgba(157,23,77,0.2)',  emoji: '🎂' },
};
const getCatConfig = (cat) =>
  CATEGORY_CONFIG[cat] || { color: '#44403c', bg: 'rgba(68,64,60,0.06)', border: 'rgba(68,64,60,0.16)', emoji: '📄' };

const RANK_ABBREVIATIONS = {
  'Chief Fire Officer': 'CFO', 'Chief Fire Inspector': 'CFI',
  'Senior Fire Inspector': 'SFINSP', 'Fire Inspector': 'FInsp',
  'Senior Fire Officer III': 'SFO3', 'Senior Fire Officer II': 'SFO2',
  'Senior Fire Officer I': 'SFO1', 'Fire Officer III': 'FO3',
  'Fire Officer II': 'FO2', 'Fire Officer I': 'FO1',
};

const SLIDE_DURATION = 14000;

const formatDate = (date) => {
  if (!date) return '';
  const d = date?.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

function isBirthday(birthdateStr) {
  if (!birthdateStr) return false;
  try {
    const today = new Date(), bday = new Date(birthdateStr);
    return today.getMonth() === bday.getMonth() && today.getDate() === bday.getDate();
  } catch { return false; }
}

function getAge(birthdateStr) {
  if (!birthdateStr) return null;
  try {
    const today = new Date(), bday = new Date(birthdateStr);
    let age = today.getFullYear() - bday.getFullYear();
    const m = today.getMonth() - bday.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < bday.getDate())) age--;
    return age;
  } catch { return null; }
}

function getImages(report) {
  if (Array.isArray(report.images) && report.images.length > 0) return report.images;
  if (report.coverImage) return [report.coverImage];
  return [];
}

// ─── Confetti ─────────────────────────────────────────────────────────────────
const CONFETTI_COLORS = ['#ef4444','#f59e0b','#22c55e','#3b82f6','#ec4899','#f97316','#8b5cf6','#06b6d4'];

function ConfettiCanvas({ active }) {
  const canvasRef = useRef(null);
  const animRef   = useRef(null);
  const particles = useRef([]);

  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(animRef.current);
      particles.current = [];
      const c = canvasRef.current;
      if (c) c.getContext('2d').clearRect(0, 0, c.width, c.height);
      return;
    }
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    const spawn = (n) => {
      for (let i = 0; i < n; i++) {
        const side = Math.random() > 0.5;
        particles.current.push({
          x: side ? canvas.width * 0.18 : canvas.width * 0.82,
          y: canvas.height * 0.22,
          vx: (Math.random() - 0.5) * 11 + (side ? 3.5 : -3.5),
          vy: -(Math.random() * 9 + 3.5),
          color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
          size: Math.random() * 7 + 3.5, shape: Math.random() > 0.5 ? 'rect' : 'circle',
          rotation: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.18,
          alpha: 1, gravity: 0.28 + Math.random() * 0.18,
          wobble: Math.random() * 0.09, wobbleSpeed: Math.random() * 0.05,
          wobblePhase: Math.random() * Math.PI * 2,
          life: 1, decay: 0.008 + Math.random() * 0.005,
        });
      }
    };
    spawn(130);
    const t1 = setTimeout(() => spawn(70), 900);
    const t2 = setTimeout(() => spawn(50), 1900);
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.current = particles.current.filter(p => p.life > 0);
      particles.current.forEach(p => {
        p.vy += p.gravity; p.wobblePhase += p.wobbleSpeed;
        p.x += p.vx + Math.sin(p.wobblePhase) * p.wobble * 18;
        p.y += p.vy; p.rotation += p.rotSpeed; p.life -= p.decay; p.alpha = p.life;
        ctx.save(); ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y); ctx.rotate(p.rotation); ctx.fillStyle = p.color;
        if (p.shape === 'rect') ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        else { ctx.beginPath(); ctx.ellipse(0, 0, p.size / 2, p.size / 4, 0, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
      });
      animRef.current = requestAnimationFrame(animate);
    };
    animate();
    return () => { cancelAnimationFrame(animRef.current); clearTimeout(t1); clearTimeout(t2); };
  }, [active]);

  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 10 }} />;
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
// Keyboard ← → Esc | touch swipe | dot + thumbnail strip | NO nav chevrons
function Lightbox({ images, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex);
  const [dir, setDir] = useState(0);
  const touchStart    = useRef(null);

  const goTo = useCallback((newIdx, d) => {
    const clamped = ((newIdx % images.length) + images.length) % images.length;
    setDir(d !== undefined ? d : (clamped > idx ? 1 : -1));
    setIdx(clamped);
  }, [idx, images.length]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape')     onClose();
      if (e.key === 'ArrowLeft')  goTo(idx - 1, -1);
      if (e.key === 'ArrowRight') goTo(idx + 1,  1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [idx, onClose, goTo]);

  const onTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd   = (e) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) goTo(diff > 0 ? idx + 1 : idx - 1, diff > 0 ? 1 : -1);
    touchStart.current = null;
  };

  const imgV = {
    enter:  (d) => ({ x: d > 0 ? '6%' : '-6%', opacity: 0, scale: 0.97 }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit:   (d) => ({ x: d < 0 ? '6%' : '-6%', opacity: 0, scale: 0.97 }),
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(5,5,8,0.97)', display: 'flex', flexDirection: 'column' }}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {/* Top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 20, padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(to bottom, rgba(0,0,0,0.88), transparent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ padding: '5px 14px', borderRadius: 5, background: 'rgba(192,57,43,0.22)', border: '1px solid rgba(192,57,43,0.4)' }}>
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.88)', fontFamily: "'Oswald', sans-serif" }}>Gallery</span>
          </div>
          {images.length > 1 && (
            <span style={{ fontSize: 13, fontWeight: 500, color: 'rgba(255,255,255,0.45)', fontFamily: "'Lato', sans-serif" }}>{idx + 1} / {images.length}</span>
          )}
          {images.length > 1 && (
            <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.26)', letterSpacing: '0.05em', fontFamily: "'Lato', sans-serif" }}>
              ← → to navigate · Esc to close
            </span>
          )}
        </div>
        <button type="button" onClick={onClose}
          style={{ width: 40, height: 40, borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.14)', color: 'rgba(255,255,255,0.82)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <X size={17} />
        </button>
      </div>

      {/* Image area — no chevrons */}
      <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        <AnimatePresence initial={false} custom={dir} mode="wait">
          <motion.div
            key={idx} custom={dir} variants={imgV}
            initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.24, ease: [0.32, 0, 0.67, 0] }}
            style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '88px 64px 140px' }}
          >
            <img
              src={images[idx]} alt={`Photo ${idx + 1}`} draggable={false}
              style={{ maxWidth: '100%', maxHeight: '100%', width: 'auto', height: 'auto', objectFit: 'contain', borderRadius: 6, boxShadow: '0 24px 80px rgba(0,0,0,0.7)', display: 'block', userSelect: 'none' }}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom: dots + thumbnails */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 20, background: 'linear-gradient(to top, rgba(0,0,0,0.92), transparent)', padding: '22px 24px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 14 }}>
        {images.length > 1 && (
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {images.map((_, i) => (
              <button key={i} type="button" onClick={() => goTo(i, i > idx ? 1 : -1)}
                style={{ width: i === idx ? 22 : 6, height: 6, borderRadius: 999, border: 'none', padding: 0, cursor: 'pointer', background: i === idx ? '#c0392b' : 'rgba(255,255,255,0.25)', boxShadow: i === idx ? '0 0 10px rgba(192,57,43,0.65)' : 'none', transition: 'all 0.22s', flexShrink: 0 }} />
            ))}
          </div>
        )}
        {images.length > 1 && (
          <div style={{ display: 'flex', gap: 7, justifyContent: 'center', overflowX: 'auto', maxWidth: '80%' }}>
            {images.map((src, i) => (
              <button key={i} type="button" onClick={() => goTo(i, i > idx ? 1 : -1)}
                style={{ width: 66, height: 46, borderRadius: 5, padding: 0, flexShrink: 0, overflow: 'hidden', border: i === idx ? '2px solid #c0392b' : '2px solid rgba(255,255,255,0.1)', opacity: i === idx ? 1 : 0.36, cursor: 'pointer', transition: 'all 0.22s', transform: i === idx ? 'scale(1.08)' : 'scale(1)', background: 'transparent' }}>
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Image Panel ───────────────────────────────────────────────────────────────
// Dark bg, no chevrons, click anywhere to open lightbox
function ImagePanel({ images, reportTitle, catCfg, isAutoPlaying, reportId, onOpenLightbox }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [imgDir, setImgDir] = useState(0);

  useEffect(() => { setImgIdx(0); }, [reportId]);

  const goImg = useCallback((next, d) => {
    const newIdx = ((next % images.length) + images.length) % images.length;
    setImgDir(d !== undefined ? d : (newIdx > imgIdx ? 1 : -1));
    setImgIdx(newIdx);
  }, [imgIdx, images.length]);

  const imgV = {
    enter:  (d) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (d) => ({ x: d < 0 ? '100%' : '-100%', opacity: 0 }),
  };

  if (images.length === 0) {
    return (
      <div style={{ position: 'relative', overflow: 'hidden', background: '#111827', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12, height: '100%' }}>
        <span style={{ fontSize: 60, opacity: 0.2 }}>{catCfg.emoji}</span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', fontFamily: "'Lato', sans-serif" }}>No image available</span>
      </div>
    );
  }

  return (
    <div
      style={{ position: 'relative', overflow: 'hidden', background: '#111', cursor: 'pointer', height: '100%' }}
      onClick={() => onOpenLightbox.open(imgIdx)}
    >
      <div style={{ position: 'absolute', inset: 0, background: '#111', zIndex: 0 }} />

      <AnimatePresence custom={imgDir} mode="wait">
        <motion.div
          key={imgIdx} custom={imgDir} variants={imgV}
          initial="enter" animate="center" exit="exit"
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          style={{ position: 'absolute', inset: 0, zIndex: 1 }}
        >
          <img
            src={images[imgIdx]} alt={reportTitle} draggable={false}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', userSelect: 'none' }}
          />
        </motion.div>
      </AnimatePresence>

      {/* Gradient overlay */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 2, background: 'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.1) 40%, transparent 70%)', pointerEvents: 'none' }} />

      {/* Category badge */}
      <div style={{ position: 'absolute', top: 16, left: 16, zIndex: 4, display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', borderRadius: 20, background: 'rgba(255,255,255,0.96)', backdropFilter: 'blur(8px)', border: `1.5px solid ${catCfg.border}`, fontSize: 10, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', color: catCfg.color, boxShadow: '0 2px 14px rgba(0,0,0,0.2)', pointerEvents: 'none', fontFamily: "'Lato', sans-serif" }}>
        {catCfg.emoji} {catCfg.label}
      </div>

      {/* Image count badge */}
      {images.length > 1 && (
        <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 4, display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 20, background: 'rgba(0,0,0,0.62)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.16)', fontSize: 11, fontWeight: 700, color: 'white', pointerEvents: 'none', fontFamily: "'Lato', sans-serif" }}>
          <ImageIcon size={10} /> {imgIdx + 1} / {images.length}
        </div>
      )}

      {/* "Click to expand" hint */}
      <div style={{ position: 'absolute', bottom: images.length > 1 && images.length <= 8 ? 66 : 16, left: 16, zIndex: 4, display: 'flex', alignItems: 'center', gap: 5, padding: '5px 11px', borderRadius: 20, background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)', fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.72)', letterSpacing: '0.07em', textTransform: 'uppercase', pointerEvents: 'none', fontFamily: "'Lato', sans-serif" }}>
        <Maximize2 size={9} /> Click to expand
      </div>

      {/* Dots */}
      {images.length > 1 && images.length <= 10 && (
        <div style={{ position: 'absolute', bottom: images.length <= 8 ? 66 : 16, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5, zIndex: 4, pointerEvents: 'none' }}>
          {images.map((_, i) => (
            <div key={i} style={{ width: i === imgIdx ? 18 : 5, height: 5, borderRadius: 999, background: i === imgIdx ? 'white' : 'rgba(255,255,255,0.42)', boxShadow: i === imgIdx ? '0 0 6px rgba(255,255,255,0.7)' : 'none', transition: 'all 0.22s' }} />
          ))}
        </div>
      )}

      {/* Thumbnail strip */}
      {images.length > 1 && images.length <= 8 && (
        <div
          style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4, zIndex: 5, padding: '5px 6px', background: 'rgba(0,0,0,0.62)', backdropFilter: 'blur(10px)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.12)' }}
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((src, i) => (
            <button key={i} type="button"
              onClick={() => goImg(i, i > imgIdx ? 1 : -1)}
              style={{ width: 44, height: 32, borderRadius: 5, overflow: 'hidden', cursor: 'pointer', flexShrink: 0, border: i === imgIdx ? '2px solid white' : '2px solid transparent', opacity: i === imgIdx ? 1 : 0.45, transition: 'all 0.2s', transform: i === imgIdx ? 'scale(1.1)' : 'scale(1)', background: 'transparent', padding: 0 }}>
              <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
            </button>
          ))}
        </div>
      )}

      {/* Progress bar */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: 'rgba(255,255,255,0.12)', zIndex: 6, pointerEvents: 'none' }}>
        <motion.div
          key={reportId + String(isAutoPlaying)}
          style={{ height: '100%', background: 'linear-gradient(90deg, #c0392b, #e2711a)', transformOrigin: 'left' }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: isAutoPlaying ? 1 : 0 }}
          transition={{ duration: SLIDE_DURATION / 1000, ease: 'linear' }}
        />
      </div>
    </div>
  );
}

// ─── Report Slide ──────────────────────────────────────────────────────────────
function ReportSlide({ report, isAutoPlaying, onLightboxChange }) {
  const catCfg = { ...getCatConfig(report.category), label: report.category };
  const images = getImages(report);
  const [lightboxOpen, setLightboxOpen]   = useState(false);
  const [lightboxStart, setLightboxStart] = useState(0);

  // Notify parent when lightbox opens/closes so we can hide outer chevrons
  useEffect(() => { onLightboxChange(lightboxOpen); }, [lightboxOpen, onLightboxChange]);

  const openLightboxProxy = {
    open: (startIdx) => { setLightboxStart(startIdx); setLightboxOpen(true); },
  };

  return (
    <>
      {lightboxOpen && <Lightbox images={images} startIndex={lightboxStart} onClose={() => setLightboxOpen(false)} />}

      <div style={{ display: 'grid', gridTemplateColumns: '60% 40%', height: '100%' }}>
        <ImagePanel
          images={images}
          reportTitle={report.title}
          catCfg={catCfg}
          isAutoPlaying={isAutoPlaying}
          reportId={report.id}
          onOpenLightbox={openLightboxProxy}
        />

        {/* ── Right info panel ── */}
        <div style={{ display: 'flex', flexDirection: 'column', padding: '44px 42px 36px', background: '#ffffff', position: 'relative', overflow: 'hidden', borderLeft: '1px solid #ede8e3' }}>
          {/* Top accent bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #7f1d1d, #c0392b, #e2711a)' }} />

          {/* Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 18 }}>
            <Calendar size={12} style={{ color: '#c0392b', flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: '#a89f98', letterSpacing: '0.05em', textTransform: 'uppercase', fontFamily: "'Lato', sans-serif" }}>
              {formatDate(report.date)}
            </span>
          </div>

          {/* Title */}
          <h3 style={{
            fontFamily: "'Oswald', sans-serif",
            fontSize: 'clamp(1.45rem, 2vw, 2rem)',
            fontWeight: 600,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: '#0f0d0c',
            lineHeight: 1.12,
            margin: '0 0 16px',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}>
            {report.title}
          </h3>

          {/* Divider accent */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <div style={{ width: 36, height: 3, borderRadius: 999, background: 'linear-gradient(90deg, #c0392b, #e2711a)' }} />
            <div style={{ width: 6, height: 3, borderRadius: 999, background: 'rgba(192,57,43,0.25)' }} />
          </div>

          {/* Description */}
          <p style={{
            fontSize: 14,
            lineHeight: 2,
            color: '#6b5e57',
            display: '-webkit-box',
            WebkitLineClamp: 7,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            marginBottom: 0,
            fontFamily: "'Lato', sans-serif",
            fontWeight: 400,
            letterSpacing: '0.01em',
          }}>
            {report.description}
          </p>

          {/* Spacer pushes footer to bottom */}
          <div style={{ flex: 1 }} />

          {/* View photo button — anchored at bottom */}
          {images.length > 0 && (
            <button type="button" onClick={() => { setLightboxStart(0); setLightboxOpen(true); }}
              style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                padding: '13px 22px', borderRadius: 10,
                background: 'linear-gradient(135deg, #c0392b, #e2711a)',
                border: 'none', color: 'white',
                fontSize: 12, fontWeight: 800,
                cursor: 'pointer', textTransform: 'uppercase',
                letterSpacing: '0.1em',
                boxShadow: '0 4px 18px rgba(192,57,43,0.32)',
                fontFamily: "'Lato', sans-serif",
                marginBottom: 20,
                width: '100%',
                transition: 'opacity 0.18s',
              }}>
              <Maximize2 size={13} />
              {images.length > 1 ? `View all ${images.length} photos` : 'View photo'}
            </button>
          )}

          {/* Footer tag */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, paddingTop: 16, borderTop: '1px solid #f0ece8' }}>
            <Tag size={10} style={{ color: '#d4ccc7', flexShrink: 0 }} />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#c0b8b4', letterSpacing: '0.04em', fontFamily: "'Lato', sans-serif" }}>
              BFP Station 1 — Cogon Update
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Birthday Slide ───────────────────────────────────────────────────────────
function BirthdaySlide({ officer }) {
  const age      = getAge(officer.birthdate);
  const rankAbbr = RANK_ABBREVIATIONS[officer.rank] || officer.rank;
  const initials = (officer.fullName || '?').split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase();
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    setShowConfetti(true);
    const t = setTimeout(() => setShowConfetti(false), 5500);
    return () => clearTimeout(t);
  }, [officer.id]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'grid', gridTemplateColumns: '58% 42%' }}>
      <ConfettiCanvas active={showConfetti} />

      {/* Left: photo panel */}
      <div style={{ position: 'relative', background: 'linear-gradient(160deg, #060913 0%, #0f1320 45%, #1a1340 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
        {[...Array(16)].map((_, i) => (
          <div key={i} style={{ position: 'absolute', top: `${8 + (i * 5.9) % 86}%`, left: `${4 + (i * 6.8) % 92}%`, width: 2 + (i % 3), height: 2 + (i % 3), borderRadius: '50%', background: `rgba(255,215,100,${0.06 + (i % 4) * 0.03})` }} />
        ))}
        <div style={{ position: 'absolute', top: 20, left: '50%', transform: 'translateX(-50%)', background: 'rgba(255,215,100,0.1)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,215,100,0.28)', borderRadius: 8, padding: '6px 22px', zIndex: 3, whiteSpace: 'nowrap' }}>
          <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,215,100,0.9)', fontFamily: "'Oswald', sans-serif" }}>✦ Today's Celebrant</span>
        </div>
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{ width: 200, height: 258, borderRadius: 8, overflow: 'hidden', border: '2px solid rgba(255,215,100,0.3)', boxShadow: '0 24px 64px rgba(0,0,0,0.75), 0 0 0 8px rgba(255,215,100,0.05)' }}>
            {officer.profileImage
              ? <img src={officer.profileImage} alt={officer.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'top center', display: 'block' }} />
              : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg, #1e1b4b, #312e81)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 64, fontWeight: 900, color: 'rgba(255,215,100,0.85)', fontFamily: "'Oswald', sans-serif" }}>{initials}</div>
            }
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '12px 20px', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)', borderTop: '1px solid rgba(255,215,100,0.1)', textAlign: 'center', zIndex: 2 }}>
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(255,215,100,0.5)', fontFamily: "'Lato', sans-serif" }}>BFP Station 1 · Cogon · CDO</span>
        </div>
      </div>

      {/* Right: info panel */}
      <div style={{ background: '#ffffff', padding: '44px 38px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', overflow: 'hidden', borderLeft: '1px solid #f0ece8' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #7f1d1d, #c0392b, #f59e0b)' }} />

        <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#c0392b', marginBottom: 12, fontFamily: "'Lato', sans-serif" }}>🎉 Birthday Celebration</p>

        <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: 'clamp(1.7rem, 2.6vw, 2.4rem)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#0f172a', lineHeight: 1, margin: '0 0 14px' }}>
          Happy Birthday
        </h2>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <div style={{ width: 36, height: 3, borderRadius: 999, background: 'linear-gradient(90deg, #c0392b, #f59e0b)' }} />
          <div style={{ width: 6, height: 3, borderRadius: 999, background: 'rgba(192,57,43,0.25)' }} />
        </div>

        <p style={{ fontSize: 18, fontWeight: 800, color: '#1e1b4b', marginBottom: 5, fontFamily: "'Lato', sans-serif", lineHeight: 1.2 }}>
          {officer.fullName}
        </p>
        <p style={{ fontSize: 11, fontWeight: 700, color: '#6b7280', marginBottom: 20, letterSpacing: '0.07em', textTransform: 'uppercase', fontFamily: "'Lato', sans-serif" }}>
          {rankAbbr} · BFP Station 1 – Cogon
        </p>


        <div style={{ width: '100%', height: 1, background: '#f0ece8', marginBottom: 20 }} />

        <p style={{ fontSize: 14, lineHeight: 1.95, color: '#4b5563', fontFamily: "'Lato', sans-serif" }}>
          On behalf of the entire team at <strong style={{ color: '#1e293b' }}>BFP Station 1 – Cogon</strong>, honors your dedication, leadership, and unwavering service. May the year ahead bring strength, wisdom, and fulfillment as you continue to serve with excellence.
        </p>

        <div style={{ marginTop: 'auto', paddingTop: 20, borderTop: '1px solid #f0ece8' }}>
          <p style={{ margin: 0, fontSize: 12, fontWeight: 700, color: '#334155', fontFamily: "'Lato', sans-serif" }}>Bureau of Fire Protection</p>
          <p style={{ margin: 0, fontSize: 11, color: '#94a3b8', fontFamily: "'Lato', sans-serif", marginTop: 2 }}>Station 1 · Cogon, Cagayan de Oro City</p>
        </div>
      </div>
    </div>
  );
}

// ─── Main Slideshow ───────────────────────────────────────────────────────────
export function WeeklyReportsSlideshow({ reports, onRegisterJump }) {
  const [currentIndex,     setCurrentIndex]     = useState(0);
  const [isAutoPlaying,    setIsAutoPlaying]    = useState(true);
  const [direction,        setDirection]        = useState(0);
  const [birthdayOfficers, setBirthdayOfficers] = useState([]);
  // Track whether any child lightbox is open — hides outer chevrons
  const [lightboxActive,   setLightboxActive]   = useState(false);
  const autoResumeRef = useRef(null);

  useEffect(() => {
    getOfficers()
      .then(data => setBirthdayOfficers(data.filter(o => isBirthday(o.birthdate))))
      .catch(err => console.error('Failed to load officers:', err));
  }, []);

  const birthdaySlides = birthdayOfficers.map(o => ({ id: `birthday-${o.id}`, type: 'birthday', officer: o }));
  const reportSlides   = reports.map(r => ({ id: r.id, type: 'report', report: r }));
  const allSlides      = [...birthdaySlides, ...reportSlides];
  const currentSlide   = allSlides[currentIndex] || null;

  const pauseTemporarily = useCallback(() => {
    setIsAutoPlaying(false);
    clearTimeout(autoResumeRef.current);
    autoResumeRef.current = setTimeout(() => setIsAutoPlaying(true), 6000);
  }, []);

  const goToSlide = useCallback((i) => {
    setDirection(i > currentIndex ? 1 : -1);
    setCurrentIndex(i);
    pauseTemporarily();
  }, [currentIndex, pauseTemporarily]);

  useEffect(() => {
    if (!onRegisterJump) return;
    const jumpToReportId = (reportId) => {
      const idx = allSlides.findIndex(s => s.type === 'report' && s.id === reportId);
      if (idx !== -1) goToSlide(idx);
    };
    onRegisterJump(jumpToReportId);
  }, [allSlides.length, goToSlide, onRegisterJump]);

  useEffect(() => { setCurrentIndex(0); }, [reports.length, birthdayOfficers.length]);

  useEffect(() => {
    if (!isAutoPlaying || allSlides.length === 0) return;
    const iv = setInterval(() => {
      setDirection(1);
      setCurrentIndex(p => (p + 1) % allSlides.length);
    }, SLIDE_DURATION);
    return () => clearInterval(iv);
  }, [isAutoPlaying, allSlides.length, currentIndex]);

  const goToPrev = useCallback(() => {
    setDirection(-1);
    setCurrentIndex(p => (p - 1 + allSlides.length) % allSlides.length);
    pauseTemporarily();
  }, [allSlides.length, pauseTemporarily]);

  const goToNext = useCallback(() => {
    setDirection(1);
    setCurrentIndex(p => (p + 1) % allSlides.length);
    pauseTemporarily();
  }, [allSlides.length, pauseTemporarily]);

  // Callback passed to ReportSlide to know when lightbox opens/closes
  const handleLightboxChange = useCallback((open) => {
    setLightboxActive(open);
  }, []);

  if (allSlides.length === 0) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 0', borderRadius: 12, background: 'white', border: '1.5px dashed #e0dbd5' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#9b9590', fontFamily: "'Lato', sans-serif" }}>No weekly reports available</div>
        <div style={{ fontSize: 12, marginTop: 6, color: '#c4b5b0', fontFamily: "'Lato', sans-serif" }}>Reports will appear once published by the admin</div>
      </div>
    );
  }

  const slideVariants = {
    enter:  (d) => ({ x: d > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { zIndex: 1, x: 0, opacity: 1 },
    exit:   (d) => ({ zIndex: 0, x: d < 0 ? '100%' : '-100%', opacity: 0 }),
  };

  return (
    <div style={{ fontFamily: "'Lato', sans-serif", borderRadius: 16, overflow: 'hidden', boxShadow: '0 8px 48px rgba(0,0,0,0.1)', border: '1px solid #e8e2dc' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Oswald:wght@400;500;600;700&family=Lato:ital,wght@0,300;0,400;0,700;0,900;1,400&display=swap');
        *, *::before, *::after { box-sizing: border-box; }
        .ss-nav-btn { transition: all 0.18s !important; }
        .ss-nav-btn:hover { background: linear-gradient(135deg, #c0392b, #e2711a) !important; color: white !important; border-color: transparent !important; box-shadow: 0 4px 16px rgba(192,57,43,0.38) !important; }
        .ss-play-btn:hover { background: rgba(0,0,0,0.07) !important; }
        @keyframes ssPulse { 0%,100%{opacity:1} 50%{opacity:0.55} }
      `}</style>

      {/* ── Header ── */}
      <div style={{ padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#ffffff', borderBottom: '1px solid #f0ece8' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 9, flexShrink: 0, background: 'linear-gradient(135deg, #7f1d1d, #c0392b)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 12px rgba(192,57,43,0.38)' }}>
            <span style={{ fontSize: 16 }}>📋</span>
          </div>
          <div>
            <p style={{ fontSize: 9, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#c0392b', marginBottom: 2, fontFamily: "'Lato', sans-serif" }}>Station Updates</p>
            <h2 style={{ fontFamily: "'Oswald', sans-serif", fontSize: '1.28rem', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#1a1614', lineHeight: 1, margin: 0 }}>Weekly Reports</h2>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {birthdayOfficers.length > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(30,27,75,0.06)', border: '1px solid rgba(91,33,182,0.2)', color: '#4338ca', borderRadius: 20, padding: '5px 14px', fontSize: 11, fontWeight: 700, letterSpacing: '0.04em', animation: 'ssPulse 2s ease-in-out infinite', fontFamily: "'Lato', sans-serif" }}>
              🎂 {birthdayOfficers.length} Birthday{birthdayOfficers.length > 1 ? 's' : ''} Today!
            </span>
          )}
          <span style={{ fontSize: 12, fontWeight: 700, padding: '5px 14px', borderRadius: 20, background: 'rgba(192,57,43,0.07)', border: '1px solid rgba(192,57,43,0.18)', color: '#c0392b', letterSpacing: '0.05em', fontFamily: "'Lato', sans-serif" }}>
            {currentIndex + 1} / {allSlides.length}
          </span>
          <button type="button" className="ss-play-btn"
            onClick={() => { setIsAutoPlaying(p => !p); clearTimeout(autoResumeRef.current); }}
            style={{ width: 34, height: 34, borderRadius: 8, background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.1)', color: '#6b6560', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'background 0.18s' }}>
            {isAutoPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
        </div>
      </div>

      {/* ── Slide area ── */}
      <div style={{ position: 'relative', overflow: 'hidden', height: '68vh', minHeight: 500 }}>
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentSlide?.id} custom={direction}
            variants={slideVariants} initial="enter" animate="center" exit="exit"
            transition={{ x: { type: 'spring', stiffness: 280, damping: 28 }, opacity: { duration: 0.18 } }}
            style={{ position: 'absolute', inset: 0 }}
          >
            {currentSlide?.type === 'birthday' && (
              <BirthdaySlide officer={currentSlide.officer} />
            )}
            {currentSlide?.type === 'report' && (
              <ReportSlide
                report={currentSlide.report}
                isAutoPlaying={isAutoPlaying}
                onLightboxChange={handleLightboxChange}
              />
            )}
          </motion.div>
        </AnimatePresence>

        {/* Outer nav chevrons — hidden when lightbox is active */}
        {allSlides.length > 1 && !lightboxActive && (
          <>
            <button type="button" className="ss-nav-btn" onClick={goToPrev}
              style={{ position: 'absolute', top: '50%', left: 14, zIndex: 30, transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: 22, background: 'rgba(255,255,255,0.96)', border: '1px solid rgba(0,0,0,0.11)', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 18px rgba(0,0,0,0.14)' }}>
              <ChevronLeft size={21} />
            </button>
            <button type="button" className="ss-nav-btn" onClick={goToNext}
              style={{ position: 'absolute', top: '50%', right: 14, zIndex: 30, transform: 'translateY(-50%)', width: 44, height: 44, borderRadius: 22, background: 'rgba(255,255,255,0.96)', border: '1px solid rgba(0,0,0,0.11)', color: '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 18px rgba(0,0,0,0.14)' }}>
              <ChevronRight size={21} />
            </button>
          </>
        )}

        {/* Slide dots */}
        {allSlides.length > 1 && allSlides.length <= 12 && !lightboxActive && (
          <div style={{ position: 'absolute', bottom: 12, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 5, zIndex: 10, pointerEvents: 'none' }}>
            {allSlides.map((_, i) => (
              <div key={i} style={{ width: i === currentIndex ? 20 : 5, height: 5, borderRadius: 999, background: i === currentIndex ? '#c0392b' : 'rgba(0,0,0,0.18)', boxShadow: i === currentIndex ? '0 0 8px rgba(192,57,43,0.5)' : 'none', transition: 'all 0.22s' }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}