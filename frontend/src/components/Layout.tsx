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
    <div className="min-h-screen bg-gray-950 text-white flex flex-col">
      {/* Fixed header */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-gray-950/80 backdrop-blur-md">
        <div className="flex items-center justify-between px-6 py-3">
          {/* Left: icon + title */}
          <div className="flex items-center gap-2.5">
            <svg className="w-6 h-6 text-accent" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d={ICON_PATHS.videoCameraOutline} />
            </svg>
            <h1 className="text-lg font-bold text-white tracking-tight">
              Crack Detection System
            </h1>
          </div>

          {/* Center: status */}
          <StatusDot status={status} />

          {/* Right: version */}
          <span className="text-xs text-gray-500 border border-gray-800 rounded-full px-2.5 py-0.5">
            v2.0
          </span>
        </div>
        {/* Gradient bottom edge */}
        <div className="h-px bg-gradient-to-r from-transparent via-accent/20 to-transparent" />
      </header>

      {/* Content with top padding for fixed header */}
      <main className="flex-1 flex flex-col lg:flex-row gap-4 p-4 pt-16 overflow-hidden">
        {children}
      </main>
    </div>
  );
}
