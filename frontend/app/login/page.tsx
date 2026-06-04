"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/constants";
import { saveToken, saveUser, dashboardForRole } from "@/lib/auth";

export default function LoginPage() {
  return (
    <div style={{ 
      backgroundImage: 'linear-gradient(rgba(10, 10, 10, 0.85), rgba(10, 10, 10, 0.85)), url("https://images.unsplash.com/photo-1541339907198-e08756ebafe3?q=80&w=2070&auto=format&fit=crop")',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      minHeight: "100vh", 
      display: "flex", 
      padding: "20px",
      justifyContent: "center", 
      alignItems: "center", 
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' 
    }}>
      <Suspense fallback={<div style={{ color: "#D4AF37", fontWeight: 700 }}>Initializing Tabor...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}

function LoginContent() {
  const router = useRouter();
  useSearchParams();

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [mounted, setMounted]   = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setMounted(true);
    // Pre-warm backend
    if (API_BASE_URL && typeof API_BASE_URL === 'string') {
      fetch(`${API_BASE_URL.replace("/api/v1", "")}/health`).catch(() => {});
    }
    
    const handleResize = () => setIsMobile(window.innerWidth < 480);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Only attach the interaction listener if music is not already playing
    if (isPlaying) return;

    const handleFirstInteraction = () => {
      if (audioRef.current) {
        audioRef.current.play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch(() => {
             /* Silently wait for the next interaction if needed */
          });
      }
    };

    window.addEventListener("click", handleFirstInteraction);
    return () => window.removeEventListener("click", handleFirstInteraction);
  }, [isPlaying]);

  if (!mounted) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          typeof data?.detail === "string" ? data.detail : "Invalid email or password."
        );
      }

      saveToken(data.access_token);
      saveUser(data.user);
      router.push(dashboardForRole(data.user.role));
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(err => console.error("Audio playback failed:", err));
    }
  };

  const isInvalid = password === "" || email === "";

  const inputStyle: React.CSSProperties = {
    width: "100%",
    padding: "12px 14px",
    background: "#1a1a1a",
    border: "1px solid #333",
    borderRadius: "6px",
    fontSize: "14px",
    marginBottom: "10px",
    outline: "none",
    color: "#fff"
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", maxWidth: "400px" }}>
      <div style={{ backgroundColor: "#111", border: "1px solid #D4AF37", padding: isMobile ? "30px 20px" : "40px", borderRadius: "12px", display: "flex", flexDirection: "column", alignItems: "center", boxShadow: "0 20px 50px rgba(0,0,0,0.8)" }}>
        
        <h1 style={{ 
          margin: "0 0 8px", 
          fontSize: "32px", 
          fontWeight: "800", 
          color: "#D4AF37", 
          letterSpacing: "2px", 
          textTransform: "uppercase", 
          textAlign: "center",
          textShadow: "0 0 12px rgba(212, 175, 55, 0.4), 0 0 24px rgba(212, 175, 55, 0.2)"
        }}>
          tabor
        </h1>

        <div style={{ color: "#888", fontSize: "11px", marginBottom: "32px", textAlign: "center", textTransform: "uppercase", letterSpacing: "1px", borderTop: "1px solid #333", borderBottom: "1px solid #333", padding: "8px 0", width: "100%" }}>
          Grades 9-12 • 1500 Students • 70 Teachers
        </div>

        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
          <input 
            type="text" 
            placeholder="Username or Email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            style={inputStyle} 
          />
          <input 
            type="password" 
            placeholder="Password"
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            style={inputStyle} 
          />
          
          <button 
            type="submit" 
            disabled={isInvalid || loading} 
            style={{ width: "100%", backgroundColor: isInvalid ? "rgba(212, 175, 55, 0.3)" : "#D4AF37", border: "none", borderRadius: "6px", color: isInvalid ? "rgba(0,0,0,0.5)" : "#000", padding: "12px", fontWeight: "700", fontSize: "14px", marginTop: "10px", cursor: isInvalid ? "default" : "pointer", transition: "all 0.2s" }}
          >
            {loading ? "Logging in..." : "Log In"}
          </button>
        </form>

        {error && (
          <div style={{ color: "#ed4956", fontSize: "14px", marginTop: "20px", textAlign: "center" }}>
            {error}
          </div>
        )}

        <div style={{ margin: "20px 0", display: "flex", alignItems: "center", width: "100%" }}>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#333" }} />
          <div style={{ margin: "0 18px", color: "#666", fontSize: "12px", fontWeight: "600" }}>OR</div>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#333" }} />
        </div>

        <p style={{ color: "#D4AF37", fontSize: "13px", fontWeight: "600", cursor: "pointer", marginBottom: "0", opacity: 0.8 }}>
          Forgot password?
        </p>
      </div>

      <div style={{ backgroundColor: "#111", border: "1px solid #333", padding: "20px", marginTop: "12px", borderRadius: "8px", textAlign: "center" }}>
        <p style={{ fontSize: "14px", color: "#888" }}>
          Don't have an account? <span style={{ color: "#0095f6", fontWeight: "600", cursor: "pointer" }}>Contact Admin</span>
        </p>
      </div>

      {/* Music Toggle */}
      <button 
        onClick={toggleMusic}
        style={{
          marginTop: "20px",
          background: "transparent",
          border: "1px solid rgba(212, 175, 55, 0.3)",
          borderRadius: "20px",
          padding: "6px 16px",
          color: "#D4AF37",
          fontSize: "12px",
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          gap: "8px",
          alignSelf: "center",
          transition: "all 0.2s"
        }}
      >
        {isPlaying ? "🔊 Pause Anthem" : "🔈 Play Tabor Anthem"}
      </button>

      <audio ref={audioRef} src="/tabor-anthem.mp3" loop />

      {/* Watermark */}
      <div style={{
        position: isMobile ? "static" : "fixed",
        bottom: isMobile ? "auto" : "24px",
        right: isMobile ? "auto" : "24px",
        marginTop: isMobile ? "20px" : "0",
        opacity: 0.25,
        color: "#D4AF37",
        fontSize: "10px",
        fontWeight: "700",
        letterSpacing: "2px",
        textTransform: "uppercase",
        pointerEvents: "none",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "8px"
      }}>
        <svg width="16" height="16" viewBox="0 0 48 48" fill="none">
          <path d="M24 4L6 12V26C6 35.4 14.2 44.2 24 46C33.8 44.2 42 35.4 42 26V12L24 4Z" stroke="#D4AF37" strokeWidth="4" fill="none" />
          <path d="M17 24L22 29L31 19" stroke="#D4AF37" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Tabor School MS
      </div>
    </div>
  );
}