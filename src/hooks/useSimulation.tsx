import { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";

export type DiagnosticState = "normal" | "warning" | "critical" | "device_fault";
export type SensorHealthStatus = "normal" | "no_response" | "fixed_value" | "out_of_range";
export type ScenarioType = "free" | "normal_heating" | "surface_delay" | "surface_overheat" | "gradient_collapse";
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
  mode: "평시" | "진단";
  samplingPeriod: number;
  timestamp: Date;
  sensorHealth: {
    surface: "normal" | "no_response" | "fixed_value" | "out_of_range";
    hotAir: "normal" | "no_response" | "fixed_value" | "out_of_range";
    coolAir: "normal" | "no_response" | "fixed_value" | "out_of_range";
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
  scenario: ScenarioType;
  setScenario: (s: ScenarioType) => void;
  toggleHeater: () => void;
  triggerDeviceFault: (type: "none" | "no_response" | "fixed_value" | "out_of_range") => void;
  deviceFaultType: "none" | "no_response" | "fixed_value" | "out_of_range";
}

const SimContext = createContext<SimContextType | null>(null);

export const useSimulation = () => {
  const ctx = useContext(SimContext);
  if (!ctx) throw new Error("useSimulation must be used within SimProvider");
  return ctx;
};

function computeDiagnostics(
  hotSurface: number, hotAir: number, coolAir: number,
  heaterOn: boolean, lDevice: number
) {
  const G = hotAir - coolAir;

  let lSafety = 0;
  if (hotSurface >= 48) lSafety = 2;
  else if (hotSurface >= 43) lSafety = 1;

  let lGrad = 0;
  if (G < 5) lGrad = 2;
  else if (G < 8) lGrad = 1;

  let lMatch = 0;
  if (heaterOn && hotSurface < 35) lMatch = 2;
  else if (heaterOn && hotSurface < 38) lMatch = 1;

  // Device fault overrides
  if (lDevice > 0) {
    return { lMatch, lGrad, lSafety, lDevice, sFinal: -1, state: "device_fault" as DiagnosticState, gradient: G };
  }

  const sFinal = Math.max(lMatch, lGrad, lSafety);
  const state: DiagnosticState = sFinal === 0 ? "normal" : sFinal === 1 ? "warning" : "critical";

  return { lMatch, lGrad, lSafety, lDevice, sFinal, state, gradient: G };
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

// Scenario-specific walk functions
function scenarioWalk(scenario: ScenarioType, prev: { hotSurface: number; hotAir: number; coolAir: number; heaterOn: boolean }) {
  switch (scenario) {
    case "normal_heating":
      return {
        hotSurface: walk(prev.hotSurface, 39, 42, 0.2),
        hotAir: walk(prev.hotAir, 33, 37, 0.2),
        coolAir: walk(prev.coolAir, 24, 27, 0.15),
        heaterOn: true,
      };
    case "surface_delay":
      return {
        hotSurface: walk(prev.hotSurface, 30, 36, 0.3), // surface stays low despite heater ON
        hotAir: walk(prev.hotAir, 28, 33, 0.2),
        coolAir: walk(prev.coolAir, 24, 27, 0.15),
        heaterOn: true,
      };
    case "surface_overheat":
      return {
        hotSurface: walk(prev.hotSurface, 44, 52, 0.5), // surface goes dangerously high
        hotAir: walk(prev.hotAir, 36, 42, 0.3),
        coolAir: walk(prev.coolAir, 24, 28, 0.2),
        heaterOn: true,
      };
    case "gradient_collapse":
      return {
        hotSurface: walk(prev.hotSurface, 38, 42, 0.2),
        hotAir: walk(prev.hotAir, 27, 30, 0.2), // hot air drops
        coolAir: walk(prev.coolAir, 26, 30, 0.2), // cool air rises
        heaterOn: true,
      };
    default: // "free"
      return {
        hotSurface: walk(prev.hotSurface, 36, 50, 0.4),
        hotAir: walk(prev.hotAir, 30, 42, 0.3),
        coolAir: walk(prev.coolAir, 22, 30, 0.2),
        heaterOn: prev.heaterOn,
      };
  }
}

export const SimProvider = ({ children }: { children: ReactNode }) => {
  const [scenario, setScenario] = useState<ScenarioType>("free");
  const [deviceFaultType, setDeviceFaultType] = useState<"none" | "no_response" | "fixed_value" | "out_of_range">("none");
  const fixedValueRef = useRef<number | null>(null);

  const [current, setCurrent] = useState<SensorData>({
    hotSurface: 41.8, hotAir: 35.9, coolAir: 25.7, heaterOn: true,
    gradient: 10.2, lMatch: 0, lGrad: 0, lSafety: 0, lDevice: 0, sFinal: 0,
    state: "normal", mode: "평시", samplingPeriod: 180, timestamp: new Date(),
    sensorHealth: { surface: "normal", hotAir: "normal", coolAir: "normal", heater: "normal" },
  });

  const [history, setHistory] = useState<HistoryPoint[]>(() => {
    const pts: HistoryPoint[] = [];
    const now = Date.now();
    for (let i = 30; i >= 0; i--) {
      const t = new Date(now - i * 60000);
      const s = 40 + Math.random() * 3;
      const h = 34 + Math.random() * 3;
      const c = 24 + Math.random() * 2;
      pts.push({
        time: `${t.getHours().toString().padStart(2, "0")}:${t.getMinutes().toString().padStart(2, "0")}`,
        surface: +s.toFixed(1), hotAir: +h.toFixed(1), coolAir: +c.toFixed(1), gradient: +(h - c).toFixed(1),
      });
    }
    return pts;
  });

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [transitions, setTransitions] = useState<TransitionEntry[]>([]);
  const [sparkSurface, setSparkSurface] = useState<number[]>([41, 41.2, 41.5, 41.3, 41.6, 41.8, 41.5, 41.8]);
  const [sparkHotAir, setSparkHotAir] = useState<number[]>([35, 35.3, 35.5, 35.8, 35.6, 35.4, 35.7, 35.9]);
  const [sparkCoolAir, setSparkCoolAir] = useState<number[]>([25.5, 25.3, 25.6, 25.4, 25.7, 25.5, 25.6, 25.7]);

  const prevState = useRef<DiagnosticState>("normal");
  const consecutiveCount = useRef(0);
  const heartbeatCounter = useRef(0);

  const toggleHeater = useCallback(() => {
    setCurrent((p) => ({ ...p, heaterOn: !p.heaterOn }));
  }, []);

  const triggerDeviceFault = useCallback((type: "none" | "no_response" | "fixed_value" | "out_of_range") => {
    setDeviceFaultType(type);
    if (type === "fixed_value") fixedValueRef.current = null;
  }, []);

  // Compute stats from history
  const stats = {
    surface: computeStats(history.slice(-30).map((h) => h.surface)),
    hotAir: computeStats(history.slice(-30).map((h) => h.hotAir)),
    coolAir: computeStats(history.slice(-30).map((h) => h.coolAir)),
    gradient: computeStats(history.slice(-30).map((h) => h.gradient)),
  };

  const tick = useCallback(() => {
    setCurrent((prev) => {
      const now = new Date();
      let { hotSurface, hotAir, coolAir, heaterOn } = scenarioWalk(scenario, prev);

      // Apply device fault effects
      let lDevice = 0;
      let sensorHealth: SensorData["sensorHealth"] = { surface: "normal", hotAir: "normal", coolAir: "normal", heater: "normal" };

      if (deviceFaultType === "no_response") {
        hotSurface = prev.hotSurface; // frozen
        sensorHealth.surface = "no_response";
        lDevice = 1;
      } else if (deviceFaultType === "fixed_value") {
        if (fixedValueRef.current === null) fixedValueRef.current = hotSurface;
        hotSurface = fixedValueRef.current; // stuck at same value
        sensorHealth.surface = "fixed_value";
        lDevice = 1;
      } else if (deviceFaultType === "out_of_range") {
        hotSurface = -10 + Math.random() * 2; // clearly out of range
        sensorHealth.surface = "out_of_range";
        lDevice = 1;
      }

      const diag = computeDiagnostics(hotSurface, hotAir, coolAir, heaterOn, lDevice);

      let finalState = prev.state;
      let mode = prev.mode;
      let samplingPeriod = prev.samplingPeriod;

      if (diag.state !== prevState.current) {
        consecutiveCount.current = 1;
      } else {
        consecutiveCount.current++;
      }
      prevState.current = diag.state;

      const ds = diag.state as string;
      const shouldTransition =
        (ds === "device_fault") ||
        (ds === "normal" && prev.state !== "normal" && consecutiveCount.current >= 3) ||
        (ds !== "normal" && ds !== "device_fault" && prev.state === "normal" && consecutiveCount.current >= 2) ||
        (ds === "critical" && diag.lSafety === 2);
      if (shouldTransition && diag.state !== finalState) {
        const oldState = finalState;
        finalState = diag.state;
        mode = finalState === "normal" ? "평시" : "진단";
        samplingPeriod = finalState === "normal" ? 180 : 30;

        const reasons: string[] = [];
        if (diag.lMatch > 0) reasons.push(`L_match=${diag.lMatch}`);
        if (diag.lGrad > 0) reasons.push(`L_grad=${diag.lGrad} (G=${diag.gradient.toFixed(1)}°C)`);
        if (diag.lSafety > 0) reasons.push(`L_safety=${diag.lSafety} (${hotSurface.toFixed(1)}°C)`);
        if (diag.lDevice > 0) reasons.push(`L_device: 센서 이상 (${deviceFaultType})`);
        if (finalState === "normal") reasons.push("정상 복귀 (3회 연속)");

        setTransitions((t) => [
          { time: shortTime(now), from: oldState, to: finalState, reason: reasons.join(" | ") },
          ...t.slice(0, 14),
        ]);

        const logType = finalState === "device_fault" ? "FAULT" as const :
                        finalState === "normal" ? "SUMMARY" as const :
                        finalState === "warning" ? "EVENT" as const : "ALERT" as const;
        const qos = finalState === "normal" ? 0 : finalState === "warning" ? 1 : 2;
        const expiry = finalState === "normal" ? "30s" : finalState === "warning" ? "300s" : "∞";
        setLogs((l) => [
          {
            time: formatTime(now), type: logType, qos, expiry,
            message: `상태 전이: ${oldState}→${finalState} | surface ${hotSurface.toFixed(1)}°C | G: ${diag.gradient.toFixed(1)} | ${reasons.join(" | ")}`,
          },
          ...l.slice(0, 29),
        ]);
      } else {
        finalState = prev.state;
      }

      // Periodic logs
      if (finalState === "normal" && now.getSeconds() % 10 === 0) {
        setLogs((l) => [
          {
            time: formatTime(now), type: "SUMMARY", qos: 0, expiry: "30s",
            message: `요약 | surface ${hotSurface.toFixed(1)}°C | hotAir ${hotAir.toFixed(1)}°C | coolAir ${coolAir.toFixed(1)}°C | G: ${diag.gradient.toFixed(1)}`,
          },
          ...l.slice(0, 29),
        ]);
      }

      // Heartbeat every 5 ticks (~10s)
      heartbeatCounter.current++;
      if (heartbeatCounter.current % 5 === 0) {
        setLogs((l) => [
          {
            time: formatTime(now), type: "HEARTBEAT", qos: 0, expiry: "60s",
            message: `heartbeat | node=ESP32-NODE-001 | uptime=3d14h | state=${finalState}`,
          },
          ...l.slice(0, 29),
        ]);
      }

      return {
        hotSurface, hotAir, coolAir, heaterOn,
        gradient: diag.gradient, lMatch: diag.lMatch, lGrad: diag.lGrad,
        lSafety: diag.lSafety, lDevice: diag.lDevice, sFinal: diag.sFinal,
        state: finalState, mode, samplingPeriod, timestamp: now, sensorHealth,
      };
    });

    setCurrent((c) => {
      const now = new Date();
      setHistory((h) => [
        ...h.slice(-59),
        { time: shortTime(now), surface: c.hotSurface, hotAir: c.hotAir, coolAir: c.coolAir, gradient: c.gradient },
      ]);
      setSparkSurface((s) => [...s.slice(-7), c.hotSurface]);
      setSparkHotAir((s) => [...s.slice(-7), c.hotAir]);
      setSparkCoolAir((s) => [...s.slice(-7), c.coolAir]);
      return c;
    });
  }, [scenario, deviceFaultType]);

  useEffect(() => {
    const id = setInterval(tick, 2000);
    return () => clearInterval(id);
  }, [tick]);

  return (
    <SimContext.Provider value={{
      current, history, logs, transitions, sparkSurface, sparkHotAir, sparkCoolAir,
      stats, scenario, setScenario, toggleHeater, triggerDeviceFault, deviceFaultType,
    }}>
      {children}
    </SimContext.Provider>
  );
};
