export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-2xl w-full">
        <h1 className="text-4xl font-semibold tracking-tight mb-4">
          BPIS Network
        </h1>
        <p className="text-lg text-white/70 mb-8">
          Black Phenomenon Intelligence Suite — operator console.
        </p>
        <div className="rounded-lg border border-white/10 p-6 bg-white/5">
          <p className="text-sm text-white/60 mb-2">Phase 0</p>
          <p className="text-white/90">
            Scaffold complete. Next: connect Supabase + Anthropic, define schema,
            port reference pages.
          </p>
        </div>
      </div>
    </main>
  );
}
