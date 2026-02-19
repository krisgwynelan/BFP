import { useState, useEffect } from "react";
import {
  Phone, Mail, MapPin, Globe, Clock, AlertTriangle,
  Facebook, ExternalLink, Shield
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

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-widest"
      style={{ background: "rgba(255,255,255,0.18)", border: "1px solid rgba(255,255,255,0.3)", color: "white" }}>
      <span className="w-2 h-2 rounded-full bg-green-300" style={{ animation: "pulseDot 2s ease-in-out infinite" }} />
      Emergency Services Active
    </span>
  );
}

function StatBlock({ value, label, accent }) {
  return (
    <div className="text-center px-5 py-4 rounded-xl"
      style={{ background: "rgba(255,255,255,0.13)", border: "1px solid rgba(255,255,255,0.22)", minWidth: "100px" }}>
      <p className="font-black text-2xl leading-none"
        style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.06em", color: accent || "white" }}>
        {value}
      </p>
      <p className="text-[10px] font-semibold uppercase tracking-widest mt-1" style={{ color: "rgba(255,255,255,0.55)" }}>
        {label}
      </p>
    </div>
  );
}

function ContactCard({ icon, label, value, href, description, accent = "#c0392b" }) {
  const [hov, setHov] = useState(false);

  const inner = (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="relative overflow-hidden rounded-2xl h-full p-6 cursor-default"
      style={{
        background: "white",
        border: `1.5px solid ${hov ? accent + "50" : "#f0e8e5"}`,
        boxShadow: hov ? `0 12px 32px ${accent}20` : "0 2px 8px rgba(0,0,0,0.04)",
        transform: hov ? "translateY(-4px)" : "none",
        transition: "all 0.22s ease",
      }}>
      <div className="absolute top-0 left-0 right-0 h-[3px]"
        style={{ background: `linear-gradient(90deg, ${accent}, ${accent}80)`, opacity: hov ? 1 : 0, transition: "opacity 0.2s" }} />
      <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
        style={{ background: hov ? `${accent}18` : "rgba(192,57,43,0.06)", border: `1.5px solid ${hov ? accent + "30" : "#f0e8e5"}`, color: accent, transition: "all 0.2s" }}>
        {icon}
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest mb-1.5" style={{ color: "#c4b5b0" }}>{label}</p>
      <p className="font-bold text-base break-words leading-snug mb-1" style={{ color: "#1c1917" }}>{value || "—"}</p>
      {description && <p className="text-xs mt-1" style={{ color: "#a8a29e" }}>{description}</p>}
    </div>
  );

  if (!href) return inner;
  return (
    <a href={href} target={href.startsWith("mailto") || href.startsWith("tel") ? "_self" : "_blank"}
      rel="noreferrer" className="block h-full" style={{ textDecoration: "none" }}>
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
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-default"
      style={{
        background:  hov ? "rgba(192,57,43,0.09)" : "white",
        border:      `1.5px solid ${hov ? "rgba(192,57,43,0.25)" : "#f0e8e5"}`,
        color:       hov ? "#c0392b" : "#57534e",
        transform:   hov ? "translateY(-2px)" : "none",
        boxShadow:   hov ? "0 4px 12px rgba(192,57,43,0.1)" : "none",
        transition:  "all 0.18s ease",
      }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: hov ? "#c0392b" : "#d4b8b3", transition: "background 0.18s" }} />
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

  // Poll every 5s to pick up admin changes
  useEffect(() => {
    const id = setInterval(() => {
      loadContact();
    }, 5000);
    return () => clearInterval(id);
  }, []);

  if (!contact) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#fdf9f8" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-full border-2 border-t-transparent"
            style={{ borderColor: "#c0392b", animation: "spin 1s linear infinite" }} />
          <p className="text-sm font-semibold" style={{ color: "#a8a29e" }}>Loading contact information…</p>
        </div>
      </div>
    );
  }

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(contact.location || "BFP Cogon Fire Station Cagayan de Oro")}`;
  const fbHref  = contact.facebookPage
    ? (contact.facebookPage.startsWith("http") ? contact.facebookPage : `https://${contact.facebookPage}`)
    : undefined;

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: "#fdf9f8", minHeight: "100vh" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes pulseDot  { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.4;transform:scale(0.8);} }
        @keyframes ticker    { 0%{transform:translateX(0)} 100%{transform:translateX(-50%)} }
        @keyframes spin      { to{transform:rotate(360deg)} }
        @keyframes fadeUp    { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
        .ticker-outer { overflow: hidden; }
        .ticker-inner { animation: ticker 30s linear infinite; white-space: nowrap; display: flex; gap: 80px; }
        .ticker-inner:hover { animation-play-state: paused; }
        a { text-decoration: none; color: inherit; }
      `}</style>

      {/* ── HERO ── */}
      <section
        className="relative py-16 sm:py-10 overflow-hidden"
        style={{
          background: "linear-gradient(135deg, #aa2112 0%, #811515 60%, #ea1e0f 100%)",
          opacity: mounted ? 1 : 0,
          transition: "opacity 0.7s ease",
        }}>
        <div className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg,rgba(255,255,255,0.15) 1px,transparent 1px)",
            backgroundSize: "40px 40px",
          }} />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="mb-5"><LiveBadge /></div>

          <h1 className="font-black text-white leading-none mb-4"
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: "clamp(6rem, 8vw, 8rem)", letterSpacing: "0.05em" }}>
            EMERGENCY<br />
            <span style={{ opacity: 0.88 }}>CONTACTS</span>
          </h1>

          <p className="mb-10 text-sm leading-relaxed" style={{ color: "rgba(255,255,255,0.7)", maxWidth: "440px" }}>
            Bureau of Fire Protection — Cogon Fire Station.<br />
            Prepared. Responsive. Committed to your safety.
          </p>

          <div className="flex flex-wrap gap-3">
            <StatBlock value={contact.nationalEmergency || "911"} label="Emergency"    accent="#fde68a" />
            <StatBlock value="24/7"                               label="Response"     accent="#6ee7b7" />
            <StatBlock value={contact.barangays.length}           label="Barangays"    accent="#93c5fd" />
            <StatBlock value="<5min"                              label="Avg. Response" accent="#fda4af" />
          </div>
        </div>
      </section>

      {/* ── 911 LIFTED CARD ── */}
      <div className="px-4 sm:px-6 -mt-8 relative z-20 max-w-6xl mx-auto">
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "white", border: "1.5px solid #f0e8e5", boxShadow: "0 12px 40px rgba(192,57,43,0.12)" }}>
          <div className="h-[3px]" style={{ background: "linear-gradient(90deg, #c0392b, #e67e22, #f39c12)" }} />
          <div className="flex flex-col md:flex-row items-center justify-between gap-5 px-6 sm:px-8 py-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: "rgba(192,57,43,0.09)", border: "1.5px solid rgba(192,57,43,0.2)" }}>
                <Phone size={22} style={{ color: "#c0392b" }} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: "#c0392b" }}>
                  National Emergency Hotline
                </p>
                <p className="font-black text-5xl leading-none mt-1"
                  style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.06em", color: "#1c1917" }}>
                  {contact.nationalEmergency || "911"}
                </p>
                <div className="flex items-center gap-2 mt-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-500" style={{ animation: "pulseDot 2s ease-in-out infinite" }} />
                  <span className="text-green-600 text-xs font-bold">Live & Monitored 24/7</span>
                </div>
              </div>
            </div>
            <a href={`tel:${contact.nationalEmergency || "911"}`}
              className="flex items-center gap-2 text-white font-black text-sm uppercase tracking-widest px-7 py-3.5 rounded-xl transition-all hover:scale-105"
              style={{ background: "linear-gradient(135deg, #c0392b, #ed3a0d)", boxShadow: "0 4px 16px rgba(209, 145, 16, 0.3)" }}>
              <Phone size={15} />
              Call {contact.nationalEmergency || "911"} Now
            </a>
          </div>
        </div>
      </div>

      {/* ── CONTACT CARDS ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

          {/* Office Hours card */}
          <div className="rounded-2xl p-6 h-full"
            style={{ background: "white", border: "1.5px solid #f0e8e5", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-5"
              style={{ background: "rgba(180,83,9,0.07)", border: "1.5px solid rgba(180,83,9,0.15)" }}>
              <Clock size={20} style={{ color: "#b45309" }} />
            </div>
            <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "#c4b5b0" }}>Office Hours</p>

            {contact.officeHours.length > 0 ? (
              <div className="space-y-2.5">
                {contact.officeHours.map((o, i) => (
                  <div key={i} className="flex justify-between items-center gap-2">
                    <span className="text-xs" style={{ color: "#78716c" }}>{o.type}</span>
                    <span className="text-xs font-bold"
                      style={{ color: o.time === "24 / 7" ? "#16a34a" : o.time === "Closed" ? "#c0392b" : "#1c1917" }}>
                      {o.time}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs" style={{ color: "#c4b5b0", fontStyle: "italic" }}>Hours not set</p>
            )}

            <div className="flex items-center gap-2 mt-4 pt-3" style={{ borderTop: "1px solid #f5ede9" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-green-500" style={{ animation: "pulseDot 2s ease-in-out infinite" }} />
              <span className="text-green-600 text-[11px] font-semibold">Emergency line always active</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── LOCATION ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-5">
        <div className="rounded-2xl overflow-hidden"
          style={{ background: "white", border: "1.5px solid #f0e8e5", boxShadow: "0 2px 8px rgba(0,0,0,0.04)" }}>
          <div className="relative h-80 overflow-hidden bg-black">
            <img
              src="https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/export?bbox=124.6466,8.4794,124.6482,8.4808&bboxSR=4326&imageSR=4326&size=800,400&format=png&f=image"
              alt="BFP Cogon Fire Station Satellite Map"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/10" />
            <div className="absolute left-1/2 top-1/2" style={{ transform: "translate(-50%, -100%)" }}>
              <div className="flex flex-col items-center">
                <div className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg"
                  style={{ background: "linear-gradient(135deg,#c0392b,#e67e22)", boxShadow: "0 4px 12px rgba(192,57,43,0.45)" }}>
                  <MapPin size={18} className="text-white" />
                </div>
                <div className="w-0.5 h-3 bg-[#c0392b]" />
                <div className="w-4 h-2 rounded-full" style={{ background: "rgba(0,0,0,0.35)", filter: "blur(4px)" }} />
              </div>
            </div>
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap"
              style={{ background: "white", border: "1.5px solid #f0e8e5", boxShadow: "0 2px 8px rgba(0,0,0,0.08)" }}>
              <MapPin size={12} style={{ color: "#c0392b" }} />
              <span className="text-xs font-semibold" style={{ color: "#1c1917" }}>BFP Cogon Fire Station</span>
            </div>
          </div>

          <div className="p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
            style={{ borderTop: "1.5px solid #f5ede9" }}>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color: "#c4b5b0" }}>Station Address</p>
              <p className="font-semibold text-sm" style={{ color: "#1c1917" }}>
                {contact.location || "Cogon Fire Station, Cagayan de Oro City"}
              </p>
            </div>
            <a href={mapsUrl} target="_blank" rel="noreferrer"
              className="flex items-center gap-2 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-all hover:scale-105 shrink-0"
              style={{ background: "linear-gradient(135deg,#c0392b,#e67e22)", boxShadow: "0 3px 10px rgba(237, 29, 6, 0.25)" }}>
              <ExternalLink size={13} /> Open in Google Maps
            </a>
          </div>
        </div>
      </section>

      {/* ── BARANGAYS ── */}
      {contact.barangays.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-5">
          <div className="rounded-2xl p-6 sm:p-8"
            style={{ background:"white", border:"1.5px solid #f0e8e5", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest mb-1" style={{ color:"#c0392b" }}>Coverage Area</p>
                <h2 className="font-black leading-none"
                  style={{ fontFamily:"'Bebas Neue', sans-serif", fontSize:"1.8rem", letterSpacing:"0.05em", color:"#1c1917" }}>
                  Barangays Under Jurisdiction
                </h2>
              </div>
              <span className="inline-flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl"
                style={{ background:"rgba(192,57,43,0.08)", border:"1.5px solid rgba(192,57,43,0.18)", color:"#c0392b" }}>
                <Shield size={14} />
                {contact.barangays.length} Barangays
              </span>
            </div>
            <div className="flex flex-wrap gap-2 text-[10px]">
              {contact.barangays.map((b, i) => <BarangayChip key={i} name={b} />)}
            </div>
          </div>
        </section>
      )}

      {/* ── SAFETY NOTICE ── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 mt-5 pb-16">
        <div className="flex items-start gap-4 p-5 rounded-2xl"
          style={{ background:"rgba(217,119,6,0.05)", border:"1.5px solid rgba(217,119,6,0.2)" }}>
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
            style={{ background:"rgba(217,119,6,0.1)", border:"1.5px solid rgba(217,119,6,0.2)" }}>
            <AlertTriangle size={18} style={{ color:"#d97706" }} />
          </div>
          <div>
            <p className="font-bold text-sm mb-1" style={{ color:"#92400e" }}>Safety Reminder</p>
            <p className="text-sm leading-relaxed" style={{ color:"#78716c" }}>
              <strong style={{ color:"#44403c" }}>Never risk your life to save property.</strong>{" "}
              In a fire emergency, evacuate all persons immediately and call 911. Do not re-enter a burning building. Leave firefighting to trained BFP personnel.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}

export default ContactPage;