import Link from "next/link";

const REASONS: Record<string, string> = {
  missing_code: "The sign-in link was missing its verification code.",
  exchange_failed: "The sign-in link is invalid or has expired. Request a new one.",
  not_allowed: "This email address is not authorized to access the operator console.",
};

export default async function AuthErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  const message = (reason && REASONS[reason]) ?? "Something went wrong during sign-in.";

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-md w-full rounded-xl border border-white/10 bg-white/5 p-6 text-center">
        <h1 className="text-xl font-semibold mb-2">Sign-in error</h1>
        <p className="text-sm text-white/70 mb-6">{message}</p>
        <Link
          href="/login"
          className="inline-block rounded-md bg-brand text-brand-fg font-medium px-4 py-2 hover:bg-brand-hover transition"
        >
          Back to sign-in
        </Link>
      </div>
    </main>
  );
}
