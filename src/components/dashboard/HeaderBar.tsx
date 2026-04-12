import { Settings, Maximize2, Radio } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useSimulation } from "@/hooks/useSimulation";

export const HeaderBar = () => {
  const [now, setNow] = useState(new Date());
  const navigate = useNavigate();
  const { current } = useSimulation();

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = now.getHours();
  const minutes = now.getMinutes().toString().padStart(2, "0");
  const seconds = now.getSeconds().toString().padStart(2, "0");
  const period = hours >= 12 ? "오후" : "오전";
  const displayHour = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;

  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekdays = ["일", "월", "화", "수", "목", "금", "토"];
  const weekday = weekdays[now.getDay()];

  const stateColor = current.state === "normal" ? "bg-success/15 text-success glow-green" :
                     current.state === "warning" ? "bg-warning/15 text-warning" :
                     "bg-danger/15 text-danger";
  const stateLabel = current.state === "normal" ? "Normal — 정상 운영 중" :
                     current.state === "warning" ? "Warning — 경고 상태" :
                     current.state === "critical" ? "Critical — 위험 상태" : "Device Fault";

  const modeColor = current.mode === "평시" ? "bg-primary/15 text-primary glow-cyan" : "bg-warning/15 text-warning";

  return (
    <header className="h-14 bg-card border-b border-border flex items-center justify-between px-6">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">{period}</span>
          <span className="text-xl font-mono font-bold text-foreground">
            {displayHour}:{minutes}:{seconds}
          </span>
        </div>
        <span className="text-xs text-muted-foreground">{year}년 {month}월 {day}일 {weekday}</span>

        <div className={`status-badge ${stateColor}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${current.state === "normal" ? "bg-success" : current.state === "warning" ? "bg-warning" : "bg-danger"} animate-pulse-glow`} />
          {stateLabel}
        </div>

        <div className={`status-badge ${modeColor}`}>
          <Radio className="w-3 h-3" />
          {current.mode} 모드
          <span className="text-[10px] text-muted-foreground ml-1">({current.samplingPeriod}초 주기)</span>
        </div>

        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>온도구배 G <span className="font-mono font-semibold text-foreground">{current.gradient.toFixed(1)}°C</span></span>
          <span className={current.gradient >= 8 ? "text-success font-medium" : current.gradient >= 5 ? "text-warning font-medium" : "text-danger font-medium"}>
            {current.gradient >= 8 ? "정상" : current.gradient >= 5 ? "경고" : "위험"}
          </span>
          <span>열원 <span className={`font-mono font-semibold ${current.heaterOn ? "text-success" : "text-danger"}`}>{current.heaterOn ? "ON" : "OFF"}</span></span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => {
            if (document.fullscreenElement) {
              document.exitFullscreen();
            } else {
              document.documentElement.requestFullscreen();
            }
          }}
          className="p-2 rounded-md hover:bg-secondary transition-colors"
          title="전체화면"
        >
          <Maximize2 className="w-4 h-4 text-muted-foreground" />
        </button>
        <button
          onClick={() => navigate("/settings")}
          className="p-2 rounded-md hover:bg-secondary transition-colors"
          title="설정"
        >
          <Settings className="w-4 h-4 text-muted-foreground" />
        </button>
      </div>
    </header>
  );
};
