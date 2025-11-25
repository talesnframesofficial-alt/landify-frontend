"use client";

import { Home, Search, PlusCircle, MessageCircle, User } from "lucide-react";

export default function MobileNav() {
  // Simple redirect helper
  const go = (path: string) => {
    window.location.href = path;
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg py-2 px-6 md:hidden">
      <div className="flex justify-between items-center">

        {/* Home */}
        <button
          onClick={() => go("/")}
          className="flex flex-col items-center text-slate-700"
        >
          <Home className="w-6 h-6" />
          <span className="text-xs">Home</span>
        </button>

        {/* Search */}
        <button
          onClick={() => go("/listing")}
          className="flex flex-col items-center text-slate-700"
        >
          <Search className="w-6 h-6" />
          <span className="text-xs">Search</span>
        </button>

        {/* Post Ad (center button) */}
        <button
          onClick={() => go("/login")} // Later change to /post-ad when logged in
          className="flex flex-col items-center text-indigo-600"
        >
          <PlusCircle className="w-10 h-10 text-indigo-600" />
        </button>

        {/* Chat */}
        <button
          onClick={() => go("/login")} // Later go to chat list
          className="flex flex-col items-center text-slate-700"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-xs">Chat</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => go("/login")} // Later go to /profile
          className="flex flex-col items-center text-slate-700"
        >
          <User className="w-6 h-6" />
          <span className="text-xs">Profile</span>
        </button>

      </div>
    </div>
  );
}
