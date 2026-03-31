/**
 * Job Create Page - 职位创建 + 智能JD生成
 * Module A: 智能JD生成
 * Design: AI-Native, White background, Indigo + Cyan palette
 */
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain, Sparkles, Loader2, CheckCircle2, AlertTriangle,
  RefreshCw, Save, ChevronRight, X, Wand2, ArrowLeft,
  Copy, Download, Edit3, Eye, FileText, Target, Users,
  Lightbulb, Shield, TrendingUp
} from "lucide-react";
import { toast } from "sonner";
import BossPublishModal from "@/components/BossPublishModal";

const GENERATED_JD = {
  title: "高级AI产品经理",
  responsibilities: [
    "负责AI产品线的整体规划与路线图制定，推动AI能力在产品中的深度落地",
    "深入理解业务场景，将业务需求转化为可执行的AI产品方案",
    "与算法、工程、设计团队紧密协作，推动产品从0到1的交付",
    "建立产品数据体系，通过数据驱动产品迭代优化",
    "跟踪行业AI技术趋势，识别产品创新机会",
    "管理产品路线图，协调跨部门资源，确保项目按时交付",
  ],
  requirements: [
    "5年以上产品经理经验，其中2年以上AI/ML产品经验",
    "深入理解机器学习、自然语言处理等AI技术原理",
    "具备强数据分析能力，熟练使用SQL、Python等数据工具",
    "有大规模用户产品（DAU 100万+）的完整产品生命周期经验",
    "优秀的跨部门沟通协调能力和项目管理能力",
    "本科及以上学历，计算机、数学、统计学等相关专业优先",
  ],
  preferred: [
    "有推荐系统、搜索、NLP等AI产品的实战经验",
    "有B端AI产品或企业服务产品经验",
    "有团队管理经验（3人以上）",
  ],
  notRecommended: [
    "避免写入具体年龄限制（合规要求）",
    "不建议要求'985/211'等学历歧视性条款",
  ],
  skills: ["AI产品规划", "数据分析", "用户研究", "项目管理", "跨部门协作", "机器学习基础"],
  interviewDimensions: ["技术理解深度", "产品思维", "数据驱动能力", "业务影响力", "团队协作"],
  warnings: ["要求'5年经验+P7级别'与薪资范围30-50K可能存在市场偏差，建议确认薪资竞争力"],
  marketInsight: {
    avgSalary: "35-55K",
    supplyDemand: "供不应求",
    hotSkills: ["大模型产品化", "AI Agent", "数据飞轮"],
    avgExperience: "4.5年",
  }
};

const GENERATING_STEPS = [
  { label: "解析岗位需求", progress: 20 },
  { label: "匹配职级标准", progress: 40 },
  { label: "生成职责描述", progress: 60 },
  { label: "优化任职资格", progress: 80 },
  { label: "合规性检查", progress: 95 },
  { label: "生成完成", progress: 100 },
];

