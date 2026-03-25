import { Link } from 'react-router';
import { getWeeklyReports, getOfficers } from '../../utils/storage';
import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowRight, Shield, Phone,
  Flame, AlertTriangle, Users,
  X, Eye, Tag,
} from 'lucide-react';
import Fire from '/Fire.jpg';
import { WeeklyReportsSlideshow } from '../components/WeeklyReportsSlideshow';

// ─── Design Tokens ────────────────────────────────────────────────────────────
const D = {
  bg0:   '#F8F5F1',
  bg1:   '#FFFFFF',
  bg2:   '#F2EDE7',
  bg3:   '#E8E0D6',
  br:    'rgba(100,60,20,0.12)',
  brMd:  'rgba(100,60,20,0.22)',
  hi:    '#1C110A',
  mid:   '#5C3A1E',
  lo:    '#9A7A5C',
  red:   '#C41E00',
  redDk: '#8A1400',
  redLt: '#E8340A',
  ora:   '#D95408',
  amb:   '#A87800',
};

const getCategoryBg = (category) => {
  switch (category) {
    case 'Event':       return '#2563EB';
    case 'Training':    return '#16A34A';
    case 'Advisory':    return '#D97706';
    case 'Achievement': return '#7C3AED';
    case 'Birthday':    return '#DB2777';
    default:            return '#6B7280';
  }
};

function getImages(r) {
  if (Array.isArray(r.images) && r.images.length > 0) return r.images;
  if (r.coverImage) return [r.coverImage];
  return [];
}

// ─── Birthday helpers ─────────────────────────────────────────────────────────
const RANKS = {
  'Chief Fire Officer':'CFO','Chief Fire Inspector':'CFI',
  'Senior Fire Inspector':'SFInsp','Fire Inspector':'FInsp',
  'Senior Fire Officer III':'SFO3','Senior Fire Officer II':'SFO2',
  'Senior Fire Officer I':'SFO1','Fire Officer III':'FO3',
  'Fire Officer II':'FO2','Fire Officer I':'FO1',
};
const isBday = (s) => {
  try { const t=new Date(),b=new Date(s); return t.getMonth()===b.getMonth()&&t.getDate()===b.getDate(); }
  catch { return false; }
};
const getAge = (s) => {
  try {
    const t=new Date(),b=new Date(s); let a=t.getFullYear()-b.getFullYear();
    if(t.getMonth()<b.getMonth()||(t.getMonth()===b.getMonth()&&t.getDate()<b.getDate()))a--;
    return a;
  } catch { return null; }
};

// ─── Confetti ─────────────────────────────────────────────────────────────────
const CONF_C = ['#FDE68A','#F472B6','#DB2777','#FBCFE8','#ffffff','#FCA5A5','#A78BFA'];
function BirthdayConfetti({ active }) {
  const cv = useRef(null), raf = useRef(null), ps = useRef([]);
  useEffect(() => {
    if (!active) {
      cancelAnimationFrame(raf.current); ps.current = [];
      const c = cv.current; if (c) c.getContext('2d').clearRect(0,0,c.width,c.height);
      return;
    }
    const canvas = cv.current; if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight;
    const spawn = (n) => { for (let i=0;i<n;i++) ps.current.push({ x:canvas.width*.5+(Math.random()-.5)*canvas.width*.9, y:canvas.height*.15, vx:(Math.random()-.5)*14, vy:-(Math.random()*12+5), c:CONF_C[Math.floor(Math.random()*CONF_C.length)], sz:Math.random()*7+3, rot:Math.random()*Math.PI*2, rs:(Math.random()-.5)*.18, life:1, dc:.006+Math.random()*.004, g:.22+Math.random()*.1 }); };
    spawn(130); const t1=setTimeout(()=>spawn(80),600);
    const loop=()=>{ ctx.clearRect(0,0,canvas.width,canvas.height); ps.current=ps.current.filter(p=>p.life>0); ps.current.forEach(p=>{ p.vy+=p.g; p.x+=p.vx; p.y+=p.vy; p.rot+=p.rs; p.life-=p.dc; ctx.save(); ctx.globalAlpha=Math.max(0,p.life); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.fillStyle=p.c; ctx.fillRect(-p.sz/2,-p.sz/4,p.sz,p.sz/2); ctx.restore(); }); raf.current=requestAnimationFrame(loop); };
    loop(); return ()=>{ cancelAnimationFrame(raf.current); clearTimeout(t1); };
  }, [active]);
  return <canvas ref={cv} style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:5 }} />;
}

