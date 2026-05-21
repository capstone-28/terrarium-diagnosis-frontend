import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { z } from "zod";
import { toast } from "sonner";
import { ArrowLeft, Loader2, Lock, Mail, Thermometer } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable/index";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAnimalMode } from "@/hooks/useAnimalMode";

const emailSchema = z.string().trim().email({ message: "올바른 이메일을 입력해주세요." }).max(255);
const passwordSchema = z.string().min(6, { message: "비밀번호는 6자 이상이어야 합니다." }).max(72);

const Auth = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { profile } = useAnimalMode();

  const [tab, setTab] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, authLoading, navigate]);

  const validate = () => {
    const e = emailSchema.safeParse(email);
    if (!e.success) {
      toast.error(e.error.issues[0].message);
      return false;
    }
    const p = passwordSchema.safeParse(password);
    if (!p.success) {
      toast.error(p.error.issues[0].message);
      return false;
    }
    return true;
  };

  const handleLogin = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setSubmitting(false);
    if (error) {
      toast.error(error.message.toLowerCase().includes("invalid") ? "이메일 또는 비밀번호가 올바르지 않습니다." : error.message);
      return;
    }
    toast.success("로그인되었습니다.");
    navigate("/dashboard", { replace: true });
  };

  const handleSignup = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/dashboard` },
    });
    setSubmitting(false);
    if (error) {
      toast.error(error.message.toLowerCase().includes("already") ? "이미 가입된 이메일입니다. 로그인해 주세요." : error.message);
      return;
    }
    toast.success("회원가입이 완료되었습니다. 이메일 인증 후 로그인해 주세요.");
    setTab("login");
  };

  const handleGoogle = async () => {
    setSubmitting(true);
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: `${window.location.origin}/dashboard`,
    });
    if (result.error) {
      setSubmitting(false);
      toast.error("Google 로그인에 실패했습니다.");
      return;
    }
    if (result.redirected) return;
    navigate("/dashboard", { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          돌아가기
        </Link>

        <div className="rounded-lg border border-border bg-card p-8 shadow-lg">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Thermometer className="h-6 w-6" />
            </div>
            <h1 className="text-xl font-bold text-foreground">{profile.name}</h1>
            <p className="mt-1 text-xs text-muted-foreground">{profile.subtitle}</p>
          </div>

          <Tabs value={tab} onValueChange={(v) => setTab(v as "login" | "signup")}>
            <TabsList className="mb-6 grid w-full grid-cols-2">
              <TabsTrigger value="login">로그인</TabsTrigger>
              <TabsTrigger value="signup">회원가입</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="login-email" className="text-xs">이메일</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="login-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="login-password" className="text-xs">비밀번호</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="login-password" type="password" placeholder="******" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" required />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  로그인
                </Button>
              </form>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignup} className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="signup-email" className="text-xs">이메일</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="signup-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" required />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="signup-password" className="text-xs">비밀번호 (6자 이상)</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input id="signup-password" type="password" placeholder="******" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-9" required />
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={submitting}>
                  {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  회원가입
                </Button>
              </form>
            </TabsContent>
          </Tabs>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-[11px] uppercase">
              <span className="bg-card px-2 text-muted-foreground">또는</span>
            </div>
          </div>

          <Button type="button" variant="outline" className="w-full" onClick={handleGoogle} disabled={submitting}>
            Google로 계속하기
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Auth;
