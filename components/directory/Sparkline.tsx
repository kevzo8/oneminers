export default function Sparkline({ values, width = 110, height = 32 }: { values: number[]; width?: number; height?: number }) {
  if (values.length < 2) return <span className="text-xs text-muted">—</span>;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const up = values[values.length - 1] >= values[0];
  const path = values
    .map((v, i) => `${i ? "L" : "M"}${((i / (values.length - 1)) * width).toFixed(1)},${((1 - (v - min) / span) * (height - 2) + 1).toFixed(1)}`)
    .join(" ");
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} style={{ maxWidth: "100%", height: "auto" }} aria-hidden="true">
      <path d={path} fill="none" stroke={up ? "#b9ff66" : "#f87171"} strokeWidth="1.5" />
    </svg>
  );
}
