/* eslint-disable @next/next/no-img-element */
import { coinColor, coinIcon } from "@/lib/coinIcons";

export function CoinIcon({
  tag,
  size = 14,
  className = "",
  label,
}: {
  tag: string;
  size?: number;
  className?: string;
  label?: string;
}) {
  const name = label ?? tag;
  const parts = tag.split("+").filter(Boolean);
  if (parts.length > 1) {
    return (
      <span
        title={name}
        aria-label={name}
        role="img"
        className={`inline-flex shrink-0 items-center -space-x-1 ${className}`}
      >
        {parts.map((part) => (
          <CoinIcon key={part} tag={part} size={size} className="ring-1 ring-[var(--surface-solid)]" />
        ))}
      </span>
    );
  }

  const icon = coinIcon(tag);
  if (icon) {
    return (
      <img
        src={icon}
        alt=""
        title={name}
        aria-label={name}
        width={size}
        height={size}
        loading="lazy"
        decoding="async"
        className={`shrink-0 rounded-full object-contain ${className}`}
      />
    );
  }

  const color = coinColor(tag);
  const letters = size >= 22 ? tag.slice(0, 3) : tag.slice(0, 2);
  return (
    <span
      title={name}
      aria-label={name}
      role="img"
      className={`inline-grid shrink-0 place-items-center rounded-full border font-black leading-none ${className}`}
      style={{
        width: size,
        height: size,
        borderColor: `${color}66`,
        background: `${color}1f`,
        color,
        fontSize: Math.max(8, Math.round(size * 0.4)),
      }}
    >
      {letters.toUpperCase()}
    </span>
  );
}

/** Overlapping coin logos for a miner that can mine several coins. */
export function CoinStack({ tags, size = 18, max = 3 }: { tags: string[]; size?: number; max?: number }) {
  const unique = Array.from(new Set(tags)).slice(0, max);
  if (!unique.length) return null;
  const name = unique.join(" + ");
  return (
    <span title={name} aria-label={name} role="img" className="inline-flex shrink-0 items-center -space-x-1.5">
      {unique.map((tag) => (
        <span key={tag} className="inline-flex rounded-full ring-2 ring-[var(--surface-solid)]">
          <CoinIcon tag={tag} size={size} />
        </span>
      ))}
    </span>
  );
}
