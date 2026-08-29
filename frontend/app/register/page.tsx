"use client";

import Link from "next/link";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#f4f8fc] px-5 py-8 text-[#10243e] sm:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-3xl items-center justify-center">
        <div className="w-full max-w-lg rounded-[24px] border border-[#d8e3ef] bg-white p-7 text-center shadow-[0_24px_70px_rgba(20,52,90,0.10)] sm:p-10">
          <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1267e8] text-white shadow-[0_10px_24px_rgba(18,103,232,0.22)]" aria-hidden="true">
            <svg width="27" height="27" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" />
              <path d="M6 10.5v5L12 19l6-3.5v-5" />
            </svg>
          </div>

          <h1 className="text-3xl font-extrabold leading-tight tracking-tight text-[#0b1f3a] sm:text-4xl">
            Hawassa Tabor Primary and Secondary School
          </h1>

          <div className="mx-auto mt-8 max-w-md rounded-2xl border border-[#dbe5f0] bg-[#f7fafe] p-6">
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#eaf2ff] text-[#1267e8]">
              <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <rect x="4" y="10" width="16" height="10" rx="2" />
                <path d="M8 10V7a4 4 0 0 1 8 0v3" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-[#0b1f3a]">Sign Up</h2>
            <p className="mt-3 text-sm leading-6 text-[#71849a]">
              New accounts are created by the school administrator.
            </p>
            <p className="mt-2 text-sm leading-6 text-[#71849a]">
              Please contact the administrator to receive your login credentials.
            </p>
          </div>

          <Link href="/login" className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-[#1267e8] px-4 py-3.5 text-sm font-bold text-white shadow-[0_8px_18px_rgba(18,103,232,0.18)] transition hover:bg-[#0f56c7]">
            Back to Log In
          </Link>
        </div>
      </div>
    </main>
  );
}
