import { useState } from "react";
import { BarChart3, LayoutDashboard, Menu, MessageSquare, PanelRight } from "lucide-react";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { HeaderBar } from "@/components/dashboard/HeaderBar";
import { TemperatureCards } from "@/components/dashboard/TemperatureCards";
import { TemperatureChart } from "@/components/dashboard/TemperatureChart";
import { MqttLog } from "@/components/dashboard/MqttLog";
import { RightPanel } from "@/components/dashboard/RightPanel";
import { AlertNotification } from "@/components/dashboard/AlertNotification";
import { StatsPanel } from "@/components/dashboard/StatsPanel";
import { SimProvider } from "@/hooks/useSimulation";
import { AnimalModeModal } from "@/components/dashboard/AnimalModeModal";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

type TabKey = "main" | "log" | "stats";

const tabs: { key: TabKey; label: string; Icon: React.ElementType }[] = [
  { key: "main", label: "관제", Icon: LayoutDashboard },
  { key: "log", label: "메시지", Icon: MessageSquare },
  { key: "stats", label: "리포트", Icon: BarChart3 },
];

const Index = () => {
  const [leftOpen, setLeftOpen] = useState(false);
  const [rightOpen, setRightOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("main");

  return (
    <SimProvider>
      <AlertNotification />
      <AnimalModeModal />
      <div className="flex min-h-screen bg-background">
        <div className="hidden lg:block">
          <Sidebar />
        </div>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex h-12 items-center justify-between border-b border-border bg-card px-3 lg:hidden">
            <Sheet open={leftOpen} onOpenChange={setLeftOpen}>
              <SheetTrigger asChild>
                <button className="rounded-md p-2 hover:bg-secondary" aria-label="메뉴 열기">
                  <Menu className="h-5 w-5 text-foreground" />
                </button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[260px] border-sidebar-border bg-sidebar p-0">
                <Sidebar />
              </SheetContent>
            </Sheet>
            <span className="text-sm font-bold text-foreground">ThermoGuard</span>
            <Sheet open={rightOpen} onOpenChange={setRightOpen}>
              <SheetTrigger asChild>
                <button className="rounded-md p-2 hover:bg-secondary" aria-label="진단 패널 열기">
                  <PanelRight className="h-5 w-5 text-foreground" />
                </button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[320px] overflow-y-auto p-4">
                <RightPanel />
              </SheetContent>
            </Sheet>
          </div>

          <HeaderBar />

          <div className="flex items-center gap-1 border-b border-border bg-background px-4 pt-3">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-2 rounded-t-md px-4 py-2 text-sm font-medium transition-colors ${
                  activeTab === tab.key
                    ? "border border-b-0 border-border bg-card text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <tab.Icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex flex-1 overflow-hidden">
            <main className="min-w-0 flex-1 space-y-4 overflow-y-auto p-3 lg:p-5">
              {activeTab === "main" && (
                <>
                  <TemperatureCards />
                  <TemperatureChart />
                </>
              )}
              {activeTab === "log" && <MqttLog />}
              {activeTab === "stats" && <StatsPanel />}
            </main>

            {activeTab === "main" && (
              <div className="hidden border-l border-border p-4 xl:block">
                <RightPanel />
              </div>
            )}
          </div>
        </div>
      </div>
    </SimProvider>
  );
};

export default Index;
