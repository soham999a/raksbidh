export const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export const AMBULANCE_TYPES = ["Basic", "ICU", "Oxygen", "Freezer van"] as const;
export type AmbulanceType = (typeof AMBULANCE_TYPES)[number];

export const BLOG_CATEGORIES = [
  "Nutrition",
  "Seasonal Diseases",
  "First Aid",
  "Mental Health",
  "Women's Health",
  "Senior Care",
] as const;
export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export const KEY_ROLES = [
  "Ward Coordinator",
  "Volunteer",
  "Councillor Office",
  "Health Worker",
] as const;

export type AppointmentStatus = "Pending" | "Confirmed" | "Completed" | "Cancelled";
export type TicketStatus = "New" | "In-progress" | "Resolved";
export type Urgency = "Normal" | "Urgent" | "Critical";
export type Role = "Super Admin" | "Ward Coordinator" | "Content Editor" | "Doctor";

export interface Settings {
  siteName: string;
  helpline: string;
  whatsapp: string;
  wardCount: number;
  defaultLang: "en" | "bn";
}

export interface Ward {
  id: string;
  number: number;
  name: string;
  surveyStatus: "Surveyed" | "Pending";
}

export interface Hospital {
  id: string;
  name: string;
  contactPerson: string;
  designation: string;
  phone: string;
  address: string;
  ward: number;
  emergency: boolean;
  lastVerified: string;
}

export interface BloodBank {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  address: string;
  ward: number;
  groups: BloodGroup[];
  lastVerified: string;
}

export interface Ambulance {
  id: string;
  name: string;
  contactPerson: string;
  phone: string;
  type: AmbulanceType;
  ward: number;
  is24x7: boolean;
  lastVerified: string;
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialty: string;
  qualification: string;
  experience: number;
  fee: number;
  languages: string;
  online: boolean;
  bio: string;
  workingDays: number[]; // 0 = Sunday
  slotTimes: string[]; // "10:00"
  lastVerified: string;
}

export interface Appointment {
  id: string;
  doctorId: string;
  date: string; // yyyy-MM-dd
  time: string;
  patientName: string;
  phone: string;
  age: number;
  problem: string;
  status: AppointmentStatus;
  createdAt: string;
}

export interface Donor {
  id: string;
  name: string;
  age: number;
  group: BloodGroup;
  ward: number;
  area: string;
  phone: string;
  lastDonation: string | null;
  willing: boolean;
  consent: boolean;
  createdAt: string;
}

export interface ContactRequest {
  id: string;
  donorId: string;
  donorName: string;
  requesterName: string;
  phone: string;
  urgency: Urgency;
  hospital: string;
  status: TicketStatus;
  createdAt: string;
}

export interface BloodRequest {
  id: string;
  patientName: string;
  phone: string;
  group: BloodGroup;
  units: number;
  hospital: string;
  ward: number;
  urgency: Urgency;
  matched: number;
  status: TicketStatus;
  createdAt: string;
}

export interface Ticket {
  id: string;
  name: string;
  phone: string;
  issue: "Blood" | "Ambulance" | "Hospital" | "Other";
  ward: number;
  note: string;
  status: TicketStatus;
  createdAt: string;
}

export interface Report {
  id: string;
  entityType: "Hospital" | "Blood Bank" | "Ambulance" | "Doctor";
  entityId: string;
  entityName: string;
  message: string;
  status: TicketStatus;
  createdAt: string;
}

export interface KeyPerson {
  id: string;
  name: string;
  role: string;
  ward: number;
  phone: string;
  hours: string;
}

export interface Post {
  id: string;
  title: string;
  category: BlogCategory;
  cover: string;
  excerpt: string;
  content: string; // html
  author: string;
  date: string;
  status: "Draft" | "Published";
}

export interface ChatMessage {
  from: "patient" | "doctor";
  text: string;
  at: string;
}

export interface Chat {
  id: string;
  doctorId: string;
  patientName: string;
  messages: ChatMessage[];
  updatedAt: string;
}

export interface DB {
  version: number;
  settings: Settings;
  wards: Ward[];
  hospitals: Hospital[];
  bloodBanks: BloodBank[];
  ambulances: Ambulance[];
  doctors: Doctor[];
  appointments: Appointment[];
  donors: Donor[];
  contactRequests: ContactRequest[];
  bloodRequests: BloodRequest[];
  tickets: Ticket[];
  reports: Report[];
  keyPersons: KeyPerson[];
  posts: Post[];
  chats: Chat[];
}
