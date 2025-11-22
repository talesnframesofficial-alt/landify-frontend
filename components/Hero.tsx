
export default function Hero() {
  return (
    <section className="w-full bg-gradient-to-r from-indigo-50 to-purple-50 py-16">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
        <div className="flex-1 space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold leading-tight">
            Find a place you'll love to live or invest in.
          </h1>
          <p className="text-slate-600">Clean, modern, and mobile-first experience.</p>
          <div className="mt-4 bg-white p-4 rounded-xl shadow flex gap-2">
            <input className="flex-1 border p-2 rounded-md" placeholder="Location" />
            <input className="flex-1 border p-2 rounded-md" placeholder="Budget" />
            <button className="px-4 py-2 bg-black text-white rounded-md">Search</button>
          </div>
        </div>
        <div className="flex-1 mt-8 md:mt-0">
          <div className="w-full h-64 bg-slate-200 rounded-xl" />
        </div>
      </div>
    </section>
  );
}
