import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const files = formData.getAll("files") as File[];

    if (!files || files.length === 0) {
      return NextResponse.json({ error: "No files uploaded" }, { status: 400 });
    }

    // Create Supabase client using service role key
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY! // required for uploads
    );

    const urls: string[] = [];

    for (const file of files) {
      const buffer = Buffer.from(await file.arrayBuffer());

      // Unique filename
      const filename = `${Date.now()}-${file.name}`;

      // Upload to correct bucket
      const { error } = await supabase.storage
        .from("listing-images")   // ✅ FIXED BUCKET NAME
        .upload(filename, buffer, {
          contentType: file.type,
        });

      if (error) {
        console.error("Upload error:", error);
        return NextResponse.json({ error: error.message }, { status: 400 });
      }

      // Correct public URL
      const { data: publicUrlData } = supabase.storage
        .from("listing-images")
        .getPublicUrl(filename);

      urls.push(publicUrlData.publicUrl);
    }

    return NextResponse.json({ urls });
  } catch (err: any) {
    console.error("Server error:", err);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
