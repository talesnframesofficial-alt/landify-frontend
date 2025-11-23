import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function POST(req: Request) {
  const { chat_id } = await req.json();

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("chat_id", chat_id)
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ data });
}
