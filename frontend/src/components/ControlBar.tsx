import { useState } from "react";
import { startDetection, pauseDetection, stopDetection, takeScreenshot } from "../api";
import { useToast } from "./ui/useToast";
import Modal from "./ui/Modal";
import Spinner from "./ui/Spinner";

interface Props {
  running: boolean;
  paused: boolean;
  fps: number;
  onStart: () => void;
}

export default function ControlBar({ running, paused, fps, onStart }: Props) {
  const toast = useToast();
  const [starting, setStarting] = useState(false);
  const [pausing, setPausing] = useState(false);
  const [screenshotting, setScreenshotting] = useState(false);
  const [showStopConfirm, setShowStopConfirm] = useState(false);
  const [stopping, setStopping] = useState(false);

  const handleStart = async () => {
    setStarting(true);
    try {
      await startDetection();
      onStart();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to start detection");
    } finally {
      setStarting(false);
    }
  };

  const handlePause = async () => {
    setPausing(true);
    try {
      await pauseDetection();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to pause");
    } finally {
      setPausing(false);
    }
  };

  const handleStop = async () => {
    setStopping(true);
    try {
      await stopDetection();
      setShowStopConfirm(false);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to stop");
    } finally {
      setStopping(false);
    }
  };

  const handleScreenshot = async () => {
    setScreenshotting(true);
    try {
      await takeScreenshot();
      toast.success("Screenshot saved");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Screenshot failed");
    } finally {
      setScreenshotting(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2 flex-wrap">
        {!running ? (
          <button
            onClick={handleStart}
            disabled={starting}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl gradient-accent text-white font-semibold shadow-glow-md hover:shadow-glow-lg hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06060c]"
          >
            {starting && <Spinner size="sm" className="text-white" />}
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5.14v14l11-7-11-7z" />
            </svg>
            Start
          </button>
        ) : (
          <>
            <button
              onClick={handlePause}
              disabled={pausing}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass-card text-gray-300 hover:text-white hover:border-white/10 transition-all duration-200 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06060c]"
            >
              {pausing && <Spinner size="sm" />}
              {paused ? (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5.14v14l11-7-11-7z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              )}
              {paused ? "Resume" : "Pause"}
            </button>
            <button
              onClick={() => setShowStopConfirm(true)}
              className="px-5 py-2.5 rounded-xl border border-danger/30 text-danger hover:bg-danger/10 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-danger/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06060c]"
            >
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="6" width="12" height="12" rx="2" />
                </svg>
                Stop
              </span>
            </button>
            <button
              onClick={handleScreenshot}
              disabled={screenshotting}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl glass-card text-gray-300 hover:text-white hover:border-white/10 transition-all duration-200 disabled:opacity-60 focus-visible:ring-2 focus-visible:ring-accent/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#06060c]"
            >
              {screenshotting ? (
                <Spinner size="sm" />
              ) : (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <circle cx="12" cy="13" r="3" />
                </svg>
              )}
              Screenshot
            </button>

            {/* FPS badge */}
            <span className="ml-auto glass rounded-full px-3.5 py-1.5 font-mono text-xs text-gray-400">
              <span className="gradient-text font-semibold">{fps}</span> FPS
            </span>
          </>
        )}
      </div>

      {/* Stop confirmation modal */}
      <Modal open={showStopConfirm} onClose={() => setShowStopConfirm(false)}>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center">
              <svg className="w-5 h-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h3 className="text-white font-semibold">Stop Detection?</h3>
              <p className="text-sm text-gray-400">This will end the current session and stop the camera.</p>
            </div>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              onClick={() => setShowStopConfirm(false)}
              className="px-4 py-2 rounded-xl glass-card text-gray-300 hover:text-white transition-all text-sm"
            >
              Cancel
            </button>
            <button
              onClick={handleStop}
              disabled={stopping}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-danger hover:bg-danger/90 text-white font-medium transition-all text-sm shadow-lg shadow-danger/20 disabled:opacity-60"
            >
              {stopping && <Spinner size="sm" className="text-white" />}
              Stop Detection
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
