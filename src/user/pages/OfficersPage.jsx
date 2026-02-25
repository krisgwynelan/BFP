import { useEffect, useState } from 'react';
import { RANK_ABBREVIATIONS } from '../../utils/types';
import { getOfficers } from '../../utils/storage';
import {
  Award, Users, Phone, Search, Filter, ChevronDown,
  ShieldCheck, HeartPulse, FileText, ClipboardCheck, UserX, Crown,
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
    glow: 'rgba(127,32,16,0.13)',
    leaderGlow: 'rgba(192,57,43,0.22)',
    leaderBorder: '#e0856a',
  },
  'EMS': {
    Icon: HeartPulse,
    label: 'Emergency Medical', desc: 'Medical Response Unit', short: 'EMS',
    color: '#0f4c2a',
    bg: '#f0faf4', border: '#a7d9bc',
    pillBg: '#d6f0e1', pillColor: '#155d35',
    bandBg: '#155d35',
    strip: 'linear-gradient(135deg,#0f4c2a,#16a34a)',
    glow: 'rgba(15,76,42,0.13)',
    leaderGlow: 'rgba(22,163,74,0.22)',
    leaderBorder: '#52b876',
  },
  'ADMIN': {
    Icon: FileText,
    label: 'Administration', desc: 'Administrative Support', short: 'ADM',
    color: '#1e3a8a',
    bg: '#eff4ff', border: '#b0c5f5',
    pillBg: '#dbeafe', pillColor: '#1e40af',
    bandBg: '#1e3a8a',
    strip: 'linear-gradient(135deg,#1e3a8a,#3b82f6)',
    glow: 'rgba(30,58,138,0.13)',
    leaderGlow: 'rgba(59,130,246,0.22)',
    leaderBorder: '#5e95f0',
  },
  'INSPECTOR': {
    Icon: ClipboardCheck,
    label: 'Fire Inspector', desc: 'Safety & Compliance', short: 'INSP',
    color: '#7c4a0a',
    bg: '#fefbf0', border: '#f0d18a',
    pillBg: '#fef3c7', pillColor: '#92400e',
    bandBg: '#92400e',
    strip: 'linear-gradient(135deg,#7c4a0a,#d97706)',
    glow: 'rgba(124,74,10,0.13)',
    leaderGlow: 'rgba(217,119,6,0.22)',
    leaderBorder: '#dda030',
  },
};

const FALLBACK = {
  Icon: UserX,
  label: 'Operations', desc: 'Operations', short: '—',
  color: '#57534e',
  bg: '#f5f5f4', border: '#d6d3d1',
  pillBg: '#e7e5e4', pillColor: '#57534e',
  bandBg: '#57534e',
  strip: 'linear-gradient(135deg,#78716c,#a8a29e)',
  glow: 'rgba(0,0,0,0.07)',
  leaderGlow: 'rgba(0,0,0,0.13)',
  leaderBorder: '#a8a29e',
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

// ─── Card size constants — edit these to resize all cards at once ─────────────
const CARD_W         = 260;   // card width in px
const CARD_MINW      = 180;   // card minimum width
const CARD_RADIUS    = 20;    // card border radius
const RING_OUTER     = 108;   // total avatar ring outer diameter
const RING_PX_LEADER = 4;     // ring thickness for leader
const RING_PX_MEMBER = 3;     // ring thickness for member
const GAP_PX         = 3;     // white gap between ring and photo
const STRIP_H_LEADER = 6;     // top color strip height for leader
const STRIP_H_MEMBER = 4;     // top color strip height for member
const ROWS_PER_PAGE  = 5;     // members per row in org chart

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ src, name, size }) {
  const [broken, setBroken] = useState(false);
  useEffect(() => { setBroken(false); }, [src]);
  const initials = (name || '?').split(' ').filter(Boolean).map(n => n[0]).slice(0, 2).join('').toUpperCase();
  if (!src || broken)
    return (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontWeight: 800, fontSize: Math.round(size * 0.32),
        background: 'linear-gradient(135deg,rgba(192,57,43,0.09),rgba(230,126,34,0.09))',
        color: '#c0392b', flexShrink: 0,
      }}>{initials}</div>
    );
  return (
    <img
      src={src} alt={name} onError={() => setBroken(true)}
      style={{
        width: size, height: size, borderRadius: '50%',
        objectFit: 'cover', objectPosition: 'center top',
        display: 'block', flexShrink: 0,
      }}
    />
  );
}

