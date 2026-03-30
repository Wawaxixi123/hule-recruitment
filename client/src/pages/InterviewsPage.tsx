/**
 * Interviews Page - 面试管理
 * Module E: 面试题生成
 * Module F: 面试复盘
 */
import { useState } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Calendar, Clock, Users, Plus, Search, Filter,
  ChevronRight, CheckCircle2, AlertCircle, Sparkles,
  Video, MapPin, Phone, Brain, FileText, Star
} from "lucide-react";
import { mockInterviews, mockCandidates, mockJobs } from "@/lib/mockData";
import { Download } from "lucide-react";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; className: string; icon: typeof CheckCircle2 }> = {
  scheduled: { label: "已安排", className: "bg-amber-50 text-amber-700 border-amber-200", icon: Clock },
  completed: { label: "已完成", className: "bg-emerald-50 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  cancelled: { label: "已取消", className: "bg-red-50 text-red-600 border-red-200", icon: AlertCircle },
  pending: { label: "待安排", className: "bg-gray-50 text-gray-600 border-gray-200", icon: Clock },
};

const typeConfig: Record<string, { label: string; icon: typeof Video }> = {
  online: { label: "视频面试", icon: Video },
  onsite: { label: "现场面试", icon: MapPin },
  phone: { label: "电话面试", icon: Phone },
};

const GENERATED_QUESTIONS = [
  { type: "basic", question: "请介绍一下你在字节跳动主导的AI产品项目，具体是如何推动AI能力落地的？", dimension: "核心技能", time: "5分钟" },
  { type: "deep", question: "你提到通过A/B测试将推荐点击率提升23%，能详细说说这个实验的设计思路和关键决策点吗？", dimension: "数据驱动", time: "8分钟" },
  { type: "deep", question: "在AI产品中，你如何平衡模型准确率和用户体验之间的矛盾？请举一个具体案例。", dimension: "产品思维", time: "8分钟" },
  { type: "risk", question: "你在3年内换了3家公司，能分享一下每次离职的原因和职业规划的考量吗？", dimension: "稳定性验证", time: "5分钟" },
  { type: "management", question: "你有过带团队的经验吗？如何推动算法、工程、设计团队协同完成AI产品交付？", dimension: "管理能力", time: "6分钟" },
  { type: "business", question: "如果你来负责我们的AI招聘产品，你认为最核心的3个功能是什么？为什么？", dimension: "业务理解", time: "10分钟" },
];

export default function InterviewsPage() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState<"list" | "generate" | "review">("list");
  const [search, setSearch] = useState("");
  const [jobFilter, setJobFilter] = useState("all");
  const [selectedCandidate, setSelectedCandidate] = useState(mockCandidates[0]);
  const [generatingQuestions, setGeneratingQuestions] = useState(false);
  const [questionsGenerated, setQuestionsGenerated] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [scores, setScores] = useState<Record<number, number>>({});

  const filtered = mockInterviews.filter((i) => {
    const matchSearch = i.candidateName.includes(search) || i.jobTitle.includes(search);
    const matchJob = jobFilter === "all" || i.jobId === jobFilter;
    return matchSearch && matchJob;
  });

  const handleGenerateQuestions = async () => {
    setGeneratingQuestions(true);
    await new Promise((r) => setTimeout(r, 2000));
    setGeneratingQuestions(false);
    setQuestionsGenerated(true);
    toast.success("面试题生成完成！");
  };

  return (
    <AppLayout breadcrumb={[{ label: "面试管理" }]}>
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">面试管理</h1>
            <p className="text-sm text-gray-500 mt-0.5">管理面试安排，AI生成面试题，记录面试复盘</p>
          </div>
          <Button
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
            onClick={() => toast.success("面试安排功能即将开放")}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            安排面试
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {[
            { key: "list", label: "面试列表" },
            { key: "generate", label: "AI生成面试题" },
            { key: "review", label: "面试复盘" },
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

        {/* Interview List */}
        {activeTab === "list" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="搜索候选人、职位..."
                  className="pl-9 h-9 border-gray-200 w-52"
                />
              </div>
              {/* 岗位快速筛选 */}
              <div className="flex gap-1.5">
                <button
                  onClick={() => setJobFilter("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    jobFilter === "all" ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300"
                  }`}
                >
                  全部岗位
                </button>
                {mockJobs.filter(j => j.status === "active").map(job => (
                  <button
                    key={job.id}
                    onClick={() => setJobFilter(job.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      jobFilter === job.id ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300"
                    }`}
                  >
                    {job.title}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-3">
              {filtered.map((interview) => {
                const StatusIcon = statusConfig[interview.status].icon;
                const TypeIcon = typeConfig[interview.type].icon;
                return (
                  <div
                    key={interview.id}
                    className="bg-white rounded-2xl border border-gray-100 p-4 card-hover cursor-pointer"
                    onClick={() => navigate(`/interviews/${interview.id}`)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-cyan-100 flex items-center justify-center flex-shrink-0">
                          <span className="text-sm font-bold text-indigo-700">{interview.candidateName.slice(0, 1)}</span>
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-bold text-gray-900">{interview.candidateName}</span>
                            <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusConfig[interview.status].className}`}>
                              {statusConfig[interview.status].label}
                            </span>
                          </div>
                          <div className="text-xs text-gray-500 mt-0.5">{interview.jobTitle} · {interview.roundName}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">{interview.scheduledAt}</div>
                        {interview.score && (
                          <div className="text-sm font-bold text-indigo-600 mt-0.5">评分 {interview.score}</div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <TypeIcon className="w-3.5 h-3.5" />
                        {typeConfig[interview.type].label}
                      </div>
                      {interview.duration && (
                        <div className="flex items-center gap-1.5 text-xs text-gray-500">
                          <Clock className="w-3.5 h-3.5" />
                          {interview.duration}分钟
                        </div>
                      )}
                      <div className="flex items-center gap-1.5 text-xs text-gray-500">
                        <Users className="w-3.5 h-3.5" />
                        {interview.interviewers.join("、")}
                      </div>
                      {interview.status === "completed" && (
                        <button
                          className="ml-auto flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTab("review");
                          }}
                        >
                          <Brain className="w-3.5 h-3.5" />
                          AI复盘
                        </button>
                      )}
                      {interview.status === "scheduled" && (
                        <button
                          className="ml-auto flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveTab("generate");
                          }}
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                          生成面试题
                        </button>
                      )}
                    </div>

                    {interview.feedback && (
                      <div className="mt-3 bg-gray-50 rounded-xl p-2.5 text-xs text-gray-600">
                        {interview.feedback}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Generate Questions */}
        {activeTab === "generate" && (
          <div className="max-w-3xl space-y-4">
            {/* Select candidate */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="text-sm font-semibold text-gray-900 mb-3">选择候选人</div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {mockCandidates.slice(0, 4).map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedCandidate(c)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-left transition-all ${
                      selectedCandidate.id === c.id
                        ? "border-indigo-400 bg-indigo-50"
                        : "border-gray-100 hover:border-indigo-200"
                    }`}
                  >
                    <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 flex-shrink-0">
                      {c.name.slice(0, 1)}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-medium text-gray-900 truncate">{c.name}</div>
                      <div className="text-xs text-gray-400 truncate">{c.jobTitle}</div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Generate button */}
            {!questionsGenerated ? (
              <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 border border-indigo-100 rounded-2xl p-5 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-600 to-cyan-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-1">AI面试题生成</h3>
                <p className="text-sm text-gray-500 mb-4">
                  根据 <span className="font-semibold text-indigo-700">{selectedCandidate.name}</span> 的候选人画像和岗位JD，
                  生成差异化面试题，覆盖基础题、深挖题、风险验证题
                </p>
                <Button
                  onClick={handleGenerateQuestions}
                  disabled={generatingQuestions}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8"
                >
                  {generatingQuestions ? (
                    <><span className="animate-spin mr-2">⟳</span>生成中...</>
                  ) : (
                    <><Sparkles className="w-4 h-4 mr-2" />生成面试题</>
                  )}
                </Button>
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-gray-100">
                <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span className="text-sm font-semibold text-gray-900">
                      {selectedCandidate.name} · 面试题 ({GENERATED_QUESTIONS.length}题)
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="border-gray-200 text-xs" onClick={() => setQuestionsGenerated(false)}>
                      重新生成
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-emerald-200 text-emerald-700 text-xs hover:bg-emerald-50"
                      onClick={() => {
                        const content = GENERATED_QUESTIONS.map((q, i) =>
                          `${i+1}. [【${q.type === 'basic' ? '基础题' : q.type === 'deep' ? '深挖题' : q.type === 'risk' ? '风险验证' : q.type === 'management' ? '管理能力' : '业务理解'}】${q.dimension}] ${q.question} (建议时长: ${q.time})`
                        ).join('\n\n');
                        const blob = new Blob([`面试题库 - ${selectedCandidate.name}\n${'='.repeat(40)}\n\n` + content], { type: 'text/plain;charset=utf-8' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url; a.download = `面试题库_${selectedCandidate.name}.txt`;
                        a.click(); URL.revokeObjectURL(url);
                        toast.success('面试题库已导出');
                      }}
                    >
                      <Download className="w-3 h-3 mr-1" />导出题库
                    </Button>
                    <Button size="sm" className="bg-indigo-600 text-white text-xs" onClick={() => toast.success("面试题已保存")}>
                      保存使用
                    </Button>
                  </div>
                </div>
                <div className="divide-y divide-gray-50">
                  {GENERATED_QUESTIONS.map((q, i) => (
                    <div key={i} className="px-5 py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700 flex-shrink-0 mt-0.5">
                          {i + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1.5">
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                              q.type === "basic" ? "bg-gray-100 text-gray-600" :
                              q.type === "deep" ? "bg-indigo-50 text-indigo-700" :
                              q.type === "risk" ? "bg-amber-50 text-amber-700" :
                              q.type === "management" ? "bg-cyan-50 text-cyan-700" :
                              "bg-emerald-50 text-emerald-700"
                            }`}>
                              {q.type === "basic" ? "基础题" :
                               q.type === "deep" ? "深挖题" :
                               q.type === "risk" ? "风险验证" :
                               q.type === "management" ? "管理能力" : "业务理解"}
                            </span>
                            <span className="text-xs text-gray-400">{q.dimension}</span>
                            <span className="text-xs text-gray-400 ml-auto">{q.time}</span>
                          </div>
                          <p className="text-sm text-gray-800 leading-relaxed">{q.question}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Interview Review */}
        {activeTab === "review" && (
          <div className="max-w-3xl space-y-4">
            <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3">
              <Brain className="w-5 h-5 text-indigo-600 flex-shrink-0" />
              <div>
                <div className="text-sm font-semibold text-indigo-900">AI面试复盘</div>
                <div className="text-xs text-indigo-600">基于飞书面试记录，AI自动生成结构化复盘报告</div>
              </div>
              <Badge className="ml-auto bg-indigo-600 text-white border-0">P1</Badge>
            </div>

            {/* Completed interviews */}
            {mockInterviews.filter((i) => i.status === "completed").map((interview) => (
              <div key={interview.id} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-gray-900">{interview.candidateName}</span>
                      <span className="tag-gray">{interview.roundName}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">{interview.scheduledAt} · {interview.interviewers.join("、")}</div>
                  </div>
                  {interview.score && (
                    <div className="text-2xl font-extrabold text-indigo-600" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {interview.score}
                    </div>
                  )}
                </div>

                {interview.feedback && (
                  <div className="bg-gray-50 rounded-xl p-3 mb-4 text-sm text-gray-700">
                    {interview.feedback}
                  </div>
                )}

                {/* AI Review Generation */}
                <div className="space-y-3">
                  <div className="text-xs font-semibold text-gray-500">AI复盘维度评分</div>
                  {["技术能力", "产品思维", "沟通表达", "业务理解", "文化契合"].map((dim, i) => {
                    const score = scores[i] ?? [85, 88, 82, 90, 87][i];
                    return (
                      <div key={dim} className="flex items-center gap-3">
                        <span className="text-xs text-gray-600 w-16 flex-shrink-0">{dim}</span>
                        <div className="flex-1">
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-500 rounded-full transition-all"
                              style={{ width: `${score}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs font-bold text-indigo-600 w-8 text-right">{score}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button
                    size="sm"
                    className="bg-indigo-600 text-white text-xs"
                    onClick={() => toast.success("AI复盘报告已生成")}
                  >
                    <Brain className="w-3.5 h-3.5 mr-1" />
                    生成AI复盘报告
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-gray-200 text-xs"
                    onClick={() => toast.success("已同步至飞书")}
                  >
                    同步至飞书
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
