import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

function allowedEmails() {
  return (process.env.ALLOWED_OPERATOR_EMAILS ?? "")
    .split(",")
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

function resolveBaseUrl(request: NextRequest, origin: string) {
  // On Vercel behind a custom domain, request.url's origin can be the
  // internal deploy URL. Prefer the forwarded host so cookies land on the
  // public domain the browser actually sees.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  if (process.env.NODE_ENV !== "development" && forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`;
  }
  return origin;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") ?? "/dashboard";
  const base = resolveBaseUrl(request, origin);

  if (!code) {
    return NextResponse.redirect(`${base}/auth/error?reason=missing_code`);
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error || !data.user) {
    return NextResponse.redirect(`${base}/auth/error?reason=exchange_failed`);
  }

  // Operator allow-list enforcement
  const list = allowedEmails();
  const userEmail = data.user.email?.toLowerCase() ?? "";
  if (list.length > 0 && !list.includes(userEmail)) {
    await supabase.auth.signOut();
    return NextResponse.redirect(`${base}/auth/error?reason=not_allowed`);
  }

  return NextResponse.redirect(`${base}${redirect}`);
}
