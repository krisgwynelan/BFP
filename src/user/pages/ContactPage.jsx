import { useState, useEffect } from "react";
import {
  Phone, Mail, MapPin, Clock, AlertTriangle,
  Facebook, ExternalLink, Shield, Flame, ChevronRight
} from "lucide-react";
import { getContactInfo } from "../../utils/storage";

const DEFAULT_DATA = {
  nationalEmergency: "911",
  localHotline: "(088) 856-FIRE",
  email: "bfpcogon@fire.gov.ph",
  facebookPage: "facebook.com/BFPCogonStation",
  location: "BFP Cogon Fire Station, Cagayan de Oro City 9000",
  officeHours: [
    { type: "Monday – Friday",  time: "8:00 AM – 5:00 PM" },
    { type: "Saturday",         time: "8:00 AM – 12:00 PM" },
    { type: "Sunday",           time: "Closed" },
    { type: "Emergency Line",   time: "24 / 7" },
  ],
  barangays: [
    "J.P. Laurel", "Quezon", "Sto. Niño", "New Pandan", "San Francisco",
    "Manay", "Tibungco", "Gredu", "Kasilak", "Buenavista",
    "Cacao", "Dapco", "Consolacion", "San Pedro", "Tagpore",
    "Malativas", "Kapalong", "Sindaton", "Southern Davao", "Tomado",
    "San Roque", "Magistral", "Napungas", "New Visayas", "Cagangohan",
  ],
};

function normalise(raw) {
  if (!raw) return DEFAULT_DATA;
  return {
    ...DEFAULT_DATA,
    ...raw,
    officeHours: Array.isArray(raw.officeHours) ? raw.officeHours : DEFAULT_DATA.officeHours,
    barangays:   Array.isArray(raw.barangays)   ? raw.barangays   : DEFAULT_DATA.barangays,
  };
}

function ContactCard({ icon, label, value, href, description, accent = "#c0392b" }) {
  const [hov, setHov] = useState(false);

  const inner = (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        position: 'relative', overflow: 'hidden',
        borderRadius: 18, height: '100%', padding: '28px 24px',
        cursor: href ? 'pointer' : 'default',
        background: 'white',
        border: `1.5px solid ${hov ? accent + '45' : '#ede8e4'}`,
        boxShadow: hov ? `0 16px 40px ${accent}18` : '0 2px 8px rgba(0,0,0,0.04)',
        transform: hov ? 'translateY(-5px)' : 'none',
        transition: 'all 0.24s ease',
      }}>
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 3,
        background: `linear-gradient(90deg, ${accent}, ${accent}70)`,
        opacity: hov ? 1 : 0, transition: 'opacity 0.22s',
      }} />
      <div style={{
        width: 48, height: 48, borderRadius: 14,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 20,
        background: hov ? `${accent}15` : 'rgba(192,57,43,0.06)',
        border: `1.5px solid ${hov ? accent + '30' : '#ede8e4'}`,
        color: accent, transition: 'all 0.22s',
      }}>
        {icon}
      </div>
      <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#c4b5b0', marginBottom: 6 }}>{label}</p>
      <p style={{ fontWeight: 700, fontSize: 15, color: '#1c1917', lineHeight: 1.35, marginBottom: 4, wordBreak: 'break-word' }}>{value || '—'}</p>
      {description && <p style={{ fontSize: 11.5, color: '#a8a29e', lineHeight: 1.6 }}>{description}</p>}
      {href && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 14, color: accent, fontSize: 11, fontWeight: 700, opacity: hov ? 1 : 0, transform: hov ? 'translateX(0)' : 'translateX(-6px)', transition: 'all 0.22s' }}>
          <span>View</span>
          <ChevronRight size={12} />
        </div>
      )}
    </div>
  );

  if (!href) return inner;
  return (
    <a href={href} target={href.startsWith("mailto") || href.startsWith("tel") ? "_self" : "_blank"} rel="noreferrer" style={{ display: 'block', height: '100%', textDecoration: 'none' }}>
      {inner}
    </a>
  );
}

