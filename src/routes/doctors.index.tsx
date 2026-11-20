import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Languages, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, Chip, EmptyState, PageHeader } from "@/components/site/ui-bits";
import { useT } from "@/lib/i18n";
import { seo } from "@/lib/seo";
import { useDB } from "@/lib/store";

export const Route = createFileRoute("/doctors/")({
  head: () =>
    seo(
      "Book a Doctor Online",
      "See doctors serving Bidhannagar, who is online now, their fees and free slots. Book an online consultation in minutes.",
    ),
  component: Doctors,
});

function Doctors() {
  const { t } = useT();
  const db = useDB();
  const [spec, setSpec] = useState("");
  const [now, setNow] = useState(false);
  const specialties = useMemo(() => [...new Set(db.doctors.map((d) => d.specialty))], [db.doctors]);
  const list = db.doctors.filter((d) => (!spec || d.specialty === spec) && (!now || d.online));
  return (
    <>
      <PageHeader
        title={t("Online Doctor Assistance")}
        subtitle={t("Book a video or phone consultation with a local doctor.")}
        icon={<Stethoscope />}
      >
        <div className="surface space-y-3 p-3">
          <div className="flex flex-wrap gap-2">
            <Chip active={spec === ""} onClick={() => setSpec("")}>
              {t("All specialties")}
            </Chip>
            {specialties.map((s) => (
              <Chip key={s} active={spec === s} onClick={() => setSpec(spec === s ? "" : s)}>
                {t(s)}
              </Chip>
            ))}
          </div>
          <label className="inline-flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 font-semibold">
            <Switch checked={now} onCheckedChange={setNow} /> {t("Available now")}
          </label>
        </div>
      </PageHeader>
      <section className="container-page py-8">
        {list.length === 0 ? (
          <EmptyState
            title="No doctors match these filters"
            hint="Try another specialty or turn off Available now."
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {list.map((d) => (
              <article key={d.id} className="surface flex gap-4 p-5">
                <Avatar name={d.name} />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-bold">{d.name}</h2>
                    {d.online ? (
                      <Badge variant="success">● {t("Online now")}</Badge>
                    ) : (
                      <Badge variant="muted">{t("Offline")}</Badge>
                    )}
                  </div>
                  <p className="font-semibold text-primary-strong">{t(d.specialty)}</p>
                  <p className="text-sm text-muted-foreground">
                    {d.qualification} · {d.experience} {t("years experience")}
                  </p>
                  <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                    <Languages className="size-4" /> {d.languages}
                  </p>
                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                    <p className="text-lg font-bold">₹{d.fee}</p>
                    <Button asChild size="lg">
                      <Link to="/doctors/$id" params={{ id: d.id }}>
                        {t("View slots & book")}
                      </Link>
                    </Button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
