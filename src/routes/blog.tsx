import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { BookOpen, Search } from "lucide-react";
import { Chip, EmptyState, PageHeader, fmtDate } from "@/components/site/ui-bits";
import { Input } from "@/components/ui/input";
import { useT } from "@/lib/i18n";
import { seo } from "@/lib/seo";
import { useDB } from "@/lib/store";
import { BLOG_CATEGORIES } from "@/lib/types";

export const Route = createFileRoute("/blog")({
  head: () =>
    seo(
      "Health Blog",
      "Practical health articles for families in Bidhannagar — nutrition, first aid, seasonal care and more.",
    ),
  component: BlogIndex,
});

function BlogIndex() {
  const { t } = useT();
  const db = useDB();
  const [category, setCategory] = useState("");
  const [query, setQuery] = useState("");

  const posts = useMemo(() => {
    const q = query.trim().toLowerCase();
    return db.posts
      .filter((p) => p.status === "Published")
      .filter((p) => !category || p.category === category)
      .filter((p) => !q || `${p.title} ${p.excerpt} ${p.category}`.toLowerCase().includes(q))
      .sort((a, b) => b.date.localeCompare(a.date));
  }, [db.posts, category, query]);

  return (
    <>
      <PageHeader
        title={t("Health Blog")}
        subtitle={t("Simple, practical health guidance for every household in Bidhannagar.")}
        icon={<BookOpen />}
      />
      <section className="container-page py-8">
        <div className="surface mb-6 space-y-4 p-5">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("Search articles")}
              aria-label={t("Search articles")}
              className="pl-9"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Chip active={!category} onClick={() => setCategory("")}>
              {t("All articles")}
            </Chip>
            {BLOG_CATEGORIES.map((c) => (
              <Chip key={c} active={category === c} onClick={() => setCategory(c)}>
                {t(c)}
              </Chip>
            ))}
          </div>
        </div>

        {posts.length === 0 ? (
          <EmptyState title="No articles found" hint="Try a different category or search term." />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p) => (
              <Link
                key={p.id}
                to="/blog/$id"
                params={{ id: p.id }}
                className="surface group flex flex-col overflow-hidden transition-shadow hover:shadow-lift"
              >
                {p.cover && (
                  <img
                    src={p.cover}
                    alt=""
                    loading="lazy"
                    className="aspect-[16/10] w-full object-cover"
                  />
                )}
                <div className="flex flex-1 flex-col p-5">
                  <p className="text-xs font-bold uppercase tracking-wide text-primary-strong">
                    {t(p.category)}
                  </p>
                  <h2 className="mt-2 text-xl font-bold group-hover:underline">{p.title}</h2>
                  <p className="mt-2 flex-1 text-sm text-muted-foreground">{p.excerpt}</p>
                  <p className="mt-4 text-xs text-muted-foreground">
                    {fmtDate(p.date)} · {p.author}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
