/**
 * LandingPage - 葫乐AI智能招聘平台落地页
 * 深色科技风格，参照参考图片设计
 */
import { useState, useEffect, useRef } from "react";
import { useLocation } from "wouter";
import {
  Brain, Sparkles, ArrowRight, ChevronRight, Star,
  CheckCircle2, BookOpen, Layers, Play, Menu, X
} from "lucide-react";

function Counter({ to, suffix = "", duration = 1800 }: { to: number; suffix?: string; duration?: number }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started.current) return;
      started.current = true;
      observer.disconnect();
      let start = 0;
      const step = to / (duration / 16);
      const timer = setInterval(() => {
        start += step;
        if (start >= to) { setCount(to); clearInterval(timer); }
        else setCount(Math.floor(start));
      }, 16);
    }, { threshold: 0.3 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [to, duration]);
  return <span ref={ref}>{count}{suffix}</span>;
}

const FEATURES = [
  { icon: "🤖", title: "Horo AI 助手", desc: "全局AI对话助手，自然语言或快捷按钮发起任务，技能调用可视化，今日动态播报，支持历史对话管理", tag: "AI编排" },
  { icon: "📝", title: "智能JD生成", desc: "输入岗位名称，AI结合公司知识库，30秒生成高质量岗位描述，吸引力评分超90分", tag: "效率提升" },
  { icon: "📊", title: "简历智能筛选", desc: "批量上传简历或邮箱自动导入，AI多维度语义解析，自动评分排序，精准识别高潜候选人", tag: "精准匹配" },
  { icon: "👤", title: "候选人画像", desc: "六维雷达图可视化 + 九型人格评估，证据链溯源，每项评分都有原文支撑，评估有据可查", tag: "可解释AI" },
  { icon: "⚖️", title: "对比决策Canvas", desc: "多候选人横向对比，差异一目了然，AI给出推荐理由，辅助录用决策", tag: "决策支持" },
  { icon: "❓", title: "面试题生成", desc: "基于候选人简历和岗位要求，生成个性化面试题库，深挖题+风险验证题", tag: "面试提效" },
  { icon: "🔄", title: "飞书面试复盘", desc: "接入飞书/腾讯视频会议，AI自动转写录音，生成结构化复盘报告，一键归档候选人档案", tag: "复盘智能" },
  { icon: "🛡️", title: "背景调查", desc: "学信网学历联动验证（在线验证码/PDF OCR双模式），工作经历核实，AI搜寻前司背调联系人", tag: "风险管控" },
  { icon: "🎯", title: "主动简历获取", desc: "浏览器插件 + RPA Agent 双模式，自动从招聘平台采集候选人简历，批量导入系统", tag: "主动寻访" },
  { icon: "🧪", title: "Skill Hub", desc: "60+官方技能包，覆盖各类岗位评估模型，支持自然语言自定义权重，打造专属评估体系", tag: "技能定制" },
  { icon: "📚", title: "企业知识库", desc: "导入公司介绍、文化手册、岗位说明书，AI生成和筛选时自动参考，支持URL自动抓取", tag: "知识沉淀" },
  { icon: "📈", title: "数据分析看板", desc: "招聘漏斗、AI效能对比、Skill使用效果热力图，用数据驱动招聘决策持续优化", tag: "数据驱动" },
];

const TESTIMONIALS = [
  { name: "张晓雯", title: "某互联网公司 HR总监", avatar: "张", rating: 5, content: "用了 Horo AI 之后，简历初筛时间从3天缩短到2小时。最惊艳的是候选人画像功能，六维评分加九型人格分析，每项都有原文支撑，跟业务方汇报时底气足多了。" },
  { name: "李明远", title: "某AI创业公司 招聘负责人", avatar: "李", rating: 5, content: "背景调查模块帮我们省了大量时间，学信网学历验证直接在系统里完成，不用再来回发邮件。Skill Hub 针对AI岗位自定义了评估模型，筛选准确率提升明显。" },
  { name: "王芳芳", title: "某上市公司 人才发展经理", avatar: "王", rating: 5, content: "邮箱导入和主动简历获取两个功能解决了我们最大的痛点，候选人来源从单一渠道扩展到多平台。Horo AI 的工作台+对话双轨模式，新同事上手很快，学习成本很低。" },
];

const STEPS = [
  { num: "01", title: "接入知识库", desc: "上传公司介绍、企业文化、岗位说明书等文档，Horo AI 将深度理解你的公司，为后续所有环节提供精准参考" },
  { num: "02", title: "AI 编排执行", desc: "通过自然语言或快捷按钮发起任务，Horo AI 自动调用合适的技能包，完成JD生成、简历筛选、面试题生成等工作" },
  { num: "03", title: "人工审核决策", desc: "AI 提供结构化、可解释的结果，每项评分都有依据，你来做最终决策，AI 辅助而非替代你的判断" },
];

