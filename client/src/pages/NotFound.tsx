import { Brain, Home, ArrowLeft } from "lucide-react";
import { useLocation } from "wouter";

export default function NotFound() {
  const [, navigate] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50 flex items-center justify-center p-4">
      <div className="text-center max-w-md">
        <div className="flex items-center justify-center gap-2 mb-10">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-gray-900">
            葫乐<span className="ai-gradient-text">AI</span>
          </span>
        </div>
        <div className="text-8xl font-extrabold text-indigo-100 mb-4 select-none" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          404
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-3">页面不存在</h1>
        <p className="text-gray-500 text-sm mb-8 leading-relaxed">
          您访问的页面不存在或已被移动。<br />
          请检查链接是否正确，或返回首页重新开始。
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-indigo-600 text-white text-sm font-semibold hover:bg-indigo-700 transition-colors"
          >
            <Home className="w-4 h-4" />
            返回首页
          </button>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            返回上一页
          </button>
        </div>
      </div>
    </div>
  );
}
