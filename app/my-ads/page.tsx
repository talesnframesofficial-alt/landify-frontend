"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";
import { Trash2, Eye } from "lucide-react";

export default function MyAdsPage() {
  const router = useRouter();
  const [ads, setAds] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.auth.getUser();

      if (!data.user) {
        router.push("/login");
        return;
      }

      setUserId(data.user.id);

      const { data: listings } = await supabase
        .from("listings")
        .select("*")
        .eq("user_id", data.user.id)
        .order("created_at", { ascending: false });

      setAds(listings || []);
      setLoading(false);
    }

    load();
  }, []);

  async function deleteAd(id: string) {
    if (!confirm("Delete this ad?")) return;

    await supabase.from("listings").delete().eq("id", id);

    setAds((prev) => prev.filter((a) => a.id !== id));
  }

  if (loading) return <p className="text-center mt-10">Loading your ads...</p>;

  return (
    <div className="max-w-3xl mx-auto p-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">My Ads</h1>

      {ads.length === 0 && (
        <p className="text-center text-slate-500">You haven't posted any ads.</p>
      )}

      {ads.map((ad) => (
        <div
          key={ad.id}
          className="bg-white p-4 rounded-xl shadow-sm flex justify-between items-center"
        >
          <div>
            <h2 className="font-semibold">{ad.title}</h2>
            <p className="text-sm text-slate-500">₹ {ad.price}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => router.push(`/listing/${ad.id}`)}
              className="p-2 bg-indigo-600 text-white rounded-lg"
            >
              <Eye className="w-4 h-4" />
            </button>

            <button
              onClick={() => deleteAd(ad.id)}
              className="p-2 bg-red-500 text-white rounded-lg"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