// ─── AvatarRing ───────────────────────────────────────────────────────────────
// imgSize = ringSize - 2*ring - 2*gap → photo always fills perfectly
function AvatarRing({ src, name, ringSize, ring, gap, strip, glow }) {
  const imgSize = ringSize - 2 * ring - 2 * gap;
  return (
    <div style={{
      width: ringSize, height: ringSize, borderRadius: '50%',
      background: strip,
      boxShadow: glow ? `0 4px 18px ${glow}` : 'none',
      padding: ring, flexShrink: 0, boxSizing: 'border-box',
    }}>
      <div style={{
        width: '100%', height: '100%', borderRadius: '50%',
        background: 'white', padding: gap, boxSizing: 'border-box',
      }}>
        <Avatar src={src} name={name} size={imgSize} />
      </div>
    </div>
  );
}

function truncRole(r) {
  if (!r) return '';
  const i = r.indexOf(',');
  return i !== -1 ? r.substring(0, i) : r;
}

// ─── Unified OrgMemberCard — same container for leader + members ──────────────
function OrgMemberCard({ officer, c, isLeader = false }) {
  const role        = truncRole(officer.roleAssignment);
  const [hovered, setHovered] = useState(false);
  const { Icon }    = c;
  const ringPx      = isLeader ? RING_PX_LEADER : RING_PX_MEMBER;
  const stripH      = isLeader ? STRIP_H_LEADER  : STRIP_H_MEMBER;
  const borderColor = isLeader ? c.leaderBorder  : c.border;
  const borderWidth = isLeader ? 2 : 1.5;
  const shadowBase  = isLeader ? c.leaderGlow     : c.glow;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: CARD_W,
        minWidth: CARD_MINW,
        borderRadius: CARD_RADIUS,
        overflow: 'visible',
        background: 'white',
        border: `${borderWidth}px solid ${borderColor}`,
        boxShadow: hovered
          ? `0 16px 40px ${shadowBase}, 0 0 0 3px ${borderColor}40`
          : isLeader
            ? `0 6px 22px ${shadowBase}`
            : `0 2px 10px ${shadowBase}`,
        transform: hovered ? 'translateY(-6px)' : 'translateY(0)',
        transition: 'transform 0.22s ease, box-shadow 0.22s ease',
      }}
    >

      {/* ── Card body ── */}
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: `${isLeader ? 20 : 16}px 18px 18px`,
        flex: 1, width: '100%',
      }}>

        {/* Avatar ring + rank pill */}
        <div style={{ position: 'relative', marginBottom: 18, flexShrink: 0 }}>
          <AvatarRing
            src={officer.profileImage}
            name={officer.fullName}
            ringSize={RING_OUTER}
            ring={ringPx}
            gap={GAP_PX}
            strip={c.strip}
            glow={isLeader ? c.leaderGlow : null}
          />
          <div style={{
            position: 'absolute',
            bottom: -11, left: '50%', transform: 'translateX(-50%)',
            background: c.bandBg, color: 'white',
            fontSize: 10, fontWeight: 800,
            padding: '3px 9px', borderRadius: 6,
            letterSpacing: '0.07em', textTransform: 'uppercase',
            whiteSpace: 'nowrap',
            border: '2px solid white',
            boxShadow: '0 1px 4px rgba(0,0,0,0.18)',
            lineHeight: 1.4,
          }}>{abbr(officer.rank)}</div>
        </div>

        {/* Name */}
        <p style={{
          fontSize: isLeader ? 17 : 16,
          fontWeight: isLeader ? 800 : 700,
          color: '#111827',
          textAlign: 'center',
          margin: '0 0 3px',
          lineHeight: 1.3,
          width: '100%',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          wordBreak: 'break-word',
        }}>{officer.fullName}</p>

        {/* Full rank */}
        <p style={{
          fontSize: 11.5, fontWeight: 500,
          color: c.pillColor,
          textAlign: 'center',
          margin: '0 0 10px',
          width: '100%',
          overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
        }}>{officer.rank}</p>

        {/* Divider */}
        <div style={{
          width: '100%', height: 1,
          background: `linear-gradient(to right,transparent,${c.border},transparent)`,
          margin: '0 0 10px', flexShrink: 0,
        }} />


        {/* Role */}
        {role && (
          <p style={{
            fontSize: 11.5, fontWeight: 500, color: '#78716c',
            textAlign: 'center', margin: '0',
            width: '100%', lineHeight: 1.45,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden', wordBreak: 'break-word',
          }}>{role}</p>
        )}

        {/* Contact */}
        {officer.contactNumber && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 4,
            marginTop: 'auto', paddingTop: 9, maxWidth: '100%',
          }}>
            <Phone size={10} style={{ color: '#c4b5b0', flexShrink: 0 }} />
            <span style={{
              fontSize: 11.5, color: '#b0a8a4',
              overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
            }}>{officer.contactNumber}</span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Flat / filtered view card ────────────────────────────────────────────────
