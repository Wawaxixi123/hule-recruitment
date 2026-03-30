/**
 * Skill Hub Page - 技能实验室
 * Module G: Skill Hub技能实验室
 */
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search, Plus, Star, Users, TrendingUp, Shield,
  Sparkles, Filter, ChevronRight, BookOpen, Zap,
  CheckCircle2, Clock, Edit, Share2, Lock
} from "lucide-react";
import { mockSkills } from "@/lib/mockData";
import { toast } from "sonner";

const categoryColors: Record<string, string> = {
  "产品": "bg-indigo-50 text-indigo-700 border-indigo-200",
  "技术": "bg-cyan-50 text-cyan-700 border-cyan-200",
  "HR": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "通用": "bg-amber-50 text-amber-700 border-amber-200",
};

const typeConfig: Record<string, { label: string; icon: typeof Shield; className: string }> = {
  official: { label: "官方认证", icon: Shield, className: "bg-indigo-600 text-white" },
  team: { label: "团队共享", icon: Users, className: "bg-cyan-600 text-white" },
  personal: { label: "个人", icon: BookOpen, className: "bg-gray-500 text-white" },
};

const CREATE_STEPS = [
  { step: 1, title: "描述岗位需求", desc: "用自然语言描述岗位核心要求" },
  { step: 2, title: "AI生成评估维度", desc: "AI自动提取关键评估维度" },
  { step: 3, title: "调整权重", desc: "根据岗位特点调整各维度权重" },
  { step: 4, title: "测试验证", desc: "用历史候选人数据验证准确率" },
  { step: 5, title: "发布使用", desc: "发布到团队或个人使用" },
];

