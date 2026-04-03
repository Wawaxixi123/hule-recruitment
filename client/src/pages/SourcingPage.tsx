/**
 * SourcingPage - 主动简历获取模块
 * 通过浏览器插件 + RPA Agent 从外部平台（BOSS直聘等）主动采集候选人简历
 */
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Radar, Search, Play, Pause, CheckCircle2, Loader2, Plus,
  Users, Briefcase, MapPin, DollarSign, Clock, ChevronRight,
  Download, Filter, Zap, Globe, Bot, Puzzle, AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface SourcingTask {
  id: string;
  jobTitle: string;
  platform: string;
  status: "idle" | "running" | "paused" | "done";
  found: number;
  imported: number;
  startedAt?: string;
  filters: { location: string; experience: string; salary: string };
}

interface SourcedCandidate {
  id: string;
  name: string;
  title: string;
  company: string;
  experience: string;
  salary: string;
  location: string;
  matchScore: number;
  platform: string;
  importedAt: string;
}

const mockTasks: SourcingTask[] = [
  {
    id: "t1",
    jobTitle: "高级AI产品经理",
    platform: "BOSS直聘",
    status: "done",
    found: 47,
    imported: 12,
    startedAt: "2026-04-03 09:00",
    filters: { location: "北京", experience: "5年以上", salary: "30k–50k" },
  },
  {
    id: "t2",
    jobTitle: "算法工程师",
    platform: "BOSS直聘",
    status: "running",
    found: 23,
    imported: 6,
    startedAt: "2026-04-03 10:30",
    filters: { location: "上海", experience: "3年以上", salary: "25k–40k" },
  },
];

const mockCandidates: SourcedCandidate[] = [
  { id: "sc1", name: "周鑫磊", title: "AI产品经理", company: "百度", experience: "6年", salary: "35k", location: "北京", matchScore: 94, platform: "BOSS直聘", importedAt: "10分钟前" },
  { id: "sc2", name: "林思宇", title: "高级产品经理", company: "美团", experience: "5年", salary: "32k", location: "北京", matchScore: 88, platform: "BOSS直聘", importedAt: "15分钟前" },
  { id: "sc3", name: "吴晓峰", title: "产品总监", company: "滴滴", experience: "8年", salary: "45k", location: "北京", matchScore: 82, platform: "BOSS直聘", importedAt: "22分钟前" },
  { id: "sc4", name: "赵雨欣", title: "AI产品经理", company: "小米", experience: "4年", salary: "28k", location: "北京", matchScore: 79, platform: "BOSS直聘", importedAt: "30分钟前" },
];

