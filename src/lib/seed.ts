import { addDays, format, subDays, subMonths } from "date-fns";
import { matchingDonors } from "./logic";
import type { Appointment, BlogCategory, DB, Doctor, Donor, Post } from "./types";

const iso = (d: Date) => format(d, "yyyy-MM-dd");
const phone = (n: number) => `90000 ${String(n).padStart(5, "0")}`;

const AREAS = [
  "Salt Lake Sector I",
  "Salt Lake Sector II",
  "Salt Lake Sector III",
  "Sector V",
  "Baguiati",
  "Kestopur",
  "Duttabad",
  "Rajarhat-Gopalpur",
  "Teghoria",
  "Jyangra",
];

export function buildSeed(now = new Date()): DB {
  const d = (n: number) => iso(subDays(now, n));

  const wards = Array.from({ length: 41 }, (_, i) => ({
    id: `w${i + 1}`,
    number: i + 1,
    name: `Ward ${i + 1}`,
    surveyStatus: (i % 3 === 2 || i > 30 ? "Pending" : "Surveyed") as "Surveyed" | "Pending",
  }));

  const hospitals = [
    [
      "Bidhannagar Community Hospital (Demo)",
      "Dr. Arjun Basak",
      "Medical Superintendent",
      3,
      true,
      "CF Block, Salt Lake Sector I",
    ],
    [
      "Salt Lake City Care Hospital (Demo)",
      "Mrs. Poulami Sarkar",
      "Front Desk Manager",
      7,
      true,
      "BD Block, Sector I",
    ],
    [
      "Sector V Multispeciality Clinic (Demo)",
      "Mr. Debasish Ghosh",
      "Administrator",
      12,
      false,
      "EP Block, Sector V",
    ],
    [
      "Baguiati General Hospital (Demo)",
      "Dr. Mitali Roy",
      "Deputy Superintendent",
      21,
      true,
      "VIP Road, Baguiati",
    ],
    ["Kestopur Nursing Home (Demo)", "Mr. Sourav Dey", "Manager", 18, false, "Kestopur Main Road"],
    [
      "Rajarhat Health Centre (Demo)",
      "Dr. Kaushik Pal",
      "Medical Officer",
      33,
      true,
      "Gopalpur, Rajarhat",
    ],
    [
      "Duttabad Maternity Home (Demo)",
      "Sr. Rina Mondal",
      "Nursing In-charge",
      9,
      false,
      "Duttabad Road",
    ],
    [
      "Teghoria Emergency Care (Demo)",
      "Dr. Ayan Chatterjee",
      "Emergency Head",
      27,
      true,
      "Teghoria More",
    ],
  ].map(([name, contactPerson, designation, ward, emergency, address], i) => ({
    id: `h${i + 1}`,
    name: name as string,
    contactPerson: contactPerson as string,
    designation: designation as string,
    phone: phone(100 + i),
    address: address as string,
    ward: ward as number,
    emergency: emergency as boolean,
    lastVerified: d(i * 4 + 2),
  }));

  const bloodBanks = [
    [
      "Bidhannagar Central Blood Bank (Demo)",
      "Mr. Pritam Saha",
      4,
      ["A+", "B+", "O+", "O-", "AB+"],
    ],
    ["Salt Lake Voluntary Blood Bank (Demo)", "Ms. Tanushree Das", 8, ["A+", "A-", "B+", "O+"]],
    ["Baguiati Blood Centre (Demo)", "Mr. Rahul Biswas", 22, ["B+", "B-", "O+", "AB-"]],
    ["Rajarhat Blood Storage Unit (Demo)", "Dr. Sneha Kar", 34, ["A+", "O+", "O-"]],
    ["Sector V Red Cross Point (Demo)", "Mr. Anirban Nag", 12, ["A-", "B+", "AB+", "AB-", "O+"]],
  ].map(([name, contactPerson, ward, groups], i) => ({
    id: `b${i + 1}`,
    name: name as string,
    contactPerson: contactPerson as string,
    phone: phone(200 + i),
    address: `${AREAS[i * 2]}, Bidhannagar`,
    ward: ward as number,
    groups: groups as DB["bloodBanks"][number]["groups"],
    lastVerified: d(i + 1),
  }));

  const ambulances = [
    ["Jotno Ambulance Service (Demo)", "Mr. Bapi Halder", "Basic", 2, true],
    ["Salt Lake ICU on Wheels (Demo)", "Mr. Subhajit Paul", "ICU", 6, true],
    ["Oxygen Express Baguiati (Demo)", "Mr. Raju Sheikh", "Oxygen", 21, true],
    ["Kestopur Community Ambulance (Demo)", "Mr. Tapas Mondal", "Basic", 18, false],
    ["Rajarhat Life Line (Demo)", "Mr. Amit Barman", "ICU", 33, true],
    ["Shanti Freezer Van Service (Demo)", "Mr. Gopal Das", "Freezer van", 14, true],
    ["Sector V Oxygen Ambulance (Demo)", "Mr. Rakesh Sharma", "Oxygen", 12, false],
    ["Duttabad Seva Ambulance (Demo)", "Mr. Sanjib Roy", "Basic", 9, true],
  ].map(([name, contactPerson, type, ward, is24x7], i) => ({
    id: `a${i + 1}`,
    name: name as string,
    contactPerson: contactPerson as string,
    phone: phone(300 + i),
    type: type as DB["ambulances"][number]["type"],
    ward: ward as number,
    is24x7: is24x7 as boolean,
    lastVerified: d(i * 2 + 1),
  }));

  const morning = ["10:00", "10:30", "11:00", "11:30", "12:00"];
  const evening = ["17:00", "17:30", "18:00", "18:30", "19:00"];
  const doctors: Doctor[] = [
    [
      "Dr. Ritika Sen",
      "doctor@demo.com",
      "General Physician",
      "MBBS, MD (Medicine)",
      12,
      400,
      "Bengali, English, Hindi",
      true,
      [1, 2, 3, 4, 5, 6],
      [...morning, ...evening],
    ],
    [
      "Dr. Sayan Mukherjee",
      "sayan@demo.local",
      "General Physician",
      "MBBS",
      6,
      300,
      "Bengali, Hindi",
      false,
      [0, 1, 3, 5],
      evening,
    ],
    [
      "Dr. Moumita Ghosh",
      "moumita@demo.local",
      "Pediatrics",
      "MBBS, DCH",
      10,
      500,
      "Bengali, English",
      true,
      [1, 2, 4, 6],
      morning,
    ],
    [
      "Dr. Abhishek Dutta",
      "abhishek@demo.local",
      "Pediatrics",
      "MBBS, MD (Pediatrics)",
      15,
      600,
      "Bengali, English",
      false,
      [2, 3, 5],
      evening,
    ],
    [
      "Dr. Payel Banerjee",
      "payel@demo.local",
      "Gynecology",
      "MBBS, MS (O&G)",
      14,
      700,
      "Bengali, English, Hindi",
      true,
      [1, 3, 5],
      morning,
    ],
    [
      "Dr. Shreya Halder",
      "shreya@demo.local",
      "Gynecology",
      "MBBS, DGO",
      8,
      500,
      "Bengali",
      false,
      [2, 4, 6],
      evening,
    ],
    [
      "Dr. Indranil Saha",
      "indranil@demo.local",
      "Cardiology",
      "MBBS, MD, DM (Cardiology)",
      20,
      1000,
      "Bengali, English",
      true,
      [1, 4],
      morning,
    ],
    [
      "Dr. Nabanita Roy",
      "nabanita@demo.local",
      "Dermatology",
      "MBBS, MD (Dermatology)",
      9,
      600,
      "Bengali, English, Hindi",
      false,
      [3, 6],
      [...morning.slice(0, 3), ...evening.slice(0, 3)],
    ],
    [
      "Dr. Rajib Paul",
      "rajib@demo.local",
      "Orthopedics",
      "MBBS, MS (Ortho)",
      18,
      800,
      "Bengali, Hindi",
      true,
      [1, 2, 5],
      evening,
    ],
    [
      "Dr. Sohini Kar",
      "sohini@demo.local",
      "Dermatology",
      "MBBS, DVD",
      5,
      400,
      "Bengali, English",
      false,
      [0, 2, 4],
      morning,
    ],
  ].map(
    (
      [
        name,
        email,
        specialty,
        qualification,
        experience,
        fee,
        languages,
        online,
        workingDays,
        slotTimes,
      ],
      i,
    ) => ({
      id: `d${i + 1}`,
      name: name as string,
      email: email as string,
      specialty: specialty as string,
      qualification: qualification as string,
      experience: experience as number,
      fee: fee as number,
      languages: languages as string,
      online: online as boolean,
      bio: `${name} is a ${specialty} doctor with ${experience} years of experience serving families across Bidhannagar. (Demo profile)`,
      workingDays: workingDays as number[],
      slotTimes: slotTimes as string[],
      lastVerified: d(i + 3),
    }),
  );

  // Book a few seeded slots on the next working days for each doctor.
  const appointments: Appointment[] = [];
  const patients = [
    "Anita Das",
    "Ramen Pal",
    "Sudipta Roy",
    "Moumi Saha",
    "Kunal Bose",
    "Joya Sen",
    "Prabir Kar",
    "Laboni Dey",
    "Tuhin Nandi",
    "Rupa Ghosh",
  ];
  const problems = [
    "Fever and cough for 3 days",
    "Follow-up on blood pressure",
    "Skin rash",
    "Child vaccination query",
    "Knee pain",
    "Routine check-up",
  ];
  const statuses: Appointment["status"][] = [
    "Confirmed",
    "Pending",
    "Confirmed",
    "Completed",
    "Pending",
    "Cancelled",
  ];
  let k = 0;
  for (const doc of doctors.slice(0, 6)) {
    for (
      let off = 0;
      off < 7 &&
      appointments.filter((a) => a.doctorId === doc.id).length < (doc.id === "d1" ? 4 : 1);
      off++
    ) {
      const day = addDays(now, off);
      if (!doc.workingDays.includes(day.getDay())) continue;
      const time = doc.slotTimes[(k * 2) % doc.slotTimes.length] ?? doc.slotTimes[0] ?? "10:00";
      appointments.push({
        id: `PP-SEED${String(k + 1).padStart(2, "0")}`,
        doctorId: doc.id,
        date: iso(day),
        time,
        patientName: patients[k % patients.length] ?? "Patient",
        phone: phone(500 + k),
        age: 25 + ((k * 7) % 50),
        problem: problems[k % problems.length] ?? "",
        status: off === 0 ? "Confirmed" : (statuses[k % statuses.length] ?? "Pending"),
        createdAt: iso(subDays(now, k % 7)),
      });
      k++;
    }
  }

  const first = [
    "Arpita",
    "Subham",
    "Rimpa",
    "Sourav",
    "Tania",
    "Biplab",
    "Sumana",
    "Rohit",
    "Puja",
    "Ankan",
    "Moumita",
    "Dipankar",
    "Sreeja",
    "Arnab",
    "Payel",
    "Sagnik",
    "Rituparna",
    "Tanmoy",
    "Debolina",
    "Joydeep",
    "Shilpi",
    "Abir",
    "Nandini",
    "Koushik",
    "Madhuri",
  ];
  const last = ["Basu", "Mitra", "Ghosh", "Sarkar", "Das", "Pal", "Roy", "Dutta", "Saha", "Nag"];
  const groups = ["O+", "B+", "A+", "AB+", "O-", "B-", "A-", "AB-"] as const;
  const donors: Donor[] = first.map((f, i) => ({
    id: `dn${i + 1}`,
    name: `${f} ${last[i % last.length]}`,
    age: 19 + ((i * 5) % 40),
    group: groups[i % 3 === 0 ? 0 : i % groups.length] ?? "O+",
    ward: ((i * 7) % 41) + 1,
    area: AREAS[i % AREAS.length] ?? "Salt Lake",
    phone: phone(600 + i),
    lastDonation:
      i % 4 === 1 ? iso(subMonths(now, 1)) : i % 5 === 0 ? null : iso(subMonths(now, 4 + (i % 6))),
    willing: i % 7 !== 6,
    consent: true,
    createdAt: d(i),
  }));

  const keyPersons = [
    ["Mr. Partha Sarathi (Demo)", "Ward Coordinator", 3, "9 AM to 7 PM"],
    ["Ms. Rumpa Kundu (Demo)", "Volunteer", 7, "24x7 on call"],
    ["Councillor Office, Ward 12 (Demo)", "Councillor Office", 12, "10 AM to 5 PM, Mon to Sat"],
    ["Mr. Bikash Mallick (Demo)", "Ward Coordinator", 18, "8 AM to 8 PM"],
    ["Ms. Sunanda Paul (Demo)", "Health Worker", 21, "9 AM to 4 PM"],
    ["Mr. Imran Ali (Demo)", "Volunteer", 21, "6 PM to 11 PM"],
    ["Councillor Office, Ward 27 (Demo)", "Councillor Office", 27, "10 AM to 5 PM, Mon to Fri"],
    ["Ms. Keya Bhowmik (Demo)", "Ward Coordinator", 33, "9 AM to 6 PM"],
    ["Mr. Ratan Ghorai (Demo)", "Volunteer", 9, "24x7 on call"],
    ["Ms. Dolon Sarkar (Demo)", "Health Worker", 14, "8 AM to 2 PM"],
  ].map(([name, role, ward, hours], i) => ({
    id: `k${i + 1}`,
    name: name as string,
    role: role as string,
    ward: ward as number,
    phone: phone(700 + i),
    hours: hours as string,
  }));

  const post = (
    i: number,
    title: string,
    category: BlogCategory,
    cover: string,
    excerpt: string,
    content: string,
    author: string,
  ): Post => ({
    id: `p${i}`,
    title,
    category,
    cover,
    excerpt,
    content,
    author,
    date: d(i * 3),
    status: "Published",
  });

  const posts: Post[] = [
    post(
      1,
      "Eating well on a Bengali plate",
      "Nutrition",
      "/images/blog-nutrition.jpg",
      "Simple changes to rice, dal and fish meals that keep the whole family healthy.",
      "<p>The traditional Bengali meal is already close to balanced. A few small changes make it even better.</p><h2>Half the plate, vegetables</h2><p>Fill half your plate with shaak, seasonal sabji and salad. Keep rice to a quarter.</p><ul><li>Choose small fish like mourola for calcium.</li><li>Use less oil when making jhol.</li><li>Have fruit instead of sweets after lunch.</li></ul><p>Drink plenty of water, especially in summer.</p>",
      "Dr. Ritika Sen",
    ),
    post(
      2,
      "Dengue season: what every household should do",
      "Seasonal Diseases",
      "/images/blog-monsoon.jpg",
      "Stagnant water, mosquito nets and warning signs to watch for during the monsoon.",
      "<p>Dengue cases rise across Bidhannagar every monsoon. Most can be prevented at home.</p><h2>Stop mosquitoes breeding</h2><ul><li>Empty flower pot trays, coolers and buckets every week.</li><li>Cover water tanks.</li><li>Use nets and repellent, especially at dawn and dusk.</li></ul><h2>When to see a doctor</h2><p>High fever, severe body ache, vomiting or bleeding gums need a doctor the same day. Do not take painkillers other than paracetamol without advice.</p>",
      "Health Desk",
    ),
    post(
      3,
      "First aid for cuts, burns and falls",
      "First Aid",
      "/images/blog-firstaid.jpg",
      "What to do in the first five minutes, before help arrives.",
      "<p>Quick action in the first few minutes makes a big difference.</p><h2>Cuts</h2><p>Press firmly with a clean cloth for 10 minutes. Raise the hand or leg if possible.</p><h2>Burns</h2><p>Cool under running tap water for 20 minutes. Never apply toothpaste or ice.</p><h2>Falls</h2><p>If an older person falls and cannot get up, keep them warm and call for an ambulance. Do not lift them alone.</p>",
      "Volunteer Team",
    ),
    post(
      4,
      "Looking after your mind",
      "Mental Health",
      "/images/blog-mental.jpg",
      "Stress, sleep and talking to someone: small steps that help.",
      "<p>Feeling low or anxious is common, and it is okay to ask for help.</p><ul><li>Keep a regular sleep time.</li><li>Walk for 20 minutes every day.</li><li>Talk to a friend or family member each week.</li></ul><p>If sad feelings last more than two weeks, speak to a doctor. Our 24x7 helpline can connect you.</p>",
      "Dr. Ritika Sen",
    ),
    post(
      5,
      "Healthy pregnancy: the first three months",
      "Women's Health",
      "/images/blog-women.jpg",
      "Check-ups, folic acid and danger signs in early pregnancy.",
      "<p>The first trimester is when the baby's organs form. Good care now matters.</p><h2>Do</h2><ul><li>Register with a doctor or health centre early.</li><li>Take folic acid and iron tablets as advised.</li><li>Eat small meals often if you feel sick.</li></ul><h2>Get help at once if</h2><p>You have heavy bleeding, severe stomach pain or high fever.</p>",
      "Dr. Payel Banerjee",
    ),
    post(
      6,
      "Staying active after sixty",
      "Senior Care",
      "/images/blog-senior.jpg",
      "Gentle exercise, medicines and fall-proofing the home for older family members.",
      "<p>Regular movement keeps joints, heart and mood healthy at any age.</p><ul><li>Morning walks in the park, with a friend or grandchild.</li><li>Keep a weekly pill box to avoid missed doses.</li><li>Add grab bars in the bathroom and night lights in corridors.</li></ul><p>Ask your ward volunteer about free blood pressure camps.</p>",
      "Health Desk",
    ),
  ];

  const tickets = [
    {
      id: "T-1001",
      name: "Shampa Roy",
      phone: phone(800),
      issue: "Ambulance" as const,
      ward: 21,
      note: "Need oxygen ambulance for father",
      status: "New" as const,
      createdAt: d(0),
    },
    {
      id: "T-1002",
      name: "Asit Kumar",
      phone: phone(801),
      issue: "Blood" as const,
      ward: 7,
      note: "B- blood needed tomorrow",
      status: "In-progress" as const,
      createdAt: d(1),
    },
    {
      id: "T-1003",
      name: "Lipika Das",
      phone: phone(802),
      issue: "Hospital" as const,
      ward: 3,
      note: "Which hospital has emergency at night?",
      status: "Resolved" as const,
      createdAt: d(3),
    },
  ];

  const reports = [
    {
      id: "R-1",
      entityType: "Hospital" as const,
      entityId: "h3",
      entityName: "Sector V Multispeciality Clinic (Demo)",
      message: "Phone number not reachable",
      status: "New" as const,
      createdAt: d(1),
    },
    {
      id: "R-2",
      entityType: "Ambulance" as const,
      entityId: "a4",
      entityName: "Kestopur Community Ambulance (Demo)",
      message: "They now run 24x7",
      status: "New" as const,
      createdAt: d(2),
    },
  ];

  const bloodRequests = [
    {
      id: "BR-1",
      patientName: "Mohan Lal",
      phone: phone(900),
      group: "O+" as const,
      units: 2,
      hospital: "Bidhannagar Community Hospital (Demo)",
      ward: 3,
      urgency: "Urgent" as const,
      matched: 0,
      status: "New" as const,
      createdAt: d(0),
    },
    {
      id: "BR-2",
      patientName: "Rina Pal",
      phone: phone(901),
      group: "B+" as const,
      units: 1,
      hospital: "Baguiati General Hospital (Demo)",
      ward: 21,
      urgency: "Normal" as const,
      matched: 0,
      status: "In-progress" as const,
      createdAt: d(2),
    },
  ];

  const chats = [
    {
      id: "c1",
      doctorId: "d1",
      patientName: "Anita Das",
      messages: [
        {
          from: "patient" as const,
          text: "Doctor, my fever is 101 since yesterday. Should I come in?",
          at: new Date(now.getTime() - 3600_000).toISOString(),
        },
        {
          from: "doctor" as const,
          text: "Please take paracetamol and drink fluids. Book a slot for tomorrow morning.",
          at: new Date(now.getTime() - 3000_000).toISOString(),
        },
      ],
      updatedAt: new Date(now.getTime() - 3000_000).toISOString(),
    },
  ];

  const db: DB = {
    version: 1,
    settings: {
      siteName: "Jotno",
      helpline: "90000 00000",
      whatsapp: "90000 00099",
      wardCount: 41,
      defaultLang: "en",
    },
    wards,
    hospitals,
    bloodBanks,
    ambulances,
    doctors,
    appointments,
    donors,
    contactRequests: [],
    bloodRequests,
    tickets,
    reports,
    keyPersons,
    posts,
    chats,
  };
  // Simulated matches for seeded requests.
  db.bloodRequests = db.bloodRequests.map((r) => ({
    ...r,
    matched: matchingDonors(donors, r.group, now).length,
  }));
  return db;
}
