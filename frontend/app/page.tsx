import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import logoImg from "../public/logo.jpg";

export default function HomePage() {
  return (
    <main className="relative min-h-screen w-full flex flex-col font-sans text-[#0a2540] overflow-hidden">
      {/* Background Image with Gradient Overlay */}
      <div className="absolute inset-0 z-[-1] overflow-hidden">
        <img 
          src="https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
          alt="School Campus" 
          className="w-full h-full object-cover"
        />
        {/* Soft white gradient on the left to make text readable */}
        <div className="absolute inset-0 bg-gradient-to-r from-white via-white/80 to-transparent w-full md:w-[65%]"></div>
      </div>

      {/* Navbar */}
      <nav className="relative z-10 w-full px-6 py-6 md:px-12 flex items-center justify-between">
        {/* Logo Section */}
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 flex items-center justify-center rounded-md overflow-hidden bg-transparent">
            <img src={logoImg.src} alt="Logo" className="w-full h-full object-contain mix-blend-multiply" />
          </div>
          <div className="flex flex-col">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#0a2540] leading-none mb-1">
              HAWASSA<br/>TABOR SCHOOL
            </h1>
            <span className="text-[10px] uppercase tracking-widest text-slate-500 font-semibold italic">
              Learn • Grow • Lead
            </span>
          </div>
        </div>

        {/* Links */}
        <div className="hidden lg:flex items-center gap-10 text-[14px] font-semibold text-[#0a2540]">
          <Link href="#" className="relative text-blue-700">
            Home
            <span className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-6 h-[2px] bg-blue-600 rounded-full"></span>
          </Link>
          <Link href="#" className="hover:text-blue-600 transition-colors">About</Link>
          <Link href="#" className="hover:text-blue-600 transition-colors">Academics</Link>
          <Link href="#" className="hover:text-blue-600 transition-colors">Admissions</Link>
          <Link href="#" className="hover:text-blue-600 transition-colors">Gallery</Link>
          <Link href="#" className="hover:text-blue-600 transition-colors">Contact</Link>
        </div>

        {/* CTA Button */}
        <div>
          <Link href="/login" className="flex items-center gap-2 bg-[#0a2540] hover:bg-[#113155] text-white px-7 py-3 rounded-full text-sm font-semibold transition-transform hover:scale-105 shadow-lg">
            Apply Now <ArrowRight size={16} />
          </Link>
        </div>
      </nav>

      {/* Hero Content */}
      <div className="relative z-10 flex-1 flex flex-col justify-center px-6 md:px-12 pb-20 max-w-3xl mt-12 md:mt-0">
        <span className="tracking-[0.4em] text-[13px] font-bold text-slate-500 mb-6 uppercase">
          Welcome To
        </span>
        <h2 className="text-6xl md:text-[85px] font-extrabold text-[#0a2540] leading-[1.05] mb-6 tracking-tight">
          Hawassa<br/>Tabor School
        </h2>
        <p className="text-3xl md:text-[40px] font-caveat text-[#2b6cb0] mb-8 leading-tight">
          A Place to Learn, Grow and Lead
        </p>
        <p className="text-slate-600 text-lg md:text-xl mb-12 max-w-[500px] leading-relaxed font-medium">
          We provide quality education, strong values, and opportunities for every student to build a brighter future.
        </p>
        
        <div className="flex flex-wrap items-center gap-5">
          <Link href="/login" className="flex items-center gap-2 bg-[#0a2540] hover:bg-[#113155] text-white px-8 py-3.5 rounded-full text-[15px] font-semibold transition-transform hover:-translate-y-1 shadow-xl shadow-slate-900/10">
            Explore Our School <ArrowRight size={18} />
          </Link>
          <button className="flex items-center gap-3 bg-transparent border-[1.5px] border-[#0a2540] text-[#0a2540] hover:bg-slate-900/5 px-8 py-3.5 rounded-full text-[15px] font-semibold transition-transform hover:-translate-y-1">
            <div className="w-5 h-5 rounded-full border-[1.5px] border-[#0a2540] flex items-center justify-center pl-0.5">
               <Play size={10} fill="currentColor" />
            </div>
            Watch Video
          </button>
        </div>
      </div>
    </main>
  );
}

