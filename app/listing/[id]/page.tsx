"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Phone,
  MessageCircle,
} from "lucide-react";
import { supabase } from "@/utils/supabaseClient";

// Format "time ago"
function timeAgo(dateString?: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const diff = (Date.now() - date.getTime()) / 1000;

  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hours ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} days ago`;
  return date.toLocaleDateString();
}

// Convert image path → public URL
function resolveImageUrl(path: string) {
  if (!path) return "/placeholder.jpg";

  if (path.startsWith("http")) return path;

  return `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/listing-images/${encodeURIComponent(
    path
  )}`;
}

export default function ListingPage() {
  const { id: listingId } = useParams();
  const router = useRouter();

  // States
  const [listing, setListing] = useState<any>(null);
  const [owner, setOwner] = useState<any>(null);
  const [similar, setSimilar] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Images & Viewer Controls
  const [images, setImages] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);

  const [zoom, setZoom] = useState(1);
  const [startDist, setStartDist] = useState<number | null>(null);
  const [swipeStartX, setSwipeStartX] = useState<number | null>(null);

  // Load everything
  useEffect(() => {
    if (!listingId) return;

    async function load() {
      setLoading(true);

      // Fetch listing
      const { data: listingData } = await supabase
        .from("listings")
        .select("*")
        .eq("id", listingId)
        .single();

      if (!listingData) {
        setListing(null);
        setLoading(false);
        return;
      }

      setListing(listingData);

      // Prepare images
      const databaseImages = Array.isArray(listingData.images)
        ? listingData.images.map(resolveImageUrl)
        : [];

      setImages(
        databaseImages.length > 0 ? databaseImages : ["/placeholder.jpg"]
      );

      // Fetch owner
      const { data: ownerData } = await supabase
        .from("profiles")
        .select("id, full_name, profile_photo, phone, city, bio")
        .eq("id", listingData.user_id)
        .single();

      setOwner(ownerData || null);

      // Fetch similar listings
      const { data: simData } = await supabase
        .from("listings")
        .select("id, title, price, city, images, created_at")
        .eq("city", listingData.city)
        .neq("id", listingId)
        .limit(4)
        .order("created_at", { ascending: false });

      setSimilar(simData || []);

      setLoading(false);
    }

    load();
  }, [listingId]);

  // Move images
  const next = () => {
    setZoom(1);
    setIdx((i) => (i + 1) % images.length);
  };
  const prev = () => {
    setZoom(1);
    setIdx((i) => (i - 1 + images.length) % images.length);
  };

  // Call owner
  function onCall() {
    if (!owner?.phone) {
      alert("Phone not available");
      return;
    }
    window.location.href = `tel:${owner.phone}`;
  }

  // Chat redirect
  function onChat() {
    router.push(`/chat/${listingId}`);
  }

  // Zoom logic
  function handleTouchStart(e: any) {
    if (e.touches.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      setStartDist(Math.sqrt(dx * dx + dy * dy));
    } else {
      setSwipeStartX(e.touches[0].clientX);
    }
  }

  function handleTouchMove(e: any) {
    if (e.touches.length === 2 && startDist) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      const newZoom = Math.min(Math.max((dist / startDist) * zoom, 1), 3);
      setZoom(newZoom);
      return;
    }

    if (e.touches.length === 1 && swipeStartX !== null) {
      const diff = e.touches[0].clientX - swipeStartX;

      if (Math.abs(diff) > 60) {
        diff > 0 ? prev() : next();
        setSwipeStartX(null);
      }
    }
  }

  if (loading) return <p className="text-center mt-20">Loading...</p>;
  if (!listing) return <p className="text-center mt-20">Listing not found</p>;

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      {/* IMAGE VIEWER */}
      <div
        className="relative w-full h-64 md:h-96 bg-black rounded-xl overflow-hidden touch-none"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={() => setStartDist(null)}
      >
        <img
          src={images[idx]}
          className="w-full h-full object-contain transition-all duration-200"
          style={{
            transform: `scale(${zoom})`,
          }}
          onDoubleClick={() => setZoom(zoom === 1 ? 2 : 1)}
        />

        {/* Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>

            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow"
            >
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 rounded-full text-xs">
              {idx + 1}/{images.length}
            </div>
          </>
        )}

        {/* Favourite */}
        <button
          className="absolute top-3 right-3 bg-white/90 p-2 rounded-full shadow"
          onClick={() => alert("Saved to favourites!")}
        >
          <Heart className="w-6 h-6 text-red-500" />
        </button>
      </div>

      {/* THUMBNAILS */}
      <div className="flex gap-2 overflow-x-auto">
        {images.map((img, i) => (
          <img
            key={i}
            src={img}
            onClick={() => {
              setZoom(1);
              setIdx(i);
            }}
            className={`w-16 h-16 rounded-lg object-cover cursor-pointer border ${
              i === idx ? "border-black" : "border-transparent"
            }`}
          />
        ))}
      </div>

      {/* TITLE + PRICE */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{listing.title}</h1>
          <p className="text-sm text-slate-500">{listing.city}</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-green-600">₹ {listing.price}</p>
          <p className="text-xs text-slate-500">{timeAgo(listing.created_at)}</p>
        </div>
      </div>

      {/* OWNER */}
      <div className="bg-white p-4 rounded-xl shadow flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img
            src={
              owner?.profile_photo
                ? resolveImageUrl(owner.profile_photo)
                : "/default-avatar.png"
            }
            className="w-14 h-14 rounded-full object-cover border"
          />
          <div>
            <p className="font-semibold">{owner?.full_name || "User"}</p>
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

      {/* DESCRIPTION */}
      <div className="bg-white p-4 rounded-xl shadow">
        <h2 className="text-lg font-semibold mb-2">Description</h2>
        <p className="text-sm text-slate-700">{listing.description}</p>
      </div>

      {/* SIMILAR LISTINGS */}
      {similar.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">
            Similar listings in {listing.city}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {similar.map((s) => (
              <div
                key={s.id}
                onClick={() => router.push(`/listing/${s.id}`)}
                className="bg-white rounded-xl shadow hover:shadow-md cursor-pointer"
              >
                <img
                  src={
                    s.images?.length
                      ? resolveImageUrl(s.images[0])
                      : "/placeholder.jpg"
                  }
                  className="w-full h-32 object-cover rounded-t-xl"
                />
                <div className="p-3">
                  <p className="font-semibold">{s.title}</p>
                  <p className="text-sm text-slate-600">₹ {s.price}</p>
                  <p className="text-xs text-slate-500">
                    {timeAgo(s.created_at)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
