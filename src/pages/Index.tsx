import { Sidebar } from "@/components/dashboard/Sidebar";
import { HeaderBar } from "@/components/dashboard/HeaderBar";
import { TemperatureCards } from "@/components/dashboard/TemperatureCards";
import { TemperatureChart } from "@/components/dashboard/TemperatureChart";
import { MqttLog } from "@/components/dashboard/MqttLog";
import { RightPanel } from "@/components/dashboard/RightPanel";
import { AlertNotification } from "@/components/dashboard/AlertNotification";
import { ScenarioControl } from "@/components/dashboard/ScenarioControl";
import { StatsPanel } from "@/components/dashboard/StatsPanel";
import { SimProvider } from "@/hooks/useSimulation";

const Index = () => {
  return (
    <SimProvider>
      <AlertNotification />
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <HeaderBar />
          <div className="flex flex-1 overflow-hidden">
            <main className="flex-1 p-4 space-y-4 overflow-y-auto">
              <ScenarioControl />
              <TemperatureCards />
              <TemperatureChart />
              <StatsPanel />
              <MqttLog />
            </main>
            <div className="p-4 border-l border-border">
              <RightPanel />
            </div>
          </div>
        </div>
      </div>
    </SimProvider>
  );
};

export default Index;
