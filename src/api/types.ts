export type NodeState = "normal" | "warning" | "critical" | "device_fault";
export type SystemState = NodeState;

export type MessageType = "heartbeat" | "summary" | "event" | "alert" | "fault";

export interface ApiError {
  code: string;
  message: string;
}

export type ApiResponse<T> =
  | { ok: true; data: T }
  | { ok: false; error: ApiError };

export interface RangeQuery {
  from?: string;
  to?: string;
  limit?: number;
}

export interface Node {
  node_id: string;
  name: string;
  location: string;
  created_at: string;
  updated_at: string;
  last_seen_at: string | null;
}

export type NodeData = Node;

export interface NodeCreate {
  node_id: string;
  name: string;
  location: string;
}

export type NodeUpdate = Partial<Pick<Node, "name" | "location">>;

export interface HeartbeatPayload {
  timestamp: string;
  node_id: string;
  message_type: "heartbeat";
}

export interface Heartbeat {
  id?: number;
  timestamp: string;
  node_id: string;
}

export interface MeasurementPayload {
  timestamp: string;
  node_id: string;
  message_type: "summary" | "event" | "alert" | "fault";
  state: NodeState;
  surface_temp_c: number | null;
  hot_air_temp_c: number | null;
  cool_air_temp_c: number | null;
  light_level: number | null;
  heat_source_on: boolean | null;
  l_match: number | null;
  l_grad: number | null;
  l_safety: number | null;
  l_final: number | null;
  fault_reason: string | null;
}

export interface Measurement extends Omit<MeasurementPayload, "message_type"> {
  id?: number;
  created_at?: string;
}

export type SummaryPayload = MeasurementPayload & { message_type: "summary"; state: "normal" };
export type EventPayload = MeasurementPayload & { message_type: "event"; state: "warning" };
export type AlertPayload = MeasurementPayload & { message_type: "alert"; state: "critical" };
export type FaultPayload = MeasurementPayload & { message_type: "fault"; state: "device_fault" };

export interface ModeTransition {
  id: number;
  node_id: string;
  timestamp: string;
  from_state: NodeState;
  to_state: NodeState;
  reason: string;
}

export interface DashboardOverview {
  total_nodes: number;
  online_nodes: number;
  offline_nodes: number;
  active_warnings: number;
  active_criticals: number;
  active_faults: number;
}

export interface TemperatureTrendPoint {
  timestamp: string;
  surface_temp_c: number | null;
  hot_air_temp_c: number | null;
  cool_air_temp_c: number | null;
}

export type TemperatureTrend = TemperatureTrendPoint;

export interface GradientChangePoint {
  timestamp: string;
  gradient: number | null;
}

export interface NodeSensorStatus {
  node_id: string;
  name: string;
  location: string;
  last_seen_at: string | null;
}

export interface LatestNodeMeasurement {
  node: Node;
  latest: Measurement | null;
}

export interface AlertMqttPayload {
  schema?: string;
  node_id: string;
  timestamp_ms: number;
  message_type?: "alert";
  state: NodeState;
  state_changed: boolean;
  qos: number;
  retain: boolean;
  message_expiry_ms: number;
  sensor_values?: MqttSensorValues;
  features: MqttFeatures;
  diagnosis: MqttDiagnosisRequired;
  sensor_status: MqttSensorStatus;
}

export interface EventMqttPayload {
  schema?: string;
  node_id: string;
  timestamp_ms: number;
  message_type?: "event";
  state: NodeState;
  state_changed: boolean;
  qos: number;
  retain: boolean;
  message_expiry_ms: number;
  sensor_values?: MqttSensorValues;
  features?: MqttFeatures;
  diagnosis: MqttDiagnosisRequired;
  sensor_status: MqttSensorStatus;
}

export interface SummaryMqttPayload {
  schema?: string;
  node_id: string;
  timestamp_ms: number;
  message_type?: "summary";
  state: NodeState;
  state_changed: boolean;
  qos: number;
  retain: boolean;
  message_expiry_ms: number;
  summary: {
    ready: boolean;
    window_sample_count: number;
    window_capacity: number;
    hot_surface_temp_c: MqttSummaryValue;
    hot_air_temp_c: MqttSummaryValue;
    cool_air_temp_c: MqttSummaryValue;
    light_level: MqttSummaryValue;
    temp_gradient_c: MqttSummaryValue;
  };
  heat_source: {
    state_ok: boolean;
    on: boolean;
    on_duration_ms: number;
  };
  sensor_status: MqttSensorStatus;
}

