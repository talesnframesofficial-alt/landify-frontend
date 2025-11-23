import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const body = await req.json();

  const {
    title,
    description,
    price,
    city,
    latitude,
    longitude,
    photoUrls,
    sqft,
    user_id
  } = body;

  const { data, error } = await supabase
    .from("listings")
    .insert([
      {
        title,
        description,
        price,
        city,
        latitude,
        longitude,
        photos: photoUrls,
        sqft,
        user_id
      }
    ])
    .select();

  if (error) {
    console.error(error);
    return NextResponse.json({ error: error.message }, { status: 400 });
  }

  return NextResponse.json({ success: true, listing: data[0] });
}
