import Link from "next/link";

export default function HomePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 text-white">
      {/* Background mesh blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="animate-blob-1 absolute -left-32 -top-32 h-96 w-96 rounded-full opacity-30 blur-3xl"
          style={{ background: "var(--primary)" }}
        />
        <div
          className="animate-blob-2 absolute -bottom-32 -right-32 h-96 w-96 rounded-full opacity-30 blur-3xl"
          style={{ background: "var(--violet)" }}
        />
        <div
          className="animate-blob-3 absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl"
          style={{ background: "var(--pink)" }}
        />
      </div>

      {/* Content card */}
      <div className="glass-card animate-page-in relative z-10 flex max-w-lg flex-col items-center gap-6 px-10 py-14 text-center">
        <h1
          className="gradient-text text-5xl font-bold tracking-tight"
          style={{ fontFamily: "var(--font-heading)" }}
        >
          TABOR
        </h1>

        <p className="text-xs uppercase tracking-widest" style={{ color: "var(--text-muted)" }}>
          Grades 9-12 • 1500 Students • 70 Teachers
        </p>

        <p className="text-base leading-relaxed" style={{ color: "var(--text-muted)" }}>
          The future of school management. Manage students, teachers, classes,
          attendance, and grades — all in one platform.
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/login"
            className="shimmer-btn rounded-xl px-8 py-3 font-semibold text-white shadow-lg"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="input-glow rounded-xl border px-8 py-3 font-semibold"
            style={{ borderColor: "var(--border)", color: "var(--text)" }}
          >
            Register
          </Link>
        </div>
      </div>

      <p
        className="animate-item-in relative z-10 mt-8 text-xs uppercase tracking-widest"
        style={{ color: "var(--text-muted)" }}
      >
        Tabor School
      </p>
    </main>
  );
}