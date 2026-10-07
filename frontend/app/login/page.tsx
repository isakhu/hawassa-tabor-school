"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { post } from "@/lib/api";
import { saveToken, saveUser, dashboardForRole } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { User, Lock, Eye, EyeOff, Moon, ArrowRight, Check } from "lucide-react";
import logoImg from "../../public/logo.jpg";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!username.trim()) return setError("Enter your email address.");
    if (!password) return setError("Enter your password.");

    setLoading(true);
    try {
      let data;
      try {
        data = await post<any>("/auth/login", {
          login_id: username.trim(),
          password,
        });
      } catch (err: unknown) {
        throw err;
      }

      if (!data?.access_token || !data?.user) {
        throw new Error("The server returned an invalid login response.");
      }

      saveToken(data.access_token);
      saveUser(data.user);
      router.push(dashboardForRole(data.user.role));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#eaf0f8] flex items-center justify-center relative overflow-hidden font-sans">
      
      {/* Background Decorative Elements */}
      <div className="absolute -top-32 -left-32 w-[400px] h-[400px] rounded-full border-[1.5px] border-white/50 opacity-50 shadow-[inset_10px_10px_30px_#c4d0df,inset_-10px_-10px_30px_#ffffff]"></div>
      <div className="absolute top-20 -left-20 w-48 h-48 rounded-full border-2 border-white/40 shadow-[8px_8px_16px_#c4d0df,-8px_-8px_16px_#ffffff]"></div>
      <div className="absolute top-40 right-10 w-32 h-32 rounded-full border border-white/30 shadow-[8px_8px_16px_#c4d0df,-8px_-8px_16px_#ffffff]"></div>
      <div className="absolute -bottom-40 -left-20 w-[500px] h-[500px] rounded-full border border-white/30 shadow-[inset_10px_10px_30px_#c4d0df,inset_-10px_-10px_30px_#ffffff]"></div>

      {/* Dark Mode Toggle */}
      <div className="absolute top-8 right-8 w-12 h-12 rounded-2xl flex items-center justify-center bg-[#eaf0f8] shadow-[5px_5px_10px_#c4d0df,-5px_-5px_10px_#ffffff] cursor-pointer text-[#10243e]">
        <Moon size={20} className="fill-current" />
      </div>

      <div className="w-full max-w-sm px-6 py-12 relative z-10 flex flex-col items-center">
        
        {/* Logo */}
        <div className="w-32 h-32 rounded-[2rem] shadow-[10px_10px_20px_#c4d0df,-10px_-10px_20px_#ffffff] flex items-center justify-center mb-8 overflow-hidden bg-black relative">
          <img src={logoImg.src} alt="Hawassa Tabor School Logo" className="absolute inset-0 w-full h-full object-contain scale-[1.15]" />
        </div>

        {/* Text */}
        <h1 className="text-3xl font-extrabold text-[#111827] mb-2 tracking-tight">Welcome Back</h1>
        <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-[0.2em] mb-10">
          Sign in to continue
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-6">
          
          {/* Inputs */}
          <div className="space-y-5">
            {/* Username Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <User size={18} className="text-[#3b82f6]" />
              </div>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username or Email"
                className="w-full bg-[#eaf0f8] shadow-[inset_4px_4px_8px_#c4d0df,inset_-4px_-4px_8px_#ffffff] rounded-full py-4 pl-14 pr-6 text-sm font-semibold text-[#111827] placeholder:text-slate-400 focus:outline-none transition-all"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
                <Lock size={18} className="text-slate-400" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-[#eaf0f8] shadow-[inset_4px_4px_8px_#c4d0df,inset_-4px_-4px_8px_#ffffff] rounded-full py-4 pl-14 pr-12 text-sm font-semibold text-[#111827] placeholder:text-slate-400 focus:outline-none transition-all"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-5 flex items-center cursor-pointer hover:opacity-80 transition-opacity"
              >
                {showPassword ? <Eye size={18} className="text-slate-400" /> : <EyeOff size={18} className="text-slate-400" />}
              </button>
            </div>
          </div>

          {/* Options */}
          <div className="flex items-center justify-between px-2 pt-1 pb-2">
            <label className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-5 h-5 rounded flex items-center justify-center transition-colors ${
                rememberMe ? "bg-[#3b82f6] shadow-sm" : "bg-[#eaf0f8] shadow-[inset_2px_2px_4px_#c4d0df,inset_-2px_-2px_4px_#ffffff]"
              }`} onClick={() => setRememberMe(!rememberMe)}>
                {rememberMe && <Check size={14} className="text-white" strokeWidth={3} />}
              </div>
              <span className="text-[13px] font-semibold text-slate-600">Remember Me</span>
            </label>
            <Link href="#" className="text-[13px] font-bold text-[#3b82f6] hover:text-blue-700">
              Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="relative w-full h-14 bg-gradient-to-r from-[#4f8eff] to-[#2463eb] rounded-full shadow-[0_10px_25px_rgba(59,130,246,0.4)] flex items-center justify-center text-white font-bold text-lg hover:shadow-[0_15px_30px_rgba(59,130,246,0.5)] transition-all group disabled:opacity-70"
          >
            {loading ? "Signing in..." : "Login"}
            <div className="absolute right-2 top-2 bottom-2 w-10 bg-white/20 rounded-full flex items-center justify-center group-hover:bg-white/30 transition-colors">
              <ArrowRight size={20} className="text-white" />
            </div>
          </button>
        </form>

        {error && (
          <div className="mt-4 w-full bg-red-50 text-red-600 font-semibold text-sm px-4 py-3 rounded-xl border border-red-100 text-center shadow-[inset_2px_2px_4px_#fca5a5,inset_-2px_-2px_4px_#ffffff]">
            {error}
          </div>
        )}



        {/* Footer text */}
        <div className="mt-12 text-[9px] font-bold text-slate-400 tracking-[0.3em] uppercase">
          Play • Compete • Grow Together
        </div>

      </div>

      {/* "MORE THAN A GAME" Text - bottom right */}
      <div className="absolute bottom-8 right-8 text-[9px] font-bold text-slate-400 tracking-widest leading-relaxed">
        MORE<br/>THAN<br/>A GAME<br/><span className="text-xl">_</span>
      </div>

    </main>
  );
}
