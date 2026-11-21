import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Ambulance,
  ArrowRight,
  BookOpen,
  Building2,
  Droplets,
  HeartPulse,
  Phone,
  Search,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CoFounderCredit, FounderCredit } from "@/components/site/FounderCredit";
import { GuidedTour } from "@/components/site/GuidedTour";
import { fmtDate } from "@/components/site/ui-bits";
import { CO_ASSISTING_ROLE } from "@/lib/founder";
import { useT } from "@/lib/i18n";
import { seo } from "@/lib/seo";
import { useDB } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () =>
    seo(
      "Help is one tap away",
      "Find hospitals, blood banks, ambulances, doctors and blood donors in Bidhannagar. Demo of the Praner Pashe community health platform.",
    ),
  component: Home,
});

function Home() {
  const { t } = useT();
  const db = useDB();
  const counters = [
    { label: "Hospitals", value: db.hospitals.length, icon: Building2 },
    { label: "Blood Banks", value: db.bloodBanks.length, icon: Droplets },
    { label: "Ambulances", value: db.ambulances.length, icon: Ambulance },
    { label: "Doctors", value: db.doctors.length, icon: Stethoscope },
    { label: "Registered donors", value: db.donors.length, icon: HeartPulse },
  ];
  const tiles = [
    { to: "/hospitals", label: "Hospital Directory", icon: Building2 },
    { to: "/blood-banks", label: "Blood Banks", icon: Droplets },
    { to: "/ambulances", label: "Ambulance", icon: Ambulance },
    { to: "/doctors", label: "Book a Doctor", icon: Stethoscope },
    { to: "/donors", label: "Blood Donors", icon: HeartPulse },
    { to: "/blog", label: "Health Blog", icon: BookOpen },
    { to: "/key-persons", label: "Key Persons", icon: Users },
    { to: "/helpline", label: "24x7 Helpline", icon: Phone },
  ] as const;
  const posts = db.posts.filter((p) => p.status === "Published").slice(0, 3);

  return (
    <>
      <section className="hero-glow">
        <div className="container-page grid items-center gap-8 py-10 md:grid-cols-[1.1fr_1fr] md:py-16">
          <div>
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-success-soft px-3 py-1 text-sm font-semibold text-success">
              <ShieldCheck className="size-4" /> {t("Verified local help, all in one place")}
            </p>
            <h1 className="text-4xl font-extrabold md:text-6xl">
              {db.settings.siteName}:{" "}
              <span className="text-primary-strong">{t("help is one tap away")}</span>{" "}
              {t("in Bidhannagar")}
            </h1>
            <p className="mt-4 max-w-xl text-lg text-muted-foreground">
              {t(
                "Hospitals, blood, ambulances and doctors for every ward. Free, simple and in your language.",
              )}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              <Button asChild variant="emergency" size="xl" className="h-16">
                <Link to="/blood-banks" search={{ focus: "1" }}>
                  <Droplets className="!size-6" /> {t("Need Blood")}
                </Link>
              </Button>
              <Button asChild variant="emergency" size="xl" className="h-16">
                <Link to="/ambulances" search={{ focus: "1" }}>
                  <Ambulance className="!size-6" /> {t("Need Ambulance")}
                </Link>
              </Button>
              <Button asChild variant="emergency" size="xl" className="h-16">
                <Link to="/hospitals" search={{ emergency: "1", focus: "1" }}>
                  <Building2 className="!size-6" /> {t("Need Hospital")}
                </Link>
              </Button>
            </div>
            <div className="mt-4">
              <GuidedTour />
            </div>
          </div>
          <div className="relative">
            <img
              src="/images/hero.jpg"
              alt={t("A community health volunteer helping an elderly woman in Salt Lake")}
              width={1400}
              height={933}
              fetchPriority="high"
              className="aspect-[4/3] w-full rounded-3xl object-cover shadow-lift"
            />
            <div className="surface absolute -bottom-5 left-4 flex items-center gap-3 px-4 py-3">
              <span className="relative flex size-3">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
                <span className="relative inline-flex size-3 rounded-full bg-success" />
              </span>
              <span className="text-sm font-semibold">
                {db.doctors.filter((d) => d.online).length} {t("doctors online now")}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="container-page space-y-3 pt-8">
        <FounderCredit />
        <CoFounderCredit role={CO_ASSISTING_ROLE} />
      </section>

      <section className="container-page py-10">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {counters.map((c) => (
            <div key={c.label} className="surface p-4">
              <c.icon className="size-6 text-primary-strong" />
              <p className="mt-2 font-display text-3xl font-extrabold">{c.value}</p>
              <p className="text-sm text-muted-foreground">{t(c.label)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="container-page pb-10">
        <h2 className="mb-4 text-2xl font-bold">{t("Find help")}</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tiles.map((tile) => (
            <Link
              key={tile.to}
              to={tile.to}
              className="surface group flex min-h-28 flex-col justify-between p-4 transition-shadow hover:shadow-lift"
            >
              <span className="flex size-12 items-center justify-center rounded-xl bg-primary-soft text-primary-strong group-hover:bg-primary group-hover:text-primary-foreground">
                <tile.icon className="size-6" />
              </span>
              <span className="mt-3 font-semibold">{t(tile.label)}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-secondary py-12">
        <div className="container-page">
          <h2 className="mb-6 text-2xl font-bold">{t("How it works")}</h2>
          <ol className="grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Search,
                title: "Search",
                text: "Choose what you need and filter by your ward.",
              },
              {
                icon: Phone,
                title: "Call in one tap",
                text: "Every listing has a big Call button. No sign-up needed.",
              },
              {
                icon: HeartPulse,
                title: "Get help, give help",
                text: "Book a doctor, request blood, or register as a donor.",
              },
            ].map((s, i) => (
              <li key={s.title} className="surface p-5">
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-full bg-primary font-display text-lg font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <s.icon className="size-5 text-primary-strong" />
                </div>
                <h3 className="mt-3 text-xl font-bold">{t(s.title)}</h3>
                <p className="mt-1 text-muted-foreground">{t(s.text)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="container-page py-12">
        <div className="mb-4 flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold">{t("Latest from the Health Blog")}</h2>
          <Link
            to="/blog"
            className="inline-flex items-center gap-1 text-sm font-semibold text-primary-strong"
          >
            {t("See all")} <ArrowRight className="size-4" />
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {posts.map((p) => (
            <Link
              key={p.id}
              to="/blog/$id"
              params={{ id: p.id }}
              className="surface group overflow-hidden"
            >
              {p.cover && (
                <img
                  src={p.cover}
                  alt=""
                  loading="lazy"
                  className="aspect-[16/10] w-full object-cover"
                />
              )}
              <div className="p-4">
                <p className="text-xs font-semibold text-primary-strong">{t(p.category)}</p>
                <h3 className="mt-1 text-lg font-bold group-hover:underline">{p.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{fmtDate(p.date)}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
