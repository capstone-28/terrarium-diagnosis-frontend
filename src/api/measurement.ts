import { applyRange, fail, ok, supabase } from "./client";
import { SummaryDto } from "./dto/summary.dto";
import type {
  ApiResponse,
  MeasurementPayload,
  RangeQuery,
  SummaryCreateResponse,
  SummaryMqttPayload,
  SummaryQuery,
  SummaryRecord,
} from "./types";

type MeasurementTable = "events" | "alerts" | "faults";

const clampLimit = (limit: number | undefined) => Math.min(limit || 50, 200);

const makeMeasurementApi = (table: MeasurementTable) => ({
  async create(payload: Omit<MeasurementPayload, "message_type"> & { message_type?: string }) {
    const { message_type: _omit, ...row } = payload as any;
    const { data, error } = await supabase.from(table).insert(row).select().single();

    if (error) return fail("DB_ERROR", error.message);
    return ok(data);
  },

  async list(filter: RangeQuery & { node_id?: string } = {}) {
    let query = supabase.from(table).select("*").order("timestamp", { ascending: false }) as any;

    if (filter.node_id) query = query.eq("node_id", filter.node_id);
    query = applyRange(query, filter);

    const { data, error } = await query;
    if (error) return fail("DB_ERROR", error.message);

    return ok(data);
  },

  async byNode(node_id: string, range: RangeQuery = {}) {
    return this.list({ ...range, node_id });
  },
});

const flattenSummaryPayload = (payload: SummaryMqttPayload) => ({
  schema_name: payload.schema || "terrarium-diagnosis.v1",
  node_id: payload.node_id,
  timestamp_ms: payload.timestamp_ms,
  state: payload.state,
  state_changed: payload.state_changed ?? false,
  qos: payload.qos ?? 0,
  retain: payload.retain ?? false,
  message_expiry_ms: payload.message_expiry_ms ?? 30000,

  ready: payload.summary.ready ?? false,
  window_sample_count: payload.summary.window_sample_count ?? 0,
  window_capacity: payload.summary.window_capacity ?? 0,

  hot_surface_temp_ok: payload.summary.hot_surface_temp_c?.ok ?? false,
  hot_surface_temp_count: payload.summary.hot_surface_temp_c?.sample_count ?? null,
  hot_surface_temp_avg: payload.summary.hot_surface_temp_c?.average ?? null,
  hot_surface_temp_min: payload.summary.hot_surface_temp_c?.min ?? null,
  hot_surface_temp_max: payload.summary.hot_surface_temp_c?.max ?? null,

  hot_air_temp_ok: payload.summary.hot_air_temp_c?.ok ?? false,
  hot_air_temp_count: payload.summary.hot_air_temp_c?.sample_count ?? null,
  hot_air_temp_avg: payload.summary.hot_air_temp_c?.average ?? null,
  hot_air_temp_min: payload.summary.hot_air_temp_c?.min ?? null,
  hot_air_temp_max: payload.summary.hot_air_temp_c?.max ?? null,

  cool_air_temp_ok: payload.summary.cool_air_temp_c?.ok ?? false,
  cool_air_temp_count: payload.summary.cool_air_temp_c?.sample_count ?? null,
  cool_air_temp_avg: payload.summary.cool_air_temp_c?.average ?? null,
  cool_air_temp_min: payload.summary.cool_air_temp_c?.min ?? null,
  cool_air_temp_max: payload.summary.cool_air_temp_c?.max ?? null,

  light_level_ok: payload.summary.light_level?.ok ?? false,
  light_level_count: payload.summary.light_level?.sample_count ?? null,
  light_level_avg: payload.summary.light_level?.average ?? null,
  light_level_min: payload.summary.light_level?.min ?? null,
  light_level_max: payload.summary.light_level?.max ?? null,

  temp_gradient_ok: payload.summary.temp_gradient_c?.ok ?? false,
  temp_gradient_count: payload.summary.temp_gradient_c?.sample_count ?? null,
  temp_gradient_avg: payload.summary.temp_gradient_c?.average ?? null,
  temp_gradient_min: payload.summary.temp_gradient_c?.min ?? null,
  temp_gradient_max: payload.summary.temp_gradient_c?.max ?? null,

  heat_source_state_ok: payload.heat_source.state_ok ?? false,
  heat_source_on: payload.heat_source.on ?? null,
  heat_source_on_duration_ms: payload.heat_source.on_duration_ms ?? null,

  usable_for_diagnosis: payload.sensor_status.usable_for_diagnosis,
  response_failure: payload.sensor_status.response_failure,
  missing_value: payload.sensor_status.missing_value,
  out_of_range_value: payload.sensor_status.out_of_range_value,
  persistent_out_of_range_value: payload.sensor_status.persistent_out_of_range_value,
  repeated_value: payload.sensor_status.repeated_value,
  hot_surface_ok: payload.sensor_status.hot_surface_ok,
  hot_air_ok: payload.sensor_status.hot_air_ok,
  cool_air_ok: payload.sensor_status.cool_air_ok,
  light_ok: payload.sensor_status.light_ok,
});

export const summaryApi = {
  async create(payload: SummaryMqttPayload): Promise<ApiResponse<SummaryCreateResponse>> {
    const parsed = SummaryDto.safeParse(payload);
    if (!parsed.success) {
      return fail("INVALID_PAYLOAD", "summary payload가 SummaryDto와 일치하지 않음");
    }

    const row = flattenSummaryPayload(parsed.data as SummaryMqttPayload);
    const { data, error } = await (supabase.from("summaries") as any)
      .insert(row)
      .select("id, received_at")
      .single();

    if (error) return fail("DB_ERROR", error.message);
    return ok(data as unknown as SummaryCreateResponse);
  },

  async list(filter: SummaryQuery = {}): Promise<ApiResponse<SummaryRecord[]>> {
    let query = supabase
      .from("summaries")
      .select("*")
      .order("received_at", { ascending: false })
      .limit(clampLimit(filter.limit)) as any;

    if (filter.node_id) query = query.eq("node_id", filter.node_id);

    const { data, error } = await query;
    if (error) return fail("DB_ERROR", error.message);

    return ok(data as SummaryRecord[]);
  },

  async byNode(node_id: string, filter: Omit<SummaryQuery, "node_id"> = {}): Promise<ApiResponse<SummaryRecord[]>> {
    return this.list({ ...filter, node_id });
  },
};

export const eventApi = makeMeasurementApi("events");
export const alertApi = makeMeasurementApi("alerts");
export const faultApi = makeMeasurementApi("faults");
