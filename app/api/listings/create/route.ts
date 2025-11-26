import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const cookieStore = cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name) {
            return cookieStore.get(name)?.value;
          },
          set(name, value, options) {
            cookieStore.set(name, value, options);
          },
          remove(name, options) {
            cookieStore.set(name, "", { ...options, maxAge: 0 });
          },
        },
      }
    );

    // Get logged-in user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Not authenticated" },
        { status: 401 }
      );
    }

    const { title, description, price, sqft, city, category, photoUrls } = body;

    // Insert into listings
    const { data, error } = await supabase
      .from("listings")
      .insert({
        user_id: user.id,
        title,
        description,
        price,
        sqft,
        city,
        listing_type: category,
        images: photoUrls || [],
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ listing: data });
  } catch (err) {
    console.log("Server error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
