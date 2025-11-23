import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: NextRequest) {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const formData = await req.formData();
    const file = formData.get("file") as File;
    const userId = formData.get("userId") as string;

    if (!file || !userId)
      return NextResponse.json({ error: "Missing file or userId" }, { status: 400 });

    const fileName = `${userId}/${Date.now()}-${file.name}`;

    const { data, error } = await supabase.storage
      .from("listing-images")
      .upload(fileName, file, { upsert: false });

    if (error) throw error;

    const publicUrl = supabase.storage
      .from("listing-images")
      .getPublicUrl(fileName).data.publicUrl;

    return NextResponse.json({ url: publicUrl });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
