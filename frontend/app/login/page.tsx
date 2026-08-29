"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { API_BASE_URL } from "@/lib/constants";
import { saveToken, saveUser, dashboardForRole } from "@/lib/auth";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#f4f8fc] px-5 py-8 text-[#10243e] sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center justify-center">
        <div className="w-full max-w-lg rounded-[24px] border border-[#d8e3ef] bg-white p-7 shadow-[0_24px_70px_rgba(20,52,90,0.10)] sm:p-10">
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1267e8] text-white shadow-[0_10px_24px_rgba(18,103,232,0.22)]" aria-hidden="true">
              <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" />
                <path d="M6 10.5v5L12 19l6-3.5v-5" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-[#0b1f3a] sm:text-4xl">
              Hawassa Tabor Primary and Secondary School
            </h1>
          </div>

          <LoginContent />
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
    <div className="mt-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="username" className="mb-2 block text-sm font-semibold text-[#27415e]">Username</label>
          <input id="username" type="text" placeholder="Enter username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" className="input-glow w-full rounded-xl border border-[#cfdae7] bg-white px-4 py-3.5 text-sm text-[#10243e] placeholder:text-[#9aaabc] outline-none" />
        </div>
        <div>
          <label htmlFor="password" className="mb-2 block text-sm font-semibold text-[#27415e]">Password</label>
          <input id="password" type="password" placeholder="Numbers only" value={password} onChange={(e) => setPassword(e.target.value.replace(/\D/g, ""))} inputMode="numeric" autoComplete="current-password" className="input-glow w-full rounded-xl border border-[#cfdae7] bg-white px-4 py-3.5 text-sm text-[#10243e] placeholder:text-[#9aaabc] outline-none" />
        </div>
        <button type="submit" disabled={loading} className="shimmer-btn w-full rounded-xl px-4 py-3.5 text-sm font-bold">
          {loading ? "Signing in…" : "Log In"}
        </button>
      </form>

      {error && <div role="alert" className="mt-4 rounded-xl border border-[#f3c9c9] bg-[#fff6f6] px-4 py-3 text-sm font-medium text-[#b63c3c]">{error}</div>}

      <div className="mt-7 border-t border-[#e3eaf2] pt-6 text-center">
        <p className="mb-3 text-sm text-[#71849a]">New user?</p>
        <Link href="/register" className="inline-flex w-full items-center justify-center rounded-xl border border-[#1267e8] bg-white px-4 py-3.5 text-sm font-bold text-[#1267e8] transition hover:bg-[#eaf2ff]">
          Sign Up
        </Link>
      </div>
    </div>
  );
}
