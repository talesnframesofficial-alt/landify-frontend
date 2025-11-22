"use client";

import { useState } from "react";
import { SlidersHorizontal, ChevronDown, Heart } from "lucide-react";
import { listings } from "@/data/listings";

export default function ListingsPage() {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-6">

      {/* FILTER HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-semibold">All Listings</h1>
        <button
          onClick={() => setFiltersOpen(!filtersOpen)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg"
        >
          <SlidersHorizontal className="w-5 h-5" />
          Filters
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>

      {/* FILTER PANEL */}
      {filtersOpen && (
        <div className="bg-white p-4 rounded-xl shadow-sm mb-6">
          <p className="text-slate-600 text-sm">Filter options go here…</p>
        </div>
      )}

      {/* LISTINGS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {listings.map((property) => (
          <div
            key={property.id}
            onClick={() => (window.location.href = `/listing/${property.id}`)}
            className="relative bg-white rounded-xl shadow-sm hover:shadow-md overflow-hidden cursor-pointer transition"
          >
            <div className="h-48 bg-slate-200 relative">
              <button className="absolute top-3 right-3 p-2 bg-white/90 rounded-full shadow">
                <Heart className="w-5 h-5 text-red-500" />
              </button>
            </div>

            <div className="p-4">
              <h3 className="font-semibold text-lg">{property.title}</h3>
              <p className="text-sm text-slate-600">{property.city}</p>
              <p className="font-semibold mt-1">{property.price}</p>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