function OfficerCard({ officer }) {
  const c    = getCat(officer.category);
  const role = truncRole(officer.roleAssignment);
  const [hovered, setHovered] = useState(false);
  const { Icon } = c;
  const ringPx = officer.isLeader ? RING_PX_LEADER : RING_PX_MEMBER;
  const stripH = officer.isLeader ? STRIP_H_LEADER  : STRIP_H_MEMBER;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        background: 'white',
        border: `${officer.isLeader ? 2 : 1.5}px solid ${officer.isLeader ? c.leaderBorder : c.border}`,
        borderRadius: CARD_RADIUS,
        overflow: 'visible',
        boxShadow: hovered
          ? `0 14px 36px ${c.leaderGlow}, 0 0 0 3px ${(officer.isLeader ? c.leaderBorder : c.border)}40`
          : officer.isLeader
            ? `0 4px 16px ${c.leaderGlow}`
            : `0 2px 8px ${c.glow}`,
        transform: hovered ? 'translateY(-5px)' : 'translateY(0)',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
    >
      {/* Top strip */}
      <div style={{
        width: '100%', height: stripH,
        background: c.strip,
        borderRadius: `${CARD_RADIUS}px ${CARD_RADIUS}px 0 0`,
        flexShrink: 0,
      }} />

      {/* Crown pill */}
      {officer.isLeader && (
        <div style={{
          position: 'absolute',
          top: -(stripH + 12), left: '50%', transform: 'translateX(-50%)',
          zIndex: 10, display: 'inline-flex', alignItems: 'center', gap: 5,
          padding: '4px 11px', borderRadius: 20,
          background: c.strip, border: '2.5px solid white',
          boxShadow: `0 3px 10px ${c.leaderGlow}`,
          whiteSpace: 'nowrap', pointerEvents: 'none',
        }}>
          <Crown size={10} color="white" strokeWidth={2.6} />
          <span style={{ fontSize: 9, fontWeight: 900, color: 'white', letterSpacing: '0.16em', textTransform: 'uppercase' }}>
            Category Leader
          </span>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: `${officer.isLeader ? 20 : 16}px 14px 16px`, flex: 1, width: '100%' }}>
        {/* Avatar */}
        <div style={{ position: 'relative', marginBottom: 18, flexShrink: 0 }}>
          <AvatarRing
            src={officer.profileImage}
            name={officer.fullName}
            ringSize={RING_OUTER}
            ring={ringPx}
            gap={GAP_PX}
            strip={c.strip}
            glow={officer.isLeader ? c.leaderGlow : null}
          />
          <div style={{
            position: 'absolute', bottom: -11, left: '50%', transform: 'translateX(-50%)',
            background: c.bandBg, color: 'white', fontSize: 10, fontWeight: 800,
            padding: '3px 9px', borderRadius: 6, letterSpacing: '0.07em',
            textTransform: 'uppercase', whiteSpace: 'nowrap',
            border: '2px solid white', boxShadow: '0 1px 4px rgba(0,0,0,0.18)', lineHeight: 1.4,
          }}>{abbr(officer.rank)}</div>
        </div>

        <p style={{
          fontSize: 14, fontWeight: 700, color: '#111827', textAlign: 'center',
          margin: '0 0 3px', lineHeight: 1.3, width: '100%',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
          overflow: 'hidden', wordBreak: 'break-word',
        }}>{officer.fullName}</p>

        <p style={{
          fontSize: 11, fontWeight: 500, color: c.pillColor, textAlign: 'center',
          margin: '0 0 9px', width: '100%',
          overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
        }}>{officer.rank}</p>

        <div style={{ width: '100%', height: 1, background: `linear-gradient(to right,transparent,${c.border},transparent)`, margin: '0 0 9px', flexShrink: 0 }} />

        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          padding: '3px 9px 3px 7px', borderRadius: 6,
          background: c.pillBg, border: `1px solid ${c.border}`,
          fontSize: 9.5, fontWeight: 800, color: c.pillColor,
          textTransform: 'uppercase', letterSpacing: '0.07em',
          marginBottom: role ? 6 : 0, flexShrink: 0,
        }}>
          <Icon size={9} strokeWidth={2.4} />{c.label}
        </span>

        {role && (
          <p style={{
            fontSize: 11.5, fontWeight: 500, color: '#78716c', textAlign: 'center',
            margin: '0', width: '100%', lineHeight: 1.4,
            overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
          }}>{role}</p>
        )}

        {officer.contactNumber && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 'auto', paddingTop: 9, maxWidth: '100%' }}>
            <Phone size={10} style={{ color: '#c4b5b0', flexShrink: 0 }} />
            <span style={{ fontSize: 11.5, color: '#b0a8a4', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
              {officer.contactNumber}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Org Section ──────────────────────────────────────────────────────────────
function OrgSection({ cat, officers }) {
  const c      = getCat(cat);
  const { Icon } = c;
  const leader  = officers.find(o => o.isLeader === true);
  const members = officers.filter(o => !o.isLeader);
  const rows    = [];
  for (let i = 0; i < members.length; i += ROWS_PER_PAGE) rows.push(members.slice(i, i + ROWS_PER_PAGE));

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      width: '100%', animation: 'opFU 0.24s ease both',
    }}>
      {/* Section label */}
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 12,
        padding: '10px 20px 10px 12px', borderRadius: 14,
        background: c.bg, border: `1.5px solid ${c.border}`,
        boxShadow: `0 4px 16px ${c.glow}`, marginBottom: 20,
      }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10, background: c.strip,
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
        }}>
          <Icon size={17} color="white" strokeWidth={2.2} />
        </div>
        <div style={{ lineHeight: 1.25 }}>
          <p style={{ fontSize: 13, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: c.color, margin: 0 }}>{c.label}</p>
          <p style={{ fontSize: 10.5, fontWeight: 500, color: c.pillColor, margin: 0 }}>{c.desc}</p>
        </div>
        <span style={{
          fontSize: 11, fontWeight: 800, padding: '2px 9px', borderRadius: 6,
          background: c.pillBg, color: c.pillColor, border: `1px solid ${c.border}`, marginLeft: 2,
        }}>{officers.length}</span>
      </div>

      {/* Stem */}
      <div style={{ width: 2, height: 18, background: `linear-gradient(to bottom,${c.border},transparent)`, marginBottom: 10 }} />

      {/* Leader */}
      {leader ? (
        <>
          <OrgMemberCard officer={leader} c={c} isLeader />
          {members.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '16px 0 8px' }}>
              <div style={{ width: 2, height: 24, background: `linear-gradient(to bottom,${c.bandBg},${c.border})` }} />
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                padding: '4px 13px', borderRadius: 7,
                background: c.pillBg, border: `1px solid ${c.border}`,
              }}>
                <Users size={10} color={c.pillColor} strokeWidth={2.4} />
                <span style={{ fontSize: 9.5, fontWeight: 800, color: c.pillColor, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                  Personnel · {members.length}
                </span>
              </div>
              <div style={{ width: 2, height: 16, background: `linear-gradient(to bottom,${c.border},transparent)` }} />
            </div>
          )}
        </>
      ) : (
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          padding: '9px 16px', borderRadius: 9,
          background: c.pillBg, border: `1.5px dashed ${c.border}`, marginBottom: 16,
        }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: c.pillColor, opacity: 0.6 }}>No leader assigned yet</span>
        </div>
      )}

      {/* Member rows */}
      {members.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22, width: '100%' }}>
          {rows.map((row, ri) => (
            <div key={ri} style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'nowrap' }}>
              {row.map(o => <OrgMemberCard key={o.id} officer={o} c={c} isLeader={false} />)}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function OfficersPage() {
  const [officers, setOfficers] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [selRank,  setSelRank]  = useState('All Ranks');
  const [selCat,   setSelCat]   = useState('All');
  const [rankOpen, setRankOpen] = useState(false);

  const RANKS = [
    'Chief Fire Officer','Chief Fire Inspector','Senior Fire Inspector','Fire Inspector',
    'Senior Fire Officer III','Senior Fire Officer II','Senior Fire Officer I',
    'Fire Officer III','Fire Officer II','Fire Officer I',
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
    const q  = search.toLowerCase();
    const ms = !q || [o.fullName, o.rank, o.roleAssignment, o.category].some(v => v?.toLowerCase().includes(q));
    return ms && (selRank === 'All Ranks' || o.rank === selRank) && (selCat === 'All' || o.category === selCat);
  });

  const uRanks    = ['All Ranks', ...RANKS.filter(r => officers.some(o => o.rank === r))];
  const isDefault = selCat === 'All' && !search && selRank === 'All Ranks';

  return (
    <div style={{ fontFamily: "'DM Sans',sans-serif", background: '#faf8f7', minHeight: '100vh' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        *,*::before,*::after { box-sizing:border-box; }
        @keyframes opFU  { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:translateY(0);} }
        @keyframes opSpin{ to{transform:rotate(360deg);} }
        .op-si:focus { outline:none; border-color:#c0392b!important; box-shadow:0 0 0 3px rgba(192,57,43,0.08)!important; }
        .op-ro { display:block;width:100%;text-align:left;padding:9px 14px;font-size:13px;background:none;border:none;cursor:pointer;font-family:inherit; }
        .op-ro:hover { background:rgba(192,57,43,0.04); }
        .op-ro.act { background:rgba(192,57,43,0.07);color:#c0392b;font-weight:700; }
        .op-fdd { animation:opFU 0.13s ease; }
        .op-tab { display:inline-flex;align-items:center;gap:6px;padding:7px 13px;border-radius:8px;font-size:11px;font-weight:700;font-family:inherit;text-transform:uppercase;letter-spacing:0.06em;cursor:pointer;border:1.5px solid #e5e2df;background:white;color:#78716c;white-space:nowrap;transition:all 0.16s; }
        .op-tab:hover { border-color:#d6c4bc;color:#44403c;transform:translateY(-1px); }
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
          <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(3rem,8vw,5.5rem)', letterSpacing: '0.04em', color: 'white', lineHeight: 1, margin: '0 0 14px' }}>
            Our Officers
          </h1>
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
            <input
              type="text" className="op-si" value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, rank, or assignment…"
              style={{ width: '100%', paddingLeft: 40, paddingRight: 14, paddingTop: 11, paddingBottom: 11, borderRadius: 10, fontSize: 13, fontWeight: 500, background: 'white', border: '1.5px solid #e8e2de', color: '#1c1917', fontFamily: "'DM Sans',sans-serif", transition: 'border-color 0.18s,box-shadow 0.18s', outline: 'none' }}
            />
          </div>
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setRankOpen(p => !p)}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 16px', borderRadius: 10, fontSize: 13, fontWeight: 700, cursor: 'pointer', minWidth: 168, justifyContent: 'space-between', background: selRank !== 'All Ranks' ? 'rgba(192,57,43,0.06)' : 'white', border: `1.5px solid ${selRank !== 'All Ranks' ? 'rgba(192,57,43,0.25)' : '#e8e2de'}`, color: selRank !== 'All Ranks' ? '#c0392b' : '#78716c', fontFamily: "'DM Sans',sans-serif" }}
            >
              <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Filter size={13} />{selRank !== 'All Ranks' ? (LOCAL_RA[selRank] || selRank) : 'All Ranks'}
              </span>
              <ChevronDown size={13} style={{ transform: rankOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.18s' }} />
            </button>
            {rankOpen && (
              <div className="op-fdd" style={{ position: 'absolute', right: 0, top: '100%', marginTop: 6, borderRadius: 10, overflow: 'hidden', zIndex: 30, background: 'white', border: '1.5px solid #ede8e5', boxShadow: '0 8px 28px rgba(0,0,0,0.09)', minWidth: 220, padding: '4px 0' }}>
                {uRanks.map(rk => (
                  <button
                    key={rk} className={`op-ro ${selRank === rk ? 'act' : ''}`}
                    onClick={() => { setSelRank(rk); setRankOpen(false); }}
                    style={{ color: selRank === rk ? '#c0392b' : '#44403c' }}
                  >{rk}</button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Category tabs */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
          <button
            className="op-tab" onClick={() => setSelCat('All')}
            style={selCat === 'All' ? { background: 'linear-gradient(135deg,#c0392b,#e67e22)', color: 'white', border: '1.5px solid transparent', boxShadow: '0 3px 12px rgba(192,57,43,0.25)', transform: 'translateY(-1px)' } : { color: '#78716c' }}
          >
            <Users size={11} strokeWidth={2.2} color={selCat === 'All' ? 'white' : '#78716c'} />
            All Officers
            <span style={{ fontSize: 10, fontWeight: 800, padding: '1px 6px', borderRadius: 5, background: selCat === 'All' ? 'rgba(255,255,255,0.22)' : 'rgba(192,57,43,0.08)', color: selCat === 'All' ? 'white' : '#c0392b' }}>
              {sorted.length}
            </span>
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
      <section style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 20px 60px' }}>
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '80px 0' }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', border: '2.5px solid #c0392b', borderTopColor: 'transparent', animation: 'opSpin 0.9s linear infinite', marginBottom: 14 }} />
            <p style={{ fontSize: 13, fontWeight: 600, color: '#a8a29e', margin: 0 }}>Loading officers...</p>
          </div>

        ) : filtered.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '64px 0' }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', background: 'rgba(192,57,43,0.05)', border: '1.5px dashed rgba(192,57,43,0.2)' }}>
              <Search size={22} style={{ color: '#d4b8b3' }} />
            </div>
            <p style={{ fontSize: 15, fontWeight: 700, color: '#78716c', margin: '0 0 5px' }}>No officers found</p>
            <p style={{ fontSize: 13, color: '#c4b5b0', margin: 0 }}>Try adjusting your search or filter</p>
          </div>

        ) : isDefault ? (
          /* ══ ORG CHART ══ */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

            {/* Root node */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
              <div style={{ width: 2, height: 32, background: 'linear-gradient(to bottom,#c0392b,#ede8e5)' }} />
            </div>

            {/* Category sections */}
            {CATEGORY_OPTIONS.map((cat, ci) => {
              const group  = filtered.filter(o => o.category === cat);
              if (!group.length) return null;
              const isLast = !CATEGORY_OPTIONS.slice(ci + 1).some(c => filtered.some(o => o.category === c));
              return (
                <div key={cat} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <OrgSection cat={cat} officers={group} />
                  {!isLast && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 14, width: '100%', maxWidth: 700, margin: '32px 0', opacity: 0.25 }}>
                      <div style={{ flex: 1, height: 1, background: 'linear-gradient(to right,transparent,#c0392b)' }} />
                      <div style={{ width: 5, height: 5, borderRadius: '50%', background: '#c0392b' }} />
                      <div style={{ flex: 1, height: 1, background: 'linear-gradient(to left,transparent,#c0392b)' }} />
                    </div>
                  )}
                </div>
              );
            })}

            {/* Unassigned */}
            {(() => {
              const unc = filtered.filter(o => !o.category || !CATEGORY_OPTIONS.includes(o.category));
              if (!unc.length) return null;
              return (
                <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: 40 }}>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, padding: '10px 18px 10px 12px', borderRadius: 13, background: '#f5f4f3', border: '1.5px solid #ddd5d0', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', marginBottom: 22 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 9, background: 'linear-gradient(135deg,#78716c,#a8a29e)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <UserX size={17} color="white" strokeWidth={2.2} />
                    </div>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#44403c', margin: 0 }}>Unassigned</p>
                      <p style={{ fontSize: 10.5, color: '#78716c', margin: 0, fontWeight: 500 }}>No category set</p>
                    </div>
                    <span style={{ fontSize: 11, fontWeight: 800, padding: '2px 9px', borderRadius: 6, background: '#e7e5e4', color: '#57534e', border: '1px solid #d6d3d1', marginLeft: 4 }}>{unc.length}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 22 }}>
                    {Array.from({ length: Math.ceil(unc.length / ROWS_PER_PAGE) }, (_, ri) => (
                      <div key={ri} style={{ display: 'flex', gap: 16, justifyContent: 'center' }}>
                        {unc.slice(ri * ROWS_PER_PAGE, ri * ROWS_PER_PAGE + ROWS_PER_PAGE).map(o => (
                          <OrgMemberCard key={o.id} officer={o} c={FALLBACK} isLeader={false} />
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })()}
          </div>

        ) : (
          /* ── Flat / filtered grid ── */
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 20, alignItems: 'start' }}>
            {filtered.map(o => <OfficerCard key={o.id} officer={o} />)}
          </div>
        )}
      </section>

      {/* ── CONTACT BAR ── */}
      <section style={{ background: 'white', borderTop: '1.5px solid #ede8e5', padding: '26px 20px 34px' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '16px 20px', borderRadius: 13, background: 'white', border: '1.5px solid #ede8e5', boxShadow: '0 2px 10px rgba(0,0,0,0.04)' }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'rgba(192,57,43,0.07)', border: '1.5px solid rgba(192,57,43,0.14)' }}>
              <Award size={18} style={{ color: '#c0392b' }} />
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