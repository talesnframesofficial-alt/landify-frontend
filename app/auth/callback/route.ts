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

  // Exchange the code for a session
  await supabase.auth.exchangeCodeForSession(code);

  // Redirect user to profile page after login
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/profile`);
}
