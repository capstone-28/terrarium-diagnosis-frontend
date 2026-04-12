import { BarChart3, Wifi } from "lucide-react";
import { useSimulation, DiagnosticState } from "@/hooks/useSimulation";

const mqttPolicy: { state: string; topic: string; qos: number; expiry: string; purpose: string; color: string }[] = [
  { state: "normal", topic: "summary", qos: 0, expiry: "30초", purpose: "평상시 환경 요약", color: "text-success" },
  { state: "warning", topic: "event", qos: 1, expiry: "300초", purpose: "이상 징후 알림", color: "text-warning" },
  { state: "critical", topic: "alert", qos: 2, expiry: "∞", purpose: "즉시 대응 경고", color: "text-danger" },
  { state: "device_fault", topic: "fault", qos: 2, expiry: "∞", purpose: "장치 이상 보고", color: "text-purple-400" },
];

export const StatsPanel = () => {
  const { stats, current } = useSimulation();

  const activePolicy = mqttPolicy.find((p) => p.state === current.state) || mqttPolicy[0];

  return (
    <div className="flex gap-4">
      {/* Statistics */}
      <div className="sensor-card flex-1">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-primary" />
          최근 구간 통계 (30샘플)
        </h3>
        <div className="grid grid-cols-4 gap-3">
          {([
            { label: "표면온도", data: stats.surface, unit: "°C" },
            { label: "온열 공기", data: stats.hotAir, unit: "°C" },
            { label: "냉각 공기", data: stats.coolAir, unit: "°C" },
            { label: "온도구배 G", data: stats.gradient, unit: "°C" },
          ]).map((item) => (
            <div key={item.label} className="bg-secondary/50 rounded-lg p-2.5">
              <p className="text-[10px] text-muted-foreground mb-1.5">{item.label}</p>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">최솟값</span>
                  <span className="font-mono text-info">{item.data.min}{item.unit}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">평균값</span>
                  <span className="font-mono text-foreground font-semibold">{item.data.avg}{item.unit}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">최댓값</span>
                  <span className="font-mono text-danger">{item.data.max}{item.unit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* MQTT Policy */}
      <div className="sensor-card w-80">
        <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
          <Wifi className="w-4 h-4 text-primary" />
          MQTT 적응형 전송 정책
        </h3>
        <table className="w-full text-[10px]">
          <thead>
            <tr className="text-muted-foreground border-b border-border/50">
              <th className="text-left py-1 font-medium">상태</th>
              <th className="text-left py-1 font-medium">토픽</th>
              <th className="text-center py-1 font-medium">QoS</th>
              <th className="text-center py-1 font-medium">유효기간</th>
            </tr>
          </thead>
          <tbody>
            {mqttPolicy.map((p) => (
              <tr
                key={p.state}
                className={`border-b border-border/30 ${p.state === current.state ? "bg-primary/5" : ""}`}
              >
                <td className={`py-1.5 font-medium ${p.color}`}>
                  {p.state === current.state && <span className="mr-1">▶</span>}
                  {p.state}
                </td>
                <td className="py-1.5 font-mono">{p.topic}</td>
                <td className="py-1.5 text-center font-mono">{p.qos}</td>
                <td className="py-1.5 text-center font-mono">{p.expiry}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="text-[9px] text-muted-foreground mt-2">
          현재: <span className={`font-medium ${activePolicy.color}`}>{activePolicy.topic}</span> — {activePolicy.purpose}
        </p>
      </div>
    </div>
  );
};
