export * from "./types";
export * from "./client";
export * from "./node";
export * from "./heartbeat";
export * from "./measurement";
export * from "./dashboard";
export * from "./dto/common.dto";
export * from "./dto/heartbeat.dto";
export * from "./dto/event.dto";
export * from "./dto/alert.dto";
export * from "./dto/summary.dto";
export * from "./dto/fault.dto";

import { nodeApi } from "./node";
import { heartbeatApi } from "./heartbeat";
import { summaryApi, eventApi, alertApi, faultApi } from "./measurement";
import { transitionsApi, dashboardApi } from "./dashboard";

export const api = {
  nodes: nodeApi,
  heartbeat: heartbeatApi,
  summary: summaryApi,
  event: eventApi,
  alert: alertApi,
  fault: faultApi,
  transitions: transitionsApi,
  dashboard: dashboardApi,
};
