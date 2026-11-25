export type ListingType = "For sale" | "For lease" | "Hosting";

export type Listing = {
  id: string;
  title: string;
  country: string;
  countryCode: string;
  type: ListingType;
  capacityMW: number;
  powerCents: number;
  status: string;
  tags: string[];
  summary: string;
};

export const listings: Listing[] = [
  {
    id: "OM-014",
    title: "Itaipu Hydro Campus",
    country: "Paraguay",
    countryCode: "PY",
    type: "For sale",
    capacityMW: 40,
    powerCents: 2.1,
    status: "Energized",
    tags: ["Hydro", "Turnkey", "500 kV"],
    summary:
      "Two energized halls with 40 MW contracted hydro, transformer yard, and room for 1,200 immersion-ready racks.",
  },
  {
    id: "OM-021",
    title: "Permian Flare Field",
    country: "United States",
    countryCode: "US",
    type: "For lease",
    capacityMW: 25,
    powerCents: 2.8,
    status: "Expansion ready",
    tags: ["Flare gas", "Containers", "PPA"],
    summary:
      "Behind-the-meter flare gas generation with 25 MW available, existing container pads, and a 5-year lease structure.",
  },
  {
    id: "OM-008",
    title: "Hardanger Hydro Hall",
    country: "Norway",
    countryCode: "NO",
    type: "Hosting",
    capacityMW: 12,
    powerCents: 3.6,
    status: "Immersion ready",
    tags: ["Hydro", "Nordic", "Cooling"],
    summary:
      "Tier-III hydro-powered hall offering rack space, immersion cooling, and 99.2% uptime across the last 24 months.",
  },
  {
    id: "OM-033",
    title: "Al Dhafra Solar Block",
    country: "United Arab Emirates",
    countryCode: "AE",
    type: "For sale",
    capacityMW: 18,
    powerCents: 4.2,
    status: "Permitted",
    tags: ["Solar", "Grid", "Greenfield"],
    summary:
      "Permitted greenfield block beside a 1.5 GW solar park, with grid interconnect studies complete and staged build-out.",
  },
  {
    id: "OM-027",
    title: "Cebu Geothermal Annex",
    country: "Philippines",
    countryCode: "PH",
    type: "For lease",
    capacityMW: 8,
    powerCents: 4.8,
    status: "Phase 1",
    tags: ["Geothermal", "Cebu", "24/7"],
    summary:
      "Baseload geothermal capacity in Cebu with a phased 8 MW lease, local operations team, and typhoon-resilient build.",
  },
  {
    id: "OM-041",
    title: "Salta Gas Reserve",
    country: "Argentina",
    countryCode: "AR",
    type: "Hosting",
    capacityMW: 15,
    powerCents: 2.6,
    status: "Energized",
    tags: ["Flare gas", "PPA", "Mining"],
    summary:
      "15 MW of stranded gas generation with hosted miner slots, on-site maintenance, and monthly power settlement.",
  },
];

export const insights = [
  {
    category: "Site underwriting",
    title: "Power is the product: how to underwrite a mining site",
    blurb:
      "A practical checklist for reading a PPA, validating interconnect capacity, and pricing the real cost of uptime before you sign.",
    read: "6 min read",
    accent: "from-lime-300/25 to-cyan-400/10",
  },
  {
    category: "Energy",
    title: "Flare gas, hydro, and the real cost of stranded energy",
    blurb:
      "Why the cheapest headline power is rarely the cheapest megawatt, and how to compare generation profiles without guessing.",
    read: "7 min read",
    accent: "from-cyan-300/25 to-violet-500/10",
  },
  {
    category: "Hosting",
    title: "From megawatt to payout: hosting contracts explained",
    blurb:
      "The clauses that decide margin: power pass-through, uptime credits, curtailment, maintenance windows, and settlement timing.",
    read: "5 min read",
    accent: "from-amber-300/25 to-lime-300/10",
  },
];

export const stats = [
  { label: "Capacity listed", value: "120+", suffix: "MW" },
  { label: "Countries in network", value: "14", suffix: "" },
  { label: "Lowest power", value: "2.1", suffix: "¢/kWh" },
  { label: "Live sites", value: "38", suffix: "" },
];

export const navLinks = [
  { label: "ASIC Miners", href: "/miners" },
  { label: "Vendors", href: "/vendors" },
  { label: "Sites", href: "/#marketplace" },
  { label: "Calculator", href: "/#calculator" },
  { label: "Sell on OneMiners", href: "/sell" },
];

export const chatSuggestions = [
  "Most profitable miner right now?",
  "What does an Antminer S21 XP Hyd earn?",
  "How much is hosting?",
  "How do I list my company?",
];