// ─── Birthday Featured Slide ──────────────────────────────────────────────────
function BirthdayFeaturedSlide({ officer }) {
  const abbr = RANKS[officer.rank] || officer.rank || '';
  const age  = getAge(officer.birthdate);
  const ini  = (officer.fullName||' ').split(' ').filter(Boolean).map(n=>n[0]).slice(0,2).join('').toUpperCase();
  const [conf, setConf] = useState(true);
  useEffect(()=>{ setConf(true); const t=setTimeout(()=>setConf(false),6000); return()=>clearTimeout(t); },[officer.id]);

  return (
    <div style={{ position:'absolute', inset:0, overflow:'hidden', display:'flex' }}>
      <BirthdayConfetti active={conf}/>
      <div style={{ flex:'0 0 55%', position:'relative', background:'#0B1120', overflow:'hidden' }}>
        <div style={{ position:'absolute', inset:0, background:'radial-gradient(ellipse at center 80%, rgba(196,30,0,0.22) 0%, rgba(11,17,32,0) 70%)', zIndex:1, pointerEvents:'none' }}/>
        {officer.profileImage ? (
          <img src={officer.profileImage} alt={officer.fullName} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'contain', objectPosition:'center bottom', display:'block', zIndex:2 }} />
        ) : (
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', zIndex:2 }}>
            <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(6rem,12vw,10rem)', fontWeight:900, color:'rgba(255,255,255,0.06)', letterSpacing:'-.04em', userSelect:'none', lineHeight:1 }}>{ini}</span>
          </div>
        )}
        <div style={{ position:'absolute', top:0, right:0, bottom:0, width:60, background:'linear-gradient(to right, transparent, #0B1120)', zIndex:3, pointerEvents:'none' }}/>
      </div>
      <div style={{ flex:1, background:'#0B1120', display:'flex', flexDirection:'column', justifyContent:'center', padding:'28px 32px 28px 24px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:'-10px', bottom:'-20px', fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(5rem,9vw,8rem)', fontWeight:900, color:'rgba(255,255,255,0.03)', letterSpacing:'-.04em', userSelect:'none', pointerEvents:'none', lineHeight:1 }}>{ini}</div>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg, #FBBF24 0%, #FDE68A 50%, #F59E0B 100%)' }}/>
        <div style={{ position:'absolute', top:14, right:16, display:'flex', gap:8, zIndex:4 }}>
          <span style={{ fontSize:22, filter:'drop-shadow(0 2px 8px rgba(0,0,0,0.5))', animation:'bday-float 3s ease-in-out infinite' }}>🎂</span>
          <span style={{ fontSize:18, animation:'bday-float 3.4s ease-in-out infinite .5s' }}>🎉</span>
          <span style={{ fontSize:15, animation:'bday-float 2.8s ease-in-out infinite 1s' }}>🎈</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:14, flexWrap:'wrap' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'3px 10px 3px 8px', borderRadius:999, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)' }}>
            <span style={{ fontSize:11 }}>🎂</span>
            <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:9, letterSpacing:'.22em', textTransform:'uppercase', color:'rgba(255,255,255,0.6)' }}>Birthday Celebrant</span>
          </div>
          {abbr && (
            <div style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 10px', borderRadius:999, background:'rgba(251,191,36,0.12)', border:'1px solid rgba(251,191,36,0.35)' }}>
              <Shield size={8} style={{ color:'#FBBF24' }}/>
              <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:10, letterSpacing:'.16em', textTransform:'uppercase', color:'#FDE68A' }}>{abbr}</span>
            </div>
          )}
          {age !== null && (
            <div style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'3px 10px', borderRadius:999, background:'rgba(244,114,182,0.1)', border:'1px solid rgba(244,114,182,0.25)' }}>
              <span style={{ fontSize:10 }}>🎈</span>
              <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:10, letterSpacing:'.14em', textTransform:'uppercase', color:'#F9A8D4' }}>Turning {age}</span>
            </div>
          )}
        </div>
        <p style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'clamp(0.75rem,1.3vw,1rem)', letterSpacing:'.28em', textTransform:'uppercase', color:'rgba(255,255,255,0.45)', marginBottom:4 }}>✨ Happy Birthday</p>
        <h3 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(1.6rem,3.2vw,2.8rem)', letterSpacing:'.04em', lineHeight:0.95, marginBottom:10,
          background:'linear-gradient(90deg, #fff 0%, #FDE68A 35%, #FBBF24 65%, #F59E0B 100%)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          filter:'drop-shadow(0 2px 16px rgba(251,191,36,0.4))'
        }}>{officer.fullName}</h3>
        {officer.rank && (
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14 }}>
            <div style={{ width:3, height:24, borderRadius:2, background:'linear-gradient(to bottom,#FBBF24,#F472B6)', flexShrink:0 }}/>
            <div>
              <p style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:8, fontWeight:700, letterSpacing:'.24em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', marginBottom:2 }}>Rank</p>
              <p style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:12, fontWeight:800, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.85)', lineHeight:1 }}>{officer.rank}</p>
            </div>
          </div>
        )}
        <div style={{ height:1, background:'rgba(255,255,255,0.07)', marginBottom:12 }}/>
        <p style={{ fontFamily:"'Barlow',sans-serif", fontStyle:'italic', fontSize:12, color:'rgba(255,255,255,0.4)', lineHeight:1.7 }}>
          On behalf of all officers and personnel of BFP Station 1 – Cogon, we extend our warmest felicitations and deepest gratitude for your unwavering dedication and service.
        </p>
        <div style={{ display:'flex', alignItems:'center', gap:6, marginTop:16 }}>
          <Shield size={10} style={{ color:'rgba(255,255,255,0.2)', flexShrink:0 }}/>
          <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:9, fontWeight:700, letterSpacing:'.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.2)' }}>BFP Station 1 · Cogon · CDO</span>
        </div>
      </div>
    </div>
  );
}

