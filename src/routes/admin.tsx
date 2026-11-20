import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  FileText,
  Inbox,
  LayoutDashboard,
  LogOut,
  RotateCcw,
  Settings2,
} from "lucide-react";
import { toast } from "sonner";
import { Chip, Field, NativeSelect, PageHeader, StatusBadge } from "@/components/site/ui-bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useT } from "@/lib/i18n";
import { checkLogin, DEMO_PASSWORD, resizeWards } from "@/lib/logic";
import { seo } from "@/lib/seo";
import { getDB, resetDB, signIn, signOut, updateDB, useDB, useSession } from "@/lib/store";
import type { TicketStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin")({
  head: () =>
    seo("Admin Dashboard", "Demo admin dashboard for the Praner Pashe community health directory."),
  component: Admin,
});

type Tab = "overview" | "inbox" | "content" | "settings";
const STATUSES: TicketStatus[] = ["New", "In-progress", "Resolved"];

function Admin() {
  const { t } = useT();
  const db = useDB();
  const session = useSession();
  const [tab, setTab] = useState<Tab>("overview");
  const [email, setEmail] = useState("admin@demo.com");
  const [password, setPassword] = useState("");

  const stats = useMemo(
    () => [
      { label: "Hospitals", value: db.hospitals.length },
      { label: "Blood banks", value: db.bloodBanks.length },
      { label: "Ambulances", value: db.ambulances.length },
      { label: "Doctors", value: db.doctors.length },
      { label: "Donors", value: db.donors.length },
      { label: "Appointments", value: db.appointments.length },
      { label: "Open tickets", value: db.tickets.filter((x) => x.status !== "Resolved").length },
      { label: "Blood requests", value: db.bloodRequests.length },
    ],
    [db],
  );

  const setStatus = (
    collection: "tickets" | "bloodRequests" | "contactRequests" | "reports",
    id: string,
    status: TicketStatus,
  ) => {
    updateDB((d) => {
      const item = d[collection].find((x) => x.id === id);
      if (item) item.status = status;
    });
    toast.success(t("Status updated"));
  };

  if (!session || session.role === "Doctor") {
    return (
      <>
        <PageHeader
          title={t("Admin Dashboard")}
          subtitle={t("Sign in with a demo staff account to manage the directory.")}
          icon={<LayoutDashboard />}
        />
        <section className="container-page py-10">
          <form
            className="surface mx-auto max-w-md space-y-4 p-6"
            onSubmit={(e) => {
              e.preventDefault();
              const role = checkLogin(email, password);
              if (!role || role === "Doctor") {
                toast.error(t("Use a demo staff account, e.g. admin@demo.com / demo123"));
                return;
              }
              signIn({ email: email.trim().toLowerCase(), role });
              toast.success(t(`Signed in as ${role}`));
            }}
          >
            <h2 className="text-2xl font-bold">{t("Staff sign in")}</h2>
            <p className="rounded-lg bg-info-soft p-3 text-sm text-info">
              {t("Demo credentials")}: <b>admin@demo.com</b> / <b>{DEMO_PASSWORD}</b>
            </p>
            <Field label="Email">
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="username"
              />
            </Field>
            <Field label="Password">
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </Field>
            <Button type="submit" className="w-full">
              {t("Sign in")}
            </Button>
          </form>
        </section>
      </>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof Activity }[] = [
    { id: "overview", label: "Overview", icon: Activity },
    { id: "inbox", label: "Inbox", icon: Inbox },
    { id: "content", label: "Blog manager", icon: FileText },
    { id: "settings", label: "Settings", icon: Settings2 },
  ];

  return (
    <>
      <PageHeader
        title={t("Admin Dashboard")}
        subtitle={`${session.role} · ${session.email}`}
        icon={<LayoutDashboard />}
      >
        <Button
          variant="outline"
          onClick={() => {
            signOut();
            toast.success(t("Signed out"));
          }}
        >
          <LogOut /> {t("Sign out")}
        </Button>
      </PageHeader>

      <section className="container-page py-8">
        <div className="mb-6 flex flex-wrap gap-2">
          {tabs.map((x) => (
            <Chip key={x.id} active={tab === x.id} onClick={() => setTab(x.id)}>
              <x.icon className="size-4" /> {t(x.label)}
            </Chip>
          ))}
        </div>

        {tab === "overview" && (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {stats.map((s) => (
              <div key={s.label} className="surface p-5">
                <p className="font-display text-3xl font-extrabold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{t(s.label)}</p>
              </div>
            ))}
          </div>
        )}

        {tab === "inbox" && (
          <div className="space-y-6">
            <div className="surface overflow-hidden">
              <h2 className="border-b p-5 text-xl font-bold">{t("Helpline tickets")}</h2>
              {db.tickets.length === 0 && (
                <p className="p-6 text-muted-foreground">{t("Nothing here yet.")}</p>
              )}
              {db.tickets.map((x) => (
                <div
                  key={x.id}
                  className="grid gap-2 border-b p-4 last:border-0 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <div>
                    <p className="font-semibold">
                      {x.name} · {x.issue}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {x.note} · {x.phone}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={x.status} />
                    <NativeSelect
                      value={x.status}
                      aria-label={t("Update status")}
                      onChange={(e) => setStatus("tickets", x.id, e.target.value as TicketStatus)}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {t(s)}
                        </option>
                      ))}
                    </NativeSelect>
                  </div>
                </div>
              ))}
            </div>

            <div className="surface overflow-hidden">
              <h2 className="border-b p-5 text-xl font-bold">{t("Blood requests")}</h2>
              {db.bloodRequests.length === 0 && (
                <p className="p-6 text-muted-foreground">{t("Nothing here yet.")}</p>
              )}
              {db.bloodRequests.map((x) => (
                <div
                  key={x.id}
                  className="grid gap-2 border-b p-4 last:border-0 sm:grid-cols-[1fr_auto] sm:items-center"
                >
                  <div>
                    <p className="font-semibold">
                      {x.patientName} · {x.group} × {x.units}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {x.hospital} · {x.phone}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusBadge status={x.status} />
                    <NativeSelect
                      value={x.status}
                      aria-label={t("Update status")}
                      onChange={(e) =>
                        setStatus("bloodRequests", x.id, e.target.value as TicketStatus)
                      }
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s}>
                          {t(s)}
                        </option>
                      ))}
                    </NativeSelect>
                  </div>
                </div>
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {[
                { key: "contactRequests" as const, title: "Donor contact requests" },
                { key: "reports" as const, title: "Listing reports" },
              ].map((group) => (
                <div key={group.key} className="surface overflow-hidden">
                  <h2 className="border-b p-5 text-xl font-bold">{t(group.title)}</h2>
                  {db[group.key].length === 0 && (
                    <p className="p-6 text-muted-foreground">{t("Nothing here yet.")}</p>
                  )}
                  {db[group.key].map((x) => (
                    <div
                      key={x.id}
                      className="flex items-center justify-between gap-2 border-b p-4 last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold">
                          {"entityName" in x ? x.entityName : x.donorName}
                        </p>
                        <p className="truncate text-sm text-muted-foreground">
                          {"message" in x ? x.message : `${x.hospital} · ${x.urgency}`}
                        </p>
                      </div>
                      <NativeSelect
                        value={x.status}
                        aria-label={t("Update status")}
                        onChange={(e) => setStatus(group.key, x.id, e.target.value as TicketStatus)}
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {t(s)}
                          </option>
                        ))}
                      </NativeSelect>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === "content" && (
          <div className="surface overflow-hidden">
            <h2 className="border-b p-5 text-xl font-bold">{t("Blog posts")}</h2>
            {db.posts.map((p) => (
              <div
                key={p.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b p-4 last:border-0"
              >
                <div>
                  <p className="font-semibold">{p.title}</p>
                  <p className="text-sm text-muted-foreground">
                    {p.category} · {p.author}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={p.status} />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      updateDB((d) => {
                        const post = d.posts.find((x) => x.id === p.id);
                        if (post) post.status = post.status === "Published" ? "Draft" : "Published";
                      });
                      toast.success(t("Post status updated"));
                    }}
                  >
                    {p.status === "Published" ? t("Unpublish") : t("Publish")}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        {tab === "settings" && <SettingsForm />}
      </section>
    </>
  );
}

function SettingsForm() {
  const { t } = useT();
  const db = useDB();
  const [form, setForm] = useState({ ...db.settings });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
      <form
        className="surface space-y-4 p-6"
        onSubmit={(e) => {
          e.preventDefault();
          updateDB((d) => {
            d.settings = { ...form, wardCount: Math.min(30, Math.max(1, form.wardCount)) };
            resizeWards(d, d.settings.wardCount);
          });
          toast.success(t("Settings saved"));
        }}
      >
        <h2 className="text-xl font-bold">{t("Site settings")}</h2>
        <Field label="Site name">
          <Input
            value={form.siteName}
            onChange={(e) => setForm({ ...form, siteName: e.target.value })}
            required
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Helpline">
            <Input
              value={form.helpline}
              onChange={(e) => setForm({ ...form, helpline: e.target.value })}
              required
            />
          </Field>
          <Field label="WhatsApp">
            <Input
              value={form.whatsapp}
              onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
            />
          </Field>
          <Field label="Number of wards">
            <Input
              type="number"
              min={1}
              max={30}
              value={form.wardCount}
              onChange={(e) => setForm({ ...form, wardCount: Number(e.target.value) })}
            />
          </Field>
          <Field label="Default language">
            <NativeSelect
              value={form.defaultLang}
              onChange={(e) => setForm({ ...form, defaultLang: e.target.value as "en" | "bn" })}
            >
              <option value="en">English</option>
              <option value="bn">বাংলা</option>
            </NativeSelect>
          </Field>
        </div>
        <Button type="submit">{t("Save settings")}</Button>
      </form>

      <div className="surface h-fit space-y-3 p-6">
        <h2 className="text-xl font-bold">{t("Danger zone")}</h2>
        <p className="text-sm text-muted-foreground">
          {t("Restore all demo listings, bookings and posts to their original seeded state.")}
        </p>
        <Button
          variant="destructive"
          className={cn("w-full")}
          onClick={() => {
            if (!window.confirm(t("Reset all demo data? This cannot be undone."))) return;
            resetDB();
            setForm({ ...getDB().settings });
            toast.success(t("Demo data reset"));
          }}
        >
          <RotateCcw /> {t("Reset demo data")}
        </Button>
        <Badge variant="warning">{t("Local to this browser")}</Badge>
      </div>
    </div>
  );
}
