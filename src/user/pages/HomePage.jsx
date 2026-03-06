import { Link } from 'react-router';
import { getWeeklyReports, getOfficers } from '../../utils/storage';
import { useEffect, useState, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  ArrowRight, Shield, Phone, ChevronDown,
  Flame, AlertTriangle, Users,
  ChevronLeft, ChevronRight, Image as ImageIcon, X,
  Eye, Play, Calendar, Tag,
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

const CAT_STYLE = {
  Event:       { accent: '#1558B0', bg: 'rgba(21,88,176,0.08)',  border: 'rgba(21,88,176,0.25)' },
  Training:    { accent: '#166534', bg: 'rgba(22,101,52,0.08)',  border: 'rgba(22,101,52,0.25)' },
  Advisory:    { accent: '#92400E', bg: 'rgba(146,64,14,0.08)',  border: 'rgba(146,64,14,0.25)' },
  Achievement: { accent: '#5B21B6', bg: 'rgba(91,33,182,0.08)', border: 'rgba(91,33,182,0.25)' },
  Birthday:    { accent: '#9D174D', bg: 'rgba(157,23,77,0.08)',  border: 'rgba(157,23,77,0.25)' },
};
const getCatStyle = (cat) => CAT_STYLE[cat] || { accent: '#5C3A1E', bg: 'rgba(92,58,30,0.08)', border: 'rgba(92,58,30,0.22)' };

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

const formatDate = (date) => {
  if (!date) return '';
  const d = date?.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

const formatDateShort = (date) => {
  if (!date) return '';
  const d = date?.toDate ? date.toDate() : new Date(date);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
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
            <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(8rem,15vw,13rem)', fontWeight:900, color:'rgba(255,255,255,0.06)', letterSpacing:'-.04em', userSelect:'none', lineHeight:1 }}>{ini}</span>
          </div>
        )}
        <div style={{ position:'absolute', top:0, right:0, bottom:0, width:60, background:'linear-gradient(to right, transparent, #0B1120)', zIndex:3, pointerEvents:'none' }}/>
      </div>
      <div style={{ flex:1, background:'#0B1120', display:'flex', flexDirection:'column', justifyContent:'center', padding:'40px 44px 40px 32px', position:'relative', overflow:'hidden' }}>
        <div style={{ position:'absolute', right:'-10px', bottom:'-20px', fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(7rem,12vw,10rem)', fontWeight:900, color:'rgba(255,255,255,0.03)', letterSpacing:'-.04em', userSelect:'none', pointerEvents:'none', lineHeight:1 }}>{ini}</div>
        <div style={{ position:'absolute', top:0, left:0, right:0, height:3, background:'linear-gradient(90deg, #FBBF24 0%, #FDE68A 50%, #F59E0B 100%)' }}/>
        <div style={{ position:'absolute', top:18, right:20, display:'flex', gap:10, zIndex:4 }}>
          <span style={{ fontSize:28, filter:'drop-shadow(0 2px 8px rgba(0,0,0,0.5))', animation:'bday-float 3s ease-in-out infinite' }}>🎂</span>
          <span style={{ fontSize:22, animation:'bday-float 3.4s ease-in-out infinite .5s' }}>🎉</span>
          <span style={{ fontSize:18, animation:'bday-float 2.8s ease-in-out infinite 1s' }}>🎈</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:20, flexWrap:'wrap' }}>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'4px 12px 4px 9px', borderRadius:999, background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)' }}>
            <span style={{ fontSize:13 }}>🎂</span>
            <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:10, letterSpacing:'.22em', textTransform:'uppercase', color:'rgba(255,255,255,0.6)' }}>Birthday Celebrant</span>
          </div>
          {abbr && (
            <div style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 12px', borderRadius:999, background:'rgba(251,191,36,0.12)', border:'1px solid rgba(251,191,36,0.35)' }}>
              <Shield size={9} style={{ color:'#FBBF24' }}/>
              <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:11, letterSpacing:'.16em', textTransform:'uppercase', color:'#FDE68A' }}>{abbr}</span>
            </div>
          )}
          {age !== null && (
            <div style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 12px', borderRadius:999, background:'rgba(244,114,182,0.1)', border:'1px solid rgba(244,114,182,0.25)' }}>
              <span style={{ fontSize:11 }}>🎈</span>
              <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:11, letterSpacing:'.14em', textTransform:'uppercase', color:'#F9A8D4' }}>Turning {age}</span>
            </div>
          )}
        </div>
        <p style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:'clamp(0.9rem,1.6vw,1.3rem)', letterSpacing:'.28em', textTransform:'uppercase', color:'rgba(255,255,255,0.45)', marginBottom:6 }}>✨ Happy Birthday</p>
        <h3 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(2rem,4vw,3.8rem)', letterSpacing:'.04em', lineHeight:0.95, marginBottom:14,
          background:'linear-gradient(90deg, #fff 0%, #FDE68A 35%, #FBBF24 65%, #F59E0B 100%)',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
          filter:'drop-shadow(0 2px 16px rgba(251,191,36,0.4))'
        }}>{officer.fullName}</h3>
        {officer.rank && (
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
            <div style={{ width:3, height:30, borderRadius:2, background:'linear-gradient(to bottom,#FBBF24,#F472B6)', flexShrink:0 }}/>
            <div>
              <p style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:9, fontWeight:700, letterSpacing:'.24em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)', marginBottom:2 }}>Rank</p>
              <p style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:14, fontWeight:800, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(255,255,255,0.85)', lineHeight:1 }}>{officer.rank}</p>
            </div>
          </div>
        )}
        <div style={{ height:1, background:'rgba(255,255,255,0.07)', marginBottom:18 }}/>
        <p style={{ fontFamily:"'Barlow',sans-serif", fontStyle:'italic', fontSize:13.5, color:'rgba(255,255,255,0.4)', lineHeight:1.8 }}>
          On behalf of all officers and personnel of BFP Station 1 – Cogon, we extend our warmest felicitations and deepest gratitude for your unwavering dedication and service.
        </p>
        <div style={{ display:'flex', alignItems:'center', gap:7, marginTop:22 }}>
          <Shield size={12} style={{ color:'rgba(255,255,255,0.2)', flexShrink:0 }}/>
          <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:10, fontWeight:700, letterSpacing:'.16em', textTransform:'uppercase', color:'rgba(255,255,255,0.2)' }}>BFP Station 1 · Cogon · CDO</span>
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
        padding: '40px 36px 36px', position: 'relative', overflow: 'hidden',
        transition: 'background .28s', background: hovered ? `${accent}07` : 'transparent',
        height: '100%', display: 'flex', flexDirection: 'column',
      }}
    >
      {/* large bg number */}
      <div style={{ position:'absolute', top:6, right:18, fontFamily:"'Barlow Condensed',sans-serif", fontSize:'8rem', fontWeight:900, color:hovered ? `${accent}16` : 'rgba(0,0,0,.04)', lineHeight:1, userSelect:'none', pointerEvents:'none', letterSpacing:'-0.03em', transition:'color .3s, transform .3s', transform: hovered ? 'translateY(-6px)' : 'none' }}>
        {number}
      </div>
      {/* icon */}
      <div style={{ width:58, height:58, borderRadius:15, display:'flex', alignItems:'center', justifyContent:'center', background:hovered ? accent : accentBg, border:`1.5px solid ${hovered ? 'transparent' : accentBorder}`, color:hovered ? 'white' : accent, marginBottom:26, transition:'all .35s cubic-bezier(.34,1.56,.64,1)', transform:hovered ? 'scale(1.14) rotate(-6deg)' : 'scale(1) rotate(0)', boxShadow:hovered ? `0 12px 32px ${accent}44` : 'none', flexShrink:0 }}>
        {icon}
      </div>
      <h3 style={{ fontSize:19, fontWeight:700, lineHeight:1.3, color:hovered ? accent : D.hi, marginBottom:14, fontFamily:"'Barlow',sans-serif", transition:'color .25s' }}>
        {title}
      </h3>
      <p style={{ fontSize:14.5, lineHeight:1.84, color:'#6B6258', marginBottom:30, fontFamily:"'Barlow',sans-serif", fontWeight:400, flex:1 }}>
        {description}
      </p>
      <span style={{ display:'inline-flex', alignItems:'center', fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'.13em', padding:'8px 20px', borderRadius:6, background:hovered ? accent : accentBg, border:`1.5px solid ${hovered ? 'transparent' : accentBorder}`, color:hovered ? 'white' : accent, fontFamily:"'Barlow Condensed',sans-serif", transition:'all .28s', alignSelf:'flex-start', boxShadow:hovered ? `0 6px 18px ${accent}44` : 'none' }}>
        {tag}
      </span>
      {/* bottom accent bar */}
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
        style={{ position:'fixed', top:18, right:22, zIndex:100001, display:'flex', alignItems:'center', gap:7, padding:'10px 20px', borderRadius:8, background:'rgba(255,255,255,.92)', backdropFilter:'blur(14px)', border:'1px solid rgba(100,60,20,.18)', color:D.mid, cursor:'pointer', fontSize:13, fontWeight:800, fontFamily:"'Barlow Condensed',sans-serif", letterSpacing:'.1em', textTransform:'uppercase', boxShadow:'0 4px 24px rgba(0,0,0,.14)', transition:'all .22s' }}
        onMouseEnter={e => { e.currentTarget.style.background = D.red; e.currentTarget.style.color = 'white'; e.currentTarget.style.borderColor = 'transparent'; }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,.92)'; e.currentTarget.style.color = D.mid; e.currentTarget.style.borderColor = 'rgba(100,60,20,.18)'; }}
      >
        <X size={14} /> Close Slideshow
      </button>
    </>,
    document.body
  );
}

