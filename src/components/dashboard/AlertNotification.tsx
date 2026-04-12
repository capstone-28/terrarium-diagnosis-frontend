import { useEffect, useRef } from "react";
import { useSimulation, DiagnosticState } from "@/hooks/useSimulation";
import { toast } from "sonner";
import { AlertTriangle, ShieldAlert, ShieldCheck } from "lucide-react";

export const AlertNotification = () => {
  const { current } = useSimulation();
  const prevState = useRef<DiagnosticState>(current.state);

  useEffect(() => {
    if (current.state === prevState.current) return;

    const from = prevState.current;
    const to = current.state;
    prevState.current = to;

    // Play alert sound
    if (to === "warning" || to === "critical" || to === "device_fault") {
      try {
        const ctx = new AudioContext();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        if (to === "critical" || to === "device_fault") {
          // Urgent double beep
          osc.frequency.value = 880;
          gain.gain.value = 0.3;
          osc.start();
          gain.gain.setValueAtTime(0.3, ctx.currentTime);
          gain.gain.setValueAtTime(0, ctx.currentTime + 0.15);
          gain.gain.setValueAtTime(0.3, ctx.currentTime + 0.25);
          gain.gain.setValueAtTime(0, ctx.currentTime + 0.4);
          osc.stop(ctx.currentTime + 0.5);
        } else {
          // Single warning beep
          osc.frequency.value = 660;
          gain.gain.value = 0.2;
          osc.start();
          gain.gain.setValueAtTime(0.2, ctx.currentTime);
          gain.gain.setValueAtTime(0, ctx.currentTime + 0.3);
          osc.stop(ctx.currentTime + 0.4);
        }
      } catch {
        // Audio not supported
      }
    }

    // Toast notification
    if (to === "critical" || to === "device_fault") {
      toast.error(`🚨 위험: 상태 전이 ${from} → ${to}`, {
        description: `T_surface: ${current.hotSurface}°C | G: ${current.gradient}°C | S_final: ${current.sFinal}`,
        duration: 8000,
        icon: <ShieldAlert className="h-5 w-5 text-destructive" />,
      });
    } else if (to === "warning") {
      toast.warning(`⚠️ 경고: 상태 전이 ${from} → ${to}`, {
        description: `T_surface: ${current.hotSurface}°C | G: ${current.gradient}°C | S_final: ${current.sFinal}`,
        duration: 5000,
        icon: <AlertTriangle className="h-5 w-5" />,
      });
    } else if (to === "normal" && (from === "warning" || from === "critical")) {
      toast.success(`✅ 정상 복귀: ${from} → normal`, {
        description: "시스템이 정상 상태로 복귀했습니다.",
        duration: 4000,
        icon: <ShieldCheck className="h-5 w-5" />,
      });
    }
  }, [current.state, current.hotSurface, current.gradient, current.sFinal]);

  return null;
};
