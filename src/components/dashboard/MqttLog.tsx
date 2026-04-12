import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { useSimulation } from "@/hooks/useSimulation";

type LogType = "SUMMARY" | "EVENT" | "ALERT" | "FAULT" | "HEARTBEAT";

const typeColors: Record<LogType, string> = {
  SUMMARY: "bg-success/20 text-success",
  EVENT: "bg-warning/20 text-warning",
  ALERT: "bg-danger/20 text-danger",
  FAULT: "bg-purple/20 text-purple",
  HEARTBEAT: "bg-info/20 text-info",
};

const tabs: (LogType | "전체")[] = ["전체", "SUMMARY", "EVENT", "ALERT", "FAULT", "HEARTBEAT"];

export const MqttLog = () => {
  const [activeTab, setActiveTab] = useState<LogType | "전체">("전체");
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
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-semibold text-foreground">MQTT 메시지 로그</h3>
          <span className="text-[10px] text-muted-foreground">(MQTT v5.0)</span>
          <span className="w-2 h-2 rounded-full bg-success animate-pulse-glow" />
        </div>
        <div className="flex bg-secondary rounded overflow-hidden">
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

      <div className="space-y-0 max-h-52 overflow-y-auto">
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground py-4 text-center">대기 중... 곧 로그가 수신됩니다</p>
        )}
        {filtered.map((log, i) => (
          <div key={i} className="log-entry">
            <span className="text-[10px] text-muted-foreground font-mono whitespace-nowrap shrink-0">
              {log.time}
            </span>
            <span className={`status-badge ${typeColors[log.type]} text-[10px] shrink-0`}>
              {log.type}
            </span>
            <span className="text-[10px] text-muted-foreground shrink-0">Q{log.qos}</span>
            <span className="text-[10px] text-muted-foreground shrink-0">{log.expiry}</span>
            <span className="text-xs text-secondary-foreground">{log.message}</span>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 mt-3 pt-2 border-t border-border">
        {Object.entries(counts).map(([type, count]) => (
          <span key={type} className="text-[10px]">
            <span className={type === "SUMMARY" ? "text-success" : type === "EVENT" ? "text-warning" : type === "ALERT" ? "text-danger" : "text-muted-foreground"}>
              {type}
            </span>{" "}
            <span className="text-muted-foreground">{count}건</span>
          </span>
        ))}
        <span className="text-[10px] text-muted-foreground ml-auto">
          QoS: summary=0 | event=1 | alert=2 | fault=2
        </span>
      </div>
    </div>
  );
};
