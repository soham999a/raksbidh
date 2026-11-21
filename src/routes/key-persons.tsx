import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Clock3, MapPin, Users } from "lucide-react";
import { CoFounderCredit, FounderCredit } from "@/components/site/FounderCredit";
import {
  Avatar,
  CallButton,
  Chip,
  EmptyState,
  PageHeader,
  WhatsAppButton,
} from "@/components/site/ui-bits";
import { useT } from "@/lib/i18n";
import { seo } from "@/lib/seo";
import { useDB } from "@/lib/store";
import { KEY_ROLES } from "@/lib/types";

export const Route = createFileRoute("/key-persons")({
  head: () =>
    seo(
      "Key Persons",
      "Ward coordinators, volunteers and health workers you can contact for local help in Bidhannagar.",
    ),
  component: KeyPersons,
});

function KeyPersons() {
  const { t } = useT();
  const db = useDB();
  const [role, setRole] = useState("");
  const [ward, setWard] = useState("");

  const people = useMemo(
    () =>
      db.keyPersons
        .filter((p) => !role || p.role === role)
        .filter((p) => !ward || String(p.ward) === ward)
        .sort((a, b) => a.ward - b.ward),
    [db.keyPersons, role, ward],
  );

  return (
    <>
      <PageHeader
        title={t("Key Persons")}
        subtitle={t(
          "The local people who can help fastest — coordinators, volunteers and health workers.",
        )}
        icon={<Users />}
      />
      <section className="container-page pt-8">
        <FounderCredit featured />
        <CoFounderCredit />
      </section>
      <section className="container-page py-8">
        <div className="surface mb-6 flex flex-wrap gap-3 p-5">
          <select
            className="field-control max-w-xs"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            aria-label={t("Role")}
          >
            <option value="">{t("All roles")}</option>
            {KEY_ROLES.map((r) => (
              <option key={r} value={r}>
                {t(r)}
              </option>
            ))}
          </select>
          <select
            className="field-control max-w-xs"
            value={ward}
            onChange={(e) => setWard(e.target.value)}
            aria-label={t("Ward")}
          >
            <option value="">{t("All wards")}</option>
            {db.wards.map((w) => (
              <option key={w.id} value={String(w.number)}>
                {t("Ward")} {w.number}
              </option>
            ))}
          </select>
          <div className="flex flex-wrap gap-2">
            {role && (
              <Chip active onClick={() => setRole("")}>
                {t(role)} ×
              </Chip>
            )}
            {ward && (
              <Chip active onClick={() => setWard("")}>
                {t("Ward")} {ward} ×
              </Chip>
            )}
          </div>
        </div>

        {people.length === 0 ? (
          <EmptyState title="No contacts found" hint="Try widening your filters." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {people.map((p) => (
              <div key={p.id} className="surface flex flex-col gap-4 p-5">
                <div className="flex items-center gap-3">
                  <Avatar name={p.name} className="size-14" />
                  <div className="min-w-0">
                    <h2 className="truncate text-lg font-bold">{p.name}</h2>
                    <p className="text-sm font-semibold text-primary-strong">{t(p.role)}</p>
                  </div>
                </div>
                <div className="space-y-1.5 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2">
                    <MapPin className="size-4" /> {t("Ward")} {p.ward}
                  </p>
                  <p className="flex items-center gap-2">
                    <Clock3 className="size-4" /> {p.hours}
                  </p>
                </div>
                <div className="mt-auto flex flex-wrap gap-2 pt-2">
                  <CallButton phone={p.phone} size="sm" />
                  <WhatsAppButton
                    phone={p.phone}
                    size="sm"
                    text={`Hello ${p.name}, I need help in Bidhannagar.`}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
