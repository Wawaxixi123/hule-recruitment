/**
 * Login Page - 登录页
 * Design: Clean white card, indigo accent, minimal
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, Eye, EyeOff, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("demo@hule.ai");
  const [password, setPassword] = useState("demo123");
  const [showPwd, setShowPwd] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("请填写邮箱和密码");
      return;
    }
    setLoading(true);
    try {
      const ok = await login(email, password);
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
          <p className="text-sm text-gray-500 mb-8">登录您的账户，继续智能招聘之旅</p>

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-sm font-medium text-gray-700">邮箱</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="h-11 border-gray-200 focus:border-indigo-400 focus:ring-indigo-100"
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
                  className="h-11 border-gray-200 focus:border-indigo-400 focus:ring-indigo-100 pr-10"
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

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-lg shadow-indigo-100"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  登录中...
                </>
              ) : (
                "登录"
              )}
            </Button>
          </form>

          {/* Demo hint */}
          <div className="mt-4 p-3 bg-indigo-50 rounded-xl border border-indigo-100">
            <p className="text-xs text-indigo-700 text-center">
              <span className="font-semibold">演示账号：</span>demo@hule.ai / demo123
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

        {/* Social proof */}
        <p className="text-center text-xs text-gray-400 mt-6">
          已有 <span className="font-semibold text-gray-600">500+</span> 家企业使用葫乐AI提升招聘效率
        </p>
      </div>
    </div>
  );
}
