export interface Stats {
  crack_count: number;
  fps: number;
  session_time: string;
  screenshots: number;
  running: boolean;
  paused: boolean;
}

export interface Settings {
  confidence: number;
  camera_index: number;
  camera_url: string;
  model_name: string;
  show_labels: boolean;
  show_confidence: boolean;
}

export interface Screenshot {
  name: string;
  size: number;
}

export interface Camera {
  index: number;
  label: string;
}
