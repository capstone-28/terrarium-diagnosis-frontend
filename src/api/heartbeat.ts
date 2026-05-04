import { applyRange, fail, ok, supabase } from "./client";
import type { ApiResponse, NodeState, RangeQuery } from "./types";

export const heartbeatApi = {
  async ingest(node_id: string, timestamp: string): Promise<ApiResponse<{ node_id: string; received_at: string }>> {
    const { data: nodeRow } = await supabase
      .from("nodes")
      .select("node_id, last_seen_at")
      .eq("node_id", node_id)
      .maybeSingle();

    if (!nodeRow) return fail("NODE_NOT_FOUND", `node_id '${node_id}' 없음`);

    const { data: lastFault } = await supabase
      .from("faults")
      .select("timestamp")
      .eq("node_id", node_id)
      .order("timestamp", { ascending: false })
      .limit(1)
      .maybeSingle();

    const { error } = await supabase.from("heartbeats").insert({ node_id, timestamp });
    if (error) return fail("DB_ERROR", error.message);

    await supabase.from("nodes").update({ last_seen_at: timestamp }).eq("node_id", node_id);

    if (lastFault) {
      await supabase.from("mode_transitions").insert({
        node_id,
        timestamp,
        from_state: "device_fault" as NodeState,
        to_state: "normal" as NodeState,
        reason: "heartbeat 복귀",
      });
    }

    return ok({ node_id, received_at: new Date().toISOString() });
  },

  async latest(node_id: string) {
    const { data, error } = await supabase
      .from("heartbeats")
      .select("*")
      .eq("node_id", node_id)
      .order("timestamp", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) return fail("DB_ERROR", error.message);
    return ok(data);
  },

  async history(node_id: string, range: RangeQuery = {}) {
    let query = supabase
      .from("heartbeats")
      .select("*")
      .eq("node_id", node_id)
      .order("timestamp", { ascending: false }) as any;

    query = applyRange(query, range);

    const { data, error } = await query;
    if (error) return fail("DB_ERROR", error.message);

    return ok(data);
  },
};
