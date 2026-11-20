import { useEffect, useMemo, useRef, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { format, parseISO } from "date-fns";
import {
  ArrowLeft,
  CheckCircle2,
  MessageSquare,
  Mic,
  MicOff,
  PhoneOff,
  Radio,
  Send,
  Video,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, EmptyState, Field } from "@/components/site/ui-bits";
import { ReportButton } from "@/components/site/ReportDialog";
import { useT } from "@/lib/i18n";
import { bookingId, isBooked, isValidPhone, nextDays, slotsFor, todayISO, uid } from "@/lib/logic";
import { seo } from "@/lib/seo";
import { getDB, updateDB, useDB } from "@/lib/store";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/doctors/$id")({
  head: () =>
    seo(
      "Doctor profile and booking",
      "Choose a free time slot and book an online consultation with a Bidhannagar doctor.",
    ),
  component: DoctorPage,
});

function DoctorPage() {
  const { id } = Route.useParams();
  const { t } = useT();
  const db = useDB();
  const doctor = db.doctors.find((d) => d.id === id);
  const days = useMemo(() => nextDays(7), []);
  const [day, setDay] = useState(0);
  const [slot, setSlot] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", phone: "", age: "", problem: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmed, setConfirmed] = useState<string | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [videoOpen, setVideoOpen] = useState(false);

  const date = days[day] ?? new Date();
  const dateISO = todayISO(date);
  const slots = doctor ? slotsFor(doctor, date, db.appointments) : [];

  // If someone else (another tab) books the selected slot, drop it.
  useEffect(() => {
    if (doctor && slot && isBooked(db.appointments, doctor.id, dateISO, slot)) {
      setSlot(null);
      toast.info(t("That slot was just booked by someone else. Please pick another."));
    }
  }, [db.appointments, doctor, slot, dateISO, t]);

  if (!doctor) {
    return (
      <div className="container-page py-12">
        <EmptyState
          title="Doctor not found"
          action={
            <Button asChild>
              <Link to="/doctors">{t("Back to doctors")}</Link>
            </Button>
          }
        />
      </div>
    );
  }

  const submit = () => {
    const e: Record<string, string> = {};
    if (!slot) e.slot = "Please choose a time slot.";
    if (form.name.trim().length < 2) e.name = "Please enter the patient's name.";
    if (!isValidPhone(form.phone)) e.phone = "Enter a valid 10-digit phone number.";
    const age = Number(form.age);
    if (!form.age || !Number.isInteger(age) || age < 0 || age > 120)
      e.age = "Enter an age between 0 and 120.";
    if (form.problem.trim().length < 3) e.problem = "Please describe the problem briefly.";
    setErrors(e);
    if (Object.keys(e).length || !slot) return;
    if (isBooked(getDB().appointments, doctor.id, dateISO, slot)) {
      toast.error(t("Sorry, this slot was just booked. Please choose another."));
      setSlot(null);
      return;
    }
    const bid = bookingId();
    updateDB((d) => {
      d.appointments.push({
        id: bid,
        doctorId: doctor.id,
        date: dateISO,
        time: slot,
        patientName: form.name.trim(),
        phone: form.phone.trim(),
        age,
        problem: form.problem.trim(),
        status: "Pending",
        createdAt: todayISO(),
      });
    });
    setConfirmed(bid);
    toast.success(t("Booking confirmed!"));
  };

  if (confirmed) {
    const appt = db.appointments.find((a) => a.id === confirmed);
    return (
      <div className="container-page max-w-xl py-12">
        <div className="surface space-y-4 p-6 text-center">
          <CheckCircle2 className="mx-auto size-16 text-success" />
          <h1 className="text-3xl font-bold">{t("Booking received")}</h1>
          <p className="text-muted-foreground">
            {t("Save your booking ID. The doctor will confirm soon.")}
          </p>
          <p className="rounded-xl bg-primary-soft py-4 font-mono text-3xl font-bold tracking-wider">
            {confirmed}
          </p>
          {appt && (
            <div className="space-y-1 text-left">
              <p>
                <span className="text-muted-foreground">{t("Doctor")}:</span> <b>{doctor.name}</b>
              </p>
              <p>
                <span className="text-muted-foreground">{t("When")}:</span>{" "}
                <b>
                  {format(parseISO(appt.date), "EEE d MMM")} · {appt.time}
                </b>
              </p>
              <p>
                <span className="text-muted-foreground">{t("Patient")}:</span>{" "}
                <b>{appt.patientName}</b>
              </p>
            </div>
          )}
          <div className="grid gap-2 sm:grid-cols-2">
            <Button asChild size="lg">
              <Link to="/my-booking" search={{ phone: appt?.phone }}>
                {t("Go to My Booking")}
              </Link>
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                setConfirmed(null);
                setSlot(null);
                setForm({ name: "", phone: "", age: "", problem: "" });
              }}
            >
              {t("Book another slot")}
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-6">
      <Link
        to="/doctors"
        className="mb-4 inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground"
      >
        <ArrowLeft className="size-4" /> {t("All doctors")}
      </Link>
      <div className="grid gap-6 lg:grid-cols-[1fr_1.4fr]">
        <aside className="surface h-fit space-y-4 p-5">
          <div className="flex items-start gap-4">
            <Avatar name={doctor.name} className="size-20 text-2xl" />
            <div>
              <h1 className="text-2xl font-bold">{doctor.name}</h1>
              <p className="font-semibold text-primary-strong">{t(doctor.specialty)}</p>
              {doctor.online ? (
                <Badge variant="success">● {t("Online now")}</Badge>
              ) : (
                <Badge variant="muted">{t("Offline")}</Badge>
              )}
            </div>
          </div>
          <dl className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <dt className="text-muted-foreground">{t("Qualification")}</dt>
              <dd className="font-semibold">{doctor.qualification}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("Experience")}</dt>
              <dd className="font-semibold">
                {doctor.experience} {t("years")}
              </dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("Fee")}</dt>
              <dd className="font-semibold">₹{doctor.fee}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">{t("Language")}</dt>
              <dd className="font-semibold">{doctor.languages}</dd>
            </div>
          </dl>
          <p className="text-muted-foreground">{doctor.bio}</p>
          <div className="rounded-xl border border-dashed p-3">
            <p className="mb-2 text-sm font-semibold">
              {t("Talk to doctor now")} <Badge variant="info">{t("Demo")}</Badge>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <Button variant="soft" onClick={() => setChatOpen(true)}>
                <MessageSquare /> {t("Chat")}
              </Button>
              <Button variant="soft" onClick={() => setVideoOpen(true)}>
                <Video /> {t("Video call")}
              </Button>
            </div>
          </div>
          <ReportButton entityType="Doctor" entityId={doctor.id} entityName={doctor.name} />
        </aside>

        <section className="space-y-5">
          <div className="surface p-5">
            <div className="mb-3 flex items-center justify-between gap-2">
              <h2 className="text-xl font-bold">1. {t("Choose a day")}</h2>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-success">
                <Radio className="size-3.5 animate-pulse" /> {t("Live slot status")}
              </span>
            </div>
            <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
              {days.map((d, i) => {
                const works = doctor.workingDays.includes(d.getDay());
                return (
                  <button
                    key={i}
                    type="button"
                    disabled={!works}
                    onClick={() => {
                      setDay(i);
                      setSlot(null);
                    }}
                    className={cn(
                      "flex min-w-16 cursor-pointer flex-col items-center rounded-xl border px-3 py-2 disabled:cursor-not-allowed disabled:opacity-40",
                      day === i
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-card hover:bg-primary-soft",
                    )}
                  >
                    <span className="text-xs font-semibold uppercase">{format(d, "EEE")}</span>
                    <span className="font-display text-2xl font-bold">{format(d, "d")}</span>
                    <span className="text-xs">{format(d, "MMM")}</span>
                  </button>
                );
              })}
            </div>
            <h2 className="mt-5 mb-3 text-xl font-bold">2. {t("Choose a time")}</h2>
            {slots.length === 0 ? (
              <p className="text-muted-foreground">
                {t("The doctor is not available on this day.")}
              </p>
            ) : (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {slots.map((s) => (
                  <button
                    key={s.time}
                    type="button"
                    disabled={s.booked}
                    onClick={() => setSlot(s.time)}
                    aria-pressed={slot === s.time}
                    className={cn(
                      "min-h-12 cursor-pointer rounded-lg border font-semibold disabled:cursor-not-allowed disabled:bg-muted disabled:text-muted-foreground disabled:line-through",
                      slot === s.time
                        ? "border-primary bg-primary text-primary-foreground"
                        : "bg-card hover:bg-primary-soft",
                    )}
                  >
                    {s.time}
                    {s.booked && (
                      <span className="block text-[10px] no-underline">{t("Booked")}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
            {errors.slot && (
              <p className="mt-2 text-sm font-medium text-destructive">{t(errors.slot)}</p>
            )}
          </div>

          <div className="surface space-y-4 p-5">
            <h2 className="text-xl font-bold">3. {t("Patient details")}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Patient name" error={errors.name}>
                <Input
                  className="h-11 text-base"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />
              </Field>
              <Field label="Phone number" error={errors.phone}>
                <Input
                  className="h-11 text-base"
                  inputMode="tel"
                  placeholder="90000 00000"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </Field>
              <Field label="Age" error={errors.age}>
                <Input
                  className="h-11 text-base"
                  inputMode="numeric"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Problem" error={errors.problem}>
              <Textarea
                rows={3}
                value={form.problem}
                onChange={(e) => setForm({ ...form, problem: e.target.value })}
              />
            </Field>
            <Button size="xl" className="w-full" onClick={submit}>
              {t("Confirm booking")} {slot ? `· ${format(date, "d MMM")} ${slot}` : ""}
            </Button>
          </div>
        </section>
      </div>
      <ChatDialog
        open={chatOpen}
        onOpenChange={setChatOpen}
        doctorId={doctor.id}
        doctorName={doctor.name}
      />
      <VideoDialog open={videoOpen} onOpenChange={setVideoOpen} doctorName={doctor.name} />
    </div>
  );
}

function ChatDialog({
  open,
  onOpenChange,
  doctorId,
  doctorName,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  doctorId: string;
  doctorName: string;
}) {
  const { t } = useT();
  const db = useDB();
  const [chatId, setChatId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [text, setText] = useState("");
  const endRef = useRef<HTMLDivElement>(null);
  const chat = db.chats.find((c) => c.id === chatId);
  useEffect(() => endRef.current?.scrollIntoView({ behavior: "smooth" }), [chat?.messages.length]);

  const start = () => {
    if (name.trim().length < 2) {
      toast.error(t("Please enter your name."));
      return;
    }
    const id = uid("c");
    updateDB((d) => {
      d.chats.unshift({
        id,
        doctorId,
        patientName: name.trim(),
        messages: [],
        updatedAt: new Date().toISOString(),
      });
    });
    setChatId(id);
  };

  const send = () => {
    if (!text.trim() || !chatId) return;
    const msg = text.trim();
    setText("");
    updateDB((d) => {
      const c = d.chats.find((x) => x.id === chatId);
      if (c) {
        c.messages.push({ from: "patient", text: msg, at: new Date().toISOString() });
        c.updatedAt = new Date().toISOString();
      }
    });
    // Simulated auto-reply if the doctor does not answer from the doctor panel.
    window.setTimeout(() => {
      updateDB((d) => {
        const c = d.chats.find((x) => x.id === chatId);
        if (c && c.messages.at(-1)?.from === "patient") {
          c.messages.push({
            from: "doctor",
            text: "Thank you. I have noted your concern. For a full check, please book a slot. (auto-reply, demo)",
            at: new Date().toISOString(),
          });
        }
      });
    }, 4000);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {doctorName} <Badge variant="info">{t("Demo")}</Badge>
          </DialogTitle>
          <DialogDescription>
            {t("Messages appear in the Doctor Panel inbox. The doctor can reply from there.")}
          </DialogDescription>
        </DialogHeader>
        {!chat ? (
          <div className="space-y-3">
            <Field label="Your name">
              <Input className="h-11" value={name} onChange={(e) => setName(e.target.value)} />
            </Field>
            <Button className="w-full" size="lg" onClick={start}>
              {t("Start chat")}
            </Button>
          </div>
        ) : (
          <div className="flex h-96 flex-col">
            <div className="flex-1 space-y-2 overflow-y-auto rounded-lg bg-muted p-3">
              {chat.messages.length === 0 && (
                <p className="text-center text-sm text-muted-foreground">
                  {t("Say hello to start.")}
                </p>
              )}
              {chat.messages.map((m, i) => (
                <div
                  key={i}
                  className={cn(
                    "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                    m.from === "patient" ? "ml-auto bg-primary text-primary-foreground" : "bg-card",
                  )}
                >
                  {m.text}
                </div>
              ))}
              <div ref={endRef} />
            </div>
            <div className="mt-2 flex gap-2">
              <Input
                className="h-11"
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && send()}
                placeholder={t("Type a message")}
              />
              <Button size="icon" onClick={send} aria-label={t("Send")}>
                <Send />
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

function VideoDialog({
  open,
  onOpenChange,
  doctorName,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  doctorName: string;
}) {
  const { t } = useT();
  const [sec, setSec] = useState(0);
  const [muted, setMuted] = useState(false);
  useEffect(() => {
    if (!open) return setSec(0);
    const i = window.setInterval(() => setSec((s) => s + 1), 1000);
    return () => window.clearInterval(i);
  }, [open]);
  const connected = sec >= 3;
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md overflow-hidden border-0 bg-ink p-0 text-ink-foreground">
        <DialogHeader className="sr-only">
          <DialogTitle>{t("Video call")}</DialogTitle>
          <DialogDescription>{t("Demo")}</DialogDescription>
        </DialogHeader>
        <div className="relative flex aspect-[3/4] flex-col items-center justify-center gap-3">
          <Badge variant="info" className="absolute top-3 left-3">
            {t("Demo video call")}
          </Badge>
          <Avatar name={doctorName} className="size-28 rounded-full text-4xl" />
          <p className="text-xl font-bold">{doctorName}</p>
          <p className="text-sm opacity-80">
            {connected
              ? `${t("Connected")} · ${String(Math.floor((sec - 3) / 60)).padStart(2, "0")}:${String((sec - 3) % 60).padStart(2, "0")}`
              : t("Connecting...")}
          </p>
          <div className="absolute right-3 bottom-24 flex size-24 items-center justify-center rounded-xl border border-ink-foreground/20 bg-ink-foreground/10 text-xs">
            {t("You")}
          </div>
          <div className="absolute bottom-6 flex gap-4">
            <Button
              size="icon"
              variant="secondary"
              className="rounded-full"
              onClick={() => setMuted(!muted)}
              aria-label={t("Mute")}
            >
              {muted ? <MicOff /> : <Mic />}
            </Button>
            <Button
              size="icon"
              variant="emergency"
              className="rounded-full"
              onClick={() => onOpenChange(false)}
              aria-label={t("End call")}
            >
              <PhoneOff />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
