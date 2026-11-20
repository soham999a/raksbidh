import { addDays, addMonths, format, isAfter, parseISO } from "date-fns";
import type { Appointment, BloodGroup, DB, Doctor, Donor, Role } from "./types";

export const DEMO_OTP = "1234";
export const DEMO_PASSWORD = "demo123";

export const DEMO_ACCOUNTS: { email: string; role: Role }[] = [
  { email: "admin@demo.com", role: "Super Admin" },
  { email: "ward@demo.com", role: "Ward Coordinator" },
  { email: "editor@demo.com", role: "Content Editor" },
  { email: "doctor@demo.com", role: "Doctor" },
];

/** Returns the role for valid demo credentials, otherwise null. */
export function checkLogin(email: string, password: string): Role | null {
  const acc = DEMO_ACCOUNTS.find((a) => a.email === email.trim().toLowerCase());
  if (!acc || password !== DEMO_PASSWORD) return null;
  return acc.role;
}

export const todayISO = (d = new Date()) => format(d, "yyyy-MM-dd");

/** Eligible when the last donation was more than 3 months ago (or never). */
export function isEligible(lastDonation: string | null, today = new Date()): boolean {
  if (!lastDonation) return true;
  return isAfter(today, addMonths(parseISO(lastDonation), 3));
}

export function normalizePhone(p: string) {
  return p.replace(/\D/g, "").replace(/^91(?=\d{10}$)/, "");
}

export function isValidPhone(p: string) {
  return /^\d{10}$/.test(normalizePhone(p));
}

export function telHref(p: string) {
  return `tel:+91${normalizePhone(p)}`;
}

export function waHref(p: string, text = "") {
  return `https://wa.me/91${normalizePhone(p)}${text ? `?text=${encodeURIComponent(text)}` : ""}`;
}

export function nextDays(n: number, from = new Date()) {
  return Array.from({ length: n }, (_, i) => addDays(from, i));
}

export function isBooked(
  appointments: Appointment[],
  doctorId: string,
  date: string,
  time: string,
) {
  return appointments.some(
    (a) =>
      a.doctorId === doctorId && a.date === date && a.time === time && a.status !== "Cancelled",
  );
}

export function slotsFor(doctor: Doctor, date: Date, appointments: Appointment[]) {
  if (!doctor.workingDays.includes(date.getDay())) return [];
  const iso = todayISO(date);
  return doctor.slotTimes.map((time) => ({
    time,
    booked: isBooked(appointments, doctor.id, iso, time),
  }));
}

/** Donors who can be notified for a blood request: same group, willing, consented, eligible. */
export function matchingDonors(donors: Donor[], group: BloodGroup, today = new Date()) {
  return donors.filter(
    (d) => d.group === group && d.willing && d.consent && isEligible(d.lastDonation, today),
  );
}

export function uid(prefix = "") {
  return prefix + Math.random().toString(36).slice(2, 8).toUpperCase();
}

export function bookingId() {
  return "PP-" + Math.random().toString(36).slice(2, 8).toUpperCase();
}

/** Builds a ward list of the requested size, keeping existing ward data. */
export function resizeWards(db: DB, count: number) {
  const n = Math.max(1, Math.min(200, Math.round(count)));
  const out = [];
  for (let i = 1; i <= n; i++) {
    out.push(
      db.wards.find((w) => w.number === i) ?? {
        id: `w${i}`,
        number: i,
        name: `Ward ${i}`,
        surveyStatus: "Pending" as const,
      },
    );
  }
  return out;
}

export function canAccess(role: Role, section: string) {
  if (role === "Super Admin") return true;
  if (role === "Content Editor") return ["overview", "blog", "keyPersons"].includes(section);
  if (role === "Ward Coordinator")
    return [
      "overview",
      "hospitals",
      "bloodBanks",
      "ambulances",
      "keyPersons",
      "wards",
      "donors",
      "inbox",
      "appointments",
      "import",
    ].includes(section);
  return false;
}

export function parseCSV(text: string): Record<string, string>[] {
  const rows: string[][] = [];
  let cur: string[] = [];
  let field = "";
  let q = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (q) {
      if (c === '"' && text[i + 1] === '"') {
        field += '"';
        i++;
      } else if (c === '"') q = false;
      else field += c;
    } else if (c === '"') q = true;
    else if (c === ",") {
      cur.push(field);
      field = "";
    } else if (c === "\n" || c === "\r") {
      if (c === "\r" && text[i + 1] === "\n") i++;
      cur.push(field);
      field = "";
      if (cur.some((x) => x.trim() !== "")) rows.push(cur);
      cur = [];
    } else field += c;
  }
  cur.push(field);
  if (cur.some((x) => x.trim() !== "")) rows.push(cur);
  const [head, ...body] = rows;
  if (!head) return [];
  const keys = head.map((h) => h.trim());
  return body.map((r) => Object.fromEntries(keys.map((k, i) => [k, (r[i] ?? "").trim()])));
}
