import { NextResponse } from "next/server";
import { supabase } from "@/utils/supabase";

export async function POST(req: Request) {
  const body = await req.json();

  const { chat_id, sender_id, receiver_id, message_text } = body;

  const { data, error } = await supabase
    .from("messages")
    .insert([{ chat_id, sender_id, receiver_id, message_text }])
    .select();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });

  return NextResponse.json({ data });
}
