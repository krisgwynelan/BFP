import { Link, useLocation } from 'react-router';
import { Menu, X, Phone, Flame } from 'lucide-react';
import { useState, useEffect } from 'react';
import Logo from '/BFP-LOGO.png';

export function Header() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/about', label: 'About Us' },
    { path: '/officers', label: 'Officers' },
    { path: '/contact', label: 'Contact Us' },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        .header-wrap { font-family: 'DM Sans', sans-serif; }
        @keyframes ticker { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .ticker-track { animation: ticker 28s linear infinite; }
        .ticker-track:hover { animation-play-state: paused; }
        .nav-link-item {
          position: relative;
          font-weight: 600;
          font-size: 13.5px;
          letter-spacing: 0.02em;
          padding: 7px 16px;
          border-radius: 8px;
          transition: all 0.18s ease;
          color: #44403c;
        }
        .nav-link-item:hover { color: #c0392b; background: rgba(192,57,43,0.07); }
        .nav-link-item.active {
          color: #f3331e;
          background: rgba(192,57,43,0.09);
          font-weight: 700;
        }
        .nav-link-item.active::after {
          content: '';
          position: absolute;
          bottom: 2px; left: 50%; transform: translateX(-50%);
          width: 18px; height: 2px;
          background: linear-gradient(90deg, #c0392b, #e66d22);
          border-radius: 2px;
        }
        .mobile-nav-link {
          display: block; padding: 11px 16px; border-radius: 10px;
          font-weight: 600; font-size: 14px; color: #44403c;
          transition: all 0.15s; margin-bottom: 2px;
        }
        .mobile-nav-link:hover { background: rgba(192,57,43,0.07); color: #c0392b; }
        .mobile-nav-link.active { background: rgba(192,57,43,0.1); color: #c0392b; font-weight: 700; }
        .header-main {
          background: white;
          transition: box-shadow 0.25s ease;
        }
        .header-main.scrolled {
          box-shadow: 0 2px 20px rgba(0,0,0,0.08);
        }
      `}</style>

      <header className="sticky top-0 z-50 header-wrap">



        {/* ── MAIN HEADER ── */}
        <div className={`header-main ${scrolled ? 'scrolled' : ''}`}
          style={{ borderBottom: '1.5px solid #f0e8e5' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-[68px]">

              {/* Logo & Brand */}
              <Link to="/" className="flex items-center gap-3 group">
                <div className="relative shrink-0">
                  <img
                    src={Logo}
                    alt="BFP Logo"
                    className="w-12 h-12 rounded-full object-cover"
                    style={{ border: '2.5px solid #c0392b', boxShadow: '0 2px 8px rgba(192,57,43,0.2)' }}
                  />
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-500 border-2 border-white"
                    style={{ animation: 'pulseDot 2s ease-in-out infinite' }} />
                </div>
                <div>
                  <p className="font-black text-[15px] leading-tight group-hover:text-red-700 transition-colors"
                    style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.07em', color: '#1c1917', fontSize: '1.15rem' }}>
                    BFP Station 1 — Cogon
                  </p>
                  <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: '#c0392b' }}>
                    Bureau of Fire Protection · CDO
                  </p>
                </div>
              </Link>

              {/* Desktop Nav */}
              <nav className="hidden md:flex items-center gap-1">
                {navLinks.map((link) => (
                  <Link key={link.path} to={link.path}
                    className={`nav-link-item ${isActive(link.path) ? 'active' : ''}`}>
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Mobile burger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl transition-all"
                style={{ background: mobileMenuOpen ? 'rgba(192,57,43,0.09)' : '#f5f0ed', border: '1.5px solid #ede8e5', color: '#44403c' }}
              >
                {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>

            {/* Mobile Nav */}
            {mobileMenuOpen && (
              <div className="md:hidden pb-4 pt-2" style={{ borderTop: '1px solid #f5ede9' }}>
                {navLinks.map((link) => (
                  <Link key={link.path} to={link.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`mobile-nav-link ${isActive(link.path) ? 'active' : ''}`}>
                    {link.label}
                  </Link>
                ))}
                <a href="tel:911"
                  className="flex items-center gap-2 text-white text-sm font-bold px-4 py-3 rounded-xl mt-2 justify-center"
                  style={{ background: 'linear-gradient(135deg, #c0392b, #e67e22)' }}>
                  <Phone size={15} /> Emergency: Call 911
                </a>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}