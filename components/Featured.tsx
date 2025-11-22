import { Heart } from "lucide-react";

export default function Featured() {
  return (
    <section className="container mx-auto px-4 py-10">
      <h2 className="text-2xl font-semibold mb-6">Featured Listings</h2>

      <div
        className="grid 
        grid-cols-1 
        sm:grid-cols-2 
        lg:grid-cols-3 
        gap-6"
      >
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="relative group rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-xl hover:-translate-y-1 transition duration-300"
          >
            {/* Image */}
            <div className="relative h-52 bg-slate-200">

              {/* Price Badge */}
              <div className="absolute top-3 left-3 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-sm font-semibold shadow">
                ₹ 45,00,000
              </div>

              {/* Favorite Icon */}
              <button className="absolute top-3 right-3 p-2 bg-white/90 backdrop-blur rounded-full shadow hover:scale-110 transition">
                <Heart className="w-5 h-5 text-red-500" />
              </button>
            </div>

            {/* Details */}
            <div className="p-4 space-y-1">
              {/* Verified Owner */}
              <div className="flex items-center gap-2">
                <span className="text-blue-600 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100">
                  Verified Owner
                </span>
              </div>

              <h3 className="font-semibold text-lg">Luxury Villa in Coimbatore</h3>

              <p className="text-sm text-slate-600">Race Course • 2000 sqft</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
