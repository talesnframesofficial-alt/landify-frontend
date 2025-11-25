import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";

export default async function SellerProfile({ params }: any) {
  const { id } = params;

  const supabase = createServerComponentClient({ cookies });

  // Fetch seller details
  const { data: profile } = await supabase
    .from("users_extra")
    .select("*")
    .eq("id", id)
    .single();

  // Fetch seller ads
  const { data: ads } = await supabase
    .from("listings")
    .select("*")
    .eq("user_id", id);

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      
      <div className="bg-white p-5 rounded-xl shadow">
        <h1 className="text-2xl font-bold">{profile?.full_name || "Seller"}</h1>
        <p className="text-slate-600">{profile?.city}</p>
        <p className="text-sm text-slate-500 mt-2">Joined: {profile?.created_at?.slice(0,10)}</p>
      </div>

      <h2 className="text-xl font-semibold">Ads by this Seller</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {ads?.map((ad: any) => (
          <div
            key={ad.id}
            className="bg-white rounded-xl shadow p-3 cursor-pointer"
            onClick={() => (window.location.href = `/listing/${ad.id}`)}
          >
            <div className="h-40 bg-slate-200 rounded"></div>
            <p className="mt-3 font-semibold">{ad.title}</p>
            <p className="text-sm text-slate-600">{ad.price}</p>
          </div>
        ))}
      </div>

    </div>
  );
}
