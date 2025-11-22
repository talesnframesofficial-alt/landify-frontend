export default function Latest() {
  return (
    <section className="container mx-auto px-4 py-10">
      <h2 className="text-2xl font-semibold mb-4">Latest Listings</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1,2,3,4].map(i => (
          <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="h-36 bg-slate-200" />
            <div className="p-3">
              <h3 className="font-semibold">Property Name</h3>
              <p className="text-xs text-slate-600">City, Area • Price</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
