import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Building2, MapPin, Search, Siren } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { ReportButton } from "@/components/site/ReportDialog";
import {
  CallButton,
  EmptyState,
  PageHeader,
  Verified,
  WardSelect,
} from "@/components/site/ui-bits";
import { useT } from "@/lib/i18n";
import { seo } from "@/lib/seo";
import { useDB } from "@/lib/store";

const search = z.object({
  emergency: z.string().optional().catch(undefined),
  focus: z.string().optional().catch(undefined),
});

export const Route = createFileRoute("/hospitals")({
  validateSearch: search,
  head: () =>
    seo(
      "Hospital Directory",
      "Search Bidhannagar hospitals by name and ward, see which have emergency care, and call in one tap.",
    ),
  component: Hospitals,
});

function Hospitals() {
  const { t } = useT();
  const db = useDB();
  const s = Route.useSearch();
  const [q, setQ] = useState("");
  const [ward, setWard] = useState("");
  const [emergency, setEmergency] = useState(s.emergency === "1");
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    if (s.focus === "1") ref.current?.focus();
  }, [s.focus]);

  const list = useMemo(
    () =>
      db.hospitals.filter(
        (h) =>
          h.name.toLowerCase().includes(q.toLowerCase()) &&
          (!ward || String(h.ward) === ward) &&
          (!emergency || h.emergency),
      ),
    [db.hospitals, q, ward, emergency],
  );

  return (
    <>
      <PageHeader
        title={t("Hospital Directory")}
        subtitle={t("Hospitals and clinics across Bidhannagar, checked by our ward team.")}
        icon={<Building2 />}
      >
        <div className="surface grid gap-3 p-3 md:grid-cols-[2fr_1fr_auto]">
          <div className="relative">
            <Search className="absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              ref={ref}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={t("Search hospital name")}
              className="h-11 pl-10 text-base"
            />
          </div>
          <WardSelect value={ward} onChange={setWard} />
          <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 font-semibold">
            <Switch checked={emergency} onCheckedChange={setEmergency} />
            <Siren className="size-4 text-emergency" /> {t("Emergency available")}
          </label>
        </div>
      </PageHeader>
      <section className="container-page py-8">
        <p className="mb-4 text-sm text-muted-foreground">
          {list.length} {t("results")}
        </p>
        {list.length === 0 ? (
          <EmptyState
            title="No hospitals match your search"
            hint="Try another ward or turn off the emergency filter."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {list.map((h) => (
              <article key={h.id} className="surface flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-bold">{h.name}</h2>
                  {h.emergency ? (
                    <Badge variant="danger">{t("24x7 Emergency")}</Badge>
                  ) : (
                    <Badge variant="muted">{t("No emergency")}</Badge>
                  )}
                </div>
                <p className="flex items-start gap-2 text-muted-foreground">
                  <MapPin className="mt-1 size-4 shrink-0" /> {h.address} · {t("Ward")} {h.ward}
                </p>
                <p>
                  <span className="font-semibold">{h.contactPerson}</span>{" "}
                  <span className="text-muted-foreground">· {h.designation}</span>
                </p>
                <p className="font-mono text-lg">{h.phone}</p>
                <Verified date={h.lastVerified} />
                <div className="mt-auto flex flex-wrap items-center gap-2">
                  <CallButton phone={h.phone} size="lg" className="flex-1 sm:flex-none" />
                  <ReportButton entityType="Hospital" entityId={h.id} entityName={h.name} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
