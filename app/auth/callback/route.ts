import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/login?error=missing_code`
    );
  }

  // Create Supabase server client
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value;
        },
        set(name: string, value: string, options: any) {
          cookies().set(name, value, options);
        },
        remove(name: string, options: any) {
          cookies().set(name, "", { ...options, maxAge: 0 });
        },
      },
    }
  );

  // 🔥 1. Exchange OTP code for a Supabase session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error("OTP exchange error:", error.message);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/login?error=session_failed`
    );
  }

  const session = data.session;
  const user = session?.user;

  if (!user) {
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_BASE_URL}/login?error=no_user`
    );
  }

  // 🔥 2. Auto-create profile if missing
  const { data: existingProfile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!existingProfile) {
    await supabase.from("profiles").insert({
      id: user.id,
      full_name: "",
      email: user.email ?? null,
      phone: user.phone ?? null,
      city: "",
      profile_photo: null,
    });
  }

  // 🔥 3. Redirect to profile page
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/profile`);
}
