import { createContext, useCallback, useContext, useEffect, useRef, useState, ReactNode } from "react";

export type DiagnosticState = "normal" | "warning" | "critical" | "device_fault";
export type SensorHealthStatus = "normal" | "no_response" | "fixed_value" | "out_of_range";
export type OperationMode = "평시" | "진단";

export interface SensorData {
  hotSurface: number;
  hotAir: number;
  coolAir: number;
  heaterOn: boolean;
  gradient: number;
  lMatch: number;
  lGrad: number;
  lSafety: number;
  lDevice: number;
  sFinal: number;
  state: DiagnosticState;
  mode: OperationMode;
  samplingPeriod: number;
  timestamp: Date;
  sensorHealth: {
    surface: SensorHealthStatus;
    hotAir: SensorHealthStatus;
    coolAir: SensorHealthStatus;
    heater: "normal" | "no_response";
  };
}

export interface HistoryPoint {
  time: string;
  surface: number;
  hotAir: number;
  coolAir: number;
  gradient: number;
}

export interface LogEntry {
  time: string;
  type: "SUMMARY" | "EVENT" | "ALERT" | "FAULT" | "HEARTBEAT";
  qos: number;
  expiry: string;
  message: string;
}

export interface TransitionEntry {
  time: string;
  from: DiagnosticState;
  to: DiagnosticState;
  reason: string;
}

export interface SensorStats {
  min: number;
  max: number;
  avg: number;
}

interface SimContextType {
  current: SensorData;
  history: HistoryPoint[];
  logs: LogEntry[];
  transitions: TransitionEntry[];
  sparkSurface: number[];
  sparkHotAir: number[];
  sparkCoolAir: number[];
  stats: { surface: SensorStats; hotAir: SensorStats; coolAir: SensorStats; gradient: SensorStats };
  toggleHeater: () => void;
}

const SimContext = createContext<SimContextType | null>(null);

export const useSimulation = () => {
  const ctx = useContext(SimContext);
  if (!ctx) throw new Error("useSimulation must be used within SimProvider");
  return ctx;
};

function computeDiagnostics(hotSurface: number, hotAir: number, coolAir: number, heaterOn: boolean, lDevice: number) {
  const gradient = +(hotAir - coolAir).toFixed(1);

  let lSafety = 0;
  if (hotSurface >= 48) lSafety = 2;
  else if (hotSurface >= 43) lSafety = 1;

  let lGrad = 0;
  if (gradient < 5) lGrad = 2;
  else if (gradient < 8) lGrad = 1;

  let lMatch = 0;
  if (heaterOn && hotSurface < 35) lMatch = 2;
  else if (heaterOn && hotSurface < 38) lMatch = 1;

  if (lDevice > 0) {
    return { lMatch, lGrad, lSafety, lDevice, sFinal: -1, state: "device_fault" as DiagnosticState, gradient };
  }

  const sFinal = Math.max(lMatch, lGrad, lSafety);
  const state: DiagnosticState = sFinal === 0 ? "normal" : sFinal === 1 ? "warning" : "critical";
  return { lMatch, lGrad, lSafety, lDevice, sFinal, state, gradient };
}

