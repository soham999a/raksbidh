/** Single source of truth for the founding credit shown across the site. */
export const FOUNDER = {
  name: "ওফেলিয়া সিনহা",
  designation: "ভারতীয় জনতা পার্টির পশ্চিমবঙ্গ প্রদেশের কার্যনির্বাহী কমিটির সদস্য ও মুখপাত্র",
  nameEn: "Ophelia Sinha",
  designationEn:
    "Member & Spokesperson, West Bengal Pradesh Executive Committee, Bharatiya Janata Party",
} as const;

/** Co-founding member credit shown on the Key Persons page. */
export const CO_FOUNDER = {
  name: "Debapriya Ghosal",
  designation: "IT Expert, Microsoft Certified and All India Rank Holder",
  role: "cofounder",
} as const;

/** Homepage role label for the same co-founder. */
export const CO_ASSISTING_ROLE = "Co Assisting The Initiative" as const;
