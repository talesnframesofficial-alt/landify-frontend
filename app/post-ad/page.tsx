"use client";

import { useState, useEffect } from "react";
import { Upload, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useSupabase } from "@/components/SupabaseProvider";

export default function PostAdPage() {
  const router = useRouter();
  const { supabase } = useSupabase(); // Correct client

  const [userId, setUserId] = useState<string | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [preview, setPreview] = useState<string[]>([]);

  // Check login
  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login");
        return;
      }
      setUserId(data.user.id);
    }
    checkUser();
  }, [supabase, router]);

  // Upload previews
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const list = Array.from(files);
    if (photos.length + list.length > 10) {
      alert("Max 10 photos allowed!");
      return;
    }

    setPhotos((prev) => [...prev, ...list]);
    setPreview((prev) => [...prev, ...list.map((f) => URL.createObjectURL(f))]);
  };

  const removePhoto = (i: number) => {
    setPhotos((prev) => prev.filter((_, idx) => idx !== i));
    setPreview((prev) => prev.filter((_, idx) => idx !== i));
  };

  // Submit Ad
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!userId) return alert("Please login first");

    let photoUrls: string[] = [];

    // Upload images
    if (photos.length > 0) {
      const formData = new FormData();
      photos.forEach((p) => formData.append("files", p));

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();
      if (uploadData.error) {
        alert("Image upload failed!");
        return;
      }

      photoUrls = uploadData.urls;
    }

    // Prepare body
    const body = {
      title: e.target.title.value,
      description: e.target.description.value,
      price: e.target.price.value,
      sqft: e.target.sqft.value,
      city: e.target.city.value,

      // NEW STRUCTURE:
      category_main: e.target.category_main.value, // sale/rent
      category_type: e.target.category_type.value, // residential/commercial/land/industrial

      photoUrls,
    };

    const res = await fetch("/api/listings/create", {
      method: "POST",
      body: JSON.stringify(body),
    });

    const result = await res.json();
    if (result.error) return alert(result.error);

    alert("Ad posted successfully!");
    router.push("/");
  };

  return (
    <div className="max-w-3xl mx-auto p-5 space-y-6">
      <h1 className="text-2xl font-bold">Post Your Ad</h1>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* IMAGES */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <label className="font-semibold block mb-2">Upload Photos (Max 10)</label>

          <div className="grid grid-cols-3 gap-3">
            {preview.map((src, i) => (
              <div key={i} className="relative group">
                <img src={src} className="h-28 w-full object-cover rounded-lg border" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 bg-white rounded-full p-1 shadow"
                >
                  <XCircle className="w-5 h-5 text-red-500" />
                </button>
              </div>
            ))}

            {photos.length < 10 && (
              <label className="flex flex-col items-center justify-center border border-dashed border-slate-400 rounded-lg h-28 cursor-pointer hover:bg-slate-50">
                <Upload className="w-6 h-6 mb-1" />
                <span className="text-xs">Add Photos</span>
                <input type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
              </label>
            )}
          </div>
        </div>

        {/* FORM FIELDS */}
        <div className="bg-white p-4 rounded-xl shadow-sm space-y-4">

          <div>
            <label className="font-semibold block mb-1">Ad Title</label>
            <input name="title" type="text" required className="w-full border p-2 rounded-lg" />
          </div>

          <div>
            <label className="font-semibold block mb-1">Description</label>
            <textarea name="description" rows={4} required className="w-full border p-2 rounded-lg" />
          </div>

          {/* PRICE + SQFT */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold block mb-1">Price</label>
              <input name="price" type="number" required className="w-full border p-2 rounded-lg" />
            </div>

            <div>
              <label className="font-semibold block mb-1">Built-up Area (sqft)</label>
              <input name="sqft" type="number" required className="w-full border p-2 rounded-lg" />
            </div>
          </div>

          {/* CITY */}
          <div>
            <label className="font-semibold block mb-1">City</label>
            <input name="city" type="text" required className="w-full border p-2 rounded-lg" />
          </div>

          {/* CATEGORY MAIN */}
          <div>
            <label className="font-semibold block mb-1">Main Category</label>
            <select name="category_main" className="w-full border p-2 rounded-lg">
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
          </div>

          {/* CATEGORY TYPE */}
          <div>
            <label className="font-semibold block mb-1">Property Type</label>
            <select name="category_type" className="w-full border p-2 rounded-lg">
              <option value="residential">Residential</option>
              <option value="commercial">Commercial</option>
              <option value="land">Land / Plots</option>
              <option value="industrial">Industrial</option>
            </select>
          </div>
        </div>

        <button className="w-full bg-black text-white py-3 rounded-xl font-semibold text-lg">
          Post Ad
        </button>
      </form>
    </div>
  );
}