// ─── Service Card ─────────────────────────────────────────────────────────────
function ServiceCard({ icon, number, title, description, tag, accent, accentBg, accentBorder }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '28px 24px 24px', position: 'relative', overflow: 'hidden',
        transition: 'background .28s', background: hovered ? `${accent}07` : 'transparent',
        height: '100%', display: 'flex', flexDirection: 'column',
      }}
    >
      <div style={{ position:'absolute', top:4, right:12, fontFamily:"'Barlow Condensed',sans-serif", fontSize:'5.5rem', fontWeight:900, color:hovered ? `${accent}16` : 'rgba(0,0,0,.04)', lineHeight:1, userSelect:'none', pointerEvents:'none', letterSpacing:'-0.03em', transition:'color .3s, transform .3s', transform: hovered ? 'translateY(-6px)' : 'none' }}>
        {number}
      </div>
      <div style={{ width:46, height:46, borderRadius:12, display:'flex', alignItems:'center', justifyContent:'center', background:hovered ? accent : accentBg, border:`1.5px solid ${hovered ? 'transparent' : accentBorder}`, color:hovered ? 'white' : accent, marginBottom:18, transition:'all .35s cubic-bezier(.34,1.56,.64,1)', transform:hovered ? 'scale(1.14) rotate(-6deg)' : 'scale(1) rotate(0)', boxShadow:hovered ? `0 10px 26px ${accent}44` : 'none', flexShrink:0 }}>
        {icon}
      </div>
      <h3 style={{ fontSize:16, fontWeight:700, lineHeight:1.3, color:hovered ? accent : D.hi, marginBottom:10, fontFamily:"'Barlow',sans-serif", transition:'color .25s' }}>
        {title}
      </h3>
      <p style={{ fontSize:13, lineHeight:1.8, color:'#6B6258', marginBottom:20, fontFamily:"'Barlow',sans-serif", fontWeight:400, flex:1 }}>
        {description}
      </p>
      <span style={{ display:'inline-flex', alignItems:'center', fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'.13em', padding:'6px 14px', borderRadius:5, background:hovered ? accent : accentBg, border:`1.5px solid ${hovered ? 'transparent' : accentBorder}`, color:hovered ? 'white' : accent, fontFamily:"'Barlow Condensed',sans-serif", transition:'all .28s', alignSelf:'flex-start', boxShadow:hovered ? `0 5px 14px ${accent}44` : 'none' }}>
        {tag}
      </span>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, height:3, background:`linear-gradient(90deg,${accent},${accent}88,transparent)`, transform:hovered ? 'scaleX(1)' : 'scaleX(0)', transformOrigin:'left', transition:'transform .38s ease' }} />
    </div>
  );
}

