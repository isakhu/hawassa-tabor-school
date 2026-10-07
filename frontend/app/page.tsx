import Link from "next/link";
import { 
  ArrowRight, 
  Sparkles, 
  Users, 
  GraduationCap, 
  HeartHandshake, 
  BookOpen,
  UserCircle,
  Briefcase,
  FileText,
  CalendarCheck,
  CreditCard,
  CalendarDays,
  MessageSquare,
  Files
} from "lucide-react";
import logoImg from "../public/logo.jpg";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f9fcff] text-[#1d3557] font-sans selection:bg-[#f07156] selection:text-white pb-20 overflow-hidden">
      {/* Navbar */}
      <nav className="mx-auto max-w-7xl px-5 py-6 sm:px-8 lg:px-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-200 shadow-sm bg-black">
            <img src={logoImg.src} alt="Hawassa Tabor Logo" className="w-full h-full object-contain scale-110" />
          </div>
          <span className="text-xl font-extrabold text-[#1d3557] tracking-tight">Hawassa Tabor</span>
        </div>
        
        <div className="hidden md:flex items-center gap-8 text-sm font-bold text-[#5a718c]">
          <Link href="#features" className="hover:text-[#f07156] transition-colors">Features</Link>
          <Link href="#gallery" className="hover:text-[#f07156] transition-colors">Gallery</Link>
          <Link href="#contact" className="hover:text-[#f07156] transition-colors">Contact</Link>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex w-10 h-10 rounded-full bg-gradient-to-tr from-blue-200 to-blue-400 border-2 border-white shadow-sm items-center justify-center overflow-hidden">
             <UserCircle className="text-white w-6 h-6" />
          </div>
          <Link href="/login" className="bg-[#10243e] text-white px-6 py-2.5 rounded-full text-sm font-bold shadow-lg shadow-[#10243e]/20 hover:bg-[#11233a] transition-all hover:scale-105 active:scale-95">
            Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 pt-12 pb-24 grid lg:grid-cols-[1.1fr_0.9fr] gap-12 lg:gap-20 items-center relative">
        <div className="max-w-2xl relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-yellow-200 text-yellow-600 bg-yellow-50 text-xs font-bold mb-8 shadow-sm">
            <Sparkles size={14} className="text-yellow-500" />
            Welcome to Hawassa Tabor
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-[68px] font-extrabold text-[#1d3557] leading-[1.08] mb-8 tracking-tight">
            School Management, <br />
            <span className="text-[#f07156]">Reimagined for Fun</span> <br />
            Learning
          </h1>
          <p className="text-[#5a718c] text-lg sm:text-xl leading-relaxed mb-10 max-w-xl">
            Hawassa Tabor brings students, teachers, parents, and staff together on one bright and friendly platform, from classes and exams to fees and announcements, everything your school needs is just a click away.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/login" className="bg-[#f07156] hover:bg-[#e25e43] text-white px-8 py-4 rounded-full font-bold flex items-center gap-2 shadow-[0_8px_24px_rgba(240,113,86,0.3)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_28px_rgba(240,113,86,0.4)]">
              Go to Dashboard
              <ArrowRight size={18} />
            </Link>
            <Link href="#features" className="bg-white text-[#1d3557] border border-[#e5f0f9] px-8 py-4 rounded-full font-bold flex items-center gap-2 shadow-sm hover:border-[#cfdef0] transition-all hover:-translate-y-1 hover:shadow-md">
              <Sparkles size={18} className="text-[#4a91f5]" />
              Explore Features
            </Link>
          </div>
        </div>

        {/* Hero Illustration Placeholder */}
        <div className="relative w-full h-[400px] sm:h-[500px] flex items-center justify-center">
           <div className="absolute -right-20 top-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob"></div>
           <div className="absolute -left-20 bottom-0 w-96 h-96 bg-orange-100 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-blob animation-delay-2000"></div>
           
           {/* Floating Cards */}
           <div className="absolute top-[10%] left-[5%] w-36 sm:w-44 bg-white rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.06)] -rotate-6 p-4 border border-slate-50 flex flex-col items-center animate-bounce-slow">
              <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-500 flex items-center justify-center mb-3">
                <Users size={24} />
              </div>
              <span className="text-sm font-bold text-slate-700 text-center">Vibrant<br/>Community</span>
           </div>
           
           <div className="absolute bottom-[15%] right-[5%] w-36 sm:w-44 bg-white rounded-3xl shadow-[0_20px_40px_rgba(0,0,0,0.06)] rotate-6 p-4 border border-slate-50 flex flex-col items-center animate-bounce-slow animation-delay-1000">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-500 flex items-center justify-center mb-3">
                <BookOpen size={24} />
              </div>
              <span className="text-sm font-bold text-slate-700 text-center">Modern<br/>Learning</span>
           </div>

           <div className="relative w-64 h-64 sm:w-80 sm:h-80 bg-black rounded-full shadow-[0_30px_60px_rgba(29,53,87,0.3)] flex flex-col items-center justify-center text-white z-10 overflow-hidden border-4 border-white">
             <img src={logoImg.src} alt="Hawassa Tabor Logo" className="w-full h-full object-contain scale-110" />
           </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 pb-28">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-[#ffe8e0] rounded-3xl p-8 flex flex-col items-center text-center justify-center shadow-sm hover:shadow-md transition-shadow">
            <Users size={32} className="text-[#e25e43] mb-4 opacity-80" />
            <div className="text-4xl font-extrabold text-[#1d3557] mb-1">500+</div>
            <div className="text-sm font-semibold text-[#1d3557]/70">Happy Students</div>
          </div>
          <div className="bg-[#e5f5e8] rounded-3xl p-8 flex flex-col items-center text-center justify-center shadow-sm hover:shadow-md transition-shadow">
            <GraduationCap size={32} className="text-[#419c5b] mb-4 opacity-80" />
            <div className="text-4xl font-extrabold text-[#1d3557] mb-1">50+</div>
            <div className="text-sm font-semibold text-[#1d3557]/70">Passionate Teachers</div>
          </div>
          <div className="bg-[#e5f0f9] rounded-3xl p-8 flex flex-col items-center text-center justify-center shadow-sm hover:shadow-md transition-shadow">
            <HeartHandshake size={32} className="text-[#4a91f5] mb-4 opacity-80" />
            <div className="text-4xl font-extrabold text-[#1d3557] mb-1">400+</div>
            <div className="text-sm font-semibold text-[#1d3557]/70">Involved Parents</div>
          </div>
          <div className="bg-[#f3e8ff] rounded-3xl p-8 flex flex-col items-center text-center justify-center shadow-sm hover:shadow-md transition-shadow">
            <BookOpen size={32} className="text-[#a855f7] mb-4 opacity-80" />
            <div className="text-4xl font-extrabold text-[#1d3557] mb-1">20+</div>
            <div className="text-sm font-semibold text-[#1d3557]/70">Subjects Offered</div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10 pb-28">
        <div className="text-center mb-16">
          <div className="inline-block px-5 py-2 rounded-full border border-blue-100 bg-white text-blue-600 text-xs font-bold mb-5 shadow-sm">
            What We Offer
          </div>
          <h2 className="text-4xl sm:text-5xl font-extrabold text-[#1d3557] mb-6">Everything Your School Needs</h2>
          <p className="text-[#5a718c] text-lg sm:text-xl max-w-3xl mx-auto leading-relaxed">
            From the classroom to the front office, Hawassa Tabor covers every corner of school life with playful, easy-to-use tools.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Feature 1 */}
          <div className="bg-[#dcf3f9] p-8 rounded-[2rem] transition-transform hover:-translate-y-2 cursor-default">
            <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
               <Users size={28} className="text-[#0081a7]" />
            </div>
            <h3 className="text-xl font-bold text-[#1d3557] mb-3">Student & Family Profiles</h3>
            <p className="text-[#1d3557]/70 font-medium leading-relaxed">
              Keep students, parents, and staff records organized and easy to find, all in one joyful place.
            </p>
          </div>
          
          {/* Feature 2 */}
          <div className="bg-[#f0edff] p-8 rounded-[2rem] transition-transform hover:-translate-y-2 cursor-default">
            <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
               <Briefcase size={28} className="text-[#6a4c93]" />
            </div>
            <h3 className="text-xl font-bold text-[#1d3557] mb-3">Teacher & Staff Hub</h3>
            <p className="text-[#1d3557]/70 font-medium leading-relaxed">
              Manage teachers, admins, and departments so every grown-up on campus is in the loop.
            </p>
          </div>

          {/* Feature 3 */}
          <div className="bg-[#fff9e5] p-8 rounded-[2rem] transition-transform hover:-translate-y-2 cursor-default">
            <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
               <BookOpen size={28} className="text-[#e09f3e]" />
            </div>
            <h3 className="text-xl font-bold text-[#1d3557] mb-3">Classes, Subjects & Lessons</h3>
            <p className="text-[#1d3557]/70 font-medium leading-relaxed">
              Plan grades, subjects, lessons, and periods without the paperwork headache.
            </p>
          </div>

          {/* Feature 4 */}
          <div className="bg-[#ffe8e0] p-8 rounded-[2rem] transition-transform hover:-translate-y-2 cursor-default">
            <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
               <FileText size={28} className="text-[#d62828]" />
            </div>
            <h3 className="text-xl font-bold text-[#1d3557] mb-3">Exams, Assignments & Results</h3>
            <p className="text-[#1d3557]/70 font-medium leading-relaxed">
              Track exams, assignments, results, and evaluations, and celebrate every win along the way.
            </p>
          </div>

          {/* Feature 5 */}
          <div className="bg-[#e5f5e8] p-8 rounded-[2rem] transition-transform hover:-translate-y-2 cursor-default">
            <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
               <CalendarCheck size={28} className="text-[#386641]" />
            </div>
            <h3 className="text-xl font-bold text-[#1d3557] mb-3">Attendance Made Simple</h3>
            <p className="text-[#1d3557]/70 font-medium leading-relaxed">
              Mark and monitor daily attendance in seconds, so no smile goes unnoticed.
            </p>
          </div>

          {/* Feature 6 */}
          <div className="bg-[#e5f0f9] p-8 rounded-[2rem] transition-transform hover:-translate-y-2 cursor-default">
            <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
               <CreditCard size={28} className="text-[#118ab2]" />
            </div>
            <h3 className="text-xl font-bold text-[#1d3557] mb-3">Fees & Payments</h3>
            <p className="text-[#1d3557]/70 font-medium leading-relaxed">
              Handle fees, payments, and bank accounts with clear, transparent, stress-free tracking.
            </p>
          </div>

          {/* Feature 7 */}
          <div className="bg-[#fde7f3] p-8 rounded-[2rem] transition-transform hover:-translate-y-2 cursor-default">
            <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
               <CalendarDays size={28} className="text-[#b5179e]" />
            </div>
            <h3 className="text-xl font-bold text-[#1d3557] mb-3">Events & Calendars</h3>
            <p className="text-[#1d3557]/70 font-medium leading-relaxed">
              Keep the community updated on holidays, meetings, and fun school events.
            </p>
          </div>

          {/* Feature 8 */}
          <div className="bg-[#e0e7ff] p-8 rounded-[2rem] transition-transform hover:-translate-y-2 cursor-default">
            <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
               <MessageSquare size={28} className="text-[#3a0ca3]" />
            </div>
            <h3 className="text-xl font-bold text-[#1d3557] mb-3">Messages & Announcements</h3>
            <p className="text-[#1d3557]/70 font-medium leading-relaxed">
              Send quick announcements and messages to make sure everyone is on the same page.
            </p>
          </div>

          {/* Feature 9 */}
          <div className="bg-[#f3f4f6] p-8 rounded-[2rem] transition-transform hover:-translate-y-2 cursor-default">
            <div className="bg-white w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
               <Files size={28} className="text-[#374151]" />
            </div>
            <h3 className="text-xl font-bold text-[#1d3557] mb-3">Documents & Reports</h3>
            <p className="text-[#1d3557]/70 font-medium leading-relaxed">
              Store important documents securely and generate beautiful reports instantly.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mx-auto max-w-7xl px-5 py-8 border-t border-[#dbe5f0] text-center text-sm text-[#8193a7] font-medium">
        © {new Date().getFullYear()} Hawassa Tabor Primary and Secondary School. All rights reserved.
      </footer>
    </main>
  );
}

