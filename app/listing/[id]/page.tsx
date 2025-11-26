"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { supabase } from "@/utils/supabaseClient";
import { Heart, Phone, MessageCircle } from "lucide-react";

// Day difference formatter
function timeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));

  if (diff === 0) return "Today";
  if (diff === 1) return "1 day ago";
  return `${diff} days ago`;
}

export default function ListingDetailPage() {
  const { id } = useParams();
  const [listing, setListing] = useState<any>(null);
  const [owner, setOwner] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Load listing
  useEffect(() => {
    async function loadData() {
      const { data: listingData } = await supabase
        .from("listings")
        .select("*")
        .eq("id", id)
        .single();

      if (!listingData) {
        setLoading(false);
        return;
      }

      setListing(listingData);

      // Load owner profile
      const { data: profileData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", listingData.user_id)
        .single();

      setOwner(profileData);
      setLoading(false);
    }

    loadData();
  }, [id]);

  if (loading) return <p className="text-center mt-20">Loading...</p>;
  if (!listing) return <p className="text-center mt-20">Listing not found</p>;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">

      {/* IMAGES */}
      <div className="relative w-full h-64 md:h-96 rounded-xl overflow-hidden bg-slate-200">
        {listing.images?.length > 0 ? (
          <img
            src={listing.images[0]}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-slate-300" />
        )}

        <button className="absolute top-3 right-3 p-2 bg-white rounded-full shadow">
          <Heart className="w-6 h-6 text-red-500" />
        </button>
      </div>

      {/* TITLE + PRICE */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{listing.title}</h1>
        <span className="text-xl font-semibold text-green-600">
          ₹ {listing.price}
        </span>
      </div>

      {/* CITY + CATEGORY */}
      <p className="text-slate-600 text-sm">
        {listing.city} • {listing.listing_type?.toUpperCase()}
      </p>

      {/* POSTED TIME */}
      <p className="text-xs text-slate-500">Posted: {timeAgo(listing.created_at)}</p>

      {/* OWNER */}
      <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between">
        <div>
          <p className="font-semibold">
            Owner: {owner?.full_name || "Unknown User"}
          </p>
          <p className="text-sm text-blue-600">✔ Verified Owner</p>
        </div>

        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg">
            <MessageCircle className="w-5 h-5" /> Chat
          </button>

          <a
            href={`tel:${owner?.phone || ""}`}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            <Phone className="w-5 h-5" /> Call
          </a>
        </div>
      </div>

      {/* DETAILS */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Property Info</h2>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Built-up Area</p>
            <p className="font-semibold">{listing.sqft} sqft</p>
          </div>

          <div>
            <p className="text-slate-500">Type</p>
            <p className="font-semibold">{listing.listing_type}</p>
          </div>

          <div>
            <p className="text-slate-500">City</p>
            <p className="font-semibold">{listing.city}</p>
          </div>

          <div>
            <p className="text-slate-500">Listed On</p>
            <p className="font-semibold">{new Date(listing.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Description</h2>
        <p className="text-sm text-slate-700 leading-relaxed">
          {listing.description}
        </p>
      </div>

      {/* MAP (future feature) */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Location</h2>
        <div className="w-full h-56 bg-slate-200 rounded-xl"></div>
      </div>
    </div>
  );
}
