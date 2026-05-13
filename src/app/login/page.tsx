"use client";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");
  const [mode, setMode] = useState<"login" | "register">("login");
  const [hasUsers, setHasUsers] = useState<boolean | null>(null);
  const [msg, setMsg] = useState<{ text: string; kind: "info" | "err" | "ok" } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(j => {
      if (j.user) location.href = "/";
      setHasUsers(j.hasUsers);
      if (!j.hasUsers) {
        setMode("register");
        setMsg({ text: "No accounts yet — the account you create now becomes the admin.", kind: "info" });
      }
    });
  }, []);

  async function submit() {
    if (busy) return;
    if (!email || !pw) { setMsg({ text: "Enter email and password", kind: "err" }); return; }
    if (mode === "register" && pw !== pw2) { setMsg({ text: "Passwords don't match", kind: "err" }); return; }
    setBusy(true);
    setMsg(null);
    try {
      const r = await fetch("/api/auth/" + mode, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: pw })
      });
      const j = await r.json();
      if (r.ok) {
        location.href = "/";
        return;
      }
      // Auto-switch: login → register flow if email is authorized or no users yet
      if (mode === "login" && (j.error === "register_required" || j.error === "first_user")) {
        setMode("register");
        setMsg({ text: j.message || "Set your password to continue", kind: "info" });
        return;
      }
      setMsg({ text: j.error || "Sign-in failed", kind: "err" });
    } catch (e: any) {
      setMsg({ text: "Network error — " + (e?.message ?? ""), kind: "err" });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center",
      background: "linear-gradient(135deg,#7c2d12 0%,#b45309 50%,#f59e0b 100%)", padding: 20
    }}>
      <div style={{ background: "#fff", borderRadius: 16, padding: 28, maxWidth: 420, width: "100%", boxShadow: "0 12px 40px rgba(0,0,0,.3)" }}>
        <h2 style={{ margin: "0 0 4px", color: "#7c2d12" }}>🥨 Rolling Crunchys</h2>
        <div style={{ color: "#64748b", fontSize: 13, marginBottom: 16 }}>
          {mode === "register" ? (hasUsers === false ? "Create the admin account" : "Set your password (first login)") : "Sign in to access the monthly report"}
        </div>
        {msg && <div style={{
          padding: "8px 12px", borderRadius: 6, fontSize: 12, marginBottom: 10,
          background: msg.kind === "err" ? "#fee2e2" : msg.kind === "ok" ? "#dcfce7" : "#dbeafe",
          color: msg.kind === "err" ? "#dc2626" : msg.kind === "ok" ? "#16a34a" : "#1e40af"
        }}>{msg.text}</div>}
        <form onSubmit={e => { e.preventDefault(); submit(); }}>
          <label style={lbl}>Email
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} autoComplete="email" required style={inp}/>
          </label>
          <label style={lbl}>Password
            <input type="password" value={pw} onChange={e => setPw(e.target.value)} autoComplete={mode === "register" ? "new-password" : "current-password"} required style={inp}/>
          </label>
          {mode === "register" && <label style={lbl}>Confirm Password
            <input type="password" value={pw2} onChange={e => setPw2(e.target.value)} autoComplete="new-password" required style={inp}/>
          </label>}
          <button type="submit" disabled={busy} style={btn}>
            {busy ? "..." : (mode === "login" ? "Login" : "Create Account")}
          </button>
        </form>
        <p style={{ fontSize: 11, color: "#64748b", marginTop: 14 }}>
          {mode === "login" ? (
            <>First time with an authorized email? Just enter it — you'll be prompted to set a password.</>
          ) : (
            <>Already have an account?{" "}
            <a href="#" onClick={e => { e.preventDefault(); setMode("login"); setMsg(null); setPw2(""); }} style={{ color: "#0ea5e9" }}>Switch to Login</a></>
          )}
        </p>
      </div>
    </div>
  );
}
const lbl: React.CSSProperties = { display: "block", marginBottom: 10, fontSize: 13, fontWeight: 600, color: "#0f172a" };
const inp: React.CSSProperties = { width: "100%", padding: "10px 12px", border: "1px solid #e7e5e4", borderRadius: 7, fontSize: 14, marginTop: 4, fontFamily: "inherit" };
const btn: React.CSSProperties = { width: "100%", padding: 10, background: "#7c2d12", color: "#fff", border: 0, borderRadius: 7, fontWeight: 600, cursor: "pointer", fontSize: 14 };
