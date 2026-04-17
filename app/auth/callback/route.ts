import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

function allowedEmails() {
  return (process.env.ALLOWED_OPERATOR_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") ?? "/dashboard";

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/error?reason=missing_code`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${origin}/auth/error?reason=exchange_failed`);
  }

  // Operator allow-list enforcement
  const list = allowedEmails();
  const userEmail = data.user.email?.toLowerCase() ?? "";
  if (list.length > 0 && !list.includes(userEmail)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${origin}/auth/error?reason=not_allowed`);
  }

  return NextResponse.redirect(`${origin}${redirect}`);
}
