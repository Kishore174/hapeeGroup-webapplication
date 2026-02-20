import React, { useState, useEffect } from "react";
import { FiEye, FiEyeOff, FiMail, FiLock } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import loginicon from "../Assets/logo.jpg";
import { loginUser } from "../Api/authApi";
import { useAuth } from "../context/AuthContext";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ email: "", password: "" });

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/");
  }, [navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await loginUser({ email: form.email, password: form.password });
      const { token, user } = res.data.data;
      login(token, user);
      toast.success("Welcome back!");
      navigate("/", { replace: true });
    } catch (err) {
      console.error(err);
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f0f2f8] flex items-center justify-center p-4">
      <div className="w-full max-w-[920px] bg-white rounded-[2rem] shadow-[0_8px_50px_rgba(0,0,0,0.10)] overflow-hidden grid grid-cols-1 md:grid-cols-2 min-h-[560px]">

        {/* ── Left — Full Image ── */}
        <div className="hidden md:block relative overflow-hidden rounded-l-[2rem]">
          {/* Full cover image */}
          <img
            src={loginicon}
            alt="brand"
            className="absolute inset-0 w-full h-full object-cover object-center"
          />
          {/* Gradient overlay bottom → top */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Top badge */}
          <div className="absolute top-7 left-7">
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1.5 rounded-full">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold text-white uppercase tracking-widest">Live System</span>
            </div>
          </div>

          {/* Bottom text */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <h2 className="text-2xl font-black text-white tracking-tight leading-snug">
              Workforce<br />Management
            </h2>
            <p className="text-white/60 text-xs mt-2 leading-relaxed tracking-wide">
              Attendance · Shifts · Leaves · Analytics
            </p>

            {/* Mini stat row */}
            <div className="flex items-center gap-5 mt-5 pt-5 border-t border-white/10">
              {[
                { num: "Real-time", lbl: "Tracking" },
                { num: "Smart",    lbl: "Reports" },
                { num: "Easy",     lbl: "Approvals" },
              ].map(({ num, lbl }) => (
                <div key={lbl}>
                  <p className="text-white font-black text-sm">{num}</p>
                  <p className="text-white/50 text-[11px] mt-0.5">{lbl}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Right — Form ── */}
        <div className="flex flex-col justify-center px-9 py-12 sm:px-12">

          {/* Mobile logo */}
          <div className="flex justify-center mb-8 md:hidden">
            <img src={loginicon} alt="logo" className="h-16 w-auto object-contain rounded-2xl" />
          </div>

          {/* Heading */}
          <div className="mb-9">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-indigo-50 rounded-full mb-5">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              <span className="text-[10px] font-black text-indigo-600 uppercase tracking-[0.12em]">
                Admin Portal
              </span>
            </div>
            <h1 className="text-[1.8rem] font-black text-gray-900 tracking-tight leading-tight">
              Welcome back 👋
            </h1>
            <p className="text-sm text-gray-400 mt-2">
              Sign in to manage your team
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Email */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-[0.1em] text-gray-400 mb-2">
                Email Address
              </label>
              <div className="relative group">
                <FiMail
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors pointer-events-none"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="admin@company.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-4 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-800 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-[0.1em] text-gray-400 mb-2">
                Password
              </label>
              <div className="relative group">
                <FiLock
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300 group-focus-within:text-indigo-500 transition-colors pointer-events-none"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  required
                  className="w-full pl-10 pr-12 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-sm text-gray-800 outline-none focus:border-indigo-400 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all placeholder:text-gray-300"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-7 h-7 flex items-center justify-center rounded-lg text-gray-300 hover:bg-gray-100 hover:text-gray-600 transition-all"
                >
                  {showPassword ? <FiEyeOff size={14} /> : <FiEye size={14} />}
                </button>
              </div>
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-1 bg-indigo-600 hover:bg-indigo-700 active:scale-[0.985] text-white text-sm font-black tracking-wide rounded-2xl shadow-lg shadow-indigo-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Signing in…
                </>
              ) : (
                "Sign In →"
              )}
            </button>
          </form>

          {/* Footer */}
          <p className="text-center text-[11px] text-gray-300 mt-9 leading-relaxed">
            Restricted to authorized personnel only
            <br />
            <span className="hover:text-indigo-400 cursor-pointer transition-colors">
              Contact IT for account access
            </span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;