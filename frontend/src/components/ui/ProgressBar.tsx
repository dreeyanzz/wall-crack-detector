interface Props {
  value: number;
  max?: number;
  className?: string;
}

export default function ProgressBar({ value, max = 100, className = "" }: Props) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className={`h-1.5 rounded-full bg-white/5 overflow-hidden ${className}`}>
      <div
        className="h-full rounded-full gradient-accent transition-all duration-300"
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
