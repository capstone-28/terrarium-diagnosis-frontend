import { ArrowLeft, Bell, Monitor, Thermometer, Wifi, Shield, Info, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "lizardguard-settings";

interface AppSettings {
  alertSound: boolean;
  alertToast: boolean;
  darkMode: boolean;
  autoRefresh: boolean;
  tSurfaceWarn: number;
  tSurfaceCrit: number;
  gWarn: number;
  gCrit: number;
  normalPeriod: number;
  diagPeriod: number;
  mqttBroker: string;
  nodeName: string;
}

const defaultSettings: AppSettings = {
  alertSound: true,
  alertToast: true,
  darkMode: true,
  autoRefresh: true,
  tSurfaceWarn: 43,
  tSurfaceCrit: 48,
  gWarn: 8,
  gCrit: 5,
  normalPeriod: 180,
  diagPeriod: 30,
  mqttBroker: "mqtt.lizardguard.local",
  nodeName: "LG-NODE-001",
};

export function loadSettings(): AppSettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { ...defaultSettings, ...JSON.parse(raw) };
  } catch {}
  return defaultSettings;
}

function saveSettings(s: AppSettings) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
}

const SettingSection = ({ icon: Icon, title, children }: { icon: React.ElementType; title: string; children: React.ReactNode }) => (
  <div className="bg-card border border-border rounded-lg p-5">
    <div className="flex items-center gap-2 mb-4">
      <Icon className="w-4 h-4 text-primary" />
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
    </div>
    <div className="space-y-3">{children}</div>
  </div>
);

const ToggleRow = ({ label, desc, value, onChange }: { label: string; desc: string; value: boolean; onChange: (v: boolean) => void }) => (
  <div className="flex items-center justify-between py-2">
    <div>
      <p className="text-xs font-medium text-foreground">{label}</p>
      <p className="text-[10px] text-muted-foreground">{desc}</p>
    </div>
    <button
      onClick={() => onChange(!value)}
      className={`w-9 h-5 rounded-full transition-colors relative ${value ? "bg-primary" : "bg-muted"}`}
    >
      <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${value ? "left-[18px]" : "left-0.5"}`} />
    </button>
  </div>
);

const NumberRow = ({ label, desc, value, unit, onChange }: { label: string; desc: string; value: number; unit: string; onChange: (v: number) => void }) => (
  <div className="flex items-center justify-between py-2">
    <div>
      <p className="text-xs font-medium text-foreground">{label}</p>
      <p className="text-[10px] text-muted-foreground">{desc}</p>
    </div>
    <div className="flex items-center gap-1">
      <button onClick={() => onChange(value - 1)} className="w-6 h-6 rounded bg-secondary text-foreground text-xs hover:bg-muted transition-colors">−</button>
      <span className="w-14 text-center text-xs font-mono text-foreground">{value}{unit}</span>
      <button onClick={() => onChange(value + 1)} className="w-6 h-6 rounded bg-secondary text-foreground text-xs hover:bg-muted transition-colors">+</button>
    </div>
  </div>
);

export default function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [saved, setSaved] = useState(true);

  const update = <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };

  const handleSave = () => {
    saveSettings(settings);
    setSaved(true);
    toast.success("설정이 저장되었습니다.");
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/")}
              className="p-2 rounded-md hover:bg-secondary transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-muted-foreground" />
            </button>
            <div>
              <h1 className="text-lg font-bold text-foreground">시스템 설정</h1>
              <p className="text-xs text-muted-foreground">LizardGuard 대시보드 환경설정</p>
            </div>
          </div>
          <button
            onClick={handleSave}
            disabled={saved}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              saved
                ? "bg-muted text-muted-foreground cursor-default"
                : "bg-primary text-primary-foreground hover:opacity-90 shadow-lg"
            }`}
          >
            <Save className="w-4 h-4" />
            {saved ? "저장됨" : "저장"}
          </button>
        </div>

        <div className="grid gap-4">
          <SettingSection icon={Bell} title="알림 설정">
            <ToggleRow label="경고 사운드" desc="상태 전이 시 경고음 재생" value={settings.alertSound} onChange={(v) => update("alertSound", v)} />
            <ToggleRow label="토스트 알림" desc="화면 상단에 알림 메시지 표시" value={settings.alertToast} onChange={(v) => update("alertToast", v)} />
          </SettingSection>

          <SettingSection icon={Monitor} title="화면 설정">
            <ToggleRow label="다크 모드" desc="어두운 테마 사용" value={settings.darkMode} onChange={(v) => update("darkMode", v)} />
            <ToggleRow label="자동 새로고침" desc="데이터 자동 갱신 활성화" value={settings.autoRefresh} onChange={(v) => update("autoRefresh", v)} />
          </SettingSection>

          <SettingSection icon={Thermometer} title="진단 임계값">
            <NumberRow label="T_surface_warn" desc="표면온도 경고 임계값" value={settings.tSurfaceWarn} unit="°C" onChange={(v) => update("tSurfaceWarn", v)} />
            <NumberRow label="T_surface_crit" desc="표면온도 위험 임계값" value={settings.tSurfaceCrit} unit="°C" onChange={(v) => update("tSurfaceCrit", v)} />
            <NumberRow label="G_warn" desc="온도구배 경고 임계값" value={settings.gWarn} unit="°C" onChange={(v) => update("gWarn", v)} />
            <NumberRow label="G_crit" desc="온도구배 위험 임계값" value={settings.gCrit} unit="°C" onChange={(v) => update("gCrit", v)} />
          </SettingSection>

          <SettingSection icon={Shield} title="운영 모드">
            <NumberRow label="평시 보고주기" desc="Normal 상태 데이터 전송 주기" value={settings.normalPeriod} unit="초" onChange={(v) => update("normalPeriod", v)} />
            <NumberRow label="진단 보고주기" desc="Warning/Critical 상태 전송 주기" value={settings.diagPeriod} unit="초" onChange={(v) => update("diagPeriod", v)} />
          </SettingSection>

          <SettingSection icon={Wifi} title="MQTT 연결">
            <div className="py-2">
              <p className="text-xs font-medium text-foreground mb-1">브로커 주소</p>
              <input
                value={settings.mqttBroker}
                onChange={(e) => update("mqttBroker", e.target.value)}
                className="w-full bg-secondary border border-border rounded px-3 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="py-2">
              <p className="text-xs font-medium text-foreground mb-1">노드 이름</p>
              <input
                value={settings.nodeName}
                onChange={(e) => update("nodeName", e.target.value)}
                className="w-full bg-secondary border border-border rounded px-3 py-1.5 text-xs font-mono text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </SettingSection>

          <SettingSection icon={Info} title="시스템 정보">
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              <div><span className="text-muted-foreground">버전:</span> <span className="text-foreground font-mono">v1.0.0</span></div>
              <div><span className="text-muted-foreground">프로토콜:</span> <span className="text-foreground font-mono">MQTT 5.0</span></div>
              <div><span className="text-muted-foreground">펌웨어:</span> <span className="text-foreground font-mono">ESP32-S3 r2</span></div>
              <div><span className="text-muted-foreground">MCU:</span> <span className="text-foreground font-mono">ESP32-S3</span></div>
            </div>
          </SettingSection>
        </div>
      </div>
    </div>
  );
}
