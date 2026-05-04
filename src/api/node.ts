import { supabase, ok, fail } from "./client";
import type { ApiResponse, Node, NodeCreate, NodeUpdate } from "./types";

export const nodeApi = {
  async list(): Promise<ApiResponse<Node[]>> {
    const { data, error } = await supabase
      .from("nodes")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) return fail("DB_ERROR", error.message);
    return ok(data as Node[]);
  },

  async get(node_id: string): Promise<ApiResponse<Node>> {
    const { data, error } = await supabase
      .from("nodes")
      .select("*")
      .eq("node_id", node_id)
      .maybeSingle();

    if (error) return fail("DB_ERROR", error.message);
    if (!data) return fail("NODE_NOT_FOUND", `node_id '${node_id}'을 찾을 수 없음`);

    return ok(data as Node);
  },

  async create(payload: NodeCreate): Promise<ApiResponse<Node>> {
    const { data, error } = await supabase
      .from("nodes")
      .insert(payload)
      .select()
      .single();

    if (error) {
      if (error.code === "23505") return fail("DUPLICATE", "이미 존재하는 node_id");
      return fail("DB_ERROR", error.message);
    }

    return ok(data as Node);
  },

  async update(node_id: string, patch: NodeUpdate): Promise<ApiResponse<Node>> {
    const { data, error } = await supabase
      .from("nodes")
      .update(patch)
      .eq("node_id", node_id)
      .select()
      .maybeSingle();

    if (error) return fail("DB_ERROR", error.message);
    if (!data) return fail("NODE_NOT_FOUND", `node_id '${node_id}'을 찾을 수 없음`);

    return ok(data as Node);
  },

  async remove(node_id: string): Promise<ApiResponse<{ node_id: string }>> {
    const { error } = await supabase.from("nodes").delete().eq("node_id", node_id);

    if (error) return fail("DB_ERROR", error.message);
    return ok({ node_id });
  },
};
