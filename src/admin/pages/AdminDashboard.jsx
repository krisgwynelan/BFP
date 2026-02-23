import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { LogOut, Users, FileText, Phone, LayoutDashboard, ExternalLink, Shield, ChevronRight, Flame, Activity, AlertTriangle } from 'lucide-react';
import { OfficersManager } from '../components/OfficersManager';
import { WeeklyReportsManager } from '../components/WeeklyReportsManager';
import { ContactManager } from '../components/ContactManager';
import { getOfficers, getWeeklyReports } from '../../utils/storage';
import { toast } from 'sonner';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ officers: 0, reports: 0 });
  const [statsLoading, setStatsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [logoutCountdown, setLogoutCountdown] = useState(null);

  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('admin_logged_in');
    if (!isLoggedIn) { navigate('/admin'); return; }

    const loadStats = async () => {
      setStatsLoading(true);
      try {
        const [officers, reports] = await Promise.all([getOfficers(), getWeeklyReports()]);
        setStats({ officers: officers.length, reports: reports.length });
      } catch (err) {
        console.error(err);
        toast.error('Could not load stats — check Firestore rules.');
      } finally {
        setStatsLoading(false);
      }
    };

    loadStats();
    const tick = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, [navigate]);

  useEffect(() => {
    if (!showLogoutConfirm) { setLogoutCountdown(null); return; }
    setLogoutCountdown(5);
    const interval = setInterval(() => {
      setLogoutCountdown(prev => {
        if (prev <= 1) { clearInterval(interval); return 0; }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [showLogoutConfirm]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') setShowLogoutConfirm(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const handleLogout = () => {
    sessionStorage.removeItem('admin_logged_in');
    toast.success('Logged out successfully');
    navigate('/admin');
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard',     icon: LayoutDashboard },
    { id: 'officers',  label: 'Officers',       icon: Users },
    { id: 'reports',   label: 'Weekly Reports', icon: FileText },
    { id: 'contact',   label: 'Contact Info',   icon: Phone },
  ];

  const dateStr = currentTime.toLocaleDateString('en-PH', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const timeStr = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: "'DM Sans', sans-serif", background: '#faf7f5' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #f5ede9; }
        ::-webkit-scrollbar-thumb { background: #e2b8b0; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #c0392b; }

        @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.4;transform:scale(0.75);} }
        .pulse-dot { animation: pulseDot 2s ease-in-out infinite; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(14px);} to{opacity:1;transform:translateY(0);} }
        .fade-up { animation: fadeUp 0.32s ease forwards; }

        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { display:inline-block; width:26px; height:26px; border:3px solid #fde8e5; border-top-color:currentColor; border-radius:50%; animation:spin 0.75s linear infinite; }

        .stat-card { background:white; border-radius:16px; border:1.5px solid #f2e4e0; box-shadow:0 1px 4px rgba(192,57,43,0.04); transition:all 0.22s ease; position:relative; overflow:hidden; }
        .stat-card:hover { transform:translateY(-4px); box-shadow:0 16px 40px rgba(192,57,43,0.1); border-color:#e8c4bc; }

        .nav-btn { display:flex; align-items:center; gap:8px; padding:14px 20px; font-size:13px; font-weight:600; white-space:nowrap; transition:all 0.18s; border-bottom:2px solid transparent; color:#9c7b74; cursor:pointer; background:none; border-top:none; border-left:none; border-right:none; }
        .nav-btn:hover  { color:#c0392b; background:rgba(192,57,43,0.04); }
        .nav-btn.active { color:#c0392b; border-bottom-color:#c0392b; background:rgba(192,57,43,0.025); }

        .quick-btn { display:flex; align-items:center; gap:14px; padding:18px 22px; background:white; border:1.5px solid #f2e4e0; border-radius:14px; transition:all 0.2s ease; cursor:pointer; text-align:left; width:100%; }
        .quick-btn:hover { border-color:#e0b4ac; box-shadow:0 8px 24px rgba(192,57,43,0.09); transform:translateY(-2px); }

        /* ── Logout Modal ── */
        @keyframes overlayIn { from{opacity:0;} to{opacity:1;} }
        @keyframes modalPop {
          0%  { opacity:0; transform:scale(0.88) translateY(22px); }
          65% { transform:scale(1.015) translateY(-2px); }
          100%{ opacity:1; transform:scale(1) translateY(0); }
        }
        @keyframes rowIn { from{opacity:0;transform:translateY(7px);} to{opacity:1;transform:translateY(0);} }
        @keyframes countdownDrain { from{width:100%;} to{width:0%;} }
        @keyframes ringPulse { 0%,100%{box-shadow:0 0 0 0 rgba(192,57,43,0.2);} 60%{box-shadow:0 0 0 10px rgba(192,57,43,0);} }

        .lo-overlay {
          position:fixed; inset:0; z-index:60;
          display:flex; align-items:center; justify-content:center; padding:16px;
          animation: overlayIn 0.18s ease;
        }
        .lo-bg {
          position:absolute; inset:0;
          background:rgba(250,240,238,0.85);
          backdrop-filter:blur(14px) saturate(1.5);
        }
        .lo-card {
          position:relative; z-index:1;
          width:100%; max-width:430px;
          background:white;
          border-radius:20px;
          border:1.5px solid #f0dad5;
          box-shadow:
            0 0 0 5px rgba(192,57,43,0.05),
            0 24px 64px rgba(192,57,43,0.14),
            0 4px 18px rgba(0,0,0,0.07);
          animation: modalPop 0.4s cubic-bezier(0.34,1.56,0.64,1) forwards;
          overflow:hidden;
        }

        .lo-topbar { height:5px; background:linear-gradient(90deg,#c0392b 0%,#e74c3c 50%,#e67e22 100%); }

        .lo-icon-wrap {
          width:62px; height:62px; border-radius:50%; flex-shrink:0;
          display:flex; align-items:center; justify-content:center;
          background:linear-gradient(145deg,#fff5f3,#ffe8e3);
          border:2px solid #fbc8be;
          animation: ringPulse 2.2s ease-in-out infinite;
          position:relative;
        }
        .lo-icon-wrap::after {
          content:''; position:absolute; inset:-7px; border-radius:50%;
          border:1.5px dashed rgba(192,57,43,0.18);
        }

        .lo-head { padding:26px 28px 22px; border-bottom:1.5px solid #faeae5; }
        .lo-body { padding:22px 28px 28px; background:#fffaf8; }

        .lo-crumb { display:flex; align-items:center; gap:5px; margin-bottom:10px; }
        .lo-crumb-item { font-size:9px; font-weight:800; text-transform:uppercase; letter-spacing:0.15em; }
        .lo-crumb-sep { font-size:10px; color:#e0cac5; }
        .lo-title { font-family:'Bebas Neue',sans-serif; font-size:2rem; letter-spacing:0.05em; color:#1c0a08; line-height:1; margin:0; }
        .lo-sub { font-size:11px; color:#b08878; font-weight:500; margin-top:4px; }

        .lo-session-pill {
          display:flex; align-items:center; justify-content:space-between;
          padding:9px 13px; border-radius:9px; margin-bottom:14px;
          background:white; border:1.5px solid #f2e4e0;
          animation: rowIn 0.3s 0.08s ease both;
        }
        .lo-warning {
          display:flex; align-items:flex-start; gap:10px;
          padding:12px 14px; border-radius:10px; margin-bottom:16px;
          background:#fff5f2; border:1.5px solid #fccfc6;
          animation: rowIn 0.3s 0.14s ease both;
        }
        .lo-bar-track { height:4px; border-radius:99px; background:#fce8e3; margin-bottom:18px; overflow:hidden; animation: rowIn 0.3s 0.18s ease both; }
        .lo-bar-fill  { height:100%; border-radius:99px; background:linear-gradient(90deg,#c0392b,#e67e22); animation: countdownDrain 5s linear forwards; }

        .lo-btn-row { display:flex; gap:10px; animation: rowIn 0.3s 0.22s ease both; }
        .lo-btn-yes {
          flex:1; padding:13px 0; border-radius:11px; border:none; cursor:pointer;
          background:linear-gradient(135deg,#c0392b,#e74c3c);
          color:white; font-size:13px; font-weight:700;
          display:flex; align-items:center; justify-content:center; gap:7px;
          box-shadow:0 4px 14px rgba(192,57,43,0.28);
          transition:all 0.18s;
        }
        .lo-btn-yes:hover { background:linear-gradient(135deg,#a93226,#cb4335); box-shadow:0 6px 20px rgba(192,57,43,0.38); transform:translateY(-1px); }
        .lo-btn-yes:active { transform:translateY(0); }
        .lo-btn-no {
          flex:1; padding:13px 0; border-radius:11px; cursor:pointer;
          background:white; border:1.5px solid #e8dad6; color:#6b4c46;
          font-size:13px; font-weight:700; transition:all 0.18s;
        }
        .lo-btn-no:hover { background:#fff5f2; border-color:#dfbab4; color:#3d2520; }

        .lo-hint { font-size:11px; color:#c4a8a0; text-align:center; margin-top:14px; font-weight:500; animation: rowIn 0.3s 0.26s ease both; }
        .lo-kbd { padding:2px 6px; border-radius:4px; background:#faf0ee; border:1px solid #e8d8d2; font-family:monospace; font-size:10px; color:#9c7b74; }
      `}</style>

      {/* ─── HEADER ─── */}
      <header style={{ background: 'white', borderBottom: '1.5px solid #f2e4e0', boxShadow: '0 1px 6px rgba(192,57,43,0.05)' }} className="shrink-0">
        <div className="flex items-stretch h-[62px]">

          <div className="flex items-center gap-3 px-5 shrink-0" style={{ borderRight: '1.5px solid #f5ede9' }}>
            <div className="relative w-10 h-10 rounded-xl overflow-hidden" style={{ border: '1.5px solid #f2e4e0', boxShadow: '0 1px 4px rgba(192,57,43,0.08)' }}>
              <img src="/BFP.jpg" alt="BFP" className="w-full h-full object-cover" />
              <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white pulse-dot" />
            </div>
            <div>
              <p style={{ fontSize: 9, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#c0392b', lineHeight: 1 }}>Bureau of Fire Protection</p>
              <p style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing: '0.06em', fontSize: '1rem', color: '#1c0a08', lineHeight: 1.25, marginTop: 3 }}>BFP Station 1 — Cogon</p>
            </div>
          </div>

          <div className="hidden lg:flex items-center px-5" style={{ borderRight: '1.5px solid #f5ede9' }}>
            <div>
              <p style={{ fontSize: 10, color: '#b08878', fontWeight: 600 }}>{dateStr}</p>
              <p style={{ fontSize: 13, fontWeight: 700, color: '#1c0a08', fontVariantNumeric: 'tabular-nums', marginTop: 2 }}>{timeStr}</p>
            </div>
          </div>

          <div className="hidden md:flex items-center px-5" style={{ borderRight: '1.5px solid #f5ede9' }}>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(39,174,96,0.07)', border: '1.5px solid rgba(39,174,96,0.2)' }}>
              <span className="pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#16a34a' }}>Operational</span>
            </div>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2 px-4">
            <button onClick={() => setShowLogoutConfirm(true)}
              className="flex items-center gap-2 px-4 py-2 rounded-lg"
              style={{ fontSize: 12, fontWeight: 700, background: '#fff0ed', border: '1.5px solid #f5cac0', color: '#c0392b', cursor: 'pointer', transition: 'all 0.15s' }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fde3de'; }}
              onMouseLeave={e => { e.currentTarget.style.background = '#fff0ed'; }}>
              <LogOut size={13} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* ─── NAV TABS ─── */}
      <div style={{ background: 'white', borderBottom: '1.5px solid #f2e4e0' }} className="shrink-0 px-2">
        <nav className="flex overflow-x-auto">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setActiveTab(id)} className={`nav-btn ${activeTab === id ? 'active' : ''}`}>
              <Icon size={14} style={{ color: activeTab === id ? '#c0392b' : '#c4a8a0' }} />
              {label}
            </button>
          ))}
        </nav>
      </div>

      {/* ─── MAIN ─── */}
      <main className="flex-1 overflow-auto">

        {activeTab === 'dashboard' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-up">

            {/* Heading */}
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', color: '#c0392b', marginBottom: 5 }}>Admin Control Panel</p>
                <h1 style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: 'clamp(2rem,5vw,2.8rem)', letterSpacing: '0.06em', lineHeight: 1, color: '#1c0a08', margin: 0 }}>
                  Station Overview
                </h1>
                <p style={{ fontSize: 13, color: '#9c7b74', marginTop: 6 }}>BFP Station 1 Cogon — Real-time management dashboard</p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl"
                style={{ background: '#fff5f3', border: '1.5px solid #fad0c8' }}>
                <Activity size={13} style={{ color: '#c0392b' }} />
                <span style={{ fontSize: 12, fontWeight: 700, color: '#c0392b' }}>Live System</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
              {[
                { label: 'Total Officers',       value: stats.officers, max: 100, color: '#c0392b', bg: '#fff5f3', stripe: 'linear-gradient(90deg,#c0392b,#e74c3c)', icon: Users,    sub: 'Active Personnel' },
                { label: 'Weekly Reports Filed', value: stats.reports,  max: 1000, color: '#d35400', bg: '#fff8f3', stripe: 'linear-gradient(90deg,#d35400,#e67e22)', icon: FileText, sub: 'Reports Published' },
                { label: 'Station Status', isStatus: true, color: '#16a34a', bg: '#f0fdf4', stripe: 'linear-gradient(90deg,#16a34a,#22c55e)', icon: Shield, sub: 'All Systems Normal' },
              ].map(({ label, value, max, color, bg, stripe, icon: Icon, sub, isStatus }) => (
                <div key={label} className="stat-card p-6">
                  {/* Top stripe */}
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: stripe, borderRadius: '16px 16px 0 0' }} />
                  <div className="flex items-start justify-between mb-5 mt-1">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center"
                      style={{ background: bg, border: `1.5px solid ${color}20` }}>
                      <Icon size={18} style={{ color }} />
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.12em', color: '#c4a8a0' }}>
                      {isStatus ? 'STATUS' : 'TOTAL'}
                    </span>
                  </div>

                  {isStatus ? (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="pulse-dot" style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                      <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '2.2rem', letterSpacing: '0.05em', color: '#16a34a', lineHeight: 1 }}>Active</p>
                    </div>
                  ) : (
                    <p style={{ fontFamily: "'Bebas Neue',sans-serif", fontSize: '3rem', letterSpacing: '0.04em', color: '#1c0a08', lineHeight: 1, marginBottom: 2 }}>
                      {statsLoading ? <span className="spinner" style={{ color }} /> : value}
                    </p>
                  )}

                  <p style={{ fontSize: 12, fontWeight: 600, color: '#b08878', marginBottom: 14 }}>{label}</p>

                  {!isStatus && (
                    <>
                      <div className="flex justify-between mb-1.5">
                        <span style={{ fontSize: 10, color: '#c4a8a0', fontWeight: 600 }}>{sub}</span>
                        <span style={{ fontSize: 10, fontWeight: 700, color }}>{statsLoading ? '—' : `${Math.round((value / max) * 100)}%`}</span>
                      </div>
                      <div style={{ height: 5, borderRadius: 99, background: `${color}14`, overflow: 'hidden' }}>
                        <div style={{ height: '100%', borderRadius: 99, background: stripe, width: statsLoading ? '0%' : `${Math.min((value / max) * 100, 100)}%`, transition: 'width 0.8s ease' }} />
                      </div>
                    </>
                  )}
                  {isStatus && <p style={{ fontSize: 11, fontWeight: 600, color: '#86a890' }}>{sub}</p>}
                </div>
              ))}
            </div>

            {/* Quick nav */}
            <div className="flex items-center gap-3 mb-5">
              <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: '#c4a8a0' }}>Quick Navigation</span>
              <div style={{ flex: 1, height: 1, background: '#f2e4e0' }} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { tab: 'officers', icon: Users,    color: '#c0392b', bg: '#fff5f3', border: '#fad0c8', title: 'Manage Officers',  desc: 'Add, edit, or remove officer records from the roster' },
                { tab: 'reports',  icon: FileText, color: '#d35400', bg: '#fff8f3', border: '#fcd5b0', title: 'Weekly Reports',  desc: 'Publish and manage station activities & updates' },
                { tab: 'contact',  icon: Phone,    color: '#b45309', bg: '#fffbf0', border: '#fde9a8', title: 'Contact Info',    desc: 'Update public emergency contact details' },
              ].map(({ tab, icon: Icon, color, bg, border, title, desc }) => (
                <button key={tab} onClick={() => setActiveTab(tab)} className="quick-btn group">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{ background: bg, border: `1.5px solid ${border}` }}>
                    <Icon size={20} style={{ color }} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0, textAlign: 'left' }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: '#1c0a08', margin: 0 }}>{title}</p>
                    <p style={{ fontSize: 12, color: '#b08878', marginTop: 3, margin: '3px 0 0' }}>{desc}</p>
                  </div>
                  <ChevronRight size={15} style={{ color: '#ddc8c0', flexShrink: 0 }} />
                </button>
              ))}
            </div>

            <div className="mt-8 pt-5 flex items-center gap-2" style={{ borderTop: '1px dashed #f0ddd8' }}>
              <Flame size={12} style={{ color: '#e0a090' }} />
              <p style={{ fontSize: 11, color: '#c4a8a0' }}>BFP Station 1 — Cogon, Cagayan de Oro City · Admin Panel v1.0</p>
            </div>
          </div>
        )}

        {activeTab === 'officers' && <div className="fade-up max-w-7xl mx-auto"><OfficersManager /></div>}
        {activeTab === 'reports'  && <div className="fade-up max-w-7xl mx-auto"><WeeklyReportsManager /></div>}
        {activeTab === 'contact'  && <div className="fade-up max-w-7xl mx-auto"><ContactManager /></div>}
      </main>

      {/* ─── LOGOUT CONFIRMATION MODAL ─── */}
      {showLogoutConfirm && (
        <div className="lo-overlay">
          <div className="lo-bg" onClick={() => setShowLogoutConfirm(false)} />

          <div className="lo-card">
            <div className="lo-topbar" />

            {/* Head */}
            <div className="lo-head">
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                <div className="lo-icon-wrap">
                  <AlertTriangle size={26} style={{ color: '#c0392b' }} />
                </div>
                <div style={{ flex: 1, paddingTop: 2 }}>
                  {/* Breadcrumb */}
                  <div className="lo-crumb">
                    <span className="lo-crumb-item" style={{ color: '#c0392b' }}>Admin</span>
                    <span className="lo-crumb-sep">›</span>
                    <span className="lo-crumb-item" style={{ color: '#b08878' }}>Session</span>
                    <span className="lo-crumb-sep">›</span>
                    <span className="lo-crumb-item" style={{ color: '#c0392b' }}>Logout</span>
                  </div>
                  <h2 className="lo-title">End Session?</h2>
                  <p className="lo-sub">BFP Station 1 Cogon · Admin Panel</p>
                </div>
              </div>
            </div>

            {/* Body */}
            <div className="lo-body">

              {/* Session pill */}
              <div className="lo-session-pill">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="pulse-dot" style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#6b4c46', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
                    Active · <span style={{ color: '#1c0a08' }}>Admin Dashboard</span>
                  </span>
                </div>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#b08878', fontVariantNumeric: 'tabular-nums' }}>{timeStr}</span>
              </div>

              {/* Warning */}
              <div className="lo-warning">
                <AlertTriangle size={14} style={{ color: '#c0392b', flexShrink: 0, marginTop: 1 }} />
                <p style={{ fontSize: 12, color: '#7a3028', lineHeight: 1.65, margin: 0 }}>
                  You are about to end your admin session. Any <strong>unsaved changes</strong> will be discarded. You'll need to log in again to access the panel.
                </p>
              </div>

              {/* Countdown bar */}
              {logoutCountdown !== null && (
                <div className="lo-bar-track">
                  <div className="lo-bar-fill" />
                </div>
              )}

              {/* Buttons */}
              <div className="lo-btn-row">
                <button className="lo-btn-yes" onClick={handleLogout}>
                  <LogOut size={14} /> Yes, Logout
                </button>
                <button className="lo-btn-no" onClick={() => setShowLogoutConfirm(false)}>
                  Stay Logged In
                </button>
              </div>

              <p className="lo-hint">
                Press <kbd className="lo-kbd">Esc</kbd> or click outside to cancel
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}