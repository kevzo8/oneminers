// Coin logos used across the directory. SVGs come from the CC0 `cryptocurrency-icons`
// set (github.com/spothq/cryptocurrency-icons); the remaining marks are the projects'
// published logos served by CoinGecko. Unknown tickers fall back to a coloured monogram.

export const COIN_ICONS: Record<string, string> = {
  BTC: "/coins/btc.svg",
  BCH: "/coins/bch.svg",
  LTC: "/coins/ltc.svg",
  DOGE: "/coins/doge.svg",
  ZEC: "/coins/zec.svg",
  ETC: "/coins/etc.svg",
  DASH: "/coins/dash.svg",
  DGB: "/coins/dgb.svg",
  SC: "/coins/sc.svg",
  XMR: "/coins/xmr.svg",
  HNS: "/coins/hns.svg",
  GRIN: "/coins/grin.svg",
  GRS: "/coins/grs.svg",
  KMD: "/coins/kmd.svg",
  PPC: "/coins/ppc.svg",
  MONA: "/coins/mona.svg",
  XVG: "/coins/xvg.svg",
  AEON: "/coins/aeon.svg",
  LBRY: "/coins/lbry.svg",
  KAS: "/coins/kas.png",
  CKB: "/coins/ckb.png",
  ALPH: "/coins/alph.png",
  KDA: "/coins/kda.png",
  ALEO: "/coins/aleo.png",
  XEC: "/coins/xec.png",
  ETHW: "/coins/ethw.png",
  ARRR: "/coins/arrr.png",
  QUAI: "/coins/quai.png",
  DINGO: "/coins/dingo.png",
  RXD: "/coins/rxd.png",
  SOH: "/coins/soh.png",
  FB: "/coins/fb.png",
  QKC: "/coins/qkc.jpg",
  PEP: "/coins/pep.png",
  OCTA: "/coins/octa.png",
  BEL: "/coins/bel.jpeg",
  CAT: "/coins/cat.png",
  LKY: "/coins/lky.png",
  JKC: "/coins/jkc.png",
  EGAZ: "/coins/egaz.png",
  BitcoinCashII: "/coins/bitcoincashii.png",
};

export function coinIcon(tag: string) {
  return COIN_ICONS[tag] ?? null;
}

const FALLBACK_COLORS = ["#f7931a", "#49eacb", "#a6a9aa", "#3cc68a", "#ff5d51", "#8dc351", "#f4b728", "#008ce7"];

/** Stable fallback colour for a coin without a published mark. */
export function coinColor(tag: string) {
  let hash = 2166136261;
  for (let i = 0; i < tag.length; i += 1) {
    hash ^= tag.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return FALLBACK_COLORS[(hash >>> 0) % FALLBACK_COLORS.length];
}
