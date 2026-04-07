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
  Video, MapPin, Phone, Brain, FileText, Star,
  Upload, PlayCircle, X, Settings
} from "lucide-react";
import { mockInterviews, mockCandidates, mockJobs } from "@/lib/mockData";
import { Download } from "lucide-react";
import { toast } from "sonner";
import FeishuConfigModal from "@/components/FeishuConfigModal";
import { useFeishu } from "@/contexts/FeishuContext";
import { useLocation as useWouterLocation } from "wouter";

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
  // 视频录制弹窗
  const [videoModal, setVideoModal] = useState<{ open: boolean; interviewId: string; candidateName: string; jobTitle: string; mode: "feishu" | "upload" | null }>({ open: false, interviewId: "", candidateName: "", jobTitle: "", mode: null });
  const [uploadFile, setUploadFile] = useState<string>("");
  // 飞书配置状态（全局共享）
  const { config: feishuConfig } = useFeishu();
  // 飞书配置弹窗（独立，用于未授权时引导配置）
  const [feishuConfigOpen, setFeishuConfigOpen] = useState(false);
  // 未授权提示弹窗
  const [feishuAlertOpen, setFeishuAlertOpen] = useState(false);
  // 演示用：第一个候选人未配置，第二个候选人已配置（通过内置演示配置实现）
  const [demoAuthorizedIds] = useState<Set<string>>(new Set(["int-002", "int-003"]));
  const [, navigateTo] = useWouterLocation();

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
          <div className="flex items-center gap-2">
            <button
              onClick={() => setFeishuConfigOpen(true)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${
                feishuConfig?.authorized
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : "border-gray-200 bg-white text-gray-600 hover:bg-gray-50"
              }`}
            >
              <Video className="w-4 h-4" />
              飞书录制
              {feishuConfig?.authorized ? (
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              ) : (
                <span className="w-1.5 h-1.5 rounded-full bg-gray-300" />
              )}
            </button>
            <Button
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => toast.success("面试安排功能即将开放")}
            >
              <Plus className="w-4 h-4 mr-1.5" />
              安排面试
            </Button>
          </div>
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

                    {/* 视频录制操作区 */}
                    <div className="mt-3 pt-3 border-t border-gray-50 flex items-center gap-2 flex-wrap">
                      {/* 演示逻辑：
                          - int-001 (李明远 HR初面): 未配置飞书 → 弹出提示引导配置
                          - int-002 (李明远 技术面): 已配置 → 直接创建会议
                          - 其他: 全局飞书配置状态决定
                      */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          const isDemo_configured = demoAuthorizedIds.has(interview.id);
                          const isConfigured = isDemo_configured || (feishuConfig?.authorized ?? false);
                          if (!isConfigured) {
                            setFeishuAlertOpen(true);
                          } else {
                            setVideoModal({ open: true, interviewId: interview.id, candidateName: interview.candidateName, jobTitle: interview.jobTitle, mode: "feishu" });
                          }
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                      >
                        <Video className="w-3.5 h-3.5" />
                        视频录制（飞书自动）
                        {demoAuthorizedIds.has(interview.id) && (
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="飞书已授权" />
                        )}
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setVideoModal({ open: true, interviewId: interview.id, candidateName: interview.candidateName, jobTitle: interview.jobTitle, mode: "upload" });
                        }}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200 transition-colors"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        手动导入视频
                      </button>
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

        {/* 飞书未配置提示弹窗 */}
        {feishuAlertOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setFeishuAlertOpen(false)}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm mx-4 p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-start gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">飞书录制尚未配置</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    使用飞书自动录制功能前，需要先配置飞书应用参数并授权飞书账号。
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => { setFeishuAlertOpen(false); navigateTo("/feishu-record"); }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  前往飞书录制设置
                </button>
                <button onClick={() => setFeishuAlertOpen(false)} className="px-4 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50">
                  取消
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 飞书配置弹窗（完整配置流程） */}
        <FeishuConfigModal
          open={feishuConfigOpen || (videoModal.open && videoModal.mode === "feishu")}
          onClose={() => { setFeishuConfigOpen(false); setVideoModal(v => ({ ...v, open: false })); }}
          config={feishuConfig}
          onSaveConfig={() => {}}
          prefill={{ candidateName: videoModal.candidateName, jobTitle: videoModal.jobTitle }}
          onCreateMeeting={() => { setVideoModal(v => ({ ...v, open: false })); }}
        />

        {/* 手动导入视频弹窗 */}
        {videoModal.open && videoModal.mode === "upload" && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setVideoModal(v => ({ ...v, open: false }))}>
            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">手动导入视频</h3>
                  <p className="text-xs text-gray-400 mt-0.5">候选人：{videoModal.candidateName}</p>
                </div>
                <button onClick={() => setVideoModal(v => ({ ...v, open: false }))} className="p-1.5 rounded-lg hover:bg-gray-100">
                  <X className="w-4 h-4 text-gray-500" />
                </button>
              </div>
              <div className="space-y-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Upload className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-medium text-gray-800">上传本地录制视频</span>
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed">
                      支持 MP4、MOV、AVI 格式，上传后 Horo AI 将自动转录并生成面试分析报告。
                    </p>
                  </div>

                  <div
                    className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center cursor-pointer hover:border-indigo-300 hover:bg-indigo-50/30 transition-all"
                    onClick={() => { setUploadFile("面试录制_" + videoModal.candidateName + ".mp4"); toast.info("已选择文件"); }}
                  >
                    {uploadFile ? (
                      <div className="flex items-center justify-center gap-2">
                        <PlayCircle className="w-5 h-5 text-indigo-600" />
                        <span className="text-sm text-indigo-700 font-medium">{uploadFile}</span>
                      </div>
                    ) : (
                      <div>
                        <Upload className="w-8 h-8 mx-auto text-gray-300 mb-2" />
                        <p className="text-sm text-gray-500">点击选择视频文件</p>
                        <p className="text-xs text-gray-400 mt-1">MP4 / MOV / AVI，最大 2 GB</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        if (!uploadFile) { toast.warning("请先选择视频文件"); return; }
                        toast.success("视频上传成功，Horo AI 正在分析...");
                        setVideoModal(v => ({ ...v, open: false }));
                        setUploadFile("");
                      }}
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-xl transition-colors"
                    >
                      上传并分析
                    </button>
                    <button onClick={() => { setVideoModal(v => ({ ...v, open: false })); setUploadFile(""); }} className="px-4 py-2.5 border border-gray-200 text-gray-600 text-sm rounded-xl hover:bg-gray-50">
                      取消
                    </button>
                  </div>
              </div>
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

                {/* 视频录制区域 */}
                <div className="mb-4 bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
                    <div className="flex items-center gap-2">
                      <Video className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="text-xs font-semibold text-gray-700">面试录制视频</span>
                    </div>
                    {interview.id === "int-001" ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-700">
                        <Clock className="w-2.5 h-2.5" />待同步
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700">
                        <CheckCircle2 className="w-2.5 h-2.5" />已同步
                      </span>
                    )}
                  </div>
                  {interview.id === "int-001" ? (
                    <div className="px-4 py-4 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center flex-shrink-0">
                        <AlertCircle className="w-5 h-5 text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-gray-600 leading-relaxed">未检测到飞书录制视频，可能尚未配置飞书录制或会议尚未结束。</p>
                      </div>
                      <button
                        onClick={() => setVideoModal({ open: true, interviewId: interview.id, candidateName: interview.candidateName, jobTitle: interview.jobTitle, mode: "upload" })}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors flex-shrink-0"
                      >
                        <Upload className="w-3 h-3" />手动导入
                      </button>
                    </div>
                  ) : (
                    <div className="px-4 py-3">
                      {/* 视频播放卡片 */}
                      <div className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 mb-3">
                        <div className="w-14 h-10 bg-gradient-to-br from-indigo-900 to-slate-800 rounded-lg flex items-center justify-center flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity" onClick={() => toast.info("视频播放功能即将开放")}>
                          <PlayCircle className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-semibold text-gray-800 truncate">面试录制视频 · {interview.candidateName}</div>
                          <div className="text-xs text-gray-400 mt-0.5">录制时长: 1分34秒 · 已同步到 OSS</div>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button onClick={() => toast.info("视频链接已复制")} className="px-2.5 py-1.5 text-[11px] font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors">查看视频</button>
                          <button onClick={() => toast.success("Horo AI 正在分析视频...", { description: "预计 2-3 分钟内完成" })} className="px-2.5 py-1.5 text-[11px] font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors">发起分析</button>
                        </div>
                      </div>
                      {/* AI 转写摘要 */}
                      <div className="bg-indigo-50/60 rounded-xl p-3">
                        <div className="flex items-center gap-1.5 mb-2">
                          <Brain className="w-3 h-3 text-indigo-500" />
                          <span className="text-[11px] font-semibold text-indigo-700">AI 转写摘要</span>
                          <span className="ml-auto text-[10px] text-indigo-400">分析完成</span>
                        </div>
                        <p className="text-xs text-indigo-800 leading-relaxed">候选人表达清晰，对 AI 产品经验丰富，重点介绍了在字节跳动主导的 AI 推荐系统优化项目，通过 A/B 测试将推荐点击率提升 23%。对行业趋势有深刻理解，建议进入技术面。</p>
                      </div>
                    </div>
                  )}
                </div>

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
