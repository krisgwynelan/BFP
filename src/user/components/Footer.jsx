import { Link } from 'react-router';
import { MapPin, Phone, Mail, Flame, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        .footer-link { font-size: 13px; color: #78716c; font-weight: 500; transition: color 0.15s; display: block; padding: 3px 0; text-decoration: none; }
        .footer-link:hover { color: #c0392b; }
        .footer-social-btn {
          width: 36px; height: 36px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          background: #f5f0ed; border: 1.5px solid #ede8e5;
          color: #78716c; transition: all 0.18s; text-decoration: none;
        }
        .footer-social-btn:hover { background: rgba(192,57,43,0.08); border-color: rgba(192,57,43,0.2); color: #c0392b; }
        .ft-contact-link { text-decoration: none; display: flex; align-items: flex-start; gap: 10px; }
        .ft-contact-link:hover .ft-contact-val { color: #c0392b; }
        .ft-contact-val { font-size: 12px; font-weight: 600; color: #44403c; transition: color 0.15s; }

        /* ── Emergency strip responsive ── */
        .ft-strip-inner { display: flex; flex-direction: row; align-items: center; justify-content: space-between; gap: 16px; flex-wrap: wrap; }
        .ft-strip-btn { display: inline-flex; align-items: center; gap: 6px; background: white; color: #b91c1c; font-weight: 800; font-size: 13px; text-transform: uppercase; letter-spacing: 0.1em; padding: 10px 22px; border-radius: 12px; box-shadow: 0 4px 14px rgba(0,0,0,0.15); transition: all 0.18s; text-decoration: none; flex-shrink: 0; }
        .ft-strip-btn:hover { background: #fff7ed; }

        /* ── Main grid ── */
        .ft-main-grid { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 40px; }

        /* ── Tablet (≤ 900px) ── */
        @media (max-width: 900px) {
          .ft-main-grid { grid-template-columns: 1fr 1fr; gap: 32px; }
          .ft-brand-col { grid-column: 1 / -1; }
        }

        /* ── Mobile (≤ 560px) ── */
        @media (max-width: 560px) {
          .ft-main-grid { grid-template-columns: 1fr; gap: 24px; }
          .ft-brand-col { grid-column: auto; }
          .ft-strip-inner { flex-direction: column; align-items: flex-start; gap: 12px; }
          .ft-strip-btn { width: 100%; justify-content: center; }
          .ft-bottom-bar { flex-direction: column; align-items: flex-start !important; gap: 4px !important; }
        }
      `}</style>

      {/* Emergency Strip */}
      <div style={{ background: 'linear-gradient(135deg, #c0392b, #e22f10)', padding: '20px 0' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 1.25rem' }}>
          <div className="ft-strip-inner">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Phone size={18} color="white" />
              </div>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', margin: 0 }}>Fire Emergency Hotline</p>
                <p style={{ color: 'white', fontFamily: "'Bebas Neue', sans-serif", fontSize: 22, letterSpacing: '0.08em', lineHeight: 1, margin: 0, fontWeight: 900 }}>
                  Call 911 — Available 24/7
                </p>
              </div>
            </div>
            <a href="tel:911" className="ft-strip-btn">
              <Phone size={14} /> Dial 911 Now
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div style={{ background: '#fdf9f8', borderTop: '1.5px solid #f0e8e5' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', padding: '48px 1.25rem' }}>
          <div className="ft-main-grid">

            {/* Brand */}
            <div className="ft-brand-col">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
                background: 'transparent',
                flexShrink: 0,
              }}>
                <img src="/CDO.png" alt="Cagayan de Oro City" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
                <div>
                  <p style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.07em', color: '#1c1917', fontSize: '1rem', fontWeight: 900, lineHeight: 1 }}>BFP Station 1</p>
                  <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#c0392b', margin: '2px 0 0' }}>Cogon, CDO</p>
                </div>
              </div>
              <p style={{ fontSize: 12, lineHeight: 1.75, color: '#78716c', marginBottom: 14, maxWidth: 280 }}>
                Bureau of Fire Protection — Cogon Fire Station. Committed to protecting lives and property in Northern Mindanao.
              </p>
              <div style={{ display: 'flex', gap: 8 }}>
                <a href="https://www.facebook.com/profile.php?id=61574576392850" target="_blank" rel="noopener noreferrer" className="footer-social-btn">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="mailto:cogonfs@gmail.com" className="footer-social-btn">
                  <Mail size={15} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#c0392b', marginBottom: 14 }}>Quick Links</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                {[
                  { to: '/', label: 'Home' },
                  { to: '/about', label: 'About Us' },
                  { to: '/officers', label: 'Our Officers' },
                  { to: '/contact', label: 'Contact Us' },
                ].map(({ to, label }) => (
                  <Link key={to} to={to} className="footer-link">{label}</Link>
                ))}
              </div>
            </div>

            {/* Emergency Contacts */}
            <div>
              <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#c0392b', marginBottom: 14 }}>Emergency Contacts</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {[
                  { icon: Phone, label: 'National Emergency', value: '911', href: 'tel:911', accent: true },
                  { icon: Phone, label: 'Local Hotline', value: '09267520623', href: 'tel:09267520623' },
                  { icon: Mail, label: 'Email', value: 'cogonfs@gmail.com', href: 'mailto:cogonfs@gmail.com' },
                ].map(({ icon: Icon, label, value, href, accent }) => (
                  <a key={label} href={href} className="ft-contact-link">
                    <div style={{
                      width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1,
                      background: accent ? 'rgba(192,57,43,0.1)' : '#f5f0ed',
                      border: `1.5px solid ${accent ? 'rgba(192,57,43,0.2)' : '#ede8e5'}`,
                    }}>
                      <Icon size={12} style={{ color: accent ? '#c0392b' : '#a8a29e' }} />
                    </div>
                    <div>
                      <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#c4b5b0', margin: 0 }}>{label}</p>
                      <p className="ft-contact-val" style={{ color: accent ? '#c0392b' : '#44403c', margin: '1px 0 0' }}>{value}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#c0392b', marginBottom: 14 }}>Station Location</p>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
                <div style={{ width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: 1, background: 'rgba(192,57,43,0.08)', border: '1.5px solid rgba(192,57,43,0.18)' }}>
                  <MapPin size={12} style={{ color: '#c0392b' }} />
                </div>
                <p style={{ fontSize: 12, lineHeight: 1.75, color: '#57534e', margin: 0 }}>
                  Capt. Vicente Roa, Brgy. 33,<br />Cagayan de Oro City,<br />Misamis Oriental
                </p>
              </div>
              <a href="https://www.google.com/maps/search/?api=1&query=BFP+Station+1+Cogon+Cagayan+de+Oro"
                target="_blank" rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, padding: '8px 14px', borderRadius: 10, background: 'rgba(192,57,43,0.07)', border: '1.5px solid rgba(192,57,43,0.15)', color: '#c0392b', textDecoration: 'none', transition: 'all 0.18s' }}>
                <ExternalLink size={11} /> Open in Maps
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid #ede8e5' }}>
          <div className="ft-bottom-bar" style={{ maxWidth: 1280, margin: '0 auto', padding: '14px 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 6 }}>
            <p style={{ fontSize: 11, color: '#c4b5b0', margin: 0 }}>
              © {new Date().getFullYear()} Bureau of Fire Protection — Cogon Fire Station. All rights reserved.
            </p>
            <p style={{ fontSize: 11, color: '#d1c4be', margin: 0 }}>
              Republic of the Philippines · DILG
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
} 