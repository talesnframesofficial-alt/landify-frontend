import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { id, full_name, email, phone, city, profile_photo } =
    await req.json();

  const { data, error } = await supabase
    .from("users_extra")
    .upsert({
      id,
      full_name,
      email,
      phone,
      city,
      profile_photo
    })
    .select();

  if (error)
    return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ profile: data[0] });
}
