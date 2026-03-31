/**
 * Login Page - 登录页
 * 支持两种登录方式：邮箱密码 / 手机验证码
 */
import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Eye, EyeOff, ArrowLeft, Loader2, Mail, Phone } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type LoginMode = "email" | "phone";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { login } = useAuth();

  const [mode, setMode] = useState<LoginMode>("email");

  // Email mode
  const [email, setEmail] = useState("demo@hule.ai");
  const [password, setPassword] = useState("demo123");
  const [showPwd, setShowPwd] = useState(false);

  // Phone mode
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const handleSendCode = () => {
    if (!phone || phone.length < 11) {
      toast.error("请输入正确的手机号");
      return;
    }
    setCodeSent(true);
    setCountdown(60);
    toast.success(`验证码已发送至 ${phone}`);
    timerRef.current = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "email") {
      if (!email || !password) { toast.error("请填写邮箱和密码"); return; }
    } else {
      if (!phone) { toast.error("请输入手机号"); return; }
      if (!code) { toast.error("请输入验证码"); return; }
    }
    setLoading(true);
    try {
      // For phone mode, use a demo shortcut; for email use real auth
      const loginEmail = mode === "phone" ? "demo@hule.ai" : email;
      const loginPwd = mode === "phone" ? "demo123" : password;
      const ok = await login(loginEmail, loginPwd);
      if (ok) {
        toast.success("登录成功，欢迎回来！");
        navigate("/dashboard");
      }
    } catch {
      toast.error("登录失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-100 rounded-full opacity-30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-100 rounded-full opacity-30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Back to landing */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </button>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                葫乐<span className="ai-gradient-text">AI</span>
              </div>
              <div className="text-xs text-gray-400">智能招聘平台</div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">欢迎回来</h1>
          <p className="text-sm text-gray-500 mb-6">登录您的账户，继续智能招聘之旅</p>

          {/* Mode Tabs */}
          <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
            <button
              type="button"
              onClick={() => setMode("email")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === "email"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Mail className="w-3.5 h-3.5" />
              邮箱登录
            </button>
            <button
              type="button"
              onClick={() => setMode("phone")}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all ${
                mode === "phone"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Phone className="w-3.5 h-3.5" />
              手机验证码
            </button>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {mode === "email" ? (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">邮箱</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                    className="h-11 border-gray-200 focus:border-indigo-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-medium text-gray-700">密码</Label>
                    <button type="button" className="text-xs text-indigo-600 hover:text-indigo-700">
                      忘记密码？
                    </button>
                  </div>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPwd ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="输入密码"
                      className="h-11 border-gray-200 focus:border-indigo-400 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd(!showPwd)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-sm font-medium text-gray-700">手机号</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                    placeholder="请输入手机号"
                    className="h-11 border-gray-200 focus:border-indigo-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="code" className="text-sm font-medium text-gray-700">验证码</Label>
                  <div className="flex gap-2">
                    <Input
                      id="code"
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="请输入6位验证码"
                      className="h-11 border-gray-200 focus:border-indigo-400 flex-1"
                    />
                    <button
                      type="button"
                      onClick={handleSendCode}
                      disabled={countdown > 0}
                      className={`h-11 px-4 rounded-xl text-sm font-medium whitespace-nowrap transition-all border ${
                        countdown > 0
                          ? "bg-gray-50 text-gray-400 border-gray-200 cursor-not-allowed"
                          : "bg-indigo-50 text-indigo-600 border-indigo-200 hover:bg-indigo-100"
                      }`}
                    >
                      {countdown > 0 ? `${countdown}s` : "获取验证码"}
                    </button>
                  </div>
                  {codeSent && countdown > 0 && (
                    <p className="text-xs text-gray-400">验证码已发送，请注意查收短信</p>
                  )}
                </div>
              </>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-100"
            >
              {loading ? (
                <><Loader2 className="mr-2 w-4 h-4 animate-spin" />登录中...</>
              ) : "登录"}
            </Button>
          </form>

          {/* Demo hint */}
          <div className="mt-4 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
            <p className="text-xs text-indigo-700 text-center">
              <span className="font-semibold">演示账号：</span>demo@hule.ai / demo123
              <span className="mx-2 text-indigo-300">|</span>
              手机号任意输入验证码 <span className="font-semibold">123456</span>
            </p>
          </div>

          <div className="mt-6 text-center">
            <span className="text-sm text-gray-500">还没有账号？</span>
            <button
              onClick={() => navigate("/register")}
              className="ml-1 text-sm text-indigo-600 font-semibold hover:text-indigo-700"
            >
              免费注册
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
