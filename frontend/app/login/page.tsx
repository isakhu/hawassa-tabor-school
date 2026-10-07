"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { post } from "@/lib/api";
import { saveToken, saveUser, dashboardForRole } from "@/lib/auth";
import { ROLES } from "@/lib/constants";
import { User, Lock, EyeOff, Moon, ArrowRight, Check } from "lucide-react";
import logoImg from "../../public/logo.jpg";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full bg-[#eaf0f8] shadow-[inset_4px_4px_8px_#c4d0df,inset_-4px_-4px_8px_#ffffff] rounded-full py-4 pl-14 pr-12 text-sm font-semibold text-[#111827] placeholder:text-slate-400 focus:outline-none transition-all"
              />
              <button type="button" className="absolute inset-y-0 right-0 pr-5 flex items-center">
                <EyeOff size={18} className="text-slate-400" />
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

        {/* Social Logins */}
        <div className="w-full mt-10 flex flex-col items-center">
          <div className="flex items-center w-full gap-4 mb-6 px-4">
            <div className="h-[1px] flex-1 bg-slate-300"></div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Or Continue With</span>
            <div className="h-[1px] flex-1 bg-slate-300"></div>
          </div>

          <div className="flex items-center gap-6">
            <button className="w-14 h-14 rounded-2xl bg-[#eaf0f8] shadow-[5px_5px_10px_#c4d0df,-5px_-5px_10px_#ffffff] flex items-center justify-center hover:shadow-[inset_2px_2px_5px_#c4d0df,inset_-2px_-2px_5px_#ffffff] transition-all text-xl font-bold">
              {/* Google G using colored text for simplicity */}
              <span className="text-transparent bg-clip-text bg-gradient-to-br from-red-500 via-yellow-500 to-green-500">G</span>
            </button>
            <button className="w-14 h-14 rounded-2xl bg-[#eaf0f8] shadow-[5px_5px_10px_#c4d0df,-5px_-5px_10px_#ffffff] flex items-center justify-center hover:shadow-[inset_2px_2px_5px_#c4d0df,inset_-2px_-2px_5px_#ffffff] transition-all">
              {/* Discord simple SVG */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#5865F2"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.05.05 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z"/></svg>
            </button>
            <button className="w-14 h-14 rounded-2xl bg-[#eaf0f8] shadow-[5px_5px_10px_#c4d0df,-5px_-5px_10px_#ffffff] flex items-center justify-center hover:shadow-[inset_2px_2px_5px_#c4d0df,inset_-2px_-2px_5px_#ffffff] transition-all">
              {/* Facebook simple SVG */}
              <svg width="24" height="24" viewBox="0 0 24 24" fill="#1877F2"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </button>
          </div>
        </div>

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
