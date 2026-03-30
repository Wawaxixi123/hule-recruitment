/**
 * Analytics Page - 数据分析看板
 * Module I: 分析看板
 */
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import {
  TrendingUp, Users, Clock, Target, Brain, Zap,
  BarChart3, PieChart, Activity, Download, RefreshCw
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, FunnelChart, Funnel, LabelList, Cell,
  RadarChart, PolarGrid, PolarAngleAxis, Radar, Legend, AreaChart, Area
} from "recharts";
import { analyticsData } from "@/lib/mockData";
import { toast } from "sonner";

const FUNNEL_COLORS = [
  "#4f46e5", "#6366f1", "#818cf8", "#a5b4fc", "#c7d2fe", "#e0e7ff", "#f0f4ff"
];

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "funnel" | "ai" | "skill">("overview");
  const [dateRange, setDateRange] = useState("近30天");

  const kpis = [
    { label: "招聘周期", value: `${analyticsData.avgTimeToHire}天`, change: "-3天", trend: "down", icon: Clock, color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Offer接受率", value: `${analyticsData.offerAcceptRate}%`, change: "+5%", trend: "up", icon: Target, color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "AI采纳率", value: `${analyticsData.aiAdoptionRate}%`, change: "+8%", trend: "up", icon: Brain, color: "text-cyan-600", bg: "bg-cyan-50" },
    { label: "人工修正率", value: `${analyticsData.manualCorrectionRate}%`, change: "-2%", trend: "down", icon: Zap, color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <AppLayout breadcrumb={[{ label: "数据分析" }]}>
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">招聘数据看板</h1>
            <p className="text-sm text-gray-500 mt-0.5">全面洞察招聘效率与AI使用情况</p>
          </div>
          <div className="flex items-center gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 text-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-400"
            >
              <option>近7天</option>
              <option>近30天</option>
              <option>近90天</option>
              <option>近一年</option>
            </select>
            <Button variant="outline" size="sm" className="border-gray-200" onClick={() => toast.success("数据已刷新")}>
              <RefreshCw className="w-3.5 h-3.5 mr-1" />刷新
            </Button>
            <Button size="sm" className="bg-indigo-600 text-white" onClick={() => toast.success("报告导出中...")}>
              <Download className="w-3.5 h-3.5 mr-1" />导出报告
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {kpis.map((kpi) => (
            <div key={kpi.label} className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className={`w-8 h-8 rounded-xl ${kpi.bg} flex items-center justify-center mb-2`}>
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <div className={`text-2xl font-extrabold ${kpi.color}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {kpi.value}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{kpi.label}</div>
              <div className={`text-xs font-medium mt-1 ${kpi.trend === "up" ? "text-emerald-600" : "text-indigo-600"}`}>
                {kpi.change} vs 上月
              </div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {[
            { key: "overview", label: "总览" },
            { key: "funnel", label: "招聘漏斗" },
            { key: "ai", label: "AI效能" },
            { key: "skill", label: "技能热力图" },
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

        {/* Overview */}
        {activeTab === "overview" && (
          <div className="grid lg:grid-cols-2 gap-5">
            {/* Monthly Trend */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Activity className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-semibold text-gray-900">月度招聘趋势</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={analyticsData.monthlyTrend}>
                  <defs>
                    <linearGradient id="appGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="hireGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }} />
                  <Area type="monotone" dataKey="applications" name="投递量" stroke="#4f46e5" fill="url(#appGrad)" strokeWidth={2} />
                  <Area type="monotone" dataKey="hires" name="录用量" stroke="#06b6d4" fill="url(#hireGrad)" strokeWidth={2} />
                  <Legend />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Job Status Distribution */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-semibold text-gray-900">各职位招聘进度</span>
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={[
                  { name: "AI产品经理", applied: 48, shortlisted: 12, interviewed: 6 },
                  { name: "ML工程师", applied: 73, shortlisted: 18, interviewed: 8 },
                  { name: "HRBP", applied: 31, shortlisted: 8, interviewed: 4 },
                  { name: "前端工程师", applied: 56, shortlisted: 14, interviewed: 5 },
                ]} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: "#9ca3af" }} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} width={80} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="applied" name="投递" fill="#e0e7ff" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="shortlisted" name="筛选" fill="#818cf8" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="interviewed" name="面试" fill="#4f46e5" radius={[0, 4, 4, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Funnel */}
        {activeTab === "funnel" && (
          <div className="grid lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="text-sm font-semibold text-gray-900 mb-4">招聘漏斗转化率</div>
              <div className="space-y-2">
                {analyticsData.funnel.map((stage, i) => (
                  <div key={stage.stage} className="flex items-center gap-3">
                    <div className="w-20 text-xs text-gray-600 text-right flex-shrink-0">{stage.stage}</div>
                    <div className="flex-1 h-8 relative">
                      <div
                        className="h-full rounded-lg flex items-center justify-end pr-3 transition-all"
                        style={{
                          width: `${stage.rate}%`,
                          backgroundColor: FUNNEL_COLORS[i],
                          minWidth: 60,
                        }}
                      >
                        <span className="text-xs font-bold text-white">{stage.count}</span>
                      </div>
                    </div>
                    <div className="w-12 text-xs text-gray-400 flex-shrink-0">{stage.rate}%</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="text-sm font-semibold text-gray-900 mb-4">阶段转化率分析</div>
              <div className="space-y-3">
                {analyticsData.funnel.slice(0, -1).map((stage, i) => {
                  const next = analyticsData.funnel[i + 1];
                  const rate = ((next.count / stage.count) * 100).toFixed(1);
                  return (
                    <div key={stage.stage} className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                      <div className="text-xs text-gray-600 flex-1">
                        {stage.stage} → {next.stage}
                      </div>
                      <div className="text-sm font-bold text-indigo-600">{rate}%</div>
                      <div className={`w-2 h-2 rounded-full ${parseFloat(rate) > 50 ? "bg-emerald-400" : parseFloat(rate) > 30 ? "bg-amber-400" : "bg-red-400"}`} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* AI Efficiency */}
        {activeTab === "ai" && (
          <div className="grid lg:grid-cols-2 gap-5">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="w-4 h-4 text-indigo-600" />
                <span className="text-sm font-semibold text-gray-900">AI效能指标</span>
              </div>
              <div className="space-y-4">
                {[
                  { label: "AI筛选采纳率", value: analyticsData.aiAdoptionRate, desc: "HR接受AI推荐结果的比例", color: "#4f46e5" },
                  { label: "人工修正率", value: analyticsData.manualCorrectionRate, desc: "HR主动修正AI评分的比例", color: "#f59e0b" },
                  { label: "AI准确率（验证）", value: 84, desc: "AI推荐与最终录用的一致率", color: "#10b981" },
                  { label: "简历解析准确率", value: 96, desc: "简历结构化解析的字段准确率", color: "#06b6d4" },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm text-gray-700">{item.label}</span>
                      <span className="text-sm font-bold" style={{ color: item.color }}>{item.value}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{ width: `${item.value}%`, backgroundColor: item.color }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 mt-1">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="text-sm font-semibold text-gray-900 mb-4">AI vs 人工效率对比</div>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={[
                  { name: "简历筛选", ai: 2, human: 45 },
                  { name: "候选人评估", ai: 5, human: 30 },
                  { name: "面试题生成", ai: 1, human: 20 },
                  { name: "复盘报告", ai: 3, human: 60 },
                ]}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                  <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#6b7280" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#9ca3af" }} unit="分钟" />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v: number) => [`${v}分钟`]} />
                  <Bar dataKey="ai" name="AI处理" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="human" name="人工处理" fill="#e5e7eb" radius={[4, 4, 0, 0]} />
                  <Legend />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Skill Heatmap */}
        {activeTab === "skill" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="text-sm font-semibold text-gray-900 mb-4">技能供需热力图</div>
            <div className="space-y-3">
              {analyticsData.skillHeatmap.map((item) => (
                <div key={item.skill} className="flex items-center gap-4">
                  <div className="w-16 text-sm font-medium text-gray-700 flex-shrink-0">{item.skill}</div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-8">需求</span>
                      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${item.demand}%` }} />
                      </div>
                      <span className="text-xs font-bold text-indigo-600 w-8">{item.demand}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-400 w-8">供给</span>
                      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-cyan-400 rounded-full" style={{ width: `${item.supply}%` }} />
                      </div>
                      <span className="text-xs font-bold text-cyan-600 w-8">{item.supply}</span>
                    </div>
                  </div>
                  <div className={`w-16 text-xs font-medium text-right flex-shrink-0 ${
                    item.demand - item.supply > 30 ? "text-red-500" :
                    item.demand - item.supply > 15 ? "text-amber-500" : "text-emerald-500"
                  }`}>
                    {item.demand - item.supply > 30 ? "严重缺口" :
                     item.demand - item.supply > 15 ? "供需偏紧" : "供需平衡"}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
              <span className="font-semibold">AI洞察：</span>
              「大模型」和「NLP」技能需求旺盛但供给严重不足，建议扩大候选人来源渠道，或考虑内部培训转型。
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
