/**
 * Dashboard Page - 工作台主控制台
 * Design: Card-based overview, key metrics, recent activities, AI copilot
 */
import { useState } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Briefcase, Users, Calendar, TrendingUp, Plus, ArrowRight,
  Brain, Sparkles, ChevronRight, Clock, CheckCircle2,
  AlertCircle, Star, Zap, BarChart3, FileText
} from "lucide-react";
import { mockJobs, mockCandidates, mockInterviews } from "@/lib/mockData";
import { useAuth } from "@/contexts/AuthContext";

const statusColors: Record<string, string> = {
  new: "tag-cyan",
  screening: "tag-indigo",
  interview: "tag-amber",
  offer: "tag-green",
  hired: "tag-green",
  rejected: "tag-red",
};

const statusLabels: Record<string, string> = {
  new: "待筛选",
  screening: "筛选中",
  interview: "面试中",
  offer: "发Offer",
  hired: "已录用",
  rejected: "已淘汰",
};

const aiSuggestions = [
  { icon: Sparkles, text: "发现16份新简历，是否按当前岗位标准筛选？", action: "立即筛选", path: "/candidates" },
  { icon: Brain, text: "候选人李明远与岗位匹配度较高，建议安排终面", action: "查看详情", path: "/candidates/cand-001" },
  { icon: Users, text: "张宇轩、陈思雨适合进行横向对比分析", action: "发起对比", path: "/candidates" },
];

