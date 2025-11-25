"use client";

import { useState, useEffect } from "react";
import { Upload, XCircle } from "lucide-react";
import { supabase } from "@/utils/supabaseClient";
import { useRouter } from "next/navigation";

export default function PostAdPage() {
  const router = useRouter();

  // User state
  const [userId, setUserId] = useState<string | null>(null);

  // Photo state
  const [photos, setPhotos] = useState<File[]>([]);
  const [preview, setPreview] = useState<string[]>([]);

  // Check login on mount
  useEffect(() => {
    async function checkUser() {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.push("/login"); // redirect if not logged in
        return;
      }
      setUserId(data.user.id); // store user_id
    }
    checkUser();
  }, [router]);

  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileArray = Array.from(files) as File[];

    if (photos.length + fileArray.length > 10) {
      alert("You can upload a maximum of 10 photos.");
      return;
    }

    setPhotos((prev: File[]) => [...prev, ...fileArray]);

    const newPreviews = fileArray.map((file: File) =>
      URL.createObjectURL(file)
    );

    setPreview((prev: string[]) => [...prev, ...newPreviews]);
  };

  // Remove photo
  const removePhoto = (index: number) => {
    setPhotos((prev: File[]) => prev.filter((_, i) => i !== index));
    setPreview((prev: string[]) => prev.filter((_, i) => i !== index));
  };

  // Submit Ad
  const handleSubmit = async (e: any) => {
    e.preventDefault();

    if (!userId) {
      alert("You must be logged in to post an ad.");
      return;
    }

    // 1️⃣ Upload photos
    const formData = new FormData();
    photos.forEach((p) => formData.append("files", p));

    const uploadRes = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const uploadData = await uploadRes.json();
    const photoUrls = uploadData.urls;

    // 2️⃣ Submit listing data
    const body = {
      title: e.target.title.value,
      description: e.target.description.value,
      price: e.target.price.value,
      sqft: e.target.sqft.value,
      city: e.target.city.value,
      category: e.target.category.value,
      latitude: null,
      longitude: null,
      user_id: userId, // REAL USER ID
      photoUrls,
    };

    await fetch("/api/listings/create", {
      method: "POST",
      body: JSON.stringify(body),
    });

    alert("Ad posted successfully!");
    router.push("/"); // Redirect to home after posting
  };

  return (
    <div className="max-w-3xl mx-auto p-5 space-y-6">
      <h1 className="text-2xl font-bold">Post Your Ad</h1>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* Photos Upload */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <label className="font-semibold block mb-2">Upload Photos (Max 10)</label>

          <div className="grid grid-cols-3 gap-3">
            {preview.map((src, i) => (
              <div key={i} className="relative group">
                <img
                  src={src}
                  className="h-28 w-full object-cover rounded-lg border"
                />
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
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handlePhotoUpload}
                />
              </label>
            )}
          </div>
        </div>

        {/* Basic Inputs */}
        <div className="bg-white p-4 rounded-xl shadow-sm space-y-4">
          <div>
            <label className="font-semibold block mb-1">Ad Title</label>
            <input
              type="text"
              name="title"
              required
              className="w-full border p-2 rounded-lg"
              placeholder="3BHK House for Sale in Anna Nagar"
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Description</label>
            <textarea
              name="description"
              rows={4}
              required
              className="w-full border p-2 rounded-lg"
              placeholder="Describe your property..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-semibold block mb-1">Price</label>
              <input
                type="number"
                name="price"
                required
                className="w-full border p-2 rounded-lg"
                placeholder="e.g., 4500000"
              />
            </div>

            <div>
              <label className="font-semibold block mb-1">Built-up Area (sqft)</label>
              <input
                type="number"
                name="sqft"
                required
                className="w-full border p-2 rounded-lg"
                placeholder="e.g., 1200"
              />
            </div>
          </div>

          <div>
            <label className="font-semibold block mb-1">City</label>
            <input
              type="text"
              name="city"
              required
              className="w-full border p-2 rounded-lg"
              placeholder="Chennai, Coimbatore, etc."
            />
          </div>

          <div>
            <label className="font-semibold block mb-1">Category</label>
            <select name="category" className="w-full border p-2 rounded-lg">
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
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
