"use client";

import { useEffect, useState } from "react";
import { useSupabase } from "../components/SupabaseProvider";

export function Navbar() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<any>(null);

  const { supabase } = useSupabase();

  // Load session on navbar load
  useEffect(() => {
    const getSession = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };

    getSession();

    // Listen for changes (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  const goToLogin = () => {
    window.location.href = "/login";
  };

  const goToProfile = () => {
    window.location.href = "/profile";
  };

  return (
    <nav className="fixed top-0 w-full bg-white shadow-sm z-50 h-16 flex items-center">
      <div className="container mx-auto flex justify-between items-center px-4">

        {/* LOGO */}
        <div
          className="font-bold text-xl cursor-pointer"
          onClick={() => (window.location.href = "/")}
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

        {/* Desktop Auth Button */}
        {!user ? (
          <button
            onClick={goToLogin}
            className="hidden md:block px-4 py-2 bg-black text-white rounded-md"
          >
            Login
          </button>
        ) : (
          <button
            onClick={goToProfile}
            className="hidden md:block px-4 py-2 bg-indigo-600 text-white rounded-md"
          >
            My Profile
          </button>
        )}

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-xl"
        >
          ☰
        </button>
      </div>

      {/* MOBILE MENU */}
      {open && (
        <div className="md:hidden bg-white shadow p-4 space-y-3">
          <button className="w-full p-2 rounded bg-slate-100">Residential</button>
          <button className="w-full p-2 rounded bg-slate-100">Land</button>
          <button className="w-full p-2 rounded bg-slate-100">Commercial</button>
          <button className="w-full p-2 rounded bg-slate-100">Industrial</button>

          {!user ? (
            <button
              onClick={goToLogin}
              className="w-full p-2 bg-black text-white rounded-md"
            >
              Login
            </button>
          ) : (
            <button
              onClick={goToProfile}
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
