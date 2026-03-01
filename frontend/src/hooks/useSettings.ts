import { useEffect, useState, useCallback } from "react";
import type { Settings } from "../types";
import { fetchSettings, updateSettings as apiUpdate } from "../api";

const DEFAULT_SETTINGS: Settings = {
  confidence: 0.45,
  camera_index: 0,
  camera_url: "",
  model_name: "crack_n.pt",
  show_labels: true,
  show_confidence: true,
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await fetchSettings();
        if (active) setSettings(data);
      } catch {
        // ignore — defaults are already set
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const update = useCallback(async (patch: Partial<Settings>) => {
    // optimistic update
    setSettings((prev) => ({ ...prev, ...patch }));
    try {
      const result = await apiUpdate(patch);
      setSettings(result);
    } catch {
      // revert on error
      const fresh = await fetchSettings();
      setSettings(fresh);
    }
  }, []);

  return { settings, update };
}
