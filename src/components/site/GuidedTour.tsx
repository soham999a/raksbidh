import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, ArrowRight, Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { useT } from "@/lib/i18n";

const STEPS = [
  {
    title: "Welcome to Jotno",
    text: "This demo shows how Bidhannagar residents can find help fast. Everything here uses dummy data. Use the English / বাংলা switch at the top any time.",
    to: "/",
  },
  {
    title: "Emergency buttons",
    text: "On the home page, tap Need Blood, Need Ambulance or Need Hospital. You land on the right directory with the search ready. On phones, the red Emergency button stays at the bottom of every page.",
    to: "/",
  },
  {
    title: "Hospital, blood bank and ambulance directories",
    text: "Search by name, filter by ward, blood group or ambulance type. Tap Call to dial. Spotted a mistake? Tap Report wrong info and the admin sees it.",
    to: "/hospitals",
  },
  {
    title: "Book a doctor online",
    text: "Pick a doctor, choose a free slot and confirm. You get a booking ID. Open the same doctor in a second tab: the slot turns booked instantly. Try Talk to doctor now for a demo chat or video call.",
    to: "/doctors",
  },
  {
    title: "Track your booking",
    text: "On My Booking, enter the phone number you used to see the status: Pending, Confirmed, Completed or Cancelled.",
    to: "/my-booking",
  },
  {
    title: "Blood donor database",
    text: "Register as a donor with consent. Search donors by group and ward; phone numbers stay hidden and you send a contact request instead. Green badge means eligible to donate.",
    to: "/donors",
  },
  {
    title: "Blood requests and ward stats",
    text: "Post a blood request and see how many matching donors were notified. The ward stats page shows donors per blood group and which wards are surveyed.",
    to: "/blood-requests",
  },
  {
    title: "24x7 helpline",
    text: "Call, WhatsApp, or request a callback. Requests appear as tickets in the admin inbox.",
    to: "/helpline",
  },
  {
    title: "Health blog and key persons",
    text: "Read health tips by category, and find ward coordinators and volunteers to call or WhatsApp.",
    to: "/blog",
  },
  {
    title: "Doctor panel",
    text: "Log in as doctor@demo.com / demo123 to manage appointments, availability, profile and patient chats.",
    to: "/doctor-panel",
  },
  {
    title: "Admin dashboard",
    text: "Log in as admin@demo.com / demo123 to manage everything: directories, donors, blog posts, inbox, CSV import, settings and Reset demo data.",
    to: "/admin",
  },
];

export function GuidedTour() {
  const { t } = useT();
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const step = STEPS[i] ?? STEPS[0]!;
  return (
    <>
      <Button
        variant="ink"
        size="lg"
        onClick={() => {
          setI(0);
          setOpen(true);
        }}
      >
        <Compass /> {t("Guided Demo Tour")}
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <p className="text-sm font-semibold text-primary-strong">
              {t("Step")} {i + 1} / {STEPS.length}
            </p>
            <DialogTitle className="text-2xl">{t(step.title)}</DialogTitle>
            <DialogDescription className="text-base leading-relaxed text-foreground">
              {t(step.text)}
            </DialogDescription>
          </DialogHeader>
          <Progress value={((i + 1) / STEPS.length) * 100} />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button
              variant="outline"
              onClick={() => setI((x) => Math.max(0, x - 1))}
              disabled={i === 0}
            >
              <ArrowLeft /> {t("Back")}
            </Button>
            <Button asChild variant="soft">
              <Link to={step.to} onClick={() => setOpen(false)}>
                {t("Open this page")}
              </Link>
            </Button>
            {i < STEPS.length - 1 ? (
              <Button onClick={() => setI((x) => x + 1)}>
                {t("Next")} <ArrowRight />
              </Button>
            ) : (
              <Button onClick={() => setOpen(false)}>{t("Finish")}</Button>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
