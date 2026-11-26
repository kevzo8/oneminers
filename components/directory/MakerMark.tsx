/* eslint-disable @next/next/no-img-element */
import { MAKER_LOGOS } from "@/lib/makerLogos";
import { makerMark } from "@/lib/makerMarks";

/** Official brand icon when available, otherwise a brand-coloured monogram. */
export function MakerMark({
  manufacturer,
  size = "md",
}: {
  manufacturer: string;
  size?: "sm" | "md" | "lg";
}) {
  const logo = MAKER_LOGOS[manufacturer];
  const box =
    size === "sm"
      ? "h-8 w-8 rounded-lg"
      : size === "lg"
        ? "h-14 w-14 rounded-2xl"
        : "h-11 w-11 rounded-xl";

  if (logo) {
    const px = size === "sm" ? 22 : size === "lg" ? 40 : 30;
    return (
      <span
        className={`relative grid shrink-0 place-items-center overflow-hidden border border-line bg-white/[0.95] ${box}`}
        title={manufacturer}
        aria-label={manufacturer}
      >
        <img src={logo} alt="" width={px} height={px} className="object-contain" />
      </span>
    );
  }

  const mark = makerMark(manufacturer);
  return (
    <span
      className={`relative grid shrink-0 place-items-center overflow-hidden border border-line bg-panel-soft ${box}`}
      title={manufacturer}
      aria-label={manufacturer}
    >
      <span
        className="absolute inset-0"
        style={{ background: `linear-gradient(135deg, ${mark.from}33, ${mark.to}12)` }}
        aria-hidden="true"
      />
      <span
        className="absolute -left-2 -top-2 h-8 w-8 rounded-full opacity-50 blur-lg"
        style={{ background: mark.from }}
        aria-hidden="true"
      />
      <span
        className="relative font-black tracking-tight"
        style={{ color: mark.from, fontSize: size === "lg" ? 13 : size === "sm" ? 8 : 9 }}
      >
        {mark.short}
      </span>
    </span>
  );
}
