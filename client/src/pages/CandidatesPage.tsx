/**
 * Candidates Page - 候选人列表 + AI筛选
 * Module B: 简历解析与语义筛选
 */
import { useState } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Upload, Search, Filter, Brain, GitCompare, Star,
  ChevronDown, Sparkles, AlertTriangle, CheckCircle2,
  SlidersHorizontal, ArrowUpDown, MoreHorizontal, Loader2, Mail, ShieldCheck
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { mockCandidates, mockJobs, type Candidate } from "@/lib/mockData";
import EmailImportModal from "@/components/EmailImportModal";
import { toast } from "sonner";

const statusConfig: Record<string, { label: string; className: string }> = {
  new: { label: "待筛选", className: "bg-gray-50 text-gray-600 border-gray-200" },
  screening: { label: "筛选中", className: "bg-indigo-50 text-indigo-700 border-indigo-200" },
  interview: { label: "面试中", className: "bg-amber-50 text-amber-700 border-amber-200" },
  offer: { label: "发Offer", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  hired: { label: "已录用", className: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  rejected: { label: "已淘汰", className: "bg-red-50 text-red-600 border-red-200" },
};

const recommendConfig: Record<string, { label: string; color: string }> = {
  strong_yes: { label: "强推", color: "text-emerald-600" },
  yes: { label: "推荐", color: "text-indigo-600" },
  maybe: { label: "待定", color: "text-amber-600" },
  no: { label: "不推荐", color: "text-red-500" },
};

export default function CandidatesPage() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"score" | "date">("score");
  const [selected, setSelected] = useState<string[]>([]);
  const [aiScreening, setAiScreening] = useState(false);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [emailImportOpen, setEmailImportOpen] = useState(false);
  const [jobFilter, setJobFilter] = useState("all");

  const filtered = mockCandidates
    .filter((c) => {
      const matchSearch = c.name.includes(search) || c.currentTitle.includes(search) || c.currentCompany.includes(search);
      const matchStatus = statusFilter === "all" || c.status === statusFilter;
      const matchJob = jobFilter === "all" || c.jobId === jobFilter;
      return matchSearch && matchStatus && matchJob;
    })
    .sort((a, b) => sortBy === "score" ? b.aiScore - a.aiScore : 0);

  const toggleSelect = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleAIScreen = async () => {
    setAiScreening(true);
    await new Promise((r) => setTimeout(r, 2000));
    setAiScreening(false);
    toast.success("AI筛选完成！已对16份简历进行语义评分");
  };

  const handleCompare = () => {
    if (selected.length < 2) {
      toast.error("请至少选择2位候选人进行对比");
      return;
    }
    if (selected.length > 4) {
      toast.error("最多同时对比4位候选人");
      return;
    }
    navigate(`/candidates/compare?ids=${selected.join(",")}`);
  };

  return (
    <AppLayout breadcrumb={[{ label: "候选人" }]}>
      <div className="p-6 space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">候选人管理</h1>
            <p className="text-sm text-gray-500 mt-0.5">共 {mockCandidates.length} 位候选人</p>
          </div>
          <div className="flex gap-2">
            {selected.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleCompare}
                className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              >
                <GitCompare className="w-3.5 h-3.5 mr-1.5" />
                对比分析 ({selected.length})
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handleAIScreen}
              disabled={aiScreening}
              className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
            >
              {aiScreening ? (
                <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />AI筛选中...</>
              ) : (
                <><Sparkles className="w-3.5 h-3.5 mr-1.5" />AI批量筛选</>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="border-indigo-200 text-indigo-700 hover:bg-indigo-50"
              onClick={() => setEmailImportOpen(true)}
            >
              <Mail className="w-3.5 h-3.5 mr-1.5" />
              邮箱导入
            </Button>
            <Button
              size="sm"
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              onClick={() => setUploadModalOpen(true)}
            >
              <Upload className="w-3.5 h-3.5 mr-1.5" />
              导入简历
            </Button>
          </div>
        </div>

        {/* Upload modal hint */}
        {uploadModalOpen && (
          <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3">
            <Upload className="w-5 h-5 text-indigo-600 flex-shrink-0" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-indigo-900">导入简历</div>
              <div className="text-xs text-indigo-600">支持PDF、Word格式，可批量上传，AI将自动解析并评分</div>
            </div>
            <Button size="sm" className="bg-indigo-600 text-white" onClick={() => {
              setUploadModalOpen(false);
              toast.success("简历上传成功，AI正在解析...");
            }}>
              选择文件
            </Button>
            <button onClick={() => setUploadModalOpen(false)} className="text-indigo-400 hover:text-indigo-600">✕</button>
          </div>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-48 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="搜索姓名、职位、公司..."
              className="pl-9 h-9 border-gray-200"
            />
          </div>
          <div className="flex gap-2">
            {[
              { value: "all", label: "全部" },
              { value: "new", label: "待筛选" },
              { value: "screening", label: "筛选中" },
              { value: "interview", label: "面试中" },
              { value: "offer", label: "Offer" },
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
          {/* 岗位快速筛选 */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="border-gray-200 text-gray-600 h-9">
                <Filter className="w-3.5 h-3.5 mr-1.5" />
                {jobFilter === "all" ? "全部岗位" : mockJobs.find(j => j.id === jobFilter)?.title || "全部岗位"}
                <ChevronDown className="w-3.5 h-3.5 ml-1" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={() => setJobFilter("all")} className={jobFilter === "all" ? "text-indigo-600 font-medium" : ""}>
                全部岗位
              </DropdownMenuItem>
              {mockJobs.filter(j => j.status === "active").map(job => (
                <DropdownMenuItem key={job.id} onClick={() => setJobFilter(job.id)} className={jobFilter === job.id ? "text-indigo-600 font-medium" : ""}>
                  {job.title}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          <Button
            variant="outline"
            size="sm"
            className="border-gray-200 text-gray-600 h-9 ml-auto"
            onClick={() => setSortBy(sortBy === "score" ? "date" : "score")}
          >
            <ArrowUpDown className="w-3.5 h-3.5 mr-1.5" />
            {sortBy === "score" ? "按评分排序" : "按时间排序"}
          </Button>
        </div>

        {/* Selected bar */}
        {selected.length > 0 && (
          <div className="bg-indigo-600 text-white rounded-xl px-4 py-2.5 flex items-center gap-3">
            <span className="text-sm font-medium">已选 {selected.length} 位候选人</span>
            <div className="flex gap-2 ml-auto">
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 h-7" onClick={handleCompare}>
                <GitCompare className="w-3.5 h-3.5 mr-1.5" />
                发起对比
              </Button>
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 h-7" onClick={() => {
                navigate(`/background-check?candidates=${selected.join(",")}`);
              }}>
                <ShieldCheck className="w-3.5 h-3.5 mr-1.5" />
                发起背景调查
              </Button>
              <Button size="sm" variant="ghost" className="text-white hover:bg-white/20 h-7" onClick={() => setSelected([])}>
                清除选择
              </Button>
            </div>
          </div>
        )}

        {/* Candidates Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="w-10 px-4 py-3">
                  <Checkbox
                    checked={selected.length === filtered.length && filtered.length > 0}
                    onCheckedChange={(checked) => {
                      setSelected(checked ? filtered.map((c) => c.id) : []);
                    }}
                  />
                </th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">候选人</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden md:table-cell">应聘职位</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden lg:table-cell">状态</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">AI评分</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide hidden xl:table-cell">推荐</th>
                <th className="w-10 px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.map((c) => (
                <tr
                  key={c.id}
                  className={`hover:bg-gray-50 transition-colors ${selected.includes(c.id) ? "bg-indigo-50/50" : ""}`}
                >
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={selected.includes(c.id)}
                      onCheckedChange={() => toggleSelect(c.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div
                      className="flex items-center gap-3 cursor-pointer"
                      onClick={() => navigate(`/candidates/${c.id}`)}
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-100 to-cyan-100 flex items-center justify-center flex-shrink-0">
                        <span className="text-xs font-semibold text-indigo-700">{c.name.slice(0, 1)}</span>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900 hover:text-indigo-600">{c.name}</div>
                        <div className="text-xs text-gray-400">{c.currentTitle} · {c.currentCompany}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <div className="text-sm text-gray-700">{c.jobTitle}</div>
                    <div className="text-xs text-gray-400">{c.experience}年经验</div>
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusConfig[c.status].className}`}>
                      {statusConfig[c.status].label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className={`text-base font-bold ${
                        c.aiScore >= 90 ? "text-emerald-600" :
                        c.aiScore >= 75 ? "text-indigo-600" : "text-amber-600"
                      }`}>
                        {c.aiScore}
                      </div>
                      <div className="w-16 hidden sm:block">
                        <Progress value={c.aiScore} className="h-1.5" />
                      </div>
                    </div>
                    {c.riskTags && c.riskTags.length > 0 && (
                      <div className="flex items-center gap-1 mt-0.5">
                        <AlertTriangle className="w-3 h-3 text-amber-500" />
                        <span className="text-xs text-amber-600">{c.riskTags[0]}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden xl:table-cell">
                    <span className={`text-xs font-semibold ${recommendConfig[c.recommendation].color}`}>
                      {recommendConfig[c.recommendation].label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="w-7 h-7">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/candidates/${c.id}`)}>
                          查看画像
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate("/interviews")}>
                          安排面试
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => navigate(`/background-check?candidate=${c.id}`)}>
                          <ShieldCheck className="w-3.5 h-3.5 mr-1.5 text-indigo-500" />
                          发起背景调查
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => toast.success("已加入对比列表")}>
                          加入对比
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600" onClick={() => toast.error("候选人已淘汰")}>
                          淘汰
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-gray-400">
              <p className="text-sm">暂无候选人</p>
            </div>
          )}
        </div>
      </div>
      <EmailImportModal open={emailImportOpen} onClose={() => setEmailImportOpen(false)} />
    </AppLayout>
  );
}
