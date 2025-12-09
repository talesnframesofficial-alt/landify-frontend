"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/SupabaseProvider";

function resolveImageUrl(path: string) {
  if (!path) return "/placeholder.jpg";
  if (path.startsWith("http")) return path;

  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-images/${encodeURIComponent(
    path
  )}`;
}

export default function MyAdsPage() {
  const router = useRouter();
  const { supabase } = useSupabase(); // ✅ FIXED — Correct client

  const [user, setUser] = useState<any>(null);
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // ------------------ LOAD USER + ADS ------------------
  useEffect(() => {
    async function load() {
      setLoading(true);

      // Get logged-in user
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
        return;
      }
      setUser(data.user);

      // Fetch user's ads
      const { data: listings, error } = await supabase
        .from("listings")
        .select("*")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: false });

      if (error) console.error("My Ads fetch error:", error);

      setAds(listings || []);
      setLoading(false);
    }

    load();
  }, [supabase, router]);

  // ------------------ DELETE LISTING ------------------
  async function handleDelete(listingId: string) {
    if (!confirm("Delete this listing forever?")) return;

    const listing = ads.find((a) => a.id === listingId);

    try {
      // Delete all images from bucket
      if (Array.isArray(listing?.images) && listing.images.length > 0) {
        await supabase.storage.from("listing-images").remove(listing.images);
      }
    } catch (err) {
      console.warn("Image delete error", err);
    }

    // Delete listing row
    const { error } = await supabase.from("listings").delete().eq("id", listingId);

    if (error) {
      alert("Error deleting listing: " + error.message);
    } else {
      setAds((prev) => prev.filter((a) => a.id !== listingId));
      alert("Listing deleted");
    }
  }

  // ------------------ UI ------------------
  if (loading) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">My Ads</h1>

      {/* Empty State */}
      {ads.length === 0 && (
        <div className="bg-white p-6 rounded-xl text-center shadow">
          <p className="text-slate-600">You have not posted any ads yet.</p>
          <button
            onClick={() => router.push("/post-ad")}
            className="mt-4 bg-black text-white px-4 py-2 rounded"
          >
            Post Ad
          </button>
        </div>
      )}

      {/* LIST OF ADS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        {ads.map((ad) => (
          <div key={ad.id} className="bg-white rounded-xl shadow p-3">
            {/* Image */}
            <div className="h-40 w-full rounded overflow-hidden bg-slate-200">
              <img
                src={
                  Array.isArray(ad.images) && ad.images[0]
                    ? resolveImageUrl(ad.images[0])
                    : "/placeholder.jpg"
                }
                className="w-full h-full object-cover"
              />
            </div>

            {/* Title + Info */}
            <div className="mt-3 flex justify-between items-start">
              <div>
                <div className="font-semibold">{ad.title}</div>
                <div className="text-sm text-slate-600">
                  ₹ {ad.price} • {ad.city}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {new Date(ad.created_at).toLocaleString()}
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-col gap-2">
                <button
                  onClick={() => router.push(`/listing/edit/${ad.id}`)}
                  className="px-3 py-1 bg-indigo-600 text-white rounded"
                >
                  Edit
                </button>

                <button
                  onClick={() => handleDelete(ad.id)}
                  className="px-3 py-1 bg-red-600 text-white rounded"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
