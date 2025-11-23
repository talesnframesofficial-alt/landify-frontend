import { supabase } from "@/utils/supabase";
import { Phone, MessageCircle } from "lucide-react";

export default async function SellerProfile({ params }: { params: { id: string } }) {
  const sellerId = params.id;

  // 1. Fetch seller info
  const { data: seller } = await supabase
    .from("users")
    .select("*")
    .eq("id", sellerId)
    .single();

  // 2. Fetch all listings by seller
  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("user_id", sellerId);

  return (
    <div className="container mx-auto px-4 py-6 space-y-8">

      {/* Fraud Warning */}
      <div className="bg-yellow-200 text-yellow-900 p-3 text-sm font-medium text-center rounded-lg">
        ⚠️ Be cautious. Meet in person & verify property documents. Never pay advance.
      </div>

      {/* SELLER CARD */}
      <div className="bg-white shadow p-5 rounded-xl flex gap-4 items-center">
        <div className="w-16 h-16 bg-slate-200 rounded-full"></div>

        <div>
          <h2 className="text-xl font-semibold">{seller?.name || "Seller"}</h2>
          <p className="text-sm text-slate-600">Joined: {seller?.created_at?.slice(0, 10)}</p>
          <p className="text-sm text-green-600 font-medium">✔ Verified User</p>
        </div>
      </div>

      {/* CONTACT BUTTONS */}
      <div className="flex gap-3">
        <a
          href={`tel:${seller?.phone}`}
          className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg"
        >
          <Phone className="w-5 h-5" /> Call
        </a>
        
        <a
          href={`/chat/${sellerId}`}
          className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-lg"
        >
          <MessageCircle className="w-5 h-5" /> Chat
        </a>
      </div>

      {/* SELLER LISTINGS */}
      <div>
        <h2 className="text-lg font-semibold mb-3">Listings by Seller</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {listings?.map((p) => (
            <div
              key={p.id}
              onClick={() => (window.location.href = `/listing/${p.id}`)}
              className="bg-white rounded-xl shadow-sm hover:shadow-md overflow-hidden transition cursor-pointer"
            >
              <div className="h-40 bg-slate-200"></div>
              <div className="p-3">
                <h3 className="font-semibold">{p.title}</h3>
                <p className="text-sm text-slate-600">{p.price} • {p.city}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
