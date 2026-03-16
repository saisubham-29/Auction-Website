"use client";
import { useState } from "react";

export default function AdminLogin({ onLogin }: { onLogin: () => void }) {
  const [user, setUser] = useState("");
  const [pass, setPass] = useState("");
  const [err, setErr] = useState(false);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (user === "admin" && pass === "admin1234") { onLogin(); }
    else { setErr(true); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
      <form onSubmit={submit} className="bg-gray-900 border border-gray-800 rounded-2xl p-8 w-full max-w-sm space-y-4">
        <h2 className="text-lg font-bold text-white">🔐 Admin Login</h2>
        <input value={user} onChange={e => { setUser(e.target.value); setErr(false); }}
          placeholder="Username"
          className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-500" />
        <input type="password" value={pass} onChange={e => { setPass(e.target.value); setErr(false); }}
          placeholder="Password"
          className="w-full bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-yellow-500" />
        {err && <p className="text-red-400 text-xs">Invalid credentials.</p>}
        <button type="submit" className="w-full bg-yellow-500 hover:bg-yellow-400 text-black font-bold py-2.5 rounded-lg text-sm transition">
          Login
        </button>
      </form>
    </div>
  );
}
