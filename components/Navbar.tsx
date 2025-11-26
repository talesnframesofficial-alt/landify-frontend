"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "./SupabaseProvider";

export function Navbar() {
  const { supabase } = useSupabase();
  const [user, setUser] = useState<any>(null);

  // Load user on component mount
  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    }
    load();

    // Listen for login/logout events
    const { data: listener } = supabase.auth.onAuthStateChange(() => {
      load();
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  const go = (path: string) => (window.location.href = path);

  return (
    <nav className="fixed top-0 w-full bg-white shadow-sm z-50 h-16 flex items-center">
      <div className="container mx-auto flex justify-between items-center px-4">

        {/* Logo */}
        <div
          className="font-bold text-xl cursor-pointer"
          onClick={() => go("/")}
        >
          Landify
        </div>

        {/* Desktop Category Menu */}
        <div className="hidden md:flex gap-4">
          <button className="px-4 py-2 rounded-full bg-slate-100">Residential</button>
          <button className="px-4 py-2 rounded-full bg-slate-100">Land</button>
          <button className="px-4 py-2 rounded-full bg-slate-100">Commercial</button>
          <button className="px-4 py-2 rounded-full bg-slate-100">Industrial</button>
        </div>

        {/* RIGHT SIDE BUTTON - Login or Profile */}
        {user ? (
          <button
            onClick={() => go("/profile")}
            className="hidden md:block px-4 py-2 bg-black text-white rounded-md"
          >
            Profile
          </button>
        ) : (
          <button
            onClick={() => go("/login")}
            className="hidden md:block px-4 py-2 bg-black text-white rounded-md"
          >
            Login
          </button>
        )}

        {/* Mobile Menu Toggle For Later (optional) */}
        <button className="md:hidden text-xl">☰</button>
      </div>
    </nav>
  );
}
