"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Heart, Phone, MessageCircle } from "lucide-react";
import { supabase } from "@/utils/supabaseClient";

function timeAgo(dateString?: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return date.toLocaleDateString();
}

export default function ListingPage() {
  const params = useParams() as { id?: string };
  const router = useRouter();
  const listingId = params?.id ?? "";

  const [listing, setListing] = useState<any | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);
  const [owner, setOwner] = useState<any | null>(null);
  const [similar, setSimilar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any | null>(null);

  // Build public URL for stored image (if not full URL)
  function resolveImageUrl(path: string) {
    if (!path) return "/placeholder.jpg";
    if (path.startsWith("http") || path.startsWith("data:")) return path;
    // assume stored in bucket 'listing-images'
    return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-images/${encodeURIComponent(path)}`;
  }

  useEffect(() => {
    if (!listingId) return;

    async function loadAll() {
      setLoading(true);

      // get listing
      const { data: listingData, error: listingErr } = await supabase
        .from("listings")
        .select("*")
        .eq("id", listingId)
        .single();

      if (listingErr || !listingData) {
        console.error("Listing fetch error", listingErr);
        setListing(null);
        setLoading(false);
        return;
      }

      setListing(listingData);

      // Images: listing.images might be text[] of URLs or paths
      const imgs: string[] =
        Array.isArray(listingData.images) && listingData.images.length > 0
          ? listingData.images.map((i: string) => resolveImageUrl(i))
          : [];

      setImages(imgs.length ? imgs : ["/placeholder.jpg"]);
      setIdx(0);

      // owner profile (profiles table)
      if (listingData.user_id) {
        const { data: ownerData } = await supabase
          .from("profiles")
          .select("id, full_name, profile_photo, phone, city, bio")
          .eq("id", listingData.user_id)
          .single();
        setOwner(ownerData || null);
      } else {
        setOwner(null);
      }

      // similar listings (same city)
      const { data: simData } = await supabase
        .from("listings")
        .select("id, title, price, city, images, created_at")
        .eq("city", listingData.city)
        .neq("id", listingId)
        .limit(4)
        .order("created_at", { ascending: false });
      setSimilar(simData || []);

      // current user (for chat / call logic)
      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user ?? null);

      setLoading(false);
    }

    loadAll();
  }, [listingId]);

  function nextImage() {
    setIdx((prev) => (prev + 1) % images.length);
  }
  function prevImage() {
    setIdx((prev) => (prev - 1 + images.length) % images.length);
  }

  async function onChat() {
    if (!user) {
      router.push("/login");
      return;
    }
    // simple routing to chat page — your chat route may accept listing id or chat id
    router.push(`/chat/${listingId}`);
  }

  function onCall() {
    const phone = owner?.phone || listing?.phone;
    if (!phone) {
      alert("Owner phone not available");
      return;
    }
    // open dialer
    window.location.href = `tel:${phone}`;
  }

  if (loading) return <p className="text-center mt-20">Loading...</p>;
  if (!listing) return <p className="text-center mt-20">Listing not found.</p>;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* Image hero */}
      <div className="relative w-full h-64 md:h-96 bg-slate-200 rounded-xl overflow-hidden">
        <img
          src={images[idx]}
          alt={listing.title}
          className="w-full h-full object-cover"
        />
        {/* controls */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 p-2 rounded-full shadow"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
            <div className="absolute left-1/2 -translate-x-1/2 bottom-3 bg-black/60 text-white text-xs px-3 py-1 rounded-full">
              {idx + 1}/{images.length}
            </div>
          </>
        )}

        <button
          className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow"
          onClick={() => {
            // wishlist action placeholder
            alert("Saved to favourites");
          }}
        >
          <Heart className="w-6 h-6 text-red-500" />
        </button>
      </div>

      {/* Title and price */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{listing.title}</h1>
          <p className="text-sm text-slate-600">{listing.city} • {listing.sqft || "-"}</p>
        </div>

        <div className="text-right">
          <div className="text-2xl font-semibold text-green-600">₹ {listing.price}</div>
          <div className="text-xs text-slate-500">{timeAgo(listing.created_at)}</div>
        </div>
      </div>

      {/* Owner + actions */}
      <div className="bg-white p-4 rounded-xl shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-slate-100">
            <img
              src={
                owner?.profile_photo
                  ? (owner.profile_photo.startsWith("http")
                      ? owner.profile_photo
                      : `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/avatars/${encodeURIComponent(owner.profile_photo)}`)
                  : "/default-avatar.png"
              }
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <p className="font-semibold">{owner?.full_name || "Private user"}</p>
            <p className="text-sm text-slate-500">{owner?.city || ""}</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={onChat}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg"
          >
            <MessageCircle className="w-5 h-5" /> Chat
          </button>

          <button
            onClick={onCall}
            className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg"
          >
            <Phone className="w-5 h-5" /> Call
          </button>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Description</h2>
        <p className="text-sm text-slate-700 leading-relaxed">
          {listing.description || "No description provided."}
        </p>
      </div>

      {/* Map placeholder */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Location</h2>
        <div className="w-full h-44 bg-slate-200 rounded-xl flex items-center justify-center text-sm text-slate-600">
          Map (lat: {listing.lat ?? "-"}, lng: {listing.lng ?? "-"})
        </div>
      </div>

      {/* Similar listings */}
      {similar.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Similar listings in {listing.city}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {similar.map((s) => (
              <div
                key={s.id}
                onClick={() => router.push(`/listing/${s.id}`)}
                className="bg-white rounded-xl shadow-sm hover:shadow-md transition cursor-pointer overflow-hidden"
              >
                <div className="h-28 bg-slate-200">
                  {s.images?.length > 0 ? (
                    <img src={Array.isArray(s.images) ? resolveImageUrl(s.images[0]) : s.images} className="w-full h-28 object-cover" />
                  ) : (
                    <div className="w-full h-28 bg-slate-200" />
                  )}
                </div>

                <div className="p-3">
                  <div className="font-semibold">{s.title}</div>
                  <div className="text-sm text-slate-600">₹ {s.price}</div>
                  <div className="text-xs text-slate-500">{timeAgo(s.created_at)}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
