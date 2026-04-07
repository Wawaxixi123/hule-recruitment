/**
 * Register Page - 注册页
 * 支持邮箱密码注册 + 手机验证码注册双模式
 * 禁止出现：14天免费试用/无需信用卡/数据安全隔离保障/随时可以取消
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, ArrowLeft, Loader2, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

type RegisterMode = "email" | "phone";

export default function RegisterPage() {
  const [, navigate] = useLocation();
  const { register } = useAuth();
  const [mode, setMode] = useState<RegisterMode>("phone");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // 邮箱注册表单
  const [emailForm, setEmailForm] = useState({
    name: "",
    email: "",
    company: "",
    password: "",
    confirmPassword: "",
  });

  // 手机注册表单
  const [phoneForm, setPhoneForm] = useState({
    name: "",
    phone: "",
    company: "",
    code: "",
  });
  const [countdown, setCountdown] = useState(0);
  const [codeSent, setCodeSent] = useState(false);

  const handleEmailChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handlePhoneChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setPhoneForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const sendCode = () => {
    if (!phoneForm.phone || phoneForm.phone.length !== 11) {
      toast.error("请输入正确的11位手机号");
      return;
    }
    setCodeSent(true);
    setCountdown(60);
    toast.success("验证码已发送，请查收短信");
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timer); return 0; }
        return c - 1;
      });
    }, 1000);
  };

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailForm.name || !emailForm.email || !emailForm.password) {
      toast.error("请填写必填信息");
      return;
    }
    if (emailForm.password !== emailForm.confirmPassword) {
      toast.error("两次密码输入不一致");
      return;
    }
    if (emailForm.password.length < 8) {
      toast.error("密码至少8位字符");
      return;
    }
    setLoading(true);
    try {
      const ok = await register({
        name: emailForm.name,
        email: emailForm.email,
        company: emailForm.company,
        password: emailForm.password,
      });
      if (ok) {
        toast.success("注册成功！");
        navigate("/horo-ai");
      }
    } catch {
      toast.error("注册失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneForm.name || !phoneForm.phone || !phoneForm.code) {
      toast.error("请填写必填信息");
      return;
    }
    if (phoneForm.code !== "123456") {
      toast.error("验证码错误，演示请输入 123456");
      return;
    }
    setLoading(true);
    try {
      const ok = await register({
        name: phoneForm.name,
        email: `${phoneForm.phone}@phone.hule.ai`,
        company: phoneForm.company,
        password: "phone_register",
      });
      if (ok) {
        toast.success("注册成功！");
        navigate("/horo-ai");
      }
    } catch {
      toast.error("注册失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-indigo-100 rounded-full opacity-30 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-100 rounded-full opacity-30 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-indigo-600 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          返回首页
        </button>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Horo <span className="ai-gradient-text">AI</span>
              </div>
              <div className="text-xs text-gray-400">HORO AI HR · 智能招聘平台</div>
            </div>
          </div>

          <h1 className="text-2xl font-bold text-gray-900 mb-1">创建账户</h1>
          <p className="text-sm text-gray-400 mb-6">开始您的智能招聘之旅</p>

          {/* 模式切换 */}
          <div className="flex bg-gray-50 rounded-xl p-1 mb-6">
            <button
              onClick={() => setMode("email")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === "email"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              邮箱注册
            </button>
            <button
              onClick={() => setMode("phone")}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all ${
                mode === "phone"
                  ? "bg-white text-indigo-700 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              手机验证码
            </button>
          </div>

          {/* 邮箱注册表单 */}
          {mode === "email" && (
            <form onSubmit={handleEmailSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">姓名 *</Label>
                  <Input
                    value={emailForm.name}
                    onChange={handleEmailChange("name")}
                    placeholder="您的姓名"
                    className="h-10 border-gray-200 focus:border-indigo-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">公司名称</Label>
                  <Input
                    value={emailForm.company}
                    onChange={handleEmailChange("company")}
                    placeholder="公司名称"
                    className="h-10 border-gray-200 focus:border-indigo-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">邮箱 *</Label>
                <Input
                  type="email"
                  value={emailForm.email}
                  onChange={handleEmailChange("email")}
                  placeholder="your@company.com"
                  className="h-10 border-gray-200 focus:border-indigo-400"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">密码 *</Label>
                <div className="relative">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={emailForm.password}
                    onChange={handleEmailChange("password")}
                    placeholder="至少8位字符"
                    className="h-10 border-gray-200 focus:border-indigo-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">确认密码 *</Label>
                <div className="relative">
                  <Input
                    type={showConfirm ? "text" : "password"}
                    value={emailForm.confirmPassword}
                    onChange={handleEmailChange("confirmPassword")}
                    placeholder="再次输入密码"
                    className="h-10 border-gray-200 focus:border-indigo-400 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold mt-2"
              >
                {loading ? (
                  <><Loader2 className="mr-2 w-4 h-4 animate-spin" />注册中...</>
                ) : "立即注册"}
              </Button>
            </form>
          )}

          {/* 手机验证码注册表单 */}
          {mode === "phone" && (
            <form onSubmit={handlePhoneSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">姓名 *</Label>
                  <Input
                    value={phoneForm.name}
                    onChange={handlePhoneChange("name")}
                    placeholder="您的姓名"
                    className="h-10 border-gray-200 focus:border-indigo-400"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">公司名称</Label>
                  <Input
                    value={phoneForm.company}
                    onChange={handlePhoneChange("company")}
                    placeholder="公司名称"
                    className="h-10 border-gray-200 focus:border-indigo-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">手机号 *</Label>
                <Input
                  type="tel"
                  value={phoneForm.phone}
                  onChange={handlePhoneChange("phone")}
                  placeholder="请输入11位手机号"
                  maxLength={11}
                  className="h-10 border-gray-200 focus:border-indigo-400"
                />
              </div>

              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">验证码 *</Label>
                <div className="flex gap-2">
                  <Input
                    value={phoneForm.code}
                    onChange={handlePhoneChange("code")}
                    placeholder="输入验证码"
                    maxLength={6}
                    className="h-10 border-gray-200 focus:border-indigo-400 flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    disabled={countdown > 0}
                    onClick={sendCode}
                    className="h-10 px-4 text-sm whitespace-nowrap border-gray-200 text-indigo-600 hover:bg-indigo-50 flex-shrink-0"
                  >
                    {countdown > 0 ? `${countdown}s 后重发` : codeSent ? "重新发送" : "获取验证码"}
                  </Button>
                </div>
                {codeSent && (
                  <p className="text-xs text-gray-400">演示验证码：<span className="font-mono text-indigo-600">123456</span></p>
                )}
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold mt-2"
              >
                {loading ? (
                  <><Loader2 className="mr-2 w-4 h-4 animate-spin" />注册中...</>
                ) : "立即注册"}
              </Button>
            </form>
          )}

          <div className="mt-6 text-center">
            <span className="text-sm text-gray-500">已有账号？</span>
            <button
              onClick={() => navigate("/login")}
              className="ml-1 text-sm text-indigo-600 font-semibold hover:text-indigo-700"
            >
              立即登录
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
