"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/utils/supabaseClient";
import Link from "next/link";

export default function HomePage() {
  const [listings, setListings] = useState<any[]>([]);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);

  // Filters
  const [city, setCity] = useState("");
  const [listingType, setListingType] = useState("");
  const [priceOrder, setPriceOrder] = useState("");

  // Convert timestamp → “3 days ago”
  function timeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diff < 60) return "just now";
    if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
    if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;

    return date.toLocaleDateString();
  }

  // Load listings with filters & pagination
  async function loadListings(reset = false) {
    setLoading(true);

    let query = supabase
      .from("listings")
      .select("*")
      .range(reset ? 0 : page * 10, (page + 1) * 10 - 1)
      .order("created_at", { ascending: false });

    if (city) query = query.ilike("city", `%${city}%`);
    if (listingType) query = query.eq("listing_type", listingType);

    if (priceOrder === "low") query = query.order("price", { ascending: true });
    if (priceOrder === "high") query = query.order("price", { ascending: false });

    const { data, error } = await query;

    if (error) {
      console.error(error);
      setLoading(false);
      return;
    }

    if (reset) {
      setListings(data);
      setPage(1);
    } else {
      setListings((prev) => [...prev, ...data]);
      setPage((prev) => prev + 1);
    }

    if (data.length < 10) setHasMore(false);
    setLoading(false);
  }

  // Load first page
  useEffect(() => {
    loadListings(true);
  }, []);

  // Filters should trigger fresh reload
  useEffect(() => {
    loadListings(true);
  }, [city, listingType, priceOrder]);

  return (
    <div className="max-w-5xl mx-auto p-4 space-y-6">
      {/* TITLE */}
      <h1 className="text-2xl font-bold">Latest Listings</h1>

      {/* FILTERS */}
      <div className="bg-white p-4 rounded-xl shadow flex flex-col md:flex-row gap-4">

        <input
          type="text"
          placeholder="Search by city"
          className="border p-2 rounded-md w-full"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

        <select
          className="border p-2 rounded-md"
          value={listingType}
          onChange={(e) => setListingType(e.target.value)}
        >
          <option value="">All Types</option>
          <option value="sale">For Sale</option>
          <option value="rent">For Rent</option>
        </select>

        <select
          className="border p-2 rounded-md"
          value={priceOrder}
          onChange={(e) => setPriceOrder(e.target.value)}
        >
          <option value="">Price</option>
          <option value="low">Low → High</option>
          <option value="high">High → Low</option>
        </select>
      </div>

      {/* LISTINGS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
        {listings.map((item) => (
          <Link
            href={`/listing/${item.id}`}
            key={item.id}
            className="bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden"
          >
            <div className="h-40 bg-slate-200">
              {item.images?.length > 0 && (
                <img
                  src={item.images[0]}
                  className="w-full h-40 object-cover"
                />
              )}
            </div>

            <div className="p-3 space-y-1">
              <h3 className="font-semibold text-lg">{item.title}</h3>
              <p className="text-sm text-slate-600">
                ₹ {item.price} • {item.city}
              </p>

              <p className="text-xs text-slate-500">
                {timeAgo(item.created_at)}
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* LOAD MORE BUTTON */}
      {hasMore && (
        <button
          onClick={() => loadListings()}
          className="w-full py-3 bg-black text-white rounded-lg font-semibold"
          disabled={loading}
        >
          {loading ? "Loading..." : "Load More"}
        </button>
      )}

      {!loading && listings.length === 0 && (
        <p className="text-center text-slate-500 mt-10">No listings found.</p>
      )}
    </div>
  );
}
