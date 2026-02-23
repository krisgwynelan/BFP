import { useEffect, useState } from 'react';
import { RANK_ABBREVIATIONS } from '../../utils/types';
import { getOfficers } from '../../utils/storage';
import {
  Award, Users, Phone, Search, Filter, ChevronDown,
  ShieldCheck, HeartPulse, FileText, ClipboardCheck, Flame, UserX,
} from 'lucide-react';

// ─── Category config ──────────────────────────────────────────────────────────
const CATEGORY_OPTIONS = ['STATION COMMANDER', 'ADMIN', 'EMS', 'INSPECTOR', 'OPERATION'];

const CAT = {
  'STATION COMMANDER': {
    Icon: ShieldCheck,
    label: 'Station Commander', desc: 'Commanding Officer', short: 'CMD',
    color: '#6b1d0f',
    bg: '#fdf3f0', border: '#f5c6b5',
    pillBg: '#fbe2da', pillColor: '#9a2e18',
    bandBg: '#7f2010',
    strip: 'linear-gradient(135deg,#7f2010,#c0392b)',
    glow: 'rgba(127,32,16,0.18)',
  },
  'EMS': {
    Icon: HeartPulse,
    label: 'Emergency Medical', desc: 'Medical Response Unit', short: 'EMS',
    color: '#0f4c2a',
    bg: '#f0faf4', border: '#a7d9bc',
    pillBg: '#d6f0e1', pillColor: '#155d35',
    bandBg: '#155d35',
    strip: 'linear-gradient(135deg,#0f4c2a,#16a34a)',
    glow: 'rgba(15,76,42,0.18)',
  },
  'ADMIN': {
    Icon: FileText,
    label: 'Administration', desc: 'Administrative Support', short: 'ADM',
    color: '#1e3a8a',
    bg: '#eff4ff', border: '#b0c5f5',
    pillBg: '#dbeafe', pillColor: '#1e40af',
    bandBg: '#1e3a8a',
    strip: 'linear-gradient(135deg,#1e3a8a,#3b82f6)',
    glow: 'rgba(30,58,138,0.18)',
  },
  'INSPECTOR': {
    Icon: ClipboardCheck,
    label: 'Fire Inspector', desc: 'Safety & Compliance', short: 'INSP',
    color: '#7c4a0a',
    bg: '#fefbf0', border: '#f0d18a',
    pillBg: '#fef3c7', pillColor: '#92400e',
    bandBg: '#92400e',
    strip: 'linear-gradient(135deg,#7c4a0a,#d97706)',
    glow: 'rgba(124,74,10,0.18)',
  },

};

const FALLBACK = {
  Icon: UserX,
  label: 'Operations', desc: 'Operations', short: '—',
  color: '#57534e',
  bg: '#f5f5f4', border: '#d6d3d1',
  pillBg: '#e7e5e4', pillColor: '#57534e',
  bandBg: '#583c19',
  strip: 'linear-gradient(135deg,#78716c,#a8a29e)',
  glow: 'rgba(0,0,0,0.08)',
};

const getCat = (cat) => CAT[cat] || FALLBACK;

const LOCAL_RA = {
  'Chief Fire Officer': 'CFO', 'Chief Fire Inspector': 'CFI',
  'Senior Fire Inspector': 'SFNSP', 'Fire Inspector': 'FInsp',
  'Senior Fire Officer III': 'SFO3', 'Senior Fire Officer II': 'SFO2',
  'Senior Fire Officer I': 'SFO1', 'Fire Officer III': 'FO3',
  'Fire Officer II': 'FO2', 'Fire Officer I': 'FO1',
};
const abbr = (rank) => RANK_ABBREVIATIONS?.[rank] || LOCAL_RA[rank] || rank;

function Avatar({ src, name, size = 108 }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => { setBroken(false); }, [src]);
  const initials = (name || '?').split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase();
  if (!src || broken)
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: Math.round(size * 0.26),
        background: 'linear-gradient(135deg,rgba(192,57,43,0.1),rgba(230,126,34,0.1))',
        color: '#c0392b', flexShrink: 0,
      }}>{initials}</div>
    );
  return (
    <img src={src} alt={name} onError={() => setBroken(true)}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
  );
}

