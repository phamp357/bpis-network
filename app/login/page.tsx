import { Suspense } from "react";
import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-semibold tracking-tight">BPIS Network</h1>
          <p className="text-sm text-white/60 mt-2">Operator console — sign in to continue</p>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 p-6">
          <Suspense fallback={<div className="text-white/60 text-sm">Loading…</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
