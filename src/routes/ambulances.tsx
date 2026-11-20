import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { Ambulance, Clock, MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ReportButton } from "@/components/site/ReportDialog";
import {
  CallButton,
  Chip,
  EmptyState,
  PageHeader,
  Verified,
  WardSelect,
} from "@/components/site/ui-bits";
import { useT } from "@/lib/i18n";
import { seo } from "@/lib/seo";
import { useDB } from "@/lib/store";
import { AMBULANCE_TYPES } from "@/lib/types";

const search = z.object({ focus: z.string().optional().catch(undefined) });

export const Route = createFileRoute("/ambulances")({
  validateSearch: search,
  head: () =>
    seo(
      "Ambulance Directory",
      "Basic, ICU, oxygen and freezer van ambulances in Bidhannagar. Filter by type and ward and call instantly.",
    ),
  component: Ambulances,
});

function Ambulances() {
  const { t } = useT();
  const db = useDB();
  const s = Route.useSearch();
  const [type, setType] = useState("");
  const [ward, setWard] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (s.focus === "1") ref.current?.querySelector("button")?.focus();
  }, [s.focus]);
  const list = useMemo(
    () =>
      db.ambulances.filter((a) => (!type || a.type === type) && (!ward || String(a.ward) === ward)),
    [db.ambulances, type, ward],
  );
  return (
    <>
      <PageHeader
        title={t("Ambulance Directory")}
        subtitle={t("Choose the type of ambulance you need and call directly.")}
        icon={<Ambulance />}
      >
        <div className="surface space-y-3 p-3">
          <div ref={ref} className="flex flex-wrap gap-2">
            <Chip active={type === ""} onClick={() => setType("")}>
              {t("All types")}
            </Chip>
            {AMBULANCE_TYPES.map((x) => (
              <Chip key={x} active={type === x} onClick={() => setType(type === x ? "" : x)}>
                {t(x)}
              </Chip>
            ))}
          </div>
          <WardSelect value={ward} onChange={setWard} className="md:max-w-xs" />
        </div>
      </PageHeader>
      <section className="container-page py-8">
        <p className="mb-4 text-sm text-muted-foreground">
          {list.length} {t("results")}
        </p>
        {list.length === 0 ? (
          <EmptyState
            title="No ambulance matches your filters"
            hint="Try All types or All wards, or call the 24x7 helpline."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {list.map((a) => (
              <article key={a.id} className="surface flex flex-col gap-3 p-5">
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-xl font-bold">{a.name}</h2>
                  <Badge variant="warning">{t(a.type)}</Badge>
                </div>
                <p className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="size-4" /> {t("Ward")} {a.ward}
                  <span className="mx-1">·</span>
                  <Clock className="size-4" />{" "}
                  {a.is24x7 ? (
                    <span className="font-semibold text-success">{t("24x7")}</span>
                  ) : (
                    t("Day time only")
                  )}
                </p>
                <p className="font-semibold">{a.contactPerson}</p>
                <p className="font-mono text-lg">{a.phone}</p>
                <Verified date={a.lastVerified} />
                <div className="mt-auto flex flex-wrap items-center gap-2">
                  <CallButton phone={a.phone} size="lg" className="flex-1 sm:flex-none" />
                  <ReportButton entityType="Ambulance" entityId={a.id} entityName={a.name} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
