export default function PagePlaceholder({
  title,
  description,
  phase,
}: {
  title: string;
  description: string;
  phase: number;
}) {
  return (
    <div className="max-w-3xl">
      <div className="mb-6">
        <div className="text-xs uppercase tracking-wider text-white/40 mb-1">Phase {phase}</div>
        <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
        <p className="text-white/60 mt-2">{description}</p>
      </div>
      <div className="rounded-lg border border-dashed border-white/15 bg-white/[0.02] p-8 text-center">
        <p className="text-white/60 text-sm">
          This route is reserved. Implementation arrives in Phase {phase}.
        </p>
      </div>
    </div>
  );
}
