import React, { useState, useEffect } from "react";
import { Target, Eye, ShieldCheck, FileText, Flame, Users } from "lucide-react";

export function AboutPage() {
  const images = ["/Fire.jpg", "/Wall.jpg", "/Cogon.jpg", "/HELP.jpg"];
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [images.length]);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#fdf9f8', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
        .fade-up { animation: fadeUp 0.45s ease forwards; }
        .mvmcard {
          background: white;
          border: 1.5px solid #f0e8e5;
          border-radius: 20px;
          padding: 36px 28px;
          text-align: center;
          transition: all 0.25s ease;
          position: relative; overflow: hidden;
        }
        .mvmcard::before {
          content: '';
          position: absolute; top: 0; left: 0; right: 0; height: 3px;
          transform: scaleX(0); transform-origin: left;
          transition: transform 0.3s ease;
        }
        .mvmcard:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(0,0,0,0.08); }
        .mvmcard:hover::before { transform: scaleX(1); }
        .mvmcard.red::before { background: linear-gradient(90deg, #c0392b, #e67e22); }
        .mvmcard.blue::before { background: linear-gradient(90deg, #1d4ed8, #3b82f6); }
        .mvmcard.green::before { background: linear-gradient(90deg, #15803d, #22c55e); }
        .slide-dot {
          width: 8px; height: 8px; border-radius: 50%;
          border: none; cursor: pointer; transition: all 0.2s;
        }
        .slide-dot.active { background: #c0392b; transform: scale(1.3); }
        .slide-dot.inactive { background: rgba(255,255,255,0.6); }
        .slide-dot.inactive:hover { background: rgba(255,255,255,0.85); }
      `}</style>

      {/* ── HERO BANNER ── */}
      <section className="relative py-14 sm:py-18 overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #aa2112 0%, #811515 60%, #ea1e0f 100%' }}>
        <div className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Flame size={16} className="text-white/70" />
            <p className="text-white/80 text-[11px] font-bold uppercase tracking-[0.22em]">Bureau of Fire Protection</p>
          </div>
          <h1 className="font-black text-white leading-none"
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2.8rem, 7vw, 5rem)', letterSpacing: '0.05em' }}>
            About Us
          </h1>
          <p className="text-white/70 text-sm mt-2 max-w-md mx-auto">
            BFP Station 1 — Cogon · Cagayan de Oro City, Misamis Oriental
          </p>
        </div>
      </section>

      {/* ── MAIN ABOUT SECTION ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="grid md:grid-cols-2 gap-14 items-center">

          {/* Text */}
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] mb-2" style={{ color: '#c0392b' }}>
              Who We Are
            </p>
            <h2 className="font-black leading-none mb-6"
              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '0.04em', color: '#1c1917' }}>
              Station 1 Cogon<br />
              <span style={{ color: '#c0392b' }}>Bureau of Fire Protection</span>
            </h2>

            <div className="space-y-4">
              {[
                'The Bureau of Fire Protection – Cagayan de Oro City is the primary government agency responsible for fire prevention, suppression, and auxiliary services.',
                'We serve residents, businesses, and institutions by providing 24/7 emergency response and fire safety education throughout Northern Mindanao.',
                'Our dedicated team works tirelessly to prevent fires, respond to emergencies, and promote fire safety awareness across the city.',
              ].map((text, i) => (
                <p key={i} className="text-sm leading-relaxed flex items-start gap-3" style={{ color: '#57534e' }}>
                  <span className="w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                    style={{ background: 'linear-gradient(135deg, #c0392b, #e67e22)' }} />
                  {text}
                </p>
              ))}
            </div>

            {/* Quick facts */}
            <div className="grid grid-cols-2 gap-4 mt-8">
              {[
                { val: '24/7', label: 'Emergency Response' },
                { val: '25+', label: 'Barangays Covered' },
                { val: '2026', label: 'Serving Since' },
                { val: 'CDO', label: 'City Station' },
              ].map(({ val, label }) => (
                <div key={label} className="px-4 py-3 rounded-xl"
                  style={{ background: 'white', border: '1.5px solid #f0e8e5' }}>
                  <p className="font-black text-xl leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.06em', color: '#c0392b' }}>{val}</p>
                  <p className="text-[10px] font-semibold uppercase tracking-wider mt-0.5" style={{ color: '#a8a29e' }}>{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Slideshow */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl"
            style={{ height: '420px', border: '1.5px solid #f0e8e5' }}>
            {images.map((img, index) => (
              <img
                key={index}
                src={img}
                alt={`Station photo ${index + 1}`}
                className="absolute inset-0 w-full h-full object-cover transition-all duration-1000"
                style={{ opacity: currentIndex === index ? 1 : 0, transform: currentIndex === index ? 'scale(1.03)' : 'scale(1)', zIndex: currentIndex === index ? 10 : 0 }}
              />
            ))}
            {/* Overlay */}
            <div className="absolute inset-0 z-20 pointer-events-none"
              style={{ background: 'linear-gradient(to top, rgba(28,25,23,0.4) 0%, transparent 50%)' }} />

            {/* Top accent bar */}
            <div className="absolute top-0 left-0 right-0 h-1 z-30"
              style={{ background: 'linear-gradient(90deg, #c0392b, #e67e22)' }} />

            {/* Slide dots */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
              {images.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentIndex(idx)}
                  className={`slide-dot ${currentIndex === idx ? 'active' : 'inactive'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── WHO ARE WE BANNER ── */}
      <section className="py-12" style={{ background: 'white', borderTop: '1.5px solid #f0e8e5', borderBottom: '1.5px solid #f0e8e5' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(192,57,43,0.08)', border: '1.5px solid rgba(192,57,43,0.18)' }}>
              <ShieldCheck size={20} style={{ color: '#c0392b' }} />
            </div>
            <h3 className="font-black leading-none"
              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2rem', letterSpacing: '0.05em', color: '#1c1917' }}>
              Who We Are
            </h3>
          </div>
          <p className="text-sm leading-relaxed mb-3" style={{ color: '#57534e' }}>
            We are a team of highly trained and dedicated fire protection professionals committed to safeguarding lives and properties in Cagayan de Oro City.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: '#78716c' }}>
            Our firefighters, rescue personnel, and administrative staff work around the clock to provide comprehensive fire protection services throughout the community.
          </p>
        </div>
      </section>

      {/* ── MISSION / VISION / MANDATE ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-20">
        <div className="text-center mb-12">
          <p className="text-[10px] font-bold uppercase tracking-[0.22em] mb-2" style={{ color: '#c0392b' }}>
            Our Guiding Principles
          </p>
          <h2 className="font-black leading-none"
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2rem, 5vw, 3rem)', letterSpacing: '0.05em', color: '#1c1917' }}>
            Mission, Vision & Mandate
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Mission */}
          <div className="mvmcard red">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(192,57,43,0.09)', border: '1.5px solid rgba(192,57,43,0.18)' }}>
              <Target size={24} style={{ color: '#c0392b' }} />
            </div>
            <h4 className="font-black text-xl mb-4 leading-none"
              style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em', color: '#1c1917' }}>
              Our Mission
            </h4>
            <div className="w-8 h-[2px] rounded-full mx-auto mb-4"
              style={{ background: 'linear-gradient(90deg, #c0392b, #e67e22)' }} />
            <p className="text-sm leading-relaxed" style={{ color: '#57534e' }}>
              We commit to prevent and suppress destructive fires, investigate their causes, enforce the fire code and other related laws, and respond to man-made, natural disasters and other emergencies.
            </p>
          </div>

          {/* Vision */}
          <div className="mvmcard blue">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(29,78,216,0.08)', border: '1.5px solid rgba(29,78,216,0.18)' }}>
              <Eye size={24} style={{ color: '#1d4ed8' }} />
            </div>
            <h4 className="font-black text-xl mb-4 leading-none"
              style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em', color: '#1c1917' }}>
              Our Vision
            </h4>
            <div className="w-8 h-[2px] rounded-full mx-auto mb-4"
              style={{ background: 'linear-gradient(90deg, #1d4ed8, #3b82f6)' }} />
            <p className="text-sm leading-relaxed" style={{ color: '#57534e' }}>
              A modern fire service fully capable of ensuring a fire-safe nation by 2034, equipped with the best personnel, equipment, and technology to protect every Filipino community.
            </p>
          </div>

          {/* Mandate */}
          <div className="mvmcard green">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
              style={{ background: 'rgba(21,128,61,0.08)', border: '1.5px solid rgba(21,128,61,0.18)' }}>
              <FileText size={24} style={{ color: '#15803d' }} />
            </div>
            <h4 className="font-black text-xl mb-4 leading-none"
              style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em', color: '#1c1917' }}>
              Our Mandate
            </h4>
            <div className="w-8 h-[2px] rounded-full mx-auto mb-4"
              style={{ background: 'linear-gradient(90deg, #15803d, #22c55e)' }} />
            <p className="text-sm leading-relaxed" style={{ color: '#57534e' }}>
              Enforce Republic Act 9514 (Fire Code of the Philippines), prevent and suppress all destructive fires, and ensure public safety through fire prevention programs, inspections, and emergency response operations.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}