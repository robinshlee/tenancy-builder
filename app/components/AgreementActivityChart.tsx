type Point = { key: string; label: string; count: number };

export function AgreementActivityChart({ data }: { data: Point[] }) {
  const width = 320;
  const height = 160;
  const padding = 24;
  const max = Math.max(1, ...data.map((d) => d.count));

  const step = (width - padding * 2) / Math.max(1, data.length - 1);
  const points = data.map((d, i) => {
    const x = padding + i * step;
    const y = height - padding - (d.count / max) * (height - padding * 2 - 10);
    return { x, y, ...d };
  });

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const areaPath = `${linePath} L${points[points.length - 1].x},${height - padding} L${points[0].x},${height - padding} Z`;

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto" role="img" aria-label="Agreements created per month">
      <defs>
        <linearGradient id="activityFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(45,212,191,0.35)" />
          <stop offset="100%" stopColor="rgba(45,212,191,0)" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill="url(#activityFill)" />
      <path d={linePath} fill="none" stroke="#2dd4bf" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p) => (
        <circle key={p.key} cx={p.x} cy={p.y} r="2.5" fill="#5eead4" />
      ))}
      {points.map((p) => (
        <text key={`${p.key}-label`} x={p.x} y={height - 6} textAnchor="middle" fontSize="9" fill="rgba(148,163,184,0.8)">
          {p.label}
        </text>
      ))}
    </svg>
  );
}
