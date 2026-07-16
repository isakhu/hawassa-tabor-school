import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-white">
      <h1 className="text-4xl font-bold">EduCore</h1>
      <p className="max-w-md text-center text-white/70">
        The future of school management. Manage students, teachers, classes,
        attendance, and grades — all in one platform.
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="rounded-lg bg-white px-6 py-2 font-medium text-black"
        >
          Login
        </Link>
        <Link
          href="/register"
          className="rounded-lg border border-white/30 px-6 py-2 font-medium"
        >
          Register
        </Link>
      </div>
    </main>
  );
}