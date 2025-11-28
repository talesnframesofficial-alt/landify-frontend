"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";

function resolveImageUrl(path: string) {
  if (!path) return "/placeholder.jpg";
  if (path.startsWith("http")) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-images/${encodeURIComponent(path)}`;
}

function timeAgo(dateString?: string) {
  if (!dateString) return "";
  const d = new Date(dateString);
  const diff = Math.floor((Date.now() - d.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return d.toLocaleDateString();
}

export default function FavoritesPage() {
  const [user, setUser] = useState<any>(null);
  const [favs, setFavs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push("/login");
        return;
      }
      setUser(userData.user);

      // Try to fetch favorites table (if doesn't exist, show friendly message)
      try {
        const { data } = await supabase
          .from("favorites")
          .select(`id, listing:listing_id ( id, title, price, city, images, created_at )`)
          .eq("user_id", userData.user.id)
          .order("created_at", { ascending: false });

        // If favorites table empty or missing structure, fallback to message
        if (!data) {
          setFavs([]);
        } else {
          // map to listing objects
          const items = data
            .map((r: any) => r.listing)
            .filter(Boolean);
          setFavs(items);
        }
      } catch (err) {
        console.error("Favorites fetch error", err);
        setFavs([]);
      }

      setLoading(false);
    }
    load();
  }, [router]);

  if (loading) return <p className="text-center mt-20">Loading...</p>;

  if (!favs.length) {
    return (
      <div className="max-w-3xl mx-auto p-6 text-center">
        <h2 className="text-xl font-semibold mb-2">No favourites yet</h2>
        <p className="text-slate-600">Tap the heart on listings to add them to your wishlist.</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Your Favourites</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {favs.map((l) => (
          <div key={l.id} className="bg-white rounded-xl shadow p-3 cursor-pointer" onClick={() => router.push(`/listing/${l.id}`)}>
            <div className="h-40 w-full bg-slate-200 overflow-hidden rounded">
              <img src={ (Array.isArray(l.images) && l.images[0]) ? resolveImageUrl(l.images[0]) : "/placeholder.jpg" } className="w-full h-full object-cover" />
            </div>
            <div className="mt-3">
              <div className="font-semibold">{l.title}</div>
              <div className="text-sm text-slate-600">₹ {l.price} • {l.city}</div>
              <div className="text-xs text-slate-500 mt-1">{timeAgo(l.created_at)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
