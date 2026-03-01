interface Props {
  variant?: "line" | "box";
  className?: string;
}

export default function Skeleton({ variant = "line", className = "" }: Props) {
  const base = variant === "line" ? "h-3 rounded-full" : "rounded-lg";
  return <div className={`skeleton ${base} ${className}`} />;
}
