import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import { ListChecks, Search } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { EmptyState, Field, PageHeader, StatusBadge } from "@/components/site/ui-bits";
import { useT } from "@/lib/i18n";
import { isValidPhone, normalizePhone } from "@/lib/logic";
import { seo } from "@/lib/seo";
import { useDB } from "@/lib/store";

export const Route = createFileRoute("/my-booking")({
  validateSearch: z.object({ phone: z.string().optional().catch(undefined) }),
  head: () =>
    seo("My Booking", "Check the status of your doctor appointment using your phone number."),
  component: MyBooking,
});

function MyBooking() {
  const { t } = useT();
  const db = useDB();
  const s = Route.useSearch();
  const [phone, setPhone] = useState(s.phone ?? "");
  const [query, setQuery] = useState(s.phone ?? "");
  const [err, setErr] = useState("");
  const list = query
    ? db.appointments.filter((a) => normalizePhone(a.phone) === normalizePhone(query))
    : [];

  const go = () => {
    if (!isValidPhone(phone)) return setErr("Enter a valid 10-digit phone number.");
    setErr("");
    setQuery(phone);
  };

  return (
    <>
      <PageHeader
        title={t("My Booking")}
        subtitle={t("Enter the phone number you used when booking.")}
        icon={<ListChecks />}
      >
        <div className="surface flex flex-col gap-3 p-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <Field label="Phone number" error={err} hint="Try 90000 00500 to see a sample booking.">
              <Input
                className="h-11 text-base"
                inputMode="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && go()}
              />
            </Field>
          </div>
          <Button size="lg" onClick={go}>
            <Search /> {t("Find my bookings")}
          </Button>
        </div>
      </PageHeader>
      <section className="container-page py-8">
        {!query ? null : list.length === 0 ? (
          <EmptyState
            title="No bookings found for this number"
            action={
              <Button asChild>
                <Link to="/doctors">{t("Book a Doctor")}</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {list.map((a) => {
              const doc = db.doctors.find((d) => d.id === a.doctorId);
              return (
                <article key={a.id} className="surface space-y-2 p-5">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-mono text-lg font-bold">{a.id}</p>
                    <StatusBadge status={a.status} />
                  </div>
                  <p className="text-xl font-bold">{doc?.name ?? t("Doctor")}</p>
                  <p className="text-muted-foreground">{doc ? t(doc.specialty) : ""}</p>
                  <p className="font-semibold">
                    {format(parseISO(a.date), "EEEE, d MMM yyyy")} · {a.time}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("Patient")}: {a.patientName}, {a.age} · {a.problem}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </>
  );
}
