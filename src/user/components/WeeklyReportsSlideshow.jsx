import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight, Image as ImageIcon, X, Play, Pause, Shield, Tag, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { getOfficers } from '../../utils/storage';

// ─── CONSTANTS & HELPERS ──────────────────────────────────────────────────────
const RANKS = {
  'Chief Fire Officer':'CFO','Chief Fire Inspector':'CFI',
  'Senior Fire Inspector':'SFInsp','Fire Inspector':'FInsp',
  'Senior Fire Officer III':'SFO3','Senior Fire Officer II':'SFO2',
  'Senior Fire Officer I':'SFO1','Fire Officer III':'FO3',
  'Fire Officer II':'FO2','Fire Officer I':'FO1',
};

const isBday = (s) => { try{ const t=new Date(),b=new Date(s); return t.getMonth()===b.getMonth()&&t.getDate()===b.getDate(); }catch{ return false; } };
const getAge = (s) => { try{ const t=new Date(),b=new Date(s); let a=t.getFullYear()-b.getFullYear(); if(t.getMonth()<b.getMonth()||(t.getMonth()===b.getMonth()&&t.getDate()<b.getDate()))a--; return a; }catch{ return null; } };
const imgs = (r) => Array.isArray(r?.images)&&r.images.length ? r.images : r?.coverImage ? [r.coverImage] : [];

const SLIDE_MS = 60000;

const getCat = (category) => {
  switch (category) {
    case 'Event':       return { bg:'#1D4ED8', light:'#EFF6FF', text:'#1D4ED8', bar:'#3B82F6' };
    case 'Training':    return { bg:'#15803D', light:'#F0FDF4', text:'#15803D', bar:'#22C55E' };
    case 'Advisory':    return { bg:'#B45309', light:'#FFFBEB', text:'#B45309', bar:'#F59E0B' };
    case 'Achievement': return { bg:'#6D28D9', light:'#F5F3FF', text:'#6D28D9', bar:'#8B5CF6' };
    default:            return { bg:'#374151', light:'#F9FAFB', text:'#374151', bar:'#6B7280' };
  }
};

// ─── CONFETTI ─────────────────────────────────────────────────────────────────
const CONF_C = ['#1A2C4E','#C8990A','#2563EB','#16A34A','#7C3AED','#DB2777','#F472B6','#FDE68A'];
function Confetti({ active }) {
  const cv=useRef(null), raf=useRef(null), ps=useRef([]);
  useEffect(()=>{
    if(!active){ cancelAnimationFrame(raf.current); ps.current=[]; const c=cv.current; if(c)c.getContext('2d').clearRect(0,0,c.width,c.height); return; }
    const canvas=cv.current; if(!canvas)return;
    const ctx=canvas.getContext('2d'); canvas.width=canvas.offsetWidth; canvas.height=canvas.offsetHeight;
    const spawn=(n)=>{ for(let i=0;i<n;i++) ps.current.push({ x:canvas.width*.5+(Math.random()-.5)*canvas.width*.8, y:canvas.height*.15, vx:(Math.random()-.5)*15, vy:-(Math.random()*14+6), c:CONF_C[Math.floor(Math.random()*CONF_C.length)], sz:Math.random()*8+3, sh:Math.floor(Math.random()*3), rot:Math.random()*Math.PI*2, rs:(Math.random()-.5)*.22, life:1, dc:.005+Math.random()*.004, g:.28+Math.random()*.14, wo:Math.random()*.07, ws:Math.random()*.04, wp:Math.random()*Math.PI*2 }); };
    spawn(180); const t1=setTimeout(()=>spawn(120),700); const t2=setTimeout(()=>spawn(100),1500);
    const loop=()=>{ ctx.clearRect(0,0,canvas.width,canvas.height); ps.current=ps.current.filter(p=>p.life>0); ps.current.forEach(p=>{ p.vy+=p.g; p.wp+=p.ws; p.x+=p.vx+Math.sin(p.wp)*p.wo*22; p.y+=p.vy; p.rot+=p.rs; p.life-=p.dc; ctx.save(); ctx.globalAlpha=Math.max(0,p.life); ctx.translate(p.x,p.y); ctx.rotate(p.rot); ctx.fillStyle=p.c; if(p.sh===0)ctx.fillRect(-p.sz/2,-p.sz/4,p.sz,p.sz/2); else if(p.sh===1){ctx.beginPath();ctx.ellipse(0,0,p.sz/2,p.sz/4,0,0,Math.PI*2);ctx.fill();}else{ctx.beginPath();ctx.moveTo(0,-p.sz/2);ctx.lineTo(p.sz/3,p.sz/2);ctx.lineTo(-p.sz/3,p.sz/2);ctx.closePath();ctx.fill();} ctx.restore(); }); raf.current=requestAnimationFrame(loop); };
    loop(); return()=>{ cancelAnimationFrame(raf.current); clearTimeout(t1); clearTimeout(t2); };
  },[active]);
  return <canvas ref={cv} style={{ position:'absolute', inset:0, width:'100%', height:'100%', pointerEvents:'none', zIndex:30 }} />;
}

