"use client";

import { Home, Search, PlusCircle, MessageCircle, User } from "lucide-react";
import { useEffect, useState } from "react";
import { useSupabase } from "./SupabaseProvider";

export default function MobileNav() {
  const { supabase } = useSupabase();
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();
      setUser(data.user);
    }
    load();

    // Auto-update on login/logout
    const { data: listener } = supabase.auth.onAuthStateChange(() => load());
    return () => listener.subscription.unsubscribe();
  }, []);

  const go = (path: string) => (window.location.href = path);

  // Helper: If not logged in → force login
  const protectedRoute = (path: string) => {
    if (!user) go("/login");
    else go(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg py-2 px-6 md:hidden">
      <div className="flex justify-between items-center">

        {/* HOME */}
        <button onClick={() => go("/")} className="flex flex-col items-center text-slate-700">
          <Home className="w-6 h-6" />
          <span className="text-xs">Home</span>
        </button>

        {/* SEARCH */}
        <button onClick={() => go("/listing")} className="flex flex-col items-center text-slate-700">
          <Search className="w-6 h-6" />
          <span className="text-xs">Search</span>
        </button>

        {/* POST AD */}
        <button
          onClick={() => protectedRoute("/post-ad")}
          className="flex flex-col items-center text-indigo-600"
        >
          <PlusCircle className="w-10 h-10 text-indigo-600" />
        </button>

        {/* CHAT */}
        <button
          onClick={() => protectedRoute("/chat")}
          className="flex flex-col items-center text-slate-700"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="text-xs">Chat</span>
        </button>

        {/* PROFILE */}
        <button
          onClick={() => protectedRoute("/profile")}
          className="flex flex-col items-center text-slate-700"
        >
          <User className="w-6 h-6" />
          <span className="text-xs">{user ? "Profile" : "Login"}</span>
        </button>

      </div>
    </div>
  );
}
