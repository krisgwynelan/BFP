import { useEffect, useState } from 'react';
import { RANK_ABBREVIATIONS } from '../../utils/types';
import { getOfficers } from '../../utils/storage';
import { Award, Users, Phone } from 'lucide-react';

// ─── Safe image with initials fallback ───────────────────────────────────────
function OfficerAvatar({ src, name, size = 128 }) {
  const [broken, setBroken] = useState(false);
  const initials = (name || '?').split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase();

  useEffect(() => { setBroken(false); }, [src]);

  if (!src || broken) {
    return (
      <div
        className="flex items-center justify-center font-bold border-4 border-red-100 group-hover:border-red-300 transition-colors"
        style={{
          width: size, height: size,
          borderRadius: '50%',
          fontSize: size * 0.22,
          background: 'linear-gradient(135deg, rgba(192,57,43,0.12), rgba(230,126,34,0.12))',
          color: '#c0392b',
        }}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      className="border-4 border-red-100 group-hover:border-red-300 transition-colors"
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
      onError={() => setBroken(true)}
    />
  );
}

export function OfficersPage() {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await getOfficers();
        setOfficers(data);
      } catch (err) {
        console.error('Failed to load officers:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const rankHierarchy = [
    'Chief Fire Officer',
    'Chief Fire Inspector',
    'Senior Fire Inspector',
    'Fire Inspector',
    'Senior Fire Officer III',
    'Senior Fire Officer II',
    'Senior Fire Officer I',
    'Fire Officer III',
    'Fire Officer II',
    'Fire Officer I',
  ];

  const sortedOfficers = [...officers].sort((a, b) => {
    const rankA = rankHierarchy.indexOf(a.rank);
    const rankB = rankHierarchy.indexOf(b.rank);
    return rankA - rankB;
  });

  return (
    <div style={{ fontFamily: "'DM Sans', sans-serif", background: '#fdf9f8', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px);} to{opacity:1;transform:translateY(0);} }
        @keyframes spin { to { transform: rotate(360deg); } }
        .officer-card {
          background: white;
          border: 1.5px solid #f0e8e5;
          border-radius: 20px;
          overflow: hidden;
          transition: all 0.25s ease;
          display: flex; flex-direction: column;
        }
        .officer-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 48px rgba(192,57,43,0.1);
          border-color: #e8c4bc;
        }
      `}</style>

      {/* ── HERO SECTION ── */}
      <section className="relative overflow-hidden py-16 sm:py-20"
        style={{ background: 'linear-gradient(135deg, #aa2112 0%, #811515 60%, #ea1e0f 100%)' }}>
        <div className="absolute inset-0 pointer-events-none opacity-10"
          style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.15) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.15) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
              <Users size={16} className="text-white" />
            </div>
            <p className="text-white/80 text-[11px] font-bold uppercase tracking-[0.22em]">Station Personnel</p>
          </div>
          <h1 className="font-black text-white leading-none mb-3"
            style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(2.8rem, 7vw, 5rem)', letterSpacing: '0.05em' }}>
            Our Officers
          </h1>
          <p className="text-white/75 text-base max-w-lg mx-auto">
            Meet the dedicated team protecting BFP Station 1 — Cogon, Cagayan de Oro City
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
            {[
              { value: loading ? '...' : sortedOfficers.length, label: 'Active Officers' },
              { value: '24/7', label: 'On Duty' },
              { value: 'Station 1', label: 'Assignment' },
            ].map(({ value, label }) => (
              <div key={label} className="px-5 py-3 rounded-xl text-center"
                style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}>
                <p className="font-black text-white text-xl leading-none"
                  style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.06em' }}>{value}</p>
                <p className="text-white/60 text-[10px] font-semibold uppercase tracking-widest mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── OFFICERS GRID ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-10 h-10 rounded-full border-2 border-t-transparent mb-4"
              style={{ borderColor: '#c0392b', animation: 'spin 1s linear infinite' }} />
            <p className="text-sm font-semibold" style={{ color: '#a8a29e' }}>Loading officers...</p>
          </div>
        ) : sortedOfficers.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg">No officers information available</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {sortedOfficers.map((officer) => (
              <div
                key={officer.id}
                className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden group"
              >
                <div className="p-6 text-center">
                  <div className="relative mx-auto mb-4" style={{ width: 128, height: 128 }}>
                    {/* OfficerAvatar handles broken/missing images with initials fallback */}
                    <OfficerAvatar src={officer.profileImage} name={officer.fullName} size={128} />

                    {/* Rank badge */}
                    <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-red-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-md whitespace-nowrap">
                      {RANK_ABBREVIATIONS[officer.rank] || officer.rank}
                    </div>
                  </div>

                  <h3 className="font-bold text-xl text-gray-900 mb-1 mt-3">
                    {officer.fullName}
                  </h3>

                  <p className="text-sm text-red-600 font-semibold mb-3">
                    {officer.rank}
                  </p>

                  <div className="border-t border-gray-200 pt-4 mt-4">
                    <p className="text-gray-700 font-medium mb-3">
                      {officer.roleAssignment}
                    </p>

                    {officer.contactNumber && (
                      <div className="text-sm text-gray-600 flex items-center justify-center gap-2">
                        <Phone size={14} className="text-gray-400" />
                        <span>{officer.contactNumber}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── INFO SECTION ── */}
      <section className="py-10 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4 p-6 rounded-2xl"
            style={{ background: 'white', border: '1.5px solid #f0e8e5', boxShadow: '0 2px 12px rgba(0,0,0,0.04)' }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'rgba(192,57,43,0.08)', border: '1.5px solid rgba(192,57,43,0.18)' }}>
              <Award size={18} style={{ color: '#c0392b' }} />
            </div>
            <div>
              <h3 className="font-bold text-base mb-1" style={{ color: '#1c1917' }}>Contact Our Officers</h3>
              <p className="text-sm leading-relaxed" style={{ color: '#78716c' }}>
                For official inquiries or emergency services, please contact our station directly at{' '}
                <a href="tel:09267520623" className="font-bold hover:underline" style={{ color: '#c0392b' }}>0926-752-0623</a>{' '}
                or call the national emergency hotline at{' '}
                <a href="tel:911" className="font-bold hover:underline" style={{ color: '#c0392b' }}>911</a>.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}