export default function JobCreatePage() {
  const [, navigate] = useLocation();
  const [step, setStep] = useState<"input" | "generating" | "result">("input");
  const [genStep, setGenStep] = useState(0);
  const [genProgress, setGenProgress] = useState(0);
  const [form, setForm] = useState({
    title: "",
    department: "",
    experience: "",
    summary: "",
    skills: "",
    management: "",
    location: "",
    salary: "",
    level: "",
    headcount: "",
  });
  const [generatedJD, setGeneratedJD] = useState<typeof GENERATED_JD | null>(null);
  const [activeTab, setActiveTab] = useState<"preview" | "edit">("preview");
  const [editedContent, setEditedContent] = useState("");

  const handleChange = (field: string) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleGenerate = async () => {
    if (!form.title) {
      toast.error("请至少填写岗位名称");
      return;
    }
    setStep("generating");
    setGenStep(0);
    setGenProgress(0);

    // Simulate step-by-step generation
    for (let i = 0; i < GENERATING_STEPS.length; i++) {
      await new Promise((r) => setTimeout(r, 400));
      setGenStep(i);
      setGenProgress(GENERATING_STEPS[i].progress);
    }

    await new Promise((r) => setTimeout(r, 300));
    const jd = { ...GENERATED_JD, title: form.title || GENERATED_JD.title };
    setGeneratedJD(jd);
    setEditedContent(
      `# ${jd.title}\n\n## 岗位职责\n${jd.responsibilities.map((r) => `- ${r}`).join("\n")}\n\n## 任职资格\n${jd.requirements.map((r) => `- ${r}`).join("\n")}\n\n## 优先条件\n${jd.preferred.map((r) => `- ${r}`).join("\n")}`
    );
    setStep("result");
    toast.success("JD生成完成！");
  };

  const [bossModalOpen, setBossModalOpen] = useState(false);

  const handleSave = () => {
    toast.success("职位已保存，正在跳转...");
    setTimeout(() => navigate("/jobs"), 1000);
  };

  const handleCopy = () => {
    const text = `${generatedJD?.title}\n\n职责：\n${generatedJD?.responsibilities.join("\n")}\n\n要求：\n${generatedJD?.requirements.join("\n")}`;
    navigator.clipboard.writeText(text).then(() => toast.success("JD内容已复制到剪贴板"));
  };

  return (
    <AppLayout breadcrumb={[{ label: "职位管理", path: "/jobs" }, { label: "创建职位" }]}>
      <div className="p-6">
        {/* Input Step */}
        {step === "input" && (
          <div className="max-w-3xl mx-auto">
            <div className="mb-6">
              <h1 className="text-xl font-bold text-gray-900">创建职位</h1>
              <p className="text-sm text-gray-500 mt-1">填写基础信息，AI将自动生成结构化JD</p>
            </div>

            {/* AI tip banner */}
            <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 border border-indigo-100 rounded-2xl p-4 mb-6 flex items-start gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-cyan-500 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <div className="text-sm font-semibold text-indigo-900 mb-1">AI智能JD生成</div>
                <div className="text-xs text-indigo-600 leading-relaxed">
                  只需填写岗位名称和核心需求，AI将自动生成结构化JD，包含职责描述、任职资格、面试维度建议，并进行合规性检查。
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              {/* Basic Info */}
              <div>
                <div className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-indigo-600" />
                  基础信息
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">
                      岗位名称 <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      value={form.title}
                      onChange={handleChange("title")}
                      placeholder="例如：高级AI产品经理"
                      className="h-10 border-gray-200 focus:border-indigo-400"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">所属部门</Label>
                    <Input
                      value={form.department}
                      onChange={handleChange("department")}
                      placeholder="例如：产品部"
                      className="h-10 border-gray-200 focus:border-indigo-400"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">职级</Label>
                    <select
                      value={form.level}
                      onChange={handleChange("level")}
                      className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400"
                    >
                      <option value="">请选择职级</option>
                      {["P4", "P5", "P6", "P7", "P8", "P9", "M1", "M2", "M3"].map((l) => (
                        <option key={l} value={l}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">工作地点</Label>
                    <Input
                      value={form.location}
                      onChange={handleChange("location")}
                      placeholder="例如：北京"
                      className="h-10 border-gray-200 focus:border-indigo-400"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">薪资范围</Label>
                    <Input
                      value={form.salary}
                      onChange={handleChange("salary")}
                      placeholder="例如：30-50K"
                      className="h-10 border-gray-200 focus:border-indigo-400"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">招聘人数</Label>
                    <Input
                      value={form.headcount}
                      onChange={handleChange("headcount")}
                      placeholder="例如：2"
                      type="number"
                      className="h-10 border-gray-200 focus:border-indigo-400"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-sm font-medium text-gray-700">经验要求</Label>
                    <select
                      value={form.experience}
                      onChange={handleChange("experience")}
                      className="w-full h-10 border border-gray-200 rounded-lg px-3 text-sm text-gray-700 focus:outline-none focus:ring-1 focus:ring-indigo-400 focus:border-indigo-400"
                    >
                      <option value="">请选择</option>
                      <option value="0-1">应届/1年以内</option>
                      <option value="1-3">1-3年</option>
                      <option value="3-5">3-5年</option>
                      <option value="5-8">5-8年</option>
                      <option value="8+">8年以上</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Core Requirements */}
              <div>
                <div className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-600" />
                  核心需求描述
                  <span className="text-xs text-gray-400 font-normal">（越详细，AI生成效果越好）</span>
                </div>
                <Textarea
                  value={form.summary}
                  onChange={handleChange("summary")}
                  placeholder="描述这个岗位的核心职责和最重要的能力要求，例如：负责AI推荐系统的产品化，需要有大模型产品经验，能够和算法团队深度协作..."
                  className="min-h-[100px] border-gray-200 focus:border-indigo-400 text-sm resize-none"
                />
              </div>

              {/* Skills */}
              <div>
                <div className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Lightbulb className="w-4 h-4 text-indigo-600" />
                  关键技能标签
                  <span className="text-xs text-gray-400 font-normal">（用逗号分隔）</span>
                </div>
                <Input
                  value={form.skills}
                  onChange={handleChange("skills")}
                  placeholder="例如：AI产品规划, 数据分析, Python, 用户研究"
                  className="h-10 border-gray-200 focus:border-indigo-400"
                />
              </div>

              {/* Management */}
              <div>
                <div className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  管理要求
                </div>
                <div className="flex gap-3">
                  {["不需要", "带1-3人小组", "带3-10人团队", "带10人以上团队"].map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setForm((prev) => ({ ...prev, management: opt }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        form.management === opt
                          ? "bg-indigo-600 text-white border-indigo-600"
                          : "border-gray-200 text-gray-600 hover:border-indigo-300"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => navigate("/jobs")}
                  className="border-gray-200"
                >
                  取消
                </Button>
                <Button
                  onClick={handleGenerate}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
                >
                  <Wand2 className="w-4 h-4 mr-2" />
                  AI生成JD
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Generating Step */}
        {step === "generating" && (
          <div className="max-w-lg mx-auto mt-20">
            <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-5">
                <Brain className="w-8 h-8 text-white animate-pulse" />
              </div>
              <h2 className="text-lg font-bold text-gray-900 mb-1">AI正在生成JD</h2>
              <p className="text-sm text-gray-500 mb-6">
                正在为「{form.title || "该职位"}」生成结构化职位描述...
              </p>

              <div className="mb-5">
                <Progress value={genProgress} className="h-2 mb-3" />
                <div className="text-sm font-medium text-indigo-600">
                  {GENERATING_STEPS[genStep]?.label}...
                </div>
              </div>

              <div className="space-y-2">
                {GENERATING_STEPS.map((s, i) => (
                  <div key={s.label} className={`flex items-center gap-2 text-xs transition-all ${
                    i < genStep ? "text-emerald-600" :
                    i === genStep ? "text-indigo-600 font-medium" :
                    "text-gray-300"
                  }`}>
                    {i < genStep ? (
                      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" />
                    ) : i === genStep ? (
                      <Loader2 className="w-3.5 h-3.5 flex-shrink-0 animate-spin" />
                    ) : (
                      <div className="w-3.5 h-3.5 rounded-full border border-gray-200 flex-shrink-0" />
                    )}
                    {s.label}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Result Step */}
        {step === "result" && generatedJD && (
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h1 className="text-xl font-bold text-gray-900">JD生成完成</h1>
                <p className="text-sm text-gray-500 mt-0.5">AI已生成结构化JD，请检查并确认</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-200"
                  onClick={() => setStep("input")}
                >
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" />
                  重新填写
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="border-gray-200"
                  onClick={handleCopy}
                >
                  <Copy className="w-3.5 h-3.5 mr-1.5" />
                  复制JD
                </Button>
                <Button
                  size="sm"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  onClick={handleSave}
                >
                  <Save className="w-3.5 h-3.5 mr-1.5" />
                  保存职位
                </Button>
                <Button
                  size="sm"
                  className="text-white font-medium"
                  style={{ background: "#00C8A0" }}
                  onClick={() => setBossModalOpen(true)}
                >
                  <span className="w-4 h-4 rounded flex items-center justify-center text-white text-[10px] font-black mr-1.5" style={{ background: "rgba(0,0,0,0.15)" }}>B</span>
                  发布到BOSS
                </Button>
              </div>
            </div>

            {/* Warning */}
            {generatedJD.warnings.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5 flex items-start gap-3">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-sm font-semibold text-amber-900 mb-1">AI合规提示</div>
                  {generatedJD.warnings.map((w, i) => (
                    <p key={i} className="text-xs text-amber-700">{w}</p>
                  ))}
                </div>
              </div>
            )}

            <div className="grid lg:grid-cols-3 gap-5">
              {/* Main JD Content */}
              <div className="lg:col-span-2 space-y-4">
                {/* Tabs */}
                <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
                  {[
                    { key: "preview", label: "预览", icon: Eye },
                    { key: "edit", label: "编辑", icon: Edit3 },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as "preview" | "edit")}
                      className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        activeTab === tab.key
                          ? "bg-white text-gray-900 shadow-sm"
                          : "text-gray-500 hover:text-gray-700"
                      }`}
                    >
                      <tab.icon className="w-3.5 h-3.5" />
                      {tab.label}
                    </button>
                  ))}
                </div>

                {activeTab === "preview" ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-bold text-gray-900">{generatedJD.title}</h2>
                      <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">AI生成</Badge>
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <div className="w-1 h-4 bg-indigo-600 rounded-full" />
                        岗位职责
                      </div>
                      <ul className="space-y-2">
                        {generatedJD.responsibilities.map((r, i) => (
                          <li key={i} className="flex gap-2.5 text-sm text-gray-700">
                            <span className="text-indigo-400 font-bold flex-shrink-0 mt-0.5">{i + 1}.</span>
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <div className="w-1 h-4 bg-cyan-500 rounded-full" />
                        任职资格
                      </div>
                      <ul className="space-y-2">
                        {generatedJD.requirements.map((r, i) => (
                          <li key={i} className="flex gap-2.5 text-sm text-gray-700">
                            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <div className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
                        <div className="w-1 h-4 bg-amber-400 rounded-full" />
                        优先条件
                      </div>
                      <ul className="space-y-1.5">
                        {generatedJD.preferred.map((r, i) => (
                          <li key={i} className="flex gap-2.5 text-sm text-gray-600">
                            <span className="text-amber-400 flex-shrink-0">✦</span>
                            {r}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Not recommended */}
                    <div className="bg-red-50 border border-red-100 rounded-xl p-3">
                      <div className="text-xs font-semibold text-red-700 mb-1.5 flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5" />
                        合规建议（AI标注，请勿写入JD）
                      </div>
                      {generatedJD.notRecommended.map((r, i) => (
                        <div key={i} className="text-xs text-red-600 flex gap-1.5">
                          <X className="w-3 h-3 flex-shrink-0 mt-0.5" />
                          {r}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="bg-white rounded-2xl border border-gray-100 p-4">
                    <Textarea
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      className="min-h-[400px] border-0 focus:ring-0 text-sm font-mono resize-none p-0"
                    />
                  </div>
                )}
              </div>

              {/* Right Panel */}
              <div className="space-y-4">
                {/* Skills */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                  <div className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    AI提取技能标签
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {generatedJD.skills.map((skill) => (
                      <span key={skill} className="tag-indigo">{skill}</span>
                    ))}
                  </div>
                </div>

                {/* Interview Dimensions */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4">
                  <div className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Target className="w-4 h-4 text-cyan-600" />
                    建议面试维度
                  </div>
                  <div className="space-y-2">
                    {generatedJD.interviewDimensions.map((dim, i) => (
                      <div key={dim} className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-indigo-50 flex items-center justify-center text-xs font-bold text-indigo-600 flex-shrink-0">
                          {i + 1}
                        </div>
                        <span className="text-sm text-gray-700">{dim}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Market Insight */}
                <div className="bg-gradient-to-br from-indigo-50 to-cyan-50 border border-indigo-100 rounded-2xl p-4">
                  <div className="text-sm font-semibold text-indigo-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-600" />
                    市场洞察
                  </div>
                  <div className="space-y-2.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">市场薪资范围</span>
                      <span className="font-semibold text-indigo-700">{generatedJD.marketInsight.avgSalary}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">供需状况</span>
                      <span className="font-semibold text-amber-600">{generatedJD.marketInsight.supplyDemand}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">平均经验要求</span>
                      <span className="font-semibold text-gray-700">{generatedJD.marketInsight.avgExperience}</span>
                    </div>
                    <div>
                      <div className="text-xs text-gray-600 mb-1.5">热门技能趋势</div>
                      <div className="flex flex-wrap gap-1">
                        {generatedJD.marketInsight.hotSkills.map((s) => (
                          <span key={s} className="text-xs bg-white border border-indigo-200 text-indigo-700 px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 space-y-2">
                  <Button
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={handleSave}
                  >
                    <Save className="w-4 h-4 mr-2" />
                    保存并发布职位
                  </Button>
                  <Button
                    className="w-full text-white font-semibold"
                    style={{ background: "#00C8A0" }}
                    onClick={() => setBossModalOpen(true)}
                  >
                    <span className="w-5 h-5 rounded-md flex items-center justify-center text-white text-xs font-black mr-2" style={{ background: "rgba(0,0,0,0.15)" }}>B</span>
                    一键发布到 BOSS 直聘
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-gray-200"
                    onClick={handleGenerate}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    重新生成
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-gray-200"
                    onClick={() => navigate("/candidates")}
                  >
                    <ChevronRight className="w-4 h-4 mr-2" />
                    发布后导入简历
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <BossPublishModal
        open={bossModalOpen}
        onClose={() => setBossModalOpen(false)}
        jobTitle={generatedJD?.title || form.title}
        jobDescription={generatedJD ? `${generatedJD.responsibilities.join("\n")}` : ""}
      />
    </AppLayout>
  );
}
