"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";

export default function FavoritesPage() {
  const router = useRouter();
  const [favorites, setFavorites] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadFav() {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) {
        router.push("/login");
        return;
      }

      const { data } = await supabase
        .from("favorites")
        .select(`
          id,
          listing:listing_id (
            id,
            title,
            price,
            images,
            city,
            created_at
          )
        `)
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      setFavorites(data || []);
      setLoading(false);
    }

    loadFav();
  }, []);

  if (loading) return <p className="text-center mt-20">Loading...</p>;

  if (favorites.length === 0)
    return <p className="text-center mt-20">No favourites added yet.</p>;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">My Wishlist</h1>

      {favorites.map((fav) => (
        <div
          key={fav.id}
          className="bg-white rounded-xl shadow-sm p-4 flex items-center gap-4 cursor-pointer"
          onClick={() => router.push(`/listing/${fav.listing.id}`)}
        >
          <img
            src={
              fav.listing.images?.[0] ||
              "/placeholder.jpg"
            }
            className="w-20 h-20 rounded-lg object-cover"
          />

          <div>
            <h2 className="font-semibold">{fav.listing.title}</h2>
            <p className="text-sm text-slate-600">₹ {fav.listing.price}</p>
            <p className="text-xs text-slate-500">{fav.listing.city}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