export interface SummaryRecord {
  id: number;
  schema_name: string;
  node_id: string;
  timestamp_ms: number | string;
  state: NodeState;
  state_changed: boolean;
  qos: number;
  retain: boolean;
  message_expiry_ms: number;
  ready: boolean;
  window_sample_count: number;
  window_capacity: number;
  hot_surface_temp_ok: boolean;
  hot_surface_temp_count: number | null;
  hot_surface_temp_avg: number | null;
  hot_surface_temp_min: number | null;
  hot_surface_temp_max: number | null;
  hot_air_temp_ok: boolean;
  hot_air_temp_count: number | null;
  hot_air_temp_avg: number | null;
  hot_air_temp_min: number | null;
  hot_air_temp_max: number | null;
  cool_air_temp_ok: boolean;
  cool_air_temp_count: number | null;
  cool_air_temp_avg: number | null;
  cool_air_temp_min: number | null;
  cool_air_temp_max: number | null;
  light_level_ok: boolean;
  light_level_count: number | null;
  light_level_avg: number | null;
  light_level_min: number | null;
  light_level_max: number | null;
  temp_gradient_ok: boolean;
  temp_gradient_count: number | null;
  temp_gradient_avg: number | null;
  temp_gradient_min: number | null;
  temp_gradient_max: number | null;
  heat_source_state_ok: boolean;
  heat_source_on: boolean | null;
  heat_source_on_duration_ms: number | string | null;
  usable_for_diagnosis: boolean;
  response_failure: boolean;
  missing_value: boolean;
  out_of_range_value: boolean;
  persistent_out_of_range_value: boolean;
  repeated_value: boolean;
  hot_surface_ok: boolean;
  hot_air_ok: boolean;
  cool_air_ok: boolean;
  light_ok: boolean;
  received_at: string;
}

export interface SummaryCreateResponse {
  id: number;
  received_at: string;
}

export interface SummaryQuery {
  node_id?: string;
  limit?: number;
}

export interface HeartbeatMqttPayload {
  schema?: string;
  node_id: string;
  timestamp_ms: number;
  message_type?: "heartbeat";
  state: NodeState;
  mqtt_connected: boolean;
  uptime_ms: number;
}

export interface FaultMqttPayload {
  schema?: string;
  node_id: string;
  timestamp_ms: number;
  message_type?: "fault";
  state: NodeState;
  state_changed: boolean;
  qos: number;
  retain: boolean;
  message_expiry_ms: number;
  fault: MqttFault;
  sensor_values?: MqttSensorValues;
  diagnosis?: MqttDiagnosisOptional;
  sensor_status: MqttSensorStatus;
}

export interface MqttFault {
  sensor_response_failure: boolean;
  missing_value: boolean;
  out_of_range_value: boolean;
  persistent_out_of_range_value: boolean;
  repeated_value: boolean;
  fault_reason: string | null;
}

export interface MqttSensorValues {
  hot_surface_temp_c: number | null;
  hot_air_temp_c: number | null;
  cool_air_temp_c: number | null;
  light_level: number | null;
}

export interface MqttFeatures {
  temp_gradient_ok: boolean;
  temp_gradient_c: number | null;
  heat_source_state_ok: boolean;
  heat_source_on: boolean;
  heat_source_on_since_ms: number;
  heat_source_on_duration_ms: number;
  surface_temp_step_delta_ok: boolean;
  surface_temp_step_delta_c: number | null;
  surface_temp_rise_since_heat_on_ok: boolean;
  surface_temp_rise_since_heat_on_c: number | null;
}

export interface MqttDiagnosisRequired {
  status: NodeState;
  l_match: number;
  l_grad: number;
  l_safety: number;
  l_fault: number;
  l_final: number;
  cause_flags: string | null;
  fault_reason: string | null;
}

export type MqttDiagnosisOptional = Partial<MqttDiagnosisRequired>;

export interface MqttSensorStatus {
  usable_for_diagnosis: boolean;
  response_failure: boolean;
  missing_value: boolean;
  out_of_range_value: boolean;
  persistent_out_of_range_value: boolean;
  repeated_value: boolean;
  hot_surface_ok: boolean;
  hot_air_ok: boolean;
  cool_air_ok: boolean;
  light_ok: boolean;
}

export interface MqttSummaryValue {
  ok: boolean;
  sample_count: number;
  average: number | null;
  min: number | null;
  max: number | null;
}
