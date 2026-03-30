/**
 * Register Page - 注册页
 */
import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export default function RegisterPage() {
  const [, navigate] = useLocation();
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    company: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) {
      toast.error("请填写必填信息");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("两次密码输入不一致");
      return;
    }
    setLoading(true);
    try {
      const ok = await register(form);
      if (ok) {
        toast.success("注册成功！");
        navigate("/dashboard");
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

          <h1 className="text-2xl font-bold text-gray-900 mb-1">创建账户</h1>
          <p className="text-sm text-gray-500 mb-8">免费试用14天，无需信用卡</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">姓名 *</Label>
                <Input
                  value={form.name}
                  onChange={handleChange("name")}
                  placeholder="您的姓名"
                  className="h-10 border-gray-200 focus:border-indigo-400"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-sm font-medium text-gray-700">公司名称</Label>
                <Input
                  value={form.company}
                  onChange={handleChange("company")}
                  placeholder="公司名称"
                  className="h-10 border-gray-200 focus:border-indigo-400"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">邮箱 *</Label>
              <Input
                type="email"
                value={form.email}
                onChange={handleChange("email")}
                placeholder="your@company.com"
                className="h-10 border-gray-200 focus:border-indigo-400"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">密码 *</Label>
              <Input
                type="password"
                value={form.password}
                onChange={handleChange("password")}
                placeholder="至少8位字符"
                className="h-10 border-gray-200 focus:border-indigo-400"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-sm font-medium text-gray-700">确认密码 *</Label>
              <Input
                type="password"
                value={form.confirmPassword}
                onChange={handleChange("confirmPassword")}
                placeholder="再次输入密码"
                className="h-10 border-gray-200 focus:border-indigo-400"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold mt-2"
            >
              {loading ? (
                <><Loader2 className="mr-2 w-4 h-4 animate-spin" />注册中...</>
              ) : "免费注册"}
            </Button>
          </form>

          <div className="mt-4 space-y-2">
            {["14天免费试用，无需信用卡", "数据安全隔离保障", "随时可以取消"].map((item) => (
              <div key={item} className="flex items-center gap-2 text-xs text-gray-500">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
                {item}
              </div>
            ))}
          </div>

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
