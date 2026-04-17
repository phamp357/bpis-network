import { createClient } from "@/lib/supabase/server";
import Markdown from "./Markdown";

export default async function ArticlePage({
  slug,
  fallbackTitle,
  fallbackDescription,
  phase,
}: {
  slug: string;
  fallbackTitle: string;
  fallbackDescription: string;
  phase: number;
}) {
  const supabase = await createClient();

  const { data: article } = await supabase
    .from("knowledge_articles")
    .select("title, category, body_md, updated_at")
    .eq("slug", slug)
    .maybeSingle();

  if (!article) {
    return (
      <div className="max-w-3xl">
        <div className="text-xs uppercase tracking-wider text-white/40 mb-1">
          Phase {phase}
        </div>
        <h1 className="text-3xl font-semibold tracking-tight">{fallbackTitle}</h1>
        <p className="text-white/60 mt-2">{fallbackDescription}</p>
        <div className="mt-6 rounded-lg border border-dashed border-white/15 bg-white/[0.02] p-8 text-center text-white/60">
          Article not found. Expected slug:{" "}
          <code className="text-white">{slug}</code>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        {article.category && (
          <div className="text-xs uppercase tracking-wider text-white/40 mb-1">
            {article.category.replace(/-/g, " ")}
          </div>
        )}
        <div className="text-xs text-white/40">
          Last updated {new Date(article.updated_at).toLocaleDateString()}
        </div>
      </div>

      <article>
        <Markdown source={article.body_md} />
      </article>
    </div>
  );
}
