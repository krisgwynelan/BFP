import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { LogOut, Users, FileText, Phone, LayoutDashboard, ExternalLink, Shield, ChevronRight, Flame, TrendingUp, Activity } from 'lucide-react';
import { OfficersManager } from '../components/OfficersManager';
import { WeeklyReportsManager } from '../components/WeeklyReportsManager';
import { ContactManager } from '../components/ContactManager';
import { getOfficers, getWeeklyReports } from '../../utils/storage';
import { toast } from 'sonner';

export function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({ officers: 0, reports: 0 });
  const [currentTime, setCurrentTime] = useState(new Date());
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  useEffect(() => {
    const isLoggedIn = sessionStorage.getItem('admin_logged_in');
    if (!isLoggedIn) navigate('/admin');
    setStats({
      officers: getOfficers().length,
      reports: getWeeklyReports().length,
    });
    const tick = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(tick);
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('admin_logged_in');
    toast.success('Logged out successfully');
    navigate('/admin');
  };

  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'officers', label: 'Officers', icon: Users },
    { id: 'reports', label: 'Weekly Reports', icon: FileText },
    { id: 'contact', label: 'Contact Info', icon: Phone },
  ];

  const dateStr = currentTime.toLocaleDateString('en-PH', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
  });
  const timeStr = currentTime.toLocaleTimeString('en-US', {
    hour: '2-digit', minute: '2-digit', second: '2-digit',
  });

  return (
    <div className="min-h-screen flex flex-col" style={{
      fontFamily: "'DM Sans', sans-serif",
      background: '#f5f3f0',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: #f0ece8; }
        ::-webkit-scrollbar-thumb { background: #e2c4b8; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #c0392b; }

        @keyframes pulseDot { 0%,100%{opacity:1;transform:scale(1);} 50%{opacity:0.5;transform:scale(0.85);} }
        .pulse-dot { animation: pulseDot 2s ease-in-out infinite; }

        @keyframes fadeUp { from{opacity:0;transform:translateY(12px);} to{opacity:1;transform:translateY(0);} }
        .fade-up { animation: fadeUp 0.3s ease forwards; }

        @keyframes shimmer { 0%{background-position:200% center;} 100%{background-position:-200% center;} }
        .fire-shimmer {
          background: linear-gradient(90deg, #c0392b, #ef0e0e, #c0392b, #9c5211);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 4s linear infinite;
        }

        .stat-card {
          background: white;
          border: 1.5px solid #f0e8e5;
          border-radius: 16px;
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .stat-card:hover { transform: translateY(-3px); box-shadow: 0 12px 32px rgba(192,57,43,0.12); border-color: #e8c4bc; }
        .stat-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
        }
        .stat-card.red::before { background: linear-gradient(90deg, #c0392b, #e74c3c); }
        .stat-card.orange::before { background: linear-gradient(90deg, #d35400, #e67e22); }
        .stat-card.green::before { background: linear-gradient(90deg, #27ae60, #2ecc71); }

        .nav-btn {
          position: relative;
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 14px 18px;
          font-size: 13px;
          font-weight: 600;
          white-space: nowrap;
          transition: all 0.2s ease;
          border-bottom: 2px solid transparent;
          color: #78716c;
        }
        .nav-btn:hover { color: #c0392b; background: rgba(192,57,43,0.04); }
        .nav-btn.active { color: #c0392b; border-bottom-color: #c0392b; }

        .quick-action-btn {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 20px 24px;
          text-align: left;
          transition: all 0.2s ease;
          background: white;
          border: 1.5px solid #f0e8e5;
          border-radius: 14px;
        }
        .quick-action-btn:hover { border-color: #e8c4bc; box-shadow: 0 6px 20px rgba(192,57,43,0.08); transform: translateY(-2px); }
      `}</style>

      {/* ── HEADER ── */}
      <header style={{ background: 'white', borderBottom: '1.5px solid #f0e8e5', boxShadow: '0 1px 8px rgba(0,0,0,0.05)' }} className="shrink-0">
        <div className="flex items-stretch h-[64px]">

                  {/* Brand */}
                  <div className="flex items-center gap-3 px-5 shrink-0" style={{ borderRight: '1.5px solid #f5ede9' }}>
        <div
          className="relative w-10 h-10 rounded-xl flex items-center justify-center shadow-md overflow-hidden"
          style={{ background: "linear-gradient(135deg, #c0392b, #e67e22)" }}
        >
          {/* IMAGE */}
          <img
            src="/BFP.jpg"   // ilisi kung lain imong image path
            alt="BFP Logo"
            className="w-full h-full object-cover"
          />

          {/* Online status dot */}
          <span className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full bg-green-500 border-2 border-white pulse-dot" />
        </div>
            <div>
              <p className="font-bold text-[9px] uppercase tracking-[0.2em] leading-none" style={{ color: '#c0392b' }}>
                Bureau of Fire Protection
              </p>
              <p className="font-black text-sm leading-tight mt-0.5" style={{ color: '#1c1917', fontFamily: "'Bebas Neue', sans-serif", letterSpacing: '0.06em', fontSize: '1.05rem' }}>
                BFP Station 1 — Cogon
              </p>
            </div>
          </div>

          {/* Date/Time */}
          <div className="hidden lg:flex items-center px-5" style={{ borderRight: '1.5px solid #f5ede9' }}>
            <div>
              <p className="text-[10px] font-semibold" style={{ color: '#a8a29e' }}>{dateStr}</p>
              <p className="font-bold text-sm tabular-nums mt-0.5" style={{ color: '#292524' }}>{timeStr}</p>
            </div>
          </div>

          {/* Status */}
          <div className="hidden md:flex items-center px-5" style={{ borderRight: '1.5px solid #f5ede9' }}>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border"
              style={{ background: 'rgba(39,174,96,0.08)', borderColor: 'rgba(39,174,96,0.25)' }}>
              <span className="w-2 h-2 rounded-full bg-green-500 pulse-dot" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-green-600">Operational</span>
            </div>
          </div>

          <div className="flex-1" />

          <div className="flex items-center gap-2 px-4">
            <button
              onClick={() => navigate('/')}
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
              style={{ color: '#78716c' }}
              onMouseEnter={e => { e.target.style.color = '#c0392b'; e.target.style.background = 'rgba(192,57,43,0.06)'; }}
              onMouseLeave={e => { e.target.style.color = '#78716c'; e.target.style.background = 'transparent'; }}
            >
              <ExternalLink size={13} /> Public Site
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs font-bold px-4 py-2 rounded-lg transition-all"
              style={{ background: 'rgba(192,57,43,0.08)', border: '1.5px solid rgba(192,57,43,0.2)', color: '#c0392b' }}
            >
              <LogOut size={13} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── NAV ── */}
      <div style={{ background: 'white', borderBottom: '1.5px solid #f0e8e5' }} className="shrink-0 px-3">
        <nav className="flex overflow-x-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`nav-btn ${active ? 'active' : ''}`}
              >
                <Icon size={14} style={{ color: active ? '#c0392b' : '#a8a29e' }} />
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>

      {/* ── MAIN ── */}
      <main className="flex-1 overflow-auto">
        {activeTab === 'dashboard' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 fade-up">

            {/* Page header */}
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] mb-1" style={{ color: '#c0392b' }}>
                  Admin Control Panel
                </p>
                <h1 className="font-black leading-none fire-shimmer"
                  style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.8rem', letterSpacing: '0.06em' }}>
                  Station Overview
                </h1>
                <p className="text-sm mt-1" style={{ color: '#78716c' }}>
                  BFP Station 1 Cogon — Real-time management dashboard
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl" style={{ background: 'rgba(192,57,43,0.06)', border: '1.5px solid rgba(192,57,43,0.15)' }}>
                <Activity size={14} style={{ color: '#c0392b' }} />
                <span className="text-xs font-bold" style={{ color: '#c0392b' }}>Live System</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
              {[
                { label: 'Total Officers', value: stats.officers, max: 30, color: 'red', icon: Users, accent: '#c0392b', bg: 'rgba(192,57,43,0.06)', subtitle: 'Active Personnel' },
                { label: 'Weekly Reports Filed', value: stats.reports, max: 52, color: 'orange', icon: FileText, accent: '#d35400', bg: 'rgba(211,84,0,0.06)', subtitle: 'Reports Published' },
                { label: 'Station Status', value: 'Active', isStatus: true, color: 'green', icon: Shield, accent: '#27ae60', bg: 'rgba(39,174,96,0.06)', subtitle: 'All Systems Normal' },
              ].map(({ label, value, max, color, icon: Icon, accent, bg, subtitle, isStatus }) => (
                <div key={label} className={`stat-card ${color} p-6`}>
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ background: bg, border: `1.5px solid ${accent}25` }}>
                      <Icon size={18} style={{ color: accent }} />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: '#a8a29e' }}>
                      {isStatus ? 'STATUS' : 'TOTAL'}
                    </span>
                  </div>

                  {isStatus ? (
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="w-2.5 h-2.5 rounded-full bg-green-500 pulse-dot" />
                        <p className="font-black leading-none" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.4rem', letterSpacing: '0.05em', color: '#27ae60' }}>
                          Active
                        </p>
                      </div>
                    </div>
                  ) : (
                    <p className="font-black leading-none mb-1" style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '3.2rem', letterSpacing: '0.04em', color: '#1c1917' }}>
                      {value}
                    </p>
                  )}

                  <p className="text-xs font-semibold mb-4" style={{ color: '#a8a29e' }}>{label}</p>

                  {!isStatus && (
                    <div>
                      <div className="flex justify-between mb-1.5">
                        <span className="text-[10px] font-semibold" style={{ color: '#c4b5b0' }}>{subtitle}</span>
                        <span className="text-[10px] font-bold" style={{ color: accent }}>{Math.round((value / max) * 100)}%</span>
                      </div>
                      <div className="h-1.5 rounded-full overflow-hidden" style={{ background: `${accent}18` }}>
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{ width: `${Math.min((value / max) * 100, 100)}%`, background: `linear-gradient(90deg, ${accent}cc, ${accent})` }} />
                      </div>
                    </div>
                  )}
                  {isStatus && <p className="text-[11px] font-semibold" style={{ color: '#a8a29e' }}>{subtitle}</p>}
                </div>
              ))}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 mb-6">
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: '#c4b5b0' }}>Quick Navigation</span>
              <div className="flex-1 h-px" style={{ background: '#ede8e5' }} />
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { tab: 'officers', icon: Users, accent: '#c0392b', bg: 'rgba(192,57,43,0.08)', title: 'Manage Officers', desc: 'Add, edit, or remove officer records from the roster' },
                { tab: 'reports', icon: FileText, accent: '#d35400', bg: 'rgba(211,84,0,0.08)', title: 'Weekly Reports', desc: 'Publish and manage station activities & updates' },
                { tab: 'contact', icon: Phone, accent: '#b45309', bg: 'rgba(180,83,9,0.08)', title: 'Contact Info', desc: 'Update public emergency contact details' },
              ].map(({ tab, icon: Icon, accent, bg, title, desc }) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className="quick-action-btn group"
                >
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                    style={{ background: bg, border: `1.5px solid ${accent}22` }}>
                    <Icon size={20} style={{ color: accent }} />
                  </div>
                  <div className="min-w-0 flex-1 text-left">
                    <p className="font-bold text-sm" style={{ color: '#1c1917' }}>{title}</p>
                    <p className="text-xs mt-0.5" style={{ color: '#a8a29e' }}>{desc}</p>
                  </div>
                  <ChevronRight size={15} style={{ color: '#d1c4be' }} className="shrink-0 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}
            </div>

            {/* Footer note */}
            <div className="mt-8 pt-6 flex items-center gap-2" style={{ borderTop: '1px dashed #ede8e5' }}>
              <Flame size={13} style={{ color: '#c0392b' }} />
              <p className="text-xs" style={{ color: '#c4b5b0' }}>
                BFP Station 1 — Cogon, Cagayan de Oro City · Admin Panel v1.0
              </p>
            </div>
          </div>
        )}

        {activeTab === 'officers' && <div className="fade-up max-w-7xl mx-auto"><OfficersManager /></div>}
        {activeTab === 'reports' && <div className="fade-up max-w-7xl mx-auto"><WeeklyReportsManager /></div>}
        {activeTab === 'contact' && <div className="fade-up max-w-7xl mx-auto"><ContactManager /></div>}
      </main>

      {/* ── Logout Confirmation Modal ── */}
      {showLogoutConfirm && (
      <div className="modal-overlay">
        <div className="modal-content">
          <p className="font-bold text-lg mb-4" style={{ color: '#292524' }}>
            Are you sure you want to logout?
          </p>
          <div className="flex justify-center mt-2">
            <button className="modal-btn btn-yes" onClick={handleLogout}>Yes</button>
            <button className="modal-btn btn-no" onClick={() => setShowLogoutConfirm(false)}>No</button>
          </div>
        </div>
      </div>
    )}

    </div>   
  );
}