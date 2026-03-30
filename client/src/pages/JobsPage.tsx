/**
 * Jobs Page - 职位管理列表
 */
import { useState } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Plus, Search, Filter, MapPin, Users, Calendar,
  MoreHorizontal, Eye, Edit, Pause, Trash2, Sparkles
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { mockJobs, type Job } from "@/lib/mockData";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: "招聘中", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  paused: { label: "已暂停", className: "bg-amber-50 text-amber-700 border-amber-200" },
  closed: { label: "已关闭", className: "bg-gray-50 text-gray-600 border-gray-200" },
  draft: { label: "草稿", className: "bg-blue-50 text-blue-700 border-blue-200" },
};

export default function JobsPage() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [jobs] = useState<Job[]>(mockJobs);

  const filtered = jobs.filter((j) => {
    const matchSearch = j.title.includes(search) || j.department.includes(search);
    const matchStatus = statusFilter === "all" || j.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <AppLayout breadcrumb={[{ label: "职位管理" }]}>
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">职位管理</h1>
            <p className="text-sm text-gray-500 mt-0.5">共 {jobs.length} 个职位，{jobs.filter(j => j.status === "active").length} 个招聘中</p>
          </div>
          <Button
            onClick={() => navigate("/jobs/create")}
            className="bg-indigo-600 hover:bg-indigo-700 text-white"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            创建职位
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索职位名称、部门..."
              className="pl-9 h-9 border-gray-200"
            />
          </div>
          <div className="flex gap-2">
            {[
              { value: "all", label: "全部" },
              { value: "active", label: "招聘中" },
              { value: "paused", label: "已暂停" },
              { value: "draft", label: "草稿" },
            ].map((f) => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  statusFilter === f.value
                    ? "bg-indigo-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <Button variant="outline" size="sm" className="border-gray-200 text-gray-600 h-9">
            <Filter className="w-3.5 h-3.5 mr-1.5" />
            筛选
          </Button>
        </div>

        {/* Jobs Grid */}
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((job) => (
            <div
              key={job.id}
              className="bg-white rounded-2xl border border-gray-100 p-5 card-hover group"
            >
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3
                      className="text-sm font-bold text-gray-900 hover:text-indigo-600 cursor-pointer truncate"
                      onClick={() => navigate(`/jobs/${job.id}`)}
                    >
                      {job.title}
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <span className="tag-gray">{job.department}</span>
                    <span className="tag-indigo">{job.level}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusConfig[job.status].className}`}>
                      {statusConfig[job.status].label}
                    </span>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="w-7 h-7 opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate(`/jobs/${job.id}`)}>
                      <Eye className="w-4 h-4 mr-2" />查看详情
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate(`/jobs/${job.id}`)}>
                      <Edit className="w-4 h-4 mr-2" />编辑职位
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast.success("职位已暂停")}>
                      <Pause className="w-4 h-4 mr-2" />暂停招聘
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-600" onClick={() => toast.error("职位已删除")}>
                      <Trash2 className="w-4 h-4 mr-2" />删除
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Info */}
              <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" />
                  {job.location}
                </div>
                <div className="flex items-center gap-1">
                  <Users className="w-3.5 h-3.5" />
                  招 {job.headcount} 人
                </div>
                {job.salary && (
                  <div className="text-indigo-600 font-medium">{job.salary}</div>
                )}
              </div>

              {/* Skills */}
              {job.skills && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {job.skills.slice(0, 3).map((s) => (
                    <span key={s} className="tag-gray">{s}</span>
                  ))}
                  {job.skills.length > 3 && (
                    <span className="tag-gray">+{job.skills.length - 3}</span>
                  )}
                </div>
              )}

              {/* Progress */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span>招聘漏斗</span>
                  <span>{job.applied} 投递 → {job.shortlisted} 入围 → {job.interviewed} 面试</span>
                </div>
                <Progress
                  value={(job.interviewed / Math.max(job.applied, 1)) * 100}
                  className="h-1.5"
                />
              </div>

              {/* Footer */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                <div className="flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
                  <span className="text-xs text-gray-500">AI质量分</span>
                  <span className="text-xs font-bold text-indigo-600">{job.aiScore}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 text-xs text-indigo-600 hover:bg-indigo-50 px-2"
                  onClick={() => navigate(`/candidates?jobId=${job.id}`)}
                >
                  查看候选人 ({job.applied})
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-gray-400">
            <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="text-sm">暂无匹配的职位</p>
            <Button
              className="mt-4 bg-indigo-600 text-white"
              onClick={() => navigate("/jobs/create")}
            >
              创建第一个职位
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

// Fix missing import
function Briefcase(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
    </svg>
  );
}
