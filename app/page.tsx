import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { timeAgo } from "../utils/timeAgo";

export default async function HomePage() {
  const cookieStore = cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-5">
      <h1 className="text-xl font-bold">Latest Listings</h1>

      {listings?.map((item) => (
        <a
          key={item.id}
          href={`/listing/${item.id}`}
          className="block bg-white p-4 rounded-xl shadow"
        >
          {/* Photo */}
          <img
            src={item.images?.[0] || "/no-image.png"}
            className="w-full h-48 object-cover rounded-lg"
          />

          {/* Details */}
          <div className="mt-3">
            <p className="font-bold text-lg">₹ {item.price}</p>
            <p className="text-slate-600">{item.title}</p>

            <p className="text-sm text-slate-500">
              {item.city} • {item.sqft} sqft
            </p>

            {/* Time Ago */}
            <p className="text-xs text-slate-400 mt-1">
              {timeAgo(item.created_at)}
            </p>
          </div>
        </a>
      ))}
    </div>
  );
}