// ─── HomePage ─────────────────────────────────────────────────────────────────
export function HomePage() {
  const [allReports,    setAllReports]    = useState([]);
  const [bdayOfficers,  setBdayOfficers]  = useState([]);
  const [slideshowOpen, setSlideshowOpen] = useState(false);
  const [featuredIdx,   setFeaturedIdx]   = useState(0);
  const [currentPage,   setCurrentPage]   = useState(0);
  const [visibleSections, setVisibleSections] = useState({});
  const sectionRefs   = useRef({});
  const jumpToReportRef = useRef(null);
  const autoRef         = useRef(null);
  const reportsPerPage  = 6;

  // ── Scroll reveal setup ──
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
      const now    = new Date();
      const cutoff = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      const toDate = (d) => d?.toDate ? d.toDate() : new Date(d);
      const recent = data.filter(r => toDate(r.date) >= cutoff);
      const sorted = recent.sort((a, b) => toDate(b.date) - toDate(a.date));
      setAllReports(sorted);
    }).catch(err => console.error('Failed to load reports:', err));

    getOfficers().then(data => {
      setBdayOfficers(data.filter(o => isBday(o.birthdate)));
    }).catch(err => console.error('Failed to load officers:', err));
  }, []);

  const bdaySlides     = bdayOfficers.map(o => ({ type: 'bday',   id: `bday-${o.id}`,  officer: o }));
  const reportSlides   = allReports.map(r   => ({ type: 'report', id: r.id,             report: r  }));
  const featuredSlides = [...bdaySlides, ...reportSlides];
  const featured       = featuredSlides[featuredIdx] ?? null;
  const isBdaySlide    = featured?.type === 'bday';

  const startAuto = useCallback(() => {
    clearInterval(autoRef.current);
    if (featuredSlides.length < 2) return;
    autoRef.current = setInterval(() => {
      setFeaturedIdx(p => (p + 1) % featuredSlides.length);
    }, 60000);
  }, [featuredSlides.length]);

  useEffect(() => { startAuto(); return () => clearInterval(autoRef.current); }, [startAuto]);

  const goFeatured  = (i) => { setFeaturedIdx(i); startAuto(); };
  const prevFeatured = () => goFeatured((featuredIdx - 1 + featuredSlides.length) % featuredSlides.length);
  const nextFeatured = () => goFeatured((featuredIdx + 1) % featuredSlides.length);

  useEffect(() => {
    const fn = e => { if (e.key === 'Escape') setSlideshowOpen(false); };
    if (slideshowOpen) window.addEventListener('keydown', fn);
    return () => window.removeEventListener('keydown', fn);
  }, [slideshowOpen]);

  const totalPages   = Math.ceil(allReports.length / reportsPerPage);
  const currentCards = allReports.slice(currentPage * reportsPerPage, (currentPage + 1) * reportsPerPage);

  const handlePrevPage = () => setCurrentPage(p => Math.max(0, p - 1));
  const handleNextPage = () => setCurrentPage(p => Math.min(totalPages - 1, p + 1));

  const handleCardClick = useCallback(reportId => {
    setSlideshowOpen(true);
    setTimeout(() => { if (jumpToReportRef.current) jumpToReportRef.current(reportId); }, 350);
  }, []);

  return (
    <div id="hp-root" style={{ fontFamily: "'Barlow',sans-serif", background: '#F7F4F1' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Barlow+Condensed:wght@600;700;800;900&family=Barlow:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,500;1,600;1,700&family=Playfair+Display:ital,wght@0,700;0,800;0,900;1,700;1,800;1,900&display=swap');
        #hp-root *, #hp-root *::before, #hp-root *::after { box-sizing: border-box; margin: 0; padding: 0; }

        /* ── Base animations ── */
        @keyframes hp-fadeUp    { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes hm-bounce    { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(8px)} }
        @keyframes hm-pulseDot  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.8)} }
        @keyframes bday-float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes hp-gradFlow  { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes hp-shimmer   { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes hp-orb       { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(18px,-12px) scale(1.04)} }
        @keyframes hp-lineGrow  { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        @keyframes hp-floatBadge{ 0%,100%{transform:translateY(0) rotate(-1deg)} 50%{transform:translateY(-8px) rotate(1deg)} }
        @keyframes hp-scanline  { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }

        /* ── Hero text entrance ── */
        #hp-root .hp-f1 { animation: hp-fadeUp .8s ease .05s both }
        #hp-root .hp-f2 { animation: hp-fadeUp .8s ease .15s both }
        #hp-root .hp-f3 { animation: hp-fadeUp .8s ease .28s both }
        #hp-root .hp-f4 { animation: hp-fadeUp .8s ease .42s both }
        #hp-root .hp-f5 { animation: hp-fadeUp .8s ease .56s both }

        /* ── Scroll reveal ── */
        #hp-root .hp-reveal       { opacity:0; transform:translateY(32px);  transition:opacity 0.78s cubic-bezier(.22,1,.36,1), transform 0.78s cubic-bezier(.22,1,.36,1); }
        #hp-root .hp-reveal-left  { opacity:0; transform:translateX(-32px); transition:opacity 0.78s cubic-bezier(.22,1,.36,1), transform 0.78s cubic-bezier(.22,1,.36,1); }
        #hp-root .hp-reveal-right { opacity:0; transform:translateX(32px);  transition:opacity 0.78s cubic-bezier(.22,1,.36,1), transform 0.78s cubic-bezier(.22,1,.36,1); }
        #hp-root .hp-reveal-scale { opacity:0; transform:scale(0.9);        transition:opacity 0.78s cubic-bezier(.22,1,.36,1), transform 0.78s cubic-bezier(.22,1,.36,1); }
        #hp-root .hp-reveal.visible,
        #hp-root .hp-reveal-left.visible,
        #hp-root .hp-reveal-right.visible,
        #hp-root .hp-reveal-scale.visible { opacity:1; transform:none; }
        #hp-root .hp-d1 { transition-delay:0.05s !important; }
        #hp-root .hp-d2 { transition-delay:0.14s !important; }
        #hp-root .hp-d3 { transition-delay:0.23s !important; }
        #hp-root .hp-d4 { transition-delay:0.32s !important; }
        #hp-root .hp-d5 { transition-delay:0.41s !important; }
        #hp-root .hp-d6 { transition-delay:0.50s !important; }

        /* ── Report cards ── */
        #hp-root .rpt-card {
          transition: transform .32s cubic-bezier(.22,1,.36,1), box-shadow .32s ease;
          position: relative;
        }
        #hp-root .rpt-card::after {
          content:''; position:absolute; bottom:0; left:0; right:0; height:0;
          transition: height .32s cubic-bezier(.22,1,.36,1); border-radius:0 0 14px 14px;
          pointer-events:none;
        }
        #hp-root .rpt-card:hover { transform: translateY(-8px); box-shadow: 0 24px 56px rgba(0,0,0,0.16) !important; }
        #hp-root .rpt-card:hover::after { height:3px; background:linear-gradient(90deg,#C41E00,#E8340A,transparent); }
        #hp-root .rpt-card:hover .rpt-img { transform: scale(1.07); }
        #hp-root .rpt-img { transition: transform .5s ease; }
        #hp-root .rpt-card:hover .rpt-card-num { opacity: 0.1 !important; transform:translateY(-8px); }
        #hp-root .rpt-card-num { transition: opacity .3s, transform .3s; }

        /* ── Featured hero nav ── */
        #hp-root .feat-nav {
          position:absolute; top:50%; transform:translateY(-50%);
          width:46px; height:46px; border-radius:50%;
          background:rgba(255,255,255,0.13); border:1.5px solid rgba(255,255,255,0.28);
          color:white; cursor:pointer; display:flex; align-items:center; justify-content:center;
          backdrop-filter:blur(10px); transition:all .25s; z-index:15;
        }
        #hp-root .feat-nav:hover {
          background:rgba(255,255,255,0.28); border-color:rgba(255,255,255,0.6);
          transform:translateY(-50%) scale(1.1);
        }

        /* ── Hero stat pills ── */
        #hp-root .hp-stat-pill {
          background:rgba(255,255,255,.1); border:1px solid rgba(255,255,255,.18);
          backdropFilter:blur(14px); border-radius:14px; padding:12px 18px; text-align:center;
          transition:all .25s cubic-bezier(.22,1,.36,1);
        }
        #hp-root .hp-stat-pill:hover {
          background:rgba(255,255,255,.2); transform:translateY(-4px);
          border-color:rgba(255,255,255,.35);
          box-shadow:0 12px 32px rgba(0,0,0,.25);
        }

        /* ── Section heading underline ── */
        #hp-root .hp-section-underline {
          display:inline-block; width:48px; height:3px; border-radius:2px;
          background:linear-gradient(90deg,#C41E00,#E8340A); margin-top:10px;
          transform:scaleX(0); transform-origin:left;
          transition:transform 0.7s cubic-bezier(.22,1,.36,1) 0.4s;
        }
        #hp-root .hp-section-underline.visible { transform:scaleX(1); }

        /* ── Weekly updates section bg texture ── */
        #hp-root .hp-updates-bg {
          position:absolute; inset:0; opacity:0.025;
          background-image:radial-gradient(circle, rgba(196,30,0,1) 1px, transparent 1px);
          background-size:24px 24px; pointer-events:none;
        }

        /* ── CTA banner ── */
        #hp-root .hp-cta-stat {
          transition:background .22s, transform .22s; border-radius:8px; cursor:default;
        }
        #hp-root .hp-cta-stat:hover { background:rgba(196,30,0,.06); transform:translateY(-2px); }
        #hp-root .hp-cta-stat-val { transition:transform .22s; display:block; }
        #hp-root .hp-cta-stat:hover .hp-cta-stat-val { transform:scale(1.1); }

        /* ── Services grid ── */
        #hp-root .hp-svc-col {
          transition: background .28s;
        }
        #hp-root .hp-svc-col:hover { background:rgba(196,30,0,0.02); }

        /* ── Featured hero shimmer ── */
        #hp-root .hp-feat-shimmer {
          position:absolute; inset:0; z-index:8; pointer-events:none;
          background:linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.05) 50%, transparent 62%);
          background-size:220% 100%; animation:hp-shimmer 4s ease infinite;
        }

        /* ── Pagination buttons ── */
        #hp-root .hp-pg-btn {
          width:44px; height:44px; border-radius:8px; background:white;
          border:2px solid #DC2626; color:#DC2626;
          display:flex; align-items:center; justify-content:center;
          transition:all .22s cubic-bezier(.22,1,.36,1); cursor:pointer;
        }
        #hp-root .hp-pg-btn:not(:disabled):hover {
          background:#DC2626; color:white; transform:scale(1.08);
          box-shadow:0 6px 20px rgba(220,38,38,0.35);
        }
        #hp-root .hp-pg-btn:disabled { opacity:.3; cursor:default; }

        @media (max-width: 900px) {
          #hp-root .hp-cards-grid { grid-template-columns: repeat(2,1fr) !important; }
          #hp-root .hp-svc-grid   { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 600px) {
          #hp-root .hp-cards-grid { grid-template-columns: 1fr !important; }
          #hp-root .hp-svc-grid   { grid-template-columns: 1fr !important; }
          #hp-root .hp-cta-inner  { flex-direction: column !important; }
        }
      `}</style>

      <SlideshowPortal open={slideshowOpen} onClose={() => setSlideshowOpen(false)} reports={allReports} jumpToReportRef={jumpToReportRef} />

      {/* ══════════════════════════════════════════════════ HERO */}
      <section style={{ position:'relative', minHeight:'100vh', display:'flex', flexDirection:'column', justifyContent:'flex-end', overflow:'hidden' }}>
        <img src={Fire} alt="BFP Station 1 Cogon" style={{ position:'absolute', inset:0, width:'100%', height:'85%', objectFit:'cover' }} />

        {/* overlays */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(5,2,1,.97) 0%,rgba(8,3,2,.74) 38%,rgba(0,0,0,.22) 100%)' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(110deg,rgba(5,2,1,.68) 0%,transparent 55%)' }} />
        {/* left accent strip */}
        <div style={{ position:'absolute', top:0, left:0, width:4, height:'100%', background:'linear-gradient(to bottom,#b52000 0%,#e06020 58%,transparent 100%)', opacity:.95 }} />
        {/* noise grain */}
        <div style={{ position:'absolute', inset:0, opacity:0.03, backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize:'160px 160px', pointerEvents:'none' }} />
        {/* animated glow orb top-right */}
        <div style={{ position:'absolute', top:'-15%', right:'-5%', width:520, height:520, borderRadius:'50%', background:'radial-gradient(circle, rgba(220,84,8,0.12) 0%, transparent 65%)', pointerEvents:'none', animation:'hp-orb 9s ease-in-out infinite' }} />

        <div style={{ position:'relative', zIndex:10, maxWidth:1280, margin:'0 auto', padding:'8rem 2.5rem 5rem', width:'100%' }}>
          <div style={{ maxWidth:720 }}>
            {/* status badges */}
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:32, flexWrap:'wrap' }}>
              <span style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 18px', borderRadius:999, background:'rgba(255,255,255,.08)', border:'1px solid rgba(255,255,255,.18)', backdropFilter:'blur(14px)', fontSize:12, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'white', fontFamily:"'Barlow Condensed',sans-serif" }}>
                <span style={{ width:8, height:8, borderRadius:'50%', background:'#4ade80', animation:'hm-pulseDot 2.2s ease-in-out infinite', flexShrink:0, display:'inline-block' }} />
                Station Operational · 24/7
              </span>
              <span style={{ display:'flex', alignItems:'center', gap:7, padding:'8px 18px', borderRadius:999, background:'rgba(180,40,10,.28)', border:'1px solid rgba(180,40,10,.5)', backdropFilter:'blur(14px)', fontSize:12, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:'white', fontFamily:"'Barlow Condensed',sans-serif" }}>
                <Shield size={12} /> BFP Station 1 · Cogon
              </span>
            </div>

            <h1 className="hp-f2" style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(3.4rem,9vw,7.2rem)', letterSpacing:'0.04em', lineHeight:0.88, color:'white', marginBottom:24 }}>
              COGON<br /><span style={{ color:'#E8622A' }}>FIRE STATION</span>
            </h1>

            <p className="hp-f3" style={{ fontSize:'1.05rem', color:'rgba(255,255,255,.65)', lineHeight:1.8, marginBottom:4, fontWeight:600, fontFamily:"'Barlow',sans-serif", letterSpacing:'.02em' }}>
              Capt. Vicente Roa, Brgy. 33, Cagayan De Oro City
            </p>
            <p className="hp-f3" style={{ fontSize:'1rem', color:'rgba(255,255,255,.44)', lineHeight:1.9, maxWidth:620, marginBottom:40, fontFamily:"'Barlow',sans-serif", fontWeight:400 }}>
              Committed to preventing and suppressing destructive fires, safeguarding lives and properties, and promoting fire safety awareness throughout Cagayan de Oro City.
            </p>

            <div className="hp-f4" style={{ display:'flex', flexWrap:'wrap', gap:12, marginBottom:44 }}>
              <Link to="/about"
                style={{ display:'inline-flex', alignItems:'center', gap:8, fontWeight:800, fontSize:14, padding:'14px 28px', borderRadius:12, background:'linear-gradient(135deg,#b52000,#e04810)', color:'white', textDecoration:'none', boxShadow:'0 8px 30px rgba(180,40,10,.5)', letterSpacing:'.04em', textTransform:'uppercase', fontFamily:"'Barlow Condensed',sans-serif", transition:'all .25s cubic-bezier(.22,1,.36,1)' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px) scale(1.03)'; e.currentTarget.style.boxShadow='0 16px 42px rgba(180,40,10,.65)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 8px 30px rgba(180,40,10,.5)'; }}
              >
                About Us <ArrowRight size={14} />
              </Link>
              <a href="tel:911"
                style={{ display:'inline-flex', alignItems:'center', gap:8, fontWeight:800, fontSize:14, padding:'14px 28px', borderRadius:12, background:'rgba(255,255,255,.08)', border:'1.5px solid rgba(255,255,255,.28)', color:'white', textDecoration:'none', backdropFilter:'blur(14px)', letterSpacing:'.04em', textTransform:'uppercase', fontFamily:"'Barlow Condensed',sans-serif", transition:'all .25s cubic-bezier(.22,1,.36,1)' }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,.18)'; e.currentTarget.style.borderColor='rgba(255,255,255,.5)'; e.currentTarget.style.transform='translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,.08)'; e.currentTarget.style.borderColor='rgba(255,255,255,.28)'; e.currentTarget.style.transform='none'; }}
              >
                <Phone size={14} /> Emergency: 911
              </a>
            </div>

            <div className="hp-f5" style={{ display:'flex', flexWrap:'wrap', gap:10 }}>
              {[
                { value:'24/7',  label:'Response'    },
                { value:'911',   label:'Emergency'   },
                { value:'35',    label:'Barangays'   },
                { value:'1990',  label:'Established' },
              ].map(({ value, label }) => (
                <div key={label} className="hp-stat-pill">
                  <p style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1rem', letterSpacing:'0.06em', color:'white', lineHeight:1 }}>{value}</p>
                  <p style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.14em', color:'rgba(255,255,255,.42)', marginTop:5, fontFamily:"'Barlow Condensed',sans-serif" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* wave cut bottom */}
        <div style={{ position:'absolute', bottom:-1, left:0, right:0, height:40, overflow:'hidden', pointerEvents:'none', zIndex:11 }}>
          <svg viewBox="0 0 1200 40" preserveAspectRatio="none" style={{ width:'100%', height:'100%' }}>
            <path d="M0,40 L0,14 Q300,40 600,18 Q900,2 1200,18 L1200,40 Z" fill="#F9FAFB" />
          </svg>
        </div>

        <div style={{ position:'absolute', bottom:28, left:'50%', animation:'hm-bounce 2.6s ease-in-out infinite' }}>
          <ChevronDown size={24} style={{ color:'rgba(255,255,255,.28)' }} />
        </div>
      </section>

      {/* ══════════════════════════════════════ WEEKLY UPDATES */}
      <section ref={setRef('updates')} style={{ background:'#F9FAFB', borderTop:'1px solid #E5E7EB', padding:'80px 0 96px', position:'relative', overflow:'hidden' }}>
        {/* subtle dot grid */}
        <div className="hp-updates-bg" />

        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 2.5rem', position:'relative' }}>

          {/* Section heading */}
          <div className={`hp-reveal ${visibleSections['updates'] ? 'visible' : ''}`} style={{ textAlign:'center', marginBottom:56 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:14, fontSize:12, fontWeight:800, textTransform:'uppercase', letterSpacing:'.2em', color:D.red, marginBottom:18, fontFamily:"'Barlow Condensed',sans-serif" }}>
              <span style={{ display:'inline-block', width:36, height:2, background:`linear-gradient(90deg,transparent,${D.red})`, borderRadius:1 }} />
              Latest from the Station
              <span style={{ display:'inline-block', width:36, height:2, background:`linear-gradient(90deg,${D.red},transparent)`, borderRadius:1 }} />
            </div>
            <h2 style={{ lineHeight:1.05, marginBottom:18 }}>
              <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontWeight:900, fontSize:'clamp(2.6rem,6vw,5rem)', color:'#1A1210', display:'inline', letterSpacing:'.04em' }}>Weekly </span>
              <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontWeight:900, fontSize:'clamp(2.6rem,6vw,5rem)', color:D.red, display:'inline', letterSpacing:'.04em' }}>Updates</span>
            </h2>
            <p style={{ fontSize:17, color:'#6B6258', fontFamily:"'Barlow',sans-serif", fontWeight:400, lineHeight:1.8, maxWidth:500, margin:'0 auto' }}>
              Station bulletins, training highlights, events, and team milestones
            </p>
          </div>

          {featuredSlides.length > 0 ? (
            <>
              {/* ── FEATURED HERO ── */}
              <div className={`hp-reveal-scale ${visibleSections['updates'] ? 'visible' : ''} hp-d2`}
                style={{ position:'relative', borderRadius:22, overflow:'hidden', boxShadow:'0 28px 72px rgba(0,0,0,0.2)', background:'#111827', marginBottom:48 }}>

                <div style={{ position:'relative', height:600, overflow:'hidden' }}>
                  {/* shimmer pass */}
                  <div className="hp-feat-shimmer" />

                  {isBdaySlide && <BirthdayFeaturedSlide key={featured.id} officer={featured.officer} />}

                  {!isBdaySlide && featured?.report && (() => {
                    const imgs = getImages(featured.report);
                    return (
                      <>
                        {imgs[0] ? (
                          <img key={featured.id} src={imgs[0]} alt={featured.report.title}
                            style={{ width:'100%', height:'100%', objectFit:'cover', display:'block', transition:'opacity .4s ease' }} />
                        ) : (
                          <div style={{ width:'100%', height:'100%', background:'linear-gradient(135deg,#1f2937,#374151)', display:'flex', alignItems:'center', justifyContent:'center' }}>
                            <Flame size={64} style={{ color:'rgba(255,255,255,0.2)' }} />
                          </div>
                        )}
                        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 45%, transparent 100%)' }} />
                        <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'40px 48px', color:'white' }}>
                          <div style={{ maxWidth:760 }}>
                            <div style={{ marginBottom:16 }}>
                              <span style={{ display:'inline-flex', alignItems:'center', gap:7, padding:'6px 16px', borderRadius:6, background:getCategoryBg(featured.report.category), color:'white', fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:12, letterSpacing:'.18em', textTransform:'uppercase' }}>
                                <Tag size={12} /> {featured.report.category}
                              </span>
                            </div>
                            <h3 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(2.2rem,5vw,2.2rem)', letterSpacing:'.04em', lineHeight:1.0, marginBottom:14, textShadow:'0 2px 20px rgba(0,0,0,0.8)', color:'white' }}>
                              {featured.report.title}
                            </h3>
                            <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:14, color:'rgba(255,255,255,0.75)' }}>
                              <Calendar size={15} />
                              <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:15, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase' }}>
                                {formatDate(featured.report.date)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </>
                    );
                  })()}

                  {featuredSlides.length > 1 && (
                    <>
                      <button className="feat-nav" onClick={prevFeatured} style={{ left:16 }}><ChevronLeft size={20} /></button>
                      <button className="feat-nav" onClick={nextFeatured} style={{ right:16 }}><ChevronRight size={20} /></button>
                    </>
                  )}

                  {/* dots */}
                  <div style={{ position:'absolute', bottom:24, right:32, display:'flex', gap:6, zIndex:15 }}>
                    {featuredSlides.map((s, idx) => (
                      <button key={s.id} type="button" onClick={() => goFeatured(idx)}
                        style={{ height:8, width:idx===featuredIdx ? 28:8, borderRadius:999, border:'none', padding:0, cursor:'pointer', background:idx===featuredIdx ? (s.type==='bday' ? '#F9A8D4' : 'white') : 'rgba(255,255,255,0.4)', transition:'all .28s' }} />
                    ))}
                  </div>

                  {isBdaySlide && (
                    <div style={{ position:'absolute', top:20, left:24, zIndex:15, display:'flex', alignItems:'center', gap:8 }}>
                      <div style={{ width:8, height:8, borderRadius:'50%', background:'#F9A8D4', boxShadow:'0 0 10px #F472B6', animation:'hm-pulseDot 2s ease-in-out infinite' }} />
                      <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, fontWeight:800, letterSpacing:'.18em', textTransform:'uppercase', color:'rgba(255,255,255,0.8)' }}>Today's Celebrant</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── GRID HEADER + CARDS ── */}
              {allReports.length > 0 && (
                <>
                  <div className={`hp-reveal ${visibleSections['updates'] ? 'visible' : ''} hp-d3`} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:12 }}>
                    <div>
                      <h3 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(2.8rem,3vw,2.8rem)', letterSpacing:'.04em', color:'#1A1210', lineHeight:1, marginBottom:6 }}>
                        This Week's <span style={{ color:D.red }}>Reports</span>
                      </h3>
                      <p style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', color:D.lo }}>
                        All {allReports.length} reports
                      </p>
                    </div>
                    {totalPages > 1 && (
                      <div style={{ display:'flex', gap:8 }}>
                        <button type="button" className="hp-pg-btn" onClick={handlePrevPage} disabled={currentPage === 0}>
                          <ChevronLeft size={20} />
                        </button>
                        <button type="button" className="hp-pg-btn" onClick={handleNextPage} disabled={currentPage === totalPages - 1}>
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ── 3-COL REPORT CARDS ── */}
                  <div className="hp-cards-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:24, marginBottom:24 }}>
                    {currentCards.map((report, cardIdx) => {
                      const images = getImages(report);
                      const catColor = getCategoryBg(report.category);
                      return (
                        <div key={report.id} className={`rpt-card hp-reveal ${visibleSections['updates'] ? 'visible' : ''} hp-d${Math.min(cardIdx + 1, 6)}`}
                          style={{ background:'white', borderRadius:14, overflow:'hidden', boxShadow:'0 2px 12px rgba(0,0,0,0.07)', cursor:'pointer', display:'flex', flexDirection:'column' }}
                          onClick={() => handleCardClick(report.id)}
                        >
                          {/* card number watermark */}
                          <div className="rpt-card-num" style={{ position:'absolute', top:-4, right:10, fontFamily:"'Barlow Condensed',sans-serif", fontSize:'7rem', fontWeight:900, color:'rgba(0,0,0,0.03)', lineHeight:1, userSelect:'none', pointerEvents:'none', letterSpacing:'-0.03em', zIndex:1 }}>
                            {String(currentPage * reportsPerPage + cardIdx + 1).padStart(2, '0')}
                          </div>

                          {/* image */}
                          <div style={{ position:'relative', height:220, overflow:'hidden', background:'#F3F4F6', flexShrink:0 }}>
                            {images[0] ? (
                              <img src={images[0]} alt={report.title} className="rpt-img" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                            ) : (
                              <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <Flame size={40} style={{ color:'#D1D5DB' }} />
                              </div>
                            )}
                            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)', pointerEvents:'none' }} />
                            <div style={{ position:'absolute', top:14, left:14 }}>
                              <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 12px', borderRadius:5, background:catColor, color:'white', fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:11, letterSpacing:'.18em', textTransform:'uppercase', boxShadow:'0 2px 8px rgba(0,0,0,0.25)' }}>
                                <Tag size={10} /> {report.category}
                              </span>
                            </div>
                            {images.length > 1 && (
                              <div style={{ position:'absolute', top:14, right:14 }}>
                                <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'5px 10px', borderRadius:5, background:'rgba(0,0,0,0.55)', backdropFilter:'blur(6px)', color:'white', fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:11, letterSpacing:'.08em' }}>
                                  <ImageIcon size={10} /> {images.length}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* body */}
                          <div style={{ padding:'18px 20px 20px', flex:1, display:'flex', flexDirection:'column', gap:8, position:'relative', zIndex:2 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:7, color:D.red }}>
                              <Calendar size={13} />
                              <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:12, letterSpacing:'.14em', textTransform:'uppercase' }}>
                                {formatDateShort(report.date)}
                              </span>
                            </div>
                            <h3 style={{ fontFamily:"'Barlow',sans-serif", fontWeight:800, fontSize:20, color:'#1A1210', lineHeight:1.25, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                              {report.title}
                            </h3>
                            {/* colored bottom rule */}
                            <div style={{ height:2.5, background:`linear-gradient(90deg,${catColor},${catColor}66,transparent)`, borderRadius:1, marginTop:6 }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {totalPages > 1 && (
                    <div style={{ textAlign:'center' }}>
                      <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:13, letterSpacing:'.14em', textTransform:'uppercase', color:D.lo }}>
                        Page {currentPage + 1} of {totalPages}
                      </span>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <div style={{ padding:'80px 24px', textAlign:'center', borderRadius:18, border:'1.5px dashed #D1D5DB', background:'white' }}>
              <Flame size={40} style={{ color:'#D1D5DB', marginBottom:16 }} />
              <p style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'2.2rem', letterSpacing:'.06em', color:'#9CA3AF' }}>No Recent Reports</p>
              <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:15, color:'#9CA3AF', marginTop:6 }}>No posts from the last 7 days. Older reports are available in the <Link to="/weekly-reports" style={{ color:D.red, fontWeight:700, textDecoration:'none' }}>Weekly Reports</Link> archive.</p>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════ CORE SERVICES */}
      <section ref={setRef('services')} style={{ background:'white', borderTop:'1px solid #EAE4DC', padding:'92px 0 100px', position:'relative', overflow:'hidden' }}>
        {/* large watermark */}
        <div style={{ position:'absolute', right:'-2%', top:'50%', transform:'translateY(-50%)', fontFamily:"'Bebas Neue',sans-serif", fontWeight:900, fontSize:'clamp(8rem,18vw,16rem)', lineHeight:1, color:'rgba(196,30,0,0.025)', pointerEvents:'none', userSelect:'none', whiteSpace:'nowrap', letterSpacing:'.04em' }}>FIRE</div>

        <div style={{ maxWidth:1280, margin:'0 auto', padding:'0 2rem', position:'relative' }}>

          {/* heading */}
          <div className={`hp-reveal ${visibleSections['services'] ? 'visible' : ''}`} style={{ textAlign:'center', marginBottom:64 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:14, fontSize:12, fontWeight:800, textTransform:'uppercase', letterSpacing:'.2em', color:D.red, marginBottom:18, fontFamily:"'Barlow Condensed',sans-serif" }}>
              <span style={{ display:'inline-block', width:36, height:2, background:`linear-gradient(90deg,transparent,${D.red})`, borderRadius:1 }} />
              What We Do
              <span style={{ display:'inline-block', width:36, height:2, background:`linear-gradient(90deg,${D.red},transparent)`, borderRadius:1 }} />
            </div>
            <h2 style={{ lineHeight:1.05, marginBottom:18 }}>
              <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontWeight:900, fontSize:'clamp(2.6rem,5vw,4rem)', color:'#1A1210', display:'inline', letterSpacing:'.04em' }}>Our Core </span>
              <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontWeight:900, fontSize:'clamp(2.6rem,5vw,4rem)', color:D.red, display:'inline', letterSpacing:'.04em' }}>Services</span>
            </h2>
            <p style={{ fontSize:17, color:'#6B6258', fontFamily:"'Barlow',sans-serif", fontWeight:400, lineHeight:1.8, maxWidth:500, margin:'0 auto' }}>
              BFP Station 1 — Cogon serves the community with trained personnel, modern equipment, and unwavering commitment to public safety.
            </p>
          </div>

          {/* services grid */}
          <div className={`hp-svc-grid hp-reveal-scale ${visibleSections['services'] ? 'visible' : ''} hp-d2`} style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:0, border:'1.5px solid #E4DDD4', borderRadius:14, overflow:'hidden', marginBottom:52, boxShadow:'0 6px 40px rgba(0,0,0,.08)' }}>
            <div className="hp-svc-col" style={{ borderRight:'1.5px solid #E4DDD4' }}>
              <ServiceCard icon={<Flame size={23} />} number="01" title="Fire Prevention & Inspection" description="Systematic fire safety inspections of residential, commercial, and industrial establishments to identify and eliminate hazards before they escalate." tag="Prevention First" accent="#C41E00" accentBg="rgba(196,30,0,.07)" accentBorder="rgba(196,30,0,.22)" />
            </div>
            <div className="hp-svc-col" style={{ borderRight:'1.5px solid #E4DDD4' }}>
              <ServiceCard icon={<AlertTriangle size={23} />} number="02" title="24/7 Emergency Response" description="Round-the-clock standby response for all fire emergencies, with rapid dispatch and professionally trained suppression teams ready to deploy." tag="Always Ready" accent="#B04500" accentBg="rgba(176,69,0,.07)" accentBorder="rgba(176,69,0,.22)" />
            </div>
            <div className="hp-svc-col">
              <ServiceCard icon={<Users size={23} />} number="03" title="Fire Safety Education" description="Community outreach, school drills, and business training programs designed to build a fire-safe culture across Cagayan de Oro City." tag="Community First" accent="#1558B0" accentBg="rgba(21,88,176,.07)" accentBorder="rgba(21,88,176,.2)" />
            </div>
          </div>

          {/* Bottom CTA banner */}
          <div className={`hp-reveal ${visibleSections['services'] ? 'visible' : ''} hp-d3`} style={{ borderRadius:22, overflow:'hidden', background:'linear-gradient(135deg,#FDF8F3,#F5EDE3)', border:`1.5px solid ${D.br}`, position:'relative', boxShadow:'0 8px 40px rgba(0,0,0,.08)' }}>
            {/* animated top bar */}
            <div style={{ position:'absolute', top:0, left:0, right:0, height:5, background:`linear-gradient(90deg,${D.redDk},${D.red},${D.ora},${D.amb},${D.red},${D.redDk})`, backgroundSize:'200% 100%', animation:'hp-gradFlow 4s linear infinite' }} />
            {/* dot pattern */}
            <div style={{ position:'absolute', inset:0, pointerEvents:'none', opacity:0.022, backgroundImage:`radial-gradient(circle, ${D.red} 1px, transparent 1px)`, backgroundSize:'18px 18px' }} />
            {/* bg watermark */}
            <div style={{ position:'absolute', right:-8, top:'50%', transform:'translateY(-50%)', fontFamily:"'Bebas Neue',sans-serif", fontWeight:900, fontSize:'clamp(5rem,14vw,11rem)', lineHeight:1, color:'rgba(100,60,20,.04)', pointerEvents:'none', userSelect:'none', whiteSpace:'nowrap', letterSpacing:'.04em' }}>BFP COGON</div>
            {/* circle decors */}
            <div style={{ position:'absolute', left:-60, top:-60, width:240, height:240, borderRadius:'50%', border:'40px solid rgba(196,30,0,0.04)', pointerEvents:'none' }} />

            <div className="hp-cta-inner" style={{ position:'relative', zIndex:1, padding:'38px 44px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:32 }}>
              <div style={{ display:'flex', alignItems:'center', gap:22, flex:1, minWidth:200 }}>
                <div>
                  <p style={{ fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'.16em', color:D.red, marginBottom:7, fontFamily:"'Barlow Condensed',sans-serif" }}>Bureau of Fire Protection</p>
                  <h3 style={{ fontFamily:"'Poppins',Georgia,serif", fontWeight:800, fontSize:'clamp(1.1rem,2vw,1.55rem)', color:D.hi, lineHeight:1.15, marginBottom:7 }}>Lingkod Bayan, Ipaglaban ang Kaligtasan</h3>
                  <p style={{ fontSize:13, color:D.lo, fontWeight:500, fontFamily:"'Barlow',sans-serif", letterSpacing:'.01em' }}>BFP Station 1 · Cogon · Cagayan de Oro City · Region X</p>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'stretch', borderLeft:`1.5px solid ${D.br}`, paddingLeft:32, flexShrink:0 }}>
                {[
                  { label:'Established', value:'1990'    },
                  { label:'Coverage',    value:'35 Brgy.' },
                  { label:'Response',    value:'24 / 7'  },
                ].map(({ label, value }, i) => (
                  <div key={label} className="hp-cta-stat"
                    style={{ textAlign:'center', padding:'6px 26px', borderLeft:i>0 ? `1.5px solid ${D.br}`:'none' }}
                  >
                    <span className="hp-cta-stat-val" style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:'1.55rem', letterSpacing:'.03em', color:D.ora, lineHeight:1 }}>{value}</span>
                    <span style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'.13em', color:D.lo, marginTop:6, display:'block', fontFamily:"'Barlow Condensed',sans-serif" }}>{label}</span>
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