import { describe, expect, it } from "vitest";

import { CO_ASSISTING_ROLE, CO_FOUNDER, FOUNDER } from "@/lib/founder";

describe("Founding credits", () => {
  it("keeps the founder's Bengali name and designation intact", () => {
    expect(FOUNDER.name).toBe("ওফেলিয়া সিনহা");
    expect(FOUNDER.designation).toBe(
      "ভারতীয় জনতা পার্টির পশ্চিমবঙ্গ প্রদেশের কার্যনির্বাহী কমিটির সদস্য ও মুখপাত্র",
    );
  });

  it("keeps the co-founding member's details intact", () => {
    expect(CO_FOUNDER.name).toBe("Debapriya Ghosal");
    expect(CO_FOUNDER.designation).toBe("IT Expert, Microsoft Certified and All India Rank Holder");
    expect(CO_FOUNDER.role).toBe("Co Founding Member");
    expect(CO_ASSISTING_ROLE).toBe("Co Assisting Member");
  });
});