function truncRole(r) {
  if (!r) return '';
  const i = r.indexOf(',');
  return i !== -1 ? r.substring(0, i) : r;
}

// ─── Officer Card (flat/filtered view) ────────────────────────────────────────
function OfficerCard({ officer }) {
  const c = getCat(officer.category);
  const role = truncRole(officer.roleAssignment);
  const { Icon } = c;
  return (
    <div className="op-card">
      <div style={{ height: 8, background: c.strip, flexShrink: 0 }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '22px 16px 18px', flex: 1 }}>
        <div style={{ position: 'relative', marginBottom: 4 }}>
          <div style={{ width: 120, height: 120, borderRadius: '50%', padding: 3, background: c.strip }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'white', padding: 3 }}>
              <Avatar src={officer.profileImage} name={officer.fullName} size={108} />
            </div>
          </div>
          <div style={{
            position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%)',
            background: c.bandBg, color: 'white', padding: '2px 10px', borderRadius: 5,
            fontSize: 10, fontWeight: 800, whiteSpace: 'nowrap',
            border: '2px solid white', letterSpacing: '0.04em',
            boxShadow: '0 1px 6px rgba(0,0,0,0.16)',
          }}>{abbr(officer.rank)}</div>
        </div>
        <div style={{ width: '100%', textAlign: 'center', height: 62, marginTop: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'flex-start', overflow: 'hidden' }}>
          <p className="op-name" title={officer.fullName}>{officer.fullName}</p>
          <p className="op-rank">{officer.rank}</p>
        </div>
        <div style={{ width: '100%', height: 1, background: '#f0ebe8', margin: '12px 0' }} />
        <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
          <span style={{
            display: 'inline-flex', alignItems: 'center', gap: 5,
            padding: '3px 9px 3px 6px', borderRadius: 6,
            background: c.pillBg, border: `1px solid ${c.border}`,
            fontSize: 10, fontWeight: 700, color: c.pillColor,
            textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            <Icon size={10} strokeWidth={2.4} />{c.label}
          </span>
          {role && <p className="op-role" title={officer.roleAssignment}>{role}</p>}
          {officer.contactNumber && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, maxWidth: '100%' }}>
              <Phone size={11} style={{ color: '#c4b5b0', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: '#78716c', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{officer.contactNumber}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Org Member Card (large card variant) ────────────────────────────────────
function OrgMemberCard({ officer, c }) {
  const role = truncRole(officer.roleAssignment);
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '28px 22px 22px',
        background: 'white',
        border: `1.5px solid ${c.border}`,
        borderRadius: 22,
        boxShadow: hovered ? `0 10px 28px ${c.glow}` : `0 2px 10px ${c.glow}`,
        width: 290, minWidth: 200,
        height: 300,
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
    >
      {/* Avatar with gradient ring + rank pill overlay */}
      <div style={{
        position: 'relative',
        width: 110, height: 110,
        marginBottom: 20, flexShrink: 0,
      }}>
        {/* Gradient ring */}
        <div style={{
          width: 110, height: 110, borderRadius: '50%', padding: 3,
          background: c.strip,
        }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'white', padding: 2 }}>
            <Avatar src={officer.profileImage} name={officer.fullName} size={98} />
          </div>
        </div>

        {/* Rank pill — anchored at bottom center of avatar */}
        <span style={{
          position: 'absolute',
          bottom: -10,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 6,
          background: c.bandBg, color: 'white', letterSpacing: '0.07em',
          textTransform: 'uppercase', boxShadow: '0 1px 4px rgba(0,0,0,0.16)',
          whiteSpace: 'nowrap',
        }}>{abbr(officer.rank)}</span>
      </div>

      {/* Name */}
      <p style={{
        fontSize: 18, fontWeight: 700, color: '#111827', textAlign: 'center',
        margin: '0 0 5px', lineHeight: 1.25,
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
        overflow: 'hidden', width: '100%',
      }}>{officer.fullName}</p>

      {/* Full rank */}
      <p style={{
        fontSize: 17, fontWeight: 500, color: c.pillColor, textAlign: 'center',
        margin: '0 0 6px', whiteSpace: 'nowrap', overflow: 'hidden',
        textOverflow: 'ellipsis', width: '100%',
      }}>{officer.rank}</p>

      {/* Role */}
      {role && (
        <p style={{
          fontSize: 13, fontWeight: 500, color: '#78716c', textAlign: 'center',
          margin: '0 0 8px', whiteSpace: 'nowrap', overflow: 'hidden',
          textOverflow: 'ellipsis', width: '100%',
        }}>{role}</p>
      )}

      {/* Contact */}
      {officer.contactNumber && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginTop: 4 }}>
          <Phone size={12} style={{ color: '#c4b5b0' }} />
          <span style={{ fontSize: 13, color: '#a8a29e' }}>{officer.contactNumber}</span>
        </div>
      )}
    </div>
  );
}

