/**
 * Candidate Compare Page - 候选人对比决策Canvas
 * Module D: 候选人对比决策Canvas
 */
import { useState } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Brain, Star, AlertTriangle, CheckCircle2, X, Plus,
  ThumbsUp, ThumbsDown, Sparkles, GitCompare, ChevronDown, Download
} from "lucide-react";
import { mockCandidates } from "@/lib/mockData";
import { toast } from "sonner";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Legend, Tooltip
} from "recharts";

const COLORS = ["#4f46e5", "#06b6d4", "#f59e0b", "#10b981"];

const dimensionLabels: Record<string, string> = {
  coreSkill: "核心技能",
  businessMatch: "业务匹配",
  projectComplexity: "项目复杂度",
  levelMatch: "职级匹配",
  growthPotential: "成长潜力",
  stability: "稳定性",
};

export default function CandidateComparePage() {
  const [, navigate] = useLocation();
  const [selectedIds, setSelectedIds] = useState<string[]>(
    mockCandidates.slice(0, 3).map((c) => c.id)
  );
  const [aiAnalysisVisible, setAiAnalysisVisible] = useState(false);
  const [loadingAnalysis, setLoadingAnalysis] = useState(false);

  const candidates = mockCandidates.filter((c) => selectedIds.includes(c.id));
  const allCandidates = mockCandidates;

  const radarData = Object.keys(dimensionLabels).map((key) => ({
    subject: dimensionLabels[key],
    ...candidates.reduce((acc, c, i) => ({
      ...acc,
      [`candidate${i}`]: c.dimensions?.[key] ?? 80,
    }), {}),
  }));

  const handleAddCandidate = (id: string) => {
    if (selectedIds.length >= 4) {
      toast.error("最多同时对比4位候选人");
      return;
    }
    setSelectedIds([...selectedIds, id]);
  };

  const handleRemoveCandidate = (id: string) => {
    if (selectedIds.length <= 2) {
      toast.error("至少保留2位候选人");
      return;
    }
    setSelectedIds(selectedIds.filter((x) => x !== id));
  };

  const handleAIAnalysis = async () => {
    setLoadingAnalysis(true);
    await new Promise((r) => setTimeout(r, 2000));
    setLoadingAnalysis(false);
    setAiAnalysisVisible(true);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return "text-emerald-600";
    if (score >= 75) return "text-indigo-600";
    return "text-amber-600";
  };

  const getHighlight = (values: number[]) => {
    const max = Math.max(...values);
    return values.map((v) => v === max);
  };

  return (
    <AppLayout
      breadcrumb={[
        { label: "候选人", path: "/candidates" },
        { label: "对比分析" },
      ]}
    >
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">候选人对比 Canvas</h1>
            <p className="text-sm text-gray-500 mt-0.5">横向对比多位候选人，AI辅助决策</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
              onClick={() => {
                const lines = [
                  `候选人对比报告`,
                  `${'='.repeat(50)}`,
                  `对比候选人：${candidates.map(c => c.name).join('、')}`,
                  `生成时间：${new Date().toLocaleString('zh-CN')}`,
                  ``,
                  `各维度评分对比`,
                  '-'.repeat(50),
                  ...Object.entries(dimensionLabels).map(([key, label]) => {
                    const scores = candidates.map(c => `${c.name}: ${c.dimensions?.[key] ?? 80}`).join(' | ');
                    return `${label}: ${scores}`;
                  }),
                  ``,
                  `AI综合评分`,
                  '-'.repeat(50),
                  ...candidates.map(c => `${c.name}: ${c.aiScore}/100 (${c.recommendation === 'strong_yes' ? '强烈推荐' : c.recommendation === 'yes' ? '推荐' : '待定'})`),
                  ``,
                  `候选人优势总结`,
                  '-'.repeat(50),
                  ...candidates.map(c => [
                    `《${c.name}》`,
                    ...(c.strengths || []).map(s => `  + ${s}`),
                    ...(c.riskTags || []).map(r => `  - 风险：${r}`),
                  ].join('\n')),
                ];
                const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url; a.download = `候选人对比报告_${new Date().toLocaleDateString('zh-CN').replace(/\//g,'-')}.txt`;
                a.click(); URL.revokeObjectURL(url);
                toast.success('对比报告已导出');
              }}
            >
              <Download className="w-4 h-4 mr-1.5" />导出报告
            </Button>
            <Button
              onClick={handleAIAnalysis}
              disabled={loadingAnalysis}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {loadingAnalysis ? (
                <><span className="animate-spin mr-2">⟳</span>AI分析中...</>
              ) : (
                <><Sparkles className="w-4 h-4 mr-1.5" />AI综合分析</>
              )}
            </Button>
          </div>
        </div>

        {/* Candidate Selector */}
        <div className="bg-white rounded-2xl border border-gray-100 p-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-sm font-medium text-gray-700">对比候选人：</span>
            {candidates.map((c, i) => (
              <div
                key={c.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm font-medium"
                style={{ borderColor: COLORS[i], color: COLORS[i], backgroundColor: `${COLORS[i]}10` }}
              >
                <span>{c.name}</span>
                <button
                  onClick={() => handleRemoveCandidate(c.id)}
                  className="hover:opacity-70"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {selectedIds.length < 4 && (
              <div className="relative">
                <select
                  className="text-sm border border-dashed border-gray-300 rounded-full px-3 py-1.5 text-gray-500 bg-transparent cursor-pointer hover:border-indigo-400 focus:outline-none"
                  onChange={(e) => {
                    if (e.target.value) {
                      handleAddCandidate(e.target.value);
                      e.target.value = "";
                    }
                  }}
                  defaultValue=""
                >
                  <option value="" disabled>+ 添加候选人</option>
                  {allCandidates
                    .filter((c) => !selectedIds.includes(c.id))
                    .map((c) => (
                      <option key={c.id} value={c.id}>{c.name} - {c.jobTitle}</option>
                    ))}
                </select>
              </div>
            )}
          </div>
        </div>

        {/* AI Analysis */}
        {aiAnalysisVisible && (
          <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 border border-indigo-100 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center">
                <Brain className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-indigo-900">AI对比分析结论</span>
              <button onClick={() => setAiAnalysisVisible(false)} className="ml-auto text-indigo-400 hover:text-indigo-600">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="grid md:grid-cols-3 gap-4">
              {candidates.map((c, i) => (
                <div key={c.id} className="bg-white rounded-xl p-3 border border-indigo-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-5 h-5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-sm font-semibold text-gray-900">{c.name}</span>
                    <span className={`text-xs font-bold ml-auto ${getScoreColor(c.aiScore)}`}>{c.aiScore}</span>
                  </div>
                  <p className="text-xs text-gray-600 leading-relaxed">
                    {c.recommendation === "strong_yes" ? "✅ 强推进入终面" :
                     c.recommendation === "yes" ? "👍 推荐进入下一轮" : "⚠️ 需进一步评估"}
                    {" · "}
                    {c.strengths?.[0] || "综合能力较强"}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-3 text-xs text-indigo-700 bg-white rounded-xl p-3 border border-indigo-100">
              <span className="font-semibold">AI建议：</span>
              综合对比来看，{candidates.sort((a, b) => b.aiScore - a.aiScore)[0]?.name}在核心技能和职级匹配度上最为突出，建议优先推进；
              {candidates.sort((a, b) => b.aiScore - a.aiScore)[1]?.name}稳定性更高，适合需要长期稳定的岗位。
            </div>
          </div>
        )}

        {/* Radar Chart Comparison */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="text-sm font-semibold text-gray-900 mb-4">能力雷达对比</div>
          <ResponsiveContainer width="100%" height={280}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: "#6b7280" }} />
              {candidates.map((c, i) => (
                <Radar
                  key={c.id}
                  name={c.name}
                  dataKey={`candidate${i}`}
                  stroke={COLORS[i]}
                  fill={COLORS[i]}
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              ))}
              <Legend />
              <Tooltip
                formatter={(value: number, name: string) => [`${value}分`, name]}
                contentStyle={{ fontSize: 12, borderRadius: 8 }}
              />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Dimension-by-dimension comparison */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-50">
            <span className="text-sm font-semibold text-gray-900">维度对比详情</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-50">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 w-32">维度</th>
                  {candidates.map((c, i) => (
                    <th key={c.id} className="text-center px-4 py-3 text-xs font-semibold" style={{ color: COLORS[i] }}>
                      {c.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {Object.entries(dimensionLabels).map(([key, label]) => {
                  const values = candidates.map((c) => c.dimensions?.[key] ?? 80);
                  const highlights = getHighlight(values);
                  return (
                    <tr key={key} className="hover:bg-gray-50">
                      <td className="px-5 py-3 text-sm font-medium text-gray-700">{label}</td>
                      {candidates.map((c, i) => {
                        const score = c.dimensions?.[key] ?? 80;
                        return (
                          <td key={c.id} className="px-4 py-3 text-center">
                            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-xl text-sm font-bold ${
                              highlights[i] ? "bg-indigo-600 text-white" : "bg-gray-50 text-gray-700"
                            }`}>
                              {score}
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
                {/* Overall */}
                <tr className="bg-gray-50">
                  <td className="px-5 py-3 text-sm font-bold text-gray-900">综合评分</td>
                  {candidates.map((c, i) => {
                    const values = candidates.map((x) => x.aiScore);
                    const isMax = c.aiScore === Math.max(...values);
                    return (
                      <td key={c.id} className="px-4 py-3 text-center">
                        <div className={`inline-flex items-center justify-center w-12 h-10 rounded-xl text-base font-bold ${
                          isMax ? "bg-indigo-600 text-white" : "bg-white text-gray-700 border border-gray-200"
                        }`}>
                          {c.aiScore}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Candidate Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {candidates.map((c, i) => (
            <div key={c.id} className="bg-white rounded-2xl border border-gray-100 p-5" style={{ borderTopColor: COLORS[i], borderTopWidth: 3 }}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm" style={{ backgroundColor: COLORS[i] }}>
                  {c.name.slice(0, 1)}
                </div>
                <div>
                  <div className="text-sm font-bold text-gray-900">{c.name}</div>
                  <div className="text-xs text-gray-400">{c.currentTitle} · {c.currentCompany}</div>
                </div>
                <div className={`ml-auto text-lg font-extrabold ${getScoreColor(c.aiScore)}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {c.aiScore}
                </div>
              </div>

              {/* Strengths */}
              <div className="mb-3">
                <div className="text-xs font-semibold text-gray-500 mb-1.5">优势</div>
                <div className="space-y-1">
                  {c.strengths?.slice(0, 2).map((s, j) => (
                    <div key={j} className="flex gap-1.5 text-xs text-gray-700">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
                      {s}
                    </div>
                  ))}
                </div>
              </div>

              {/* Risks */}
              {c.riskTags && c.riskTags.length > 0 && (
                <div className="mb-3">
                  <div className="text-xs font-semibold text-gray-500 mb-1.5">风险</div>
                  <div className="space-y-1">
                    {c.riskTags.map((tag, j) => (
                      <div key={j} className="flex gap-1.5 text-xs text-amber-700">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-2 pt-3 border-t border-gray-50">
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1 h-8 text-xs text-emerald-700 hover:bg-emerald-50"
                  onClick={() => toast.success(`已推进 ${c.name} 进入下一轮`)}
                >
                  <ThumbsUp className="w-3.5 h-3.5 mr-1" />
                  推进
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1 h-8 text-xs text-gray-600 hover:bg-gray-50"
                  onClick={() => navigate(`/candidates/${c.id}`)}
                >
                  查看画像
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="flex-1 h-8 text-xs text-red-600 hover:bg-red-50"
                  onClick={() => toast.error(`已淘汰 ${c.name}`)}
                >
                  <ThumbsDown className="w-3.5 h-3.5 mr-1" />
                  淘汰
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}
