"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/constants";
import { saveToken, saveUser, dashboardForRole } from "@/lib/auth";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#f6f9fd] px-5 py-8 text-[#10243e] sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[28px] border border-[#dbe5f0] bg-white shadow-[0_24px_80px_rgba(20,52,90,0.10)] lg:grid-cols-[0.9fr_1.1fr]">
          <div className="hidden bg-[#0b1f3a] p-10 text-white lg:flex lg:flex-col lg:justify-between">
            <div>
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1267e8] shadow-[0_10px_24px_rgba(18,103,232,0.25)]">
                <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" />
                  <path d="M6 10.5v5L12 19l6-3.5v-5" />
                </svg>
              </div>
              <p className="mt-7 text-xs font-bold uppercase tracking-[0.18em] text-[#9fc7ff]">School portal</p>
              <h2 className="mt-3 text-3xl font-extrabold tracking-tight">Hawassa Tabor</h2>
              <p className="mt-4 max-w-sm text-sm leading-6 text-[#c8d8e9]">
                Use your school account to access the areas available to your role.
              </p>
            </div>
            <p className="text-xs text-[#91a9c2]">Hawassa Tabor Primary and Secondary School</p>
          </div>

          <div className="p-7 sm:p-10">
            <div className="mb-8 lg:hidden">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#1267e8] text-white shadow-[0_10px_24px_rgba(18,103,232,0.20)]">
                <svg width="25" height="25" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                  <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" />
                  <path d="M6 10.5v5L12 19l6-3.5v-5" />
                </svg>
              </div>
            </div>

            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#1267e8]">Sign in</p>
              <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[#0b1f3a]">School account</h1>
              <p className="mt-2 text-sm leading-6 text-[#71849a]">Enter the email and password assigned to your account.</p>
            </div>

            <LoginContent />
          </div>
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
    if (!username.trim()) return setError("Enter your email address.");
    if (!/^\d+$/.test(password)) return setError("Password must contain numbers only.");

    setLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login_id: username.trim(), password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(typeof data?.detail === "string" ? data.detail : "Invalid email or password.");
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
    <div className="mt-8">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="username" className="mb-2 block text-sm font-semibold text-[#27415e]">Email</label>
          <input id="username" type="email" placeholder="name@school.edu" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" className="input-glow w-full rounded-xl border border-[#cfdae7] bg-white px-4 py-3.5 text-sm text-[#10243e] placeholder:text-[#9aaabc] outline-none" />
        </div>
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[#27415e]">Password</label>
          <input id="password" type="password" placeholder="Enter password" value={password} onChange={(e) => setPassword(e.target.value.replace(/\D/g, ""))} inputMode="numeric" autoComplete="current-password" className="input-glow w-full rounded-xl border border-[#cfdae7] bg-white px-4 py-3.5 text-sm text-[#10243e] placeholder:text-[#9aaabc] outline-none" />
        </div>
        <button type="submit" disabled={loading} className="shimmer-btn w-full rounded-xl px-4 py-3.5 text-sm font-bold">
          {loading ? "Signing in…" : "Sign in"}
        </button>
      </form>

      {error && (
        <div role="alert" className="mt-4 rounded-xl border border-[#f3c9c9] bg-[#fff6f6] px-4 py-3 text-sm font-medium text-[#b63c3c]">
          {error}
        </div>
      )}

      <div className="mt-7 flex items-center justify-between border-t border-[#e3eaf2] pt-6">
        <p className="text-xs leading-5 text-[#7a8ca1]">Accounts are created by the school administrator.</p>
        <Link href="/" className="text-sm font-semibold text-[#1267e8] hover:text-[#0f56c7]">Back</Link>
      </div>
    </div>
  );
}
