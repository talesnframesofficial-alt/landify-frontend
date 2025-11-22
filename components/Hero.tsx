export default function Hero() {
  return (
    <section className="w-full bg-gradient-to-r from-indigo-100 to-purple-100 py-12 md:py-20">
      <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-10">

        {/* Left Side */}
        <div className="flex-1 space-y-4 text-center md:text-left">
          <h1 className="text-3xl md:text-5xl font-bold leading-tight">
            Find a place you'll love to live or invest in.
          </h1>

          <p className="text-slate-600 text-sm md:text-base">
            Clean, modern, and mobile-first experience.
          </p>

          {/* Search Bar */}
          <div className="mt-4 bg-white p-3 rounded-xl shadow flex flex-col md:flex-row gap-3">
            <input
              className="flex-1 border p-2 rounded-md text-sm w-full"
              placeholder="Location"
            />
            <input
              className="flex-1 border p-2 rounded-md text-sm w-full"
              placeholder="Budget"
            />
            <button className="px-4 py-2 bg-black text-white rounded-md text-sm">
              Search
            </button>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex-1 md:flex hidden">
          <div className="w-full h-64 bg-slate-200 rounded-xl" />
        </div>
      </div>
    </section>
  );
}