// ─── Slideshow Portal ─────────────────────────────────────────────────────────
function SlideshowPortal({ open, onClose, reports, jumpToReportRef }) {
  if (!open) return null;
  return createPortal(
    <>
      <div style={{ position:'fixed', inset:0, zIndex:100000 }}>
        <WeeklyReportsSlideshow reports={reports} onRegisterJump={fn => { jumpToReportRef.current = fn; }} />
      </div>
      <button type="button" onClick={onClose}
        style={{ position:'fixed', top:14, right:18, zIndex:100001, display:'flex', alignItems:'center', gap:6, padding:'8px 16px', borderRadius:7, background:'rgba(255,255,255,.92)', backdropFilter:'blur(14px)', border:'1px solid rgba(100,60,20,.18)', color:D.mid, cursor:'pointer', fontSize:12, fontWeight:800, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'.1em', textTransform:'uppercase', boxShadow:'0 4px 20px rgba(0,0,0,.12)', transition:'all .22s' }}
        onMouseEnter={e => { e.currentTarget.style.background = D.red; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'transparent'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.92)'; e.currentTarget.style.color = D.mid; e.currentTarget.style.borderColor = 'rgba(100,60,20,.18)'; }}
      >
        <X size={12} /> Close Slideshow
      </button>
    </>,
    document.body
  );
}

// ─── Weekly Updates Slideshow — full-bleed, no chevrons, white thumbnail strip ─
function WeeklyUpdatesSlideshow({ reports, onOpenSlideshow }) {
  const [currentIdx,    setCurrentIdx]    = useState(0);
  const [prevIdx,       setPrevIdx]       = useState(null);
  const [transitioning, setTransitioning] = useState(false);
  const autoRef  = useRef(null);
  const stripRef = useRef(null);
  const THUMB_H  = 88;

  const allSlides = reports.flatMap(r =>
    getImages(r).map((img) => ({ img, report: r }))
  );
  const total = allSlides.length;

  const goTo = useCallback((idx) => {
    if (idx === currentIdx || transitioning) return;
    setTransitioning(true);
    setPrevIdx(currentIdx);
    setCurrentIdx(idx);
    setTimeout(() => { setPrevIdx(null); setTransitioning(false); }, 600);
  }, [currentIdx, transitioning]);

  const next = useCallback(() => goTo((currentIdx + 1) % total), [goTo, currentIdx, total]);

  const resetAuto = useCallback(() => {
    clearInterval(autoRef.current);
    if (total < 2) return;
    autoRef.current = setInterval(next, 10000);
  }, [next, total]);

  useEffect(() => { resetAuto(); return () => clearInterval(autoRef.current); }, [resetAuto]);

  useEffect(() => {
    if (!stripRef.current || total === 0) return;
    const container = stripRef.current;
    const target = currentIdx * (THUMB_H + 8) - (container.clientHeight / 2) + THUMB_H / 2;
    container.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
  }, [currentIdx, total]);

  if (total === 0) return null;

  const current  = allSlides[currentIdx];
  const catColor = getCategoryBg(current.report.category);
  const progress = ((currentIdx + 1) / total) * 100;
  const DOT_LIMIT = 14;

  return (
    <div style={{
      display: 'flex',
      height: 650,
      overflow: 'hidden',
      background: '#000',
    }}>

      {/* ── LEFT: full-bleed image panel ── */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>

        {/* Outgoing image */}
        {prevIdx !== null && (
          <img
            src={allSlides[prevIdx].img}
            alt=""
            style={{
              position: 'absolute',
              inset: 0,
              width: '100%',
              height: '100%',
              objectFit: 'cover',         /* ✅ fixed: was 'fit' */
              objectPosition: 'center',
              zIndex: 1,
              animation: 'wus-fadeOut 0.6s ease forwards',
              imageRendering: 'auto',     /* ✅ HD: browser chooses best quality */
            }}
          />
        )}

        {/* Current image */}
        <img
          key={currentIdx}
          src={current.img}
          alt={current.report.title}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',           /* ✅ fixed: was invalid 'fit' */
            objectPosition: 'center',
            zIndex: 2,
            animation: 'wus-fadeIn 0.6s ease forwards',
            imageRendering: 'auto',       /* ✅ HD rendering */
          }}
        />

     
        {/* Bottom overlay: category + title + dot nav + counter */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'32px 36px 28px', zIndex:4 }}>

          {/* Category badge */}
          <div style={{ marginBottom:10 }}>
            <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 12px', borderRadius:4, background:catColor, color:'white', fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:11, letterSpacing:'.18em', textTransform:'uppercase' }}>
              <Tag size={10} /> {current.report.category}
            </span>
          </div>

          {/* Title */}
          <h3 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(1.6rem,3vw,2.4rem)', letterSpacing:'.04em', lineHeight:1.05, color:'white', marginBottom:16, textShadow:'0 2px 20px rgba(0,0,0,0.8)', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
            {current.report.title}
          </h3>

          {/* Controls row */}
          <div style={{ display:'flex', alignItems:'center', gap:10, flexWrap:'wrap' }}>
            {/* Pill dots */}
            <div style={{ display:'flex', gap:5, alignItems:'center' }}>
              {allSlides.slice(0, DOT_LIMIT).map((_, i) => (
                <button
                  key={i}
                  onClick={() => { goTo(i); resetAuto(); }}
                  style={{
                    width: i === currentIdx ? 22 : 6,
                    height: 6,
                    borderRadius: 3,
                    background: i === currentIdx ? 'white' : 'rgba(255,255,255,0.32)',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'all 0.3s ease',
                    flexShrink: 0,
                  }}
                />
              ))}
              {total > DOT_LIMIT && (
                <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:10, color:'rgba(255,255,255,0.38)', fontWeight:700, marginLeft:2 }}>+{total - DOT_LIMIT}</span>
              )}
            </div>

            {/* Counter */}
            <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, fontWeight:700, color:'rgba(255,255,255,0.42)', letterSpacing:'.1em', marginLeft:4 }}>
              {currentIdx + 1} / {total}
            </span>
          </div>
        </div>

        {/* Progress bar pinned to bottom */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:3, background:'rgba(255,255,255,0.1)', zIndex:5 }}>
          <div style={{ height:'100%', background:`linear-gradient(90deg, ${catColor}, rgba(255,255,255,0.7))`, width:`${progress}%`, transition:'width 0.4s ease', borderRadius:'0 2px 2px 0' }}/>
        </div>
      </div>

      {/* ── RIGHT: white thumbnail strip ── */}
      <div
        className="wus-strip-col"
        style={{ width:116, flexShrink:0, background:'#FFFFFF', borderLeft:'1px solid #E5E7EB', display:'flex', flexDirection:'column', overflow:'hidden' }}
      >
        {/* Header */}
        <div style={{ padding:'12px 8px 10px', flexShrink:0, borderBottom:'1px solid #F0F0F0', background:'#FAFAFA' }}>
          <p style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:9, fontWeight:800, letterSpacing:'.2em', textTransform:'uppercase', color:'#9CA3AF', textAlign:'center', margin:0 }}>
            Photos
          </p>
        </div>

        {/* Scrollable thumbnails */}
        <div
          ref={stripRef}
          className="wus-strip"
          style={{ flex:1, overflowY:'auto', overflowX:'hidden', padding:'8px 6px', display:'flex', flexDirection:'column', gap:8, scrollbarWidth:'none' }}
        >
          {allSlides.map((slide, i) => {
            const isActive    = i === currentIdx;
            const repCatColor = getCategoryBg(slide.report.category);
            return (
              <button
                key={i}
                onClick={() => { goTo(i); resetAuto(); }}
                style={{
                  width: '100%',
                  height: THUMB_H,
                  borderRadius: 6,
                  overflow: 'hidden',
                  border: isActive ? `2px solid ${repCatColor}` : '2px solid #E5E7EB',
                  padding: 0,
                  cursor: 'pointer',
                  position: 'relative',
                  flexShrink: 0,
                  transition: 'all 0.22s',
                  transform: isActive ? 'scale(1.03)' : 'scale(1)',
                  boxShadow: isActive
                    ? `0 0 0 2px ${repCatColor}33, 0 4px 12px rgba(0,0,0,0.1)`
                    : '0 1px 4px rgba(0,0,0,0.05)',
                  background: '#F3F4F6',
                }}
              >
                <img
                  src={slide.img}
                  alt=""
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'fit',       /* ✅ HD thumbnail fill */
                    objectPosition: 'center',
                    display: 'block',
                    opacity: isActive ? 1 : 0.6,
                    transition: 'opacity 0.22s',
                  }}
                />
                {/* Active left stripe */}
                {isActive && (
                  <div style={{ position:'absolute', left:0, top:0, bottom:0, width:3, background:repCatColor, borderRadius:'0 2px 2px 0' }}/>
                )}
                {/* Dim overlay for inactive */}
                {!isActive && (
                  <div style={{ position:'absolute', inset:0, background:'rgba(255,255,255,0.15)' }}/>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── HomePage ─────────────────────────────────────────────────────────────────
export function HomePage() {
  const [allReports,      setAllReports]      = useState([]);
  const [bdayOfficers,    setBdayOfficers]    = useState([]);
  const [slideshowOpen,   setSlideshowOpen]   = useState(false);
  const [visibleSections, setVisibleSections] = useState({});
  const sectionRefs     = useRef({});
  const jumpToReportRef = useRef(null);
  const autoRef         = useRef(null);

  useEffect(() => {
    const observers = {};
    Object.entries(sectionRefs.current).forEach(([key, el]) => {
      if (!el) return;
      observers[key] = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setVisibleSections(prev => ({ ...prev, [key]: true })); },
        { threshold: 0.08 }
      );
      observers[key].observe(el);
    });
    return () => Object.values(observers).forEach(o => o.disconnect());
  }, []);
  const setRef = (key) => (el) => { sectionRefs.current[key] = el; };

  useEffect(() => {
    getWeeklyReports().then(data => {
      setAllReports(data.sort((a, b) => String(b.id).localeCompare(String(a.id))));
    }).catch(err => console.error('Failed to load reports:', err));
    getOfficers().then(data => {
      setBdayOfficers(data.filter(o => isBday(o.birthdate)));
    }).catch(err => console.error('Failed to load officers:', err));
  }, []);

  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') setSlideshowOpen(false); };
    if (slideshowOpen) window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [slideshowOpen]);

  const handleOpenSlideshow = useCallback(() => setSlideshowOpen(true), []);
  const bdaySlides = bdayOfficers.map(o => ({ type:'bday', id:`bday-${o.id}`, officer:o }));

  return (
    <div id="hp-root" style={{ fontFamily:"'Barlow',sans-serif", background:'#F7F4F1' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@600;700;800;900&family=Barlow:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600;1,700&display=swap');
        #hp-root *, #hp-root *::before, #hp-root *::after { box-sizing:border-box; margin:0; padding:0; }

        @keyframes hp-fadeUp   { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes hm-pulseDot { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.8)} }
        @keyframes bday-float  { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes hp-gradFlow { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes hp-shimmer  { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes hp-orb      { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(14px,-10px) scale(1.04)} }
        @keyframes wus-fadeIn  { from{opacity:0;transform:scale(1.03)} to{opacity:1;transform:scale(1)} }
        @keyframes wus-fadeOut { from{opacity:1;transform:scale(1)} to{opacity:0;transform:scale(0.97)} }

        #hp-root .hp-f2 { animation: hp-fadeUp .8s ease .15s both }
        #hp-root .hp-f3 { animation: hp-fadeUp .8s ease .28s both }
        #hp-root .hp-f4 { animation: hp-fadeUp .8s ease .42s both }
        #hp-root .hp-f5 { animation: hp-fadeUp .8s ease .56s both }

        #hp-root .hp-reveal       { opacity:0; transform:translateY(24px);  transition:opacity .78s cubic-bezier(.22,1,.36,1), transform .78s cubic-bezier(.22,1,.36,1); }
        #hp-root .hp-reveal-scale { opacity:0; transform:scale(0.97);       transition:opacity .78s cubic-bezier(.22,1,.36,1), transform .78s cubic-bezier(.22,1,.36,1); }
        #hp-root .hp-reveal.visible,
        #hp-root .hp-reveal-scale.visible { opacity:1; transform:none; }
        #hp-root .hp-d1 { transition-delay:0.05s !important; }
        #hp-root .hp-d2 { transition-delay:0.14s !important; }
        #hp-root .hp-d3 { transition-delay:0.23s !important; }

        #hp-root .hp-stat-pill { background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.18); border-radius:10px; padding:8px 14px; text-align:center; transition:all .25s; }
        #hp-root .hp-stat-pill:hover { background:rgba(255,255,255,.2); transform:translateY(-3px); border-color:rgba(255,255,255,.35); box-shadow:0 10px 28px rgba(0,0,0,.22); }

        #hp-root .hp-feat-shimmer { position:absolute; inset:0; z-index:8; pointer-events:none; background:linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.05) 50%, transparent 62%); background-size:220% 100%; animation:hp-shimmer 4s ease infinite; }

        /* Thumbnail strip scrollbar */
        #hp-root .wus-strip::-webkit-scrollbar { display:none; }

        #hp-root .hp-svc-col { transition:background .28s; }
        #hp-root .hp-svc-col:hover { background:rgba(196,30,0,0.02); }
        #hp-root .hp-cta-stat { transition:background .22s,transform .22s; border-radius:6px; cursor:default; }
        #hp-root .hp-cta-stat:hover { background:rgba(196,30,0,.06); transform:translateY(-2px); }
        #hp-root .hp-cta-stat-val { transition:transform .22s; display:block; }
        #hp-root .hp-cta-stat:hover .hp-cta-stat-val { transform:scale(1.1); }

        @media (max-width:900px) { #hp-root .hp-svc-grid { grid-template-columns:1fr 1fr !important; } }
        @media (max-width:600px) { #hp-root .hp-svc-grid { grid-template-columns:1fr !important; } #hp-root .hp-cta-inner { flex-direction:column !important; } }
        @media (max-width:700px) { #hp-root .wus-strip-col { display:none !important; } }
      `}</style>

      <SlideshowPortal open={slideshowOpen} onClose={() => setSlideshowOpen(false)} reports={allReports} jumpToReportRef={jumpToReportRef} />

      {/* ══════════════════════════════════════════════════ HERO */}
      <section style={{ position:'relative', minHeight:'100vh', display:'flex', flexDirection:'column', justifyContent:'flex-end', overflow:'hidden' }}>
        <img src={Fire} alt="BFP Station 1 Cogon" style={{ position:'absolute', inset:0, width:'100%', height:'85%', objectFit:'cover' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(5,2,1,.97) 0%,rgba(8,3,2,.74) 38%,rgba(0,0,0,.22) 100%)' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(110deg,rgba(5,2,1,.68) 0%,transparent 55%)' }} />
        <div style={{ position:'absolute', top:0, left:0, width:3, height:'100%', background:'linear-gradient(to bottom,#b52000 0%,#e06020 58%,transparent 100%)', opacity:.95 }} />
        <div style={{ position:'absolute', top:'-15%', right:'-5%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(220,84,8,0.12) 0%, transparent 65%)', pointerEvents:'none', animation:'hp-orb 9s ease-in-out infinite' }} />

        <div style={{ position:'relative', zIndex:10, maxWidth:1280, margin:'0 auto', padding:'6rem 2rem 7rem', width:'100%' }}>
          <div style={{ maxWidth:640 }}>
            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:24, flexWrap:'wrap' }}>
              <span style={{ display:'flex', alignItems:'center', gap:7, padding:'6px 14px', borderRadius:999, background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.18)', backdropFilter:'blur(14px)', fontSize:11, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'white', fontFamily:"'Barlow Condensed',sans-serif" }}>
                <span style={{ width:7, height:7, borderRadius:'50%', background:'#4ade80', animation:'hm-pulseDot 2.2s ease-in-out infinite', flexShrink:0, display:'inline-block' }} />
                Station Operational · 24/7
              </span>
              <span style={{ display:'flex', alignItems:'center', gap:6, padding:'6px 14px', borderRadius:999, background:'rgba(180,40,10,.28)', border:'1px solid rgba(180,40,10,.5)', backdropFilter:'blur(14px)', fontSize:11, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'white', fontFamily:"'Barlow Condensed',sans-serif" }}>
                <Shield size={11} /> BFP Station 1 · Cogon
              </span>
            </div>
            <h1 className="hp-f2" style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(6.8rem,7vw,5.6rem)', letterSpacing:'0.04em', lineHeight:0.88, color:'white', marginBottom:18 }}>
              COGON<br /><span style={{ color:'#E8622A' }}>FIRE STATION</span>
            </h1>
            <div className="hp-f3" style={{ display:'inline-flex', alignItems:'center', gap:8, marginBottom:14, padding:'7px 16px', borderRadius:6, background:'rgba(0,0,0,0.55)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.18)' }}>
              <Flame size={13} style={{ color:'#E8622A', flexShrink:0 }} />
              <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:13, letterSpacing:'.22em', textTransform:'uppercase', color:'white' }}>Cagayan de Oro Fire District</span>
            </div>
            <p className="hp-f3" style={{ fontSize:'0.85rem', color:'rgba(255,255,255,.75)', lineHeight:1.75, marginBottom:4, fontWeight:500, fontFamily:"'Barlow',sans-serif", textShadow:'0 1px 10px rgba(0,0,0,0.9)' }}>
              Capt. Vicente Roa, Brgy. 33, Cagayan De Oro City
            </p>
            <p className="hp-f3" style={{ fontSize:'0.85rem', color:'rgba(255,255,255,.55)', lineHeight:1.85, maxWidth:560, marginBottom:30, fontFamily:"'Barlow',sans-serif", fontWeight:400, textShadow:'0 1px 12px rgba(0,0,0,0.9)' }}>
              Committed to preventing and suppressing destructive fires, safeguarding lives and properties, and promoting fire safety awareness throughout Cagayan de Oro City.
            </p>
            <div className="hp-f4" style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:32 }}>
              <Link to="/about"
                style={{ display:'inline-flex', alignItems:'center', gap:7, fontWeight:800, fontSize:12, padding:'11px 22px', borderRadius:10, background:'linear-gradient(135deg,#b52000,#e04810)', color:'white', textDecoration:'none', boxShadow:'0 7px 24px rgba(180,40,10,.5)', letterSpacing:'.04em', textTransform:'uppercase', fontFamily:"'Barlow Condensed',sans-serif", transition:'all .25s' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px) scale(1.03)'; e.currentTarget.style.boxShadow='0 14px 36px rgba(180,40,10,.65)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 7px 24px rgba(180,40,10,.5)'; }}
              >
                About Us <ArrowRight size={13} />
              </Link>
              <a href="tel:911"
                style={{ display:'inline-flex', alignItems:'center', gap:7, fontWeight:800, fontSize:12, padding:'11px 22px', borderRadius:10, background:'rgba(255,255,255,.08)', border:'1.5px solid rgba(255,255,255,.28)', color:'white', textDecoration:'none', backdropFilter:'blur(14px)', letterSpacing:'.04em', textTransform:'uppercase', fontFamily:"'Barlow Condensed',sans-serif", transition:'all .25s' }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,.18)'; e.currentTarget.style.transform='translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,.08)'; e.currentTarget.style.transform='none'; }}
              >
                <Phone size={13} /> Emergency: 911
              </a>
            </div>
            <div className="hp-f5" style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {[{value:'24/7',label:'Response'},{value:'911',label:'Emergency'},{value:'35',label:'Barangays'},{value:'1990',label:'Established'}].map(({ value, label }) => (
                <div key={label} className="hp-stat-pill">
                  <p style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'0.85rem', letterSpacing:'0.06em', color:'white', lineHeight:1 }}>{value}</p>
                  <p style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.14em', color:'rgba(255,255,255,.42)', marginTop:4, fontFamily:"'Barlow Condensed',sans-serif" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Wave separator — white */}
        <div style={{ position:'absolute', bottom:-1, left:0, right:0, height:32, overflow:'hidden', pointerEvents:'none', zIndex:11 }}>
          <svg viewBox="0 0 1200 32" preserveAspectRatio="none" style={{ width:'100%', height:'100%' }}>
            <path d="M0,32 L0,11 Q300,32 600,14 Q900,2 1200,14 L1200,32 Z" fill="#FFFFFF" />
          </svg>
        </div>
      </section>

      {/* ══════════════════════════════════════ WEEKLY UPDATES */}
      <section ref={setRef('updates')} style={{ background:'#FFFFFF', borderTop:'1px solid #E5E7EB', paddingTop:56, position:'relative', overflow:'hidden' }}>

        {/* Padded heading block */}
        <div style={{ maxWidth:1180, margin:'0 auto', padding:'0 2rem' }}>

          <div className={`hp-reveal ${visibleSections['updates'] ? 'visible' : ''}`} style={{ textAlign:'center', marginBottom:40 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:12, fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'.2em', color:D.red, marginBottom:14, fontFamily:"'Barlow Condensed',sans-serif" }}>
              <span style={{ display:'inline-block', width:28, height:2, background:`linear-gradient(90deg,transparent,${D.red})`, borderRadius:1 }} />
              Latest from the Station
              <span style={{ display:'inline-block', width:28, height:2, background:`linear-gradient(90deg,${D.red},transparent)`, borderRadius:1 }} />
            </div>
            <h2 style={{ lineHeight:1.05, marginBottom:14 }}>
              <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontWeight:900, fontSize:'clamp(2rem,4.5vw,3.6rem)', color:'#1A1210', letterSpacing:'.04em' }}>Weekly </span>
              <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontWeight:900, fontSize:'clamp(2rem,4.5vw,3.6rem)', color:D.red, letterSpacing:'.04em' }}>Updates</span>
            </h2>
            <p style={{ fontSize:15, color:'#6B6258', fontFamily:"'Barlow',sans-serif", fontWeight:400, lineHeight:1.75, maxWidth:440, margin:'0 auto' }}>
              Station bulletins, training highlights, events, and team milestones
            </p>
          </div>

          {/* Birthday card */}
          {bdaySlides.length > 0 && (
            <div className={`hp-reveal-scale ${visibleSections['updates'] ? 'visible' : ''} hp-d1`}
              style={{ position:'relative', borderRadius:14, overflow:'hidden', boxShadow:'0 20px 56px rgba(0,0,0,0.18)', background:'#111827', marginBottom:32 }}>
              <div style={{ position:'relative', height:380, overflow:'hidden' }}>
                <div className="hp-feat-shimmer" />
                <BirthdayFeaturedSlide key={bdaySlides[0].id} officer={bdaySlides[0].officer} />
                <div style={{ position:'absolute', top:16, left:20, zIndex:15, display:'flex', alignItems:'center', gap:7 }}>
                  <div style={{ width:7, height:7, borderRadius:'50%', background:'#F9A8D4', boxShadow:'0 0 8px #F472B6', animation:'hm-pulseDot 2s ease-in-out infinite' }} />
                  <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:10, fontWeight:800, letterSpacing:'.18em', textTransform:'uppercase', color:'rgba(255,255,255,0.8)' }}>Today's Celebrant</span>
                </div>
              </div>
            </div>
          )}

          {allReports.length > 0 && (
            <div className={`hp-reveal ${visibleSections['updates'] ? 'visible' : ''} hp-d2`}
              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:10 }}>
              <div></div>
            </div>
          )}
        </div>

        {/* ── Full-bleed slideshow ── */}
        {allReports.length > 0 ? (
          <div
            className={`hp-reveal-scale ${visibleSections['updates'] ? 'visible' : ''} hp-d3`}
            style={{
              margin: 0,
              padding: 0,
              borderTop: '1px solid #E5E7EB',
              borderBottom: '1px solid #E5E7EB',
              overflow: 'hidden',
            }}
          >
            <WeeklyUpdatesSlideshow reports={allReports} onOpenSlideshow={handleOpenSlideshow} />
          </div>
        ) : (
          <div style={{ maxWidth:1180, margin:'0 auto', padding:'0 2rem' }}>
            <div style={{ padding:'60px 24px', textAlign:'center', borderRadius:12, border:'1.5px dashed #D1D5DB', background:'#FAFAFA' }}>
              <Flame size={34} style={{ color:'#D1D5DB', marginBottom:14 }} />
              <p style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.8rem', letterSpacing:'.06em', color:'#9CA3AF' }}>No Recent Reports</p>
              <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:14, color:'#9CA3AF', marginTop:5 }}>No reports yet. Check back soon.</p>
            </div>
          </div>
        )}

        {/* Bottom spacer */}
        <div style={{ height:56, background:'#FFFFFF' }} />
      </section>

      {/* ══════════════════════════════════════════════ CORE SERVICES */}
      <section ref={setRef('services')} style={{ background:'white', borderTop:'1px solid #EAE4DC', padding:'64px 0 72px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:'-2%', top:'50%', transform:'translateY(-50%)', fontFamily:"'Bebas Neue',sans-serif", fontWeight:900, fontSize:'clamp(6rem,14vw,12rem)', lineHeight:1, color:'rgba(196,30,0,0.025)', pointerEvents:'none', userSelect:'none', whiteSpace:'nowrap', letterSpacing:'.04em' }}>FIRE</div>

        <div style={{ maxWidth:1180, margin:'0 auto', padding:'0 2rem', position:'relative' }}>
          <div className={`hp-reveal ${visibleSections['services'] ? 'visible' : ''}`} style={{ textAlign:'center', marginBottom:44 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:12, fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'.2em', color:D.red, marginBottom:14, fontFamily:"'Barlow Condensed',sans-serif" }}>
              <span style={{ display:'inline-block', width:28, height:2, background:`linear-gradient(90deg,transparent,${D.red})`, borderRadius:1 }} />
              What We Do
              <span style={{ display:'inline-block', width:28, height:2, background:`linear-gradient(90deg,${D.red},transparent)`, borderRadius:1 }} />
            </div>
            <h2 style={{ lineHeight:1.05, marginBottom:14 }}>
              <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontWeight:900, fontSize:'clamp(2rem,3.8vw,3.2rem)', color:'#1A1210', letterSpacing:'.04em' }}>Our Core </span>
              <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontWeight:900, fontSize:'clamp(2rem,3.8vw,3.2rem)', color:D.red, letterSpacing:'.04em' }}>Services</span>
            </h2>
            <p style={{ fontSize:15, color:'#6B6258', fontFamily:"'Barlow',sans-serif", fontWeight:400, lineHeight:1.75, maxWidth:440, margin:'0 auto' }}>
              BFP Station 1 — Cogon serves the community with trained personnel, modern equipment, and unwavering commitment to public safety.
            </p>
          </div>

          <div className={`hp-svc-grid hp-reveal-scale ${visibleSections['services'] ? 'visible' : ''} hp-d2`} style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:0, border:'1.5px solid #E4DDD4', borderRadius:12, overflow:'hidden', marginBottom:40, boxShadow:'0 4px 30px rgba(0,0,0,.07)' }}>
            <div className="hp-svc-col" style={{ borderRight:'1.5px solid #E4DDD4' }}>
              <ServiceCard icon={<Flame size={20} />} number="01" title="Fire Prevention & Inspection" description="Systematic fire safety inspections of residential, commercial, and industrial establishments to identify and eliminate hazards before they escalate." tag="Prevention First" accent="#C41E00" accentBg="rgba(196,30,0,.07)" accentBorder="rgba(196,30,0,.22)" />
            </div>
            <div className="hp-svc-col" style={{ borderRight:'1.5px solid #E4DDD4' }}>
              <ServiceCard icon={<AlertTriangle size={20} />} number="02" title="24/7 Emergency Response" description="Round-the-clock standby response for all fire emergencies, with rapid dispatch and professionally trained suppression teams ready to deploy." tag="Always Ready" accent="#B04500" accentBg="rgba(176,69,0,.07)" accentBorder="rgba(176,69,0,.22)" />
            </div>
            <div className="hp-svc-col">
              <ServiceCard icon={<Users size={20} />} number="03" title="Fire Safety Education" description="Community outreach, school drills, and business training programs designed to build a fire-safe culture across Cagayan de Oro City." tag="Community First" accent="#1558B0" accentBg="rgba(21,88,176,.07)" accentBorder="rgba(21,88,176,.2)" />
            </div>
          </div>

          <div className={`hp-reveal ${visibleSections['services'] ? 'visible' : ''} hp-d3`} style={{ borderRadius:16, overflow:'hidden', background:'linear-gradient(135deg,#FDF8F3,#F5EDE3)', border:`1.5px solid ${D.br}`, position:'relative', boxShadow:'0 6px 32px rgba(0,0,0,.07)' }}>
            <div style={{ position:'absolute', top:0, left:0, right:0, height:4, background:`linear-gradient(90deg,${D.redDk},${D.red},${D.ora},${D.amb},${D.red},${D.redDk})`, backgroundSize:'200% 100%', animation:'hp-gradFlow 4s linear infinite' }} />
            <div style={{ position:'absolute', right:-8, top:'50%', transform:'translateY(-50%)', fontFamily:"'Bebas Neue',sans-serif", fontWeight:900, fontSize:'clamp(3.5rem,10vw,8rem)', lineHeight:1, color:'rgba(100,60,20,.04)', pointerEvents:'none', userSelect:'none', whiteSpace:'nowrap', letterSpacing:'.04em' }}>BFP COGON</div>
            <div className="hp-cta-inner" style={{ position:'relative', zIndex:1, padding:'28px 36px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:24 }}>
              <div style={{ flex:1, minWidth:200 }}>
                <p style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'.16em', color:D.red, marginBottom:5, fontFamily:"'Barlow Condensed',sans-serif" }}>Bureau of Fire Protection</p>
                <h3 style={{ fontFamily:"'Poppins',Georgia,serif", fontWeight:800, fontSize:'clamp(0.95rem,1.6vw,1.25rem)', color:D.hi, lineHeight:1.2, marginBottom:5 }}>Lingkod Bayan, Ipaglaban ang Kaligtasan</h3>
                <p style={{ fontSize:12, color:D.lo, fontWeight:500, fontFamily:"'Barlow',sans-serif" }}>BFP Station 1 · Cogon · Cagayan de Oro City · Region X</p>
              </div>
              <div style={{ display:'flex', alignItems:'stretch', borderLeft:`1.5px solid ${D.br}`, paddingLeft:24, flexShrink:0 }}>
                {[{label:'Established',value:'1990'},{label:'Coverage',value:'35 Brgy.'},{label:'Response',value:'24 / 7'}].map(({ label, value }, i) => (
                  <div key={label} className="hp-cta-stat" style={{ textAlign:'center', padding:'5px 20px', borderLeft:i>0 ? `1.5px solid ${D.br}`:'none' }}>
                    <span className="hp-cta-stat-val" style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:'1.25rem', letterSpacing:'.03em', color:D.ora, lineHeight:1 }}>{value}</span>
                    <span style={{ fontSize:9, fontWeight:800, textTransform:'uppercase', letterSpacing:'.13em', color:D.lo, marginTop:5, display:'block', fontFamily:"'Barlow Condensed',sans-serif" }}>{label}</span>
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