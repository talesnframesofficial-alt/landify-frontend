"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";

function resolveImageUrl(path: string) {
  if (!path) return "/placeholder.jpg";
  if (path.startsWith("http")) return path;
  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-images/${encodeURIComponent(path)}`;
}

export default function MyAdsPage() {
  const [user, setUser] = useState<any>(null);
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      setLoading(true);
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
        return;
      }
      setUser(data.user);

      const { data: listings, error } = await supabase
        .from("listings")
        .select("*")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("fetch my ads error", error);
        setAds([]);
      } else {
        setAds(listings || []);
      }
      setLoading(false);
    }
    load();
  }, [router]);

  async function handleDelete(listingId: string) {
    if (!confirm("Delete this listing? This cannot be undone.")) return;

    // remove images from bucket (if any)
    const listing = ads.find((a) => a.id === listingId);
    try {
      if (Array.isArray(listing.images) && listing.images.length) {
        await supabase.storage.from("listing-images").remove(listing.images);
      }
    } catch (err) {
      console.warn("image delete error", err);
    }

    // delete listing
    const { error } = await supabase.from("listings").delete().eq("id", listingId);
    if (error) {
      alert("Failed to delete listing: " + error.message);
    } else {
      setAds((prev) => prev.filter((a) => a.id !== listingId));
      alert("Listing deleted");
    }
  }

  if (loading) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Ads</h1>

      {ads.length === 0 && (
        <div className="bg-white p-6 rounded-xl text-center">
          <p className="text-slate-600">You don't have any active ads. Post one now!</p>
          <button onClick={() => router.push("/post-ad")} className="mt-4 bg-black text-white px-4 py-2 rounded">Post Ad</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {ads.map((ad) => (
          <div key={ad.id} className="bg-white rounded-xl shadow p-3">
            <div className="h-40 w-full bg-slate-200 overflow-hidden rounded">
              <img src={(Array.isArray(ad.images) && ad.images[0]) ? resolveImageUrl(ad.images[0]) : "/placeholder.jpg"} className="w-full h-full object-cover" />
            </div>
            <div className="mt-3 flex justify-between items-start">
              <div>
                <div className="font-semibold">{ad.title}</div>
                <div className="text-sm text-slate-600">₹ {ad.price} • {ad.city}</div>
                <div className="text-xs text-slate-500 mt-1">{new Date(ad.created_at).toLocaleString()}</div>
              </div>

              <div className="flex flex-col gap-2">
                <button onClick={() => router.push(`/listing/edit/${ad.id}`)} className="px-3 py-1 bg-indigo-600 text-white rounded">Edit</button>
                <button onClick={() => handleDelete(ad.id)} className="px-3 py-1 bg-red-600 text-white rounded">Delete</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
