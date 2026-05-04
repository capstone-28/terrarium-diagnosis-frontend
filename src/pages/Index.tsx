import { useState } from "react";
import { Menu, PanelRight } from "lucide-react";
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
import { AnimalModeModal } from "@/components/dashboard/AnimalModeModal";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const Index = () => {
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);

  return (
    <SimProvider>
      <AlertNotification />
      <AnimalModeModal />
      <div className="flex min-h-screen bg-background">
        {/* Desktop sidebar */}
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          {/* Mobile top bar with menu toggles */}
          <div className="lg:hidden flex items-center justify-between px-3 h-12 bg-card border-b border-border">
            <Sheet open={leftOpen} onOpenChange={setLeftOpen}>
              <SheetTrigger asChild>
                <button className="p-2 rounded-md hover:bg-secondary" aria-label="메뉴">
                  <Menu className="w-5 h-5 text-foreground" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-[260px] bg-sidebar border-sidebar-border">
                <Sidebar />
              </SheetContent>
            </Sheet>
            <span className="text-sm font-bold text-foreground">ThermoGuard</span>
            <Sheet open={rightOpen} onOpenChange={setRightOpen}>
              <SheetTrigger asChild>
                <button className="p-2 rounded-md hover:bg-secondary" aria-label="패널">
                  <PanelRight className="w-5 h-5 text-foreground" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="p-4 w-[300px] overflow-y-auto">
                <RightPanel />
              </SheetContent>
            </Sheet>
          </div>

          <HeaderBar />
          <div className="flex flex-1 overflow-hidden">
            <main className="flex-1 p-3 lg:p-4 space-y-4 overflow-y-auto min-w-0">
              <ScenarioControl />
              <TemperatureCards />
              <TemperatureChart />
              <StatsPanel />
              <MqttLog />
            </main>
            {/* Desktop right panel */}
            <div className="hidden xl:block p-4 border-l border-border">
              <RightPanel />
            </div>
          </div>
        </div>
      </div>
    </SimProvider>
  );
};

export default Index;
