/**
 * Landing Page - 葫乐AI智能招聘平台落地页
 * Design: AI-Native, White background, Indigo + Cyan palette
 * Layout: Full-width sections, asymmetric hero, feature grid
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Brain, Zap, Users, BarChart3, Shield, ChevronRight,
  Star, ArrowRight, CheckCircle2, Sparkles, Target,
  FileSearch, GitCompare, MessageSquare, TrendingUp,
  Play, Menu, X
} from "lucide-react";

const HERO_BG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663390398541/FHW3dKGZzcTkRYC2iX5yLJ/hero-bg-Q3jYNPByUEg5h6tfhevE7U.webp";
const DASHBOARD_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663390398541/FHW3dKGZzcTkRYC2iX5yLJ/dashboard-preview-65whrEZyis7Ruqyx5UdYpz.webp";
const AI_ANALYSIS_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663390398541/FHW3dKGZzcTkRYC2iX5yLJ/ai-analysis-8dJkKSNqqne2aVs2yiTWKt.webp";
const SKILL_HUB_IMG = "https://d2xsxph8kpxj0f.cloudfront.net/310519663390398541/FHW3dKGZzcTkRYC2iX5yLJ/skill-hub-J9kxaTh7eduqG6n5ZX8PN9.webp";

const features = [
  {
    icon: Brain,
    title: "智能JD生成",
    desc: "输入模糊需求，AI自动生成结构化职位描述，对齐职级标准，减少JD产出时间50%",
    color: "indigo",
    tag: "P0 核心",
  },
  {
    icon: FileSearch,
    title: "语义简历筛选",
    desc: "超越关键词匹配，深度语义理解候选人经历，多维度评分并提供可解释依据",
    color: "cyan",
    tag: "P0 核心",
  },
  {
    icon: Target,
    title: "候选人画像",
    desc: "雷达图可视化能力分布，优势短板一目了然，AI结论可追溯、可修正",
    color: "indigo",
    tag: "P0 核心",
  },
  {
    icon: GitCompare,
    title: "对比决策Canvas",
    desc: "多候选人横向对比，差异高亮，AI生成适配场景建议，支撑shortlist决策",
    color: "cyan",
    tag: "P1",
  },
  {
    icon: MessageSquare,
    title: "面试题生成",
    desc: "根据JD和候选人画像生成差异化面试题，覆盖基础题、深挖题、风险验证题",
    color: "indigo",
    tag: "P1",
  },
  {
    icon: Sparkles,
    title: "Skill Hub",
    desc: "将筛选逻辑沉淀为可复用Skill，团队共创共享，形成组织招聘壁垒",
    color: "cyan",
    tag: "P2",
  },
];

const stats = [
  { value: "50%", label: "JD产出时间下降" },
  { value: "60%", label: "简历初筛时间下降" },
  { value: "70%", label: "面试复盘时间下降" },
  { value: "40%+", label: "AI建议采纳率" },
];

const testimonials = [
  {
    name: "陈晓华",
    title: "招聘总监 · 某头部互联网公司",
    content: "葫乐AI让我们的简历筛选效率提升了3倍，最重要的是AI的判断有据可查，HR和业务方终于能在同一框架下讨论候选人了。",
    rating: 5,
  },
  {
    name: "李雯雯",
    title: "HRBP · 某独角兽企业",
    content: "Skill Hub功能让我们把3年积累的识人经验固化成了可复用的模型，新来的HR同事也能快速上手，团队效率提升显著。",
    rating: 5,
  },
  {
    name: "王明",
    title: "用人经理 · 某AI公司",
    content: "候选人对比Canvas解决了我最大的痛点，不再是看一堆简历然后凭感觉，现在每个决策都有数据支撑。",
    rating: 5,
  },
];

const navLinks = [
  { label: "产品功能", href: "#features" },
  { label: "解决方案", href: "#solutions" },
  { label: "客户案例", href: "#testimonials" },
  { label: "定价", href: "#pricing" },
];

export default function LandingPage() {
  const [, navigate] = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [typedText, setTypedText] = useState("");
  const fullText = "把招聘从「流程系统」升级为「决策系统」";

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    let i = 0;
    const timer = setInterval(() => {
      if (i <= fullText.length) {
        setTypedText(fullText.slice(0, i));
        i++;
      } else {
        clearInterval(timer);
      }
    }, 80);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navigation */}
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? "bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100" : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center">
                <Brain className="w-4.5 h-4.5 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                葫乐<span className="ai-gradient-text">AI</span>
              </span>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-gray-600 hover:text-indigo-600 transition-colors font-medium"
                >
                  {link.label}
                </a>
              ))}
            </div>

            {/* CTA Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/login")}
                className="text-gray-700 hover:text-indigo-600"
              >
                登录
              </Button>
              <Button
                size="sm"
                onClick={() => navigate("/register")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-5"
              >
                免费试用
              </Button>
            </div>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 rounded-lg text-gray-600"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-3">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} className="block text-gray-700 py-2 font-medium">
                {link.label}
              </a>
            ))}
            <div className="flex gap-3 pt-2">
              <Button variant="outline" size="sm" onClick={() => navigate("/login")} className="flex-1">
                登录
              </Button>
              <Button size="sm" onClick={() => navigate("/register")} className="flex-1 bg-indigo-600 text-white">
                免费试用
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden hero-gradient pt-16">
        <div
          className="absolute inset-0 opacity-60"
          style={{
            backgroundImage: `url(${HERO_BG})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-white/20 via-transparent to-white/80" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left: Text Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                <span className="text-xs font-semibold text-indigo-700">Atomic Recruitment OS · V1.0</span>
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl lg:text-6xl font-extrabold text-gray-900 leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', 'Noto Sans SC', sans-serif" }}>
                  <span className="ai-gradient-text">葫乐AI</span>
                  <br />
                  智能招聘平台
                </h1>
                <p className="text-xl text-gray-700 font-medium min-h-[2rem]">
                  {typedText}
                  <span className="typing-cursor" />
                </p>
                <p className="text-base text-gray-500 leading-relaxed max-w-lg">
                  覆盖JD生成、简历筛选、候选人评估、面试复盘、知识沉淀的全链路智能招聘决策系统。
                  每个AI结论都有证据链，每次修正都有记录，让招聘经验成为组织资产。
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <Button
                  size="lg"
                  onClick={() => navigate("/login")}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 h-12 text-base font-semibold shadow-lg shadow-indigo-200"
                >
                  立即登录体验
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="border-gray-300 text-gray-700 px-8 h-12 text-base font-semibold hover:border-indigo-300 hover:text-indigo-600"
                  onClick={() => {
                    document.getElementById("features")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  <Play className="mr-2 w-4 h-4" />
                  了解更多
                </Button>
              </div>

              {/* Trust badges */}
              <div className="flex flex-wrap items-center gap-6 pt-2">
                {[
                  "SOC2 安全认证",
                  "数据隔离保障",
                  "AI结果可解释",
                ].map((badge) => (
                  <div key={badge} className="flex items-center gap-1.5 text-sm text-gray-500">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span>{badge}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Dashboard Preview */}
            <div className="relative hidden lg:block">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-indigo-100/50 border border-gray-100">
                <img
                  src={DASHBOARD_IMG}
                  alt="葫乐AI招聘平台界面"
                  className="w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-white/10 to-transparent" />
              </div>
              {/* Floating stat cards */}
              <div className="absolute -left-8 top-1/4 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 ai-glow">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-50 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">AI筛选效率</div>
                    <div className="text-sm font-bold text-gray-900">提升 <span className="text-emerald-600">60%</span></div>
                  </div>
                </div>
              </div>
              <div className="absolute -right-6 bottom-1/4 bg-white rounded-xl shadow-lg border border-gray-100 px-4 py-3 ai-glow">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                    <Brain className="w-4 h-4 text-indigo-600" />
                  </div>
                  <div>
                    <div className="text-xs text-gray-500">AI建议采纳率</div>
                    <div className="text-sm font-bold text-gray-900"><span className="text-indigo-600">73%</span> 本月</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-to-r from-indigo-600 to-cyan-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl font-extrabold text-white mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {stat.value}
                </div>
                <div className="text-sm text-indigo-100">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 mb-4">核心功能</Badge>
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4" style={{ fontFamily: "'Plus Jakarta Sans', 'Noto Sans SC', sans-serif" }}>
              全链路智能招聘能力
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              从岗位定义到录用决策，每个环节都有AI辅助，每个结论都可追溯
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group relative bg-white rounded-2xl border border-gray-100 p-6 card-hover"
              >
                <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${
                  feature.color === "indigo" ? "bg-indigo-50" : "bg-cyan-50"
                }`}>
                  <feature.icon className={`w-6 h-6 ${
                    feature.color === "indigo" ? "text-indigo-600" : "text-cyan-600"
                  }`} />
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-base font-bold text-gray-900">{feature.title}</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                    feature.tag === "P0 核心"
                      ? "bg-indigo-50 text-indigo-700"
                      : feature.tag === "P1"
                      ? "bg-cyan-50 text-cyan-700"
                      : "bg-gray-50 text-gray-600"
                  }`}>
                    {feature.tag}
                  </span>
                </div>
                <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                <div className={`absolute bottom-0 left-0 right-0 h-0.5 rounded-b-2xl opacity-0 group-hover:opacity-100 transition-opacity ${
                  feature.color === "indigo"
                    ? "bg-gradient-to-r from-indigo-500 to-indigo-300"
                    : "bg-gradient-to-r from-cyan-500 to-cyan-300"
                }`} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge className="bg-cyan-50 text-cyan-700 border-cyan-100 mb-4">AI能力可视化</Badge>
              <h2 className="text-4xl font-extrabold text-gray-900 mb-6" style={{ fontFamily: "'Plus Jakarta Sans', 'Noto Sans SC', sans-serif" }}>
                每个AI判断<br />都有证据链
              </h2>
              <div className="space-y-4">
                {[
                  { title: "多维度评分", desc: "核心技能、业务匹配、项目复杂度、职级匹配、成长潜力、稳定性六维评分" },
                  { title: "可解释依据", desc: "每个分数都能展开查看具体证据片段，AI不再是黑盒" },
                  { title: "人工修正留痕", desc: "HR可随时修正AI评分，修正记录用于持续优化模型" },
                  { title: "版本对比", desc: "支持diff查看修改前后差异，决策过程完整留存" },
                ].map((item) => (
                  <div key={item.title} className="flex gap-3">
                    <div className="w-5 h-5 rounded-full bg-cyan-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle2 className="w-3 h-3 text-cyan-600" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{item.title}</div>
                      <div className="text-sm text-gray-500">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
              <Button
                className="mt-8 bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => navigate("/login")}
              >
                体验候选人画像
                <ChevronRight className="ml-1 w-4 h-4" />
              </Button>
            </div>
            <div className="relative">
              <img
                src={AI_ANALYSIS_IMG}
                alt="AI分析可视化"
                className="rounded-2xl shadow-xl w-full"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Skill Hub Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <img
                src={SKILL_HUB_IMG}
                alt="Skill Hub"
                className="rounded-2xl shadow-xl w-full"
              />
            </div>
            <div className="order-1 lg:order-2">
              <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 mb-4">Skill Hub</Badge>
              <h2 className="text-4xl font-extrabold text-gray-900 mb-6" style={{ fontFamily: "'Plus Jakarta Sans', 'Noto Sans SC', sans-serif" }}>
                把招聘经验<br />变成组织资产
              </h2>
              <p className="text-gray-500 mb-6 leading-relaxed">
                优秀面试官和业务经理的识人逻辑，不再随人员流动而流失。
                通过Skill Hub，每个人都能将自己的筛选逻辑沉淀为可复用的AI能力，
                在团队内共享、测试、迭代。
              </p>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { icon: Users, label: "团队共创共享" },
                  { icon: Shield, label: "私有/公开可控" },
                  { icon: Zap, label: "沙盒测试验证" },
                  { icon: BarChart3, label: "效果持续追踪" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2.5 bg-gray-50 rounded-xl p-3">
                    <div className="w-8 h-8 bg-indigo-50 rounded-lg flex items-center justify-center">
                      <item.icon className="w-4 h-4 text-indigo-600" />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <Badge className="bg-indigo-50 text-indigo-700 border-indigo-100 mb-4">客户评价</Badge>
            <h2 className="text-4xl font-extrabold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', 'Noto Sans SC', sans-serif" }}>
              他们都在用葫乐AI
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="bg-white rounded-2xl border border-gray-100 p-6 card-hover">
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">"{t.content}"</p>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{t.name}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{t.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-indigo-600 via-indigo-700 to-cyan-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-extrabold text-white mb-4" style={{ fontFamily: "'Plus Jakarta Sans', 'Noto Sans SC', sans-serif" }}>
            准备好升级你的招聘决策了吗？
          </h2>
          <p className="text-indigo-100 text-lg mb-8">
            免费试用14天，无需信用卡，立即体验AI驱动的智能招聘
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-white text-indigo-700 hover:bg-indigo-50 px-10 h-12 text-base font-semibold shadow-lg"
              onClick={() => navigate("/register")}
            >
              免费注册试用
              <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white/40 text-white hover:bg-white/10 px-10 h-12 text-base font-semibold"
              onClick={() => navigate("/login")}
            >
              直接登录
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <span className="text-white font-bold">葫乐AI</span>
              </div>
              <p className="text-sm leading-relaxed">原子化智能招聘操作系统，让招聘决策更智能、更可信、更可追溯。</p>
            </div>
            {[
              { title: "产品", links: ["智能JD生成", "简历筛选", "候选人画像", "Skill Hub"] },
              { title: "解决方案", links: ["HR招聘专员", "用人经理", "面试官", "招聘负责人"] },
              { title: "公司", links: ["关于我们", "博客", "帮助中心", "隐私政策"] },
            ].map((col) => (
              <div key={col.title}>
                <h4 className="text-white font-semibold mb-4 text-sm">{col.title}</h4>
                <ul className="space-y-2">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm hover:text-white transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            © 2024 葫乐AI智能招聘平台. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
