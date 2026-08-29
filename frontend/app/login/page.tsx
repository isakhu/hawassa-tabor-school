"use client";

import { useState, Suspense } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/constants";
import { saveToken, saveUser, dashboardForRole } from "@/lib/auth";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#f4f8fc] px-5 py-8 text-[#10243e] sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[24px] border border-[#d8e3ef] bg-white shadow-[0_24px_70px_rgba(20,52,90,0.10)] lg:grid-cols-[0.9fr_1.1fr]">
          <section className="hidden min-h-[620px] items-center justify-center bg-[#0b1f3a] p-10 text-white lg:flex">
            <div className="max-w-md text-center">
              <div className="mx-auto mb-7 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#1267e8] shadow-[0_12px_30px_rgba(18,103,232,0.30)]">
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" />
                  <path d="M6 10.5v5L12 19l6-3.5v-5" />
                </svg>
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight">Hawassa Tabor</h1>
              <p className="mt-2 text-lg font-medium text-[#c9d8e8]">Primary and Secondary School</p>
            </div>
          </section>

          <section className="flex min-h-[620px] items-center justify-center p-7 sm:p-10">
            <div className="w-full max-w-md text-center">
              <div className="mb-8 lg:hidden">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1267e8] text-white shadow-[0_10px_24px_rgba(18,103,232,0.22)]">
                  <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" />
                    <path d="M6 10.5v5L12 19l6-3.5v-5" />
                  </svg>
                </div>
              </div>

              <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-[#0b1f3a] sm:text-4xl">
                Hawassa Tabor Primary and Secondary School
              </h1>
              <p className="mx-auto mt-3 max-w-sm text-sm text-[#71849a]">School Management System</p>

              <Suspense fallback={<div className="py-10 text-sm text-[#71849a]">Loading…</div>}>
                <LoginContent />
              </Suspense>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}

function LoginContent() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!username.trim()) return setError("Please enter your username.");
    if (!/^\d+$/.test(password)) return setError("Password must contain numbers only.");

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
      setError(err instanceof Error ? err.message : "Unable to sign in. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="mt-9 grid gap-3 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#dbe5f0] bg-[#f7fafe] p-4 text-left">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8092a6]">Log In</p>
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div>
              <label htmlFor="username" className="mb-1.5 block text-xs font-semibold text-[#27415e]">Username</label>
              <input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" className="input-glow w-full rounded-xl border border-[#cfdae7] bg-white px-3.5 py-3 text-sm text-[#10243e] outline-none" />
            </div>
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs font-semibold text-[#27415e]">Password</label>
              <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value.replace(/\D/g, ""))} inputMode="numeric" autoComplete="current-password" className="input-glow w-full rounded-xl border border-[#cfdae7] bg-white px-3.5 py-3 text-sm text-[#10243e] outline-none" />
            </div>
            <button type="submit" disabled={loading} className="shimmer-btn w-full rounded-xl px-4 py-3 text-sm font-bold">
              {loading ? "Signing in…" : "Log In"}
            </button>
          </form>
        </div>

        <div className="flex flex-col rounded-2xl border border-[#dbe5f0] bg-white p-4 text-left">
          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#8092a6]">New User</p>
          <div className="flex flex-1 flex-col justify-center py-6">
            <p className="text-sm leading-6 text-[#71849a]">Create your school account to access the system.</p>
            <Link href="/register" className="mt-5 inline-flex items-center justify-center rounded-xl border border-[#1267e8] bg-white px-4 py-3 text-sm font-bold text-[#1267e8] transition hover:bg-[#eaf2ff]">
              Sign Up
            </Link>
          </div>
        </div>
      </div>

      {error && <div role="alert" className="mt-4 rounded-xl border border-[#f3c9c9] bg-[#fff6f6] px-4 py-3 text-left text-sm font-medium text-[#b63c3c]">{error}</div>}
    </>
  );
}