// ─── LIGHTBOX ─────────────────────────────────────────────────────────────────
function Lightbox({ images, start, onClose }) {
  const [i, setI] = useState(start);
  const ts = useRef(null);
  useEffect(()=>{ const ov=document.body.style.overflow; document.body.style.overflow='hidden'; return()=>{ document.body.style.overflow=ov; }; },[]);
  useEffect(()=>{
    const fn=(e)=>{ if(e.key==='Escape')onClose(); if(e.key==='ArrowLeft')setI(x=>(x-1+images.length)%images.length); if(e.key==='ArrowRight')setI(x=>(x+1)%images.length); };
    window.addEventListener('keydown',fn); return()=>window.removeEventListener('keydown',fn);
  },[images.length,onClose]);

  return (
    <div style={{ position:'fixed', inset:0, zIndex:999999, background:'rgba(5,5,5,0.97)', display:'flex', flexDirection:'column' }}
      onTouchStart={e=>{ts.current=e.touches[0].clientX;}}
      onTouchEnd={e=>{ if(!ts.current)return; const d=ts.current-e.changedTouches[0].clientX; if(Math.abs(d)>50)setI(x=>d>0?(x+1)%images.length:(x-1+images.length)%images.length); ts.current=null; }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'0 32px', height:60, borderBottom:'1px solid rgba(255,255,255,0.07)', flexShrink:0 }}>
        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
          <div style={{ width:3, height:20, background:'#FBBF24', borderRadius:2 }} />
          <span style={{ fontSize:12, fontWeight:700, letterSpacing:'.2em', textTransform:'uppercase', color:'rgba(255,255,255,0.55)' }}>Official Photo Record</span>
          {images.length > 1 && <span style={{ fontFamily:'Poppins', fontSize:12, color:'rgba(255,255,255,0.22)' }}>{String(i+1).padStart(2,'0')} / {String(images.length).padStart(2,'0')}</span>}
        </div>
        <button onClick={onClose}
          style={{ width:40, height:40, borderRadius:'50%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.14)', color:'rgba(255,255,255,0.7)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s' }}
          onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.14)'; e.currentTarget.style.color='white';}}
          onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.06)'; e.currentTarget.style.color='rgba(255,255,255,0.7)';}}>
          <X size={17}/>
        </button>
      </div>
      <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', padding:'28px 96px', minHeight:0 }}>
        <img src={images[i]} alt="" draggable={false} style={{ maxWidth:'100%', maxHeight:'100%', objectFit:'contain', borderRadius:10, boxShadow:'0 16px 80px rgba(0,0,0,0.8)', userSelect:'none', display:'block' }} />
        {images.length > 1 && (
          [{s:'left',fn:()=>setI(x=>(x-1+images.length)%images.length),ic:<ChevronLeft size={22}/>},
           {s:'right',fn:()=>setI(x=>(x+1)%images.length),ic:<ChevronRight size={22}/>}].map(({s,fn,ic})=>(
            <button key={s} onClick={fn}
              style={{ position:'absolute', [s]:20, top:'50%', transform:'translateY(-50%)', width:52, height:52, borderRadius:'50%', background:'rgba(255,255,255,0.07)', border:'1px solid rgba(255,255,255,0.14)', color:'rgba(255,255,255,0.8)', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', transition:'all .15s' }}
              onMouseEnter={e=>{e.currentTarget.style.background='rgba(255,255,255,0.16)'; e.currentTarget.style.color='white';}}
              onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.07)'; e.currentTarget.style.color='rgba(255,255,255,0.8)';}}>
              {ic}
            </button>
          ))
        )}
      </div>
      {images.length > 1 && (
        <div style={{ flexShrink:0, display:'flex', justifyContent:'center', gap:10, padding:'14px 32px', borderTop:'1px solid rgba(255,255,255,0.07)' }}>
          {images.slice(0,12).map((src,j)=>(
            <button key={j} onClick={()=>setI(j)}
              style={{ width:72, height:50, overflow:'hidden', borderRadius:7, border:j===i?'2.5px solid #EF4444':'2px solid rgba(255,255,255,0.1)', opacity:j===i?1:.35, cursor:'pointer', transition:'all .18s', background:'transparent', transform:j===i?'scale(1.07)':'scale(1)', padding:0 }}>
              <img src={src} alt="" style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── REPORT SLIDE ─────────────────────────────────────────────────────────────
function ReportSlide({ report, isPlaying, onLbChange }) {
  const [imgI, setImgI] = useState(0);
  const [lb, setLb]     = useState(false);
  const images = imgs(report);
  const hasMultiple = images.length > 1;
  const cat = getCat(report.category);

  useEffect(()=>{ setImgI(0); },[report.id]);
  useEffect(()=>{ onLbChange?.(lb); },[lb, onLbChange]);
  useEffect(()=>{
    if(!isPlaying||images.length<=1)return;
    const iv=setInterval(()=>setImgI(x=>(x+1)%images.length), SLIDE_MS/images.length);
    return()=>clearInterval(iv);
  },[isPlaying, images.length, report.id]);

  return (
    <>
      {lb && <Lightbox images={images} start={imgI} onClose={()=>{ setLb(false); onLbChange?.(false); }}/>}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:4, background:'rgba(0,0,0,0.06)', zIndex:10 }}>
        <motion.div key={report.id+isPlaying}
          style={{ height:'100%', background:cat.bar, transformOrigin:'left' }}
          initial={{ scaleX:0 }} animate={{ scaleX:isPlaying?1:0 }} transition={{ duration:SLIDE_MS/1000, ease:'linear' }}
        />
      </div>
      <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'row', overflow:'hidden' }}>
        <div style={{ flex:'1 1 0%', position:'relative', background:'#1A1A1A', overflow:'hidden', minWidth:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
          {images.length > 0 ? (
            <>
              <img src={images[imgI]} alt="" aria-hidden style={{ position:'absolute', inset:0, width:'20%', height:'100%', objectFit:'cover', filter:'blur(28px) brightness(0.35) saturate(0.6)', transform:'scale(1.1)', pointerEvents:'none', userSelect:'none' }} />
              <AnimatePresence mode="wait">
                <motion.div key={imgI}
                  initial={{ opacity:0, scale:0.97 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }} transition={{ duration:.5, ease:[0.25,0.46,0.45,0.94] }}
                  style={{ position:'relative', zIndex:2, width:'60%', height:'70%', cursor:'zoom-in', display:'flex', alignItems:'center', justifyContent:'center' }}
                  onClick={()=>setLb(true)}>
                  <img src={images[imgI]} alt={report.title} style={{ maxWidth:'100%', maxHeight:'100%', width:'auto', height:'auto', objectFit:'contain', display:'block', borderRadius:12, boxShadow:'0 24px 80px rgba(0,0,0,0.7), 0 4px 16px rgba(0,0,0,0.4)' }} />
                </motion.div>
              </AnimatePresence>
              <div style={{ position:'absolute', bottom:22, right:20, display:'flex', alignItems:'center', gap:6, padding:'6px 14px', background:'rgba(255,255,255,0.12)', backdropFilter:'blur(10px)', borderRadius:999, pointerEvents:'none', border:'1px solid rgba(255,255,255,0.18)', zIndex:10 }}>
                <span style={{ fontSize:10, fontWeight:700, color:'rgba(255,255,255,0.8)', letterSpacing:'.14em', textTransform:'uppercase' }}>Click to expand</span>
              </div>
            </>
          ) : (
            <div style={{ width:'100%', height:'100%', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, background:'#1A1A1A' }}>
              <ImageIcon size={72} style={{ color:'rgba(255,255,255,0.15)' }}/>
              <span style={{ fontSize:13, fontWeight:700, letterSpacing:'.2em', textTransform:'uppercase', color:'rgba(255,255,255,0.3)' }}>No Image on Record</span>
            </div>
          )}
        </div>
        <div style={{ flex:'0 0 clamp(320px, 40%, 500px)', background:'#FFFFFF', borderLeft:'1px solid #EDECE9', display:'flex', flexDirection:'column', minHeight:0, overflow:'hidden' }}>
          <div style={{ height:6, background:cat.bar, flexShrink:0 }} />
          <div style={{ flex:'1 1 0%', overflowY:'auto', overflowX:'hidden', padding:'clamp(32px, 5vh, 60px) clamp(28px, 5vw, 64px)', display:'flex', flexDirection:'column' }}>
            <div style={{ marginBottom:'clamp(20px,3vh,36px)', flexShrink:0 }}>
              <span style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'10px 26px', borderRadius:999, background:cat.light, color:cat.text, fontSize:14, fontWeight:800, letterSpacing:'.08em', textTransform:'uppercase', border:`1.5px solid ${cat.bg}33` }}>
                <Tag size={14}/> {report.category}
              </span>
            </div>
            <h2 style={{ fontSize:'clamp(1.5rem, 2.6vw, 3rem)', fontWeight:900, color:'#0A0A0A', lineHeight:1.1, marginBottom:'clamp(14px,2vh,24px)', letterSpacing:'-.02em', fontFamily:'system-ui,-apple-system,sans-serif', flexShrink:0 }}>
              {report.title}
            </h2>
            <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:'clamp(24px,3.5vh,48px)', flexShrink:0 }}>
              <span style={{ fontSize:'clamp(15px,1.5vw,18px)', fontWeight:600, color:'#52525B' }}>
                {new Date(report.date).toLocaleDateString('en-US',{ year:'numeric', month:'long', day:'numeric' })}
              </span>
            </div>
            <div style={{ height:1, background:'#F4F4F2', marginBottom:'clamp(24px,3.5vh,44px)', flexShrink:0 }} />
            <div style={{ marginBottom:'clamp(24px,3.5vh,44px)' }}>
              <p style={{ fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'.22em', color:'#A1A1AA', marginBottom:18 }}>Description</p>
              <p style={{ fontSize:'clamp(15px,1.5vw,19px)', color:'#27272A', fontWeight:400, fontFamily:'system-ui,-apple-system,sans-serif' }}>
                {report.description || 'No description available.'}
              </p>
            </div>
            {hasMultiple && (
              <>
                <div style={{ height:1, background:'#F4F4F2', marginBottom:'clamp(20px,3vh,32px)', flexShrink:0 }} />
                <div style={{ marginBottom:'clamp(24px,3vh,40px)' }}>
                  <p style={{ fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'.22em', color:'#A1A1AA', marginBottom:18 }}>Gallery</p>
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
                    {images.map((image,index) => (
                      <button key={index} onClick={()=>setImgI(index)}
                        style={{ aspectRatio:'1', overflow:'hidden', borderRadius:10, border:index===imgI?`2.5px solid ${cat.bg}`:'2px solid #E4E4E7', cursor:'pointer', transition:'all .2s', transform:index===imgI?'scale(1.06)':'scale(1)', padding:0, background:'transparent', boxShadow:index===imgI?`0 4px 16px ${cat.bg}44`:'none' }}>
                        <img src={image} alt={`Thumbnail ${index+1}`} style={{ width:'100%', height:'100%', objectFit:'cover', display:'block' }}/>
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}
            <div style={{ marginTop:'auto', paddingTop:28, borderTop:'1px solid #F4F4F2', flexShrink:0 }}>
              <p style={{ fontSize:13, color:'#A1A1AA', display:'flex', alignItems:'center', gap:7 }}>
                Press <kbd style={{ padding:'3px 10px', background:'#FAFAFA', border:'1px solid #E4E4E7', borderRadius:6, fontSize:12, color:'#52525B', fontWeight:600, boxShadow:'0 1px 3px rgba(0,0,0,0.07)' }}>ESC</kbd> to close
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── BIRTHDAY SLIDE ───────────────────────────────────────────────────────────
function BdaySlide({ officer, isPlaying }) {
  const age  = getAge(officer.birthdate);
  const abbr = RANKS[officer.rank] || officer.rank || '';
  const ini  = (officer.fullName||'?').split(' ').filter(Boolean).map(n=>n[0]).slice(0,2).join('').toUpperCase();
  const [sc, setSc] = useState(false);

  useEffect(()=>{
    setSc(true);
    const t = setTimeout(()=>setSc(false), 8000);
    return ()=>clearTimeout(t);
  },[officer.id]);

  return (
    <div style={{ position:'absolute', inset:0, display:'flex', background:'#FFFFFF', overflow:'hidden' }}>
      <Confetti active={sc}/>

      {/* Progress bar */}
      <div style={{ position:'absolute', top:0, left:0, right:0, height:4, background:'rgba(219,39,119,0.12)', zIndex:10 }}>
        <motion.div key={officer.id + String(isPlaying)}
          style={{ height:'100%', background:'linear-gradient(90deg,#DB2777,#F472B6)', transformOrigin:'left' }}
          initial={{ scaleX:0 }} animate={{ scaleX:isPlaying?1:0 }} transition={{ duration:SLIDE_MS/1000, ease:'linear' }}
        />
      </div>

      {/* ── Left panel: photo / initials ── */}
      <div style={{ flex:'0 0 44%', position:'relative', overflow:'hidden' }}>
        {/* Background */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(160deg, #FDF2F8 0%, #FCE7F3 50%, #FBCFE8 100%)' }} />

        {/* Photo or large initials */}
        {officer.profileImage ? (
          <img src={officer.profileImage} alt={officer.fullName}
            style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', objectPosition:'top center', display:'block' }}/>
        ) : (
          <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center' }}>
            <span style={{ fontSize:180, fontWeight:900, color:'rgba(219,39,119,0.1)', letterSpacing:'-.04em', userSelect:'none', lineHeight:1 }}>{ini}</span>
          </div>
        )}

        {/* Right-side fade to white */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to right, transparent 50%, rgba(255,255,255,0.92) 100%)', pointerEvents:'none' }} />
        {/* Bottom fade */}
        <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'25%', background:'linear-gradient(to top, rgba(253,242,248,0.95) 0%, transparent 100%)', pointerEvents:'none' }} />

        {/* Pink top bar */}
        <div style={{ position:'absolute', top:0, left:0, right:0, height:6, background:'linear-gradient(90deg,#DB2777,#F472B6)', zIndex:2 }} />

        {/* Birthday cake top-left */}
        <div style={{ position:'absolute', top:28, left:28, zIndex:3, fontSize:56, filter:'drop-shadow(0 6px 16px rgba(219,39,119,0.35))' }}>🎂</div>

        {/* Rank badge — bottom left */}
        {abbr && (
          <div style={{ position:'absolute', bottom:32, left:32, zIndex:3, padding:'14px 28px', background:'rgba(10,10,10,0.88)', backdropFilter:'blur(20px)', borderRadius:14, boxShadow:'0 8px 32px rgba(0,0,0,0.4)', border:'1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ fontFamily:'Poppins,sans-serif', fontSize:10, fontWeight:700, color:'rgba(244,114,182,0.75)', letterSpacing:'.2em', textTransform:'uppercase', margin:'0 0 5px', lineHeight:1 }}>Rank</p>
            <span style={{ fontFamily:'Poppins,sans-serif', fontSize:30, fontWeight:900, color:'#FBBF24', letterSpacing:'.12em', lineHeight:1 }}>{abbr}</span>
          </div>
        )}
      </div>

      {/* ── Right panel: info ── */}
      <div style={{ flex:1, position:'relative', display:'flex', flexDirection:'column', minHeight:0, overflow:'hidden' }}>
        {/* Subtle pink background tint */}
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(160deg, #FFFFFF 55%, #FDF2F8 100%)', pointerEvents:'none' }} />

        <div style={{ flex:'1 1 0%', overflowY:'auto', overflowX:'hidden', padding:'clamp(36px,6vh,72px) clamp(28px,5vw,72px)', display:'flex', flexDirection:'column', position:'relative', zIndex:1 }}>

          {/* Badge */}
          <div style={{ marginBottom:'clamp(20px,3vh,36px)', flexShrink:0 }}>
            <span style={{ display:'inline-flex', alignItems:'center', gap:10, padding:'11px 28px', borderRadius:999, background:'#FDF2F8', color:'#BE185D', fontSize:14, fontWeight:800, letterSpacing:'.06em', border:'1.5px solid #FBCFE8', boxShadow:'0 4px 18px rgba(219,39,119,0.18)', flexShrink:0 }}>
              🎉 &nbsp;Birthday Today
            </span>
          </div>

          {/* Label */}
          <p style={{ fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'.26em', color:'#F9A8D4', marginBottom:14, flexShrink:0 }}>✨ Happy Birthday</p>

          {/* Name */}
          <h2 style={{ fontSize:'clamp(1.9rem,3.6vw,4.2rem)', fontWeight:900, color:'#0A0A0A', lineHeight:1.05, letterSpacing:'-.03em', marginBottom:10, fontFamily:'system-ui,-apple-system,sans-serif', flexShrink:0 }}>
            {officer.fullName}
          </h2>

          {/* Full rank */}
          {officer.rank && (
            <p style={{ fontSize:'clamp(14px,1.3vw,18px)', fontWeight:700, color:'#BE185D', marginBottom:20, flexShrink:0, letterSpacing:'.01em' }}>
              {officer.rank}
            </p>
          )}

          {/* Age pill */}
          {age !== null && (
            <div style={{ display:'inline-flex', alignItems:'center', gap:9, marginBottom:'clamp(24px,3.5vh,44px)', flexShrink:0, padding:'10px 20px', background:'#FDF2F8', borderRadius:12, border:'1.5px solid #FBCFE8', alignSelf:'flex-start', boxShadow:'0 2px 10px rgba(219,39,119,0.1)' }}>
              <Calendar size={16} style={{ color:'#DB2777', flexShrink:0 }}/>
              <span style={{ fontSize:'clamp(14px,1.3vw,17px)', fontWeight:700, color:'#BE185D' }}>Turning {age} today 🎈</span>
            </div>
          )}

          <div style={{ height:1, background:'#FCE7F3', marginBottom:'clamp(20px,3vh,36px)', flexShrink:0 }} />

          {/* Message */}
          <p style={{ fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'.2em', color:'#F9A8D4', marginBottom:16, flexShrink:0 }}>Official Message</p>
          <p style={{ fontSize:'clamp(14px,1.35vw,17.5px)', color:'#27272A', lineHeight:1.9, maxWidth:520, marginBottom:'clamp(20px,3vh,36px)', fontFamily:'system-ui,-apple-system,sans-serif', fontStyle:'italic', flexShrink:0 }}>
            "On behalf of all officers and personnel of BFP Station 1 – Cogon, we extend our warmest felicitations and deepest gratitude for your unwavering dedication and service to the community. May this special day bring joy and renewed strength."
          </p>

          <div style={{ display:'flex', alignItems:'center', gap:9, color:'#F9A8D4', fontSize:12.5, marginBottom:28, flexShrink:0 }}>
            <Shield size={14} style={{ flexShrink:0 }}/>
            <span style={{ fontWeight:500, letterSpacing:'.02em', lineHeight:1.5 }}>Bureau of Fire Protection · Station 1 · Cogon · CDO · Region X · Philippines</span>
          </div>

          <div style={{ marginTop:'auto', paddingTop:24, borderTop:'1px solid #FCE7F3', flexShrink:0 }}>
            <p style={{ fontSize:13, color:'#A1A1AA', display:'flex', alignItems:'center', gap:7 }}>
              Press <kbd style={{ padding:'3px 10px', background:'#FAFAFA', border:'1px solid #E4E4E7', borderRadius:6, fontSize:12, color:'#52525B', fontWeight:600 }}>ESC</kbd> to close
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── DOT NAV ──────────────────────────────────────────────────────────────────
function DotNav({ all, cur, goTo }) {
  return (
    <div style={{ position:'absolute', bottom:20, left:'50%', transform:'translateX(-50%)', display:'flex', gap:7, zIndex:20, background:'rgba(255,255,255,0.92)', backdropFilter:'blur(12px)', padding:'8px 18px', borderRadius:999, border:'1px solid #E4E4E7', boxShadow:'0 4px 18px rgba(0,0,0,0.1)' }}>
      {all.map((s,i) => (
        <button key={i} onClick={()=>goTo(i)}
          style={{
            height:7, width:i===cur?24:7, borderRadius:999, border:'none', padding:0, cursor:'pointer',
            background: i===cur ? (s.type==='bday' ? '#DB2777' : '#0A0A0A') : '#D4D4D8',
            transition:'all .28s',
          }}
          onMouseEnter={e=>{ if(i!==cur)e.currentTarget.style.background='#A1A1AA'; }}
          onMouseLeave={e=>{ if(i!==cur)e.currentTarget.style.background='#D4D4D8'; }}
        />
      ))}
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────
export function WeeklyReportsSlideshow({ reports, onRegisterJump }) {
  const [cur, setCur]         = useState(0);
  const [playing, setPlaying] = useState(true);
  const [dir, setDir]         = useState(0);
  const [bdays, setBdays]     = useState([]);
  const [lbOn, setLbOn]       = useState(false);
  const resumeRef             = useRef(null);

  useEffect(()=>{
    getOfficers().then(d=>setBdays(d.filter(o=>isBday(o.birthdate)))).catch(console.error);
  },[]);

  const bdSlides = bdays.map(o=>({ id:`bday-${o.id}`, type:'bday', officer:o }));
  const rpSlides = reports.map(r=>({ id:r.id, type:'report', report:r }));
  const all = [...bdSlides, ...rpSlides];
  const slide = all[cur] || null;

  const pause = useCallback(()=>{
    setPlaying(false); clearTimeout(resumeRef.current);
    resumeRef.current = setTimeout(()=>setPlaying(true), 120000);
  },[]);
  const goTo = useCallback((i)=>{ setDir(i>cur?1:-1); setCur(i); pause(); },[cur,pause]);
  const prev = useCallback(()=>{ setDir(-1); setCur(p=>(p-1+all.length)%all.length); pause(); },[all.length,pause]);
  const next = useCallback(()=>{ setDir(1);  setCur(p=>(p+1)%all.length); pause(); },[all.length,pause]);

  useEffect(()=>{
    if(!onRegisterJump)return;
    onRegisterJump((rid)=>{
      const i = all.findIndex(s => s.id === rid || (s.type==='report' && s.id===rid));
      if(i !== -1){ setDir(0); setCur(i); }
    });
  },[all.length, onRegisterJump]);

  useEffect(()=>{ setCur(0); },[reports.length, bdays.length]);

  useEffect(()=>{
    if(!playing||!all.length)return;
    const iv=setInterval(()=>{ setDir(1); setCur(p=>(p+1)%all.length); }, SLIDE_MS);
    return()=>clearInterval(iv);
  },[playing, all.length]);

  useEffect(()=>{
    if(lbOn)return;
    const fn=(e)=>{
      if(e.key==='ArrowLeft'){ e.preventDefault(); prev(); }
      if(e.key==='ArrowRight'){ e.preventDefault(); next(); }
      if(e.key===' '){ e.preventDefault(); setPlaying(p=>!p); clearTimeout(resumeRef.current); }
    };
    window.addEventListener('keydown',fn); return()=>window.removeEventListener('keydown',fn);
  },[prev,next,lbOn]);

  if(!all.length) return null;

  const isCurBday = slide?.type === 'bday';

  const SV = {
    enter: d=>({ x: d>0?'1.5%':d<0?'-1.5%':0, opacity:0 }),
    center:{ x:0, opacity:1, zIndex:1 },
    exit:  d=>({ x: d<0?'1.5%':d>0?'-1.5%':0, opacity:0, zIndex:0 }),
  };

  return (
    <div style={{ width:'100%', height:'100%', position:'relative', background:'#FFFFFF', overflow:'hidden' }}>
      <AnimatePresence initial={false} custom={dir} mode="wait">
        <motion.div key={slide?.id} custom={dir}
          variants={SV} initial="enter" animate="center" exit="exit"
          transition={{ opacity:{ duration:.28 }, x:{ type:'spring', stiffness:360, damping:34 } }}
          style={{ position:'absolute', inset:0 }}>
          {slide?.type==='bday' && <BdaySlide officer={slide.officer} isPlaying={playing} />}
          {slide?.type==='report' && (
            <ReportSlide report={slide.report} isPlaying={playing} onLbChange={setLbOn}
              allReports={reports} currentIdx={reports.findIndex(r=>r.id===slide.report.id)}
              onGoTo={i=>goTo(bdSlides.length+i)} />
          )}
        </motion.div>
      </AnimatePresence>

      {all.length>1 && !lbOn && (
        [{s:'left',fn:prev,ic:<ChevronLeft size={20}/>},{s:'right',fn:next,ic:<ChevronRight size={20}/>}].map(({s,fn,ic})=>(
          <button key={s} onClick={fn}
            style={{ position:'absolute', top:'50%', [s]:16, transform:'translateY(-50%)', zIndex:30, width:44, height:44, borderRadius:'50%', background:'rgba(255,255,255,0.9)', border:'1px solid #E4E4E7', color:'#71717A', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 4px 16px rgba(0,0,0,0.1)', transition:'all .2s' }}
            onMouseEnter={e=>{e.currentTarget.style.background='white'; e.currentTarget.style.color='#0A0A0A'; e.currentTarget.style.boxShadow='0 6px 24px rgba(0,0,0,0.16)'; e.currentTarget.style.transform='translateY(-50%) scale(1.06)';}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(255,255,255,0.9)'; e.currentTarget.style.color='#71717A'; e.currentTarget.style.boxShadow='0 4px 16px rgba(0,0,0,0.1)'; e.currentTarget.style.transform='translateY(-50%) scale(1)';}}>
            {ic}
          </button>
        ))
      )}

      {all.length>1 && all.length<=28 && !lbOn && <DotNav all={all} cur={cur} goTo={goTo}/>}

      {!lbOn && (
        <div style={{ position:'absolute', bottom:20, right:24, zIndex:20, display:'flex', alignItems:'center', gap:10 }}>
          {isCurBday && (
            <div style={{ padding:'6px 16px', background:'linear-gradient(135deg,#DB2777,#BE185D)', borderRadius:999, boxShadow:'0 4px 14px rgba(219,39,119,0.4)', display:'flex', alignItems:'center', gap:7 }}>
              <span style={{ fontSize:13 }}>🎂</span>
              <span style={{ fontSize:11, fontWeight:800, color:'white', letterSpacing:'.14em', textTransform:'uppercase' }}>Birthday</span>
            </div>
          )}
          <div style={{ padding:'6px 16px', background:'rgba(255,255,255,0.92)', backdropFilter:'blur(10px)', borderRadius:999, border:'1px solid #E4E4E7', boxShadow:'0 2px 12px rgba(0,0,0,0.08)' }}>
            <span style={{ fontFamily:'Poppins', fontSize:13, fontWeight:800, color:'#0A0A0A' }}>{String(cur+1).padStart(2,'0')}</span>
            <span style={{ fontFamily:'Poppins', fontSize:12, color:'#D4D4D8', margin:'0 6px' }}>/</span>
            <span style={{ fontFamily:'Poppins', fontSize:12, color:'#A1A1AA' }}>{String(all.length).padStart(2,'0')}</span>
          </div>
          <button onClick={()=>{ setPlaying(p=>!p); clearTimeout(resumeRef.current); }}
            style={{ width:38, height:38, borderRadius:'50%', background:playing?(isCurBday?'#DB2777':'#0A0A0A'):'rgba(255,255,255,0.92)', border:`1px solid ${playing?'transparent':'#E4E4E7'}`, color:playing?'white':'#71717A', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 2px 12px rgba(0,0,0,0.1)', transition:'all .2s' }}
            onMouseEnter={e=>e.currentTarget.style.transform='scale(1.1)'}
            onMouseLeave={e=>e.currentTarget.style.transform='scale(1)'}>
            {playing ? <Pause size={14}/> : <Play size={14}/>}
          </button>
        </div>
      )}

      {!lbOn && (
        <div style={{ position:'absolute', bottom:26, left:24, zIndex:20, display:'flex', alignItems:'center', gap:8 }}>
          <div style={{ width:7, height:7, borderRadius:'50%', background:playing?(isCurBday?'#F472B6':'#4ADE80'):'#D4D4D8', boxShadow:playing?(isCurBday?'0 0 9px #F472B6':'0 0 9px #4ADE80'):'none', transition:'all .3s' }}/>
          <span style={{ fontFamily:'Poppins', fontSize:10, color:'#A1A1AA', letterSpacing:'.14em', textTransform:'uppercase' }}>
            {playing ? (isCurBday ? 'Birthday · 60s' : 'Auto · 60s') : 'Paused'}
          </span>
        </div>
      )}
    </div>
  );
}