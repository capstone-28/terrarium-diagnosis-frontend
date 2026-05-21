import { BarChart3, Wifi } from "lucide-react";
import { useSimulation } from "@/hooks/useSimulation";
import { useAnimalMode } from "@/hooks/useAnimalMode";

const mqttPolicy: { state: string; topic: string; qos: number; expiry: string; purpose: string; color: string }[] = [
  { state: "normal", topic: "summary", qos: 0, expiry: "30s", purpose: "평상시 환경 요약", color: "text-success" },
  { state: "warning", topic: "event", qos: 1, expiry: "300s", purpose: "이상 징후 알림", color: "text-warning" },
  { state: "critical", topic: "alert", qos: 1, expiry: "1800s", purpose: "즉시 대응 경고", color: "text-danger" },
  { state: "device_fault", topic: "fault", qos: 1, expiry: "600s", purpose: "장치 이상 보고", color: "text-purple" },
];

export const StatsPanel = () => {
  const { stats, current } = useSimulation();
  const { profile } = useAnimalMode();
  const activePolicy = mqttPolicy.find((p) => p.state === current.state) || mqttPolicy[0];

  return (
    <div className="flex flex-col gap-4 xl:flex-row">
      <div className="sensor-card min-w-0 flex-1">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <BarChart3 className="h-4 w-4 text-primary" />
          최근 구간 통계 (30 샘플)
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: profile.surfaceLabel, data: stats.surface, unit: "°C" },
            { label: profile.hotAirLabel, data: stats.hotAir, unit: "°C" },
            { label: profile.coolAirLabel, data: stats.coolAir, unit: "°C" },
            { label: "온도구배 G", data: stats.gradient, unit: "°C" },
          ].map((item) => (
            <div key={item.label} className="rounded-lg bg-secondary/50 p-3">
              <p className="mb-1.5 text-[11px] text-muted-foreground">{item.label}</p>
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">최솟값</span>
                  <span className="font-mono text-info">{item.data.min}{item.unit}</span>
                </div>
                <div className="flex justify-between text-[10px]">
                  <span className="text-muted-foreground">평균값</span>
                  <span className="font-mono font-semibold text-foreground">{item.data.avg}{item.unit}</span>
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

      <div className="sensor-card min-w-0 xl:w-96">
        <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
          <Wifi className="h-4 w-4 text-primary" />
          MQTT 적응형 전송 정책
        </h3>
        <table className="w-full text-[10px]">
          <thead>
            <tr className="border-b border-border/50 text-muted-foreground">
              <th className="py-1 text-left font-medium">상태</th>
              <th className="py-1 text-left font-medium">토픽</th>
              <th className="py-1 text-center font-medium">QoS</th>
              <th className="py-1 text-center font-medium">유효기간</th>
            </tr>
          </thead>
          <tbody>
            {mqttPolicy.map((p) => (
              <tr key={p.state} className={`border-b border-border/30 ${p.state === current.state ? "bg-primary/5" : ""}`}>
                <td className={`py-1.5 font-medium ${p.color}`}>{p.state === current.state ? "● " : ""}{p.state}</td>
                <td className="py-1.5 font-mono">{p.topic}</td>
                <td className="py-1.5 text-center font-mono">{p.qos}</td>
                <td className="py-1.5 text-center font-mono">{p.expiry}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-2 text-[10px] text-muted-foreground">
          현재 정책: <span className={`font-medium ${activePolicy.color}`}>{activePolicy.topic}</span> · {activePolicy.purpose}
        </p>
      </div>
    </div>
  );
};
