import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { CalendarCheck2, LogOut, MessageCircle, Phone, Stethoscope } from "lucide-react";
import { toast } from "sonner";
import {
  Avatar,
  Field,
  NativeSelect,
  PageHeader,
  StatusBadge,
  fmtDate,
} from "@/components/site/ui-bits";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useT } from "@/lib/i18n";
import { checkLogin, DEMO_PASSWORD, telHref, todayISO } from "@/lib/logic";
import { seo } from "@/lib/seo";
import { signIn, signOut, updateDB, useDB, useSession } from "@/lib/store";
import type { AppointmentStatus } from "@/lib/types";

export const Route = createFileRoute("/doctor-panel")({
  head: () =>
    seo("Doctor Panel", "Demo sign-in for doctors to review and manage their appointments."),
  component: DoctorPanel,
});

function DoctorPanel() {
  const { t } = useT();
  const db = useDB();
  const session = useSession();
  const [email, setEmail] = useState("doctor@demo.com");
  const [password, setPassword] = useState("");

  const doctor = useMemo(
    () => db.doctors.find((d) => d.email === session?.email),
    [db.doctors, session],
  );
  const appointments = useMemo(
    () =>
      db.appointments
        .filter((a) => a.doctorId === doctor?.id)
        .sort((a, b) => `${b.date}${b.time}`.localeCompare(`${a.date}${a.time}`)),
    [db.appointments, doctor],
  );
  const today = todayISO();

  if (!session || session.role !== "Doctor") {
    return (
      <>
        <PageHeader
          title={t("Doctor Panel")}
          subtitle={t("Sign in with the demo doctor account to manage your appointments.")}
          icon={<Stethoscope />}
        />
        <section className="container-page py-10">
          <form
            className="surface mx-auto max-w-md space-y-4 p-6"
            onSubmit={(e) => {
              e.preventDefault();
              const role = checkLogin(email, password);
              if (role !== "Doctor") {
                toast.error(t("Use the demo doctor account: doctor@demo.com / demo123"));
                return;
              }
              signIn({ email: email.trim().toLowerCase(), role });
              toast.success(t("Signed in to the doctor panel"));
            }}
          >
            <h2 className="text-2xl font-bold">{t("Doctor sign in")}</h2>
            <p className="rounded-lg bg-info-soft p-3 text-sm text-info">
              {t("Demo credentials")}: <b>doctor@demo.com</b> / <b>{DEMO_PASSWORD}</b>
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

  return (
    <>
      <PageHeader
        title={t("Doctor Panel")}
        subtitle={t("Your appointment queue and recent patient messages.")}
        icon={<Stethoscope />}
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

      {!doctor ? (
        <section className="container-page py-10">
          <div className="surface mx-auto max-w-lg p-6 text-center">
            <p className="text-lg font-semibold">
              {t("No doctor profile matches this demo account.")}
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{session.email}</p>
          </div>
        </section>
      ) : (
        <section className="container-page space-y-6 py-8">
          <div className="surface flex flex-wrap items-center gap-4 p-5">
            <Avatar name={doctor.name} />
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-bold">{doctor.name}</h2>
              <p className="text-sm text-muted-foreground">
                {doctor.specialty} · {doctor.experience} {t("yrs experience")}
              </p>
            </div>
            <Badge variant={doctor.online ? "success" : "muted"}>
              {doctor.online ? t("Online now") : t("Offline")}
            </Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: "Total appointments", value: appointments.length },
              { label: "Today", value: appointments.filter((a) => a.date === today).length },
              {
                label: "Awaiting confirmation",
                value: appointments.filter((a) => a.status === "Pending").length,
              },
            ].map((s) => (
              <div key={s.label} className="surface p-5">
                <p className="font-display text-3xl font-extrabold">{s.value}</p>
                <p className="text-sm text-muted-foreground">{t(s.label)}</p>
              </div>
            ))}
          </div>

          <div className="surface overflow-hidden">
            <div className="flex items-center gap-2 border-b p-5">
              <CalendarCheck2 className="size-5 text-primary-strong" />
              <h2 className="text-xl font-bold">{t("Appointments")}</h2>
            </div>
            {appointments.length === 0 ? (
              <p className="p-8 text-center text-muted-foreground">{t("No appointments yet.")}</p>
            ) : (
              <div className="divide-y">
                {appointments.map((a) => (
                  <div
                    key={a.id}
                    className="grid gap-3 p-5 sm:grid-cols-[1fr_auto] sm:items-center"
                  >
                    <div>
                      <p className="font-bold">
                        {a.patientName}{" "}
                        <span className="text-sm font-normal text-muted-foreground">
                          · {a.age} {t("yrs")}
                        </span>
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {fmtDate(a.date)} · {a.time} · {a.problem}
                      </p>
                      <p className="mt-1 text-sm font-semibold">{a.phone}</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusBadge status={a.status} />
                      <NativeSelect
                        value={a.status}
                        aria-label={t("Update status")}
                        onChange={(e) => {
                          const status = e.target.value as AppointmentStatus;
                          updateDB((d) => {
                            const item = d.appointments.find((x) => x.id === a.id);
                            if (item) item.status = status;
                          });
                          toast.success(t("Appointment updated"));
                        }}
                      >
                        {(["Pending", "Confirmed", "Completed", "Cancelled"] as const).map((s) => (
                          <option key={s} value={s}>
                            {t(s)}
                          </option>
                        ))}
                      </NativeSelect>
                      <Button asChild variant="success" size="sm">
                        <a href={telHref(a.phone)}>
                          <Phone /> {t("Call")}
                        </a>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="surface p-5">
            <div className="flex items-center gap-2">
              <MessageCircle className="size-5 text-primary-strong" />
              <h2 className="text-xl font-bold">{t("Patient messages")}</h2>
            </div>
            {db.chats.filter((c) => c.doctorId === doctor.id).length === 0 ? (
              <p className="mt-3 text-sm text-muted-foreground">{t("No messages yet.")}</p>
            ) : (
              <div className="mt-3 space-y-3">
                {db.chats
                  .filter((c) => c.doctorId === doctor.id)
                  .map((c) => (
                    <div key={c.id} className="rounded-xl border p-4">
                      <p className="font-semibold">{c.patientName}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {c.messages.at(-1)?.text ?? t("No messages yet.")}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </section>
      )}
    </>
  );
}
