"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";
import { Camera, Trash2, MapPin } from "lucide-react";

export default function PostAdPage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [listingType, setListingType] = useState<"sale" | "rent">("sale");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  // Images
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  // Autocomplete suggestions
  const [q, setQ] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // On mount, fetch user session
  useEffect(() => {
    let mounted = true;
    async function loadUser() {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!mounted) return;
      if (!user) {
        // not signed in — redirect to login page (change route as you have)
        router.push("/login");
        return;
      }
      setUser(user);
      setLoadingUser(false);
    }
    loadUser();
    return () => {
      mounted = false;
    };
  }, [router]);

  // Watch address query → fetch suggestions (Nominatim)
  useEffect(() => {
    if (!q || q.length < 3) {
      setSuggestions([]);
      return;
    }

    const controller = new AbortController();
    const fetchSuggestions = async () => {
      try {
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          q
        )}&addressdetails=1&limit=6`;
        const res = await fetch(url, { signal: controller.signal, headers: { "User-Agent": "Landify/1.0 (you@yourdomain.com)" }});
        const data = await res.json();
        setSuggestions(data || []);
      } catch (err) {
        // ignore
      }
    };

    const t = setTimeout(fetchSuggestions, 300);
    return () => {
      clearTimeout(t);
      controller.abort();
    };
  }, [q]);

  // handle local image selection + preview
  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files;
    if (!selected) return;
    const arr = Array.from(selected);
    if (files.length + arr.length > 10) {
      alert("Maximum 10 images allowed");
      return;
    }
    setFiles((prev) => [...prev, ...arr]);
    const newPreviews = arr.map((f) => URL.createObjectURL(f));
    setPreviews((p) => [...p, ...newPreviews]);
  }

  function removeImage(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  }

  // When user selects a suggestion, fill lat/lng and address
  function selectSuggestion(s: any) {
    setAddress(s.display_name);
    setLat(parseFloat(s.lat));
    setLng(parseFloat(s.lon));
    setCity(s.address?.city || s.address?.town || s.address?.village || "");
    setSuggestions([]);
    setQ(s.display_name);
  }

  // Upload one file to supabase storage and return public URL
  async function uploadFile(userId: string, file: File) {
    const timestamp = Date.now();
    const safeName = file.name.replaceAll(/\s+/g, "-");
    const path = `${userId}/${timestamp}-${safeName}`;

    const { error: uploadError } = await supabase.storage
      .from("listing-images")
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
    return data.publicUrl;
  }

  // Submit listing: upload all images then insert listing row
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      alert("Please sign in first");
      return;
    }
    if (!title || !description || !price) {
      alert("Title, description and price are required");
      return;
    }

    setIsSubmitting(true);

    try {
      // Upload images sequentially (OK for up to 10)
      const uploadedUrls: string[] = [];
      for (const f of files) {
        const url = await uploadFile(user.id, f);
        uploadedUrls.push(url);
      }

      // Insert into listings table
      const insertPayload = {
        user_id: user.id,
        title,
        description,
        price: price.toString(),
        city,
        sqft: null,
        listing_type: listingType,
        images: uploadedUrls,
        lat,
        lng,
      };

      const { data, error } = await supabase.from("listings").insert(insertPayload).select("id").single();

      if (error) throw error;

      const newId = data.id;
      // redirect to listing page
      router.push(`/listing/${newId}`);
    } catch (err: any) {
      console.error(err);
      alert("Error posting listing: " + (err.message || JSON.stringify(err)));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loadingUser) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-6">Post Your Property</h1>

      <form onSubmit={handleSubmit} className="space-y-6">

        <div>
          <label className="block font-semibold mb-1">Title</label>
          <input value={title} onChange={(e) => setTitle(e.target.value)} name="title"
            className="w-full mt-1 p-3 border rounded-xl" placeholder="3BHK Luxury Apartment" required />
        </div>

        <div>
          <label className="block font-semibold mb-1">Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} name="description"
            className="w-full mt-1 p-3 border rounded-xl" rows={4} placeholder="Write about your property..." required />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold mb-1">Price</label>
            <input value={price} onChange={(e) => setPrice(e.target.value)} name="price" type="number"
              className="w-full mt-1 p-3 border rounded-xl" placeholder="6500000" required />
          </div>

          <div>
            <label className="block font-semibold mb-1">Type</label>
            <select value={listingType} onChange={(e) => setListingType(e.target.value as any)} name="type"
              className="w-full mt-1 p-3 border rounded-xl">
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block font-semibold mb-1">City</label>
          <input value={city} onChange={(e) => setCity(e.target.value)} name="city"
            className="w-full mt-1 p-3 border rounded-xl" placeholder="Chennai" />
        </div>

        <div>
          <label className="block font-semibold mb-1">Address / Search place</label>
          <div className="relative">
            <div className="flex items-center gap-2">
              <MapPin />
              <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Type address or area"
                className="w-full mt-1 p-3 border rounded-xl" />
            </div>

            {suggestions.length > 0 && (
              <div className="absolute left-0 right-0 bg-white shadow rounded mt-2 max-h-72 overflow-auto z-40">
                {suggestions.map((s, i) => (
                  <button key={i}
                    type="button"
                    onClick={() => selectSuggestion(s)}
                    className="w-full text-left px-3 py-2 hover:bg-slate-50"
                  >
                    <div className="text-sm font-medium">{s.display_name}</div>
                    <div className="text-xs text-slate-500">{s.type}</div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* show chosen address input */}
          <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Selected address"
            className="w-full mt-2 p-3 border rounded-xl" />
          {/* small map preview if lat/lng */}
          {lat && lng && (
            <div className="mt-3">
              <iframe
                title="map"
                width="100%"
                height="220"
                frameBorder="0"
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${lng - 0.01}%2C${lat - 0.01}%2C${lng + 0.01}%2C${lat + 0.01}&layer=mapnik&marker=${lat}%2C${lng}`}
                style={{ borderRadius: 12 }}
              />
              <div className="text-xs text-slate-500 mt-1">Map preview (OpenStreetMap)</div>
            </div>
          )}
        </div>

        {/* UPLOAD IMAGES */}
        <div>
          <label className="block font-semibold mb-2">Upload Images (Max 10)</label>

          <div className="border border-dashed rounded-xl p-4">
            <input id="file-input" type="file" accept="image/*" multiple
              onChange={handleFilesSelected}
              className="hidden" />
            <label htmlFor="file-input" className="cursor-pointer flex flex-col items-center gap-2">
              <Camera size={28} />
              <div className="text-sm text-slate-600">Click to choose images or drag & drop (not implemented)</div>
            </label>

            <div className="grid grid-cols-3 gap-3 mt-4">
              {previews.map((p, idx) => (
                <div key={idx} className="relative">
                  <img src={p} className="h-28 w-full object-cover rounded-lg" />
                  <button type="button" onClick={() => removeImage(idx)}
                    className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button type="submit" disabled={isSubmitting}
          className="w-full bg-black text-white py-3 rounded-xl font-semibold">
          {isSubmitting ? "Posting..." : "Post Ad"}
        </button>

      </form>
    </div>
  );
}
