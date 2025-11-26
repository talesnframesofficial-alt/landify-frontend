"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";

function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diff === 0) return "Today";
  if (diff === 1) return "1 day ago";
  return `${diff} days ago`;
}

export default function HomePage() {
  const router = useRouter();
  const [listings, setListings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadListings() {
    setLoading(true);

    const { data } = await supabase
      .from("listings")
      .select("*")
      .order("created_at", { ascending: false });

    setListings(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadListings();
  }, []);

  if (loading) {
    return <p className="text-center mt-20">Loading listings…</p>;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-xl font-bold mb-4">Latest Listings</h1>

      {/* GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">

        {listings.map((item) => (
          <div
            key={item.id}
            onClick={() => router.push(`/listing/${item.id}`)}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition cursor-pointer"
          >
            {/* IMAGE */}
            <div className="h-32 sm:h-40 bg-slate-200 rounded-t-xl overflow-hidden">
              {item.images?.length > 0 ? (
                <img
                  src={item.images[0]}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-slate-300" />
              )}
            </div>

            {/* DETAILS */}
            <div className="p-3">
              <p className="font-semibold text-sm line-clamp-1">{item.title}</p>

              <p className="text-green-600 font-bold mt-1">
                ₹ {item.price}
              </p>

              <p className="text-xs text-slate-500">
                {item.city}
              </p>

              <p className="text-xs text-slate-400">
                {timeAgo(item.created_at)}
              </p>
            </div>
          </div>
        ))}

      </div>
    </div>
  );
}
