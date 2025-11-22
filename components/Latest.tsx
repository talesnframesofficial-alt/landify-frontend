export default function Latest() {
  return (
    <section className="container mx-auto px-4 py-10">
      <h2 className="text-2xl font-semibold mb-4">Latest Listings</h2>

      {/* RESPONSIVE GRID */}
      <div className="grid 
        grid-cols-1         /* Mobile */
        sm:grid-cols-2      /* Small tablets */
        lg:grid-cols-4      /* Desktop */
        gap-5 
      ">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition"
          >
            {/* Image */}
            <div className="h-40 bg-slate-200" />

            {/* Content */}
            <div className="p-4 space-y-1">
              <h3 className="font-semibold text-base">Property Name</h3>
              <p className="text-sm text-slate-600">City, Area • Price</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
