// 상태 Enum
export type SystemState = 'normal' | 'warning' | 'critical' | 'device_fault';

// 1. Node 타입
export interface NodeData {
  node_id: string;
  name: string;
  location: string;
  created_at: string;
  updated_at: string;
  last_seen_at: string;
}

// 8. Dashboard 타입
export interface DashboardOverview {
  total_nodes: number;
  online_nodes: number;
  offline_nodes: number;
  active_warnings: number;
  active_criticals: number;
  active_faults: number;
}

export interface TemperatureTrend {
  timestamp: string;
  surface_temp_c: number | null;
  hot_air_temp_c: number | null;
  cool_air_temp_c: number | null;
}

export interface ModeTransition {
  id: number;
  node_id: string;
  timestamp: string;
  from_state: SystemState;
  to_state: SystemState;
  reason: string;
}