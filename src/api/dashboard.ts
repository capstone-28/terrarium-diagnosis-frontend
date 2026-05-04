import { HEARTBEAT_OFFLINE_SEC, applyRange, fail, ok, supabase } from "./client";
import type {
  ApiResponse,
  DashboardOverview,
  ModeTransition,
  RangeQuery,
  TemperatureTrendPoint,
} from "./types";

export const transitionsApi = {
  async byNode(node_id: string): Promise<ApiResponse<ModeTransition[]>> {
    const { data, error } = await supabase
      .from("mode_transitions")
      .select("*")
      .eq("node_id", node_id)
      .order("timestamp", { ascending: false });

    if (error) return fail("DB_ERROR", error.message);
    return ok(data as ModeTransition[]);
  },

  async diagnosticEntries(node_id: string): Promise<ApiResponse<ModeTransition[]>> {
    const { data, error } = await supabase
      .from("mode_transitions")
      .select("*")
      .eq("node_id", node_id)
      .in("to_state", ["warning", "critical", "device_fault"])
      .order("timestamp", { ascending: false });

    if (error) return fail("DB_ERROR", error.message);
    return ok(data as ModeTransition[]);
  },
};

export const dashboardApi = {
  async overview(): Promise<ApiResponse<DashboardOverview>> {
    const { data: nodes, error: nodesError } = await supabase
      .from("nodes")
      .select("node_id, last_seen_at");

    if (nodesError) return fail("DB_ERROR", nodesError.message);

    const now = Date.now();
    let online = 0;

    for (const node of nodes ?? []) {
      const lastSeen = node.last_seen_at ? new Date(node.last_seen_at).getTime() : 0;
      if (now - lastSeen <= HEARTBEAT_OFFLINE_SEC * 1000) online += 1;
    }

    const since = new Date(now - 5 * 60 * 1000).toISOString();
    const [{ count: warnings }, { count: criticals }, { count: faults }] = await Promise.all([
      supabase.from("events").select("*", { count: "exact", head: true }).gte("timestamp", since),
      supabase.from("alerts").select("*", { count: "exact", head: true }).gte("timestamp", since),
      supabase.from("faults").select("*", { count: "exact", head: true }).gte("timestamp", since),
    ]);

    return ok({
      total_nodes: nodes?.length ?? 0,
      online_nodes: online,
      offline_nodes: (nodes?.length ?? 0) - online,
      active_warnings: warnings ?? 0,
      active_criticals: criticals ?? 0,
      active_faults: faults ?? 0,
    });
  },

  async temperatureTrend(node_id: string, range: RangeQuery = {}): Promise<ApiResponse<TemperatureTrendPoint[]>> {
    let query = supabase
      .from("summaries")
      .select("timestamp, surface_temp_c, hot_air_temp_c, cool_air_temp_c")
      .eq("node_id", node_id)
      .order("timestamp", { ascending: true }) as any;

    query = applyRange(query, range);

    const { data, error } = await query;
    if (error) return fail("DB_ERROR", error.message);

    return ok(data as TemperatureTrendPoint[]);
  },

  async gradientChanges(node_id: string, range: RangeQuery = {}) {
    const result = await this.temperatureTrend(node_id, range);
    if (!result.ok) return result;

    return ok(
      result.data.map((point) => ({
        timestamp: point.timestamp,
        gradient:
          point.hot_air_temp_c != null && point.cool_air_temp_c != null
            ? Number((point.hot_air_temp_c - point.cool_air_temp_c).toFixed(2))
            : null,
      }))
    );
  },

  async diagnosticModeEntries() {
    const { data, error } = await supabase
      .from("mode_transitions")
      .select("*")
      .in("to_state", ["warning", "critical", "device_fault"])
      .order("timestamp", { ascending: false })
      .limit(100);

    if (error) return fail("DB_ERROR", error.message);
    return ok(data);
  },

  async nodeSensorStatus() {
    const { data, error } = await supabase
      .from("nodes")
      .select("node_id, name, location, last_seen_at");

    if (error) return fail("DB_ERROR", error.message);
    return ok(data);
  },

  async latest() {
    const { data: nodes, error } = await supabase.from("nodes").select("*");
    if (error) return fail("DB_ERROR", error.message);

    const results = await Promise.all(
      (nodes ?? []).map(async (node) => {
        const { data: latest } = await supabase
          .from("summaries")
          .select("*")
          .eq("node_id", node.node_id)
          .order("timestamp", { ascending: false })
          .limit(1)
          .maybeSingle();

        return { node, latest };
      })
    );

    return ok(results);
  },
};
