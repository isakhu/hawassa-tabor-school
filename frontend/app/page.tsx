import Link from "next/link";

const ArrowIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f6f9fd] text-[#10243e]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-6 sm:px-8 lg:px-10">
        <header className="flex items-center justify-between rounded-2xl border border-[#dbe5f0] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(20,52,90,0.05)]">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#1267e8] text-white shadow-[0_8px_18px_rgba(18,103,232,0.2)]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" />
                <path d="M6 10.5v5L12 19l6-3.5v-5" />
              </svg>
            </div>
            <div>
              <p className="text-base font-bold tracking-tight text-[#0b1f3a]">TABOR</p>
              <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[#71849a]">School Management System</p>
            </div>
          </div>
          <span className="hidden rounded-full bg-[#eaf2ff] px-3 py-1 text-xs font-semibold text-[#1267e8] sm:inline-flex">Grades 9–12</span>
        </header>

        <section className="grid flex-1 items-center gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div className="animate-page-in max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#cfe0f7] bg-white px-3 py-1.5 text-xs font-semibold text-[#1267e8] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#1267e8]" />
              Tabor School • Hawassa
            </div>
            <h1 className="text-5xl font-extrabold tracking-tight text-[#0b1f3a] sm:text-6xl">
              A clearer way to manage your school.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-[#63778f]">
              One secure platform for students, teachers, classes, attendance, grades, and academic administration.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/login" className="shimmer-btn inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-semibold">
                Sign in
                <ArrowIcon />
              </Link>
              <Link href="/register" className="input-glow inline-flex items-center rounded-xl border border-[#d2dfec] bg-white px-6 py-3.5 font-semibold text-[#20415f] hover:border-[#b8cce2]">
                Contact / Register
              </Link>
            </div>
            <div className="mt-10 grid max-w-xl grid-cols-3 gap-3">
              {[
                ["1,500+", "Students"],
                ["70+", "Teachers"],
                ["9–12", "Grades"],
              ].map(([value, label], i) => (
                <div key={label} className="animate-item-in rounded-2xl border border-[#dbe5f0] bg-white p-4 shadow-[0_8px_24px_rgba(20,52,90,0.04)]" style={{ "--index": i } as React.CSSProperties}>
                  <p className="text-xl font-bold text-[#0b1f3a]">{value}</p>
                  <p className="mt-1 text-xs font-medium text-[#71849a]">{label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="animate-page-in lg:justify-self-end">
            <div className="relative overflow-hidden rounded-[28px] border border-[#cbdcf0] bg-[#0b1f3a] p-7 text-white shadow-[0_24px_60px_rgba(11,31,58,0.18)]">
              <div className="absolute right-[-40px] top-[-50px] h-40 w-40 rounded-full bg-[#1267e8] opacity-25 blur-2xl" />
              <div className="absolute bottom-[-50px] left-[-40px] h-40 w-40 rounded-full bg-[#4a91f5] opacity-15 blur-2xl" />
              <div className="relative">
                <p className="text-sm font-semibold text-[#9fc7ff]">WELCOME</p>
                <h2 className="mt-3 text-3xl font-bold">Tabor School</h2>
                <p className="mt-3 max-w-sm text-sm leading-6 text-[#c9d8e8]">
                  Designed for practical daily administration, with role-based access for administrators, teachers, and students.
                </p>
                <div className="mt-8 space-y-3">
                  {["Student records", "Class & teacher management", "Attendance & grades"].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#1267e8]">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="m5 12 4 4L19 6" />
                        </svg>
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-[#dbe5f0] py-5 text-center text-xs text-[#8193a7]">
          Tabor School Management System
        </footer>
      </div>
    </main>
  );
}
