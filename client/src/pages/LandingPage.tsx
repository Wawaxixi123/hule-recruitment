/**
 * LandingPage - Horo AI 智能招聘平台官网首页
 * 设计规范：浅色主题 / 品牌主色 #4F39F6 / 字体阶梯 #111827 > #6B7280
 * 动画：纯CSS animation-timeline scroll() + @keyframes，无Hook依赖
 */
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import {
  Brain, Sparkles, ArrowRight, Play, Menu, X, Star,
  BookOpen, Upload, Link2, BarChart2,
  Zap, Target, Database, Phone, Shield, Loader2
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

/* ─── 占位图组件 ─── */
function Placeholder({ height = 320, label = "产品截图", radius = 16 }: { height?: number; label?: string; radius?: number }) {
  return (
    <div
      style={{
        width: "100%", height, borderRadius: radius,
        background: "linear-gradient(135deg, #F3F4F6 0%, #E5E7EB 100%)",
        border: "1px solid #E5E7EB",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        gap: 8, color: "#9CA3AF", fontSize: 13,
      }}
    >
      <div style={{ width: 40, height: 40, borderRadius: 10, background: "#E5E7EB", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2"/>
          <circle cx="8.5" cy="8.5" r="1.5"/>
          <path d="M21 15l-5-5L5 21"/>
        </svg>
      </div>
      <span>{label}</span>
    </div>
  );
}

/* ─── 动画数字计数器 ─── */
function Counter({ to, suffix = "", duration = 1800 }: { to: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    if (started) return;
    const el = document.getElementById(`counter-${to}-${suffix}`);
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      setStarted(true);
      observer.disconnect();
      let start = 0;
      const step = to / (duration / 16);
      const timer = setInterval(() => {
        start += step;
        if (start >= to) { setCount(to); clearInterval(timer); }
        else setCount(Math.floor(start));
      }, 16);
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [to, suffix, duration, started]);

  return <span id={`counter-${to}-${suffix}`}>{count}{suffix}</span>;
}

/* ─── 功能模块数据 ─── */
const Z_FEATURES = [
  {
    label: "【智能 JD 生成与发布】",
    color: "#4F39F6",
    glowColor: "rgba(79,57,246,0.08)",
    features: [
      { title: "AI 驱动 JD 生成", desc: "输入岗位名称，AI 结合企业知识库，30 秒生成高质量岗位描述，吸引力评分超 90 分，自动匹配薪酬区间。" },
      { title: "知识库深度联动", desc: "自动引用公司介绍、企业文化、岗位说明书，每次输出都贴合企业真实情况，而非通用模板。" },
    ],
    cta: "体验 JD 生成",
  },
  {
    label: "【简历智能筛选与候选人评估】",
    color: "#0284C7",
    glowColor: "rgba(2,132,199,0.08)",
    features: [
      { title: "多维语义评分", desc: "批量上传简历或邮箱自动导入，AI 六维度语义解析，自动评分排序，精准识别高潜候选人，每项评分都有原文支撑。" },
      { title: "九型人格评估", desc: "在候选人画像中自动推断九型人格类型，展示岗位匹配度、团队文化匹配度及注意事项，辅助更立体的用人决策。" },
    ],
    cta: "查看候选人画像",
  },
  {
    label: "【背景调查与风险管控】",
    color: "#059669",
    glowColor: "rgba(5,150,105,0.08)",
    features: [
      { title: "学信网学历联动验证", desc: "支持在线验证码（方案 A）和 PDF 报告 OCR 解析（方案 B）双模式，AI 自动与简历字段 1:1 比对，输出通过 / 差异 / 异常三种结论。" },
      { title: "工作经历核实", desc: "AI 搜寻前司背调联系人，核实工作经历真实性，全流程在系统内完成，无需来回发邮件。" },
    ],
    cta: "了解背景调查",
  },
  {
    label: "【飞书面试复盘与主动寻访】",
    color: "#7C3AED",
    glowColor: "rgba(124,58,237,0.08)",
    features: [
      { title: "飞书 / 腾讯会议 AI 复盘", desc: "接入视频会议录音，AI 自动转写并生成结构化复盘报告，问答段落自动切分，一键归档候选人档案。" },
      { title: "主动简历获取", desc: "浏览器插件 + RPA Agent 双模式，自动从招聘平台采集候选人简历，批量导入系统，突破被动等简历的瓶颈。" },
    ],
    cta: "开始主动寻访",
  },
];

/* ─── 三步流程数据 ─── */
const STEPS = [
  {
    num: "01", color: "#4F39F6", bgColor: "rgba(79,57,246,0.06)",
    title: "接入知识库",
    desc: "上传公司介绍、企业文化、岗位说明书等文档，Horo AI 将深度理解你的公司，为后续所有环节提供精准参考。",
    icon: <Database className="w-7 h-7" style={{ color: "#4F39F6" }} />,
  },
  {
    num: "02", color: "#0284C7", bgColor: "rgba(2,132,199,0.06)",
    title: "AI 编排执行",
    desc: "通过自然语言或快捷按钮发起任务，Horo AI 自动调用合适的技能包，完成 JD 生成、简历筛选、面试题生成等工作。",
    icon: <Zap className="w-7 h-7" style={{ color: "#0284C7" }} />,
  },
  {
    num: "03", color: "#059669", bgColor: "rgba(5,150,105,0.06)",
    title: "人工审核决策",
    desc: "AI 提供结构化、可解释的结果，每项评分都有依据，你来做最终决策，AI 辅助而非替代你的判断。",
    icon: <Target className="w-7 h-7" style={{ color: "#059669" }} />,
  },
];

/* ─── 用户评价数据 ─── */
const TESTIMONIALS = [
  {
    name: "张晓雯", title: "某互联网公司 HR 总监", avatar: "张", rating: 5,
    content: "用了 Horo AI 之后，简历初筛时间从 3 天缩短到 2 小时。最惊艳的是候选人画像功能，六维评分加九型人格分析，每项都有原文支撑，跟业务方汇报时底气足多了。",
    highlight: "初筛时间缩短 90%",
  },
  {
    name: "李明远", title: "某 AI 创业公司 招聘负责人", avatar: "李", rating: 5,
    content: "背景调查模块帮我们省了大量时间，学信网学历验证直接在系统里完成，不用再来回发邮件。Skill Hub 针对 AI 岗位自定义了评估模型，筛选准确率提升明显。",
    highlight: "背调效率提升 80%",
  },
  {
    name: "王芳芳", title: "某上市公司 人才发展经理", avatar: "王", rating: 5,
    content: "邮箱导入和主动简历获取两个功能解决了我们最大的痛点，候选人来源从单一渠道扩展到多平台。工作台 + 对话双轨模式，新同事上手很快，学习成本很低。",
    highlight: "候选人来源扩大 3 倍",
  },
  {
    name: "陈建国", title: "某制造业集团 HRBP", avatar: "陈", rating: 5,
    content: "飞书面试复盘功能太实用了，以前面试完要花 1 小时整理记录，现在 AI 自动生成结构化报告，只需要确认和补充就好，大大减少了重复性工作。",
    highlight: "复盘时间减少 85%",
  },
  {
    name: "刘思远", title: "某电商公司 招聘经理", avatar: "刘", rating: 5,
    content: "对比决策 Canvas 让我们在多候选人选择时更有依据，AI 给出的推荐理由清晰有逻辑，和业务方沟通录用决策时再也不用靠感觉说话了。",
    highlight: "决策效率提升 60%",
  },
  {
    name: "赵美玲", title: "某医疗科技公司 HR", avatar: "赵", rating: 5,
    content: "知识库功能让 AI 真正了解了我们公司的文化和岗位要求，生成的 JD 不再是通用模板，候选人反馈说 JD 写得很真实，投递质量明显提升。",
    highlight: "简历投递质量提升 40%",
  },
];

/* ─── 主组件 ─── */
export default function LandingPage() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  // 登录/注册弹窗
  const [authOpen, setAuthOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [authLoading, setAuthLoading] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const openAuth = () => setAuthOpen(true);
  const closeAuth = () => { setAuthOpen(false); setPhone(""); setCode(""); setCodeSent(false); setCountdown(0); };

  const handleSendCode = () => {
    if (!phone || phone.length < 11) { toast.error("请输入正确的手机号"); return; }
    setCodeSent(true); setCountdown(60);
    toast.success(`验证码已发送至 ${phone}`);
    timerRef.current = setInterval(() => {
      setCountdown(prev => { if (prev <= 1) { clearInterval(timerRef.current!); return 0; } return prev - 1; });
    }, 1000);
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone) { toast.error("请输入手机号"); return; }
    if (!code) { toast.error("请输入验证码"); return; }
    setAuthLoading(true);
    try {
      const ok = await login("demo@hule.ai", "demo123");
      if (ok) { toast.success("登录成功，赠送 30 积分！"); closeAuth(); navigate("/horo-ai"); }
    } catch { toast.error("登录失败，请重试"); } finally { setAuthLoading(false); }
  };

  return (
    <div className="min-h-screen overflow-x-hidden" style={{ background: "#FFFFFF", color: "#111827" }}>

      {/* ══════════════ 全局样式 ══════════════ */}
      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes breathe {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.05); }
        }
        @keyframes fadeUpHero {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(40px) scale(0.98); }
          to { opacity: 1; transform: translateX(0) scale(1); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.92); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes arrowSlide {
          0% { transform: translateX(0); opacity: 1; }
          45% { transform: translateX(6px); opacity: 0; }
          46% { transform: translateX(-6px); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }
        @keyframes fadeUpCard {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .hero-left { animation: fadeUpHero 0.8s ease-out both; }
        .hero-right { animation: slideInRight 0.9s ease-out 0.3s both; }
        .cta-card { animation: scaleIn 0.8s ease-out both; }
        .arrow-anim { animation: arrowSlide 1.8s ease-in-out infinite; }
        .breathe-glow { animation: breathe 10s ease-in-out infinite; }
        .breathe-glow2 { animation: breathe 12s ease-in-out 2s infinite; }
        .fade-card-0 { animation: fadeUpCard 0.6s ease-out 0.0s both; }
        .fade-card-1 { animation: fadeUpCard 0.6s ease-out 0.1s both; }
        .fade-card-2 { animation: fadeUpCard 0.6s ease-out 0.2s both; }
        .fade-card-3 { animation: fadeUpCard 0.6s ease-out 0.3s both; }
        .fade-card-4 { animation: fadeUpCard 0.6s ease-out 0.4s both; }
        .fade-card-5 { animation: fadeUpCard 0.6s ease-out 0.5s both; }
        .hover-lift { transition: transform 0.3s ease, box-shadow 0.3s ease; }
        .hover-lift:hover { transform: translateY(-8px); }
        .hover-scale { transition: transform 0.2s ease; }
        .hover-scale:hover { transform: scale(1.02); }
        .nav-link { color: #6B7280; transition: color 0.2s; }
        .nav-link:hover { color: #4F39F6; }
        .btn-primary { background: linear-gradient(135deg, #4F39F6, #7C3AED); box-shadow: 0 4px 16px rgba(79,57,246,0.3); transition: transform 0.2s, box-shadow 0.2s; }
        .btn-primary:hover { transform: translateY(-3px); box-shadow: 0 8px 24px rgba(79,57,246,0.4); }
        .btn-outline { border: 1.5px solid #4F39F6; color: #4F39F6; background: transparent; transition: background 0.2s, border-width 0.1s; }
        .btn-outline:hover { background: rgba(79,57,246,0.05); }
        .feature-img-wrap { transition: transform 0.5s ease, box-shadow 0.5s ease; }
        .feature-img-wrap:hover { transform: translateY(-8px); }
      `}</style>

      {/* ══════════════ 导航栏 ══════════════ */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(255,255,255,0.92)" : "rgba(255,255,255,0.7)",
          backdropFilter: "blur(16px)",
          borderBottom: scrolled ? "1px solid #F3F4F6" : "1px solid transparent",
          boxShadow: scrolled ? "0 4px 24px rgba(79,57,246,0.05)" : "none",
          height: scrolled ? 64 : 80,
        }}
      >
        <div className="max-w-[1200px] mx-auto px-6 h-full flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #4F39F6, #06b6d4)" }}>
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <span className="font-bold text-base" style={{ color: "#111827" }}>Horo AI</span>
              <span className="hidden sm:inline text-xs text-gray-400 ml-1.5">智能招聘平台</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {[
              { label: "功能特性", href: "#features" },
              { label: "工作流程", href: "#steps" },
              { label: "知识库", href: "#knowledge" },
              { label: "用户评价", href: "#testimonials" },
            ].map(item => (
              <a key={item.label} href={item.href} className="nav-link text-sm relative group">
                {item.label}
                <span className="absolute -bottom-0.5 left-0 h-0.5 rounded-full transition-all duration-300 w-0 group-hover:w-full" style={{ background: "linear-gradient(90deg, #4F39F6, #06b6d4)" }} />
              </a>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => navigate("/login")} className="nav-link hidden sm:block text-sm">登录</button>
            <button onClick={() => navigate("/register")} className="btn-primary px-5 py-2 text-white text-sm font-semibold rounded-xl">免费试用</button>
            <button onClick={() => setMenuOpen(v => !v)} className="md:hidden nav-link">
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {menuOpen && (
          <div className="md:hidden px-6 py-4 space-y-3" style={{ background: "#FFFFFF", borderTop: "1px solid #F3F4F6" }}>
            {["功能特性", "工作流程", "知识库", "用户评价"].map(item => (
              <a key={item} href={`#${item}`} onClick={() => setMenuOpen(false)} className="block text-sm py-1.5 nav-link">{item}</a>
            ))}
          </div>
        )}
      </nav>

      {/* ══════════════ Hero Banner ══════════════ */}
      <section className="relative overflow-hidden" style={{ paddingTop: 120, paddingBottom: 80 }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute rounded-full breathe-glow" style={{ top: "10%", left: "-5%", width: 600, height: 600, background: "rgba(79,57,246,0.06)", filter: "blur(120px)" }} />
          <div className="absolute rounded-full breathe-glow2" style={{ bottom: "0%", right: "-5%", width: 500, height: 500, background: "rgba(6,182,212,0.05)", filter: "blur(100px)" }} />
        </div>

        <div className="relative max-w-[1200px] mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="hero-left">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6" style={{ background: "rgba(79,57,246,0.08)", border: "1px solid rgba(79,57,246,0.15)", color: "#4F39F6" }}>
                <Sparkles className="w-3 h-3" />
                让 AI Agent 替你做 HR 工作
              </div>

              <h1 className="font-black leading-tight mb-6" style={{ fontSize: "clamp(2.2rem, 5vw, 3.5rem)" }}>
                <span style={{ color: "#111827" }}>Horo AI</span>
                <br />
                <span style={{ background: "linear-gradient(90deg, #4F39F6, #7C3AED, #4F39F6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundSize: "200% auto", animation: "gradientShift 5s linear infinite" }}>
                  智能招聘平台
                </span>
              </h1>

              <p className="leading-relaxed mb-10" style={{ fontSize: "1.0625rem", color: "#6B7280", lineHeight: 1.75 }}>
                AI 主导，你来决策。从 JD 生成、简历筛选、候选人评估、背景调查到录用决策，全链路 AI 赋能。工作台 + AI 问答双轨并行，让每一个招聘决策都有据可查。
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => navigate("/register")} className="btn-primary px-7 py-3.5 text-white font-semibold rounded-xl flex items-center gap-2 justify-center" style={{ fontSize: "0.9375rem" }}>
                  限时免费试用，赠送积分 <ArrowRight className="w-4 h-4 arrow-anim" />
                </button>
                <button onClick={() => navigate("/login")} className="btn-outline px-7 py-3.5 font-medium rounded-xl flex items-center gap-2 justify-center" style={{ fontSize: "0.9375rem" }}>
                  <Play className="w-4 h-4" /> 立即体验
                </button>
              </div>
            </div>

            <div className="hero-right hover-lift">
              <div className="rounded-3xl overflow-hidden" style={{ boxShadow: "0 24px 64px rgba(79,57,246,0.12), 0 4px 16px rgba(0,0,0,0.06)" }}>
                <Placeholder height={420} label="产品界面截图" radius={24} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ 数据分割栏 ══════════════ */}
      <section style={{ borderTop: "1px solid #F3F4F6", borderBottom: "1px solid #F3F4F6", background: "#FAFAFA", padding: "64px 0" }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: 90, suffix: "%", label: "JD 产出时间下降", color: "#4F39F6" },
              { value: 95, suffix: "%", label: "简历初筛时间下降", color: "#0284C7" },
              { value: 92, suffix: "%", label: "AI 建议采纳率", color: "#7C3AED" },
              { value: 500, suffix: "+", label: "企业客户使用中", color: "#059669" },
            ].map((stat, i) => (
              <div key={i} className="text-center" style={{ borderRight: i < 3 ? "1px solid #F3F4F6" : "none" }}>
                <p className="font-black mb-2" style={{ fontSize: "2.25rem", color: stat.color }}>
                  <Counter to={stat.value} suffix={stat.suffix} />
                </p>
                <p className="text-sm" style={{ color: "#6B7280" }}>{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ 功能介绍（Z轴交替布局）══════════════ */}
      <section id="features" style={{ padding: "120px 0" }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="font-black mb-4" style={{ fontSize: "clamp(1.75rem, 4vw, 2.5rem)", color: "#111827" }}>
              不只是 AI 对话
              <br />
              <span style={{ background: "linear-gradient(90deg, #4F39F6, #7C3AED)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                而是自主执行的 Agent
              </span>
            </h2>
            <p style={{ color: "#6B7280", fontSize: "1rem" }}>从发起任务到交付结果，Horo AI 自动调用技能包完成全流程，每步可追溯、可修正</p>
          </div>

          <div className="space-y-32">
            {Z_FEATURES.map((feature, idx) => {
              const isEven = idx % 2 === 0;
              return (
                <div key={idx} className="grid md:grid-cols-2 gap-16 items-center relative">
                  {/* 背景弥散光 */}
                  <div
                    className="absolute rounded-full pointer-events-none"
                    style={{
                      width: 400, height: 400,
                      background: feature.glowColor,
                      filter: "blur(80px)",
                      ...(isEven ? { right: -80 } : { left: -80 }),
                      top: "50%", transform: "translateY(-50%)",
                      zIndex: 0,
                    }}
                  />

                  {/* 文案区 */}
                  <div className="relative z-10" style={{ order: isEven ? 1 : 2 }}>
                    <p className="font-bold text-lg mb-6" style={{ color: "#111827" }}>{feature.label}</p>
                    <div className="space-y-5 mb-8">
                      {feature.features.map((f, fi) => (
                        <div key={fi}>
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: feature.color }} />
                            <h3 className="font-bold text-base" style={{ color: feature.color }}>{f.title}</h3>
                          </div>
                          <p className="text-sm leading-relaxed pl-4" style={{ color: "#6B7280", lineHeight: 1.75 }}>{f.desc}</p>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={() => navigate("/register")}
                      className="px-5 py-2.5 text-white text-sm font-semibold rounded-xl hover-lift"
                      style={{ background: `linear-gradient(135deg, ${feature.color}, ${feature.color}cc)`, boxShadow: `0 4px 14px ${feature.color}33` }}
                    >
                      {feature.cta}
                    </button>
                  </div>

                  {/* 图片区 */}
                  <div className="relative z-10" style={{ order: isEven ? 2 : 1 }}>
                    <div
                      className="rounded-3xl overflow-hidden feature-img-wrap"
                      style={{ boxShadow: `0 16px 48px ${feature.color}18, 0 4px 12px rgba(0,0,0,0.05)`, border: `1px solid ${feature.color}18` }}
                    >
                      <Placeholder height={320} label="功能截图" radius={0} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════ 三步完成 HR 工作 ══════════════ */}
      <section id="steps" style={{ background: "#FAFAFA", borderTop: "1px solid #F3F4F6", borderBottom: "1px solid #F3F4F6", padding: "120px 0" }}>
        <div className="max-w-[900px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-black mb-4" style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", color: "#111827" }}>三步完成任何 HR 工作</h2>
            <p style={{ color: "#6B7280" }}>告诉 AI 你想做什么，剩下的交给 Horo AI</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {STEPS.map((step, i) => (
              <div
                key={i}
                className={`rounded-3xl p-8 hover-lift relative overflow-hidden fade-card-${i}`}
                style={{ background: "#FFFFFF", border: "1px solid #F3F4F6", boxShadow: "0 4px 24px rgba(0,0,0,0.04)", cursor: "default" }}
              >
                <div className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none" style={{ background: `radial-gradient(ellipse at center bottom, ${step.bgColor} 0%, transparent 70%)` }} />
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-full text-sm font-black mb-6" style={{ background: step.bgColor, color: step.color }}>{step.num}</div>
                <div className="mb-4">{step.icon}</div>
                <h3 className="font-bold text-lg mb-3" style={{ color: "#111827" }}>{step.title}</h3>
                <p className="text-sm leading-relaxed" style={{ color: "#6B7280", lineHeight: 1.75 }}>{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ 企业知识库 ══════════════ */}
      <section id="knowledge" style={{ padding: "120px 0" }}>
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-20 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-medium mb-6" style={{ background: "rgba(5,150,105,0.08)", border: "1px solid rgba(5,150,105,0.2)", color: "#059669" }}>
                <BookOpen className="w-3 h-3" />让 AI 了解你的公司
              </div>
              <h2 className="font-black mb-5" style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", color: "#111827" }}>
                企业知识库
                <br />
                <span style={{ color: "#059669" }}>让 AI 更懂你</span>
              </h2>
              <p className="leading-relaxed mb-8" style={{ color: "#6B7280", lineHeight: 1.75 }}>
                上传公司介绍、企业文化、岗位说明书、薪酬体系等文档，Horo AI 将深度理解你的公司实际情况。生成 JD 时自动参考企业文化，筛选简历时结合岗位说明书，每个环节都更贴合你的真实需求。
              </p>

              <div className="space-y-4">
                {[
                  { icon: <Upload className="w-4 h-4" />, text: "支持 PDF、Word、Excel、TXT 等格式上传" },
                  { icon: <Link2 className="w-4 h-4" />, text: "可直接输入公司官网 URL 自动抓取内容" },
                  { icon: <Brain className="w-4 h-4" />, text: "AI 自动建立索引，引用时标注来源文档" },
                  { icon: <BarChart2 className="w-4 h-4" />, text: "实时统计各文档的引用次数与覆盖率" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-2xl hover-scale" style={{ background: "#FAFAFA", border: "1px solid #F3F4F6" }}>
                    <span style={{ color: "#059669" }}>{item.icon}</span>
                    <span className="text-sm" style={{ color: "#374151" }}>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="rounded-3xl overflow-hidden hover-lift" style={{ boxShadow: "0 20px 60px rgba(5,150,105,0.12), 0 4px 16px rgba(0,0,0,0.06)", border: "1px solid rgba(5,150,105,0.12)" }}>
                <Placeholder height={360} label="知识库管理界面截图" radius={0} />
              </div>
              <div className="absolute -bottom-4 -right-4 px-4 py-2.5 rounded-2xl text-sm font-semibold text-white" style={{ background: "linear-gradient(135deg, #4F39F6, #7C3AED)", boxShadow: "0 8px 24px rgba(79,57,246,0.3)" }}>
                <div className="flex items-center gap-2"><Upload className="w-4 h-4" />上传文件</div>
              </div>
              <div className="absolute -top-4 -left-4 px-3 py-2 rounded-xl text-xs font-medium" style={{ background: "#FFFFFF", border: "1px solid #F3F4F6", boxShadow: "0 4px 16px rgba(0,0,0,0.08)", color: "#059669" }}>
                ✓ 已建立索引 · 引用 63 次
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════ HR 团队真实反馈 ══════════════ */}
      <section id="testimonials" style={{ background: "linear-gradient(180deg, #FAFAFA 0%, #FFFFFF 100%)", borderTop: "1px solid #F3F4F6", padding: "120px 0", position: "relative", overflow: "hidden" }}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute rounded-full breathe-glow" style={{ top: "20%", left: "10%", width: 500, height: 500, background: "rgba(79,57,246,0.04)", filter: "blur(100px)" }} />
          <div className="absolute rounded-full breathe-glow2" style={{ bottom: "10%", right: "10%", width: 400, height: 400, background: "rgba(124,58,237,0.04)", filter: "blur(90px)" }} />
        </div>

        <div className="relative max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-black mb-4" style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", color: "#111827" }}>HR 团队的真实反馈</h2>
            <p style={{ color: "#6B7280" }}>来自全球 500+ 企业客户的实测心声</p>
          </div>

          <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 space-y-6">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className={`break-inside-avoid rounded-2xl p-6 hover-lift fade-card-${i}`}
                style={{ background: "rgba(255,255,255,0.95)", border: "1px solid #F3F4F6", boxShadow: "0 4px 24px rgba(168,85,247,0.05)", cursor: "default" }}
              >
                <div className="flex gap-0.5 mb-3">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5" style={{ fill: "#4F39F6", color: "#4F39F6" }} />
                  ))}
                </div>
                <div className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold mb-3" style={{ background: "rgba(79,57,246,0.06)", color: "#4F39F6" }}>
                  {t.highlight}
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: "#374151", lineHeight: 1.75 }}>"{t.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0" style={{ background: "linear-gradient(135deg, #4F39F6, #06b6d4)" }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="font-semibold text-sm" style={{ color: "#111827" }}>{t.name}</p>
                    <p className="text-xs" style={{ color: "#9CA3AF" }}>{t.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════ CTA 收尾 ══════════════ */}
      <section style={{ padding: "120px 0", background: "#FFFFFF", position: "relative", overflow: "hidden" }}>
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="rounded-full breathe-glow" style={{ width: 800, height: 400, background: "rgba(79,57,246,0.07)", filter: "blur(120px)" }} />
        </div>

        <div className="relative max-w-[800px] mx-auto px-6">
          <div
            className="cta-card rounded-3xl text-center relative overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.7)",
              backdropFilter: "blur(20px)",
              border: "1px solid rgba(255,255,255,0.8)",
              boxShadow: "0 32px 80px rgba(79,57,246,0.12), 0 0 0 1px rgba(79,57,246,0.06)",
              padding: "80px 60px",
            }}
          >
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1 rounded-full" style={{ background: "linear-gradient(90deg, #4F39F6, #7C3AED, #06b6d4)", filter: "blur(8px)", animation: "breathe 8s ease-in-out infinite" }} />

            <h2 className="font-black mb-4" style={{ fontSize: "clamp(1.75rem, 4vw, 2.25rem)", color: "#111827" }}>
              让 Horo AI 成为
              <br />
              <span style={{ background: "linear-gradient(90deg, #4F39F6, #7C3AED)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                你最得力的 HR 助手
              </span>
            </h2>
            <p className="mb-10" style={{ color: "#6B7280", fontSize: "1rem" }}>限时免费试用，赠送积分，无需复杂配置，5 分钟上手</p>

            <button
              onClick={() => navigate("/register")}
              className="btn-primary px-10 py-4 text-white font-bold rounded-2xl text-base inline-flex items-center gap-2"
            >
              立即免费体验 <ArrowRight className="w-4 h-4 arrow-anim" />
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════ Footer ══════════════ */}
      <footer style={{ borderTop: "1px solid #F3F4F6", padding: "40px 0", background: "#FAFAFA" }}>
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #4F39F6, #06b6d4)" }}>
              <Brain className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-medium" style={{ color: "#374151" }}>Horo AI 智能招聘平台</span>
          </div>
          <p className="text-xs" style={{ color: "#9CA3AF" }}>© 2025 Horo AI · 让每一个招聘决策都有据可查</p>
          <div className="flex items-center gap-6">
            {["隐私政策", "服务条款", "联系我们"].map(item => (
              <a key={item} href="#" className="nav-link text-xs">{item}</a>
            ))}
          </div>
        </div>
      </footer>

      {/* ══════════════ 登录/注册弹窗 ══════════════ */}
      {authOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)" }}
          onClick={e => e.target === e.currentTarget && closeAuth()}
        >
          <div className="relative w-full max-w-sm bg-white rounded-3xl shadow-2xl overflow-hidden"
            style={{ boxShadow: "0 32px 80px rgba(79,57,246,0.2), 0 4px 20px rgba(0,0,0,0.1)" }}>

            {/* Close */}
            <button
              onClick={closeAuth}
              className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all z-10"
              style={{ fontSize: "18px" }}
            >×</button>

            <div className="p-8 pt-10">
              {/* Logo */}
              <div className="flex flex-col items-center mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                  style={{ background: "linear-gradient(135deg, #7c6af7 0%, #4F39F6 100%)", boxShadow: "0 8px 24px rgba(79,57,246,0.35)" }}>
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">Horo AI 智能招聘平台</h2>
                <p className="text-xs text-indigo-500 font-medium mb-3">HORO AI HR</p>
                {/* 赠送积分引导 */}
                <div className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold"
                  style={{ background: "rgba(79,57,246,0.08)", color: "#4F39F6", border: "1px solid rgba(79,57,246,0.15)" }}>
                  🎁 注册即赠 30 积分，免费体验所有 AI 功能
                </div>
              </div>

              {/* Form */}
              <form onSubmit={handleAuthSubmit} className="space-y-4">
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

                <button
                  type="submit"
                  disabled={authLoading}
                  className="w-full h-12 rounded-xl text-white font-semibold text-base flex items-center justify-center gap-2 transition-all mt-2"
                  style={{
                    background: "linear-gradient(135deg, #9b8af8 0%, #4F39F6 100%)",
                    boxShadow: "0 4px 16px rgba(79,57,246,0.35)",
                    opacity: authLoading ? 0.8 : 1,
                  }}
                >
                  {authLoading && <Loader2 className="w-4 h-4 animate-spin" />}
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

              {/* WeChat */}
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
      )}

    </div>
  );
}