function formatTime(d: Date) {
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}:${d.getSeconds().toString().padStart(2, "0")}`;
}

function shortTime(d: Date) {
  return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
}

function walk(value: number, min: number, max: number, step = 0.3): number {
  const delta = (Math.random() - 0.5) * 2 * step;
  return Math.max(min, Math.min(max, +(value + delta).toFixed(1)));
}

function computeStats(arr: number[]): SensorStats {
  if (arr.length === 0) return { min: 0, max: 0, avg: 0 };
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const avg = arr.reduce((a, b) => a + b, 0) / arr.length;
  return { min: +min.toFixed(1), max: +max.toFixed(1), avg: +avg.toFixed(1) };
}

function freeWalk(prev: Pick<SensorData, "hotSurface" | "hotAir" | "coolAir" | "heaterOn">) {
  return {
    hotSurface: walk(prev.hotSurface, 36, 50, prev.heaterOn ? 0.35 : 0.2),
    hotAir: walk(prev.hotAir, 30, 42, 0.3),
    coolAir: walk(prev.coolAir, 22, 30, 0.2),
  };
}

function mqttPolicyFor(state: DiagnosticState) {
  if (state === "normal") return { type: "SUMMARY" as const, qos: 0, expiry: "30s" };
  if (state === "warning") return { type: "EVENT" as const, qos: 1, expiry: "300s" };
  if (state === "device_fault") return { type: "FAULT" as const, qos: 1, expiry: "600s" };
  return { type: "ALERT" as const, qos: 1, expiry: "1800s" };
}

const initialLogs: LogEntry[] = [
  { time: "09:30:02", type: "HEARTBEAT", qos: 0, expiry: "60s", message: "heartbeat | node=ESP32-NODE-001 | uptime=3d14h | state=normal" },
  { time: "09:29:32", type: "SUMMARY", qos: 0, expiry: "30s", message: "summary | surface 41.8°C | hotAir 35.9°C | coolAir 25.7°C | G 10.2°C" },
  { time: "09:29:02", type: "SUMMARY", qos: 0, expiry: "30s", message: "summary | surface 41.6°C | hotAir 35.7°C | coolAir 25.6°C | G 10.1°C" },
];

export const SimProvider = ({ children }: { children: ReactNode }) => {
  const [current, setCurrent] = useState<SensorData>({
    hotSurface: 41.8,
    hotAir: 35.9,
    coolAir: 25.7,
    heaterOn: true,
    gradient: 10.2,
    lMatch: 0,
    lGrad: 0,
    lSafety: 0,
    lDevice: 0,
    sFinal: 0,
    state: "normal",
    mode: "평시",
    samplingPeriod: 180,
    timestamp: new Date(),
    sensorHealth: { surface: "normal", hotAir: "normal", coolAir: "normal", heater: "normal" },
  });

  const [history, setHistory] = useState<HistoryPoint[]>(() => {
    const pts: HistoryPoint[] = [];
    const now = Date.now();

    for (let i = 30; i >= 0; i--) {
      const t = new Date(now - i * 60000);
      const surface = 40 + Math.random() * 3;
      const hotAir = 34 + Math.random() * 3;
      const coolAir = 24 + Math.random() * 2;

      pts.push({
        time: shortTime(t),
        surface: +surface.toFixed(1),
        hotAir: +hotAir.toFixed(1),
        coolAir: +coolAir.toFixed(1),
        gradient: +(hotAir - coolAir).toFixed(1),
      });
    }

    return pts;
  });

  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [transitions, setTransitions] = useState<TransitionEntry[]>([]);
  const [sparkSurface, setSparkSurface] = useState<number[]>([41, 41.2, 41.5, 41.3, 41.6, 41.8, 41.5, 41.8]);
  const [sparkHotAir, setSparkHotAir] = useState<number[]>([35, 35.3, 35.5, 35.8, 35.6, 35.4, 35.7, 35.9]);
  const [sparkCoolAir, setSparkCoolAir] = useState<number[]>([25.5, 25.3, 25.6, 25.4, 25.7, 25.5, 25.6, 25.7]);

  const prevState = useRef<DiagnosticState>("normal");
  const consecutiveCount = useRef(0);
  const heartbeatCounter = useRef(0);

  const stats = {
    surface: computeStats(history.slice(-30).map((h) => h.surface)),
    hotAir: computeStats(history.slice(-30).map((h) => h.hotAir)),
    coolAir: computeStats(history.slice(-30).map((h) => h.coolAir)),
    gradient: computeStats(history.slice(-30).map((h) => h.gradient)),
  };

  const toggleHeater = useCallback(() => {
    setCurrent((p) => ({ ...p, heaterOn: !p.heaterOn }));
  }, []);

  const tick = useCallback(() => {
    setCurrent((prev) => {
      const now = new Date();
      const walked = freeWalk(prev);
      const diag = computeDiagnostics(walked.hotSurface, walked.hotAir, walked.coolAir, prev.heaterOn, 0);

      let finalState = prev.state;
      let mode = prev.mode;
      let samplingPeriod = prev.samplingPeriod;

      if (diag.state !== prevState.current) consecutiveCount.current = 1;
      else consecutiveCount.current++;
      prevState.current = diag.state;

      const shouldTransition =
        (diag.state === "normal" && prev.state !== "normal" && consecutiveCount.current >= 3) ||
        (diag.state !== "normal" && prev.state === "normal" && consecutiveCount.current >= 2) ||
        (diag.state === "critical" && diag.lSafety === 2);

      if (shouldTransition && diag.state !== finalState) {
        const oldState = finalState;
        finalState = diag.state;
        mode = finalState === "normal" ? "평시" : "진단";
        samplingPeriod = finalState === "normal" ? 180 : 30;

        const reasons: string[] = [];
        if (diag.lMatch > 0) reasons.push(`L_match=${diag.lMatch}`);
        if (diag.lGrad > 0) reasons.push(`L_grad=${diag.lGrad} (G=${diag.gradient.toFixed(1)}°C)`);
        if (diag.lSafety > 0) reasons.push(`L_safety=${diag.lSafety} (${walked.hotSurface.toFixed(1)}°C)`);
        if (finalState === "normal") reasons.push("정상 복귀 3회 연속");

        setTransitions((t) => [
          { time: shortTime(now), from: oldState, to: finalState, reason: reasons.join(" | ") },
          ...t.slice(0, 14),
        ]);

        const policy = mqttPolicyFor(finalState);
        setLogs((l) => [
          {
            time: formatTime(now),
            type: policy.type,
            qos: policy.qos,
            expiry: policy.expiry,
            message: `state ${oldState} -> ${finalState} | surface ${walked.hotSurface.toFixed(1)}°C | G ${diag.gradient.toFixed(1)}°C | ${reasons.join(" | ")}`,
          },
          ...l.slice(0, 29),
        ]);
      }

      heartbeatCounter.current++;
      if (heartbeatCounter.current % 5 === 0) {
        setLogs((l) => [
          {
            time: formatTime(now),
            type: "HEARTBEAT",
            qos: 0,
            expiry: "60s",
            message: `heartbeat | node=ESP32-NODE-001 | uptime=3d14h | state=${finalState}`,
          },
          ...l.slice(0, 29),
        ]);
      }

      if (finalState === "normal" && now.getSeconds() % 10 <= 1) {
        setLogs((l) => [
          {
            time: formatTime(now),
            type: "SUMMARY",
            qos: 0,
            expiry: "30s",
            message: `summary | surface ${walked.hotSurface.toFixed(1)}°C | hotAir ${walked.hotAir.toFixed(1)}°C | coolAir ${walked.coolAir.toFixed(1)}°C | G ${diag.gradient.toFixed(1)}°C`,
          },
          ...l.slice(0, 29),
        ]);
      }

      const next: SensorData = {
        hotSurface: walked.hotSurface,
        hotAir: walked.hotAir,
        coolAir: walked.coolAir,
        heaterOn: prev.heaterOn,
        gradient: diag.gradient,
        lMatch: diag.lMatch,
        lGrad: diag.lGrad,
        lSafety: diag.lSafety,
        lDevice: 0,
        sFinal: diag.sFinal,
        state: finalState,
        mode,
        samplingPeriod,
        timestamp: now,
        sensorHealth: { surface: "normal", hotAir: "normal", coolAir: "normal", heater: "normal" },
      };

      setHistory((h) => [...h.slice(-59), { time: shortTime(now), surface: next.hotSurface, hotAir: next.hotAir, coolAir: next.coolAir, gradient: next.gradient }]);
      setSparkSurface((s) => [...s.slice(-7), next.hotSurface]);
      setSparkHotAir((s) => [...s.slice(-7), next.hotAir]);
      setSparkCoolAir((s) => [...s.slice(-7), next.coolAir]);

      return next;
    });
  }, []);

  useEffect(() => {
    const id = setInterval(tick, 2000);
    return () => clearInterval(id);
  }, [tick]);

  return (
    <SimContext.Provider
      value={{
        current,
        history,
        logs,
        transitions,
        sparkSurface,
        sparkHotAir,
        sparkCoolAir,
        stats,
        toggleHeater,
      }}
    >
      {children}
    </SimContext.Provider>
  );
};
