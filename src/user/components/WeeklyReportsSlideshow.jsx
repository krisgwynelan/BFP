import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const CATEGORY_CONFIG = {
  Event:       { color: '#2563eb', bg: 'rgba(37,99,235,0.1)',   border: 'rgba(37,99,235,0.25)',   emoji: '📅' },
  Training:    { color: '#16a34a', bg: 'rgba(22,163,74,0.1)',   border: 'rgba(22,163,74,0.25)',   emoji: '🎯' },
  Advisory:    { color: '#d97706', bg: 'rgba(217,119,6,0.1)',   border: 'rgba(217,119,6,0.25)',   emoji: '📢' },
  Achievement: { color: '#7c3aed', bg: 'rgba(124,58,237,0.1)', border: 'rgba(124,58,237,0.25)', emoji: '🏆' },
};
const getCatConfig = (cat) => CATEGORY_CONFIG[cat] || { color: '#78716c', bg: 'rgba(120,113,108,0.08)', border: 'rgba(120,113,108,0.2)', emoji: '📄' };

// Helper: handle Firestore Timestamp OR string date
const formatDate = (date) => {
  if (!date) return '';
  const d = date?.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

export function WeeklyReportsSlideshow({ reports }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    if (!isAutoPlaying || reports.length === 0) return;
    const interval = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % reports.length);
    }, 10000);
    return () => clearInterval(interval);
  }, [isAutoPlaying, reports.length]);

  // Reset index if reports change (e.g. after Firebase load)
  useEffect(() => {
    setCurrentIndex(0);
  }, [reports.length]);

  const goToSlide = (index) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const goToPrevious = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + reports.length) % reports.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  const goToNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % reports.length);
    setIsAutoPlaying(false);
    setTimeout(() => setIsAutoPlaying(true), 5000);
  };

  if (reports.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 rounded-2xl"
        style={{ background: 'white', border: '1.5px dashed #f0d8d3' }}>
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
          style={{ background: 'rgba(192,57,43,0.06)', border: '1.5px dashed rgba(192,57,43,0.2)' }}>
          <svg className="w-8 h-8" fill="none" stroke="#d4b8b3" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        </div>
        <p className="font-semibold text-sm" style={{ color: '#a8a29e' }}>No weekly reports available</p>
        <p className="text-xs mt-1" style={{ color: '#c4b5b0' }}>Reports will appear here once published by the admin</p>
      </div>
    );
  }

  const currentReport = reports[currentIndex];
  if (!currentReport) return null;

  const catCfg = getCatConfig(currentReport.category);

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? 800 : -800, opacity: 0, scale: 0.95 }),
    center: { zIndex: 1, x: 0, opacity: 1, scale: 1 },
    exit: (dir) => ({ zIndex: 0, x: dir < 0 ? 800 : -800, opacity: 0, scale: 0.95 }),
  };

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .thumb-btn { transition: all 0.2s; }
        .thumb-btn.inactive { opacity: 0.45; filter: grayscale(30%); }
        .thumb-btn.inactive:hover { opacity: 0.85; filter: none; transform: translateY(-2px); }
        .thumb-btn.active { opacity: 1; transform: translateY(-3px); }
        .nav-arrow {
          width: 44px; height: 44px; border-radius: 50%;
          background: white; border: 1.5px solid #f0e8e5;
          display: flex; align-items: center; justify-content: center;
          color: #78716c; transition: all 0.18s; cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.07);
        }
        .nav-arrow:hover { background: #c0392b; border-color: #c0392b; color: white; transform: scale(1.08); box-shadow: 0 4px 14px rgba(192,57,43,0.3); }
      `}</style>

      <div className="rounded-2xl overflow-hidden"
        style={{ background: 'white', border: '1.5px solid #f0e8e5', boxShadow: '0 4px 30px rgba(0,0,0,0.06)' }}>

        {/* Section Header */}
        <div className="px-6 sm:px-8 pt-7 pb-5 flex items-center justify-between"
          style={{ borderBottom: '1.5px solid #f5ede9' }}>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-0.5" style={{ color: '#c0392b' }}>
              Station Updates
            </p>
            <h2 className="font-black leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.9rem', letterSpacing: '0.05em', color: '#1c1917' }}>
              Weekly Reports
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(192,57,43,0.07)', border: '1.5px solid rgba(192,57,43,0.15)', color: '#c0392b' }}>
              {currentIndex + 1} / {reports.length}
            </span>
          </div>
        </div>

        {/* Slide Area */}
        <div className="relative overflow-hidden" style={{ minHeight: '420px' }}>
          <AnimatePresence initial={false} custom={direction} mode="wait">
            <motion.div
              key={currentIndex}
              custom={direction}
              variants={slideVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ x: { type: 'spring', stiffness: 280, damping: 28 }, opacity: { duration: 0.25 }, scale: { duration: 0.25 } }}
              className="absolute inset-0"
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 h-full min-h-[420px]">
                {/* Image */}
                <div className="relative overflow-hidden" style={{ minHeight: '280px', background: '#f5f0ed' }}>
                  <img
                    src={currentReport.coverImage}
                    alt={currentReport.title}
                    className="w-full h-full object-cover"
                    style={{ transition: 'transform 6s ease', transform: 'scale(1.04)' }}
                  />
                  <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(28,25,23,0.55) 0%, transparent 55%)' }} />

                  <span className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold uppercase tracking-wide"
                    style={{ background: catCfg.bg, border: `1.5px solid ${catCfg.border}`, color: catCfg.color, backdropFilter: 'blur(8px)', backgroundColor: 'white' }}>
                    <span>{catCfg.emoji}</span>
                    {currentReport.category}
                  </span>

                  {/* Progress bar */}
                  <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: 'rgba(255,255,255,0.2)' }}>
                    <motion.div
                      className="h-full"
                      style={{ background: 'linear-gradient(90deg, #c0392b, #e67e22)' }}
                      initial={{ width: '0%' }}
                      animate={{ width: isAutoPlaying ? '100%' : '0%' }}
                      transition={{ duration: 10, ease: 'linear' }}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="flex flex-col justify-center p-7 sm:p-9" style={{ background: 'white' }}>
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar size={13} style={{ color: '#c4b5b0' }} />
                    <span className="text-xs font-semibold" style={{ color: '#a8a29e' }}>
                      {formatDate(currentReport.date)}
                    </span>
                  </div>

                  <h3 className="font-black leading-tight mb-4"
                    style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '0.04em', color: '#1c1917', lineHeight: 1.1 }}>
                    {currentReport.title}
                  </h3>

                  <div className="w-12 h-[3px] rounded-full mb-5"
                    style={{ background: 'linear-gradient(90deg, #c0392b, #e67e22)' }} />

                  <p className="text-sm leading-relaxed mb-6" style={{ color: '#57534e' }}>
                    {currentReport.description}
                  </p>

                  <div className="flex items-center gap-3 pt-4" style={{ borderTop: '1px solid #f5ede9' }}>
                    <Tag size={13} style={{ color: '#d4b8b3' }} />
                    <span className="text-xs font-semibold" style={{ color: '#a8a29e' }}>
                      BFP Station 1 — Cogon Update
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {reports.length > 1 && (
            <>
              <button onClick={goToPrevious} className="nav-arrow absolute left-4 top-1/2 -translate-y-1/2 z-10">
                <ChevronLeft size={20} />
              </button>
              <button onClick={goToNext} className="nav-arrow absolute right-4 top-1/2 -translate-y-1/2 z-10">
                <ChevronRight size={20} />
              </button>
            </>
          )}
        </div>

        {/* Thumbnails */}
        {reports.length > 1 && (
          <div className="px-6 py-5 overflow-x-auto" style={{ borderTop: '1.5px solid #f5ede9' }}>
            <div className="flex gap-3 pb-1">
              {reports.map((report, index) => {
                const tc = getCatConfig(report.category);
                const isActive = index === currentIndex;
                return (
                  <button
                    key={report.id}
                    onClick={() => goToSlide(index)}
                    className={`thumb-btn shrink-0 relative rounded-xl overflow-hidden ${isActive ? 'active' : 'inactive'}`}
                    style={{
                      width: '112px', height: '78px',
                      boxShadow: isActive ? `0 6px 20px rgba(192,57,43,0.25)` : 'none',
                      outline: isActive ? '2.5px solid #c0392b' : '2px solid transparent',
                      outlineOffset: '1px',
                    }}
                  >
                    <img src={report.coverImage} alt={report.title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0"
                      style={{ background: isActive ? 'linear-gradient(to top, rgba(192,57,43,0.35), transparent)' : 'linear-gradient(to top, rgba(0,0,0,0.45), transparent)' }} />
                    <span className="absolute bottom-1.5 left-1.5 right-1.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md text-center truncate"
                      style={{ background: tc.bg, color: tc.color, border: `1px solid ${tc.border}`, backdropFilter: 'blur(4px)', backgroundColor: 'rgba(255,255,255,0.88)' }}>
                      {report.category}
                    </span>
                    {isActive && (
                      <motion.div layoutId="slideActiveDot"
                        className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full border-2 border-white flex items-center justify-center"
                        style={{ background: '#c0392b' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 30 }}>
                        <motion.div className="w-1.5 h-1.5 bg-white rounded-full"
                          animate={{ scale: [1, 1.3, 1] }}
                          transition={{ duration: 1.2, repeat: Infinity }} />
                      </motion.div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="h-[3px]" style={{ background: 'linear-gradient(90deg, #c0392b, #e67e22, #f39c12)' }} />
      </div>
    </div>
  );
}