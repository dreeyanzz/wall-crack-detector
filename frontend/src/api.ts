import type { Stats, Settings, Screenshot, Camera } from "./types";

const BASE = "/api";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function json<T>(res: Promise<Response>): Promise<T> {
  const r = await res;
  if (!r.ok) {
    let msg = `Request failed (${r.status})`;
    try {
      const body = await r.json();
      if (body.message) msg = body.message;
      else if (body.detail) msg = body.detail;
    } catch {
      // use default message
    }
    throw new ApiError(r.status, msg);
  }
  return r.json() as Promise<T>;
}

// Controls
export const startDetection = () => json<{ status: string }>(fetch(`${BASE}/start`, { method: "POST" }));
export const pauseDetection = () => json<{ status: string }>(fetch(`${BASE}/pause`, { method: "POST" }));
export const stopDetection = () => json<Record<string, unknown>>(fetch(`${BASE}/stop`, { method: "POST" }));

// Stats
export const fetchStats = () => json<Stats>(fetch(`${BASE}/stats`));

// Settings
export const fetchSettings = () => json<Settings>(fetch(`${BASE}/settings`));
export const updateSettings = (data: Partial<Settings>) =>
  json<Settings>(fetch(`${BASE}/settings`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) }));

// Screenshots
export const takeScreenshot = () => json<{ status: string; filename?: string }>(fetch(`${BASE}/screenshot`, { method: "POST" }));
export const fetchScreenshots = () => json<Screenshot[]>(fetch(`${BASE}/screenshots`));
export const deleteScreenshot = (name: string) =>
  json<{ status: string }>(fetch(`${BASE}/screenshots/${encodeURIComponent(name)}`, { method: "DELETE" }));

// Cameras
export const fetchCameras = () => json<Camera[]>(fetch(`${BASE}/cameras`));

// Stream URL (not a fetch — used as <img> src)
export const streamUrl = (cacheBust: number) => `${BASE}/stream?t=${cacheBust}`;
