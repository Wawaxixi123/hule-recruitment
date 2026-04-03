/**
 * Candidate Detail Page - 候选人画像
 * Module C: 候选人画像页
 */
import { useState } from "react";
import { useParams } from "wouter";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Brain, Star, AlertTriangle, CheckCircle2, Edit, Calendar,
  GitCompare, ChevronDown, ChevronUp, Sparkles, MessageSquare,
  ThumbsUp, ThumbsDown, RotateCcw, FileText, TrendingUp, Download
} from "lucide-react";
import { mockCandidates } from "@/lib/mockData";
import { useNavigate } from "@/hooks/useNavigate";
import { toast } from "sonner";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip
} from "recharts";

const dimensionLabels: Record<string, string> = {
  coreSkill: "核心技能",
  businessMatch: "业务匹配",
  projectComplexity: "项目复杂度",
  levelMatch: "职级匹配",
  growthPotential: "成长潜力",
  stability: "稳定性",
};

export default function CandidateDetailPage() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const candidate = mockCandidates.find((c) => c.id === params.id) || mockCandidates[0];
  const [expandedDim, setExpandedDim] = useState<string | null>(null);
  const [editingScore, setEditingScore] = useState<string | null>(null);
  const [editedScores, setEditedScores] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState<"profile" | "resume" | "interview">("profile");

  const radarData = Object.entries(candidate.dimensions).map(([key, value]) => ({
    subject: dimensionLabels[key] || key,
    score: value,
    fullMark: 100,
  }));

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-600";
    if (score >= 75) return "text-indigo-600";
    if (score >= 60) return "text-amber-600";
    return "text-red-500";
  };

  const getScoreBg = (score: number) => {
    if (score >= 90) return "bg-emerald-50";
    if (score >= 75) return "bg-indigo-50";
    if (score >= 60) return "bg-amber-50";
    return "bg-red-50";
  };

  const handleScoreEdit = (dim: string, newScore: number) => {
    setEditedScores((prev) => ({ ...prev, [dim]: newScore }));
    toast.success(`已修正「${dimensionLabels[dim]}」评分为 ${newScore}，修正记录已保存`);
    setEditingScore(null);
  };

  return (
    <AppLayout
      breadcrumb={[
        { label: "候选人", path: "/candidates" },
        { label: candidate.name },
      ]}
    >
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
                {candidate.name.slice(0, 1)}
              </div>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-gray-900">{candidate.name}</h1>
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                    candidate.recommendation === "strong_yes"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : candidate.recommendation === "yes"
                      ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                      : "bg-amber-50 text-amber-700 border-amber-200"
                  }`}>
                    {candidate.recommendation === "strong_yes" ? "强推" :
                     candidate.recommendation === "yes" ? "推荐" : "待定"}
                  </span>
                </div>
                <div className="text-sm text-gray-600">{candidate.currentTitle} · {candidate.currentCompany}</div>
                <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                  <span>{candidate.experience}年经验</span>
                  <span>{candidate.education}</span>
                  <span>{candidate.location}</span>
                  <span>应聘：{candidate.jobTitle}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                onClick={() => {
                  const lines = [
                    `候选人画像报告 - ${candidate.name}`,
                    `${'='.repeat(40)}`,
                    `基本信息`,
                    `岗位：${candidate.jobTitle}`,
                    `当前职位：${candidate.currentTitle} @ ${candidate.currentCompany}`,
                    `经验：${candidate.experience}年 | 学历：${candidate.education} | 地点：${candidate.location}`,
                    ``,
                    `AI综合评分：${candidate.aiScore}/100`,
                    `AI推荐：${candidate.recommendation === 'strong_yes' ? '强烈推荐' : candidate.recommendation === 'yes' ? '推荐' : '待定'}`,
                    ``,
                    `各维度评分`,
                    ...Object.entries(candidate.dimensions).map(([k,v]) => `  ${dimensionLabels[k] || k}: ${v}/100`),
                    ``,
                    `AI结论`,
                    candidate.aiConclusion || candidate.summary || '',
                    ``,
                    `优势`,
                    ...(candidate.strengths || []).map(s => `  • ${s}`),
                    ``,
                    `风险点`,
                    ...(candidate.riskTags || []).map(r => `  ⚠ ${r}`),
                  ];
                  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url; a.download = `候选人画像_${candidate.name}.txt`;
                  a.click(); URL.revokeObjectURL(url);
                  toast.success('候选人画像已导出');
                }}
              >
                <Download className="w-3.5 h-3.5 mr-1.5" />
                导出画像
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="border-gray-200"
                onClick={() => navigate(`/candidates/compare?ids=${candidate.id}`)}
              >
                <GitCompare className="w-3.5 h-3.5 mr-1.5" />
                加入对比
              </Button>
              <Button
                size="sm"
                className="bg-indigo-600 text-white"
                onClick={() => navigate("/interviews")}
              >
                <Calendar className="w-3.5 h-3.5 mr-1.5" />
                安排面试
              </Button>
            </div>
          </div>

          {/* Quick score */}
          <div className="mt-4 pt-4 border-t border-gray-50 flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className={`text-3xl font-extrabold ${getScoreColor(candidate.aiScore)}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {candidate.aiScore}
              </div>
              <div>
                <div className="text-xs text-gray-500">AI综合评分</div>
                <div className="flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-indigo-500" />
                  <span className="text-xs text-indigo-600">AI生成</span>
                </div>
              </div>
            </div>
            <div className="h-8 w-px bg-gray-100" />
            {candidate.riskTags && candidate.riskTags.length > 0 && (
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <div className="flex gap-1.5">
                  {candidate.riskTags.map((tag) => (
                    <span key={tag} className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <div className="ml-auto flex gap-2">
              <button
                onClick={() => toast.success("已标记为推荐")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-medium hover:bg-emerald-100 transition-colors"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                推荐
              </button>
              <button
                onClick={() => toast.error("已标记为淘汰")}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-50 text-red-600 text-xs font-medium hover:bg-red-100 transition-colors"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                淘汰
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {[
            { key: "profile", label: "候选人画像" },
            { key: "resume", label: "简历详情" },
            { key: "interview", label: "面试记录" },
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

        {activeTab === "profile" && (
          <div className="grid lg:grid-cols-3 gap-5">
            {/* Radar Chart */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-semibold text-gray-900">能力雷达图</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#e5e7eb" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#6b7280" }} />
                  <Radar
                    name="评分"
                    dataKey="score"
                    stroke="#4f46e5"
                    fill="#4f46e5"
                    fillOpacity={0.15}
                    strokeWidth={2}
                  />
                  <Tooltip
                    formatter={(value: number) => [`${value}分`, "评分"]}
                    contentStyle={{ fontSize: 12, borderRadius: 8 }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* Dimension Scores */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-semibold text-gray-900">维度评分详情</span>
                </div>
                <span className="text-xs text-gray-400">点击展开证据 · 可修正评分</span>
              </div>
              <div className="space-y-3">
                {Object.entries(candidate.dimensions).map(([key, score]) => {
                  const displayScore = editedScores[key] ?? score;
                  const isExpanded = expandedDim === key;
                  const isEditing = editingScore === key;
                  const evidence = candidate.evidence?.[key] || [];

                  return (
                    <div key={key} className={`rounded-xl border transition-all ${
                      isExpanded ? "border-indigo-200 bg-indigo-50/30" : "border-gray-100"
                    }`}>
                      <div
                        className="flex items-center gap-3 p-3 cursor-pointer"
                        onClick={() => setExpandedDim(isExpanded ? null : key)}
                      >
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${getScoreBg(displayScore)} ${getScoreColor(displayScore)}`}>
                          {displayScore}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900">{dimensionLabels[key]}</span>
                            {editedScores[key] && (
                              <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">已修正</span>
                            )}
                          </div>
                          <Progress value={displayScore} className="h-1.5" />
                        </div>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400 flex-shrink-0" />
                        )}
                      </div>

                      {isExpanded && (
                        <div className="px-3 pb-3 space-y-2">
                          {/* Evidence */}
                          {evidence.length > 0 && (
                            <div className="space-y-1.5">
                              <div className="text-xs font-semibold text-gray-500">AI评分依据</div>
                              {evidence.map((ev, i) => (
                                <div key={i} className="flex gap-2 bg-white rounded-lg p-2.5 border border-gray-100">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0 mt-0.5" />
                                  <span className="text-xs text-gray-700">{ev}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Edit score */}
                          <div className="flex items-center gap-2 pt-1">
                            {isEditing ? (
                              <div className="flex items-center gap-2">
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  defaultValue={displayScore}
                                  className="w-16 h-7 border border-indigo-300 rounded-lg text-xs text-center focus:outline-none focus:ring-1 focus:ring-indigo-400"
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                      handleScoreEdit(key, parseInt((e.target as HTMLInputElement).value));
                                    }
                                  }}
                                />
                                <button
                                  className="text-xs text-indigo-600 hover:text-indigo-700"
                                  onClick={() => setEditingScore(null)}
                                >
                                  取消
                                </button>
                              </div>
                            ) : (
                              <button
                                onClick={() => setEditingScore(key)}
                                className="flex items-center gap-1 text-xs text-gray-400 hover:text-indigo-600 transition-colors"
                              >
                                <Edit className="w-3 h-3" />
                                修正评分
                              </button>
                            )}
                            {editedScores[key] && (
                              <button
                                onClick={() => {
                                  const newScores = { ...editedScores };
                                  delete newScores[key];
                                  setEditedScores(newScores);
                                  toast.success("已恢复AI原始评分");
                                }}
                                className="flex items-center gap-1 text-xs text-gray-400 hover:text-amber-600 transition-colors ml-2"
                              >
                                <RotateCcw className="w-3 h-3" />
                                恢复原始
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Enneagram Personality */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                  <Star className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-900">九型人格评估</span>
                <span className="text-xs text-gray-400 ml-auto">AI 识别 · 评估岗位匹配度</span>
              </div>
              <div className="grid md:grid-cols-2 gap-5">
                {/* Personality Type Card */}
                <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-100 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xl font-black">3</div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">第三型 · 成就者</p>
                      <p className="text-xs text-violet-600 font-medium">目标导向 · 高效执行 · 强烈成功欲</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    候选人展现出明显的成就导向特征，善于设定目标并高效推进。在面试中展现出对结果的高度关注和强烈的驱动力，适合需要快速迭代和业务产出的岗位。
                  </p>
                </div>
                {/* Job & Team Match */}
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-gray-700">岗位匹配度</span>
                      <span className="text-xs font-bold text-violet-600">88%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full" style={{ width: "88%" }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">高度匹配，成就导向与岗位需求高度吸引</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-xs font-medium text-gray-700">团队文化匹配</span>
                      <span className="text-xs font-bold text-emerald-600">82%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full" style={{ width: "82%" }} />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">与现有团队文化匹配良好，融入风险低</p>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 rounded-lg px-3 py-2">
                    <p className="text-xs text-amber-700"><span className="font-semibold">注意事项：</span>第三型候选人在工作压力大时可能过度关注外在表现，建议面试中考察其应对失败的方式。</p>
                  </div>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => toast.info("九型人格详细报告即将上线")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-50 hover:bg-violet-100 border border-violet-100 rounded-lg text-violet-700 text-xs font-medium transition-colors">
                  <Star className="w-3 h-3" />查看详细报告
                </button>
                <button onClick={() => toast.info("功能即将上线")}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg text-gray-600 text-xs font-medium transition-colors">
                  重新识别
                </button>
              </div>
            </div>

            {/* AI Conclusion */}
            <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center">
                  <Brain className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-900">AI综合结论</span>
                <span className="text-xs text-gray-400 ml-auto">可修正 · 修正记录留存</span>
              </div>
              <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-xl p-4 border border-indigo-100">
                <p className="text-sm text-gray-700 leading-relaxed">{candidate.aiConclusion}</p>
              </div>
              <div className="flex gap-2 mt-3">
                <Button
                  size="sm"
                  variant="outline"
                  className="border-gray-200 text-xs"
                  onClick={() => toast.success("已记录修正意见")}
                >
                  <Edit className="w-3 h-3 mr-1" />
                  修正结论
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="border-gray-200 text-xs"
                  onClick={() => navigate("/interviews")}
                >
                  <MessageSquare className="w-3 h-3 mr-1" />
                  生成面试题
                </Button>
              </div>
            </div>
          </div>
        )}

        {activeTab === "resume" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center gap-2 mb-5">
              <FileText className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold text-gray-900">简历详情</span>
              <span className="text-xs text-gray-400 ml-auto">AI解析 · 结构化展示</span>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">工作经历</h3>
                <div className="space-y-4">
                  {candidate.workHistory?.map((w, i) => (
                    <div key={i} className="relative pl-4 border-l-2 border-indigo-100">
                      <div className="absolute -left-1.5 top-1 w-3 h-3 rounded-full bg-indigo-200 border-2 border-white" />
                      <div className="text-sm font-semibold text-gray-900">{w.title}</div>
                      <div className="text-xs text-gray-500">{w.company} · {w.period}</div>
                      <p className="text-xs text-gray-600 mt-1 leading-relaxed">{w.description}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">教育背景</h3>
                <div className="space-y-3 mb-5">
                  {candidate.educationHistory?.map((e, i) => (
                    <div key={i} className="bg-gray-50 rounded-xl p-3">
                      <div className="text-sm font-semibold text-gray-900">{e.school}</div>
                      <div className="text-xs text-gray-500">{e.major} · {e.degree} · {e.period}</div>
                    </div>
                  ))}
                </div>
                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">技能标签</h3>
                <div className="flex flex-wrap gap-1.5">
                  {candidate.skills?.map((s) => (
                    <span key={s} className="tag-indigo">{s}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "interview" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-semibold text-gray-900">面试记录</span>
              </div>
              <Button
                size="sm"
                className="bg-indigo-600 text-white"
                onClick={() => navigate("/interviews")}
              >
                安排面试
              </Button>
            </div>
            {candidate.interviews && candidate.interviews.length > 0 ? (
              <div className="space-y-3">
                {candidate.interviews.map((interview, i) => (
                  <div key={i} className="border border-gray-100 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-gray-900">{interview.round}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                          interview.result === "pass" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          interview.result === "fail" ? "bg-red-50 text-red-600 border-red-200" :
                          "bg-amber-50 text-amber-700 border-amber-200"
                        }`}>
                          {interview.result === "pass" ? "通过" : interview.result === "fail" ? "未通过" : "待定"}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">{interview.date}</span>
                    </div>
                    <div className="text-xs text-gray-500 mb-2">面试官：{interview.interviewer}</div>
                    {interview.feedback && (
                      <p className="text-xs text-gray-700 bg-gray-50 rounded-lg p-2.5">{interview.feedback}</p>
                    )}
                    {interview.score && (
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-xs text-gray-400">面试评分</span>
                        <span className={`text-sm font-bold ${getScoreColor(interview.score)}`}>{interview.score}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-400">
                <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">暂无面试记录</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
