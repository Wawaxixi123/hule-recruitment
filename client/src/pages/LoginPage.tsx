/**
 * Login Page - 登录页
 * 设计参考：注册登录1.png
 * 仅支持：手机号验证码 + 微信登录
 * 风格：白色卡片，渐变紫色背景，品牌色 #4F39F6
 */
import { useState, useRef, useEffect } from "react";
import { useLocation } from "wouter";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Phone, Shield, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { login } = useAuth();

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
        if (prev <= 1) { clearInterval(timerRef.current!); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) { toast.error("请输入手机号"); return; }
    if (!code) { toast.error("请输入验证码"); return; }
    setLoading(true);
    try {
      const ok = await login("demo@hule.ai", "demo123");
      if (ok) {
        toast.success("登录成功，欢迎回来！");
        navigate("/horo-ai");
      }
    } catch {
      toast.error("登录失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #ede9fe 0%, #ddd6fe 40%, #f5f3ff 100%)" }}>

      {/* Background blobs */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-32 -right-32 w-80 h-80 rounded-full opacity-40 blur-3xl"
          style={{ background: "radial-gradient(circle, #c4b5fd, #a78bfa)" }} />
        <div className="absolute -bottom-32 -left-32 w-80 h-80 rounded-full opacity-30 blur-3xl"
          style={{ background: "radial-gradient(circle, #818cf8, #6366f1)" }} />
      </div>

      {/* Card */}
      <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
        style={{ boxShadow: "0 32px 80px rgba(79,57,246,0.15), 0 4px 20px rgba(0,0,0,0.08)" }}>

        {/* Close button */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all z-10"
          style={{ fontSize: "18px" }}
        >×</button>

        <div className="p-8 pt-10">
          {/* Logo */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5"
              style={{ background: "linear-gradient(135deg, #7c6af7 0%, #4F39F6 100%)", boxShadow: "0 8px 24px rgba(79,57,246,0.35)" }}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="11" stroke="white" strokeWidth="2.5"/>
                <path d="M10 16 Q16 10 22 16 Q16 22 10 16Z" fill="white"/>
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-1.5">登录 HORO AI Agent</h1>
            <p className="text-sm text-gray-500 text-center leading-relaxed">
              使用手机号验证码或微信登录，继续当前操作
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            {/* Phone */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">手机号</Label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  placeholder="请输入手机号"
                  className="h-12 pl-10 border-gray-200 rounded-xl focus:border-indigo-400 bg-gray-50 focus:bg-white transition-colors"
                />
              </div>
            </div>

            {/* Code */}
            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">验证码</Label>
              <div className="flex gap-2.5">
                <div className="relative flex-1">
                  <Shield className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    type="text"
                    value={code}
                    onChange={e => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="请输入验证码"
                    className="h-12 pl-10 border-gray-200 rounded-xl focus:border-indigo-400 bg-gray-50 focus:bg-white transition-colors"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleSendCode}
                  disabled={countdown > 0}
                  className="h-12 px-4 rounded-xl text-sm font-semibold whitespace-nowrap transition-all border"
                  style={countdown > 0 ? {
                    background: "#f9fafb", color: "#9ca3af", borderColor: "#e5e7eb", cursor: "not-allowed"
                  } : {
                    background: "#fff", color: "#4F39F6", borderColor: "#4F39F6", cursor: "pointer"
                  }}
                >
                  {countdown > 0 ? `${countdown}s` : "获取验证码"}
                </button>
              </div>
              {codeSent && countdown > 0 && (
                <p className="text-xs text-gray-400">验证码已发送，请注意查收短信</p>
              )}
            </div>

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-12 rounded-xl text-white font-semibold text-base flex items-center justify-center gap-2 transition-all mt-2"
              style={{
                background: "linear-gradient(135deg, #9b8af8 0%, #4F39F6 100%)",
                boxShadow: "0 4px 16px rgba(79,57,246,0.35)",
                opacity: loading ? 0.8 : 1,
              }}
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              登录 / 注册 →
            </button>
          </form>

          {/* Demo hint */}
          <div className="mt-3 p-2.5 rounded-xl border text-center"
            style={{ background: "#f5f3ff", borderColor: "#ddd6fe" }}>
            <p className="text-xs" style={{ color: "#6d28d9" }}>
              演示：任意手机号 + 验证码 <span className="font-bold">123456</span>
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-3 my-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400">或</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* WeChat Login */}
          <button
            type="button"
            onClick={() => toast.info("微信登录功能即将上线")}
            className="w-full h-12 rounded-xl border border-gray-200 bg-white text-gray-700 font-medium text-sm flex items-center justify-center gap-2.5 transition-all hover:border-green-400 hover:text-green-700"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="#07c160">
              <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 01-.023-.156.49.49 0 01.201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-7.062-6.122zm-3.318 2.187c.537 0 .972.44.972.982a.976.976 0 01-.972.983.976.976 0 01-.972-.983c0-.542.435-.982.972-.982zm6.63 0c.537 0 .972.44.972.982a.976.976 0 01-.972.983.976.976 0 01-.972-.983c0-.542.435-.982.972-.982z"/>
            </svg>
            微信登录
          </button>

          {/* Terms */}
          <p className="text-center text-xs text-gray-400 mt-5">
            登录即代表同意
            <a href="#" className="text-indigo-500 hover:text-indigo-600 mx-0.5">《用户协议》</a>
            和
            <a href="#" className="text-indigo-500 hover:text-indigo-600 mx-0.5">《隐私政策》</a>
          </p>
        </div>
      </div>
    </div>
  );
}
