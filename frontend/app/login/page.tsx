"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/constants";
import { saveToken, saveUser, dashboardForRole } from "@/lib/auth";

export default function LoginPage() {
  return (
    <div style={{ backgroundColor: "#0a0a0a", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      <Suspense fallback={<div>Loading...</div>}>
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

  useEffect(() => {
    // Pre-warm backend
    fetch(`${API_BASE_URL.replace("/api/v1", "")}/health`).catch(() => {});
  }, []);

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
    <div style={{ display: "flex", flexDirection: "column", width: "100%", maxWidth: "350px" }}>
      <div style={{ backgroundColor: "#111", border: "1px solid #D4AF37", padding: "40px", borderRadius: "8px", display: "flex", flexDirection: "column", alignItems: "center", boxShadow: "0 20px 50px rgba(0,0,0,0.8)" }}>
        
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
    </div>
  );
}