export default function LandingPage() {
  const [, navigate] = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <div className="min-h-screen text-white overflow-x-hidden" style={{ background: "#0a0b14" }}>
      {/* Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(10,11,20,0.95)" : "transparent",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: scrolled ? "1px solid rgba(255,255,255,0.08)" : "none",
        }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #06b6d4)" }}>
              <Brain className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-white">Horo AI</span>
            <span className="hidden sm:inline text-xs ml-1" style={{ color: "rgba(255,255,255,0.3)" }}>智能招聘平台</span>
          </div>
          <div className="hidden md:flex items-center gap-7">
            {["功能特性", "工作流程", "用户评价", "定价方案"].map(item => (
              <a key={item} href={`#${item}`} className="text-sm transition-colors" style={{ color: "rgba(255,255,255,0.5)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "white")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}>
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate("/login")}
              className="hidden sm:block text-sm transition-colors"
              style={{ color: "rgba(255,255,255,0.5)" }}
              onMouseEnter={e => (e.currentTarget.style.color = "white")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.5)")}>
              登录
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-4 py-2 text-white text-sm font-medium rounded-xl transition-all"
              style={{ background: "#4f46e5" }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = "#4338ca")}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = "#4f46e5")}>
              免费试用
            </button>
            <button onClick={() => setMenuOpen(v => !v)} className="md:hidden" style={{ color: "rgba(255,255,255,0.6)" }}>
              {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {menuOpen && (
          <div className="md:hidden px-6 py-4 space-y-3" style={{ background: "#0d0e1a", borderTop: "1px solid rgba(255,255,255,0.08)" }}>
            {["功能特性", "工作流程", "用户评价", "定价方案"].map(item => (
              <a key={item} href={`#${item}`} onClick={() => setMenuOpen(false)} className="block text-sm py-1" style={{ color: "rgba(255,255,255,0.6)" }}>{item}</a>
            ))}
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-16 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute rounded-full" style={{ top: "20%", left: "20%", width: 700, height: 700, background: "rgba(99,102,241,0.07)", filter: "blur(130px)" }} />
          <div className="absolute rounded-full" style={{ bottom: "20%", right: "20%", width: 500, height: 500, background: "rgba(6,182,212,0.07)", filter: "blur(110px)" }} />
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 1px 1px, rgba(255,255,255,0.035) 1px, transparent 0)", backgroundSize: "48px 48px" }} />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 text-center">
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium mb-8"
            style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#a5b4fc" }}>
            <Sparkles className="w-3 h-3" />
            让 AI Agent 替你做 HR 工作
          </div>

          <h1 className="font-black leading-tight mb-6" style={{ fontSize: "clamp(2.5rem, 7vw, 4.5rem)" }}>
            <span className="text-white">Horo AI</span>
            <br />
            <span style={{ background: "linear-gradient(90deg, #818cf8, #22d3ee, #818cf8)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundSize: "200% auto", animation: "gradientShift 4s linear infinite" }}>
              智能招聘平台
            </span>
          </h1>

          <p className="text-lg max-w-2xl mx-auto leading-relaxed mb-10" style={{ color: "rgba(255,255,255,0.45)" }}>
            AI 主导，你来决策。从JD生成、简历筛选、候选人评估、背景调查到录用决策，
            <br className="hidden sm:block" />
            全链路 AI 赋能，工作台 + AI 问答双轨并行，让每一个招聘决策都有据可查。
          </p>

          {/* Demo chat bubble */}
          <div
            className="max-w-xl mx-auto mb-10 rounded-2xl p-5 text-left"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(8px)" }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #06b6d4)" }}>
                <Brain className="w-3 h-3 text-white" />
              </div>
              <span className="text-xs font-medium" style={{ color: "rgba(255,255,255,0.4)" }}>Horo AI · 正在工作中</span>
              <span className="ml-auto flex gap-1">
                {[0, 1, 2].map(i => (
                  <span key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: "#6366f1", animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite` }} />
                ))}
              </span>
            </div>
            <div className="space-y-2.5">
              {[
                { role: "user", text: "帮我生成一个高级AI产品经理的JD" },
                { role: "ai", text: "🔍 正在读取知识库：企业文化手册、技术团队岗位说明书..." },
                { role: "ai", text: "✅ JD已生成，吸引力评分 94/100，已匹配薪酬区间 40-60K·15薪" },
              ].map((msg, i) => (
                <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  <span
                    className="px-3 py-2 rounded-xl text-xs max-w-xs leading-relaxed"
                    style={msg.role === "user"
                      ? { background: "rgba(99,102,241,0.45)", color: "rgba(255,255,255,0.9)" }
                      : { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", border: "1px solid rgba(255,255,255,0.08)" }}>
                    {msg.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/register")}
              className="px-8 py-3.5 text-white font-semibold rounded-xl transition-all flex items-center gap-2 justify-center"
              style={{ background: "#4f46e5" }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#4338ca"; (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.03)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#4f46e5"; (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}>
              限时免费试用，赠送积分 <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3.5 font-medium rounded-xl transition-all flex items-center gap-2 justify-center"
              style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.75)" }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)")}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.06)")}>
              <Play className="w-4 h-4" />立即体验
            </button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.02)", padding: "3.5rem 0" }}>
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { value: 90, suffix: "%", label: "JD产出时间下降", color: "#fbbf24" },
            { value: 95, suffix: "%", label: "简历初筛时间下降", color: "#34d399" },
            { value: 92, suffix: "%", label: "AI建议采纳率", color: "#818cf8" },
            { value: 500, suffix: "+", label: "企业客户使用中", color: "#22d3ee" },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <p className="font-black mb-1" style={{ fontSize: "2.25rem", color: stat.color }}>
                <Counter to={stat.value} suffix={stat.suffix} />
              </p>
              <p className="text-sm" style={{ color: "rgba(255,255,255,0.35)" }}>{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="功能特性" className="py-24 max-w-7xl mx-auto px-6">
        <div className="text-center mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-5"
            style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#a5b4fc" }}>
            <Layers className="w-3 h-3" />覆盖 HR 工作的完整 AI 解决方案
          </div>
          <h2 className="font-black text-white mb-4" style={{ fontSize: "2.25rem" }}>
            不只是 AI 对话<br />
            <span style={{ color: "#818cf8" }}>而是自主执行的 Agent</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.35)" }} className="max-w-xl mx-auto">
            从发起任务到交付结果，Horo AI 自动调用技能包完成全流程，每步可追溯、可修正
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {FEATURES.map((f, i) => (
            <div
              key={i}
              className="rounded-2xl p-5 transition-all cursor-default"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
              onMouseEnter={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.background = "rgba(255,255,255,0.06)";
                el.style.borderColor = "rgba(99,102,241,0.3)";
                el.style.transform = "translateY(-3px)";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget as HTMLDivElement;
                el.style.background = "rgba(255,255,255,0.03)";
                el.style.borderColor = "rgba(255,255,255,0.07)";
                el.style.transform = "translateY(0)";
              }}>
              <div className="flex items-start justify-between mb-3">
                <span className="text-2xl">{f.icon}</span>
                <span className="px-2 py-0.5 rounded-full text-xs" style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#a5b4fc" }}>{f.tag}</span>
              </div>
              <h3 className="text-white font-semibold mb-2 text-sm">{f.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: "rgba(255,255,255,0.38)" }}>{f.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-10">
          <button
            onClick={() => navigate("/register")}
            className="px-6 py-3 rounded-xl text-sm font-medium transition-all flex items-center gap-2 mx-auto"
            style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", color: "#a5b4fc" }}
            onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.2)")}
            onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.12)")}>
            立即体验全部 AI 功能 <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Steps */}
      <section id="工作流程" className="py-24" style={{ background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-black text-white mb-4" style={{ fontSize: "2.25rem" }}>三步完成任何 HR 工作</h2>
            <p style={{ color: "rgba(255,255,255,0.35)" }}>告诉 AI 你想做什么，剩下的交给 Horo AI</p>
          </div>
          <div className="space-y-6">
            {STEPS.map((step, i) => (
              <div key={i} className="flex gap-6 items-start">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)" }}>
                  <span className="font-black text-lg" style={{ color: "#818cf8" }}>{step.num}</span>
                </div>
                <div className="flex-1 pt-1">
                  <h3 className="text-white font-bold text-lg mb-2">{step.title}</h3>
                  <p className="leading-relaxed" style={{ color: "rgba(255,255,255,0.38)" }}>{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Knowledge Base Feature */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-6"
              style={{ background: "rgba(52,211,153,0.1)", border: "1px solid rgba(52,211,153,0.2)", color: "#6ee7b7" }}>
              <BookOpen className="w-3 h-3" />让 AI 了解你的公司
            </div>
            <h2 className="font-black text-white mb-5" style={{ fontSize: "2.25rem" }}>
              企业知识库<br /><span style={{ color: "#34d399" }}>让AI更懂你</span>
            </h2>
            <p className="leading-relaxed mb-6" style={{ color: "rgba(255,255,255,0.45)" }}>
              上传公司介绍、企业文化、岗位说明书、薪酬体系等文档，Horo AI 将深度理解你的公司实际情况。
              生成JD时自动参考企业文化，筛选简历时结合岗位说明书，每个环节都更贴合你的真实需求。
            </p>
            <div className="space-y-3">
              {[
                { icon: "📄", text: "支持 PDF、Word、Excel、TXT 等格式" },
                { icon: "🔗", text: "可直接输入公司官网URL自动抓取" },
                { icon: "🧠", text: "AI 自动建立索引，引用时标注来源" },
                { icon: "📊", text: "实时统计各文档的引用次数" },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>
                  <span className="text-base">{item.icon}</span>{item.text}
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-2xl p-5" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)" }}>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.6)" }}>知识库文档</span>
              <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "rgba(52,211,153,0.1)", color: "#6ee7b7" }}>已建立索引</span>
            </div>
            <div className="space-y-2.5">
              {[
                { icon: "🏢", title: "葫乐科技公司介绍2024", type: "公司介绍", used: "引用 12 次" },
                { icon: "⭐", title: "企业文化手册V3", type: "企业文化", used: "引用 18 次" },
                { icon: "📋", title: "技术团队岗位说明书", type: "岗位说明书", used: "引用 24 次" },
                { icon: "💰", title: "薪酬福利体系说明", type: "薪酬福利", used: "引用 9 次" },
              ].map((doc, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl px-3 py-2.5" style={{ background: "rgba(255,255,255,0.04)" }}>
                  <span className="text-lg">{doc.icon}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium truncate" style={{ color: "rgba(255,255,255,0.75)" }}>{doc.title}</p>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.28)" }}>{doc.type}</p>
                  </div>
                  <span className="text-xs shrink-0" style={{ color: "rgba(52,211,153,0.65)" }}>{doc.used}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => navigate("/register")}
              className="w-full mt-4 py-2 rounded-xl text-xs transition-all"
              style={{ background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.25)", color: "#a5b4fc" }}
              onMouseEnter={e => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.2)")}
              onMouseLeave={e => ((e.currentTarget as HTMLButtonElement).style.background = "rgba(99,102,241,0.12)")}>
              + 添加更多文档
            </button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="用户评价" className="py-24" style={{ background: "rgba(255,255,255,0.015)", borderTop: "1px solid rgba(255,255,255,0.06)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="font-black text-white mb-4" style={{ fontSize: "2.25rem" }}>HR 团队的真实反馈</h2>
            <p style={{ color: "rgba(255,255,255,0.35)" }}>来自各行业招聘负责人的真实使用体验</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="rounded-2xl p-6" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                <div className="flex gap-0.5 mb-4">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} className="w-3.5 h-3.5" style={{ color: "#fbbf24", fill: "#fbbf24" }} />
                  ))}
                </div>
                <p className="text-sm leading-relaxed mb-5" style={{ color: "rgba(255,255,255,0.5)" }}>"{t.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold"
                    style={{ background: "linear-gradient(135deg, #6366f1, #06b6d4)" }}>
                    {t.avatar}
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">{t.name}</p>
                    <p className="text-xs" style={{ color: "rgba(255,255,255,0.28)" }}>{t.title}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
          <div className="rounded-full" style={{ width: 700, height: 350, background: "rgba(99,102,241,0.09)", filter: "blur(90px)" }} />
        </div>
        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs mb-6"
            style={{ background: "rgba(99,102,241,0.1)", border: "1px solid rgba(99,102,241,0.2)", color: "#a5b4fc" }}>
            <Sparkles className="w-3 h-3" />立即开始
          </div>
          <h2 className="font-black text-white mb-5" style={{ fontSize: "2.25rem" }}>
            让 Horo AI 成为<br />
            <span style={{ color: "#818cf8" }}>你最得力的 HR 助手</span>
          </h2>
          <p className="mb-8" style={{ color: "rgba(255,255,255,0.38)" }}>限时免费试用，赠送积分，无需复杂配置，5分钟上手</p>
          <button
            onClick={() => navigate("/register")}
            className="px-10 py-4 text-white font-bold rounded-xl transition-all text-base"
            style={{ background: "#4f46e5" }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "#4338ca"; (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.04)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "#4f46e5"; (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)"; }}>
            立即免费体验
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "2.5rem 0" }}>
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, #6366f1, #06b6d4)" }}>
              <Brain className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>Horo AI 智能招聘平台</span>
          </div>
          <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>© 2025 Horo AI · 让每一个招聘决策都有据可查</p>
          <div className="flex items-center gap-5">
            {["隐私政策", "服务条款", "联系我们"].map(item => (
              <a key={item} href="#" className="text-xs transition-colors" style={{ color: "rgba(255,255,255,0.25)" }}
                onMouseEnter={e => (e.currentTarget.style.color = "rgba(255,255,255,0.55)")}
                onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.25)")}>
                {item}
              </a>
            ))}
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes gradientShift {
          0% { background-position: 0% center; }
          100% { background-position: 200% center; }
        }
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
