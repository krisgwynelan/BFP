import React, { useState, useEffect, useRef } from "react";
import { Target, Eye, ShieldCheck, FileText, Flame, Users, Award } from "lucide-react";

export function AboutPage() {
  const images = ["/Wall.jpg"];
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleSections, setVisibleSections] = useState({});
  const sectionRefs = useRef({});

  useEffect(() => {
    const observers = {};
    Object.entries(sectionRefs.current).forEach(([key, el]) => {
      if (!el) return;
      observers[key] = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setVisibleSections(prev => ({ ...prev, [key]: true })); },
        { threshold: 0.1 }
      );
      observers[key].observe(el);
    });
    return () => Object.values(observers).forEach(o => o.disconnect());
  }, []);

  const setRef = (key) => (el) => { sectionRefs.current[key] = el; };

  return (
    <div id="about-root" style={{ fontFamily: "'DM Sans', sans-serif", background: '#f5f3f0', width: '100%', position: 'relative', isolation: 'isolate', zIndex: 0 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');
        #about-root *, #about-root *::before, #about-root *::after { box-sizing: border-box; }

        @keyframes abt-heroText   { from{opacity:0;transform:translateY(22px) skewY(1.5deg);} to{opacity:1;transform:translateY(0) skewY(0);} }
        @keyframes abt-dotBlink   { 0%,100%{opacity:1;box-shadow:0 0 0 3px rgba(74,222,128,0.25);} 50%{opacity:0.4;box-shadow:0 0 0 6px rgba(74,222,128,0.08);} }
        @keyframes abt-float      { 0%,100%{transform:translateY(0px) rotate(0deg);} 50%{transform:translateY(-9px) rotate(0.5deg);} }
        @keyframes abt-gradFlow   { 0%{background-position:0% 50%;} 50%{background-position:100% 50%;} 100%{background-position:0% 50%;} }
        @keyframes abt-lineGrow   { from{transform:scaleX(0);transform-origin:left;} to{transform:scaleX(1);transform-origin:left;} }
        @keyframes abt-shimmer    { 0%{background-position:-200% center;} 100%{background-position:200% center;} }
        @keyframes abt-pulse      { 0%,100%{transform:scale(1);} 50%{transform:scale(1.08);} }
        @keyframes abt-orb        { 0%,100%{transform:translate(0,0) scale(1);} 33%{transform:translate(20px,-15px) scale(1.05);} 66%{transform:translate(-12px,10px) scale(0.97);} }

        /* ── Scroll reveal ── */
        #about-root .abt-reveal       { opacity:0; transform:translateY(38px);   transition:opacity 0.8s cubic-bezier(.22,1,.36,1), transform 0.8s cubic-bezier(.22,1,.36,1); }
        #about-root .abt-reveal-left  { opacity:0; transform:translateX(-38px);  transition:opacity 0.8s cubic-bezier(.22,1,.36,1), transform 0.8s cubic-bezier(.22,1,.36,1); }
        #about-root .abt-reveal-right { opacity:0; transform:translateX(38px);   transition:opacity 0.8s cubic-bezier(.22,1,.36,1), transform 0.8s cubic-bezier(.22,1,.36,1); }
        #about-root .abt-reveal-scale { opacity:0; transform:scale(0.88);        transition:opacity 0.8s cubic-bezier(.22,1,.36,1), transform 0.8s cubic-bezier(.22,1,.36,1); }
        #about-root .abt-reveal.visible, #about-root .abt-reveal-left.visible,
        #about-root .abt-reveal-right.visible, #about-root .abt-reveal-scale.visible { opacity:1; transform:none; }
        #about-root .abt-d1 { transition-delay:0.06s !important; }
        #about-root .abt-d2 { transition-delay:0.16s !important; }
        #about-root .abt-d3 { transition-delay:0.26s !important; }
        #about-root .abt-d4 { transition-delay:0.36s !important; }

        /* ── Hero ── */
        #about-root .abt-hero-bar  { animation: abt-heroText 0.7s ease 0.2s both; }
        #about-root .abt-hero-h1   { animation: abt-heroText 0.9s cubic-bezier(.22,1,.36,1) 0.35s both; }
        #about-root .abt-hero-sub  { animation: abt-heroText 0.8s ease 0.55s both; }
        #about-root .abt-live-dot  { width:7px; height:7px; border-radius:50%; background:#4ade80; animation:abt-dotBlink 1.8s ease infinite; display:inline-block; }

        /* ── MVM cards ── */
        #about-root .abt-mvm-card {
          background:white; border:1.5px solid #e8e2dc; border-radius:22px;
          padding:40px 30px 36px; position:relative; overflow:hidden;
          transition:transform 0.4s cubic-bezier(.22,1,.36,1), box-shadow 0.4s ease, border-color 0.3s;
          cursor:default;
        }
        #about-root .abt-mvm-card::before {
          content:''; position:absolute; inset:0; border-radius:22px; opacity:0;
          background:radial-gradient(circle at 75% 15%, rgba(192,57,43,0.05) 0%, transparent 60%);
          transition:opacity 0.4s;
        }
        #about-root .abt-mvm-card:hover::before { opacity:1; }
        #about-root .abt-mvm-card:hover {
          transform:translateY(-11px) rotate(-0.25deg);
          box-shadow:0 36px 80px rgba(0,0,0,0.12), 0 0 0 1px rgba(192,57,43,0.07);
          border-color:#cec8c3;
        }
        #about-root .abt-mvm-card .card-bar { position:absolute; top:0; left:0; right:0; height:4px; }
        #about-root .abt-mvm-card .card-icon-wrap {
          transition:transform 0.35s cubic-bezier(.22,1,.36,1);
        }
        #about-root .abt-mvm-card:hover .card-icon-wrap { transform:scale(1.14) rotate(-5deg); }

        /* ── Stat pills ── */
        #about-root .abt-stat-pill {
          display:flex; align-items:center; gap:14px;
          background:white; border:1.5px solid #e8e2dc; border-radius:16px;
          padding:18px 20px; position:relative; overflow:hidden;
          transition:all 0.32s cubic-bezier(.22,1,.36,1); cursor:default;
        }
        #about-root .abt-stat-pill::after {
          content:''; position:absolute; left:0; top:0; bottom:0; width:3px;
          background:linear-gradient(to bottom, #c0392b, #e67e22);
          transform:scaleY(0); transform-origin:bottom;
          transition:transform 0.32s cubic-bezier(.22,1,.36,1);
          border-radius:0 2px 2px 0;
        }
        #about-root .abt-stat-pill:hover {
          border-color:rgba(192,57,43,0.28);
          box-shadow:0 10px 36px rgba(192,57,43,0.09);
          transform:translateY(-3px) translateX(4px);
        }
        #about-root .abt-stat-pill:hover::after { transform:scaleY(1); }

        /* ── Timeline ── */
        #about-root .abt-tl-item { position:relative; padding-left:28px; padding-bottom:28px; }
        #about-root .abt-tl-item::before {
          content:''; position:absolute; left:0; top:9px;
          width:11px; height:11px; border-radius:50%; background:#c0392b;
          box-shadow:0 0 0 3px rgba(192,57,43,0.14), 0 0 0 6px rgba(192,57,43,0.05);
          transition:box-shadow 0.3s, transform 0.3s;
        }
        #about-root .abt-tl-item:hover::before {
          box-shadow:0 0 0 4px rgba(192,57,43,0.28), 0 0 0 8px rgba(192,57,43,0.07);
          transform:scale(1.35);
        }
        #about-root .abt-tl-item::after {
          content:''; position:absolute; left:4.5px; top:22px;
          width:2px; height:calc(100% - 14px);
          background:linear-gradient(to bottom, rgba(192,57,43,0.22), transparent);
        }
        #about-root .abt-tl-item:last-child::after { display:none; }
        #about-root .abt-tl-title { transition:color 0.25s, transform 0.25s; display:inline-block; }
        #about-root .abt-tl-item:hover .abt-tl-title { color:#a02f23 !important; transform:translateX(5px); }

        /* ── Slide dots ── */
        #about-root .abt-slide-dot {
          width:7px; height:7px; border-radius:50%; border:none;
          cursor:pointer; transition:all 0.3s cubic-bezier(.22,1,.36,1); padding:0;
        }
        #about-root .abt-slide-dot.active  { background:white; transform:scale(1.65); box-shadow:0 0 7px rgba(255,255,255,0.55); }
        #about-root .abt-slide-dot.inactive { background:rgba(255,255,255,0.36); }
        #about-root .abt-slide-dot.inactive:hover { background:rgba(255,255,255,0.72); transform:scale(1.3); }

        /* ── Service cards ── */
        #about-root .abt-svc-card {
          background:white; border:1.5px solid #e8e2dc; border-radius:20px;
          padding:30px 26px; position:relative; overflow:hidden;
          transition:all 0.36s cubic-bezier(.22,1,.36,1); cursor:default;
        }
        #about-root .abt-svc-card::after {
          content:''; position:absolute; bottom:0; left:0; right:0; height:0;
          transition:height 0.36s cubic-bezier(.22,1,.36,1); border-radius:0 0 20px 20px;
        }
        #about-root .abt-svc-card:hover { box-shadow:0 24px 64px rgba(0,0,0,0.1); transform:translateY(-9px); border-color:#d0c9c3; }
        #about-root .abt-svc-card:hover::after { height:3px; }
        #about-root .abt-svc-card[data-accent="red"]::after   { background:linear-gradient(90deg,#c0392b,#e67e22); }
        #about-root .abt-svc-card[data-accent="amber"]::after { background:linear-gradient(90deg,#b45309,#f59e0b); }
        #about-root .abt-svc-card[data-accent="blue"]::after  { background:linear-gradient(90deg,#1e4d8c,#3b82f6); }
        #about-root .abt-svc-card[data-accent="green"]::after { background:linear-gradient(90deg,#15614a,#10b981); }
        #about-root .abt-svc-icon { transition:transform 0.36s cubic-bezier(.22,1,.36,1); display:flex; align-items:center; justify-content:center; }
        #about-root .abt-svc-card:hover .abt-svc-icon { transform:scale(1.16) rotate(-7deg); }

        /* ── Value cards ── */
        #about-root .abt-val-card {
          padding:32px 28px; border-radius:20px;
          background:white; border:1.5px solid #e8e2dc;
          position:relative; overflow:hidden;
          transition:all 0.36s cubic-bezier(.22,1,.36,1); cursor:default;
        }
        #about-root .abt-val-card-glow {
          position:absolute; top:-20px; right:-20px; width:90px; height:90px; border-radius:50%;
          opacity:0; transform:scale(0.4);
          transition:all 0.4s cubic-bezier(.22,1,.36,1); pointer-events:none;
        }
        #about-root .abt-val-card:hover .abt-val-card-glow { opacity:1; transform:scale(2.2); }
        #about-root .abt-val-card:hover { box-shadow:0 22px 60px rgba(0,0,0,0.09); transform:translateY(-9px); border-color:#d0c9c3; }
        #about-root .abt-val-icon { transition:transform 0.36s cubic-bezier(.22,1,.36,1); display:flex; align-items:center; justify-content:center; }
        #about-root .abt-val-card:hover .abt-val-icon { transform:scale(1.2) rotate(8deg); }
        #about-root .abt-val-accent-bar {
          position:absolute; top:0; left:24px; right:24px; height:3px; border-radius:2px;
          transform:scaleX(0); transform-origin:left; transition:transform 0.8s cubic-bezier(.22,1,.36,1) 0.45s;
        }
        #about-root .abt-val-accent-bar.visible { transform:scaleX(1); }

        /* ── CTA ── */
        #about-root .abt-cta-stat { transition:all 0.28s cubic-bezier(.22,1,.36,1); cursor:default; border-radius:12px; }
        #about-root .abt-cta-stat:hover { background:rgba(192,57,43,0.045); transform:translateY(-2px); }
        #about-root .abt-cta-stat-val { transition:transform 0.28s; display:block; }
        #about-root .abt-cta-stat:hover .abt-cta-stat-val { transform:scale(1.1); }

        /* ── Floating badge ── */
        #about-root .abt-floating-badge { animation:abt-float 4.2s ease-in-out infinite; }
        #about-root .abt-floating-badge:hover {
          animation:none; transform:scale(1.07);
          transition:transform 0.32s cubic-bezier(.22,1,.36,1);
          box-shadow:0 22px 60px rgba(192,57,43,0.55) !important;
        }

        /* ── Img shimmer ── */
        #about-root .abt-img-shimmer {
          position:absolute; inset:0; z-index:25; pointer-events:none;
          background:linear-gradient(105deg, transparent 38%, rgba(255,255,255,0.07) 50%, transparent 62%);
          background-size:220% 100%; animation:abt-shimmer 3.5s ease infinite;
        }

        /* ── Section label ── */
        #about-root .abt-label-line { display:inline-block; width:24px; height:2px; background:#c0392b; border-radius:2px; vertical-align:middle; }

        /* ── Responsive ── */
        @media (max-width:900px) {
          #about-root .abt-2col        { grid-template-columns:1fr !important; }
          #about-root .abt-3col        { grid-template-columns:1fr !important; }
          #about-root .abt-4col        { grid-template-columns:1fr 1fr !important; }
          #about-root .abt-svc-layout  { grid-template-columns:1fr !important; }
          #about-root .abt-cta-flex    { flex-direction:column !important; align-items:flex-start !important; }
          #about-root .abt-cta-stats   { flex-direction:row !important; gap:20px !important; }
          #about-root .abt-who-gap     { gap:40px !important; }
          #about-root .abt-slideshow-wrap { padding-bottom:0 !important; }
          #about-root .abt-slideshow-inner { height:320px !important; }
          #about-root .abt-svc-grid    { grid-template-columns:1fr !important; }
          #about-root .abt-stat-grid   { grid-template-columns:1fr 1fr !important; }
          #about-root .abt-who-section { padding:48px 0 !important; }
          #about-root .abt-mvv-section { padding:56px 0 !important; }
          #about-root .abt-svc-section { padding:48px 0 !important; }
          #about-root .abt-cta-section { padding:40px 0 48px !important; }
          #about-root .abt-values-section { padding:48px 0 !important; }
          #about-root .abt-cta-inner   { padding:28px 24px !important; }
        }
        @media (max-width:600px) {
          #about-root .abt-4col        { grid-template-columns:1fr !important; }
          #about-root .abt-stat-grid   { grid-template-columns:1fr 1fr !important; }
          #about-root .abt-cta-stats   { flex-direction:column !important; gap:0 !important; }
          #about-root .abt-cta-stats > div { border-left:none !important; border-top:1px solid #ece6e0; padding:12px 0 !important; }
          #about-root .abt-cta-stats > div:first-child { border-top:none !important; }
          #about-root .abt-hero-pad    { padding:40px 0 56px !important; }
          #about-root .abt-who-section { padding:36px 0 !important; }
          #about-root .abt-mvv-section { padding:40px 0 !important; }
          #about-root .abt-cta-inner-flex { flex-direction:column !important; align-items:flex-start !important; }
          #about-root .abt-cta-icon-text { gap:14px !important; }
          #about-root .abt-slideshow-inner { height:240px !important; }
          #about-root .abt-floating-badge { display:none !important; }
        }
        @media (max-width:400px) {
          #about-root .abt-stat-grid { grid-template-columns:1fr !important; }
        }
      `}</style>

      {/* ── HERO ── */}
      <section className="abt-hero-pad" style={{
        position:'relative', padding:'120px 0 82px', overflow:'hidden',
        background:'linear-gradient(135deg, #aa2112 0%, #811515 60%, #c0392b 100%)',
      }}>
        {/* grid overlay */}
        <div style={{ position:'absolute', inset:0, pointerEvents:'none', opacity:0.1, backgroundImage:'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)', backgroundSize:'40px 40px' }} />
        {/* glow orbs */}
        <div style={{ position:'absolute', top:'-30%', right:'-8%', width:480, height:480, borderRadius:'50%', background:'radial-gradient(circle, rgba(230,126,34,0.18) 0%, transparent 65%)', pointerEvents:'none', animation:'abt-orb 8s ease-in-out infinite' }} />
        <div style={{ position:'absolute', bottom:'-20%', left:'-5%', width:360, height:360, borderRadius:'50%', background:'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)', pointerEvents:'none' }} />
        {/* noise */}
        <div style={{ position:'absolute', inset:0, opacity:0.035, backgroundImage:"url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")", backgroundSize:'160px 160px', pointerEvents:'none' }} />

        <div style={{ maxWidth:1200, margin:'0 auto', padding:'0 1.25rem', position:'relative', zIndex:1, textAlign:'center', marginBottom:24  }}>
          <div className="abt-hero-bar" style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginBottom:14 }}>
            <p style={{ color:'rgba(255,255,255,0.88)', fontSize:11, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.24em', margin:0 }}>Bureau of Fire Protection</p>
          </div>
          <h1 className="abt-hero-h1" style={{
            fontFamily:"'Bebas Neue', sans-serif",
            fontSize:'clamp(4.8rem, 7vw, 5.5rem)', letterSpacing:'0.05em', lineHeight:1,
            color:'white', margin:'0 0 12px',
            textShadow:'0 4px 36px rgba(0,0,0,0.28)',
          }}>About Us</h1>
          <p className="abt-hero-sub" style={{ color:'rgba(255,255,255,0.72)', fontSize:16, margin:0, letterSpacing:'0.04em' }}>
            BFP Station 1 — Cogon · Cagayan de Oro City, Misamis Oriental
          </p>
        </div>

        {/* wave cut bottom */}
        <div style={{ position:'absolute', bottom:-1, left:0, right:0, height:34, overflow:'hidden', pointerEvents:'none' }}>
          <svg viewBox="0 0 1200 34" preserveAspectRatio="none" style={{ width:'100%', height:'100%' }}>
            <path d="M0,34 L0,10 Q300,34 600,14 Q900,0 1200,14 L1200,34 Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* ── WHO WE ARE ── */}
      <section className="abt-who-section" ref={setRef('who')} style={{ background:'white', padding:'84px 0', borderBottom:'1px solid #ece6e0' }}>
        <div style={{ maxWidth:1180, margin:'0 auto', padding:'0 1.25rem' }}>
          <div className="abt-2col abt-who-gap" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:80, alignItems:'center' }}>

            {/* Left */}
            <div className={`abt-reveal-left ${visibleSections['who'] ? 'visible' : ''}`}>
              <p style={{ fontSize:15, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.24em', color:'#c0392b', marginBottom:10, display:'flex', alignItems:'center', gap:10 }}>
                <span className="abt-label-line" />
                Who We Are
              </p>
              <h2 style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'clamp(3rem, 4vw, 3rem)', letterSpacing:'0.04em', lineHeight:1.05, color:'#1a1714', marginBottom:32 }}>
                Station 1 Cogon<br />
                <span style={{ color:'#c0392b' }}>Bureau of Fire Protection</span>
              </h2>

              <div style={{ display:'flex', flexDirection:'column' }}>
                {[
                  { title:'Our Role',   text:'The Bureau of Fire Protection — Station 1 Cogon is the primary government agency responsible for fire prevention, suppression, investigation, and auxiliary emergency services in Cagayan de Oro City.' },
                  { title:'Our Reach',  text:'We serve over 25 barangays, providing 24/7 emergency response, fire safety education, and inspection services to residents, businesses, and institutions across Cagayan de Oro City.' },
                  { title:'Our People', text:'Our team of trained firefighters, rescue personnel, fire safety inspectors, and administrative staff work around the clock in unwavering service to the community.' },
                ].map(({ title, text }) => (
                  <div key={title} className="abt-tl-item">
                    <p className="abt-tl-title" style={{ fontSize:21, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.14em', color:'#c0392b', marginBottom:5 }}>{title}</p>
                    <p style={{ fontSize:15, lineHeight:1.78, color:'#6b6460', margin:0 }}>{text}</p>
                  </div>
                ))}
              </div>

              <div className="abt-stat-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:32 }}>
                {[
                  { val:'24/7',   label:'Emergency Response'   },
                  { val:'35',     label:'Barangays Covered'     },
                  { val:'RA 9514',label:'Fire Code Authority'   },
                  { val:'Reg. X', label:'Regional Jurisdiction' },
                ].map(({ val, label }) => (
                  <div key={label} className="abt-stat-pill">
                    <div>
                      <p style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.35rem', letterSpacing:'0.06em', color:'#c0392b', lineHeight:1, margin:0 }}>{val}</p>
                      <p style={{ fontSize:10, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.07em', color:'#b0aaa6', margin:'3px 0 0' }}>{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Slideshow */}
            <div className={`abt-reveal-right ${visibleSections['who'] ? 'visible' : ''} abt-slideshow-wrap`} style={{ position:'relative', paddingBottom:28 }}>
              <div className="abt-slideshow-inner" style={{
                borderRadius:20, overflow:'hidden', height:480,
                border:'1px solid #e4ddd8',
                boxShadow:'0 32px 84px rgba(0,0,0,0.15)',
                position:'relative',
              }}>
                {images.map((img, i) => (
                  <img key={i} src={img} alt={`BFP Station ${i+1}`} style={{
                    position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover',
                    opacity:currentIndex===i ? 1:0, transition:'opacity 0.6s ease',
                  }} />
                ))}
                <div className="abt-img-shimmer" />
                <div style={{ position:'absolute', inset:0, zIndex:20, background:'linear-gradient(to top, rgba(10,5,3,0.65) 0%, transparent 55%)', pointerEvents:'none' }} />
                {/* top accent */}
                <div style={{ position:'absolute', top:0, left:0, right:0, height:4, background:'linear-gradient(90deg, #8b1a0e, #c0392b, #e67e22)', zIndex:30 }} />
                {/* corner dots */}
                <div style={{ position:'absolute', top:14, right:14, zIndex:30, display:'flex', gap:5 }}>
                  {['rgba(255,255,255,0.3)','rgba(255,255,255,0.55)','rgba(255,255,255,0.85)'].map((c,i)=>(
                    <div key={i} style={{ width:6, height:6, borderRadius:'50%', background:c }} />
                  ))}
                </div>
                <div style={{ position:'absolute', bottom:18, left:18, right:18, zIndex:30, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{
                    display:'flex', alignItems:'center', gap:8,
                    background:'rgba(0,0,0,0.5)', backdropFilter:'blur(14px)',
                    borderRadius:12, padding:'8px 14px', border:'1px solid rgba(255,255,255,0.1)',
                  }}>
                    <Flame size={12} style={{ color:'#e67e22' }} />
                    <span style={{ fontSize:11, fontWeight:700, color:'white', letterSpacing:'0.06em' }}>BFP Station 1 · Cogon</span>
                  </div>
                  <div style={{ display:'flex', gap:6 }}>
                    {images.map((_,idx) => (
                      <button key={idx} onClick={()=>setCurrentIndex(idx)}
                        className={`abt-slide-dot ${currentIndex===idx?'active':'inactive'}`} />
                    ))}
                  </div>
                </div>
              </div>
              {/* Floating badge */}
              <div className="abt-floating-badge" style={{
                position:'absolute', bottom:-10, right:-55,
                background:'linear-gradient(135deg, #c0392b 0%, #8b1a0e 100%)',
                borderRadius:18, padding:'20px 26px',
                boxShadow:'0 18px 52px rgba(192,57,43,0.45)',
                zIndex:50, border:'1px solid rgba(255,255,255,0.1)',
              }}>
                <div style={{ position:'absolute', inset:0, borderRadius:18, background:'radial-gradient(circle at 28% 28%, rgba(255,255,255,0.1), transparent 60%)', pointerEvents:'none' }} />
                <p style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.8rem', color:'rgba(255,255,255,0.52)', lineHeight:1, letterSpacing:'0.4em', margin:0 }}>Since</p>
                <p style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'2.8rem', color:'white', lineHeight:1, letterSpacing:'0.04em', margin:0 }}>1990</p>
                <p style={{ fontSize:9, fontWeight:700, color:'rgba(255,255,255,0.44)', textTransform:'uppercase', letterSpacing:'0.14em', marginTop:5, marginBottom:0 }}>Years of Service</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CORE VALUES ── */}
      <section className="abt-values-section" ref={setRef('values')} style={{ background:'#f5f3f0', padding:'72px 0', borderBottom:'1px solid #e8e2dc', position:'relative', overflow:'hidden' }}>
        {/* dot grid bg */}
        <div style={{ position:'absolute', inset:0, backgroundImage:'radial-gradient(circle, rgba(192,57,43,0.045) 1px, transparent 1px)', backgroundSize:'26px 26px', pointerEvents:'none' }} />

        <div style={{ maxWidth:1180, margin:'0 auto', padding:'0 1.25rem', position:'relative' }}>
          <div className={`abt-reveal ${visibleSections['values'] ? 'visible' : ''}`} style={{ textAlign:'center', marginBottom:48 }}>
            <p style={{ fontSize:15, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.24em', color:'#c0392b', marginBottom:8, display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
              <span className="abt-label-line" />Core Values<span className="abt-label-line" />
            </p>
            <h2 style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'clamp(3.5rem, 4vw, 2.8rem)', letterSpacing:'0.05em', color:'#1a1714', margin:0 }}>
              The BFP Standard
            </h2>
          </div>

          <div className="abt-3col" style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:18 }}>
            {[
              { icon:'🔥', title:'Pusong Nag-aalab',    sub:'Compassion rooted in courage and service',  desc:'First to arrive. Every second counts — we minimize damage by acting decisively in every emergency.', color:'#c0392b', glowColor:'rgba(192,57,43,0.09)', delay:'abt-d1' },
              { icon:'🛠️', title:'Galing sa Gawain',    sub:'Competence that responds with reliability',  desc:'Professionally trained personnel equipped with modern tools for effective fire suppression.',          color:'#b45309', glowColor:'rgba(180,83,9,0.09)',   delay:'abt-d2' },
              { icon:'🤝', title:'Tapat na Paglilingkod',sub:'Integrity grounded in faith and respect',   desc:'Trusted public servants committed to honest, transparent, and accountable service to citizens.',      color:'#1e4d8c', glowColor:'rgba(30,77,140,0.09)',  delay:'abt-d3' },
            ].map(({ icon, title, sub, desc, color, glowColor, delay }) => (
              <div key={title} className={`abt-val-card abt-reveal ${visibleSections['values'] ? 'visible' : ''} ${delay}`}>
                {/* accent bar top */}
                <div className={`abt-val-accent-bar ${visibleSections['values'] ? 'visible' : ''}`} style={{ background:`linear-gradient(90deg, ${color}, transparent)` }} />
                {/* glow orb */}
                <div className="abt-val-card-glow" style={{ background:`radial-gradient(circle, ${glowColor} 0%, transparent 70%)` }} />
                <div className="abt-val-icon" style={{
                  width:50, height:50, borderRadius:15,
                  background:`${color}12`, border:`1.5px solid ${color}22`,
                  fontSize:25, marginBottom:18, marginTop:10,
                }}>
                  {icon}
                </div>
                <p style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'2rem', letterSpacing:'0.04em', color:'#1a1714', lineHeight:1, marginBottom:6 }}>{title}</p>
                <p style={{ fontSize:11.5, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color, marginBottom:12 }}>{sub}</p>
                <p style={{ fontSize:15, lineHeight:1.75, color:'#7a726e', margin:0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION / VISION / MANDATE ── */}
      <section className="abt-mvv-section" ref={setRef('mvv')} style={{ background:'white', padding:'88px 0', borderBottom:'1px solid #ece6e0' }}>
        <div style={{ maxWidth:1180, margin:'0 auto', padding:'0 1.25rem' }}>
          <div className={`abt-reveal ${visibleSections['mvv'] ? 'visible' : ''}`} style={{ textAlign:'center', marginBottom:56 }}>
            <p style={{ fontSize:15, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.24em', color:'#c0392b', marginBottom:8, display:'flex', alignItems:'center', justifyContent:'center', gap:10 }}>
              <span className="abt-label-line" />Guiding Principles<span className="abt-label-line" />
            </p>
            <h2 style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'clamp(3.2rem, 4.5vw, 3.2rem)', letterSpacing:'0.05em', color:'#1a1714', margin:'0 0 10px' }}>
              Mission, Vision & Mandate
            </h2>
            <p style={{ fontSize:15, color:'#8a827e', lineHeight:1.75, maxWidth:440, margin:'0 auto' }}>
              The principles that guide every action, decision, and service of BFP Station 1 — Cogon.
            </p>
          </div>

          <div className="abt-3col" style={{ display:'grid', textAlign:'justify', gridTemplateColumns:'repeat(3, 1fr)', gap:22 }}>
            {[
              {
                icon:<Target size={22} style={{ color:'#c0392b' }} />, label:'Our Mission', badge:'Core',
                bar:'linear-gradient(90deg, #c0392b, #e67e22)',
                iconBg:'rgba(192,57,43,0.08)', iconBorder:'rgba(192,57,43,0.18)',
                badgeColor:'#c0392b', badgeBg:'rgba(192,57,43,0.08)', badgeBorder:'rgba(192,57,43,0.18)',
                cornerBg:'rgba(192,57,43,0.05)',
                text:'We protect life, property, and the environment through an integrated system of prevention, response, and investigation, strengthening public safety and community resilience.',
                delay:'abt-d1',
              },
              {
                icon:<Eye size={22} style={{ color:'#1d4ed8' }} />, label:'Our Vision',
                bar:'linear-gradient(90deg, #1d4ed8, #3b82f6)',
                iconBg:'rgba(29,78,216,0.08)', iconBorder:'rgba(29,78,216,0.18)',
                cornerBg:'rgba(29,78,216,0.05)',
                text:'A modern and trusted fire & emergency service building safe and resilient communities.',
                delay:'abt-d2',
              },
              {
                icon:<FileText size={22} style={{ color:'#1e3a5f' }} />, label:'Our Mandate', badge:'RA 9514',
                bar:'linear-gradient(90deg, #1e3a5f, #2563eb)',
                iconBg:'rgba(30,58,95,0.08)', iconBorder:'rgba(30,58,95,0.18)',
                badgeColor:'#1e3a5f', badgeBg:'rgba(30,58,95,0.08)', badgeBorder:'rgba(30,58,95,0.18)',
                cornerBg:'rgba(30,58,95,0.05)',
                text:'Enforce Republic Act 9514 (Fire Code of the Philippines), prevent and suppress all destructive fires, and ensure public safety through fire prevention programs, systematic inspections, and swift emergency response operations.',
                delay:'abt-d3',
              },
            ].map(({ icon, label, badge, bar, iconBg, iconBorder, badgeColor, badgeBg, badgeBorder, cornerBg, text, delay }) => (
              <div key={label} className={`abt-mvm-card abt-reveal ${visibleSections['mvv'] ? 'visible' : ''} ${delay}`}>
                <div className="card-bar" style={{ background:bar }} />
                {/* corner glow */}
                <div style={{ position:'absolute', top:-24, right:-24, width:110, height:110, borderRadius:'50%', background:`radial-gradient(circle, ${cornerBg} 0%, transparent 70%)`, pointerEvents:'none', transition:'transform 0.4s', }} />
                <div className="card-icon-wrap" style={{ width:54, height:54, borderRadius:16, marginBottom:24, display:'flex', alignItems:'center', justifyContent:'center', background:iconBg, border:`1.5px solid ${iconBorder}`, position:'relative', zIndex:1 }}>
                  {icon}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:10, flexWrap:'wrap' }}>
                  <span style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'2rem', letterSpacing:'0.04em', color:'#1a1714' }}>{label}</span>
                  {badge && <span style={{ fontSize:10, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.1em', color:badgeColor, background:badgeBg, border:`1px solid ${badgeBorder}`, borderRadius:6, padding:'3px 8px' }}>{badge}</span>}
                </div>
                <div style={{ width:30, height:3, background:bar, borderRadius:2, marginBottom:18 }} />
                <p style={{ fontSize:15, lineHeight:1.82, color:'#6b6460', margin:0 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="abt-svc-section" ref={setRef('svc')} style={{ background:'#f5f3f0', padding:'80px 0', borderBottom:'1px solid #e8e2dc' }}>
        <div style={{ maxWidth:1180, margin:'0 auto', padding:'0 1.25rem' }}>
          <div className="abt-svc-layout" style={{ display:'grid', gridTemplateColumns:'280px 1fr', gap:64, alignItems:'start' }}>
            <div className={`abt-reveal-left ${visibleSections['svc'] ? 'visible' : ''}`}>
              <p style={{ fontSize:15, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.24em', color:'#c0392b', marginBottom:10, display:'flex', alignItems:'center', gap:8 }}>
                <span className="abt-label-line" />What We Do
              </p>
              <h2 style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'clamp(3.5rem, 4vw, 2.6rem)', letterSpacing:'0.05em', lineHeight:1, color:'#1a1714', marginBottom:14 }}>
                Our Core<br />Services
              </h2>
              <p style={{ fontSize:15, lineHeight:1.78, color:'#8a827e', margin:0 }}>
                From prevention to suppression, BFP Station 1 delivers comprehensive fire protection to every community under its jurisdiction.
              </p>
            </div>
            <div className="abt-svc-grid" style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14 }}>
              {[
                { icon:<Flame size={20}/>,      title:'Fire Prevention & Inspection', desc:'Systematic safety inspections of residential, commercial, and industrial properties.', accent:'#c0392b', bg:'rgba(192,57,43,0.07)', border:'rgba(192,57,43,0.15)', accentKey:'red',   delay:'abt-d1' },
                { icon:<ShieldCheck size={20}/>, title:'24/7 Emergency Response',      desc:'Round-the-clock standby with rapid dispatch and professional suppression teams.',      accent:'#b45309', bg:'rgba(180,83,9,0.07)',   border:'rgba(180,83,9,0.15)',   accentKey:'amber', delay:'abt-d2' },
                { icon:<Users size={20}/>,       title:'Fire Safety Education',         desc:'Community outreach, school fire drills, and business training programs.',               accent:'#1e4d8c', bg:'rgba(30,77,140,0.07)', border:'rgba(30,77,140,0.15)', accentKey:'blue',  delay:'abt-d3' },
                { icon:<Award size={20}/>,       title:'Fire Code Enforcement',         desc:'Legal enforcement of RA 9514 and issuance of fire safety clearances.',                  accent:'#15614a', bg:'rgba(21,97,74,0.07)', border:'rgba(21,97,74,0.15)',  accentKey:'green', delay:'abt-d4' },
              ].map(({ icon, title, desc, accent, bg, border, accentKey, delay }) => (
                <div key={title} className={`abt-svc-card abt-reveal ${visibleSections['svc'] ? 'visible' : ''} ${delay}`} data-accent={accentKey}>
                  <div className="abt-svc-icon" style={{ width:46, height:46, borderRadius:13, background:bg, border:`1.5px solid ${border}`, color:accent, marginBottom:18 }}>
                    {icon}
                  </div>
                  <p style={{ fontWeight:700, fontSize:19, color:'#1a1714', marginBottom:8, lineHeight:1.3 }}>{title}</p>
                  <p style={{ fontSize:15, lineHeight:1.72, color:'#8a827e', margin:0 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="abt-cta-section" ref={setRef('cta')} style={{ background:'#f5f3f0', padding:'64px 0 72px' }}>
        <div style={{ maxWidth:1180, margin:'0 auto', padding:'0 1.25rem' }}>
          <div className={`abt-reveal ${visibleSections['cta'] ? 'visible' : ''}`} style={{
            borderRadius:24, background:'white',
            border:'1px solid #e8e2dc', overflow:'hidden', position:'relative',
            boxShadow:'0 12px 64px rgba(0,0,0,0.08)',
          }}>
            {/* animated gradient top bar */}
            <div style={{ position:'absolute', top:0, left:0, right:0, height:5, background:'linear-gradient(90deg, #8b1a0e, #c0392b, #e67e22, #c0392b, #8b1a0e)', backgroundSize:'200% 100%', animation:'abt-gradFlow 4s linear infinite' }} />
            {/* dot pattern */}
            <div style={{ position:'absolute', inset:0, pointerEvents:'none', opacity:0.025, backgroundImage:'radial-gradient(circle, #c0392b 1px, transparent 1px)', backgroundSize:'20px 20px' }} />
            {/* watermark */}
            <div style={{ position:'absolute', right:-8, top:'50%', transform:'translateY(-50%)', fontFamily:"'Bebas Neue', sans-serif", fontSize:'clamp(6rem, 15vw, 13rem)', lineHeight:1, letterSpacing:'0.04em', color:'rgba(192,57,43,0.035)', pointerEvents:'none', userSelect:'none', whiteSpace:'nowrap' }}>BFP</div>
            {/* circle decors */}
            <div style={{ position:'absolute', left:-70, top:-70, width:260, height:260, borderRadius:'50%', border:'44px solid rgba(192,57,43,0.04)', pointerEvents:'none' }} />
            <div style={{ position:'absolute', right:180, bottom:-60, width:180, height:180, borderRadius:'50%', border:'30px solid rgba(192,57,43,0.03)', pointerEvents:'none' }} />

            <div className="abt-cta-flex abt-cta-inner" style={{ position:'relative', zIndex:1, padding:'44px 48px', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:28 }}>
              <div className="abt-cta-icon-text" style={{ display:'flex', alignItems:'center', gap:24, flex:1, minWidth:260 }}>
                <div>
                  <p style={{ fontSize:10, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.22em', color:'#c0392b', marginBottom:6 }}>Bureau of Fire Protection</p>
                  <h3 style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'clamp(1.4rem, 3vw, 2rem)', letterSpacing:'0.04em', color:'#1a1714', lineHeight:1, marginBottom:8 }}>
                    Home of the BRAVEST Firefighters
                  </h3>
                  <p style={{ fontSize:12.5, color:'#b0aaa6', margin:0, fontWeight:500 }}>BFP Station 1 · Cogon · Cagayan de Oro City · Region X</p>
                </div>
              </div>

              <div className="abt-cta-stats" style={{ display:'flex', flexShrink:0 }}>
                {[
                  { label:'Established', value:'1990'    },
                  { label:'Coverage',    value:'35 Brgy.' },
                  { label:'Response',    value:'24 / 7'  },
                ].map(({ label, value }, i) => (
                  <div key={label} className="abt-cta-stat" style={{ textAlign:'center', padding:'14px 24px', borderLeft:i>0 ? '1px solid #ece6e0':'none' }}>
                    <span className="abt-cta-stat-val" style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:'1.5rem', letterSpacing:'0.06em', color:'#c0392b', lineHeight:1 }}>{value}</span>
                    <span style={{ fontSize:9, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.12em', color:'#b0aaa6', marginTop:4, display:'block' }}>{label}</span>
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