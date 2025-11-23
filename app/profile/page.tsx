"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
    });
  }, []);

  if (!user)
    return <p className="text-center py-10">Loading profile...</p>;

  return (
    <div className="container mx-auto px-4 py-10 max-w-lg space-y-6">
      <h1 className="text-2xl font-bold">My Profile</h1>

      <div className="bg-white rounded-xl p-4 shadow space-y-2">
        <p><strong>Phone:</strong> {user.phone}</p>
        <p><strong>User ID:</strong> {user.id}</p>
      </div>

      <button
        className="bg-red-600 text-white p-3 rounded-lg w-full"
        onClick={async () => {
          await supabase.auth.signOut();
          window.location.href = "/login";
        }}
      >
        Logout
      </button>
    </div>
  );
}