function BarangayChip({ name }) {
  const [hov, setHov] = useState(false);
  return (
    <span
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 6,
        padding: '5px 12px', borderRadius: 8,
        fontSize: 11.5, fontWeight: 600, cursor: 'default',
        background: hov ? 'rgba(192,57,43,0.08)' : 'white',
        border: `1.5px solid ${hov ? 'rgba(192,57,43,0.22)' : '#ede8e4'}`,
        color: hov ? '#c0392b' : '#57534e',
        transform: hov ? 'translateY(-2px)' : 'none',
        boxShadow: hov ? '0 4px 12px rgba(192,57,43,0.1)' : 'none',
        transition: 'all 0.18s ease',
      }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: hov ? '#c0392b' : '#d4b8b3', flexShrink: 0, transition: 'background 0.18s' }} />
      {name}
    </span>
  );
}

export function ContactPage() {
  const [contact, setContact] = useState(null);
  const [mounted, setMounted] = useState(false);

  const loadContact = async () => {
    try {
      const info = await getContactInfo();
      setContact(normalise(info));
    } catch (err) {
      console.error('Failed to load contact info:', err);
      setContact(DEFAULT_DATA);
    }
  };

  useEffect(() => {
    loadContact().then(() => setTimeout(() => setMounted(true), 80));
  }, []);

  useEffect(() => {
    const id = setInterval(() => { loadContact(); }, 5000);
    return () => clearInterval(id);
  }, []);

  if (!contact) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f6f4' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '2.5px solid #c0392b', borderTopColor: 'transparent', animation: 'spin 1s linear infinite' }} />
          <p style={{ fontSize: 13, fontWeight: 600, color: '#a8a29e' }}>Loading contact information…</p>
        </div>
      </div>
    );
  }

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.location || "BFP Cogon Fire Station Cagayan de Oro")}`;
  const fbHref  = contact.facebookPage
    ? (contact.facebookPage.startsWith("http") ? contact.facebookPage : `https://${contact.facebookPage}`)
    : undefined;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#f8f6f4', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes pulseDot  { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.35;transform:scale(0.75);} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(18px);} to{opacity:1;transform:translateY(0);} }
        @keyframes ticker    { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        .ticker-outer { overflow: hidden; }
        .ticker-inner { animation: ticker 30s linear infinite; white-space: nowrap; display: flex; gap: 0; }
        .ticker-inner:hover { animation-play-state: paused; }
        a { text-decoration: none; color: inherit; }

        /* ── Tablet (≤ 900px) ── */
        @media (max-width: 900px) {
          .ct-cards-grid { grid-template-columns: 1fr 1fr !important; }
          .ct-hero-stats { gap: 8px !important; }
          .ct-911-card { flex-direction: column !important; align-items: flex-start !important; gap: 20px !important; }
          .ct-911-actions { align-items: flex-start !important; }
          .ct-bottom-grid { grid-template-columns: 1fr !important; }
          .ct-hero-pad { padding-top: 52px !important; padding-bottom: 68px !important; }
          .ct-section-pad { padding: 0 1.25rem !important; }
          .ct-barangay-section { padding: 28px 24px !important; }
        }

        /* ── Mobile (≤ 640px) ── */
        @media (max-width: 640px) {
          .ct-cards-grid { grid-template-columns: 1fr !important; }
          .ct-hero-h1 { font-size: clamp(3rem, 10vw, 5rem) !important; }
          .ct-hero-stats { flex-wrap: wrap !important; }
          .ct-hero-stat-chip { flex: 1 1 calc(50% - 8px) !important; }
          .ct-hero-badges { flex-direction: column !important; align-items: flex-start !important; gap: 8px !important; }
          .ct-911-number { font-size: 3rem !important; }
          .ct-map-area { height: 220px !important; }
          .ct-address-row { flex-direction: column !important; align-items: flex-start !important; gap: 14px !important; }
          .ct-address-row a { width: 100% !important; justify-content: center !important; }
          .ct-cta-dark { padding: 20px 20px !important; }
          .ct-cta-dark-btns { flex-wrap: wrap !important; }
          .ct-barangay-header { flex-direction: column !important; align-items: flex-start !important; gap: 12px !important; }
          .ct-hero-pad { padding-top: 40px !important; padding-bottom: 52px !important; }
          .ct-lifted-card-inner { padding: 20px 18px !important; }
        }

        /* ── Small mobile (≤ 420px) ── */
        @media (max-width: 420px) {
          .ct-hero-stat-chip { flex: 1 1 100% !important; }
          .ct-911-number { font-size: 2.5rem !important; }
        }
      `}</style>

      {/* ══ HERO ══ */}
      <section className="ct-hero-pad" style={{
        position: 'relative',
        background: 'linear-gradient(135deg, #991b0f 0%, #7a1212 50%, #c0392b 100%)',
        overflow: 'hidden',
        paddingTop: 72, paddingBottom: 88,
        opacity: mounted ? 1 : 0, transition: 'opacity 0.6s ease',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.08,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.2) 1px, transparent 1px)',
          backgroundSize: '48px 48px',
        }} />
        <div style={{ position: 'absolute', right: -60, top: -60, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,255,255,0.06) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 4, background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), rgba(255,255,255,0.05))' }} />

        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 1.25rem', position: 'relative', zIndex: 10 }}>
          <div className="ct-hero-badges" style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.22)' }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#4ade80', flexShrink: 0, animation: 'pulseDot 2s ease-in-out infinite' }} />
              <span style={{ fontSize: 10, fontWeight: 700, color: 'white', textTransform: 'uppercase', letterSpacing: '0.14em' }}>Emergency Services Active</span>
            </div>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '5px 14px', borderRadius: 999, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
              <MapPin size={10} style={{ color: 'rgba(255,255,255,0.7)' }} />
              <span style={{ fontSize: 10, fontWeight: 600, color: 'rgba(255,255,255,0.8)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Cogon · CDO</span>
            </div>
          </div>

          <h1 className="ct-hero-h1" style={{
            fontFamily: "'Bebas Neue', sans-serif",
            fontSize: 'clamp(3.5rem, 9vw, 7.5rem)',
            letterSpacing: '0.05em', lineHeight: 0.9,
            color: 'white', marginBottom: 22,
          }}>
            CONTACT<br />
            <span style={{ opacity: 0.85 }}>& REACH US</span>
          </h1>

          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, maxWidth: 460, marginBottom: 36 }}>
            Bureau of Fire Protection — Station 1, Cogon.<br />
            Prepared. Responsive. Committed to your safety.
          </p>

          <div className="ct-hero-stats" style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {[
              { val: '911', label: 'Emergency' },
              { val: '24/7', label: 'Response' },
              { val: '25+', label: 'Barangays' },
            ].map(({ val, label }) => (
              <div key={label} className="ct-hero-stat-chip" style={{ padding: '12px 20px', borderRadius: 14, textAlign: 'center', background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(8px)' }}>
                <p style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.6rem', letterSpacing: '0.06em', color: 'white', lineHeight: 1 }}>{val}</p>
                <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.16em', color: 'rgba(255,255,255,0.45)', marginTop: 2 }}>{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ 911 LIFTED CARD ══ */}
      <div className="ct-section-pad" style={{ maxWidth: 1200, margin: '-36px auto 0', padding: '0 2rem', position: 'relative', zIndex: 20 }}>
        <div style={{ borderRadius: 20, overflow: 'hidden', background: 'white', border: '1.5px solid #ede8e4', boxShadow: '0 16px 48px rgba(192,57,43,0.14)' }}>
          <div style={{ height: 3, background: 'linear-gradient(90deg, #c0392b, #e67e22, #f39c12)' }} />
          <div className="ct-911-card ct-lifted-card-inner" style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 20, padding: '28px 36px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ width: 64, height: 64, borderRadius: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'rgba(192,57,43,0.08)', border: '1.5px solid rgba(192,57,43,0.18)' }}>
                <Phone size={26} style={{ color: '#c0392b' }} />
              </div>
              <div>
                <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#c0392b', marginBottom: 4 }}>National Emergency Hotline</p>
                <p className="ct-911-number" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '4.5rem', letterSpacing: '0.05em', color: '#1c1917', lineHeight: 1 }}>
                  {contact.nationalEmergency || "911"}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 6 }}>
                  <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#22c55e', flexShrink: 0, animation: 'pulseDot 2s ease-in-out infinite' }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a' }}>Live & Monitored 24 Hours, 7 Days a Week</span>
                </div>
              </div>
            </div>

            <div className="ct-911-actions" style={{ display: 'flex', flexDirection: 'column', gap: 10, alignItems: 'flex-end' }}>
              <a href={`tel:${contact.nationalEmergency || "911"}`}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  color: 'white', fontWeight: 800, fontSize: 13,
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  padding: '14px 28px', borderRadius: 14,
                  background: 'linear-gradient(135deg, #c0392b, #e64a11)',
                  boxShadow: '0 6px 24px rgba(192,57,43,0.38)',
                  transition: 'all 0.2s',
                }}>
                <Phone size={16} />
                Call {contact.nationalEmergency || "911"} Now
              </a>
              <p style={{ fontSize: 10, color: '#a8a29e', fontWeight: 500 }}>For non-emergency: use local station hotline</p>
            </div>
          </div>
        </div>
      </div>

      {/* ══ CONTACT CARDS ══ */}
      <section className="ct-section-pad" style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 2rem 0' }}>
        <div className="ct-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          <ContactCard
            label="Local Station Hotline"
            value={contact.localHotline}
            href={contact.localHotline ? `tel:${contact.localHotline}` : undefined}
            description="Direct line to Cogon Fire Station"
            accent="#e67e22"
            icon={<Phone size={20} />}
          />
          <ContactCard
            label="Email Address"
            value={contact.email}
            href={contact.email ? `mailto:${contact.email}` : undefined}
            description="For official inquiries & reports"
            accent="#2563eb"
            icon={<Mail size={20} />}
          />
          <ContactCard
            label="Facebook Page"
            value="BFP Station 1 Cogon"
            href={fbHref}
            description="Updates, alerts & announcements"
            accent="#4f46e5"
            icon={<Facebook size={20} />}
          />

          {/* Office Hours */}
          <div style={{ borderRadius: 18, padding: '28px 24px', background: 'white', border: '1.5px solid #ede8e4', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
            <div style={{ width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, background: 'rgba(180,83,9,0.07)', border: '1.5px solid rgba(180,83,9,0.15)' }}>
              <Clock size={20} style={{ color: '#b45309' }} />
            </div>
            <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#c4b5b0', marginBottom: 14 }}>Office Hours</p>

            {contact.officeHours.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {contact.officeHours.map((o, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, paddingBottom: i < contact.officeHours.length - 1 ? 10 : 0, borderBottom: i < contact.officeHours.length - 1 ? '1px solid #f5ede9' : 'none' }}>
                    <span style={{ fontSize: 11.5, color: '#78716c', fontWeight: 500 }}>{o.type}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 700,
                      padding: '2px 8px', borderRadius: 6,
                      background: o.time === '24 / 7' ? 'rgba(22,163,74,0.08)' : o.time === 'Closed' ? 'rgba(192,57,43,0.07)' : 'rgba(0,0,0,0.04)',
                      color: o.time === '24 / 7' ? '#16a34a' : o.time === 'Closed' ? '#c0392b' : '#1c1917',
                    }}>{o.time}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: 11.5, color: '#c4b5b0', fontStyle: 'italic' }}>Hours not set</p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginTop: 16, paddingTop: 14, borderTop: '1px solid #f5ede9' }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', flexShrink: 0, animation: 'pulseDot 2s ease-in-out infinite' }} />
              <span style={{ fontSize: 10.5, fontWeight: 600, color: '#16a34a' }}>Emergency line always active</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══ LOCATION + MAP ══ */}
      <section className="ct-section-pad" style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 2rem 0' }}>
        <div style={{ borderRadius: 20, overflow: 'hidden', background: 'white', border: '1.5px solid #ede8e4', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>

          {/* Map area */}
          <div className="ct-map-area" style={{ position: 'relative', height: 320, background: '#1a1a1a', overflow: 'hidden' }}>
            <img
              src="https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=124.6466,8.4794,124.6482,8.4808&bboxSR=4326&imageSR=4326&size=1200,400&format=png&f=image"
              alt="BFP Cogon Fire Station Satellite Map"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.12)' }} />
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 60, background: 'linear-gradient(to bottom, rgba(0,0,0,0.3), transparent)' }} />

            <div style={{
              position: 'absolute', top: 16, left: 16,
              display: 'flex', alignItems: 'center', gap: 8,
              background: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(10px)',
              borderRadius: 10, padding: '7px 14px', border: '1px solid rgba(255,255,255,0.1)',
            }}>
              <MapPin size={12} style={{ color: '#e67e22' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: 'white', letterSpacing: '0.06em' }}>Cogon Fire Station, CDO</span>
            </div>

            {/* Location Pin */}
            <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -100%)', pointerEvents: 'none' }}>
              <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50% 50% 50% 0',
                  transform: 'rotate(-45deg)',
                  background: '#c0392b',
                  boxShadow: '0 8px 22px rgba(0,0,0,0.35), 0 0 0 4px rgba(192,57,43,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <div style={{ width: 10, height: 10, background: 'white', borderRadius: '50%', transform: 'rotate(45deg)' }} />
                </div>
                <div style={{ marginTop: 6, width: 14, height: 5, borderRadius: '50%', background: 'rgba(0,0,0,0.35)', filter: 'blur(3px)' }} />
              </div>
            </div>

            <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 64, background: 'linear-gradient(to top, rgba(0,0,0,0.35), transparent)' }} />
          </div>

          {/* Address row */}
          <div className="ct-address-row" style={{ padding: '20px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap', borderTop: '1.5px solid #f0ebe7' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'rgba(192,57,43,0.07)', border: '1.5px solid rgba(192,57,43,0.14)' }}>
                <MapPin size={18} style={{ color: '#c0392b' }} />
              </div>
              <div>
                <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.16em', color: '#c4b5b0', marginBottom: 3 }}>Station Address</p>
                <p style={{ fontWeight: 600, fontSize: 13.5, color: '#1c1917', lineHeight: 1.4 }}>
                  {contact.location || "Cogon Fire Station, Cagayan de Oro City"}
                </p>
              </div>
            </div>
            <a href={mapsUrl} target="_blank" rel="noreferrer"
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                color: 'white', fontWeight: 700, fontSize: 12,
                textTransform: 'uppercase', letterSpacing: '0.05em',
                padding: '11px 22px', borderRadius: 12, flexShrink: 0,
                background: 'linear-gradient(135deg, #c0392b, #e67e22)',
                boxShadow: '0 4px 14px rgba(192,57,43,0.28)',
                transition: 'all 0.2s',
              }}>
              <ExternalLink size={14} /> Open in Google Maps
            </a>
          </div>
        </div>
      </section>

      {/* ══ BARANGAYS ══ */}
      {contact.barangays.length > 0 && (
        <section className="ct-section-pad" style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 2rem 0' }}>
          <div className="ct-barangay-section" style={{ borderRadius: 20, padding: '36px 32px', background: 'white', border: '1.5px solid #ede8e4', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>

            <div className="ct-barangay-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16, marginBottom: 24 }}>
              <div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ width: 20, height: 2, background: '#c0392b', borderRadius: 2 }} />
                  <span style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#c0392b' }}>Coverage Area</span>
                </div>
                <h2 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(1.5rem, 4vw, 2rem)', letterSpacing: '0.05em', color: '#1c1917', lineHeight: 1 }}>
                  Barangays Under Jurisdiction
                </h2>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ padding: '10px 18px', borderRadius: 12, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(192,57,43,0.07)', border: '1.5px solid rgba(192,57,43,0.16)' }}>
                  <Shield size={15} style={{ color: '#c0392b' }} />
                  <span style={{ fontSize: 13, fontWeight: 800, color: '#c0392b' }}>{contact.barangays.length} Barangays</span>
                </div>
              </div>
            </div>

            <div style={{ height: 1, background: '#f0ebe7', marginBottom: 20 }} />

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {contact.barangays.map((b, i) => <BarangayChip key={i} name={b} />)}
            </div>
          </div>
        </section>
      )}

      {/* ══ SAFETY NOTICE + CTA ══ */}
      <section className="ct-section-pad" style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 2rem 80px' }}>
        <div className="ct-bottom-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

          {/* Safety notice */}
          <div style={{ display: 'flex', gap: 16, padding: '24px', borderRadius: 18, background: 'rgba(217,119,6,0.05)', border: '1.5px solid rgba(217,119,6,0.18)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'rgba(217,119,6,0.1)', border: '1.5px solid rgba(217,119,6,0.2)' }}>
              <AlertTriangle size={20} style={{ color: '#d97706' }} />
            </div>
            <div>
              <p style={{ fontWeight: 800, fontSize: 13, color: '#92400e', marginBottom: 6 }}>Safety Reminder</p>
              <p style={{ fontSize: 12.5, lineHeight: 1.7, color: '#78716c' }}>
                <strong style={{ color: '#44403c' }}>Never risk your life to save property.</strong>{" "}
                In a fire emergency, evacuate immediately and call 911. Do not re-enter a burning building. Leave firefighting to trained BFP personnel.
              </p>
            </div>
          </div>

          {/* Quick CTA */}
          <div className="ct-cta-dark" style={{
            borderRadius: 18, overflow: 'hidden',
            background: 'linear-gradient(135deg, #1c1917 0%, #292524 100%)',
            border: '1px solid #3d3533',
            padding: '24px 28px',
            display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
            position: 'relative',
          }}>
            <div style={{ position: 'absolute', right: -30, bottom: -30, width: 140, height: 140, borderRadius: '50%', border: '24px solid rgba(192,57,43,0.1)', pointerEvents: 'none' }} />
            <div>
              <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#e67e22', marginBottom: 6 }}>Bureau of Fire Protection</p>
              <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(1.3rem, 3vw, 1.6rem)', letterSpacing: '0.04em', color: 'white', lineHeight: 1, marginBottom: 6 }}>
                Station 1 · Cogon · CDO
              </h3>
              <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', fontWeight: 500 }}>Protecting lives & properties since 1990 · Region X · DILG</p>
            </div>
            <div className="ct-cta-dark-btns" style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 18 }}>
              <a href={`tel:${contact.nationalEmergency || "911"}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, background: 'linear-gradient(135deg, #c0392b, #e64a11)', color: 'white', fontWeight: 700, fontSize: 12, letterSpacing: '0.04em' }}>
                <Phone size={13} /> Call 911
              </a>
              {fbHref && (
                <a href={fbHref} target="_blank" rel="noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '10px 18px', borderRadius: 10, background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.16)', color: 'rgba(255,255,255,0.75)', fontWeight: 600, fontSize: 12 }}>
                  <Facebook size={13} /> Facebook
                </a>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ContactPage;