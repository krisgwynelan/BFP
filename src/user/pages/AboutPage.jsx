import React, { useState, useEffect } from "react";
import { Target, Eye, ShieldCheck, FileText, Flame, Users, Award, MapPin, Phone, Clock } from "lucide-react";

export function AboutPage() {
  const images = ["/Wall.jpg"];
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div id="about-root" style={{ fontFamily: "'DM Sans', sans-serif", background: '#f5f3f0', width: '100%', position: 'relative', isolation: 'isolate', zIndex: 0 }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');

        #about-root *, #about-root *::before, #about-root *::after { box-sizing: border-box; }

        @keyframes abt-fadeUp { from { opacity: 0; transform: translateY(28px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes abt-slideIn { from { opacity: 0; transform: translateX(-20px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes abt-barGrow { from { width: 0; } to { width: 100%; } }

        #about-root .abt-fade-1 { animation: abt-fadeUp 0.8s ease 0.05s both; }
        #about-root .abt-fade-2 { animation: abt-fadeUp 0.8s ease 0.2s both; }
        #about-root .abt-fade-3 { animation: abt-fadeUp 0.8s ease 0.35s both; }
        #about-root .abt-fade-4 { animation: abt-fadeUp 0.8s ease 0.5s both; }

        #about-root .abt-mvm-card {
          background: white;
          border: 1px solid #e8e2dc;
          border-radius: 16px;
          padding: 36px 28px 32px;
          position: relative;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        #about-root .abt-mvm-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 52px rgba(0,0,0,0.1);
        }
        #about-root .abt-mvm-card .card-bar {
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
        }

        #about-root .abt-stat-pill {
          display: flex; align-items: center; gap: 12px;
          background: white; border: 1px solid #e8e2dc; border-radius: 14px;
          padding: 16px 20px;
          transition: all 0.2s;
        }
        #about-root .abt-stat-pill:hover {
          border-color: rgba(192,57,43,0.35);
          box-shadow: 0 6px 20px rgba(192,57,43,0.08);
          transform: translateY(-2px);
        }

        #about-root .abt-slide-dot {
          width: 6px; height: 6px; border-radius: 50%; border: none;
          cursor: pointer; transition: all 0.25s; padding: 0;
        }
        #about-root .abt-slide-dot.active { background: white; transform: scale(1.5); }
        #about-root .abt-slide-dot.inactive { background: rgba(255,255,255,0.4); }
        #about-root .abt-slide-dot.inactive:hover { background: rgba(255,255,255,0.7); }

        #about-root .abt-tl-item { position: relative; padding-left: 24px; padding-bottom: 20px; }
        #about-root .abt-tl-item::before {
          content: ''; position: absolute; left: 0; top: 6px;
          width: 9px; height: 9px; border-radius: 50%;
          background: #c0392b;
          box-shadow: 0 0 0 3px rgba(192,57,43,0.12);
        }
        #about-root .abt-tl-item::after {
          content: ''; position: absolute; left: 3.5px; top: 16px;
          width: 2px; height: calc(100% - 8px);
          background: linear-gradient(to bottom, rgba(192,57,43,0.2), transparent);
        }
        #about-root .abt-tl-item:last-child::after { display: none; }

        #about-root .abt-svc-card {
          background: white; border: 1px solid #e8e2dc; border-radius: 14px;
          padding: 24px 20px; transition: all 0.22s;
        }
        #about-root .abt-svc-card:hover {
          box-shadow: 0 12px 36px rgba(0,0,0,0.08); transform: translateY(-4px);
          border-color: #d4ccc6;
        }

        #about-root .abt-val-card {
          padding: 28px 24px;
          border-radius: 14px;
          background: white; border: 1px solid #e8e2dc;
          transition: all 0.22s;
        }
        #about-root .abt-val-card:hover {
          box-shadow: 0 12px 36px rgba(0,0,0,0.07); transform: translateY(-4px);
        }

        /* ── Base responsive (tablet ≤ 900px) ── */
        @media (max-width: 900px) {
          #about-root .abt-2col { grid-template-columns: 1fr !important; }
          #about-root .abt-3col { grid-template-columns: 1fr !important; }
          #about-root .abt-4col { grid-template-columns: 1fr 1fr !important; }
          #about-root .abt-svc-layout { grid-template-columns: 1fr !important; }
          #about-root .abt-cta-flex { flex-direction: column !important; align-items: flex-start !important; }
          #about-root .abt-cta-stats { flex-direction: row !important; gap: 20px !important; }
          #about-root .abt-who-gap { gap: 40px !important; }
          #about-root .abt-badge-fix { right: 0 !important; bottom: 0 !important; position: static !important; margin-top: 16px !important; align-self: flex-start; }
          #about-root .abt-slideshow-wrap { padding-bottom: 0 !important; }
          #about-root .abt-slideshow-inner { height: 320px !important; }
          #about-root .abt-svc-grid { grid-template-columns: 1fr !important; }
          #about-root .abt-stat-grid { grid-template-columns: 1fr 1fr !important; }
          #about-root .abt-who-section { padding: 48px 0 !important; }
          #about-root .abt-mvv-section { padding: 56px 0 !important; }
          #about-root .abt-svc-section { padding: 48px 0 !important; }
          #about-root .abt-cta-section { padding: 40px 0 48px !important; }
          #about-root .abt-values-section { padding: 48px 0 !important; }
          #about-root .abt-cta-inner { padding: 28px 24px !important; }
        }

        /* ── Mobile (≤ 600px) ── */
        @media (max-width: 600px) {
          #about-root .abt-4col { grid-template-columns: 1fr !important; }
          #about-root .abt-stat-grid { grid-template-columns: 1fr 1fr !important; }
          #about-root .abt-cta-stats { flex-direction: column !important; gap: 0 !important; }
          #about-root .abt-cta-stats > div { border-left: none !important; border-top: 1px solid #ece6e0; padding: 12px 0 !important; }
          #about-root .abt-cta-stats > div:first-child { border-top: none !important; }
          #about-root .abt-svc-layout-inner { grid-template-columns: 1fr !important; }
          #about-root .abt-hero-pad { padding: 40px 0 56px !important; }
          #about-root .abt-who-section { padding: 36px 0 !important; }
          #about-root .abt-mvv-section { padding: 40px 0 !important; }
          #about-root .abt-cta-inner-flex { flex-direction: column !important; align-items: flex-start !important; }
          #about-root .abt-cta-icon-text { gap: 14px !important; }
          #about-root .abt-slideshow-inner { height: 240px !important; }
          #about-root .abt-floating-badge { display: none !important; }
        }

        /* ── Small mobile (≤ 400px) ── */
        @media (max-width: 400px) {
          #about-root .abt-stat-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      {/* ── HERO BANNER ── */}
      <section className="abt-hero-pad" style={{
        position: 'relative',
        padding: '56px 0 82px',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, #aa2112 0%, #811515 60%, #ea1e0f 100%)',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.1,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.25rem', position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 12 }}>
            <Flame size={16} style={{ color: 'rgba(255,255,255,0.7)' }} />
            <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.22em', margin: 0 }}>
              Bureau of Fire Protection
            </p>
          </div>
          <h1 style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(2.8rem, 7vw, 5rem)',
            letterSpacing: '0.05em',
            lineHeight: 1,
            color: 'white',
            margin: '0 0 8px',
          }}>
            About Us
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: 0 }}>
            BFP Station 1 — Cogon · Cagayan de Oro City, Misamis Oriental
          </p>
        </div>
      </section>

      {/* ── WHO WE ARE ── */}
      <section className="abt-who-section" style={{ background: 'white', padding: '84px 0', borderBottom: '1px solid #ece6e0' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 1.25rem' }}>
          <div className="abt-2col abt-who-gap" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, alignItems: 'center' }}>

            {/* Left */}
            <div>
              <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.24em', color: '#c0392b', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-block', width: 24, height: 2, background: '#c0392b', borderRadius: 2, verticalAlign: 'middle' }} />
                Who We Are
              </p>
              <h2 style={{
                fontFamily: "'Bebas Neue', sans-serif",
                fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '0.04em', lineHeight: 1.05,
                color: '#1a1714', marginBottom: 32,
              }}>
                Station 1 Cogon<br />
                <span style={{ color: '#c0392b' }}>Bureau of Fire Protection</span>
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {[
                  { title: 'Our Role', text: 'The Bureau of Fire Protection — Station 1 Cogon is the primary government agency responsible for fire prevention, suppression, investigation, and auxiliary emergency services in Cagayan de Oro City.' },
                  { title: 'Our Reach', text: 'We serve over 25 barangays, providing 24/7 emergency response, fire safety education, and inspection services to residents, businesses, and institutions across Cagayan de Oro City.' },
                  { title: 'Our People', text: 'Our team of trained firefighters, rescue personnel, fire safety inspectors, and administrative staff work around the clock in unwavering service to the community.' },
                ].map(({ title, text }) => (
                  <div key={title} className="abt-tl-item">
                    <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#c0392b', marginBottom: 4 }}>{title}</p>
                    <p style={{ fontSize: 13.5, lineHeight: 1.78, color: '#6b6460', margin: 0 }}>{text}</p>
                  </div>
                ))}
              </div>

              <div className="abt-stat-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 32 }}>
                {[
                  { val: '24/7', label: 'Emergency Response', icon: '🚒' },
                  { val: '25+', label: 'Barangays Covered', icon: '📍' },
                  { val: 'RA 9514', label: 'Fire Code Authority', icon: '⚖️' },
                  { val: 'Reg. X', label: 'Regional Jurisdiction', icon: '🗺️' },
                ].map(({ val, label, icon }) => (
                  <div key={label} className="abt-stat-pill">
                    <span style={{ fontSize: 20 }}>{icon}</span>
                    <div>
                      <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.35rem', letterSpacing: '0.06em', color: '#c0392b', lineHeight: 1, margin: 0 }}>{val}</p>
                      <p style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', color: '#b0aaa6', margin: '2px 0 0' }}>{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Slideshow */}
            <div className="abt-slideshow-wrap" style={{ position: 'relative', paddingBottom: 28 }}>
              <div className="abt-slideshow-inner" style={{
                borderRadius: 15, overflow: 'hidden', height: 480,
                border: '1px solid #e4ddd8',
                boxShadow: '0 24px 72px rgba(0,0,0,0.14)',
                position: 'relative',
              }}>
                {images.map((img, i) => (
                  <img key={i} src={img} alt={`BFP Station ${i + 1}`} style={{
                    position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'fit',
                    opacity: currentIndex === i ? 1 : 0,
                    transition: 'opacity 0.5s ease',
                  }} />
                ))}
                <div style={{ position: 'absolute', inset: 0, zIndex: 20, background: 'linear-gradient(to top, rgba(10,5,3,0.6) 0%, transparent 55%)', pointerEvents: 'none' }} />
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #8b1a0e, #c0392b, #e67e22)', zIndex: 30 }} />
                <div style={{ position: 'absolute', bottom: 18, left: 18, right: 18, zIndex: 30, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)',
                    borderRadius: 10, padding: '7px 13px', border: '1px solid rgba(255,255,255,0.1)',
                  }}>
                    <Flame size={12} style={{ color: '#e67e22' }} />
                    <span style={{ fontSize: 11, fontWeight: 700, color: 'white', letterSpacing: '0.06em' }}>BFP Station 1 · Cogon</span>
                  </div>
                  <div style={{ display: 'flex', gap: 5 }}>
                    {images.map((_, idx) => (
                      <button key={idx} onClick={() => setCurrentIndex(idx)}
                        className={`abt-slide-dot ${currentIndex === idx ? 'active' : 'inactive'}`} />
                    ))}
                  </div>
                </div>
              </div>
              {/* Floating badge */}
              <div className="abt-floating-badge" style={{
                position: 'absolute', bottom: -10, right: -55,
                background: 'linear-gradient(135deg, #c0392b 0%, #8b1a0e 100%)',
                borderRadius: 14, padding: '18px 22px',
                boxShadow: '0 14px 40px rgba(192,57,43,0.45)',
                zIndex: 50,
              }}>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.8rem', color: 'rgba(255,255,255,0.6)', lineHeight: 1, letterSpacing: '0.4em', margin: 0 }}>Since</p>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.6rem', color: 'white', lineHeight: 1, letterSpacing: '0.04em', margin: 0 }}>1990</p>
                <p style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.45)', textTransform: 'uppercase', letterSpacing: '0.14em', marginTop: 4, marginBottom: 0 }}>Years of Service</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CORE VALUES ── */}
      <section className="abt-values-section" style={{ background: '#f5f3f0', padding: '72px 0', borderBottom: '1px solid #e8e2dc' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 1.25rem' }}>
          <div style={{ textAlign: 'center', marginBottom: 44 }}>
            <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.24em', color: '#c0392b', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <span style={{ display: 'inline-block', width: 24, height: 2, background: '#c0392b', borderRadius: 2 }} />
              Core Values
              <span style={{ display: 'inline-block', width: 24, height: 2, background: '#c0392b', borderRadius: 2 }} />
            </p>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2rem, 4vw, 2.8rem)', letterSpacing: '0.05em', color: '#1a1714', margin: 0 }}>
              The BFP Standard
            </h2>
          </div>

          <div className="abt-4col" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            {[
              { icon: '⚡', title: 'Mabilis', sub: 'Rapid Response', desc: 'First to arrive. Every second counts — we minimize damage by acting decisively in every emergency.', color: '#c0392b' },
              { icon: '🛡️', title: 'Mahusay', sub: 'Excellence', desc: 'Professionally trained personnel equipped with modern tools for effective fire suppression.', color: '#b45309' },
              { icon: '🤝', title: 'Matapat', sub: 'Integrity', desc: 'Trusted public servants committed to honest, transparent, and accountable service to citizens.', color: '#1e4d8c' },
              { icon: '❤️', title: 'Makabayan', sub: 'Patriotism', desc: 'Serving with love of country — protecting every life, every property, every single day.', color: '#15614a' },
            ].map(({ icon, title, sub, desc, color }) => (
              <div key={title} className="abt-val-card">
                <div style={{
                  width: 44, height: 44, borderRadius: 12,
                  background: `${color}12`, border: `1.5px solid ${color}22`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 22, marginBottom: 16,
                }}>
                  {icon}
                </div>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.35rem', letterSpacing: '0.04em', color: '#1a1714', lineHeight: 1, marginBottom: 4 }}>{title}</p>
                <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color, marginBottom: 10 }}>{sub}</p>
                <p style={{ fontSize: 12.5, lineHeight: 1.72, color: '#7a726e', margin: 0 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MISSION / VISION / MANDATE ── */}
      <section className="abt-mvv-section" style={{ background: 'white', padding: '88px 0', borderBottom: '1px solid #ece6e0' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 1.25rem' }}>
          <div style={{ textAlign: 'center', marginBottom: 52 }}>
            <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.24em', color: '#c0392b', marginBottom: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
              <span style={{ display: 'inline-block', width: 24, height: 2, background: '#c0392b', borderRadius: 2 }} />
              Guiding Principles
              <span style={{ display: 'inline-block', width: 24, height: 2, background: '#c0392b', borderRadius: 2 }} />
            </p>
            <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2.2rem, 4.5vw, 3.2rem)', letterSpacing: '0.05em', color: '#1a1714', margin: '0 0 10px' }}>
              Mission, Vision & Mandate
            </h2>
            <p style={{ fontSize: 13.5, color: '#8a827e', lineHeight: 1.75, maxWidth: 440, margin: '0 auto' }}>
              The principles that guide every action, decision, and service of BFP Station 1 — Cogon.
            </p>
          </div>

          <div className="abt-3col" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
            {[
              {
                icon: <Target size={22} style={{ color: '#c0392b' }} />,
                label: 'Our Mission', badge: 'Core',
                bar: 'linear-gradient(90deg, #c0392b, #e67e22)',
                iconBg: 'rgba(192,57,43,0.08)', iconBorder: 'rgba(192,57,43,0.18)',
                badgeColor: '#c0392b', badgeBg: 'rgba(192,57,43,0.08)', badgeBorder: 'rgba(192,57,43,0.18)',
                text: 'We commit to prevent and suppress destructive fires, investigate their causes; enforce Fire Code and other related laws; respond to man-made and natural disasters and other emergencies.',
              },
              {
                icon: <Eye size={22} style={{ color: '#1d4ed8' }} />,
                label: 'Our Vision', badge: '2034',
                bar: 'linear-gradient(90deg, #1d4ed8, #3b82f6)',
                iconBg: 'rgba(29,78,216,0.08)', iconBorder: 'rgba(29,78,216,0.18)',
                badgeColor: '#1d4ed8', badgeBg: 'rgba(29,78,216,0.08)', badgeBorder: 'rgba(29,78,216,0.18)',
                text: 'A modern fire service fully capable of ensuring a fire-safe nation by 2034.',
              },
              {
                icon: <FileText size={22} style={{ color: '#1e3a5f' }} />,
                label: 'Our Mandate', badge: 'RA 9514',
                bar: 'linear-gradient(90deg, #1e3a5f, #2563eb)',
                iconBg: 'rgba(30,58,95,0.08)', iconBorder: 'rgba(30,58,95,0.18)',
                badgeColor: '#1e3a5f', badgeBg: 'rgba(30,58,95,0.08)', badgeBorder: 'rgba(30,58,95,0.18)',
                text: 'Enforce Republic Act 9514 (Fire Code of the Philippines), prevent and suppress all destructive fires, and ensure public safety through fire prevention programs, systematic inspections, and swift emergency response operations.',
              },
            ].map(({ icon, label, badge, bar, iconBg, iconBorder, badgeColor, badgeBg, badgeBorder, text }) => (
              <div key={label} className="abt-mvm-card">
                <div className="card-bar" style={{ background: bar }} />
                <div style={{ width: 52, height: 52, borderRadius: 14, marginBottom: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', background: iconBg, border: `1.5px solid ${iconBorder}` }}>
                  {icon}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10, flexWrap: 'wrap' }}>
                  <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.45rem', letterSpacing: '0.04em', color: '#1a1714' }}>{label}</span>
                  <span style={{ fontSize: 9, fontWeight: 800, color: badgeColor, textTransform: 'uppercase', letterSpacing: '0.1em', background: badgeBg, border: `1px solid ${badgeBorder}`, padding: '2px 9px', borderRadius: 999 }}>{badge}</span>
                </div>
                <div style={{ width: 28, height: 2, background: bar, borderRadius: 1, marginBottom: 16 }} />
                <p style={{ fontSize: 13, lineHeight: 1.82, color: '#6b6460', margin: 0 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section className="abt-svc-section" style={{ background: '#f5f3f0', padding: '80px 0', borderBottom: '1px solid #e8e2dc' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 1.25rem' }}>
          <div className="abt-svc-layout" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 64, alignItems: 'start' }}>
            <div>
              <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.24em', color: '#c0392b', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ display: 'inline-block', width: 22, height: 2, background: '#c0392b', borderRadius: 2 }} />
                What We Do
              </p>
              <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2rem, 4vw, 2.6rem)', letterSpacing: '0.05em', lineHeight: 1, color: '#1a1714', marginBottom: 14 }}>
                Our Core<br />Services
              </h2>
              <p style={{ fontSize: 13, lineHeight: 1.78, color: '#8a827e', margin: 0 }}>
                From prevention to suppression, BFP Station 1 delivers comprehensive fire protection to every community under its jurisdiction.
              </p>
            </div>
            <div className="abt-svc-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                { icon: <Flame size={19} />, title: 'Fire Prevention & Inspection', desc: 'Systematic safety inspections of residential, commercial, and industrial properties.', accent: '#c0392b', bg: 'rgba(192,57,43,0.07)', border: 'rgba(192,57,43,0.15)' },
                { icon: <ShieldCheck size={19} />, title: '24/7 Emergency Response', desc: 'Round-the-clock standby with rapid dispatch and professional suppression teams.', accent: '#b45309', bg: 'rgba(180,83,9,0.07)', border: 'rgba(180,83,9,0.15)' },
                { icon: <Users size={19} />, title: 'Fire Safety Education', desc: 'Community outreach, school fire drills, and business training programs.', accent: '#1e4d8c', bg: 'rgba(30,77,140,0.07)', border: 'rgba(30,77,140,0.15)' },
                { icon: <Award size={19} />, title: 'Fire Code Enforcement', desc: 'Legal enforcement of RA 9514 and issuance of fire safety clearances.', accent: '#15614a', bg: 'rgba(21,97,74,0.07)', border: 'rgba(21,97,74,0.15)' },
              ].map(({ icon, title, desc, accent, bg, border }) => (
                <div key={title} className="abt-svc-card">
                  <div style={{ width: 42, height: 42, borderRadius: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', background: bg, border: `1.5px solid ${border}`, color: accent, marginBottom: 14 }}>
                    {icon}
                  </div>
                  <p style={{ fontWeight: 700, fontSize: 13.5, color: '#1a1714', marginBottom: 7, lineHeight: 1.35 }}>{title}</p>
                  <p style={{ fontSize: 12.5, lineHeight: 1.72, color: '#8a827e', margin: 0 }}>{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="abt-cta-section" style={{ background: '#f5f3f0', padding: '64px 0 72px' }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 1.25rem' }}>
          <div style={{
            borderRadius: 20, background: 'white',
            border: '1px solid #e8e2dc',
            overflow: 'hidden', position: 'relative',
            boxShadow: '0 8px 48px rgba(0,0,0,0.07)',
          }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: 'linear-gradient(90deg, #8b1a0e, #c0392b, #e67e22)' }} />
            <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.022, backgroundImage: 'linear-gradient(rgba(192,57,43,1) 1px, transparent 1px), linear-gradient(90deg, rgba(192,57,43,1) 1px, transparent 1px)', backgroundSize: '28px 28px' }} />
            <div style={{ position: 'absolute', right: -8, top: '50%', transform: 'translateY(-50%)', fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(6rem, 15vw, 13rem)', lineHeight: 1, letterSpacing: '0.04em', color: 'rgba(192,57,43,0.038)', pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap' }}>BFP</div>
            <div style={{ position: 'absolute', left: -70, top: -70, width: 260, height: 260, borderRadius: '50%', border: '44px solid rgba(192,57,43,0.05)', pointerEvents: 'none' }} />

            <div className="abt-cta-flex abt-cta-inner" style={{ position: 'relative', zIndex: 1, padding: '40px 44px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 28 }}>
              <div className="abt-cta-icon-text" style={{ display: 'flex', alignItems: 'center', gap: 24, flex: 1, minWidth: 260 }}>
                <div style={{
                  width: 68, height: 68, borderRadius: 18, flexShrink: 0,
                  background: 'linear-gradient(135deg, #8b1a0e, #c0392b)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: '0 8px 28px rgba(192,57,43,0.32)',
                }}>
                  <Flame size={30} style={{ color: 'white' }} />
                </div>
                <div>
                  <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.22em', color: '#c0392b', marginBottom: 5 }}>Bureau of Fire Protection</p>
                  <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(1.4rem, 3vw, 2rem)', letterSpacing: '0.04em', color: '#1a1714', lineHeight: 1, marginBottom: 7 }}>
                    Home of the BRAVEST Firefighters
                  </h3>
                  <p style={{ fontSize: 12.5, color: '#b0aaa6', margin: 0, fontWeight: 500 }}>BFP Station 1 · Cogon · Cagayan de Oro City · Region X</p>
                </div>
              </div>

              <div className="abt-cta-stats" style={{ display: 'flex', flexShrink: 0 }}>
                {[
                  { label: 'Established', value: '1990', icon: '📅' },
                  { label: 'Coverage', value: '25+ Brgy.', icon: '📍' },
                  { label: 'Response', value: '24 / 7', icon: '🚒' },
                ].map(({ label, value, icon }, i) => (
                  <div key={label} style={{ textAlign: 'center', padding: '14px 22px', borderLeft: i > 0 ? '1px solid #ece6e0' : 'none' }}>
                    <span style={{ fontSize: 15, display: 'block', marginBottom: 4 }}>{icon}</span>
                    <span style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.45rem', letterSpacing: '0.06em', color: '#c0392b', lineHeight: 1, display: 'block' }}>{value}</span>
                    <span style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#b0aaa6', marginTop: 3, display: 'block' }}>{label}</span>
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