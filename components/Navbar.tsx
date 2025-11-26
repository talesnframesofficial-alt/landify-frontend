"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "./SupabaseProvider";

export function Navbar() {
  const { supabase } = useSupabase();
  const [user, setUser] = useState<any>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    async function loadUser() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user || null);
    }
    loadUser();

    // Listen to auth changes
    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => listener.subscription.unsubscribe();
  }, [supabase]);

  const go = (path: string) => {
    window.location.href = path;
  };

  return (
    <nav className="fixed top-0 w-full bg-white shadow-sm z-50 h-16 flex items-center">
      <div className="container mx-auto flex justify-between items-center px-4">

        {/* Logo */}
        <div className="font-bold text-xl cursor-pointer" onClick={() => go("/")}>
          Landify
        </div>

        {/* Desktop categories */}
        <div className="hidden md:flex gap-4">
          <button className="px-4 py-2 rounded-full bg-slate-100">Residential</button>
          <button className="px-4 py-2 rounded-full bg-slate-100">Land</button>
          <button className="px-4 py-2 rounded-full bg-slate-100">Commercial</button>
          <button className="px-4 py-2 rounded-full bg-slate-100">Industrial</button>
        </div>

        {/* Desktop Profile/Login */}
        {!user ? (
          <button
            onClick={() => go("/login")}
            className="hidden md:block px-4 py-2 bg-black text-white rounded-md"
          >
            Login
          </button>
        ) : (
          <button
            onClick={() => go("/profile")}
            className="hidden md:block px-4 py-2 bg-indigo-600 text-white rounded-md"
          >
            My Profile
          </button>
        )}

        {/* Mobile button */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-xl">
          ☰
        </button>
      </div>

      {/* Mobile dropdown */}
      {open && (
        <div className="md:hidden bg-white shadow p-4 space-y-3">

          <button className="w-full p-2 rounded bg-slate-100">Residential</button>
          <button className="w-full p-2 rounded bg-slate-100">Land</button>
          <button className="w-full p-2 rounded bg-slate-100">Commercial</button>
          <button className="w-full p-2 rounded bg-slate-100">Industrial</button>

          {!user ? (
            <button
              onClick={() => go("/login")}
              className="w-full p-2 bg-black text-white rounded-md"
            >
              Login
            </button>
          ) : (
            <button
              onClick={() => go("/profile")}
              className="w-full p-2 bg-indigo-600 text-white rounded-md"
            >
              My Profile
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
