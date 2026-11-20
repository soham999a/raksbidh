import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, CalendarDays } from "lucide-react";
import { EmptyState, fmtDate } from "@/components/site/ui-bits";
import { Badge } from "@/components/ui/badge";
import { useT } from "@/lib/i18n";
import { seo } from "@/lib/seo";
import { useDB } from "@/lib/store";

export const Route = createFileRoute("/blog/$id")({
  head: () =>
    seo("Health Article", "A practical health guide from the Praner Pashe community health blog."),
  component: BlogPost,
});

function BlogPost() {
  const { id } = Route.useParams();
  const { t } = useT();
  const db = useDB();
  const post = db.posts.find((p) => p.id === id && p.status === "Published");
  const related = db.posts
    .filter((p) => p.status === "Published" && p.id !== id && p.category === post?.category)
    .slice(0, 3);

  if (!post) {
    return (
      <section className="container-page py-16">
        <EmptyState
          title="Article not found"
          hint="This article may have been removed or is no longer published."
          action={
            <Link
              to="/blog"
              className="mt-2 inline-flex items-center gap-2 font-semibold text-primary-strong"
            >
              <ArrowLeft className="size-4" /> {t("Back to blog")}
            </Link>
          }
        />
      </section>
    );
  }

  return (
    <article>
      <header className="hero-glow border-b">
        <div className="container-page py-10 md:py-14">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary-strong"
          >
            <ArrowLeft className="size-4" /> {t("Back to blog")}
          </Link>
          <div className="mt-5 max-w-3xl">
            <Badge variant="info">{t(post.category)}</Badge>
            <h1 className="mt-3 text-3xl font-extrabold leading-tight md:text-5xl">{post.title}</h1>
            <p className="mt-4 text-lg text-muted-foreground">{post.excerpt}</p>
            <p className="mt-5 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-4" /> {fmtDate(post.date)}
              </span>
              <span className="flex items-center gap-1.5">
                <BookOpen className="size-4" /> {post.author}
              </span>
            </p>
          </div>
        </div>
      </header>

      {post.cover && (
        <img
          src={post.cover}
          alt=""
          className="container-page mt-8 aspect-[21/9] w-auto max-w-full rounded-3xl object-cover shadow-lift"
        />
      )}

      <div className="container-page grid gap-8 py-10 lg:grid-cols-[1fr_18rem]">
        <div
          className="surface prose prose-slate max-w-none p-6 md:p-8"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        <aside className="space-y-4">
          <div className="surface p-5">
            <h2 className="text-lg font-bold">{t("Need help now?")}</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("Find nearby emergency services in one tap.")}
            </p>
            <Link
              to="/helpline"
              className="mt-4 inline-flex min-h-10 items-center justify-center rounded-lg bg-emergency px-4 font-semibold text-emergency-foreground"
            >
              {t("24x7 Helpline")}
            </Link>
          </div>
          {related.length > 0 && (
            <div className="surface p-5">
              <h2 className="text-lg font-bold">{t("Related articles")}</h2>
              <div className="mt-3 space-y-3">
                {related.map((p) => (
                  <Link
                    key={p.id}
                    to="/blog/$id"
                    params={{ id: p.id }}
                    className="block text-sm font-semibold hover:underline"
                  >
                    {p.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </article>
  );
}
