import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { useSimulation } from "@/hooks/useSimulation";

type LogType = "SUMMARY" | "EVENT" | "ALERT" | "FAULT" | "HEARTBEAT";
type TabType = LogType | "전체";

const typeColors: Record<LogType, string> = {
  SUMMARY: "bg-success/20 text-success",
  EVENT: "bg-warning/20 text-warning",
  ALERT: "bg-danger/20 text-danger",
  FAULT: "bg-purple/20 text-purple",
  HEARTBEAT: "bg-info/20 text-info",
};

const tabs: TabType[] = ["전체", "SUMMARY", "EVENT", "ALERT", "FAULT", "HEARTBEAT"];

export const MqttLog = () => {
  const [activeTab, setActiveTab] = useState<TabType>("전체");
  const { logs } = useSimulation();

  const filtered = activeTab === "전체" ? logs : logs.filter((l) => l.type === activeTab);

  const counts = {
    SUMMARY: logs.filter((l) => l.type === "SUMMARY").length,
    EVENT: logs.filter((l) => l.type === "EVENT").length,
    ALERT: logs.filter((l) => l.type === "ALERT").length,
    FAULT: logs.filter((l) => l.type === "FAULT").length,
  };

  return (
    <div className="sensor-card">
      <div className="mb-3 flex flex-col justify-between gap-3 lg:flex-row lg:items-center">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">MQTT 메시지 로그</h3>
          <span className="text-[10px] text-muted-foreground">(MQTT v5.0)</span>
          <span className="h-2 w-2 rounded-full bg-success animate-pulse-glow" />
        </div>
        <div className="flex flex-wrap overflow-hidden rounded bg-secondary">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-3 py-1 text-[10px] font-medium transition-colors ${
                activeTab === tab ? "bg-card text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <div className="max-h-[420px] overflow-y-auto">
        {filtered.length === 0 && <p className="py-6 text-center text-xs text-muted-foreground">수신 대기 중입니다. 곧 로그가 표시됩니다.</p>}
        {filtered.map((log, i) => (
          <div key={`${log.time}-${i}`} className="log-entry">
            <span className="shrink-0 whitespace-nowrap font-mono text-[10px] text-muted-foreground">{log.time}</span>
            <span className={`status-badge shrink-0 text-[10px] ${typeColors[log.type]}`}>{log.type}</span>
            <span className="shrink-0 text-[10px] text-muted-foreground">Q{log.qos}</span>
            <span className="shrink-0 text-[10px] text-muted-foreground">{log.expiry}</span>
            <span className="text-xs text-secondary-foreground">{log.message}</span>
          </div>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-border pt-2">
        {Object.entries(counts).map(([type, count]) => (
          <span key={type} className="text-[10px]">
            <span className={type === "SUMMARY" ? "text-success" : type === "EVENT" ? "text-warning" : type === "ALERT" ? "text-danger" : "text-muted-foreground"}>
              {type}
            </span>{" "}
            <span className="text-muted-foreground">{count}건</span>
          </span>
        ))}
        <span className="ml-auto text-[10px] text-muted-foreground">QoS: summary=0 | event=1 | alert=1 | fault=1</span>
      </div>
    </div>
  );
};
