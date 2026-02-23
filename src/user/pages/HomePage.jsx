import { Link } from 'react-router';
import { getWeeklyReports } from '../../utils/storage';
import { useEffect, useState, useRef, useCallback } from 'react';
import {
  ArrowRight, Shield, Phone, ChevronDown,
  Flame, AlertTriangle, Users, Calendar,
  ChevronLeft, ChevronRight, Image as ImageIcon,
  Maximize2, X, ZoomIn,
} from 'lucide-react';
import Fire from '/Fire.jpg';
import { WeeklyReportsSlideshow } from '../components/WeeklyReportsSlideshow';

// ─── Config ───────────────────────────────────────────────────────────────────
const CATEGORY_CONFIG = {
  Event:       { color: '#2563eb', bg: '#eff6ff', border: '#bfdbfe', emoji: '📅' },
  Training:    { color: '#15803d', bg: '#f0fdf4', border: '#bbf7d0', emoji: '🎯' },
  Advisory:    { color: '#b45309', bg: '#fffbeb', border: '#fde68a', emoji: '📢' },
  Achievement: { color: '#7c3aed', bg: '#f5f3ff', border: '#ddd6fe', emoji: '🏆' },
  Birthday:    { color: '#be185d', bg: '#fdf2f8', border: '#fbcfe8', emoji: '🎂' },
};
const getCfg = (cat) =>
  CATEGORY_CONFIG[cat] || { color: '#57534e', bg: '#fafaf9', border: '#e7e5e4', emoji: '📄' };

