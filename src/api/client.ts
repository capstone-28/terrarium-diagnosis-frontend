import { supabase } from "@/integrations/supabase/client";
import type { ApiResponse, RangeQuery } from "./types";

export { supabase };

export const HEARTBEAT_OFFLINE_SEC = 60;

export const ok = <T,>(data: T): ApiResponse<T> => ({ ok: true, data });

export const fail = (code: string, message: string): ApiResponse<never> =>
  ({ ok: false, error: { code, message } } as ApiResponse<never>);

export function applyRange<T extends { gte: any; lte: any; limit: any }>(
  query: T,
  { from, to, limit }: RangeQuery = {}
) {
  let next = query;

  if (from) next = next.gte("timestamp", from);
  if (to) next = next.lte("timestamp", to);
  if (limit) next = next.limit(limit);

  return next;
}
