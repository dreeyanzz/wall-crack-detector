interface Props {
  status: "live" | "paused" | "stopped";
}

const CONFIG = {
  live: { color: "bg-green-400", glowColor: "shadow-[0_0_8px_rgba(74,222,128,0.6)]", pulse: true, label: "Live" },
  paused: { color: "bg-yellow-400", glowColor: "shadow-[0_0_8px_rgba(250,204,21,0.5)]", pulse: false, label: "Paused" },
  stopped: { color: "bg-gray-500", glowColor: "", pulse: false, label: "Stopped" },
};

export default function StatusDot({ status }: Props) {
  const { color, glowColor, pulse, label } = CONFIG[status];
  return (
    <span className="inline-flex items-center gap-2">
      <span className={`relative flex h-2.5 w-2.5 ${glowColor} rounded-full`}>
        {pulse && (
          <span className={`absolute inset-0 rounded-full ${color} opacity-75 animate-ping`} />
        )}
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${color}`} />
      </span>
      <span className="text-sm text-gray-400 font-medium">{label}</span>
    </span>
  );
}