// ─── Org Category Section: centered header + 4-per-row card grid ──────────────
function OrgSection({ cat, officers }) {
  const c = getCat(cat);
  const { Icon } = c;

  // Chunk into rows of 4
  const rows = [];
  for (let i = 0; i < officers.length; i += 4) {
    rows.push(officers.slice(i, i + 4));
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      width: '100%',
      animation: 'opFU 0.24s ease both',
    }}>
      {/* Section Label */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 12,
        padding: '11px 22px 11px 14px', borderRadius: 16,
        background: c.bg, border: `1.5px solid ${c.border}`,
        boxShadow: `0 4px 18px ${c.glow}`,
        marginBottom: 24,
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 11, background: c.strip,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon size={19} color="white" strokeWidth={2.2} />
        </div>
        <div style={{ lineHeight: 1.25 }}>
          <p style={{ fontSize: 14, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: c.color, margin: 0 }}>{c.label}</p>
          <p style={{ fontSize: 11, fontWeight: 500, color: c.pillColor, margin: 0 }}>{c.desc}</p>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 7,
          background: c.pillBg, color: c.pillColor, border: `1.5px solid ${c.border}`, marginLeft: 4,
        }}>{officers.length}</span>
      </div>

      {/* Connector stem */}
      <div style={{ width: 2, height: 20, background: `linear-gradient(to bottom,${c.border},transparent)`, marginBottom: 4 }} />

      {/* 4-per-row grid */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, width: '100%' }}>
        {rows.map((row, ri) => (
          <div key={ri} style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'nowrap' }}>
            {row.map(o => (
              <OrgMemberCard key={o.id} officer={o} c={c} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function OfficersPage() {
  const [officers, setOfficers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selRank, setSelRank] = useState('All Ranks');
  const [selCat, setSelCat] = useState('All');
  const [rankOpen, setRankOpen] = useState(false);

  const RANKS = [
    'Chief Fire Officer', 'Chief Fire Inspector', 'Senior Fire Inspector', 'Fire Inspector',
    'Senior Fire Officer III', 'Senior Fire Officer II', 'Senior Fire Officer I',
    'Fire Officer III', 'Fire Officer II', 'Fire Officer I',
  ];

  useEffect(() => {
    (async () => {
      setLoading(true);
      try { setOfficers(await getOfficers()); }
      catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const sorted = [...officers].sort((a, b) => {
    const ia = RANKS.indexOf(a.rank), ib = RANKS.indexOf(b.rank);
    if (ia === -1) return 1; if (ib === -1) return -1; return ia - ib;
  });

  const filtered = sorted.filter(o => {
    const q = search.toLowerCase();
    const ms = !q || [o.fullName, o.rank, o.roleAssignment, o.category].some(v => v?.toLowerCase().includes(q));
    return ms && (selRank === 'All Ranks' || o.rank === selRank) && (selCat === 'All' || o.category === selCat);
  });

  const uRanks = ['All Ranks', ...RANKS.filter(r => officers.some(o => o.rank === r))];
  const isDefault = selCat === 'All' && !search && selRank === 'All Ranks';

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: '#faf8f7', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        *,*::before,*::after { box-sizing: border-box; }
        @keyframes opFU  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        @keyframes opSpin { to { transform: rotate(360deg); } }
        .op-si:focus { outline:none; border-color:#c0392b!important; box-shadow:0 0 0 3px rgba(192,57,43,0.08)!important; }
        .op-ro { display:block; width:100%; text-align:left; padding:9px 14px; font-size:13px; background:none; border:none; cursor:pointer; font-family:inherit; }
        .op-ro:hover { background:rgba(192,57,43,0.04); }
        .op-ro.act { background:rgba(192,57,43,0.07); color:#c0392b; font-weight:700; }
        .op-fdd { animation:opFU 0.13s ease; }
        .op-tab { display:inline-flex; align-items:center; gap:6px; padding:7px 13px; border-radius:8px; font-size:11px; font-weight:700; font-family:inherit; text-transform:uppercase; letter-spacing:0.06em; cursor:pointer; border:1.5px solid #e5e2df; background:white; color:#78716c; white-space:nowrap; transition:all 0.16s; }
        .op-tab:hover { border-color:#d6c4bc; color:#44403c; transform:translateY(-1px); }
        .op-card { background:white; border:1.5px solid #ede8e5; border-radius:16px; overflow:hidden; display:flex; flex-direction:column; transition:transform 0.2s,box-shadow 0.2s,border-color 0.2s; }
        .op-card:hover { transform:translateY(-5px); box-shadow:0 16px 40px rgba(0,0,0,0.08); border-color:#ddd5d0; }
        .op-name { font-size:14px; font-weight:700; color:#111827; line-height:1.35; margin:0; word-break:break-word; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden; width:100%; text-align:center; }
        .op-rank { font-size:11.5px; font-weight:600; color:#c0392b; margin:3px 0 0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%; text-align:center; }
        .op-role { font-size:12.5px; font-weight:500; color:#57534e; text-align:center; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; width:100%; margin:0; }
      `}</style>

      {/* ── HERO ── */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        padding: '68px 20px 76px',
        background: 'linear-gradient(150deg,#7f1d1d 0%,#991b1b 38%,#c0392b 72%,#d35400 100%)',
      }}>
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.06,
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.5) 1px,transparent 1px)',
          backgroundSize: '48px 48px',
        }} />
        <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 8, padding: '6px 16px', borderRadius: 8,
            background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', marginBottom: 20,
          }}>
            <Users size={13} color="rgba(255,255,255,0.8)" strokeWidth={2} />
            <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.24em', color: 'rgba(255,255,255,0.8)' }}>
              BFP Station 1 · Station Personnel
            </span>
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(3rem,8vw,5.5rem)', letterSpacing: '0.04em', color: 'white', lineHeight: 1, margin: '0 0 14px' }}>Our Officers</h1>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, maxWidth: 460, margin: '0 auto 30px', lineHeight: 1.75 }}>
            Meet the dedicated men and women serving<br />BFP Station 1 — Cogon, Cagayan de Oro City
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 10 }}>
            {[
              { v: loading ? '…' : sorted.length, l: 'Active Officers' },
              { v: '24 / 7', l: 'On Duty' },
              { v: 'Station 1', l: 'Assignment' },
            ].map(({ v, l }) => (
              <div key={l} style={{ padding: '10px 18px', borderRadius: 10, textAlign: 'center', background: 'rgba(255,255,255,0.11)', border: '1px solid rgba(255,255,255,0.18)', backdropFilter: 'blur(6px)', minWidth: 88 }}>
                <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 24, letterSpacing: '0.06em', color: 'white', lineHeight: 1, margin: 0 }}>{v}</p>
                <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.55)', margin: '3px 0 0' }}>{l}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FILTERS ── */}
      <section style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 20px 0' }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 14 }}>
          <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
            <Search size={14} style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', color: '#c0392b', pointerEvents: 'none' }} />
            <input type="text" className="op-si" value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, rank, or assignment…"
              style={{ width: '100%', paddingLeft: 40, paddingRight: 14, paddingTop: 11, paddingBottom: 11, borderRadius: 10, fontSize: 13, fontWeight: 500, background: 'white', border: '1.5px solid #e8e2de', color: '#1c1917', fontFamily: "'DM Sans',sans-serif", transition: 'border-color 0.18s,box-shadow 0.18s' }} />
          </div>
          <div style={{ position: 'relative' }}>
            <button onClick={() => setRankOpen(p => !p)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', minWidth: 168, justifyContent: 'space-between', background: selRank !== 'All Ranks' ? 'rgba(192,57,43,0.06)' : 'white', border: `1.5px solid ${selRank !== 'All Ranks' ? 'rgba(192,57,43,0.25)' : '#e8e2de'}`, color: selRank !== 'All Ranks' ? '#c0392b' : '#78716c', fontFamily: "'DM Sans',sans-serif" }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><Filter size={13} />{selRank !== 'All Ranks' ? (LOCAL_RA[selRank] || selRank) : 'All Ranks'}</span>
              <ChevronDown size={13} style={{ transform: rankOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }} />
            </button>
            {rankOpen && (
              <div className="op-fdd" style={{ position: 'absolute', right: 0, top: '100%', marginTop: 6, borderRadius: 10, overflow: 'hidden', zIndex: 30, background: 'white', border: '1.5px solid #ede8e5', boxShadow: '0 8px 28px rgba(0,0,0,0.09)', minWidth: 220, padding: '4px 0' }}>
                {uRanks.map(rk => (
                  <button key={rk} className={`op-ro ${selRank === rk ? 'act' : ''}`} onClick={() => { setSelRank(rk); setRankOpen(false); }} style={{ color: selRank === rk ? '#c0392b' : '#44403c' }}>{rk}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          <button className="op-tab" onClick={() => setSelCat('All')}
            style={selCat === 'All' ? { background: 'linear-gradient(135deg,#c0392b,#e67e22)', color: 'white', border: '1.5px solid transparent', boxShadow: '0 3px 12px rgba(192,57,43,0.25)', transform: 'translateY(-1px)' } : { color: '#78716c' }}>
            <Users size={11} strokeWidth={2.2} color={selCat === 'All' ? 'white' : '#78716c'} />
            All Officers
            <span style={{ fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 5, background: selCat === 'All' ? 'rgba(255,255,255,0.22)' : 'rgba(192,57,43,0.08)', color: selCat === 'All' ? 'white' : '#c0392b' }}>{sorted.length}</span>
          </button>

        </div>

        {(search || selRank !== 'All Ranks' || selCat !== 'All') && !loading && (
          <p style={{ fontSize: 11.5, fontWeight: 600, color: '#a8a29e', marginTop: 12, marginBottom: 0 }}>
            Showing <span style={{ color: '#c0392b' }}>{filtered.length}</span> of {sorted.length} officers
            {selCat !== 'All' && <> · <span style={{ color: getCat(selCat).color }}>{getCat(selCat).label}</span></>}
          </p>
        )}
      </section>

      {/* ── OFFICERS DISPLAY ── */}
      <section style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 20px 56px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2.5px solid #c0392b', borderTopColor: 'transparent', animation: 'opSpin 0.9s linear infinite', marginBottom: 14 }} />
            <p style={{ fontSize: 13, fontWeight: 600, color: '#a8a29e', margin: 0 }}>Loading officers...</p>
          </div>

        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <div style={{ width: 58, height: 58, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', background: 'rgba(192,57,43,0.05)', border: '1.5px dashed rgba(192,57,43,0.2)' }}>
              <Search size={24} style={{ color: '#d4b8b3' }} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#78716c', margin: '0 0 6px' }}>No officers found</p>
            <p style={{ fontSize: 13, color: '#c4b5b0', margin: 0 }}>Try adjusting your search or filter</p>
          </div>

        ) : isDefault ? (
          /* ══════════════════════════════════════════════
             ORG CHART VIEW — fully centered
             BFP Station 1 title → each category section
             4 officers per row, wraps to new row after 4
          ══════════════════════════════════════════════ */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            {/* Root node */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 0 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 14, padding: '15px 30px',
                borderRadius: 18, background: 'linear-gradient(135deg,#7f1d1d,#c0392b)',
                boxShadow: '0 8px 32px rgba(127,29,29,0.32)',
              }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: 'rgba(255,255,255,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShieldCheck size={22} color="white" strokeWidth={2.2} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.22em', color: 'rgba(255,255,255,0.65)', margin: '0 0 1px' }}>BFP Station 1</p>
                  <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 28, letterSpacing: '0.06em', color: 'white', margin: 0, lineHeight: 1 }}>Organizational Chart</p>
                </div>
              </div>
              <div style={{ width: 2, height: 36, background: 'linear-gradient(to bottom,#c0392b,#ede8e5)', marginBottom: 0 }} />
            </div>

            {/* Category sections separated by dividers */}
            {CATEGORY_OPTIONS.map((cat, ci) => {
              const group = filtered.filter(o => o.category === cat);
              if (!group.length) return null;
              const isLast = ci === CATEGORY_OPTIONS.length - 1 || !CATEGORY_OPTIONS.slice(ci + 1).some(c => filtered.some(o => o.category === c));
              return (
                <div key={cat} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <OrgSection cat={cat} officers={group} />
                  {!isLast && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, width: '100%', maxWidth: 860, margin: '32px 0', opacity: 0.3 }}>
                      <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right,transparent,#c0392b)' }} />
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#c0392b' }} />
                      <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left,transparent,#c0392b)' }} />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Operations */}
            {(() => {
              const unc = filtered.filter(o => !o.category || !CATEGORY_OPTIONS.includes(o.category));
              if (!unc.length) return null;
              return (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 40 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 18px 10px 12px', borderRadius: 14, background: '#f5f4f3', border: '1.5px solid #ddd5d0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', marginBottom: 24 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 10, background: 'linear-gradient(135deg,#78716c,#a8a29e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <UserX size={18} color="white" strokeWidth={2.2} />
                    </div>
                    <div>
                      <p style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#44403c', margin: 0 }}>Unassigned</p>
                      <p style={{ fontSize: 11, color: '#78716c', margin: 0, fontWeight: 500 }}>No category set</p>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 9px', borderRadius: 6, background: '#e7e5e4', color: '#57534e', border: '1.5px solid #d6d3d1', marginLeft: 6 }}>{unc.length}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
                    {Array.from({ length: Math.ceil(unc.length / 4) }, (_, ri) => (
                      <div key={ri} style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                        {unc.slice(ri * 4, ri * 4 + 4).map(o => (
                          <OrgMemberCard key={o.id} officer={o} c={FALLBACK} />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

        ) : (
          /* ── Flat filtered view ── */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 18, alignItems: 'stretch' }}>
            {filtered.map(o => <OfficerCard key={o.id} officer={o} />)}
          </div>
        )}
      </section>

      {/* ── CONTACT BAR ── */}
      <section style={{ background: 'white', borderTop: '1.5px solid #ede8e5', padding: '28px 20px 36px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '18px 22px', borderRadius: 14, background: 'white', border: '1.5px solid #ede8e5', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'rgba(192,57,43,0.07)', border: '1.5px solid rgba(192,57,43,0.14)' }}>
              <Award size={19} style={{ color: '#c0392b' }} />
            </div>
            <div>
              <h3 style={{ fontWeight: 700, fontSize: 14, color: '#1c1917', margin: '0 0 4px' }}>Contact Our Officers</h3>
              <p style={{ fontSize: 13, lineHeight: 1.7, color: '#78716c', margin: 0 }}>
                For official inquiries or emergency services, contact our station at{' '}
                <a href="tel:09267520623" style={{ fontWeight: 700, color: '#c0392b', textDecoration: 'none' }}>0926-752-0623</a>
                {' '}or the national emergency hotline{' '}
                <a href="tel:911" style={{ fontWeight: 700, color: '#c0392b', textDecoration: 'none' }}>911</a>.
              </p>
            </div>
          </div>
        </div>
      </section>

      {rankOpen && <div style={{ position: 'fixed', inset: 0, zIndex: 20 }} onClick={() => setRankOpen(false)} />}
    </div>
  );
}