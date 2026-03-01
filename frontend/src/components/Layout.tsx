import type { ReactNode } from "react";
import StatusDot from "./ui/StatusDot";
import { ICON_PATHS } from "./ui/icons";

interface Props {
  children: ReactNode;
  running: boolean;
  paused: boolean;
}

export default function Layout({ children, running, paused }: Props) {
  const status = running ? (paused ? "paused" : "live") : "stopped";

  return (
    <div className="min-h-screen bg-[#06060c] text-white flex flex-col relative overflow-hidden">
      {/* Ambient background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-blue-600/[0.04] blur-3xl motion-safe:animate-float" />
        <div className="absolute -bottom-40 -right-40 w-96 h-96 rounded-full bg-purple-600/[0.04] blur-3xl motion-safe:animate-float" style={{ animationDelay: "-3s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-indigo-600/[0.02] blur-3xl" />
      </div>

      {/* Fixed header */}
      <header className="fixed top-0 left-0 right-0 z-40 glass">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Left: icon + title */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center shadow-glow-sm">
              <svg className="w-4.5 h-4.5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d={ICON_PATHS.shieldCrack} />
              </svg>
            </div>
            <h1 className="text-lg font-bold tracking-tight">
              <span className="gradient-text">CrackDetect</span>
              <span className="text-gray-400 font-medium ml-1">AI</span>
            </h1>
          </div>

          {/* Center: status */}
          <StatusDot status={status} />

          {/* Right: version */}
          <span className="text-xs text-gray-500 border border-white/[0.06] rounded-full px-2.5 py-0.5 bg-white/[0.02]">
            v2.0
          </span>
        </div>
        {/* Gradient bottom edge */}
        <div className="h-px bg-gradient-to-r from-transparent via-accent/25 to-transparent" />
      </header>

      {/* Content with top padding for fixed header */}
      <main className="relative flex-1 flex flex-col lg:flex-row gap-4 p-4 pt-16 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
