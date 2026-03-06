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
      {/* large bg number */}
      <div style={{ position:'absolute', top:4, right:12, fontFamily:"'Barlow Condensed',sans-serif", fontSize:'5.5rem', fontWeight:900, color:hovered ? `${accent}16` : 'rgba(0,0,0,.04)', lineHeight:1, userSelect:'none', pointerEvents:'none', letterSpacing:'-0.03em', transition:'color .3s, transform .3s', transform: hovered ? 'translateY(-6px)' : 'none' }}>
        {number}
      </div>
      {/* icon */}
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
        @keyframes hp-fadeUp    { from{opacity:0;transform:translateY(18px)} to{opacity:1;transform:translateY(0)} }
        @keyframes hm-bounce    { 0%,100%{transform:translateX(-50%) translateY(0)} 50%{transform:translateX(-50%) translateY(6px)} }
        @keyframes hm-pulseDot  { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.4;transform:scale(.8)} }
        @keyframes bday-float   { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes hp-gradFlow  { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes hp-shimmer   { 0%{background-position:-200% center} 100%{background-position:200% center} }
        @keyframes hp-orb       { 0%,100%{transform:translate(0,0) scale(1)} 50%{transform:translate(14px,-10px) scale(1.04)} }
        @keyframes hp-lineGrow  { from{transform:scaleX(0)} to{transform:scaleX(1)} }
        @keyframes hp-scanline  { 0%{transform:translateY(-100%)} 100%{transform:translateY(100vh)} }

        /* ── Hero text entrance ── */
        #hp-root .hp-f1 { animation: hp-fadeUp .8s ease .05s both }
        #hp-root .hp-f2 { animation: hp-fadeUp .8s ease .15s both }
        #hp-root .hp-f3 { animation: hp-fadeUp .8s ease .28s both }
        #hp-root .hp-f4 { animation: hp-fadeUp .8s ease .42s both }
        #hp-root .hp-f5 { animation: hp-fadeUp .8s ease .56s both }

        /* ── Scroll reveal ── */
        #hp-root .hp-reveal       { opacity:0; transform:translateY(24px);  transition:opacity 0.78s cubic-bezier(.22,1,.36,1), transform 0.78s cubic-bezier(.22,1,.36,1); }
        #hp-root .hp-reveal-left  { opacity:0; transform:translateX(-24px); transition:opacity 0.78s cubic-bezier(.22,1,.36,1), transform 0.78s cubic-bezier(.22,1,.36,1); }
        #hp-root .hp-reveal-right { opacity:0; transform:translateX(24px);  transition:opacity 0.78s cubic-bezier(.22,1,.36,1), transform 0.78s cubic-bezier(.22,1,.36,1); }
        #hp-root .hp-reveal-scale { opacity:0; transform:scale(0.93);       transition:opacity 0.78s cubic-bezier(.22,1,.36,1), transform 0.78s cubic-bezier(.22,1,.36,1); }
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
          transition: height .32s cubic-bezier(.22,1,.36,1); border-radius:0 0 12px 12px;
          pointer-events:none;
        }
        #hp-root .rpt-card:hover { transform: translateY(-6px); box-shadow: 0 18px 44px rgba(0,0,0,0.14) !important; }
        #hp-root .rpt-card:hover::after { height:3px; background:linear-gradient(90deg,#C41E00,#E8340A,transparent); }
        #hp-root .rpt-card:hover .rpt-img { transform: scale(1.07); }
        #hp-root .rpt-img { transition: transform .5s ease; }
        #hp-root .rpt-card:hover .rpt-card-num { opacity: 0.1 !important; transform:translateY(-8px); }
        #hp-root .rpt-card-num { transition: opacity .3s, transform .3s; }

        /* ── Featured hero nav ── */
        #hp-root .feat-nav {
          position:absolute; top:50%; transform:translateY(-50%);
          width:38px; height:38px; border-radius:50%;
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
          backdropFilter:blur(14px); border-radius:10px; padding:8px 14px; text-align:center;
          transition:all .25s cubic-bezier(.22,1,.36,1);
        }
        #hp-root .hp-stat-pill:hover {
          background:rgba(255,255,255,.2); transform:translateY(-3px);
          border-color:rgba(255,255,255,.35);
          box-shadow:0 10px 28px rgba(0,0,0,.22);
        }

        /* ── Weekly updates section bg texture ── */
        #hp-root .hp-updates-bg {
          position:absolute; inset:0; opacity:0.025;
          background-image:radial-gradient(circle, rgba(196,30,0,1) 1px, transparent 1px);
          background-size:20px 20px; pointer-events:none;
        }

        /* ── CTA banner ── */
        #hp-root .hp-cta-stat {
          transition:background .22s, transform .22s; border-radius:6px; cursor:default;
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
          width:36px; height:36px; border-radius:7px; background:white;
          border:2px solid #DC2626; color:#DC2626;
          display:flex; align-items:center; justify-content:center;
          transition:all .22s cubic-bezier(.22,1,.36,1); cursor:pointer;
        }
        #hp-root .hp-pg-btn:not(:disabled):hover {
          background:#DC2626; color:white; transform:scale(1.08);
          box-shadow:0 5px 16px rgba(220,38,38,0.35);
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
        <div style={{ position:'absolute', top:0, left:0, width:3, height:'100%', background:'linear-gradient(to bottom,#b52000 0%,#e06020 58%,transparent 100%)', opacity:.95 }} />
        {/* noise grain */}
        <div style={{ position:'absolute', inset:0, opacity:0.03, backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize:'160px 160px', pointerEvents:'none' }} />
        {/* animated glow orb top-right */}
        <div style={{ position:'absolute', top:'-15%', right:'-5%', width:400, height:400, borderRadius:'50%', background:'radial-gradient(circle, rgba(220,84,8,0.12) 0%, transparent 65%)', pointerEvents:'none', animation:'hp-orb 9s ease-in-out infinite' }} />

        <div style={{ position:'relative', zIndex:10, maxWidth:1280, margin:'0 auto', padding:'6rem 2rem 7rem', width:'100%' }}>
          <div style={{ maxWidth:640 }}>
            {/* status badges */}
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

            {/* District label — always visible over image */}
            <div className="hp-f3" style={{ display:'inline-flex', alignItems:'center', gap:8, marginBottom:14, padding:'7px 16px', borderRadius:6, background:'rgba(0,0,0,0.55)', backdropFilter:'blur(12px)', border:'1px solid rgba(255,255,255,0.18)', boxShadow:'0 2px 16px rgba(0,0,0,0.4)' }}>
              <Flame size={13} style={{ color:'#E8622A', flexShrink:0 }} />
              <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:13, letterSpacing:'.22em', textTransform:'uppercase', color:'white', textShadow:'0 1px 6px rgba(0,0,0,0.8)' }}>
                Cagayan de Oro Fire District
              </span>
            </div>

            <p className="hp-f3" style={{ fontSize:'0.85rem', color:'rgba(255,255,255,.75)', lineHeight:1.75, marginBottom:4, fontWeight:500, fontFamily:"'Barlow',sans-serif", letterSpacing:'.01em', textShadow:'0 1px 10px rgba(0,0,0,0.9)' }}>
              Capt. Vicente Roa, Brgy. 33, Cagayan De Oro City
            </p>
            <p className="hp-f3" style={{ fontSize:'0.85rem', color:'rgba(255,255,255,.55)', lineHeight:1.85, maxWidth:560, marginBottom:30, fontFamily:"'Barlow',sans-serif", fontWeight:400, textShadow:'0 1px 12px rgba(0,0,0,0.9)' }}>
              Committed to preventing and suppressing destructive fires, safeguarding lives and properties, and promoting fire safety awareness throughout Cagayan de Oro City.
            </p>

            <div className="hp-f4" style={{ display:'flex', flexWrap:'wrap', gap:10, marginBottom:32 }}>
              <Link to="/about"
                style={{ display:'inline-flex', alignItems:'center', gap:7, fontWeight:800, fontSize:12, padding:'11px 22px', borderRadius:10, background:'linear-gradient(135deg,#b52000,#e04810)', color:'white', textDecoration:'none', boxShadow:'0 7px 24px rgba(180,40,10,.5)', letterSpacing:'.04em', textTransform:'uppercase', fontFamily:"'Barlow Condensed',sans-serif", transition:'all .25s cubic-bezier(.22,1,.36,1)' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px) scale(1.03)'; e.currentTarget.style.boxShadow='0 14px 36px rgba(180,40,10,.65)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 7px 24px rgba(180,40,10,.5)'; }}
              >
                About Us <ArrowRight size={13} />
              </Link>
              <a href="tel:911"
                style={{ display:'inline-flex', alignItems:'center', gap:7, fontWeight:800, fontSize:12, padding:'11px 22px', borderRadius:10, background:'rgba(255,255,255,.08)', border:'1.5px solid rgba(255,255,255,.28)', color:'white', textDecoration:'none', backdropFilter:'blur(14px)', letterSpacing:'.04em', textTransform:'uppercase', fontFamily:"'Barlow Condensed',sans-serif", transition:'all .25s cubic-bezier(.22,1,.36,1)' }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,.18)'; e.currentTarget.style.borderColor='rgba(255,255,255,.5)'; e.currentTarget.style.transform='translateY(-3px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,.08)'; e.currentTarget.style.borderColor='rgba(255,255,255,.28)'; e.currentTarget.style.transform='none'; }}
              >
                <Phone size={13} /> Emergency: 911
              </a>
            </div>

            <div className="hp-f5" style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
              {[
                { value:'24/7',  label:'Response'    },
                { value:'911',   label:'Emergency'   },
                { value:'35',    label:'Barangays'   },
                { value:'1990',  label:'Established' },
              ].map(({ value, label }) => (
                <div key={label} className="hp-stat-pill">
                  <p style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'0.85rem', letterSpacing:'0.06em', color:'white', lineHeight:1 }}>{value}</p>
                  <p style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.14em', color:'rgba(255,255,255,.42)', marginTop:4, fontFamily:"'Barlow Condensed',sans-serif" }}>{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* wave cut bottom */}
        <div style={{ position:'absolute', bottom:-1, left:0, right:0, height:32, overflow:'hidden', pointerEvents:'none', zIndex:11 }}>
          <svg viewBox="0 0 1200 32" preserveAspectRatio="none" style={{ width:'100%', height:'100%' }}>
            <path d="M0,32 L0,11 Q300,32 600,14 Q900,2 1200,14 L1200,32 Z" fill="#F9FAFB" />
          </svg>
        </div>

        <div style={{ position:'absolute', bottom:22, left:'50%', animation:'hm-bounce 2.6s ease-in-out infinite' }}>
          <ChevronDown size={20} style={{ color:'rgba(255,255,255,.28)' }} />
        </div>
      </section>

      {/* ══════════════════════════════════════ WEEKLY UPDATES */}
      <section ref={setRef('updates')} style={{ background:'#F9FAFB', borderTop:'1px solid #E5E7EB', padding:'56px 0 68px', position:'relative', overflow:'hidden' }}>
        {/* subtle dot grid */}
        <div className="hp-updates-bg" />

        <div style={{ maxWidth:1180, margin:'0 auto', padding:'0 2rem', position:'relative' }}>

          {/* Section heading */}
          <div className={`hp-reveal ${visibleSections['updates'] ? 'visible' : ''}`} style={{ textAlign:'center', marginBottom:40 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:12, fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'.2em', color:D.red, marginBottom:14, fontFamily:"'Barlow Condensed',sans-serif" }}>
              <span style={{ display:'inline-block', width:28, height:2, background:`linear-gradient(90deg,transparent,${D.red})`, borderRadius:1 }} />
              Latest from the Station
              <span style={{ display:'inline-block', width:28, height:2, background:`linear-gradient(90deg,${D.red},transparent)`, borderRadius:1 }} />
            </div>
            <h2 style={{ lineHeight:1.05, marginBottom:14 }}>
              <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontWeight:900, fontSize:'clamp(2rem,4.5vw,3.6rem)', color:'#1A1210', display:'inline', letterSpacing:'.04em' }}>Weekly </span>
              <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontWeight:900, fontSize:'clamp(2rem,4.5vw,3.6rem)', color:D.red, display:'inline', letterSpacing:'.04em' }}>Updates</span>
            </h2>
            <p style={{ fontSize:15, color:'#6B6258', fontFamily:"'Barlow',sans-serif", fontWeight:400, lineHeight:1.75, maxWidth:440, margin:'0 auto' }}>
              Station bulletins, training highlights, events, and team milestones
            </p>
          </div>

          {featuredSlides.length > 0 ? (
            <>
              {/* ── FEATURED HERO ── */}
              <div className={`hp-reveal-scale ${visibleSections['updates'] ? 'visible' : ''} hp-d2`}
                style={{ position:'relative', borderRadius:18, overflow:'hidden', boxShadow:'0 20px 56px rgba(0,0,0,0.18)', background:'#111827', marginBottom:36 }}>

                <div style={{ position:'relative', height:460, overflow:'hidden' }}>
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
                            <Flame size={52} style={{ color:'rgba(255,255,255,0.2)' }} />
                          </div>
                        )}
                        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.45) 45%, transparent 100%)' }} />
                        <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'28px 36px', color:'white' }}>
                          <div style={{ maxWidth:680 }}>
                            <div style={{ marginBottom:12 }}>
                              <span style={{ display:'inline-flex', alignItems:'center', gap:6, padding:'5px 13px', borderRadius:5, background:getCategoryBg(featured.report.category), color:'white', fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:11, letterSpacing:'.18em', textTransform:'uppercase' }}>
                                <Tag size={11} /> {featured.report.category}
                              </span>
                            </div>
                            <h3 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(1.8rem,3.6vw,2.6rem)', letterSpacing:'.04em', lineHeight:1.0, marginBottom:10, textShadow:'0 2px 20px rgba(0,0,0,0.8)', color:'white' }}>
                              {featured.report.title}
                            </h3>
                            <div style={{ display:'flex', alignItems:'center', gap:7, color:'rgba(255,255,255,0.75)' }}>
                              <Calendar size={13} />
                              <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, fontWeight:700, letterSpacing:'.1em', textTransform:'uppercase' }}>
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
                      <button className="feat-nav" onClick={prevFeatured} style={{ left:14 }}><ChevronLeft size={17} /></button>
                      <button className="feat-nav" onClick={nextFeatured} style={{ right:14 }}><ChevronRight size={17} /></button>
                    </>
                  )}

                  {/* dots */}
                  <div style={{ position:'absolute', bottom:18, right:26, display:'flex', gap:5, zIndex:15 }}>
                    {featuredSlides.map((s, idx) => (
                      <button key={s.id} type="button" onClick={() => goFeatured(idx)}
                        style={{ height:7, width:idx===featuredIdx ? 22:7, borderRadius:999, border:'none', padding:0, cursor:'pointer', background:idx===featuredIdx ? (s.type==='bday' ? '#F9A8D4' : 'white') : 'rgba(255,255,255,0.4)', transition:'all .28s' }} />
                    ))}
                  </div>

                  {isBdaySlide && (
                    <div style={{ position:'absolute', top:16, left:20, zIndex:15, display:'flex', alignItems:'center', gap:7 }}>
                      <div style={{ width:7, height:7, borderRadius:'50%', background:'#F9A8D4', boxShadow:'0 0 8px #F472B6', animation:'hm-pulseDot 2s ease-in-out infinite' }} />
                      <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:10, fontWeight:800, letterSpacing:'.18em', textTransform:'uppercase', color:'rgba(255,255,255,0.8)' }}>Today's Celebrant</span>
                    </div>
                  )}
                </div>
              </div>

              {/* ── GRID HEADER + CARDS ── */}
              {allReports.length > 0 && (
                <>
                  <div className={`hp-reveal ${visibleSections['updates'] ? 'visible' : ''} hp-d3`} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:20, flexWrap:'wrap', gap:10 }}>
                    <div>
                      <h3 style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'clamp(2rem,2.4vw,2.2rem)', letterSpacing:'.04em', color:'#1A1210', lineHeight:1, marginBottom:4 }}>
                        This Week's <span style={{ color:D.red }}>Reports</span>
                      </h3>
                      <p style={{ fontFamily:"'Barlow Condensed',sans-serif", fontSize:12, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', color:D.lo }}>
                        All {allReports.length} reports
                      </p>
                    </div>
                    {totalPages > 1 && (
                      <div style={{ display:'flex', gap:7 }}>
                        <button type="button" className="hp-pg-btn" onClick={handlePrevPage} disabled={currentPage === 0}>
                          <ChevronLeft size={17} />
                        </button>
                        <button type="button" className="hp-pg-btn" onClick={handleNextPage} disabled={currentPage === totalPages - 1}>
                          <ChevronRight size={17} />
                        </button>
                      </div>
                    )}
                  </div>

                  {/* ── 3-COL REPORT CARDS ── */}
                  <div className="hp-cards-grid" style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:18, marginBottom:18 }}>
                    {currentCards.map((report, cardIdx) => {
                      const images = getImages(report);
                      const catColor = getCategoryBg(report.category);
                      return (
                        <div key={report.id} className={`rpt-card hp-reveal ${visibleSections['updates'] ? 'visible' : ''} hp-d${Math.min(cardIdx + 1, 6)}`}
                          style={{ background:'white', borderRadius:12, overflow:'hidden', boxShadow:'0 2px 10px rgba(0,0,0,0.07)', cursor:'pointer', display:'flex', flexDirection:'column' }}
                          onClick={() => handleCardClick(report.id)}
                        >
                          {/* card number watermark */}
                          <div className="rpt-card-num" style={{ position:'absolute', top:-4, right:8, fontFamily:"'Barlow Condensed',sans-serif", fontSize:'5rem', fontWeight:900, color:'rgba(0,0,0,0.03)', lineHeight:1, userSelect:'none', pointerEvents:'none', letterSpacing:'-0.03em', zIndex:1 }}>
                            {String(currentPage * reportsPerPage + cardIdx + 1).padStart(2, '0')}
                          </div>

                          {/* image */}
                          <div style={{ position:'relative', height:175, overflow:'hidden', background:'#F3F4F6', flexShrink:0 }}>
                            {images[0] ? (
                              <img src={images[0]} alt={report.title} className="rpt-img" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
                            ) : (
                              <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center' }}>
                                <Flame size={32} style={{ color:'#D1D5DB' }} />
                              </div>
                            )}
                            <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.6) 0%, rgba(0,0,0,0.1) 50%, transparent 100%)', pointerEvents:'none' }} />
                            <div style={{ position:'absolute', top:10, left:10 }}>
                              <span style={{ display:'inline-flex', alignItems:'center', gap:5, padding:'4px 10px', borderRadius:4, background:catColor, color:'white', fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:10, letterSpacing:'.18em', textTransform:'uppercase', boxShadow:'0 2px 7px rgba(0,0,0,0.25)' }}>
                                <Tag size={9} /> {report.category}
                              </span>
                            </div>
                            {images.length > 1 && (
                              <div style={{ position:'absolute', top:10, right:10 }}>
                                <span style={{ display:'inline-flex', alignItems:'center', gap:4, padding:'4px 8px', borderRadius:4, background:'rgba(0,0,0,0.55)', backdropFilter:'blur(6px)', color:'white', fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:10, letterSpacing:'.08em' }}>
                                  <ImageIcon size={9} /> {images.length}
                                </span>
                              </div>
                            )}
                          </div>

                          {/* body */}
                          <div style={{ padding:'14px 16px 16px', flex:1, display:'flex', flexDirection:'column', gap:6, position:'relative', zIndex:2 }}>
                            <div style={{ display:'flex', alignItems:'center', gap:6, color:D.red }}>
                              <Calendar size={11} />
                              <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:800, fontSize:11, letterSpacing:'.14em', textTransform:'uppercase' }}>
                                {formatDateShort(report.date)}
                              </span>
                            </div>
                            <h3 style={{ fontFamily:"'Barlow',sans-serif", fontWeight:800, fontSize:16, color:'#1A1210', lineHeight:1.25, display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                              {report.title}
                            </h3>
                            {/* colored bottom rule */}
                            <div style={{ height:2, background:`linear-gradient(90deg,${catColor},${catColor}66,transparent)`, borderRadius:1, marginTop:4 }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {totalPages > 1 && (
                    <div style={{ textAlign:'center' }}>
                      <span style={{ fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:12, letterSpacing:'.14em', textTransform:'uppercase', color:D.lo }}>
                        Page {currentPage + 1} of {totalPages}
                      </span>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <div style={{ padding:'60px 24px', textAlign:'center', borderRadius:16, border:'1.5px dashed #D1D5DB', background:'white' }}>
              <Flame size={34} style={{ color:'#D1D5DB', marginBottom:14 }} />
              <p style={{ fontFamily:"'Bebas Neue',sans-serif", fontSize:'1.8rem', letterSpacing:'.06em', color:'#9CA3AF' }}>No Recent Reports</p>
              <p style={{ fontFamily:"'Barlow',sans-serif", fontSize:14, color:'#9CA3AF', marginTop:5 }}>No posts from the last 7 days. Older reports are available in the <Link to="/weekly-reports" style={{ color:D.red, fontWeight:700, textDecoration:'none' }}>Weekly Reports</Link> archive.</p>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════ CORE SERVICES */}
      <section ref={setRef('services')} style={{ background:'white', borderTop:'1px solid #EAE4DC', padding:'64px 0 72px', position:'relative', overflow:'hidden' }}>
        {/* large watermark */}
        <div style={{ position:'absolute', right:'-2%', top:'50%', transform:'translateY(-50%)', fontFamily:"'Bebas Neue',sans-serif", fontWeight:900, fontSize:'clamp(6rem,14vw,12rem)', lineHeight:1, color:'rgba(196,30,0,0.025)', pointerEvents:'none', userSelect:'none', whiteSpace:'nowrap', letterSpacing:'.04em' }}>FIRE</div>

        <div style={{ maxWidth:1180, margin:'0 auto', padding:'0 2rem', position:'relative' }}>

          {/* heading */}
          <div className={`hp-reveal ${visibleSections['services'] ? 'visible' : ''}`} style={{ textAlign:'center', marginBottom:44 }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:12, fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'.2em', color:D.red, marginBottom:14, fontFamily:"'Barlow Condensed',sans-serif" }}>
              <span style={{ display:'inline-block', width:28, height:2, background:`linear-gradient(90deg,transparent,${D.red})`, borderRadius:1 }} />
              What We Do
              <span style={{ display:'inline-block', width:28, height:2, background:`linear-gradient(90deg,${D.red},transparent)`, borderRadius:1 }} />
            </div>
            <h2 style={{ lineHeight:1.05, marginBottom:14 }}>
              <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontWeight:900, fontSize:'clamp(2rem,3.8vw,3.2rem)', color:'#1A1210', display:'inline', letterSpacing:'.04em' }}>Our Core </span>
              <span style={{ fontFamily:"'Bebas Neue',sans-serif", fontWeight:900, fontSize:'clamp(2rem,3.8vw,3.2rem)', color:D.red, display:'inline', letterSpacing:'.04em' }}>Services</span>
            </h2>
            <p style={{ fontSize:15, color:'#6B6258', fontFamily:"'Barlow',sans-serif", fontWeight:400, lineHeight:1.75, maxWidth:440, margin:'0 auto' }}>
              BFP Station 1 — Cogon serves the community with trained personnel, modern equipment, and unwavering commitment to public safety.
            </p>
          </div>

          {/* services grid */}
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

          {/* Bottom CTA banner */}
          <div className={`hp-reveal ${visibleSections['services'] ? 'visible' : ''} hp-d3`} style={{ borderRadius:16, overflow:'hidden', background:'linear-gradient(135deg,#FDF8F3,#F5EDE3)', border:`1.5px solid ${D.br}`, position:'relative', boxShadow:'0 6px 32px rgba(0,0,0,.07)' }}>
            {/* animated top bar */}
            <div style={{ position:'absolute', top:0, left:0, right:0, height:4, background:`linear-gradient(90deg,${D.redDk},${D.red},${D.ora},${D.amb},${D.red},${D.redDk})`, backgroundSize:'200% 100%', animation:'hp-gradFlow 4s linear infinite' }} />
            {/* dot pattern */}
            <div style={{ position:'absolute', inset:0, pointerEvents:'none', opacity:0.022, backgroundImage:`radial-gradient(circle, ${D.red} 1px, transparent 1px)`, backgroundSize:'16px 16px' }} />
            {/* bg watermark */}
            <div style={{ position:'absolute', right:-8, top:'50%', transform:'translateY(-50%)', fontFamily:"'Bebas Neue',sans-serif", fontWeight:900, fontSize:'clamp(3.5rem,10vw,8rem)', lineHeight:1, color:'rgba(100,60,20,.04)', pointerEvents:'none', userSelect:'none', whiteSpace:'nowrap', letterSpacing:'.04em' }}>BFP COGON</div>
            {/* circle decors */}
            <div style={{ position:'absolute', left:-50, top:-50, width:200, height:200, borderRadius:'50%', border:'36px solid rgba(196,30,0,0.04)', pointerEvents:'none' }} />

            <div className="hp-cta-inner" style={{ position:'relative', zIndex:1, padding:'28px 36px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:24 }}>
              <div style={{ display:'flex', alignItems:'center', gap:18, flex:1, minWidth:200 }}>
                <div>
                  <p style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'.16em', color:D.red, marginBottom:5, fontFamily:"'Barlow Condensed',sans-serif" }}>Bureau of Fire Protection</p>
                  <h3 style={{ fontFamily:"'Poppins',Georgia,serif", fontWeight:800, fontSize:'clamp(0.95rem,1.6vw,1.25rem)', color:D.hi, lineHeight:1.2, marginBottom:5 }}>Lingkod Bayan, Ipaglaban ang Kaligtasan</h3>
                  <p style={{ fontSize:12, color:D.lo, fontWeight:500, fontFamily:"'Barlow',sans-serif", letterSpacing:'.01em' }}>BFP Station 1 · Cogon · Cagayan de Oro City · Region X</p>
                </div>
              </div>
              <div style={{ display:'flex', alignItems:'stretch', borderLeft:`1.5px solid ${D.br}`, paddingLeft:24, flexShrink:0 }}>
                {[
                  { label:'Established', value:'1990'    },
                  { label:'Coverage',    value:'35 Brgy.' },
                  { label:'Response',    value:'24 / 7'  },
                ].map(({ label, value }, i) => (
                  <div key={label} className="hp-cta-stat"
                    style={{ textAlign:'center', padding:'5px 20px', borderLeft:i>0 ? `1.5px solid ${D.br}`:'none' }}
                  >
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