export default function SkillHubPage() {
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<"browse" | "create" | "my">("browse");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [createStep, setCreateStep] = useState(1);
  const [jobDesc, setJobDesc] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedDimensions, setGeneratedDimensions] = useState<{name: string; weight: number; desc: string}[] | null>(null);

  const filtered = mockSkills.filter((s) => {
    const matchSearch = !search || s.name.includes(search) || s.description.includes(search);
    const matchCat = !selectedCategory || s.category === selectedCategory;
    const matchType = !selectedType || s.type === selectedType;
    return matchSearch && matchCat && matchType;
  });

  const categories = Array.from(new Set(mockSkills.map((s) => s.category)));

  const handleGenerateDimensions = async () => {
    if (!jobDesc.trim()) {
      toast.error("请先输入岗位描述");
      return;
    }
    setGenerating(true);
    await new Promise((r) => setTimeout(r, 2000));
    setGenerating(false);
    setGeneratedDimensions([
      { name: "核心技术能力", weight: 30, desc: "评估候选人在岗位核心技术领域的深度和广度" },
      { name: "业务理解力", weight: 25, desc: "评估候选人对业务场景的理解和转化能力" },
      { name: "项目复杂度", weight: 20, desc: "评估候选人主导过的项目规模和复杂程度" },
      { name: "成长潜力", weight: 15, desc: "评估候选人的学习能力和成长轨迹" },
      { name: "稳定性", weight: 10, desc: "评估候选人的职业稳定性和留存意愿" },
    ]);
    setCreateStep(3);
    toast.success("AI已生成评估维度！");
  };

  return (
    <AppLayout breadcrumb={[{ label: "Skill Hub" }]}>
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">Skill Hub 技能实验室</h1>
            <p className="text-sm text-gray-500 mt-0.5">管理和创建AI筛选技能包，提升招聘精准度</p>
          </div>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={() => setActiveTab("create")}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            创建技能包
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "官方技能包", value: "48", icon: Shield, color: "text-indigo-600", bg: "bg-indigo-50" },
            { label: "团队技能包", value: "23", icon: Users, color: "text-cyan-600", bg: "bg-cyan-50" },
            { label: "平均准确率", value: "87%", icon: TrendingUp, color: "text-emerald-600", bg: "bg-emerald-50" },
            { label: "本月使用次数", value: "1,847", icon: Zap, color: "text-amber-600", bg: "bg-amber-50" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className={`w-8 h-8 rounded-xl ${stat.bg} flex items-center justify-center mb-2`}>
                <stat.icon className={`w-4 h-4 ${stat.color}`} />
              </div>
              <div className={`text-2xl font-extrabold ${stat.color}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {stat.value}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {[
            { key: "browse", label: "浏览技能包" },
            { key: "create", label: "创建技能包" },
            { key: "my", label: "我的技能包" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Browse */}
        {activeTab === "browse" && (
          <div className="space-y-4">
            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="搜索技能包..."
                  className="pl-9 h-9 border-gray-200 w-56"
                />
              </div>
              <div className="flex gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(selectedCategory === cat ? null : cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      selectedCategory === cat
                        ? categoryColors[cat] || "bg-gray-100 text-gray-700 border-gray-200"
                        : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
              <div className="flex gap-1.5">
                {["official", "team", "personal"].map((type) => (
                  <button
                    key={type}
                    onClick={() => setSelectedType(selectedType === type ? null : type)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      selectedType === type
                        ? "bg-indigo-600 text-white border-indigo-600"
                        : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    {typeConfig[type].label}
                  </button>
                ))}
              </div>
            </div>

            {/* Skill Cards */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((skill) => {
                const TypeIcon = typeConfig[skill.type].icon;
                return (
                  <div key={skill.id} className="bg-white rounded-2xl border border-gray-100 p-5 card-hover">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${typeConfig[skill.type].className}`}>
                          <TypeIcon className="w-3.5 h-3.5" />
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                          categoryColors[skill.category] || "bg-gray-50 text-gray-600 border-gray-200"
                        }`}>
                          {skill.category}
                        </span>
                      </div>
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                        skill.status === "published" ? "bg-emerald-50 text-emerald-700" :
                        skill.status === "draft" ? "bg-gray-50 text-gray-500" :
                        "bg-amber-50 text-amber-700"
                      }`}>
                        {skill.status === "published" ? "已发布" : skill.status === "draft" ? "草稿" : "审核中"}
                      </span>
                    </div>

                    <h3 className="text-sm font-bold text-gray-900 mb-1.5">{skill.name}</h3>
                    <p className="text-xs text-gray-500 leading-relaxed mb-3 line-clamp-2">{skill.description}</p>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {skill.tags.map((tag) => (
                        <span key={tag} className="text-xs bg-gray-50 text-gray-500 px-2 py-0.5 rounded-full border border-gray-100">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center gap-3 pt-3 border-t border-gray-50 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        {skill.usageCount.toLocaleString()}次使用
                      </div>
                      {skill.accuracy && (
                        <div className="flex items-center gap-1">
                          <TrendingUp className="w-3 h-3" />
                          准确率 {skill.accuracy}%
                        </div>
                      )}
                      <div className="ml-auto text-gray-400">{skill.author}</div>
                    </div>

                    <div className="flex gap-2 mt-3">
                      <Button
                        size="sm"
                        className="flex-1 h-7 bg-indigo-600 text-white text-xs"
                        onClick={() => toast.success(`已应用「${skill.name}」`)}
                      >
                        应用
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 border-gray-200 text-xs"
                        onClick={() => toast.success("已收藏")}
                      >
                        <Star className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Create */}
        {activeTab === "create" && (
          <div className="max-w-2xl space-y-4">
            {/* Steps */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-0">
                {CREATE_STEPS.map((s, i) => (
                  <div key={s.step} className="flex items-center flex-1">
                    <div className="flex flex-col items-center">
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        createStep > s.step ? "bg-emerald-500 text-white" :
                        createStep === s.step ? "bg-indigo-600 text-white" :
                        "bg-gray-100 text-gray-400"
                      }`}>
                        {createStep > s.step ? <CheckCircle2 className="w-4 h-4" /> : s.step}
                      </div>
                      <div className={`text-xs mt-1 text-center w-16 leading-tight ${
                        createStep === s.step ? "text-indigo-700 font-medium" : "text-gray-400"
                      }`}>
                        {s.title}
                      </div>
                    </div>
                    {i < CREATE_STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mb-4 mx-1 ${createStep > s.step ? "bg-emerald-400" : "bg-gray-100"}`} />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Step 1: Describe */}
            {createStep === 1 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">描述岗位需求</h3>
                  <p className="text-xs text-gray-500">用自然语言描述岗位核心要求，AI将自动提取评估维度</p>
                </div>
                <textarea
                  value={jobDesc}
                  onChange={(e) => setJobDesc(e.target.value)}
                  placeholder="例如：我们在招聘一名高级AI产品经理，需要有5年以上产品经验，熟悉AI/ML产品化流程，具备强数据分析能力，有大规模团队协作经验..."
                  className="w-full h-32 border border-gray-200 rounded-xl p-3 text-sm text-gray-700 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-400"
                />
                <Button
                  className="bg-indigo-600 text-white w-full"
                  onClick={handleGenerateDimensions}
                  disabled={generating}
                >
                  {generating ? (
                    <><span className="animate-spin mr-2">⟳</span>AI分析中...</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-2" />AI生成评估维度</>
                  )}
                </Button>
              </div>
            )}

            {/* Step 3: Adjust weights */}
            {createStep === 3 && generatedDimensions && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">调整评估维度权重</h3>
                  <p className="text-xs text-gray-500">AI已生成5个核心评估维度，可根据岗位特点调整权重</p>
                </div>
                <div className="space-y-3">
                  {generatedDimensions.map((dim, i) => (
                    <div key={i} className="border border-gray-100 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-medium text-gray-900">{dim.name}</span>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              const newDims = [...generatedDimensions];
                              newDims[i] = { ...dim, weight: Math.max(5, dim.weight - 5) };
                              setGeneratedDimensions(newDims);
                            }}
                            className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-indigo-400 hover:text-indigo-600"
                          >-</button>
                          <span className="text-sm font-bold text-indigo-600 w-8 text-center">{dim.weight}%</span>
                          <button
                            onClick={() => {
                              const newDims = [...generatedDimensions];
                              newDims[i] = { ...dim, weight: Math.min(50, dim.weight + 5) };
                              setGeneratedDimensions(newDims);
                            }}
                            className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center text-gray-500 hover:border-indigo-400 hover:text-indigo-600"
                          >+</button>
                        </div>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full transition-all" style={{ width: `${dim.weight * 2}%` }} />
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{dim.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="border-gray-200"
                    onClick={() => { setCreateStep(1); setGeneratedDimensions(null); }}
                  >
                    重新描述
                  </Button>
                  <Button
                    className="flex-1 bg-indigo-600 text-white"
                    onClick={() => setCreateStep(4)}
                  >
                    下一步：测试验证
                  </Button>
                </div>
              </div>
            )}

            {/* Step 4: Test */}
            {createStep === 4 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-5 space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">测试验证</h3>
                  <p className="text-xs text-gray-500">使用历史候选人数据验证技能包准确率</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  <div className="text-sm font-bold text-emerald-800">验证通过</div>
                  <div className="text-xs text-emerald-600 mt-1">在15个历史候选人样本中，准确率达到 <span className="font-bold">86%</span></div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="border-gray-200" onClick={() => setCreateStep(3)}>
                    返回调整
                  </Button>
                  <Button
                    className="flex-1 bg-indigo-600 text-white"
                    onClick={() => {
                      toast.success("技能包已发布！");
                      setActiveTab("my");
                      setCreateStep(1);
                      setJobDesc("");
                      setGeneratedDimensions(null);
                    }}
                  >
                    发布技能包
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* My Skills */}
        {activeTab === "my" && (
          <div className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              {mockSkills.filter((s) => s.author === "张晓雯" || s.type === "personal").map((skill) => (
                <div key={skill.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-bold text-gray-900">{skill.name}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      skill.status === "published" ? "bg-emerald-50 text-emerald-700" :
                      skill.status === "draft" ? "bg-gray-50 text-gray-500" :
                      "bg-amber-50 text-amber-700"
                    }`}>
                      {skill.status === "published" ? "已发布" : skill.status === "draft" ? "草稿" : "审核中"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-3">{skill.description}</p>
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                    <span>{skill.usageCount}次使用</span>
                    {skill.accuracy && <span>准确率 {skill.accuracy}%</span>}
                    <span>{skill.createdAt}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-gray-200 text-xs" onClick={() => toast.success("进入编辑模式")}>
                      <Edit className="w-3 h-3 mr-1" />编辑
                    </Button>
                    <Button size="sm" variant="outline" className="border-gray-200 text-xs" onClick={() => toast.success("已分享到团队")}>
                      <Share2 className="w-3 h-3 mr-1" />分享
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
