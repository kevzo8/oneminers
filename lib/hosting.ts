// OneMiners hosting sites: rates and capacity as published on oneminers.com (homepage map,
// 25 Nov 2026). Final terms, availability and model compatibility are confirmed by OneMiners sales.

export type HostingSite = {
  id: string;
  name: string;
  countryCode: string;
  /** USD per kWh */
  rate: number;
  capacityMW: number;
  url: string;
};

export const HOSTING_SOURCE = "Rates and capacity as published on oneminers.com, November 2026. Final terms are confirmed by OneMiners.";

export const HOSTING_SITES: HostingSite[] = [
  { id: "nigeria", name: "Nigeria", countryCode: "NG", rate: 0.036, capacityMW: 33, url: "https://oneminers.com/pages/nigeria-hosting" },
  { id: "norway", name: "Norway (Arctic)", countryCode: "NO", rate: 0.044, capacityMW: 36, url: "https://oneminers.com/pages/norway-arctic-hosting-location" },
  { id: "georgia", name: "Georgia, USA", countryCode: "US", rate: 0.045, capacityMW: 34, url: "https://oneminers.com/pages/usa-hosting-georgia" },
  { id: "houston", name: "Houston, USA", countryCode: "US", rate: 0.045, capacityMW: 45, url: "https://oneminers.com/pages/houston-usa-hosting" },
  {
    id: "west-texas",
    name: "West Texas, USA",
    countryCode: "US",
    rate: 0.045,
    capacityMW: 65,
    url: "https://oneminers.com/pages/leading-mining-hosting-solutions-in-texas-low-energy-costs-and-high-efficiency",
  },
  { id: "dubai", name: "Dubai, UAE", countryCode: "AE", rate: 0.046, capacityMW: 34, url: "https://oneminers.com/pages/premier-bitcoin-and-altcoin-mining-hosting-in-dubai" },
  { id: "ethiopia", name: "Ethiopia", countryCode: "ET", rate: 0.058, capacityMW: 40, url: "https://oneminers.com/pages/ethiopia-hosting-center" },
];

export const LOWEST_HOSTING_RATE = Math.min(...HOSTING_SITES.map((site) => site.rate));
export const TOTAL_HOSTING_MW = HOSTING_SITES.reduce((sum, site) => sum + site.capacityMW, 0);