const formatDate = (date) => {
  if (!date) return '';
  const d = date?.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

function getImages(r) {
  if (Array.isArray(r.images) && r.images.length > 0) return r.images;
  if (r.coverImage) return [r.coverImage];
  return [];
}

// ─── Lightbox ─────────────────────────────────────────────────────────────────
function CardLightbox({ images, startIndex, onClose }) {
  const [idx, setIdx]       = useState(startIndex);
  const [zoomed, setZoomed] = useState(false);
  const touchStart          = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape')     onClose();
      if (e.key === 'ArrowLeft')  setIdx(i => (i - 1 + images.length) % images.length);
      if (e.key === 'ArrowRight') setIdx(i => (i + 1) % images.length);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [images.length, onClose]);

  const onTouchStart = (e) => { touchStart.current = e.touches[0].clientX; };
  const onTouchEnd   = (e) => {
    if (touchStart.current === null) return;
    const diff = touchStart.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 50) setIdx(i => diff > 0 ? (i + 1) % images.length : (i - 1 + images.length) % images.length);
    touchStart.current = null;
  };

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(5,5,8,0.97)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
      onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
    >
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, padding: '16px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'linear-gradient(to bottom, rgba(0,0,0,0.88), transparent)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ padding: '4px 12px', borderRadius: 5, background: 'rgba(192,57,43,0.22)', border: '1px solid rgba(192,57,43,0.4)' }}>
            <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.88)' }}>Gallery</span>
          </div>
          {images.length > 1 && <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(255,255,255,0.36)' }}>{idx + 1} / {images.length}</span>}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" onClick={() => setZoomed(z => !z)}
            style={{ width: 38, height: 38, borderRadius: 8, background: zoomed ? 'rgba(192,57,43,0.5)' : 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.82)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <ZoomIn size={15} />
          </button>
          <button type="button" onClick={onClose}
            style={{ width: 38, height: 38, borderRadius: 8, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', color: 'rgba(255,255,255,0.82)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <X size={16} />
          </button>
        </div>
      </div>

      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '72px 48px 100px', width: '100%', position: 'relative' }}>
        <img src={images[idx]} alt="" draggable={false} onClick={() => setZoomed(z => !z)}
          style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 4, boxShadow: '0 32px 80px rgba(0,0,0,0.9)', transform: zoomed ? 'scale(1.5)' : 'scale(1)', transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)', cursor: zoomed ? 'zoom-out' : 'zoom-in', userSelect: 'none' }}
        />
        {images.length > 1 && !zoomed && (
          <>
            <button type="button" onClick={() => setIdx(i => (i - 1 + images.length) % images.length)}
              style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', width: 46, height: 46, borderRadius: 23, background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.14)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronLeft size={20} />
            </button>
            <button type="button" onClick={() => setIdx(i => (i + 1) % images.length)}
              style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', width: 46, height: 46, borderRadius: 23, background: 'rgba(255,255,255,0.09)', border: '1px solid rgba(255,255,255,0.14)', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.9), transparent)', padding: '18px 24px 24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
        {images.length > 1 && (
          <div style={{ display: 'flex', gap: 5 }}>
            {images.map((_, i) => (
              <button key={i} type="button" onClick={() => setIdx(i)}
                style={{ width: i === idx ? 20 : 6, height: 6, borderRadius: 999, border: 'none', padding: 0, cursor: 'pointer', background: i === idx ? '#c0392b' : 'rgba(255,255,255,0.25)', transition: 'all 0.22s', flexShrink: 0 }} />
            ))}
          </div>
        )}
        {images.length > 1 && (
          <div style={{ display: 'flex', gap: 6, overflowX: 'auto', maxWidth: '90%' }}>
            {images.map((src, i) => (
              <button key={i} type="button" onClick={() => setIdx(i)}
                style={{ width: 60, height: 42, borderRadius: 5, padding: 0, flexShrink: 0, overflow: 'hidden', border: i === idx ? '2px solid #c0392b' : '2px solid rgba(255,255,255,0.1)', opacity: i === idx ? 1 : 0.36, cursor: 'pointer', transition: 'all 0.22s', transform: i === idx ? 'scale(1.08)' : 'scale(1)', background: 'transparent' }}>
                <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Report Card ──────────────────────────────────────────────────────────────
function ReportCard({ report, onCardClick }) {
  const [imgIdx, setImgIdx]             = useState(0);
  const [hovered, setHovered]           = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const images = getImages(report);
  const cfg    = getCfg(report.category);

  const handleCardClick = () => {
    if (onCardClick) onCardClick(report.id);
  };

  return (
    <>
      {lightboxOpen && images.length > 0 && (
        <CardLightbox images={images} startIndex={imgIdx} onClose={() => setLightboxOpen(false)} />
      )}

      <div
        className="hm-report-card"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          background: 'white',
          borderRadius: 20,
          overflow: 'hidden',
          boxShadow: hovered ? '0 24px 64px rgba(0,0,0,0.16)' : '0 2px 16px rgba(0,0,0,0.07)',
          transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1), box-shadow 0.3s ease',
          transform: hovered ? 'translateY(-10px)' : 'translateY(0)',
          display: 'flex',
          flexDirection: 'column',
          cursor: 'pointer',
        }}
      >
        {/* Image area */}
        <div
          style={{ position: 'relative', height: 210, overflow: 'hidden', flexShrink: 0, background: cfg.bg, cursor: 'pointer' }}
          onClick={handleCardClick}
        >
          {images.length > 0 ? (
            <img
              src={images[imgIdx]}
              alt={report.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transition: 'transform 0.5s ease', transform: hovered ? 'scale(1.06)' : 'scale(1)' }}
            />
          ) : (
            <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 42, opacity: 0.28 }}>{cfg.emoji}</div>
          )}
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.05) 50%, transparent 100%)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', top: 12, left: 12, pointerEvents: 'none' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 12px', borderRadius: 20, background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(8px)', fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: cfg.color, boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }}>
              {cfg.emoji} {report.category}
            </span>
          </div>
          {images.length > 1 && (
            <div style={{ position: 'absolute', top: 12, right: 12, pointerEvents: 'none' }}>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 20, background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(8px)', fontSize: 9, fontWeight: 700, color: 'white' }}>
                <ImageIcon size={9} /> {images.length}
              </span>
            </div>
          )}
          <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '10px 14px 12px', pointerEvents: 'none' }}>
            <h3 style={{ fontSize: 14, fontWeight: 800, color: 'white', lineHeight: 1.3, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textShadow: '0 1px 6px rgba(0,0,0,0.6)' }}>
              {report.title}
            </h3>
          </div>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', opacity: hovered ? 1 : 0, transition: 'opacity 0.22s', pointerEvents: 'none', background: hovered ? 'rgba(0,0,0,0.1)' : 'transparent' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'rgba(192,57,43,0.85)', backdropFilter: 'blur(12px)', border: '2px solid rgba(255,255,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 20px rgba(192,57,43,0.5)' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><polyline points="8,21 12,17 16,21"/>
                </svg>
              </div>
              <span style={{ fontSize: 10, fontWeight: 800, color: 'white', letterSpacing: '0.1em', textTransform: 'uppercase', background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(6px)', padding: '3px 12px', borderRadius: 20 }}>
                View in Slideshow
              </span>
            </div>
          </div>
          {images.length > 1 && (
            <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 4, zIndex: 2 }}>
              {images.slice(0, 5).map((_, i) => (
                <button key={i} type="button"
                  onClick={(e) => { e.stopPropagation(); setImgIdx(i); }}
                  style={{ width: i === imgIdx ? 14 : 5, height: 5, borderRadius: 999, border: 'none', padding: 0, cursor: 'pointer', background: i === imgIdx ? 'white' : 'rgba(255,255,255,0.45)', transition: 'all 0.2s', flexShrink: 0 }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Info section */}
        <div
          style={{ padding: '14px 16px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 8, cursor: 'pointer' }}
          onClick={handleCardClick}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <Calendar size={11} style={{ color: '#c0392b' }} />
            <span style={{ fontSize: 11, fontWeight: 600, color: '#a8a29e' }}>{formatDate(report.date)}</span>
            <span style={{ marginLeft: 'auto', fontSize: 10, fontWeight: 700, color: '#c0392b', background: 'rgba(192,57,43,0.07)', padding: '2px 9px', borderRadius: 20 }}>BFP Cogon</span>
          </div>
          <p style={{ fontSize: 12, color: '#78716c', lineHeight: 1.75, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: 0, flex: 1 }}>
            {report.description}
          </p>
          {images.length > 1 ? (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setLightboxOpen(true); }}
              style={{
                marginTop: 4, width: '100%', padding: '10px 0', borderRadius: 10,
                background: 'linear-gradient(135deg, #c0392b 0%, #e67e22 100%)',
                color: 'white', border: 'none', fontSize: 11, fontWeight: 800,
                letterSpacing: '0.07em', textTransform: 'uppercase', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                boxShadow: '0 4px 16px rgba(192,57,43,0.28)', transition: 'opacity 0.18s',
              }}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.88'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}
            >
              <ImageIcon size={11} /> View {images.length} Photos
            </button>
          ) : (
            <div style={{ marginTop: 4, width: '100%', padding: '9px 0', borderRadius: 10, background: 'rgba(192,57,43,0.06)', border: '1.5px dashed rgba(192,57,43,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#c0392b" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><polyline points="8,21 12,17 16,21"/>
              </svg>
              <span style={{ fontSize: 11, fontWeight: 700, color: '#c0392b', letterSpacing: '0.05em' }}>View in Slideshow</span>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

// ─── Reports Carousel ─────────────────────────────────────────────────────────
function ReportsCarousel({ reports, onCardClick }) {
  const VISIBLE     = 3;
  const [offset, setOffset]       = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const autoRef = useRef(null);

  const total    = reports.length;
  const canCycle = total > VISIBLE;

  const advance = useCallback((dir) => {
    setOffset(o => ((o + dir) % total + total) % total);
  }, [total]);

  useEffect(() => {
    if (!isPlaying || !canCycle) return;
    autoRef.current = setInterval(() => advance(1), 30000);
    return () => clearInterval(autoRef.current);
  }, [isPlaying, canCycle, advance]);

  const pauseAndResume = (dir) => {
    clearInterval(autoRef.current);
    setIsPlaying(false);
    advance(dir);
    setTimeout(() => setIsPlaying(true), 8000);
  };

  const visible = Array.from({ length: Math.min(VISIBLE, total) }, (_, i) =>
    reports[(offset + i) % total]
  );

  if (total === 0) return null;

  if (!canCycle) {
    return (
      <div className="hm-carousel-grid" style={{ display: 'grid', gridTemplateColumns: `repeat(${total}, 1fr)`, gap: 22 }}>
        {reports.map(r => <ReportCard key={r.id} report={r} onCardClick={onCardClick} />)}
      </div>
    );
  }

  return (
    <div style={{ position: 'relative' }}>
      {/* Left arrow */}
      <button type="button" onClick={() => pauseAndResume(-1)}
        className="carousel-arr"
        style={{ position: 'absolute', left: -22, top: '42%', transform: 'translateY(-50%)', zIndex: 20, width: 46, height: 46, borderRadius: 23, background: 'white', border: '1.5px solid #e7e5e4', color: '#1c1917', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 22px rgba(0,0,0,0.12)', transition: 'all 0.2s' }}>
        <ChevronLeft size={18} />
      </button>

      {/* Cards */}
      <div className="hm-carousel-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 22 }}>
        {visible.map((r, i) => (
          <div key={`${r.id}-${offset}-${i}`}
            style={{ animation: `cardSlideIn 0.42s cubic-bezier(0.22,1,0.36,1) both`, animationDelay: `${i * 55}ms` }}>
            <ReportCard report={r} onCardClick={onCardClick} />
          </div>
        ))}
      </div>

      {/* Right arrow */}
      <button type="button" onClick={() => pauseAndResume(1)}
        className="carousel-arr"
        style={{ position: 'absolute', right: -22, top: '42%', transform: 'translateY(-50%)', zIndex: 20, width: 46, height: 46, borderRadius: 23, background: 'white', border: '1.5px solid #e7e5e4', color: '#1c1917', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 6px 22px rgba(0,0,0,0.12)', transition: 'all 0.2s' }}>
        <ChevronRight size={18} />
      </button>

      {/* Dots */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 30 }}>
        {reports.map((_, i) => {
          const isInView = visible.some(r => r.id === reports[i].id);
          return (
            <button key={i} type="button"
              onClick={() => {
                clearInterval(autoRef.current);
                setOffset(i);
                setIsPlaying(false);
                setTimeout(() => setIsPlaying(true), 8000);
              }}
              style={{
                width: isInView ? 22 : 7, height: 7, borderRadius: 999, border: 'none', padding: 0, cursor: 'pointer',
                background: isInView ? '#c0392b' : 'rgba(0,0,0,0.12)',
                boxShadow: isInView ? '0 0 12px rgba(192,57,43,0.45)' : 'none',
                transition: 'all 0.28s cubic-bezier(0.34,1.56,0.64,1)', flexShrink: 0,
              }}
            />
          );
        })}
      </div>

      <p style={{ textAlign: 'center', marginTop: 10, fontSize: 11, color: '#c4b5b0', fontWeight: 600, letterSpacing: '0.04em' }}>
        Showing {Math.min(VISIBLE, total)} of {total} reports
      </p>
    </div>
  );
}

// ─── HomePage ─────────────────────────────────────────────────────────────────
export function HomePage() {
  const [reports, setReports] = useState([]);
  const slideshowRef    = useRef(null);
  const jumpToReportRef = useRef(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getWeeklyReports();
        setReports(
          data.sort((a, b) => {
            const da = a.date?.toDate ? a.date.toDate() : new Date(a.date);
            const db = b.date?.toDate ? b.date.toDate() : new Date(b.date);
            return db - da;
          })
        );
      } catch (err) {
        console.error('Failed to load reports:', err);
      }
    };
    load();
  }, []);

  const handleCardClick = useCallback((reportId) => {
    if (slideshowRef.current) {
      slideshowRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    setTimeout(() => {
      if (jumpToReportRef.current) jumpToReportRef.current(reportId);
    }, 1200);
  }, []);

  return (
    <div id="home-root" style={{ fontFamily: "'DM Sans', sans-serif", background: '#fafaf9' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');

        #home-root *, #home-root *::before, #home-root *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes hm-pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }
        @keyframes hm-fadeUp   { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes hm-bounce   { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(8px)} }
        @keyframes cardSlideIn { from{opacity:0;transform:translateY(18px) scale(0.96)} to{opacity:1;transform:translateY(0) scale(1)} }

        #home-root .hm-f1 { animation: hm-fadeUp 0.9s ease 0.05s both }
        #home-root .hm-f2 { animation: hm-fadeUp 0.9s ease 0.20s both }
        #home-root .hm-f3 { animation: hm-fadeUp 0.9s ease 0.35s both }
        #home-root .hm-f4 { animation: hm-fadeUp 0.9s ease 0.50s both }
        #home-root .hm-f5 { animation: hm-fadeUp 0.9s ease 0.65s both }

        #home-root .hm-svc-card {
          background: white; border: 1.5px solid #e7e5e4; border-radius: 18px;
          padding: 28px 24px 24px; position: relative; overflow: hidden;
          transition: transform 0.26s, box-shadow 0.26s, border-color 0.26s;
        }
        #home-root .hm-svc-card::after {
          content: ''; position: absolute; bottom: 0; left: 0; right: 0; height: 3px;
          background: linear-gradient(90deg, #c0392b, #e67e22);
          transform: scaleX(0); transform-origin: left; transition: transform 0.3s;
        }
        #home-root .hm-svc-card:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(0,0,0,0.08); border-color: #d6d3d1 }
        #home-root .hm-svc-card:hover::after { transform: scaleX(1) }

        #home-root .carousel-arr:hover {
          background: linear-gradient(135deg, #c0392b, #e67e22) !important;
          color: white !important;
          border-color: transparent !important;
          box-shadow: 0 8px 24px rgba(192,57,43,0.38) !important;
        }

        /* ── Tablet (≤ 900px) ── */
        @media (max-width: 900px) {
          #home-root .hm-svc-grid { grid-template-columns: 1fr 1fr !important; }
          #home-root .hm-carousel-grid { grid-template-columns: 1fr 1fr !important; }
          #home-root .hm-hero-content { padding: 0 1.25rem 7rem !important; padding-top: 7rem !important; }
          #home-root .hm-cta-banner-inner { flex-direction: column !important; align-items: flex-start !important; }
          #home-root .hm-cta-banner-stats { border-left: none !important; border-top: 1px solid #ece6e0 !important; padding-top: 16px !important; margin-top: 8px !important; }
          #home-root .carousel-arr { display: none !important; }
          #home-root .hm-carousel-wrap { padding: 0 !important; }
        }

        /* ── Mobile (≤ 640px) ── */
        @media (max-width: 640px) {
          #home-root .hm-svc-grid { grid-template-columns: 1fr !important; }
          #home-root .hm-carousel-grid { grid-template-columns: 1fr !important; }
          #home-root .hm-hero-badges { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; }
          #home-root .hm-hero-btns { flex-direction: column !important; }
          #home-root .hm-hero-btns a { justify-content: center !important; }
          #home-root .hm-hero-stats { gap: 8px !important; }
          #home-root .hm-hero-stats > div { padding: 12px 14px !important; }
          #home-root .hm-updates-section { padding: 48px 1.25rem 60px !important; }
          #home-root .hm-services-section { padding-top: 60px !important; padding-bottom: 72px !important; }
          #home-root .hm-reports-header { flex-direction: column !important; align-items: flex-start !important; }
        }

        /* ── Small mobile (≤ 400px) ── */
        @media (max-width: 400px) {
          #home-root .hm-hero-stats { flex-wrap: wrap !important; }
          #home-root .hm-hero-stats > div { flex: 1 1 calc(50% - 8px) !important; }
        }
      `}</style>

      {/* ══ HERO ══ */}
      <section style={{ position: 'relative', minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', overflow: 'hidden' }}>
        <img src={Fire} alt="BFP Station 1 Cogon" style={{ position: 'absolute', inset: 0, width: '100%', height: '85%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(6,2,1,0.96) 0%,rgba(10,3,2,0.72) 35%,rgba(0,0,0,0.25) 100%)' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(108deg,rgba(6,2,1,0.7) 0%,transparent 52%)' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: 'linear-gradient(to bottom,#c0392b 0%,#e67e22 55%,transparent 100%)', opacity: 0.9 }} />

        <div className="hm-hero-content" style={{ position: 'relative', zIndex: 10, maxWidth: 1280, margin: '0 auto', padding: '0 2.5rem 10rem', paddingTop: '9rem', width: '100%' }}>
          <div style={{ maxWidth: 700 }}>
            <div className="hm-f1 hm-hero-badges" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 30, flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 7, padding: '6px 15px', borderRadius: 999, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'white' }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', animation: 'hm-pulseDot 2s ease-in-out infinite', flexShrink: 0 }} />
                Station Operational · 24/7
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 15px', borderRadius: 999, background: 'rgba(192,57,43,0.3)', border: '1px solid rgba(192,57,43,0.5)', backdropFilter: 'blur(12px)', fontSize: 11, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'white' }}>
                <Shield size={11} /> BFP Station 1 · Cogon
              </span>
            </div>

            <h1 className="hm-f2" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(3.2rem,9vw,7rem)', letterSpacing: '0.04em', lineHeight: 0.9, color: 'white', marginBottom: 22 }}>
              COGON<br /><span style={{ color: '#e8662a' }}>FIRE STATION</span>
            </h1>

            <p className="hm-f3" style={{ fontSize: '1rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, marginBottom: 3, fontWeight: 500 }}>
              Capt. Vicente Roa, Brgy. 33, Cagayan De Oro City
            </p>
            <p className="hm-f3" style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.45)', lineHeight: 1.85, maxWidth: 500, marginBottom: 38 }}>
              Committed to preventing and suppressing destructive fires, safeguarding lives and properties,
              and promoting fire safety awareness throughout Cagayan de Oro City.
            </p>

            <div className="hm-f4 hm-hero-btns" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 42 }}>
              <Link to="/about" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontWeight: 700, fontSize: 13, padding: '13px 26px', borderRadius: 12, background: 'linear-gradient(135deg,#c0392b,#e64a11)', color: 'white', textDecoration: 'none', boxShadow: '0 6px 28px rgba(192,57,43,0.48)', letterSpacing: '0.02em' }}>
                About Us <ArrowRight size={14} />
              </Link>
              <a href="tel:911" style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontWeight: 700, fontSize: 13, padding: '13px 26px', borderRadius: 12, background: 'rgba(255,255,255,0.08)', border: '1.5px solid rgba(255,255,255,0.26)', color: 'white', textDecoration: 'none', backdropFilter: 'blur(12px)', letterSpacing: '0.02em' }}>
                <Phone size={13} /> Emergency: 911
              </a>
            </div>

            <div className="hm-f5 hm-hero-stats" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
              {[
                { value: '24/7', label: 'Response' },
                { value: '911',  label: 'Emergency' },
                { value: '25+',  label: 'Barangays' },
                { value: '1990', label: 'Established' },
              ].map(({ value, label }) => (
                <div key={label} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(12px)', borderRadius: 14, padding: '14px 20px', textAlign: 'center' }}>
                  <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.5rem', letterSpacing: '0.06em', color: 'white', lineHeight: 1 }}>{value}</p>
                  <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'rgba(255,255,255,0.42)', marginTop: 4 }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ position: 'absolute', bottom: 26, left: '50%', animation: 'hm-bounce 2.4s ease-in-out infinite' }}>
          <ChevronDown size={22} style={{ color: 'rgba(255,255,255,0.3)' }} />
        </div>
      </section>

      {/* ══ WEEKLY UPDATES ══ */}
      <section className="hm-updates-section" style={{ background: '#f5f3f0', borderTop: '1px solid #e7e5e4' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '72px 2.5rem 88px' }}>

          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
              <span style={{ display: 'inline-block', width: 30, height: 2.5, background: 'linear-gradient(90deg,#c0392b,#e67e22)', borderRadius: 2 }} />
              <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.28em', color: '#c0392b', margin: 0 }}>
                Latest From The Station
              </p>
              <span style={{ display: 'inline-block', width: 30, height: 2.5, background: 'linear-gradient(90deg,#e67e22,#c0392b)', borderRadius: 2 }} />
            </div>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2.4rem,4.5vw,3.4rem)', letterSpacing: '0.06em', color: '#1c1917', lineHeight: 1, marginBottom: 12 }}>
              Weekly Updates
            </h2>
            <p style={{ fontSize: 13.5, color: '#a8a29e', fontWeight: 500, maxWidth: 420, margin: '0 auto', lineHeight: 1.75 }}>
              Station bulletins, events, training highlights, and team milestones
            </p>
          </div>

          <div ref={slideshowRef}>
            {reports.length > 0 ? (
              <WeeklyReportsSlideshow
                reports={reports}
                onRegisterJump={(fn) => { jumpToReportRef.current = fn; }}
              />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '72px 2rem', borderRadius: 20, border: '1.5px dashed #e7e5e4', background: 'white' }}>
                <div style={{ width: 56, height: 56, borderRadius: 14, background: '#fff7ed', border: '1.5px dashed #fed7aa', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                  <Flame size={22} style={{ color: '#c0392b' }} />
                </div>
                <p style={{ fontWeight: 600, fontSize: 14, color: '#78716c' }}>No updates yet</p>
                <p style={{ fontSize: 12, color: '#a8a29e', marginTop: 4 }}>Updates will appear once published by the admin</p>
              </div>
            )}
          </div>

          {reports.length > 0 && (
            <div style={{ marginTop: 60 }}>
              <div className="hm-reports-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 4, height: 26, borderRadius: 2, background: 'linear-gradient(to bottom, #c0392b, #e67e22)' }} />
                  <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.65rem', letterSpacing: '0.05em', color: '#1c1917', lineHeight: 1 }}>
                    All Reports
                  </h3>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#c0392b', padding: '5px 16px', borderRadius: 20, background: 'rgba(192,57,43,0.07)', border: '1px solid rgba(192,57,43,0.16)' }}>
                  {reports.length} total
                </span>
              </div>

              <div className="hm-carousel-wrap" style={{ padding: '0 30px' }}>
                <ReportsCarousel reports={reports} onCardClick={handleCardClick} />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══ CORE SERVICES ══ */}
      <section className="hm-services-section" style={{ background: 'white', borderTop: '1px solid #ece6e0', paddingTop: 92, paddingBottom: 100 }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.25rem' }}>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', marginBottom: 60 }}>
            <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.24em', color: '#c0392b', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ display: 'inline-block', width: 24, height: 2, background: '#c0392b', borderRadius: 2 }} />
              What We Do
              <span style={{ display: 'inline-block', width: 24, height: 2, background: '#c0392b', borderRadius: 2 }} />
            </p>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2rem,4vw,2.8rem)', letterSpacing: '0.05em', color: '#1a1714', lineHeight: 1, marginBottom: 10 }}>
              Our Core Services
            </h2>
            <p style={{ fontSize: 13.5, color: '#7a726e', lineHeight: 1.8, maxWidth: 500 }}>
              BFP Station 1 — Cogon serves residents and businesses with trained personnel,
              modern equipment, and an unwavering commitment to public safety.
            </p>
          </div>

          <div className="hm-svc-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
            {[
              { icon: <Flame size={24} />,         num: '01', title: 'Fire Prevention & Inspection', desc: 'Systematic fire safety inspections of residential, commercial, and industrial establishments to identify and eliminate hazards before they escalate.',     tag: 'Prevention First', accent: '#c0392b', aBg: 'rgba(192,57,43,0.07)',  aBorder: 'rgba(192,57,43,0.15)' },
              { icon: <AlertTriangle size={24} />, num: '02', title: '24/7 Emergency Response',        desc: 'Round-the-clock standby response for all fire emergencies, with rapid dispatch and professionally trained suppression teams.',                        tag: 'Always Ready',    accent: '#b45309', aBg: 'rgba(180,83,9,0.07)',   aBorder: 'rgba(180,83,9,0.15)' },
              { icon: <Users size={24} />,          num: '03', title: 'Fire Safety Education',         desc: 'Community outreach, school drills, and business training programs designed to build a fire-safe culture across Cagayan de Oro City.',                 tag: 'Community First', accent: '#1e4d8c', aBg: 'rgba(30,77,140,0.07)',  aBorder: 'rgba(30,77,140,0.14)' },
            ].map(({ icon, num, title, desc, tag, accent, aBg, aBorder }) => (
              <div key={title} className="hm-svc-card">
                <div style={{ position: 'absolute', top: 16, right: 20, fontFamily: "'Bebas Neue', sans-serif", fontSize: '4.5rem', letterSpacing: '0.02em', color: 'rgba(0,0,0,0.035)', lineHeight: 1, userSelect: 'none', pointerEvents: 'none' }}>{num}</div>
                <div style={{ width: 52, height: 52, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: aBg, border: `1.5px solid ${aBorder}`, color: accent, marginBottom: 20 }}>{icon}</div>
                <h3 style={{ fontSize: 15.5, fontWeight: 700, color: '#1a1714', marginBottom: 10, lineHeight: 1.35 }}>{title}</h3>
                <p style={{ fontSize: 13, lineHeight: 1.82, color: '#7a726e', marginBottom: 24 }}>{desc}</p>
                <span style={{ display: 'inline-block', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em', padding: '4px 13px', borderRadius: 999, background: aBg, border: `1.5px solid ${aBorder}`, color: accent }}>{tag}</span>
              </div>
            ))}
          </div>

          {/* CTA Banner */}
          <div style={{ marginTop: 44, borderRadius: 18, overflow: 'hidden', background: 'white', border: '1px solid #e8e2dc', position: 'relative', boxShadow: '0 8px 40px rgba(0,0,0,0.06)' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg,#8b1a0e,#c0392b,#e67e22)' }} />
            <div style={{ position: 'absolute', right: -8, top: '50%', transform: 'translateY(-50%)', fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(5rem, 14vw, 12rem)', lineHeight: 1, color: 'rgba(192,57,43,0.038)', pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap' }}>BFP</div>
            <div className="hm-cta-banner-inner" style={{ position: 'relative', zIndex: 1, padding: '36px 44px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 22, flex: 1, minWidth: 220 }}>
                <div style={{ width: 62, height: 62, borderRadius: 16, background: 'linear-gradient(135deg,#8b1a0e,#c0392b)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 8px 24px rgba(192,57,43,0.3)', flexShrink: 0 }}>
                  <Flame size={27} style={{ color: 'white' }} />
                </div>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#c0392b', marginBottom: 5 }}>Bureau of Fire Protection</p>
                  <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(1.3rem,2.5vw,1.9rem)', letterSpacing: '0.04em', color: '#1a1714', lineHeight: 1, marginBottom: 6 }}>
                    Lingkod Bayan, Ipaglaban ang Kaligtasan
                  </h3>
                  <p style={{ fontSize: 12, color: '#b0aaa6', fontWeight: 500 }}>BFP Station 1 · Cogon · Cagayan de Oro City · Region X</p>
                </div>
              </div>
              <div className="hm-cta-banner-stats" style={{ display: 'flex', flexShrink: 0 }}>
                {[
                  { label: 'Established', value: '1990',     icon: '📅' },
                  { label: 'Coverage',    value: '25+ Brgy.', icon: '📍' },
                  { label: 'Response',    value: '24 / 7',   icon: '🚒' },
                ].map(({ label, value, icon }, i) => (
                  <div key={label} style={{ textAlign: 'center', padding: '12px 20px', borderLeft: i > 0 ? '1px solid #ece6e0' : 'none' }}>
                    <span style={{ fontSize: 14, display: 'block', marginBottom: 3 }}>{icon}</span>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem', letterSpacing: '0.06em', color: '#c0392b', lineHeight: 1, display: 'block' }}>{value}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#b0aaa6', marginTop: 2, display: 'block' }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}