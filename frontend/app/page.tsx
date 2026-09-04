import Link from "next/link";

const ArrowIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M5 12h14" />
    <path d="m13 6 6 6-6 6" />
  </svg>
);

const CheckIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="m5 12 4 4L19 6" />
  </svg>
);

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f6f9fd] text-[#10243e]">
      <div className="mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 py-5 sm:px-8 lg:px-10 lg:py-7">
        <header className="flex items-center justify-between rounded-2xl border border-[#dbe5f0] bg-white px-5 py-4 shadow-[0_8px_24px_rgba(20,52,90,0.05)]">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#1267e8] text-white shadow-[0_8px_18px_rgba(18,103,232,0.2)]">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="m12 3 8 4.5-8 4.5-8-4.5L12 3Z" />
                <path d="M6 10.5v5L12 19l6-3.5v-5" />
              </svg>
            </div>
            <div className="min-w-0">
              <p className="truncate text-base font-bold tracking-tight text-[#0b1f3a]">Hawassa Tabor School</p>
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[#71849a]">School Management System</p>
            </div>
          </div>
          <span className="hidden rounded-full bg-[#eaf2ff] px-3 py-1 text-xs font-semibold text-[#1267e8] sm:inline-flex">Grades 9–12</span>
        </header>

        <section className="grid flex-1 items-center gap-12 py-14 lg:grid-cols-[1.08fr_0.92fr] lg:gap-20 lg:py-20">
          <div className="animate-page-in max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#cfe0f7] bg-white px-3 py-1.5 text-xs font-semibold text-[#1267e8] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#1267e8]" />
              Hawassa Tabor School
            </div>
            <h1 className="max-w-2xl text-4xl font-extrabold tracking-[-0.03em] text-[#0b1f3a] sm:text-5xl lg:text-[58px] lg:leading-[1.05]">
              School records, attendance, and grades in one place.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-[#63778f] sm:text-lg">
              A shared system for school administrators, teachers, and students to manage daily academic records.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/login" className="shimmer-btn inline-flex items-center gap-2 rounded-xl px-6 py-3.5 font-semibold">
                Sign in
                <ArrowIcon />
              </Link>
            </div>

            <div className="mt-10 grid max-w-xl gap-3 sm:grid-cols-3">
              {[
                ["Students", "Student records"],
                ["Teachers", "Teaching staff"],
                ["Academics", "Attendance & grades"],
              ].map(([title, text], i) => (
                <div key={title} className="animate-item-in rounded-2xl border border-[#dbe5f0] bg-white p-4 shadow-[0_8px_24px_rgba(20,52,90,0.04)]" style={{ "--index": i } as React.CSSProperties}>
                  <p className="text-sm font-bold text-[#0b1f3a]">{title}</p>
                  <p className="mt-1 text-xs leading-5 text-[#71849a]">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="animate-page-in lg:justify-self-end">
            <div className="relative overflow-hidden rounded-[28px] border border-[#cbdcf0] bg-[#0b1f3a] p-7 text-white shadow-[0_24px_60px_rgba(11,31,58,0.18)] sm:p-8">
              <div className="absolute right-[-60px] top-[-70px] h-48 w-48 rounded-full bg-[#1267e8] opacity-20 blur-3xl" />
              <div className="absolute bottom-[-60px] left-[-50px] h-44 w-44 rounded-full bg-[#4a91f5] opacity-10 blur-3xl" />
              <div className="relative">
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#9fc7ff]">School portal</p>
                <h2 className="mt-3 text-3xl font-bold tracking-tight">Hawassa Tabor</h2>
                <p className="mt-3 max-w-sm text-sm leading-6 text-[#c9d8e8]">
                  Access the records and academic tools available for your role.
                </p>
                <div className="mt-8 space-y-3">
                  {["Student records", "Classes and teaching", "Attendance and grades"].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#1267e8]">
                        <CheckIcon />
                      </span>
                      {item}
                    </div>
                  ))}
                </div>
                <Link href="/login" className="mt-7 flex w-full items-center justify-center rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#0b1f3a] transition hover:bg-[#edf4fb]">
                  Open school portal
                </Link>
              </div>
            </div>
          </div>
        </section>

        <footer className="border-t border-[#dbe5f0] py-5 text-center text-xs text-[#8193a7]">
          Hawassa Tabor Primary and Secondary School
        </footer>
      </div>
    </main>
  );
}
