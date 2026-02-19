import { Link } from 'react-router';
import { MapPin, Phone, Mail, Flame, ExternalLink } from 'lucide-react';

export function Footer() {
  return (
    <footer style={{ fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        .footer-link { font-size: 13px; color: #78716c; font-weight: 500; transition: color 0.15s; display: block; padding: 3px 0; }
        .footer-link:hover { color: #c0392b; }
        .footer-social-btn {
          width: 36px; height: 36px; border-radius: 9px;
          display: flex; align-items: center; justify-content: center;
          background: #f5f0ed; border: 1.5px solid #ede8e5;
          color: #78716c; transition: all 0.18s;
        }
        .footer-social-btn:hover { background: rgba(192,57,43,0.08); border-color: rgba(192,57,43,0.2); color: #c0392b; }
      `}</style>

      {/* Emergency Strip */}
      <div style={{ background: 'linear-gradient(135deg, #c0392b, #e22f10)' }} className="py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <Phone size={18} className="text-white" />
              </div>
              <div>
                <p className="text-white/70 text-[10px] font-bold uppercase tracking-widest">Fire Emergency Hotline</p>
                <p className="text-white font-black text-xl leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.08em' }}>
                  Call 911 — Available 24/7
                </p>
              </div>
            </div>
            <a href="tel:911"
              className="flex items-center gap-2 bg-white text-red-700 font-black text-sm uppercase tracking-widest px-6 py-2.5 rounded-xl shadow-lg hover:bg-orange-50 transition-all">
              <Phone size={14} /> Dial 911 Now
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div style={{ background: '#fdf9f8', borderTop: '1.5px solid #f0e8e5' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-2.5 mb-4">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden shadow-sm"
                  style={{ background: 'linear-gradient(135deg, #aa2112 0%, #811515 60%, #ea1e0f 100%)' }}
                >
                  <img
                    src="/CDO.jpg"
                    alt="Cagayan de Oro City"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div>
                  <p className="font-black text-sm leading-tight"
                    style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.07em', color: '#1c1917', fontSize: '1rem' }}>
                    BFP Station 1
                  </p>
                  <p className="text-[9px] font-bold uppercase tracking-widest" style={{ color: '#c0392b' }}>Cogon, CDO</p>
                </div>
              </div>
              <p className="text-xs leading-relaxed mb-4" style={{ color: '#78716c' }}>
                Bureau of Fire Protection — Cogon Fire Station. Committed to protecting lives and property in Northern Mindanao.
              </p>
              {/* Social */}
              <div className="flex gap-2">
                <a href="https://www.facebook.com/profile.php?id=61574576392850" target="_blank" rel="noopener noreferrer" className="footer-social-btn">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
                <a href="cogonfs@gmail.com" className="footer-social-btn">
                  <Mail size={15} />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-4" style={{ color: '#c0392b' }}>Quick Links</p>
              <div className="space-y-0.5">
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
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-4" style={{ color: '#c0392b' }}>Emergency Contacts</p>
              <div className="space-y-3">
                {[
                  { icon: Phone, label: 'National Emergency', value: '911', href: 'tel:911', accent: true },
                  { icon: Phone, label: 'Local Hotline', value: '09267520623', href: 'tel:09267520623' },
                  { icon: Mail, label: 'Email', value: 'cogonfs@gmail.com', href: 'mailto:cogonfs@gmail.com' },
                ].map(({ icon: Icon, label, value, href, accent }) => (
                  <a key={label} href={href}
                    className="flex items-start gap-2.5 group"
                    style={{ textDecoration: 'none' }}>
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all group-hover:scale-105"
                      style={{ background: accent ? 'rgba(192,57,43,0.1)' : '#f5f0ed', border: `1.5px solid ${accent ? 'rgba(192,57,43,0.2)' : '#ede8e5'}` }}>
                      <Icon size={12} style={{ color: accent ? '#c0392b' : '#a8a29e' }} />
                    </div>
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#c4b5b0' }}>{label}</p>
                      <p className="text-xs font-semibold group-hover:text-red-600 transition-colors" style={{ color: accent ? '#c0392b' : '#44403c' }}>{value}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Location */}
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] mb-4" style={{ color: '#c0392b' }}>Station Location</p>
              <div className="flex items-start gap-2.5 mb-4">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5"
                  style={{ background: 'rgba(192,57,43,0.08)', border: '1.5px solid rgba(192,57,43,0.18)' }}>
                  <MapPin size={12} style={{ color: '#c0392b' }} />
                </div>
                <p className="text-xs leading-relaxed" style={{ color: '#57534e' }}>
                  Capt. Vicente Roa, Brgy. 33,<br />Cagayan de Oro City,<br />Misamis Oriental
                </p>
              </div>
              <a href="https://www.google.com/maps/search/?api=1&query=BFP+Station+1+Cogon+Cagayan+de+Oro"
                target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-2 rounded-lg transition-all"
                style={{ background: 'rgba(192,57,43,0.07)', border: '1.5px solid rgba(192,57,43,0.15)', color: '#c0392b' }}>
                <ExternalLink size={11} /> Open in Maps
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ borderTop: '1px solid #ede8e5' }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-[11px]" style={{ color: '#c4b5b0' }}>
              © {new Date().getFullYear()} Bureau of Fire Protection — Cogon Fire Station. All rights reserved.
            </p>
            <p className="text-[11px]" style={{ color: '#d1c4be' }}>
              Republic of the Philippines · DILG
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}