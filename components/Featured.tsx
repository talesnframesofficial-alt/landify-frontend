"use client";

import { listings } from "@/data/listings";
import { Heart } from "lucide-react";

export default function Featured() {
  const featuredListings = listings.slice(0, 3);

  return (
    <section className="container mx-auto px-4 py-10">
      <h2 className="text-2xl font-semibold mb-6">Featured Listings</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredListings.map((property) => (
          <div
            key={property.id}
            onClick={() => (window.location.href = `/listing/${property.id}`)}
            className="relative group rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300 cursor-pointer"
          >
            <div className="relative h-52 bg-slate-200">
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-semibold shadow">
                {property.price}
              </div>

              <button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full shadow hover:scale-110 transition">
                <Heart className="w-5 h-5 text-red-500" />
              </button>
            </div>

            <div className="p-4 space-y-1">
              <h3 className="font-semibold text-lg">{property.title}</h3>
              <p className="text-sm text-slate-600">
                {property.city} • {property.sqft} sqft
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
