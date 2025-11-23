"use client";

import { useState } from "react";
import { Upload, MapPin, Camera, Trash2 } from "lucide-react";

export default function PostAd() {
  const [images, setImages] = useState<File[]>([]);
  const [preview, setPreview] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageUpload = (e: any) => {
    const files = Array.from(e.target.files);

    if (images.length + files.length > 10) {
      alert("Max 10 images allowed");
      return;
    }

    setImages([...images, ...files]);

    const newPreviews = files.map((file: any) => URL.createObjectURL(file));
    setPreview([...preview, ...newPreviews]);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    const newPreview = [...preview];
    newImages.splice(index, 1);
    newPreview.splice(index, 1);
    setImages(newImages);
    setPreview(newPreview);
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);

    // --------------------- UPLOAD IMAGES -------------------------
    const uploadedUrls: string[] = [];

    for (const img of images) {
      const formData = new FormData();
      formData.append("file", img);
      formData.append("userId", "test-user"); // replace after auth

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      uploadedUrls.push(data.url);
    }

    // --------------------- SAVE LISTING -------------------------
    const listingData = {
      title: e.target.title.value,
      description: e.target.description.value,
      price: e.target.price.value,
      type: e.target.type.value,      // rent OR sale
      city: e.target.city.value,
      location: e.target.location.value,
      images: uploadedUrls,
    };

    await fetch("/api/add-listing", {
      method: "POST",
      body: JSON.stringify(listingData),
    });

    alert("Listing Posted Successfully!");
    setIsSubmitting(false);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h1 className="text-2xl font-semibold mb-6">Post Your Property</h1>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* TITLE */}
        <div>
          <label className="font-semibold">Title</label>
          <input
            name="title"
            className="w-full mt-1 p-3 border rounded-xl"
            placeholder="3BHK Luxury Apartment"
            required
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label className="font-semibold">Description</label>
          <textarea
            name="description"
            className="w-full mt-1 p-3 border rounded-xl"
            rows={4}
            placeholder="Write about your property..."
            required
          />
        </div>

        {/* PRICE + TYPE */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="font-semibold">Price</label>
            <input
              name="price"
              type="number"
              className="w-full mt-1 p-3 border rounded-xl"
              placeholder="6500000"
              required
            />
          </div>

          <div>
            <label className="font-semibold">Type</label>
            <select name="type" className="w-full mt-1 p-3 border rounded-xl">
              <option value="sale">For Sale</option>
              <option value="rent">For Rent</option>
            </select>
          </div>
        </div>

        {/* CITY */}
        <div>
          <label className="font-semibold">City</label>
          <input
            name="city"
            className="w-full mt-1 p-3 border rounded-xl"
            placeholder="Chennai"
            required
          />
        </div>

        {/* MAP LOCATION */}
        <div>
          <label className="font-semibold">Location (Address)</label>
          <div className="flex items-center gap-2">
            <MapPin size={20} />
            <input
              name="location"
              className="w-full p-3 border rounded-xl"
              placeholder="Enter address or paste Google Maps link"
              required
            />
          </div>
        </div>

        {/* UPLOAD IMAGES */}
        <div>
          <label className="font-semibold">Upload Images (Max 10)</label>
          <div className="mt-2 border border-dashed rounded-xl p-6 text-center cursor-pointer">
            <input
              type="file"
              multiple
              accept="image/*"
              className="hidden"
              id="file-upload"
              onChange={handleImageUpload}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Camera size={30} className="mx-auto" />
              <p>Click to upload images</p>
            </label>
          </div>

          {/* PREVIEW IMAGES */}
          <div className="grid grid-cols-3 gap-3 mt-3">
            {preview.map((img, index) => (
              <div key={index} className="relative group">
                <img
                  src={img}
                  className="h-32 w-full object-cover rounded-xl"
                />
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-black/50 p-1 rounded-full text-white"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* SUBMIT */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-black text-white py-3 rounded-xl font-semibold mt-4"
        >
          {isSubmitting ? "Posting..." : "Post Ad"}
        </button>
      </form>
    </div>
  );
}
