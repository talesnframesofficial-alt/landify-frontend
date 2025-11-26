"use client";

import { useEffect, useState } from "react";
import { Home, Search, PlusCircle, MessageCircle, User } from "lucide-react";
import { supabase } from "../utils/supabaseClient";

export default function MobileNav() {
  const [user, setUser] = useState<any>(null);

  // Check login state on mount
  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getUser();
      setUser(data?.user || null);
    };

    checkSession();
  }, []);

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

        {/* Post Ad */}
        <button
          onClick={() => go(user ? "/post-ad" : "/login")}
          className="flex flex-col items-center text-indigo-600"
        >
          <PlusCircle className="w-10 h-10" />
        </button>

        {/* Chat */}
        <button
          onClick={() => go(user ? "/chat" : "/login")}
          className="flex flex-col items-center text-slate-700"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-xs">Chat</span>
        </button>

        {/* Profile */}
        <button
          onClick={() => go(user ? "/profile" : "/login")}
          className="flex flex-col items-center text-slate-700"
        >
          <User className="w-6 h-6" />
          <span className="text-xs">
            {user ? "Profile" : "Login"}
          </span>
        </button>

      </div>
    </div>
  );
}
