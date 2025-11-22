"use client";

import { Heart, Phone, MessageCircle } from "lucide-react";

export default function PropertyDetail() {
  return (
    <div className="container mx-auto px-4 py-6 space-y-6">

      {/* IMAGE GALLERY */}
      <div className="relative w-full h-64 md:h-96 bg-slate-200 rounded-xl overflow-hidden">
        {/* Heart / Favorite */}
        <button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full shadow hover:scale-110 transition">
          <Heart className="w-6 h-6 text-red-500" />
        </button>
      </div>

      {/* PRICE + ACTION BUTTONS */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl md:text-3xl font-bold">3BHK Luxury Villa</h1>
        <span className="text-xl font-semibold text-green-700">
          ₹ 65,00,000
        </span>
      </div>

      {/* OWNER INFO + ACTIONS */}
      <div className="bg-white p-4 rounded-xl shadow-sm flex items-center justify-between">
        <div>
          <p className="font-semibold">Owner: Senthil Kumar</p>
          <p className="text-sm text-blue-600 font-medium">✔ Verified Owner</p>
        </div>

        <div className="flex gap-2">
          <button className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg">
            <MessageCircle className="w-5 h-5" /> Chat
          </button>
          <button className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg">
            <Phone className="w-5 h-5" /> Call
          </button>
        </div>
      </div>

      {/* PROPERTY DETAILS */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Property Details</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <p className="text-slate-500">Built-up Area</p>
            <p className="font-semibold">2100 sqft</p>
          </div>
          <div>
            <p className="text-slate-500">Bedrooms</p>
            <p className="font-semibold">3</p>
          </div>
          <div>
            <p className="text-slate-500">Bathrooms</p>
            <p className="font-semibold">3</p>
          </div>
          <div>
            <p className="text-slate-500">Parking</p>
            <p className="font-semibold">Yes</p>
          </div>
        </div>
      </div>

      {/* DESCRIPTION */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Description</h2>
        <p className="text-slate-700 leading-relaxed text-sm">
          This 3BHK villa is located in a prime area with access to schools, hospitals,
          shopping centers, and public transportation. Recently renovated with
          premium fittings and modern interiors.
        </p>
      </div>

      {/* MAP */}
      <div className="bg-white p-4 rounded-xl shadow-sm">
        <h2 className="text-lg font-semibold mb-3">Location on Map</h2>
        <div className="w-full h-56 bg-slate-200 rounded-xl"></div>
      </div>

      {/* SIMILAR LISTINGS */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Similar Listings</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm hover:shadow-md overflow-hidden transition"
            >
              <div className="h-40 bg-slate-200" />
              <div className="p-3">
                <h3 className="font-semibold">2BHK Apartment</h3>
                <p className="text-sm text-slate-600">₹ 32,00,000 • Chennai</p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
