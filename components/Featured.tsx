export default function Featured() {
  return (
    <section className="container mx-auto px-4 py-10">
      <h2 className="text-2xl font-semibold mb-4">Featured Listings</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1,2,3].map(i => (
          <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="h-40 bg-slate-200" />
            <div className="p-4">
              <h3 className="font-semibold text-lg">Property Title</h3>
              <p className="text-slate-600 text-sm">Location • Price</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
