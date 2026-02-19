import { useState } from "react";
import { useNavigate } from "react-router";
import { getAdminPassword } from "../../utils/storage";
import { toast } from "sonner";

// PUBLIC images
import bgFire from "/Fire.jpg";
import Logo from "/BFP.jpg";
import { Eye, EyeOff } from "lucide-react";

export function AdminLogin() {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    const adminPassword = getAdminPassword();

    if (password === adminPassword) {
      sessionStorage.setItem("admin_logged_in", "true");
      toast.success("Login successful!");
      navigate("/admin/dashboard");
    } else {
      toast.error("Invalid password");
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center px-4 overflow-hidden">
      {/* ===== BACKGROUND IMAGE ===== */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgFire})` }}
      />

      {/* ===== DARK OVERLAY ===== */}
      <div className="absolute inset-0 bg-black/70" />

      {/* ===== CONTENT ===== */}
      <div className="relative z-10 w-full max-w-md">
        {/* ===== TOP LOGO ===== */}
        <div className="text-center mb-8">
          <div className="w-36 h-36 bg-white rounded-full flex items-center justify-center mx-auto border border-white/40 shadow-lg p-3">
            <img
              src={Logo}
              alt="BFP Logo"
              className="w-32 h-32 object-cover rounded-full scale-110"
            />
          </div>
        </div>

        {/* ===== GLASS LOGIN CARD ===== */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl p-8">
          {/* TEXT */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white">Admin Portal</h1>
            <p className="text-orange-200 text-sm mt-1">
              BFP Station 1 Cogon – Management System
            </p>
          </div>

          {/* FORM */}
          <form onSubmit={handleLogin} className="space-y-6 relative">
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
                className="w-full px-4 py-3 rounded-lg bg-white/80 focus:bg-white outline-none text-gray-900 placeholder-gray-500"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-700 hover:text-gray-900"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-lg font-semibold text-white bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 transition shadow-lg"
            >
              Login
            </button>
          </form>

          {/* INFO */}
          <div className="mt-6 text-center text-xs text-gray-200">
            Default password:{" "}
            <span className="font-mono font-semibold">admin123</span>
          </div>
        </div>

        {/* BACK */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/")}
            className="text-white/80 hover:text-white text-sm font-semibold"
          >
            ← Back to Public Site
          </button>
        </div>
      </div>
    </div>
  );
}
