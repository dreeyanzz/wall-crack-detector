import type { Stats } from "../types";
import AnimatedNumber from "./ui/AnimatedNumber";

interface Props {
  stats: Stats;
}

const STAT_ICONS = {
  crack: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z",
  gauge: "M13 10V3L4 14h7v7l9-11h-7z",
  clock: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
};

function StatCard({
  label,
  value,
  icon,
  highlight,
}: {
  label: string;
  value: string | number;
  icon: string;
  highlight?: boolean;
}) {
  return (
    <div
      className={`bg-gray-800/50 rounded-lg px-3 py-2.5 ${
        highlight ? "ring-1 ring-accent/30" : ""
      }`}
    >
      <div className="flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-md bg-accent/10 flex items-center justify-center shrink-0">
          <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
        <div className="min-w-0">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider leading-tight">{label}</div>
          <div className="text-xl font-bold text-white leading-tight">
            <AnimatedNumber value={value} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StatsPanel({ stats }: Props) {
  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-2 gap-2">
        <StatCard
          label="Cracks Detected"
          value={stats.crack_count}
          icon={STAT_ICONS.crack}
          highlight={stats.crack_count > 0}
        />
        <StatCard label="FPS" value={stats.fps} icon={STAT_ICONS.gauge} />
      </div>
      <StatCard label="Session" value={stats.session_time || "--:--"} icon={STAT_ICONS.clock} />
    </div>
  );
}
