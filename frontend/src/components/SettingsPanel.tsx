import { useState, useEffect, useCallback } from "react";
import type { Settings, Camera } from "../types";
import { fetchCameras } from "../api";
import ToggleSwitch from "./ui/ToggleSwitch";
import Tooltip from "./ui/Tooltip";
import Spinner from "./ui/Spinner";
import { useToast } from "./ui/useToast";

interface Props {
  settings: Settings;
  onUpdate: (patch: Partial<Settings>) => void;
}

export default function SettingsPanel({ settings, onUpdate }: Props) {
  const toast = useToast();
  const [modelLoading, setModelLoading] = useState(false);
  const [isIpMode, setIsIpMode] = useState(settings.camera_url !== "");
  const [localUrl, setLocalUrl] = useState(settings.camera_url);
  const [cameras, setCameras] = useState<Camera[]>([]);
  const [camerasLoading, setCamerasLoading] = useState(false);

  useEffect(() => {
    setIsIpMode(settings.camera_url !== "");
    setLocalUrl(settings.camera_url);
  }, [settings.camera_url]);

  const loadCameras = useCallback(async () => {
    setCamerasLoading(true);
    try {
      const list = await fetchCameras();
      setCameras(list);
    } catch {
      setCameras([]);
    } finally {
      setCamerasLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isIpMode) loadCameras();
  }, [isIpMode, loadCameras]);

  const handleModelChange = async (model: string) => {
    setModelLoading(true);
    try {
      onUpdate({ model_name: model });
      toast.info(`Switching to ${model === "crack_n.pt" ? "fast" : "accurate"} model...`);
    } finally {
      setTimeout(() => setModelLoading(false), 2000);
    }
  };

  return (
    <div className="space-y-4">
      {/* Confidence slider */}
      <div>
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="flex items-center gap-1.5 text-gray-300 font-medium">
            Confidence
            <Tooltip text="Higher = fewer but more accurate detections. Lower = more detections but more false positives.">
              <svg className="w-3.5 h-3.5 text-gray-500 cursor-help" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </Tooltip>
          </span>
          <span className="gradient-text font-mono text-xs font-semibold">{settings.confidence.toFixed(2)}</span>
        </div>
        <input
          type="range"
          min={0.1}
          max={0.95}
          step={0.05}
          value={settings.confidence}
          onChange={(e) => onUpdate({ confidence: parseFloat(e.target.value) })}
          className="w-full"
        />
      </div>

      {/* Model selection */}
      <div>
        <span className="text-sm text-gray-300 font-medium flex items-center gap-2 mb-2">
          Model
          {modelLoading && <Spinner size="sm" />}
        </span>
        <div className="flex gap-2">
          {[
            { label: "nano (fast)", value: "crack_n.pt" },
            { label: "medium (accurate)", value: "crack_m.pt" },
          ].map((m) => (
            <button
              key={m.value}
              onClick={() => handleModelChange(m.value)}
              disabled={modelLoading}
              className={`flex-1 text-xs py-2 rounded-xl border transition-all duration-200 ${
                settings.model_name === m.value
                  ? "border-accent/30 bg-accent/10 text-accent-light shadow-[0_0_8px_rgba(99,102,241,0.15)]"
                  : "border-white/[0.06] text-gray-400 hover:border-white/10 hover:text-gray-300 bg-white/[0.02]"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Display toggles */}
      <div className="space-y-0.5">
        <ToggleSwitch
          label="Show Labels"
          checked={settings.show_labels}
          onChange={(v) => onUpdate({ show_labels: v })}
        />
        <ToggleSwitch
          label="Show Confidence"
          checked={settings.show_confidence}
          onChange={(v) => onUpdate({ show_confidence: v })}
        />
      </div>

      {/* Camera mode */}
      <div>
        <span className="text-sm text-gray-300 font-medium block mb-2">Camera</span>
        <div className="flex gap-2 mb-2.5">
          {[
            { label: "Built-in", ip: false },
            { label: "IP Camera", ip: true },
          ].map((m) => (
            <button
              key={String(m.ip)}
              onClick={() => {
                setIsIpMode(m.ip);
                if (!m.ip) onUpdate({ camera_url: "" });
              }}
              className={`flex-1 text-xs py-2 rounded-xl border transition-all duration-200 ${
                isIpMode === m.ip
                  ? "border-accent/30 bg-accent/10 text-accent-light shadow-[0_0_8px_rgba(99,102,241,0.15)]"
                  : "border-white/[0.06] text-gray-400 hover:border-white/10 hover:text-gray-300 bg-white/[0.02]"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {!isIpMode ? (
          <div className="flex gap-2 items-center">
            {camerasLoading ? (
              <div className="flex items-center gap-2 text-xs text-gray-400 glass rounded-xl px-3 py-2 flex-1">
                <Spinner size="sm" /> Scanning cameras...
              </div>
            ) : cameras.length === 0 ? (
              <div className="flex items-center justify-between glass rounded-xl px-3 py-2 flex-1">
                <span className="text-sm text-gray-500">No cameras detected</span>
              </div>
            ) : (
              <select
                value={settings.camera_index}
                onChange={(e) => onUpdate({ camera_index: parseInt(e.target.value) })}
                className="glass rounded-xl px-3 py-2 text-sm text-gray-300 flex-1 focus:outline-none focus:ring-1 focus:ring-accent/30 transition-all"
              >
                {cameras.map((cam) => (
                  <option key={cam.index} value={cam.index}>{cam.label}</option>
                ))}
              </select>
            )}
            <button
              onClick={loadCameras}
              disabled={camerasLoading}
              title="Refresh camera list"
              className="px-2.5 py-2 rounded-xl border border-white/[0.06] text-gray-400 hover:text-gray-200 hover:border-white/10 transition-all disabled:opacity-40"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={localUrl}
                onChange={(e) => setLocalUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") onUpdate({ camera_url: localUrl });
                }}
                placeholder="http://192.168.x.x:8080/video"
                className="flex-1 glass rounded-xl px-3 py-2 text-xs text-gray-300 focus:outline-none focus:ring-1 focus:ring-accent/30 transition-all placeholder:text-gray-600"
              />
              <button
                onClick={() => onUpdate({ camera_url: localUrl })}
                className="px-3.5 py-2 text-xs rounded-xl gradient-accent text-white hover:shadow-glow-sm transition-all"
              >
                Set
              </button>
            </div>
            <p className="text-xs text-gray-500">Install IP Webcam on Android</p>
          </div>
        )}
      </div>
    </div>
  );
}
