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

export type Miner = {
  model: string;
  vendor: string;
  coin: "BTC" | "ZEC" | "KAS" | "SC" | "XMR";
  hashrate: string;
  power: string;
  efficiency: string;
  profitDay: number;
};

export const miners: Miner[] = [
  { model: "Antminer S23 Hyd 3U", vendor: "Bitmain", coin: "BTC", hashrate: "1,160 TH/s", power: "11,020 W", efficiency: "9.5 J/TH", profitDay: 24.9 },
  { model: "iBeLink BM-S3+", vendor: "iBeLink", coin: "SC", hashrate: "25 TH/s", power: "3,400 W", efficiency: "136 J/TH", profitDay: 77.76 },
  { model: "Goldshell SC6 SE", vendor: "Goldshell", coin: "SC", hashrate: "17 TH/s", power: "3,330 W", efficiency: "196 J/TH", profitDay: 51.17 },
  { model: "Antminer Z15 Pro", vendor: "Bitmain", coin: "ZEC", hashrate: "840 kSol/s", power: "2,780 W", efficiency: "3.3 J/kSol", profitDay: 44.34 },
  { model: "Antminer X9", vendor: "Bitmain", coin: "XMR", hashrate: "1,000 kH/s", power: "2,472 W", efficiency: "2.5 J/kH", profitDay: 34.08 },
  { model: "Antminer KS5 Pro", vendor: "Bitmain", coin: "KAS", hashrate: "21 TH/s", power: "3,150 W", efficiency: "150 J/TH", profitDay: 18.5 },
  { model: "Goldshell SC5 Pro II", vendor: "Goldshell", coin: "SC", hashrate: "14 TH/s", power: "3,300 W", efficiency: "236 J/TH", profitDay: 41.21 },
];

export const coinFilters = ["All", "BTC", "ZEC", "KAS", "SC", "XMR"] as const;

export const coins = [
  { symbol: "BTC", name: "Bitcoin", price: 81480.36, change: 2.2 },
  { symbol: "ZEC", name: "Zcash", price: 1313.71, change: 6.1 },
  { symbol: "KAS", name: "Kaspa", price: 0.03585441, change: 3.6 },
  { symbol: "LTC", name: "Litecoin", price: 57.74, change: 2.3 },
  { symbol: "DOGE", name: "Dogecoin", price: 0.08020953, change: 3.9 },
  { symbol: "XMR", name: "Monero", price: 612.39, change: 2.7 },
  { symbol: "ETC", name: "Ethereum Classic", price: 7.68, change: 2.0 },
  { symbol: "CKB", name: "Nervos", price: 0.00139349, change: 1.1 },
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
  { label: "Marketplace", href: "#marketplace" },
  { label: "Miners", href: "#miners" },
  { label: "Calculator", href: "#calculator" },
  { label: "Insights", href: "#insights" },
  { label: "Contact", href: "#contact" },
];

export const chatSuggestions = [
  "What sites are available?",
  "How does hosting work?",
  "Estimate my profit",
  "Where is Oneminers based?",
];
