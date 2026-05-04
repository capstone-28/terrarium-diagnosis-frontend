import { applyRange, fail, ok, supabase } from "./client";
import type { MeasurementPayload, RangeQuery } from "./types";

type MeasurementTable = "summaries" | "events" | "alerts" | "faults";

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

export const summaryApi = makeMeasurementApi("summaries");
export const eventApi = makeMeasurementApi("events");
export const alertApi = makeMeasurementApi("alerts");
export const faultApi = makeMeasurementApi("faults");
