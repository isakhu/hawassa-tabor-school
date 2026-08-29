"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/constants";
import { saveToken, saveUser, dashboardForRole } from "@/lib/auth";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#f6f9fd] px-5 py-8 text-[#10243e] sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[26px] border border-[#d9e4ef] bg-white shadow-[0_24px_70px_rgba(20,52,90,0.10)] lg:grid-cols-[1fr_0.9fr]">
          <section className="relative hidden overflow-hidden bg-[#0b1f3a] p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div className="absolute right-[-70px] top-[-80px] h-64 w-64 rounded-full bg-[#1267e8] opacity-25 blur-3xl" />
            <div className="absolute bottom-[-80px] left-[-80px] h-64 w-64 rounded-full bg-[#3183ef] opacity-15 blur-3xl" />
            <div className="relative">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1267e8]">
                  <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" />
                    <path d="M6 10.5v5L12 19l6-3.5v-5" />
                  </svg>
                </div>
                <div>
                  <p className="font-bold tracking-tight">TABOR</p>
                  <p className="text-[10px] uppercase tracking-[0.18em] text-[#9fb9d5]">School Management</p>
                </div>
              </div>

              <div className="mt-16 max-w-md">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#9fc7ff]">Secure access</p>
                <h1 className="mt-4 text-4xl font-extrabold leading-tight">Manage learning with confidence.</h1>
                <p className="mt-5 text-base leading-7 text-[#c9d8e8]">
                  Access students, teachers, classes, attendance and academic results from one organized system.
                </p>
              </div>
            </div>

            <div className="relative grid grid-cols-3 gap-3">
              {[["9–12", "Grades"], ["1,500+", "Students"], ["70+", "Teachers"]].map(([value, label]) => (
                <div key={label} className="rounded-xl border border-white/10 bg-white/5 px-3 py-3">
                  <p className="text-lg font-bold">{value}</p>
                  <p className="mt-1 text-[11px] text-[#a9bfd6]">{label}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="flex flex-col justify-center p-7 sm:p-10">
            <div className="mx-auto w-full max-w-md">
              <div className="mb-8 lg:hidden">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1267e8] text-white">
                    <svg width="23" height="23" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" />
                      <path d="M6 10.5v5L12 19l6-3.5v-5" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-bold tracking-tight text-[#0b1f3a]">TABOR</p>
                    <p className="text-[10px] uppercase tracking-[0.18em] text-[#71849a]">School Management</p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <p className="text-sm font-semibold text-[#1267e8]">Welcome back</p>
                <h2 className="mt-2 text-3xl font-bold tracking-tight text-[#0b1f3a]">Sign in to Tabor</h2>
                <p className="mt-2 text-sm leading-6 text-[#71849a]">Use your school account to continue.</p>
              </div>

              <Suspense fallback={<div className="py-12 text-center text-sm font-medium text-[#71849a]">Connecting to Tabor…</div>}>
                <LoginContent />
              </Suspense>

              <p className="mt-8 border-t border-[#e3eaf2] pt-5 text-center text-xs leading-5 text-[#8193a7]">
                Don't have an account? <span className="font-semibold text-[#1267e8]">Contact Admin</span>
              </p>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function LoginContent() {
  const router = useRouter();
  useSearchParams();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (API_BASE_URL) fetch(`${API_BASE_URL.replace("/api/v1", "")}/health`).catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!username.trim()) {
      setError("Please enter your username.");
      return;
    }
    if (!/^\d+$/.test(password)) {
      setError("Password must contain numbers only.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login_id: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(typeof data?.detail === "string" ? data.detail : "Invalid username or password.");
      saveToken(data.access_token);
      saveUser(data.user);
      router.push(dashboardForRole(data.user.role));
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const isInvalid = !username.trim() || password === "" || !/^\d+$/.test(password);

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="mb-2 block text-sm font-semibold text-[#27415e]">Username</label>
          <input id="username" type="text" placeholder="Enter your username" value={username} autoComplete="username" onChange={(e) => setUsername(e.target.value)} className="input-glow w-full rounded-xl border border-[#cfdae7] bg-white px-4 py-3.5 text-sm text-[#10243e] placeholder:text-[#9aaabc]" />
        </div>
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[#27415e]">Password</label>
          <input id="password" type="password" placeholder="Numbers only" value={password} autoComplete="current-password" inputMode="numeric" pattern="[0-9]*" onChange={(e) => setPassword(e.target.value.replace(/\D/g, ""))} className="input-glow w-full rounded-xl border border-[#cfdae7] bg-white px-4 py-3.5 text-sm text-[#10243e] placeholder:text-[#9aaabc]" />
          <p className="mt-2 text-[11px] text-[#8193a7]">Your password can contain numbers only.</p>
        </div>
        <button type="submit" disabled={isInvalid || loading} className="shimmer-btn mt-2 w-full rounded-xl px-4 py-3.5 text-sm font-bold">{loading ? "Signing in…" : "Sign in"}</button>
      </form>

      {error && <div role="alert" className="mt-4 rounded-xl border border-[#f3c9c9] bg-[#fff6f6] px-4 py-3 text-sm font-medium text-[#b63c3c]">{error}</div>}

      <div className="my-6 flex items-center gap-3 text-xs font-semibold text-[#a0afbf]"><div className="h-px flex-1 bg-[#e1e8f0]" /><span>OR</span><div className="h-px flex-1 bg-[#e1e8f0]" /></div>
      <button type="button" onClick={toggleMusic} className="mx-auto flex items-center gap-2 rounded-full border border-[#cfe0f7] bg-[#f6f9fd] px-4 py-2 text-xs font-semibold text-[#1267e8] transition hover:bg-[#eaf2ff]"><span aria-hidden="true">{isPlaying ? "🔊" : "🔈"}</span>{isPlaying ? "Pause Tabor Anthem" : "Play Tabor Anthem"}</button>
      <audio ref={audioRef} src="/tabor-anthem.mp3" loop />
    </>
  );
}
