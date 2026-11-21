import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { HeartHandshake, LayoutDashboard, Menu, Stethoscope } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useT } from "@/lib/i18n";
import { setLang, useDB } from "@/lib/store";
import { cn } from "@/lib/utils";
import { NAV } from "./nav";

export function LangToggle() {
  const { lang } = useT();
  return (
    <div
      className="flex rounded-full border bg-card p-0.5 text-sm font-semibold"
      role="group"
      aria-label="Language"
    >
      {(["en", "bn"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={cn(
            "min-h-9 cursor-pointer rounded-full px-3",
            lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground",
          )}
        >
          {l === "en" ? "EN" : "বাংলা"}
        </button>
      ))}
    </div>
  );
}

export function Logo() {
  const db = useDB();
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="flex size-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
        <HeartHandshake className="size-6" />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-lg font-bold">{db.settings.siteName}</span>
        <span className="block text-xs text-muted-foreground">প্রাণের পাশে · Bidhannagar</span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const top = NAV.filter((n) =>
    [
      "/hospitals",
      "/blood-banks",
      "/ambulances",
      "/doctors",
      "/donors",
      "/blog",
      "/helpline",
    ].includes(n.to),
  );
  return (
    <>
      <header className="sticky top-0 z-40 border-b border-t-4 border-t-primary bg-background/95 backdrop-blur">
        <div className="container-page flex h-16 items-center gap-3">
          <Logo />
          <nav className="ml-4 hidden flex-1 items-center gap-1 xl:flex">
            {top.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                className="rounded-lg px-2.5 py-2 text-sm font-semibold text-muted-foreground hover:bg-primary-soft hover:text-foreground"
                activeProps={{ className: "bg-primary-soft text-foreground" }}
              >
                {t(n.label)}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <LangToggle />
            <Button
              variant="outline"
              size="icon"
              onClick={() => setOpen(true)}
              aria-label={t("Menu")}
            >
              <Menu />
            </Button>
          </div>
        </div>
      </header>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="right" className="w-80 overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{t("Menu")}</SheetTitle>
          </SheetHeader>
          <nav className="mt-2 grid gap-1 px-2 pb-6">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                onClick={() => setOpen(false)}
                className="flex min-h-12 items-center gap-3 rounded-lg px-3 font-semibold hover:bg-primary-soft"
                activeProps={{ className: "bg-primary-soft" }}
                activeOptions={{ exact: n.to === "/" }}
              >
                <n.icon className="size-5 text-primary-strong" /> {t(n.label)}
              </Link>
            ))}
            <div className="my-2 border-t" />
            <Link
              to="/doctor-panel"
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center gap-3 rounded-lg px-3 font-semibold hover:bg-primary-soft"
            >
              <Stethoscope className="size-5 text-info" /> {t("Doctor Panel")}
            </Link>
            <Link
              to="/admin"
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center gap-3 rounded-lg px-3 font-semibold hover:bg-primary-soft"
            >
              <LayoutDashboard className="size-5 text-info" /> {t("Admin Dashboard")}
            </Link>
          </nav>
        </SheetContent>
      </Sheet>
    </>
  );
}
