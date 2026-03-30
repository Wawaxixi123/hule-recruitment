/**
 * Job Detail Page - 职位详情
 */
import { useLocation, useParams } from "wouter";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  MapPin, Users, Calendar, Edit, Upload, Sparkles,
  CheckCircle2, ChevronRight, ArrowLeft
} from "lucide-react";
import { mockJobs, mockCandidates } from "@/lib/mockData";
import { useNavigate } from "@/hooks/useNavigate";

export default function JobDetailPage() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const job = mockJobs.find((j) => j.id === params.id) || mockJobs[0];
  const candidates = mockCandidates.filter((c) => c.jobId === job.id);

  return (
    <AppLayout
      breadcrumb={[
        { label: "职位管理", path: "/jobs" },
        { label: job.title },
      ]}
    >
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-gray-900">{job.title}</h1>
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs px-2 py-0.5 rounded-full font-medium">
                招聘中
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{job.location}</div>
              <div className="flex items-center gap-1"><Users className="w-3.5 h-3.5" />招 {job.headcount} 人</div>
              <div className="flex items-center gap-1"><Calendar className="w-3.5 h-3.5" />{job.createdAt}</div>
              <span className="tag-indigo">{job.level}</span>
              {job.salary && <span className="text-indigo-600 font-medium">{job.salary}</span>}
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="border-gray-200">
              <Edit className="w-3.5 h-3.5 mr-1.5" />
              编辑JD
            </Button>
            <Button size="sm" className="bg-indigo-600 text-white" onClick={() => navigate("/candidates")}>
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              导入简历
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-4">
            {/* Funnel stats */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="text-sm font-semibold text-gray-900 mb-4">招聘漏斗</div>
              <div className="grid grid-cols-4 gap-4 mb-4">
                {[
                  { label: "投递", value: job.applied, color: "text-gray-900" },
                  { label: "入围", value: job.shortlisted, color: "text-indigo-600" },
                  { label: "面试", value: job.interviewed, color: "text-cyan-600" },
                  { label: "Offer", value: 2, color: "text-emerald-600" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <div className={`text-2xl font-bold ${s.color}`} style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                      {s.value}
                    </div>
                    <div className="text-xs text-gray-500">{s.label}</div>
                  </div>
                ))}
              </div>
              <Progress value={(job.interviewed / Math.max(job.applied, 1)) * 100} className="h-2" />
            </div>

            {/* JD Content */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="text-sm font-semibold text-gray-900">职位描述</div>
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-xs text-gray-500">AI生成 · v1.0</span>
                </div>
              </div>

              {job.description && (
                <p className="text-sm text-gray-700 mb-4">{job.description}</p>
              )}

              {job.requirements && (
                <div className="mb-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">任职要求</div>
                  <ul className="space-y-1.5">
                    {job.requirements.map((r, i) => (
                      <li key={i} className="flex gap-2 text-sm text-gray-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        {r}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {job.skills && (
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">能力标签</div>
                  <div className="flex flex-wrap gap-1.5">
                    {job.skills.map((s) => (
                      <span key={s} className="tag-indigo">{s}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Candidates preview */}
            <div className="bg-white rounded-2xl border border-gray-100">
              <div className="px-5 py-4 border-b border-gray-50 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">候选人 ({candidates.length})</span>
                <button
                  onClick={() => navigate(`/candidates?jobId=${job.id}`)}
                  className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                >
                  查看全部 <ChevronRight className="w-3 h-3" />
                </button>
              </div>
              <div className="divide-y divide-gray-50">
                {candidates.slice(0, 3).map((c) => (
                  <div
                    key={c.id}
                    className="px-5 py-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3"
                    onClick={() => navigate(`/candidates/${c.id}`)}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-cyan-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-xs font-semibold text-indigo-700">{c.name.slice(0, 1)}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900">{c.name}</div>
                      <div className="text-xs text-gray-400">{c.currentTitle} · {c.currentCompany}</div>
                    </div>
                    <div className={`text-sm font-bold ${c.aiScore >= 90 ? "text-emerald-600" : c.aiScore >= 75 ? "text-indigo-600" : "text-amber-600"}`}>
                      {c.aiScore}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="text-sm font-semibold text-gray-900 mb-3">AI质量评分</div>
              <div className="text-4xl font-extrabold ai-gradient-text mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {job.aiScore}
              </div>
              <div className="text-xs text-gray-500 mb-3">JD质量综合评分</div>
              <div className="space-y-2">
                {[
                  { label: "职责清晰度", value: 92 },
                  { label: "要求合理性", value: 88 },
                  { label: "市场竞争力", value: 85 },
                  { label: "职级匹配度", value: 90 },
                ].map((item) => (
                  <div key={item.label}>
                    <div className="flex justify-between text-xs text-gray-500 mb-1">
                      <span>{item.label}</span>
                      <span className="font-medium text-gray-700">{item.value}</span>
                    </div>
                    <Progress value={item.value} className="h-1" />
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-gray-100 p-4">
              <div className="text-sm font-semibold text-gray-900 mb-3">快捷操作</div>
              <div className="space-y-2">
                {[
                  { label: "批量筛选简历", icon: Sparkles, action: () => navigate(`/candidates?jobId=${job.id}`) },
                  { label: "查看候选人对比", icon: Users, action: () => navigate("/candidates") },
                  { label: "生成面试题", icon: ChevronRight, action: () => navigate("/interviews") },
                ].map((item) => (
                  <button
                    key={item.label}
                    onClick={item.action}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 hover:bg-indigo-50 text-sm text-gray-700 hover:text-indigo-700 transition-colors"
                  >
                    <item.icon className="w-4 h-4" />
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
