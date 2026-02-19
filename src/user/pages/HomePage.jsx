import { Link } from 'react-router';
import { WeeklyReportsSlideshow } from '../components/WeeklyReportsSlideshow';
import { getWeeklyReports } from '../../utils/storage';
import { useEffect, useState } from 'react';
import { ArrowRight, Shield, Flame, Clock, BookOpen, Phone, ChevronDown } from 'lucide-react';
import Fire from '/Fire.jpg';

export function HomePage() {
  const [reports, setReports] = useState([]);

  useEffect(() => {
    setReports(getWeeklyReports());
  }, []);

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.4;transform:scale(0.8);} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px);} to{opacity:1;transform:translateY(0);} }
        @keyframes scrollBounce { 0%,100%{transform:translateX(-50%) translateY(0);} 50%{transform:translateX(-50%) translateY(6px);} }
        .hero-fade-1 { animation: fadeUp 0.8s ease 0.1s both; }
        .hero-fade-2 { animation: fadeUp 0.8s ease 0.3s both; }
        .hero-fade-3 { animation: fadeUp 0.8s ease 0.5s both; }
        .hero-fade-4 { animation: fadeUp 0.8s ease 0.7s both; }
        .service-card {
          background: white;
          border: 1.5px solid #f0e8e5;
          border-radius: 20px;
          padding: 32px 28px;
          text-align: center;
          transition: all 0.25s ease;
          position: relative;
          overflow: hidden;
        }
        .service-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #c0392b, #e64922);
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s ease;
        }
        .service-card:hover { transform: translateY(-6px); box-shadow: 0 20px 48px rgba(192,57,43,0.1); border-color: #e8c4bc; }
        .service-card:hover::before { transform: scaleX(1); }
        .scroll-indicator { animation: scrollBounce 2s ease-in-out infinite; }
        .stat-badge {
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.25);
          backdrop-filter: blur(8px);
          border-radius: 12px;
          padding: 12px 18px;
          text-align: center;
        }
      `}</style>

      {/* ═══════════════ HERO ═══════════════ */}
      <section className="relative min-h-screen flex flex-col justify-end overflow-hidden">
        {/* BG Image */}
        <img src={Fire} alt="Fire Station" className="absolute inset-0 w-full h-full object-cover" />

        {/* Gradient overlays */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(10,5,2,0.92) 0%, rgba(15,5,2,0.65) 40%, rgba(0,0,0,0.25) 100%)' }} />
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to right, rgba(10,5,2,0.6) 0%, transparent 60%)' }} />

        {/* Diagonal accent strip */}
        <div className="absolute top-0 left-0 w-1 h-full opacity-80"
          style={{ background: 'linear-gradient(to bottom, #c0392b, #e67e22, transparent)' }} />

        {/* Content */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20 pt-32 w-full">
          <div className="max-w-3xl">

            {/* Live badge */}
            <div className="hero-fade-1 flex items-center gap-2 mb-6">
              <span className="flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest text-white"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)' }}>
                <span className="w-2 h-2 rounded-full bg-green-400" style={{ animation: 'pulseDot 2s ease-in-out infinite' }} />
                Station Operational · 24/7
              </span>
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest text-white"
                style={{ background: 'rgba(192,57,43,0.35)', border: '1px solid rgba(192,57,43,0.5)', backdropFilter: 'blur(8px)' }}>
                <Shield size={11} />
                BFP Station 1
              </span>
            </div>

            {/* Headline */}
            <h1 className="hero-fade-2 text-white leading-none mb-5"
              style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(3.2rem, 8vw, 6.5rem)', letterSpacing: '0.04em' }}>
              COGON<br />
              <span style={{ color: '#e67e22' }}>FIRE STATION</span>
            </h1>

            <p className="hero-fade-3 text-base sm:text-lg mb-2 font-light"
              style={{ color: 'rgba(255,255,255,0.75)', maxWidth: '520px', lineHeight: 1.7 }}>
              Capt. Vicente Roa, Brgy. 33, Cagayan De Oro City
            </p>
            <p className="hero-fade-3 text-sm mb-8"
              style={{ color: 'rgba(255,255,255,0.55)', maxWidth: '480px', lineHeight: 1.7 }}>
              Committed to preventing and suppressing destructive fires, safeguarding lives and properties, and promoting fire safety awareness throughout Northern Mindanao.
            </p>

            {/* CTA Row */}
            <div className="hero-fade-4 flex flex-wrap gap-3 mb-10">
              <Link to="/about"
                className="flex items-center gap-2 font-bold text-sm px-6 py-3 rounded-xl text-white transition-all hover:scale-105"
                style={{ background: 'linear-gradient(135deg, #c0392b, #e64a11)', boxShadow: '0 4px 20px rgba(192,57,43,0.4)' }}>
                About Us <ArrowRight size={15} />
              </Link>
              <a href="tel:911"
                className="flex items-center gap-2 font-bold text-sm px-6 py-3 rounded-xl transition-all hover:scale-105"
                style={{ background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(255,255,255,0.3)', color: 'white', backdropFilter: 'blur(8px)' }}>
                <Phone size={14} /> Emergency: 911
              </a>
            </div>

            {/* Stats */}
            <div className="hero-fade-4 flex flex-wrap gap-3">
              {[
                { value: '24/7', label: 'Response' },
                { value: '911', label: 'Emergency' },
                { value: '<5min', label: 'Avg. Response' },
                { value: '25+', label: 'Barangays' },
              ].map(({ value, label }) => (
                <div key={label} className="stat-badge">
                  <p className="text-white font-black text-xl leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.05em' }}>{value}</p>
                  <p className="text-white/50 text-[10px] font-semibold uppercase tracking-widest mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 scroll-indicator" style={{ transform: 'translateX(-50%)' }}>
          <ChevronDown size={22} className="text-white/40" />
        </div>
      </section>

      {/* ═══════════════ WEEKLY UPDATES ═══════════════ */}
      <section style={{ background: '#fdf9f8' }} className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] mb-2" style={{ color: '#c0392b' }}>Latest From The Station</p>
            <h2 className="font-black leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', letterSpacing: '0.05em', color: '#1c1917' }}>
              Weekly Updates
            </h2>
          </div>
          <WeeklyReportsSlideshow reports={reports} />
        </div>
      </section>

      {/* ═══════════════ QUICK INFO ═══════════════ */}
      <section style={{ background: 'white', borderTop: '1.5px solid #f0e8e5', borderBottom: '1.5px solid #f0e8e5' }} className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] mb-2" style={{ color: '#c0392b' }}>What We Do</p>
            <h2 className="font-black leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.5rem', letterSpacing: '0.05em', color: '#1c1917' }}>
              Our Core Services
            </h2>
            <p className="mt-3 text-sm max-w-lg mx-auto" style={{ color: '#78716c' }}>
              Serving the community of Cagayan de Oro City with dedication and professionalism
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" />
                  </svg>
                ),
                title: 'Fire Prevention',
                desc: 'Proactive programs and inspections to prevent fires and protect our community from fire hazards.',
                tag: 'Prevention First',
              },
              {
                icon: <Clock className="w-8 h-8" />,
                title: '24/7 Emergency Response',
                desc: 'Round-the-clock emergency response services for all fire incidents with the fastest possible dispatch.',
                tag: 'Always Ready',
              },
              {
                icon: <BookOpen className="w-8 h-8" />,
                title: 'Fire Safety Education',
                desc: 'Comprehensive training and awareness programs for schools, businesses, and communities.',
                tag: 'Community First',
              },
            ].map(({ icon, title, desc, tag }) => (
              <div key={title} className="service-card">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                  style={{ background: 'rgba(192,57,43,0.08)', border: '1.5px solid rgba(192,57,43,0.15)', color: '#c0392b' }}>
                  {icon}
                </div>
                <h3 className="font-bold text-lg mb-3" style={{ color: '#1c1917' }}>{title}</h3>
                <p className="text-sm leading-relaxed mb-5" style={{ color: '#78716c' }}>{desc}</p>
                <span className="inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full"
                  style={{ background: 'rgba(192,57,43,0.07)', border: '1.5px solid rgba(192,57,43,0.15)', color: '#c0392b' }}>
                  {tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}