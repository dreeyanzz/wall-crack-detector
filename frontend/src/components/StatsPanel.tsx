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
  highlightColor,
}: {
  label: string;
  value: string | number;
  icon: string;
  highlight?: boolean;
  highlightColor?: string;
}) {
  return (
    <div
      className={`glass rounded-xl px-3.5 py-3 card-hover ${
        highlight ? "ring-1 ring-amber-500/20" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          highlight && highlightColor ? highlightColor : "bg-accent/10"
        }`}>
          <svg className={`w-4 h-4 ${highlight ? "text-amber-400" : "text-accent-light"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
          </svg>
        </div>
        <div className="min-w-0">
          <div className="text-[10px] text-gray-500 uppercase tracking-wider leading-tight font-medium">{label}</div>
          <div className={`text-xl font-bold leading-tight ${highlight ? "text-amber-400" : "text-white"}`}>
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
          highlightColor="bg-amber-500/10"
        />
        <StatCard label="FPS" value={stats.fps} icon={STAT_ICONS.gauge} />
      </div>
      <StatCard label="Session" value={stats.session_time || "--:--"} icon={STAT_ICONS.clock} />
    </div>
  );
}
