import { useState } from "react";
import { streamUrl } from "../api";
import Spinner from "./ui/Spinner";
import { ICON_PATHS } from "./ui/icons";

type FeedState = "idle" | "connecting" | "streaming" | "error";

interface Props {
  running: boolean;
  paused: boolean;
  streamKey: number;
}

export default function VideoFeed({ running, paused, streamKey }: Props) {
  const [state, setState] = useState<FeedState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const actualState: FeedState = !running
    ? "idle"
    : state === "error"
      ? "error"
      : state === "streaming"
        ? "streaming"
        : "connecting";

  const handleLoad = () => setState("streaming");
  const handleError = () => {
    if (running) {
      setErrorMsg("Failed to connect to camera stream");
      setState("error");
    }
  };

  const onStart = () => {
    setState("connecting");
    setErrorMsg("");
  };

  return (
    <div className="relative flex-1 aspect-video rounded-2xl overflow-hidden flex items-center justify-center min-h-[300px] max-h-[70vh] bg-white/[0.02] gradient-border">
      {/* Subtle glow behind the video container */}
      <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-blue-500/10 via-transparent to-purple-500/10 blur-xl pointer-events-none motion-safe:animate-glow-pulse" />

      {/* Grid pattern background for non-streaming states */}
      {actualState !== "streaming" && (
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: "linear-gradient(rgba(99,102,241,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(99,102,241,0.5) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
      )}

      {/* Idle */}
      {actualState === "idle" && (
        <div className="flex flex-col items-center gap-5 text-gray-500 select-none motion-safe:animate-fade-in relative z-10">
          <div className="w-20 h-20 rounded-2xl glass-card flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d={ICON_PATHS.videoCameraOutline} />
            </svg>
          </div>
          <p className="text-base">
            Press <span className="gradient-text font-semibold">Start</span> to begin detection
          </p>
        </div>
      )}

      {/* Connecting */}
      {actualState === "connecting" && (
        <div className="flex flex-col items-center gap-4 select-none motion-safe:animate-fade-in relative z-10">
          <Spinner size="lg" />
          <p className="text-gray-400">Connecting to camera...</p>
        </div>
      )}

      {/* Streaming */}
      {running && (
        <img
          key={streamKey}
          src={streamUrl(streamKey)}
          alt="Live detection feed"
          className={`w-full h-full object-contain relative z-10 ${actualState === "streaming" ? "" : "hidden"}`}
          onLoad={handleLoad}
          onLoadStart={onStart}
          onError={handleError}
        />
      )}

      {/* LIVE badge */}
      {actualState === "streaming" && !paused && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-red-500/90 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-lg shadow-red-500/20">
          <span className="relative flex h-2 w-2">
            <span className="absolute inset-0 rounded-full bg-white animate-ping opacity-75" />
            <span className="relative rounded-full h-2 w-2 bg-white" />
          </span>
          <span className="text-xs font-bold text-white tracking-wider">LIVE</span>
        </div>
      )}

      {/* PAUSED badge */}
      {actualState === "streaming" && paused && (
        <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-yellow-500/80 backdrop-blur-sm px-2.5 py-1 rounded-lg shadow-lg shadow-yellow-500/20">
          <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 24 24">
            <rect x="6" y="4" width="4" height="16" rx="1" />
            <rect x="14" y="4" width="4" height="16" rx="1" />
          </svg>
          <span className="text-xs font-bold text-white tracking-wider">PAUSED</span>
        </div>
      )}

      {/* Error */}
      {actualState === "error" && (
        <div className="flex flex-col items-center gap-4 text-red-400 select-none motion-safe:animate-fade-in relative z-10">
          <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-base">{errorMsg}</p>
        </div>
      )}
    </div>
  );
}
