// Brand marks for the miner list. These are brand-coloured monograms, not official logo
// files: they identify the manufacturer without claiming to be its trademark artwork.
// Official product photos/logos can replace them once licensed assets are available.

export type MakerMark = { short: string; from: string; to: string };

const KNOWN: Record<string, MakerMark> = {
  Bitmain: { short: "BM", from: "#ffb340", to: "#ff7a1a" },
  MicroBT: { short: "MBT", from: "#4de1ff", to: "#2f7bff" },
  Canaan: { short: "CAN", from: "#b9ff66", to: "#3ccf7a" },
  Goldshell: { short: "GS", from: "#ffd166", to: "#f4a300" },
  IceRiver: { short: "IR", from: "#9fe8ff", to: "#5aa8ff" },
  Innosilicon: { short: "INNO", from: "#c4a1ff", to: "#8b5cf6" },
  iPollo: { short: "iP", from: "#ff8fa3", to: "#ff4d6d" },
  iBeLink: { short: "iB", from: "#7dd3fc", to: "#2563eb" },
  Bitaxe: { short: "BX", from: "#ff8fa3", to: "#ff4d6d" },
  Jasminer: { short: "JAS", from: "#fbbf24", to: "#f97316" },
  ElphaPex: { short: "EP", from: "#c4a1ff", to: "#8b5cf6" },
  Bitdeer: { short: "BD", from: "#60a5fa", to: "#1d4ed8" },
  Ebang: { short: "EB", from: "#f472b6", to: "#be185d" },
  VolcMiner: { short: "VM", from: "#fb7185", to: "#e11d48" },
  Auradine: { short: "AU", from: "#34d399", to: "#059669" },
  "1024Miner": { short: "1024", from: "#a3e635", to: "#65a30d" },
  "21energy": { short: "21E", from: "#fbbf24", to: "#d97706" },
};

const PALETTE: [string, string][] = [
  ["#4de1ff", "#2f7bff"],
  ["#b9ff66", "#3ccf7a"],
  ["#ffb340", "#ff7a1a"],
  ["#c4a1ff", "#8b5cf6"],
  ["#ff8fa3", "#ff4d6d"],
  ["#ffd166", "#f4a300"],
  ["#7dd3fc", "#2563eb"],
  ["#f472b6", "#be185d"],
];

function hash(text: string) {
  let value = 2166136261;
  for (let i = 0; i < text.length; i += 1) {
    value ^= text.charCodeAt(i);
    value = Math.imul(value, 16777619);
  }
  return value >>> 0;
}

function initials(name: string) {
  const clean = name.replace(/[^A-Za-z0-9]/g, "");
  if (clean.length <= 4) return clean.toUpperCase();
  const caps = name.match(/[A-Z]/g)?.join("") ?? "";
  if (caps.length >= 2 && caps.length <= 4) return caps.toUpperCase();
  return clean.slice(0, 3).toUpperCase();
}

export function makerMark(manufacturer: string): MakerMark {
  const known = KNOWN[manufacturer];
  if (known) return known;
  const [from, to] = PALETTE[hash(manufacturer) % PALETTE.length];
  return { short: initials(manufacturer), from, to };
}
