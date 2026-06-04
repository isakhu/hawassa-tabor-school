"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/constants";
import { saveToken, saveUser, dashboardForRole } from "@/lib/auth";

export default function LoginPage() {
  return (
    <div style={{ backgroundColor: "#fafafa", minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
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
    padding: "9px 0 7px 8px",
    background: "#fafafa",
    border: "1px solid #dbdbdb",
    borderRadius: "3px",
    fontSize: "12px",
    marginBottom: "6px",
    outline: "none",
    color: "#262626"
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", width: "100%", maxWidth: "350px" }}>
      <div style={{ backgroundColor: "#fff", border: "1px solid #dbdbdb", padding: "10px 40px", display: "flex", flexDirection: "column", alignItems: "center" }}>
        
        <h1 style={{ margin: "36px 0 12px", fontSize: "28px", fontWeight: "600", color: "#262626", letterSpacing: "-1px" }}>
          yzak school ms
        </h1>

        <form onSubmit={handleSubmit} style={{ width: "100%", marginTop: "24px" }}>
          <input 
            type="text" 
            placeholder="Phone number, username, or email" 
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
            style={{ width: "100%", backgroundColor: isInvalid ? "rgba(0,149,246,.3)" : "#0095f6", border: "none", borderRadius: "8px", color: "white", padding: "7px 16px", fontWeight: "600", fontSize: "14px", marginTop: "8px", cursor: isInvalid ? "default" : "pointer" }}
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
          <div style={{ flex: 1, height: "1px", backgroundColor: "#dbdbdb" }} />
          <div style={{ margin: "0 18px", color: "#8e8e8e", fontSize: "13px", fontWeight: "600" }}>OR</div>
          <div style={{ flex: 1, height: "1px", backgroundColor: "#dbdbdb" }} />
        </div>

        <p style={{ color: "#385185", fontSize: "14px", fontWeight: "600", cursor: "pointer", marginBottom: "12px" }}>
          Forgot password?
        </p>
      </div>

      <div style={{ backgroundColor: "#fff", border: "1px solid #dbdbdb", padding: "20px", marginTop: "10px", textAlign: "center" }}>
        <p style={{ fontSize: "14px", color: "#262626" }}>
          Don't have an account? <span style={{ color: "#0095f6", fontWeight: "600", cursor: "pointer" }}>Contact Admin</span>
        </p>
      </div>
    </div>
  );
}