export default function DashboardPage() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [dismissedSuggestions, setDismissedSuggestions] = useState<number[]>([]);

  const activeJobs = mockJobs.filter((j) => j.status === "active").length;
  const totalCandidates = mockCandidates.length;
  const pendingInterviews = mockInterviews.filter((i) => i.status === "scheduled").length;
  const recentCandidates = mockCandidates.slice(0, 5);

  const metrics = [
    { icon: Briefcase, label: "在招职位", value: activeJobs, sub: "共5个职位", color: "indigo", path: "/jobs" },
    { icon: Users, label: "候选人总数", value: totalCandidates, sub: "本月新增12人", color: "cyan", path: "/candidates" },
    { icon: Calendar, label: "待面试", value: pendingInterviews, sub: "本周3场", color: "amber", path: "/interviews" },
    { icon: TrendingUp, label: "AI采纳率", value: "73%", sub: "较上月+5%", color: "green", path: "/analytics" },
  ];

  return (
    <AppLayout title="工作台" breadcrumb={[{ label: "工作台" }]}>
      <div className="p-6 space-y-6">
        {/* Welcome header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">
              早上好，{user?.name || "HR"} 👋
            </h1>
            <p className="text-sm text-gray-500 mt-0.5">今天有 <span className="font-semibold text-indigo-600">3</span> 场面试待安排，<span className="font-semibold text-indigo-600">16</span> 份简历待筛选</p>
          </div>
          <Button
            onClick={() => navigate("/jobs/create")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            创建职位
          </Button>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {metrics.map((m) => (
            <button
              key={m.label}
              onClick={() => navigate(m.path)}
              className="bg-white rounded-2xl border border-gray-100 p-5 text-left card-hover group"
            >
              <div className="flex items-center justify-between mb-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  m.color === "indigo" ? "bg-indigo-50" :
                  m.color === "cyan" ? "bg-cyan-50" :
                  m.color === "amber" ? "bg-amber-50" : "bg-emerald-50"
                }`}>
                  <m.icon className={`w-4.5 h-4.5 ${
                    m.color === "indigo" ? "text-indigo-600" :
                    m.color === "cyan" ? "text-cyan-600" :
                    m.color === "amber" ? "text-amber-600" : "text-emerald-600"
                  }`} />
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors" />
              </div>
              <div className="text-2xl font-bold text-gray-900 mb-0.5" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {m.value}
              </div>
              <div className="text-xs text-gray-500">{m.label}</div>
              <div className="text-xs text-gray-400 mt-0.5">{m.sub}</div>
            </button>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* AI Copilot Suggestions */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-50 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center">
                  <Brain className="w-3.5 h-3.5 text-white" />
                </div>
                <span className="text-sm font-semibold text-gray-900">AI Copilot</span>
                <Badge className="ml-auto bg-indigo-50 text-indigo-700 border-indigo-100 text-xs">
                  {aiSuggestions.length - dismissedSuggestions.length} 条建议
                </Badge>
              </div>
              <div className="p-3 space-y-2">
                {aiSuggestions.map((s, i) => (
                  dismissedSuggestions.includes(i) ? null : (
                    <div key={i} className="copilot-border rounded-xl p-3 bg-white">
                      <div className="flex gap-2.5">
                        <s.icon className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-gray-700 leading-relaxed">{s.text}</p>
                          <div className="flex gap-2 mt-2">
                            <button
                              onClick={() => navigate(s.path)}
                              className="text-xs text-indigo-600 font-medium hover:text-indigo-700"
                            >
                              {s.action} →
                            </button>
                            <button
                              onClick={() => setDismissedSuggestions([...dismissedSuggestions, i])}
                              className="text-xs text-gray-400 hover:text-gray-500"
                            >
                              忽略
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                ))}
                {dismissedSuggestions.length === aiSuggestions.length && (
                  <div className="text-center py-4 text-sm text-gray-400">
                    暂无新建议
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="mt-4 bg-white rounded-2xl border border-gray-100 p-4">
              <div className="text-sm font-semibold text-gray-900 mb-3">快捷操作</div>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: FileText, label: "生成JD", path: "/jobs/create", color: "indigo" },
                  { icon: Users, label: "筛选简历", path: "/candidates", color: "cyan" },
                  { icon: Zap, label: "Skill Hub", path: "/skill-hub", color: "amber" },
                  { icon: BarChart3, label: "数据看板", path: "/analytics", color: "green" },
                ].map((action) => (
                  <button
                    key={action.label}
                    onClick={() => navigate(action.path)}
                    className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-gray-50 hover:bg-indigo-50 hover:text-indigo-700 transition-colors group"
                  >
                    <action.icon className="w-4 h-4 text-gray-500 group-hover:text-indigo-600" />
                    <span className="text-xs text-gray-600 group-hover:text-indigo-700">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Active Jobs */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-gray-100">
              <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">在招职位</span>
                <button
                  onClick={() => navigate("/jobs")}
                  className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  查看全部 <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {mockJobs.filter(j => j.status === "active").slice(0, 4).map((job) => (
                  <div
                    key={job.id}
                    className="px-5 py-3.5 hover:bg-gray-50 cursor-pointer transition-colors"
                    onClick={() => navigate(`/jobs/${job.id}`)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{job.title}</span>
                        <span className="tag-gray">{job.department}</span>
                        <span className="tag-indigo">{job.level}</span>
                      </div>
                      <span className="text-xs text-gray-400">{job.location}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                          <span>招聘进度</span>
                          <span>{job.interviewed}/{job.applied} 已面试</span>
                        </div>
                        <Progress
                          value={(job.interviewed / Math.max(job.applied, 1)) * 100}
                          className="h-1.5"
                        />
                      </div>
                      <div className="flex items-center gap-1 text-xs">
                        <span className="text-gray-400">AI评分</span>
                        <span className="font-semibold text-indigo-600">{job.aiScore}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Candidates */}
            <div className="mt-4 bg-white rounded-2xl border border-gray-100">
              <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">最新候选人</span>
                <button
                  onClick={() => navigate("/candidates")}
                  className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  查看全部 <ArrowRight className="w-3 h-3" />
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {recentCandidates.map((c) => (
                  <div
                    key={c.id}
                    className="px-5 py-3 hover:bg-gray-50 cursor-pointer transition-colors flex items-center gap-3"
                    onClick={() => navigate(`/candidates/${c.id}`)}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-cyan-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-indigo-700">{c.name.slice(0, 1)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{c.name}</span>
                        <span className={statusColors[c.status]}>{statusLabels[c.status]}</span>
                      </div>
                      <div className="text-xs text-gray-400 truncate">{c.currentTitle} · {c.currentCompany}</div>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <div className={`text-sm font-bold ${
                        c.aiScore >= 90 ? "text-emerald-600" :
                        c.aiScore >= 75 ? "text-indigo-600" : "text-amber-600"
                      }`}>
                        {c.aiScore}
                      </div>
                      <Star className={`w-3.5 h-3.5 ${
                        c.recommendation === "strong_yes" ? "fill-amber-400 text-amber-400" : "text-gray-300"
                      }`} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Today's interviews */}
        <div className="bg-white rounded-2xl border border-gray-100">
          <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-900">近期面试安排</span>
            <button
              onClick={() => navigate("/interviews")}
              className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              查看全部 <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-0 divide-y md:divide-y-0 md:divide-x divide-gray-50">
            {mockInterviews.slice(0, 3).map((interview) => (
              <div
                key={interview.id}
                className="px-5 py-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => navigate(`/interviews/${interview.id}`)}
              >
                <div className="flex items-center gap-2 mb-2">
                  {interview.status === "completed" ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : interview.status === "scheduled" ? (
                    <Clock className="w-4 h-4 text-amber-500" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-gray-400" />
                  )}
                  <span className="text-sm font-medium text-gray-900">{interview.candidateName}</span>
                </div>
                <div className="text-xs text-gray-500 mb-1">{interview.jobTitle} · {interview.roundName}</div>
                <div className="text-xs text-gray-400">{interview.scheduledAt}</div>
                {interview.score && (
                  <div className="mt-2 flex items-center gap-1">
                    <span className="text-xs text-gray-400">评分</span>
                    <span className="text-xs font-semibold text-indigo-600">{interview.score}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