const statusConfig = {
  idle: { label: "未开始", color: "text-gray-500 bg-gray-50 border-gray-200" },
  running: { label: "采集中", color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
  paused: { label: "已暂停", color: "text-amber-600 bg-amber-50 border-amber-200" },
  done: { label: "已完成", color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
};

export default function SourcingPage() {
  const [activeTask, setActiveTask] = useState<SourcingTask>(mockTasks[0]);
  const [showNewTask, setShowNewTask] = useState(false);

  return (
    <AppLayout title="主动获取简历" breadcrumb={[{ label: "主动获取简历" }]}>
      <div className="p-6 space-y-5 max-w-6xl">

        {/* Mode Explanation Banner */}
        <div className="bg-gradient-to-r from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-5">
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-gray-900 mb-1">AI Agent 主动采集 · 两种模式</h3>
              <div className="grid md:grid-cols-2 gap-4 mt-3">
                <div className="bg-white rounded-xl p-3.5 border border-indigo-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Puzzle className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs font-semibold text-gray-900">浏览器插件模式</span>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full ml-auto">推荐</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">在 BOSS 直聘页面点击插件按钮，插件自动滚动页面并利用 AI 截屏解析，可绕过复杂反爬协议，实时导入候选人画像。</p>
                  <button onClick={() => toast.info("插件下载功能即将上线")}
                    className="mt-2.5 flex items-center gap-1 text-xs text-indigo-600 font-medium hover:text-indigo-700 transition-colors">
                    下载浏览器插件 <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
                <div className="bg-white rounded-xl p-3.5 border border-violet-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="w-4 h-4 text-violet-600" />
                    <span className="text-xs font-semibold text-gray-900">RPA Agent 模式</span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">服务端启动模拟浏览器，AI Agent 模仿人的操作进行搜索和点击，将候选人卡片实时转化为系统内的候选人画像，支持批量自动化采集。</p>
                  <button onClick={() => toast.info("RPA模式即将上线")}
                    className="mt-2.5 flex items-center gap-1 text-xs text-violet-600 font-medium hover:text-violet-700 transition-colors">
                    配置 RPA 任务 <ChevronRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-5">
          {/* Left: Task List */}
          <div className="lg:col-span-1 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-900">采集任务</h2>
              <Button size="sm" className="bg-indigo-600 text-white h-7 text-xs px-2.5"
                onClick={() => toast.info("新建任务功能即将上线")}>
                <Plus className="w-3.5 h-3.5 mr-1" />新建任务
              </Button>
            </div>
            <div className="space-y-2">
              {mockTasks.map(task => {
                const sc = statusConfig[task.status];
                return (
                  <button
                    key={task.id}
                    onClick={() => setActiveTask(task)}
                    className={`w-full text-left p-4 rounded-2xl border transition-all ${activeTask.id === task.id ? "bg-indigo-50 border-indigo-200" : "bg-white border-gray-100 hover:border-indigo-100"}`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-semibold text-gray-900 truncate">{task.jobTitle}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${sc.color} shrink-0 ml-2`}>{sc.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                      <Globe className="w-3 h-3" />{task.platform}
                    </div>
                    <div className="flex items-center gap-3 text-xs">
                      <span className="text-gray-500">发现 <span className="font-semibold text-gray-900">{task.found}</span> 人</span>
                      <span className="text-gray-500">已导入 <span className="font-semibold text-indigo-600">{task.imported}</span> 人</span>
                    </div>
                    {task.status === "running" && (
                      <div className="mt-2 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full animate-pulse"
                          style={{ width: `${Math.round((task.imported / task.found) * 100)}%` }}
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Task Detail + Candidates */}
          <div className="lg:col-span-2 space-y-4">
            {/* Task Detail */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-gray-900">{activeTask.jobTitle}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{activeTask.platform} · 开始于 {activeTask.startedAt}</p>
                </div>
                <div className="flex gap-2">
                  {activeTask.status === "running" ? (
                    <Button size="sm" variant="outline" className="border-gray-200 text-xs"
                      onClick={() => toast.info("暂停功能即将上线")}>
                      <Pause className="w-3.5 h-3.5 mr-1" />暂停
                    </Button>
                  ) : activeTask.status === "done" ? (
                    <Button size="sm" variant="outline" className="border-gray-200 text-xs"
                      onClick={() => toast.success("报告已导出")}>
                      <Download className="w-3.5 h-3.5 mr-1" />导出报告
                    </Button>
                  ) : null}
                </div>
              </div>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "筛选条件", value: activeTask.filters.location },
                  { label: "工作年限", value: activeTask.filters.experience },
                  { label: "薪资范围", value: activeTask.filters.salary },
                  { label: "导入进度", value: `${activeTask.imported}/${activeTask.found}` },
                ].map((item, i) => (
                  <div key={i} className="bg-gray-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-gray-400 mb-1">{item.label}</p>
                    <p className="text-sm font-bold text-gray-900">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sourced Candidates */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-semibold text-gray-900">已采集候选人</span>
                  <span className="text-xs text-gray-400">共 {mockCandidates.length} 人</span>
                </div>
                <Button size="sm" className="bg-indigo-600 text-white h-7 text-xs px-2.5"
                  onClick={() => toast.success("已批量导入至候选人库")}>
                  <Download className="w-3.5 h-3.5 mr-1" />批量导入
                </Button>
              </div>
              <div className="space-y-2">
                {mockCandidates.map(c => (
                  <div key={c.id} className="flex items-center gap-4 p-3.5 bg-gray-50 rounded-xl border border-gray-100 hover:border-indigo-100 transition-colors">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
                      {c.name.slice(0, 1)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-sm font-semibold text-gray-900">{c.name}</span>
                        <span className="text-xs text-gray-400">{c.title} · {c.company}</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{c.location}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{c.experience}</span>
                        <span className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{c.salary}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className={`text-base font-extrabold ${c.matchScore >= 90 ? "text-emerald-600" : c.matchScore >= 80 ? "text-indigo-600" : "text-amber-600"}`}>
                          {c.matchScore}
                        </div>
                        <div className="text-xs text-gray-400">匹配分</div>
                      </div>
                      <Button size="sm" variant="outline" className="border-gray-200 text-xs h-7"
                        onClick={() => toast.success(`${c.name} 已导入候选人库`)}>
                        导入
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
