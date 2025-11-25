"use client";
import { useState } from "react";

export function Navbar() {
  const [open, setOpen] = useState(false);

  // Redirect user to login page
  const goToLogin = () => {
    window.location.href = "/login";
  };

  return (
    <nav className="fixed top-0 w-full bg-white shadow-sm z-50 h-16 flex items-center">
      <div className="container mx-auto flex justify-between items-center px-4">

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

        {/* Desktop Login */}
        <button
          onClick={goToLogin}
          className="hidden md:block px-4 py-2 bg-black text-white rounded-md"
        >
          Login
        </button>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-xl"
        >
          ☰
        </button>
      </div>

      {/* Mobile Dropdown */}
      {open && (
        <div className="md:hidden bg-white shadow p-4 space-y-3">
          <button className="w-full p-2 rounded bg-slate-100">Residential</button>
          <button className="w-full p-2 rounded bg-slate-100">Land</button>
          <button className="w-full p-2 rounded bg-slate-100">Commercial</button>
          <button className="w-full p-2 rounded bg-slate-100">Industrial</button>

          <button
            onClick={goToLogin}
            className="w-full p-2 bg-black text-white rounded-md"
          >
            Login
          </button>
        </div>
      )}
    </nav>
  );
}
