import { useState } from "react";
import { useNavigate } from "react-router";
import { toast } from "sonner";
import bgFire from "/Fire.jpg";
import Logo from "/BFP.jpg";
import { Eye, EyeOff, Shield, AlertTriangle, Info, Lock, ArrowLeft, Flame } from "lucide-react";

const DEFAULT_ADMIN_PASSWORD = "bfpcogon1234";
const getStoredPassword = () => localStorage.getItem("bfp_admin_password") || DEFAULT_ADMIN_PASSWORD;

export function AdminLogin() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    await new Promise(r => setTimeout(r, 600)); // brief UX delay
    const adminPassword = getStoredPassword();
    if (password === adminPassword) {
      sessionStorage.setItem("admin_logged_in", "true");
      toast.success("Access granted. Welcome back.");
      navigate("/admin/dashboard");
    } else {
      toast.error("Incorrect password. Access denied.");
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', fontFamily: "'DM Sans', sans-serif",
      position: 'relative', overflow: 'hidden',
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,600;9..40,700;9..40,800&display=swap');
        * { box-sizing: border-box; }

        @keyframes al-fadeUp { from{opacity:0;transform:translateY(22px);} to{opacity:1;transform:translateY(0);} }
        @keyframes al-fadeIn { from{opacity:0;} to{opacity:1;} }
        @keyframes al-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(192,57,43,0.35);} 50%{box-shadow:0 0 0 8px rgba(192,57,43,0);} }
        @keyframes al-spin { to{transform:rotate(360deg);} }

        .al-card { animation: al-fadeUp 0.75s ease 0.1s both; }
        .al-note { animation: al-fadeUp 0.75s ease 0.28s both; }

        .al-input {
          width: 100%; padding: 13px 48px 13px 16px;
          border-radius: 10px; border: 1.5px solid #d4ccc6;
          background: white; color: #1a1714;
          font-size: 14px; font-family: inherit;
          outline: none; transition: border-color 0.2s, box-shadow 0.2s;
        }
        .al-input:focus { border-color: #c0392b; box-shadow: 0 0 0 3px rgba(192,57,43,0.1); }
        .al-input::placeholder { color: #b0aaa6; }

        .al-btn-submit {
          width: 100%; padding: 13px;
          border-radius: 10px; border: none; cursor: pointer;
          background: linear-gradient(135deg, #a61f12, #c0392b, #d94e1f);
          color: white; font-size: 14px; font-weight: 700;
          font-family: inherit; letter-spacing: 0.04em;
          transition: all 0.22s;
          box-shadow: 0 6px 20px rgba(192,57,43,0.35);
        }
        .al-btn-submit:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 28px rgba(192,57,43,0.45);
        }
        .al-btn-submit:disabled { opacity: 0.75; cursor: not-allowed; transform: none; }

        .al-spinner {
          width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.4);
          border-top-color: white; border-radius: 50%;
          animation: al-spin 0.7s linear infinite;
          display: inline-block;
        }

        .al-back-btn {
          display: inline-flex; align-items: center; gap: 6px;
          color: rgba(255,255,255,0.65); font-size: 13px; font-weight: 600;
          background: none; border: none; cursor: pointer;
          padding: 0; transition: color 0.2s; font-family: inherit;
        }
        .al-back-btn:hover { color: white; }

        .al-note-item {
          display: flex; align-items: flex-start; gap: 10px;
          padding: 10px 0;
          border-bottom: 1px solid rgba(192,57,43,0.1);
        }
        .al-note-item:last-child { border-bottom: none; padding-bottom: 0; }
      `}</style>

      {/* ── BACKGROUND ── */}
      <div style={{ position: 'absolute', inset: 0 }}>
        <img src={bgFire} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(5,1,1,0.92) 0%, rgba(10,3,2,0.85) 50%, rgba(20,5,3,0.9) 100%)' }} />
        {/* Subtle diagonal lines */}
        <div style={{ position: 'absolute', inset: 0, opacity: 0.04, backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.8) 0px, rgba(255,255,255,0.8) 1px, transparent 1px, transparent 32px)' }} />
      </div>

      {/* Left red accent bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: 'linear-gradient(to bottom, #c0392b, #e67e22 60%, transparent)', zIndex: 10 }} />

      {/* ── CONTENT ── */}
      <div style={{
        position: 'relative', zIndex: 10,
        width: '100%', maxWidth: 480,
        margin: '0 auto', padding: '3rem 2rem',
        display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: 20,
      }}>

        {/* Logo + header */}
        <div className="al-card" style={{ textAlign: 'center', marginBottom: 4 }}>
          <div style={{
            width: 88, height: 88, borderRadius: '50%', margin: '0 auto 16px',
            border: '3px solid rgba(255,255,255,0.2)',
            boxShadow: '0 0 0 6px rgba(192,57,43,0.2), 0 12px 40px rgba(0,0,0,0.5)',
            overflow: 'hidden', background: 'white',
            animation: 'al-pulse 3s ease-in-out infinite',
          }}>
            <img src={Logo} alt="BFP Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, marginBottom: 6 }}>
            <Flame size={14} style={{ color: '#e67e22' }} />
            <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.22em', color: 'rgba(255,255,255,0.5)' }}>
              Bureau of Fire Protection
            </span>
          </div>
          <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '2.2rem', letterSpacing: '0.08em', color: 'white', margin: '0 0 4px' }}>
            Admin Portal
          </h1>
          <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.45)', margin: 0, fontWeight: 500 }}>
            BFP Station 1 Cogon — Management System
          </p>
        </div>

        {/* ─── IMPORTANT NOTE PANEL ─── */}
        <div className="al-note" style={{
          background: 'rgba(192,57,43,0.1)',
          border: '1px solid rgba(192,57,43,0.3)',
          borderRadius: 14, padding: '18px 20px',
          backdropFilter: 'blur(12px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(192,57,43,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <AlertTriangle size={14} style={{ color: '#e67e22' }} />
            </div>
            <p style={{ fontSize: 11, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.18em', color: '#e67e22', margin: 0 }}>
              Important Notice
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {[
              { icon: <Shield size={13} />, text: 'This portal is exclusively for authorized BFP Station 1 Cogon personnel only. Unauthorized access is strictly prohibited.' },
              { icon: <Lock size={13} />, text: 'All actions performed in this system are logged and may be reviewed by station administrators.' },
                ].map(({ icon, text }, i) => (
              <div key={i} className="al-note-item">
                <div style={{ color: '#e67e22', flexShrink: 0, marginTop: 1 }}>{icon}</div>
                <p style={{ fontSize: 12.5, lineHeight: 1.65, color: 'rgba(255,255,255,0.65)', margin: 0 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── LOGIN CARD ─── */}
        <div className="al-card" style={{
          background: 'rgba(255,255,255,0.06)',
          border: '1px solid rgba(255,255,255,0.12)',
          backdropFilter: 'blur(20px)',
          borderRadius: 18, padding: '28px 28px 24px',
        }}>
          {/* Top accent */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: 'linear-gradient(90deg, #8b1a0e, #c0392b, #e67e22)', borderRadius: '18px 18px 0 0', display: 'none' }} />

          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.14em', color: 'rgba(255,255,255,0.55)', marginBottom: 8 }}>
                Admin Password
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="al-input"
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#8a827e', padding: 0, display: 'flex' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading || !password} className="al-btn-submit">
              {loading ? (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  <span className="al-spinner" />
                  Verifying...
                </span>
              ) : (
                <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7 }}>
                  <Lock size={14} /> Sign In to Admin Portal
                </span>
              )}
            </button>
          </form>

          <div style={{ marginTop: 18, padding: '12px 14px', background: 'rgba(255,255,255,0.04)', borderRadius: 9, border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Info size={13} style={{ color: 'rgba(255,255,255,0.35)', flexShrink: 0 }} />
            <p style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.35)', margin: 0, fontWeight: 500 }}>
              Default: <span style={{ fontFamily: 'monospace', fontWeight: 700, color: 'rgba(255,255,255,0.55)', letterSpacing: '0.05em' }}></span>
            </p>
          </div>
        </div>

        {/* Back link */}
        <div style={{ textAlign: 'center' }}>
          <button onClick={() => navigate("/")} className="al-back-btn">
            <ArrowLeft size={14} /> Back to Public Site
          </button>
        </div>
      </div>
    </div>
  );
}