import {
  Ambulance,
  BookOpen,
  Building2,
  Droplets,
  HeartPulse,
  Home,
  LifeBuoy,
  ListChecks,
  MapPinned,
  Phone,
  Stethoscope,
  Users,
} from "lucide-react";

export const NAV = [
  { to: "/", label: "Home", icon: Home },
  { to: "/hospitals", label: "Hospitals", icon: Building2 },
  { to: "/blood-banks", label: "Blood Banks", icon: Droplets },
  { to: "/ambulances", label: "Ambulance", icon: Ambulance },
  { to: "/doctors", label: "Book a Doctor", icon: Stethoscope },
  { to: "/donors", label: "Blood Donors", icon: HeartPulse },
  { to: "/blood-requests", label: "Blood Requests", icon: LifeBuoy },
  { to: "/ward-stats", label: "Ward Stats", icon: MapPinned },
  { to: "/blog", label: "Health Blog", icon: BookOpen },
  { to: "/key-persons", label: "Key Persons", icon: Users },
  { to: "/helpline", label: "24x7 Helpline", icon: Phone },
  { to: "/my-booking", label: "My Booking", icon: ListChecks },
] as const;
