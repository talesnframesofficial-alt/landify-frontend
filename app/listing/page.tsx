"use client";

import { useState } from "react";
import { SlidersHorizontal, ChevronDown, Heart } from "lucide-react";

export default function ListingsPage() {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">

      {/* PAGE TITLE + SORT */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Properties for Sale</h1>

        {/* SORT DROPDOWN */}
        <select
          className="border rounded-lg px-3 py-2 text-sm shadow-sm"
        >
          <option>Sort: Newest</option>
          <option>Price: Low to High</option>
          <option>Price: High to Low</option>
        </select>
      </div>

      {/* FILTER BUTTON FOR MOBILE */}
      <button
        onClick={() => setFiltersOpen(true)}
        className="md:hidden flex items-center gap-2 w-full bg-black text-white py-2 px-4 rounded-lg"
      >
        <SlidersHorizontal className="w-5 h-5" />
        Filters
      </button>

      {/* FILTER SIDEBAR (DESKTOP) */}
      <div className="hidden md:grid grid-cols-4 gap-6">
        <div className="bg-white p-4 rounded-xl shadow-sm h-fit space-y-4">
          <h2 className="font-semibold text-lg">Filters</h2>

          <div>
            <p className="text-sm text-slate-600 mb-1">Location</p>
            <input
              placeholder="City"
              className="w-full border rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div>
            <p className="text-sm text-slate-600 mb-1">Min Price</p>
            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="₹"
            />
          </div>

          <div>
            <p className="text-sm text-slate-600 mb-1">Max Price</p>
            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2 text-sm"
              placeholder="₹"
            />
          </div>
        </div>

        {/* LISTING CARDS */}
        <div className="col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl shadow-sm hover:shadow-lg overflow-hidden transition hover:-translate-y-1"
            >
              <div className="relative h-48 bg-slate-200">
                <button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full shadow hover:scale-110 transition">
                  <Heart className="w-5 h-5 text-red-500" />
                </button>
              </div>

              <div className="p-4 space-y-1">
                <h3 className="font-semibold text-lg">2BHK Apartment</h3>
                <p className="text-sm text-slate-600">Coimbatore • 1050 sqft</p>
                <p className="font-semibold text-green-700">₹ 45,00,000</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MOBILE FILTER OVERLAY */}
      {filtersOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-end md:hidden">
          <div className="bg-white w-3/4 h-full p-5 space-y-4 shadow-xl">

            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Filters</h2>
              <button
                onClick={() => setFiltersOpen(false)}
                className="text-sm text-slate-600"
              >
                Close
              </button>
            </div>

            <div>
              <p className="text-sm text-slate-600 mb-1">Location</p>
              <input
                placeholder="City"
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
            </div>

            <div>
              <p className="text-sm text-slate-600 mb-1">Min Price</p>
              <input
                type="number"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="₹"
              />
            </div>

            <div>
              <p className="text-sm text-slate-600 mb-1">Max Price</p>
              <input
                type="number"
                className="w-full border rounded-lg px-3 py-2 text-sm"
                placeholder="₹"
              />
            </div>

            <button
              onClick={() => setFiltersOpen(false)}
              className="w-full bg-black text-white py-2 rounded-lg mt-4"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {/* LOAD MORE */}
      <div className="flex justify-center">
        <button className="px-6 py-2 bg-black text-white rounded-lg shadow hover:opacity-90">
          Load More
        </button>
      </div>
    </div>
  );
}
