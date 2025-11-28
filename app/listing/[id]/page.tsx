"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Phone,
  MessageCircle,
  Pencil,
  Trash2,
  Upload
} from "lucide-react";
import { supabase } from "@/utils/supabaseClient";

// ---------------- Time Ago Helper ----------------
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

// ---------------- Storage URL Resolver ----------------
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

  const [listing, setListing] = useState<any>(null);
  const [owner, setOwner] = useState<any>(null);
  const [similar, setSimilar] = useState<any[]>([]);
  const [user, setUser] = useState<any>(null);

  const [images, setImages] = useState<string[]>([]);
  const [idx, setIdx] = useState(0);

  // zoom + gestures
  const [zoom, setZoom] = useState(1);
  const [startDist, setStartDist] = useState<number | null>(null);
  const [swipeStartX, setSwipeStartX] = useState<number | null>(null);

  // favourites
  const [isFav, setIsFav] = useState(false);

  const [loading, setLoading] = useState(true);

  // --------------------- LOAD LISTING ---------------------
  useEffect(() => {
    if (!listingId) return;

    async function load() {
      setLoading(true);

      const { data: userData } = await supabase.auth.getUser();
      setUser(userData.user);

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

      // Set images
      const dbImgs = Array.isArray(listingData.images)
        ? listingData.images.map(resolveImageUrl)
        : [];
      setImages(dbImgs.length ? dbImgs : ["/placeholder.jpg"]);

      // Owner
      const { data: ownerData } = await supabase
        .from("profiles")
        .select("id, full_name, profile_photo, phone, city, bio")
        .eq("id", listingData.user_id)
        .single();
      setOwner(ownerData || null);

      // Similar listings
      const { data: simData } = await supabase
        .from("listings")
        .select("id, title, price, city, images, created_at")
        .eq("city", listingData.city)
        .neq("id", listingId)
        .limit(4)
        .order("created_at", { ascending: false });

      setSimilar(simData || []);

      // Favourite check
      if (userData.user) {
        const { data: fav } = await supabase
          .from("favorites")
          .select("*")
          .eq("user_id", userData.user.id)
          .eq("listing_id", listingId)
          .maybeSingle();

        setIsFav(!!fav);
      }

      setLoading(false);
    }

    load();
  }, [listingId]);

  // --------------------- FAVOURITES ---------------------
  async function toggleFavorite() {
    if (!user) return router.push("/login");

    if (isFav) {
      const { data: fav } = await supabase
        .from("favorites")
        .select("id")
        .eq("user_id", user.id)
        .eq("listing_id", listingId)
        .single();

      if (fav) {
        await supabase.from("favorites").delete().eq("id", fav.id);
      }

      setIsFav(false);
      return;
    }

    await supabase.from("favorites").insert({
      user_id: user.id,
      listing_id: listingId,
    });

    setIsFav(true);
  }

  // --------------------- IMAGE NAVIGATION ---------------------
  const next = () => {
    setZoom(1);
    setIdx((i) => (i + 1) % images.length);
  };
  const prev = () => {
    setZoom(1);
    setIdx((i) => (i - 1 + images.length) % images.length);
  };

  // --------------------- OWNER ACTIONS ---------------------
  const onCall = () => {
    if (!owner?.phone) return alert("Phone not available");
    window.location.href = `tel:${owner.phone}`;
  };

  const onChat = () => router.push(`/chat/${listingId}`);

  // --------------------- TOUCH EVENTS ---------------------
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

  // --------------------- ADVANCED EDITOR ---------------------

  /** Delete listing */
  async function deleteListing() {
    if (!confirm("Delete this listing?")) return;

    // delete all images first
    if (Array.isArray(listing.images)) {
      await supabase.storage.from("listing-images").remove(listing.images);
    }

    await supabase.from("listings").delete().eq("id", listingId);

    alert("Listing deleted");
    router.push("/my-ads");
  }

  /** Replace a single image */
  async function replaceImage(index: number, file: File | null) {
    if (!file) return;

    const filename = `${listingId}/${Date.now()}-${file.name}`;

    // Upload new file
    const { error: upErr } = await supabase.storage
      .from("listing-images")
      .upload(filename, file);
    if (upErr) return alert("Upload failed");

    // Delete old file
    const old = listing.images[index];
    await supabase.storage.from("listing-images").remove([old]);

    // Update DB
    const updated = [...listing.images];
    updated[index] = filename;

    await supabase.from("listings").update({
      images: updated,
    }).eq("id", listingId);

    // update UI
    listing.images = updated;
    setImages(updated.map(resolveImageUrl));
  }

  /** Add new photos */
  async function addPhotos(files: FileList | null) {
    if (!files) return;
    const arr = Array.from(files);

    if (listing.images.length + arr.length > 10) {
      return alert("Max 10 photos allowed");
    }

    const newPaths: string[] = [];

    for (const f of arr) {
      const name = `${listingId}/${Date.now()}-${f.name}`;
      await supabase.storage.from("listing-images").upload(name, f);
      newPaths.push(name);
    }

    const final = [...listing.images, ...newPaths];

    await supabase.from("listings").update({
      images: final,
    }).eq("id", listingId);

    listing.images = final;
    setImages(final.map(resolveImageUrl));
  }

  /** Remove a photo */
  async function removePhoto(index: number) {
    if (!confirm("Remove this photo?")) return;

    await supabase.storage.from("listing-images").remove([listing.images[index]]);

    const updated = listing.images.filter((_: any, i: number) => i !== index);

    await supabase.from("listings").update({
      images: updated
    }).eq("id", listingId);

    listing.images = updated;
    setImages(updated.map(resolveImageUrl));
  }

  // --------------------- RENDER ---------------------
  if (loading) return <p className="text-center mt-20">Loading...</p>;
  if (!listing) return <p className="text-center mt-20">Listing not found</p>;

  const isOwner = user && user.id === listing.user_id;

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
          className="w-full h-full object-contain transition-all"
          style={{ transform: `scale(${zoom})` }}
        />

        {/* Nav */}
        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full"
            >
              <ArrowLeft />
            </button>

            <button
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full"
            >
              <ArrowRight />
            </button>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/60 text-white px-3 py-1 text-xs rounded-full">
              {idx + 1}/{images.length}
            </div>
          </>
        )}

        {/* Favourite */}
        <button
          onClick={toggleFavorite}
          className="absolute top-3 right-3 bg-white/90 p-2 rounded-full shadow"
        >
          <Heart
            className={`w-6 h-6 ${isFav ? "text-red-500" : "text-gray-400"}`}
            fill={isFav ? "red" : "none"}
          />
        </button>
      </div>


      {/* ---------------- OWNER TOOLS (ADVANCED EDITOR) ---------------- */}
      {isOwner && (
        <div className="bg-white p-4 rounded-xl shadow space-y-4">

          <h2 className="text-lg font-semibold">Manage Photos</h2>

          {/* Existing photos */}
          <div className="grid grid-cols-3 gap-3">
            {listing.images.map((img: string, index: number) => (
              <div key={index} className="relative">
                <img
                  src={resolveImageUrl(img)}
                  className="h-28 w-full object-cover rounded-lg"
                />

                <div className="mt-1 flex gap-1">
                  {/* Replace button */}
                  <label className="flex-1 bg-slate-100 p-1 text-xs text-center rounded cursor-pointer">
                    Replace
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) =>
                        replaceImage(index, e.target.files?.[0] || null)
                      }
                    />
                  </label>

                  {/* Delete button */}
                  <button
                    onClick={() => removePhoto(index)}
                    className="flex-1 bg-red-600 text-white text-xs p-1 rounded"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Add new photos */}
          <div>
            <label className="font-semibold block mb-1">Add More Photos</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => addPhotos(e.target.files)}
              className="p-2 border rounded w-full"
            />
          </div>

          {/* Full Edit Page */}
          <button
            onClick={() => router.push(`/listing/edit/${listingId}`)}
            className="w-full bg-black text-white py-3 rounded-xl flex items-center justify-center gap-2 mt-3"
          >
            <Pencil className="w-5 h-5" />
            Full Edit Page
          </button>

          {/* Delete Listing */}
          <button
            onClick={deleteListing}
            className="w-full bg-red-600 text-white py-3 rounded-xl flex items-center justify-center gap-2"
          >
            <Trash2 className="w-5 h-5" />
            Delete Listing
          </button>
        </div>
      )}

      {/* TITLE, PRICE, OWNER INFO, SIMILAR LISTINGS (UNCHANGED) */}
      {/* ---------- Your existing content continues below ---------- */}

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
