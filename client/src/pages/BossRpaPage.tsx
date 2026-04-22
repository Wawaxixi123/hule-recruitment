/**
 * BossRpaPage - BOSS 机器人 RPA 自动获取简历
 * 功能：账号绑定、抓取规则设置、自动搜索+打招呼+导入简历、随机事件防检测
 */
import { useState, useEffect, useRef } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Bot, Settings, Play, Pause, Square, CheckCircle2, Loader2,
  ExternalLink, User, Lock, Plus, Trash2, GripVertical, ChevronDown,
  ChevronRight, Zap, Shield, Clock, MessageSquare, Download,
  AlertTriangle, RefreshCw, Eye, EyeOff, Shuffle, Timer,
  MapPin, Briefcase, GraduationCap, DollarSign, Users,
  ArrowRight, Activity, BarChart3, Sparkles, Globe, LogIn
} from "lucide-react";
import { toast } from "sonner";
import { mockJobs } from "@/lib/mockData";

// ─── 类型定义 ────────────────────────────────────────────────────────────────

type AccountStatus = "unbound" | "bound" | "expired";

interface BossAccount {
  id: string;
  phone: string;
  nickname: string;
  status: AccountStatus;
  lastLogin: string;
  todayGreets: number;
  maxGreets: number;
}

type TaskStatus = "idle" | "running" | "paused" | "done" | "error";

interface ScrapeRule {
  id: string;
  jobId: string;
  jobTitle: string;
  keywords: string[];
  location: string;
  experience: string;
  education: string;
  salaryMin: string;
  salaryMax: string;
  matchThreshold: number;
  maxCandidates: number;
  greetTemplate: string;
  order: number;
}

interface RpaTask {
  id: string;
  ruleId: string;
  jobTitle: string;
  status: TaskStatus;
  progress: number;
  searched: number;
  matched: number;
  greeted: number;
  imported: number;
  startedAt: string;
  logs: LogEntry[];
}

interface LogEntry {
  time: string;
  type: "info" | "success" | "warn" | "error";
  message: string;
}

interface RandomEventConfig {
  enabled: boolean;
  minDelay: number;
  maxDelay: number;
  randomScrollEnabled: boolean;
  randomPauseEnabled: boolean;
  pauseMinutes: number;
  pauseIntervalMinutes: number;
  typingSpeedVariation: boolean;
  randomProfileView: boolean;
  profileViewCount: number;
  sessionDurationMinutes: number;
}

interface CollectedCandidate {
  id: string;
  name: string;
  title: string;
  company: string;
  experience: string;
  salary: string;
  location: string;
  education: string;
  matchScore: number;
  greeted: boolean;
  imported: boolean;
  greetedAt?: string;
  jobTitle: string;
}

// ─── 常量 ────────────────────────────────────────────────────────────────────

const EXPERIENCE_OPTIONS = ["经验不限", "在校生/应届", "1年以内", "1-3年", "3-5年", "5-10年", "10年以上"];
const EDUCATION_OPTIONS = ["学历不限", "大专", "本科", "硕士", "博士"];
const SALARY_OPTIONS = ["不限", "5k", "8k", "10k", "15k", "20k", "25k", "30k", "40k", "50k", "80k"];
const LOCATION_OPTIONS = ["不限", "北京", "上海", "广州", "深圳", "杭州", "成都", "武汉", "南京", "西安"];

const GREET_TEMPLATES = [
  "您好！我在招聘{职位}，看到您的简历非常符合我们的要求，期待与您进一步沟通！",
  "您好，我们正在寻找优秀的{职位}，您的背景与岗位高度匹配，方便聊聊吗？",
  "Hi！看到您的经历很棒，我们有一个{职位}的机会，薪资待遇优厚，欢迎了解！",
  "您好！贵司的经历让我印象深刻，我们{职位}岗位正在招聘，期待与您交流！",
];

const MOCK_ACCOUNT: BossAccount = {
  id: "acc1",
  phone: "138****8888",
  nickname: "HR·Horo AI",
  status: "bound",
  lastLogin: "2026-04-22 09:15",
  todayGreets: 23,
  maxGreets: 100,
};

const MOCK_RULES: ScrapeRule[] = [
  {
    id: "r1",
    jobId: "j1",
    jobTitle: "高级AI产品经理",
    keywords: ["AI产品经理", "产品经理", "AI PM"],
    location: "北京",
    experience: "3-5年",
    education: "本科",
    salaryMin: "20k",
    salaryMax: "50k",
    matchThreshold: 75,
    maxCandidates: 50,
    greetTemplate: GREET_TEMPLATES[0],
    order: 1,
  },
  {
    id: "r2",
    jobId: "j2",
    jobTitle: "算法工程师",
    keywords: ["算法工程师", "机器学习", "深度学习"],
    location: "上海",
    experience: "3-5年",
    education: "硕士",
    salaryMin: "25k",
    salaryMax: "50k",
    matchThreshold: 80,
    maxCandidates: 30,
    greetTemplate: GREET_TEMPLATES[1],
    order: 2,
  },
];

const MOCK_CANDIDATES: CollectedCandidate[] = [
  { id: "cc1", name: "周鑫磊", title: "AI产品经理", company: "百度", experience: "6年", salary: "35k", location: "北京", education: "本科", matchScore: 94, greeted: true, imported: true, greetedAt: "10分钟前", jobTitle: "高级AI产品经理" },
  { id: "cc2", name: "林思宇", title: "高级产品经理", company: "美团", experience: "5年", salary: "32k", location: "北京", education: "硕士", matchScore: 88, greeted: true, imported: false, greetedAt: "15分钟前", jobTitle: "高级AI产品经理" },
  { id: "cc3", name: "吴晓峰", title: "产品总监", company: "滴滴", experience: "8年", salary: "45k", location: "北京", education: "本科", matchScore: 82, greeted: true, imported: false, greetedAt: "22分钟前", jobTitle: "高级AI产品经理" },
  { id: "cc4", name: "赵雨欣", title: "AI产品经理", company: "小米", experience: "4年", salary: "28k", location: "北京", education: "本科", matchScore: 79, greeted: false, imported: false, jobTitle: "高级AI产品经理" },
  { id: "cc5", name: "陈浩然", title: "算法工程师", company: "字节跳动", experience: "4年", salary: "40k", location: "上海", education: "硕士", matchScore: 91, greeted: true, imported: true, greetedAt: "5分钟前", jobTitle: "算法工程师" },
];

const DEFAULT_RANDOM_CONFIG: RandomEventConfig = {
  enabled: true,
  minDelay: 2,
  maxDelay: 8,
  randomScrollEnabled: true,
  randomPauseEnabled: true,
  pauseMinutes: 3,
  pauseIntervalMinutes: 30,
  typingSpeedVariation: true,
  randomProfileView: true,
  profileViewCount: 5,
  sessionDurationMinutes: 120,
};

// ─── 辅助组件 ─────────────────────────────────────────────────────────────────

function LogBadge({ type }: { type: LogEntry["type"] }) {
  const map = {
    info: "bg-blue-50 text-blue-600",
    success: "bg-emerald-50 text-emerald-600",
    warn: "bg-amber-50 text-amber-600",
    error: "bg-red-50 text-red-600",
  };
  return <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${map[type]}`}>{type.toUpperCase()}</span>;
}

// ─── 主页面 ───────────────────────────────────────────────────────────────────

export default function BossRpaPage() {
  const [activeTab, setActiveTab] = useState<"account" | "rules" | "task" | "random">("account");
  const [account, setAccount] = useState<BossAccount | null>(MOCK_ACCOUNT);
  const [rules, setRules] = useState<ScrapeRule[]>(MOCK_RULES);
  const [task, setTask] = useState<RpaTask | null>(null);
  const [randomConfig, setRandomConfig] = useState<RandomEventConfig>(DEFAULT_RANDOM_CONFIG);
  const [candidates, setCandidates] = useState<CollectedCandidate[]>(MOCK_CANDIDATES);

  // 账号绑定表单
  const [bindPhone, setBindPhone] = useState("");
  const [bindPassword, setBindPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [binding, setBinding] = useState(false);

  // 规则编辑
  const [editingRule, setEditingRule] = useState<ScrapeRule | null>(null);
  const [showRuleForm, setShowRuleForm] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");

  // 任务运行
  const [runningLogs, setRunningLogs] = useState<LogEntry[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  // 自动滚动日志
  useEffect(() => {
    if (logRef.current) {
      logRef.current.scrollTop = logRef.current.scrollHeight;
    }
  }, [runningLogs]);

  // ── 账号绑定 ──────────────────────────────────────────────────────────────

  const handleBind = () => {
    if (!bindPhone || !bindPassword) {
      toast.error("请填写手机号和密码");
      return;
    }
    setBinding(true);
    setTimeout(() => {
      setBinding(false);
      setAccount({
        id: "acc_new",
        phone: bindPhone.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2"),
        nickname: "HR·用户",
        status: "bound",
        lastLogin: new Date().toLocaleString("zh-CN"),
        todayGreets: 0,
        maxGreets: 100,
      });
      toast.success("BOSS 账号绑定成功！");
      setActiveTab("rules");
    }, 2000);
  };

  const handleLoginBoss = () => {
    window.open("https://www.zhipin.com/web/user/?ka=header-login", "_blank");
    toast.info("已跳转至 BOSS 直聘登录页，登录后返回此页面继续操作");
  };

  // ── 规则管理 ──────────────────────────────────────────────────────────────

  const openNewRule = () => {
    setEditingRule({
      id: `r${Date.now()}`,
      jobId: mockJobs[0]?.id || "j1",
      jobTitle: mockJobs[0]?.title || "新岗位",
      keywords: [],
      location: "不限",
      experience: "经验不限",
      education: "学历不限",
      salaryMin: "不限",
      salaryMax: "不限",
      matchThreshold: 75,
      maxCandidates: 50,
      greetTemplate: GREET_TEMPLATES[0],
      order: rules.length + 1,
    });
    setShowRuleForm(true);
  };

  const saveRule = () => {
    if (!editingRule) return;
    if (editingRule.keywords.length === 0) {
      toast.error("请至少添加一个搜索关键词");
      return;
    }
    setRules(prev => {
      const exists = prev.find(r => r.id === editingRule.id);
      if (exists) return prev.map(r => r.id === editingRule.id ? editingRule : r);
      return [...prev, editingRule];
    });
    setShowRuleForm(false);
    setEditingRule(null);
    toast.success("抓取规则已保存");
  };

  const deleteRule = (id: string) => {
    setRules(prev => prev.filter(r => r.id !== id));
    toast.success("规则已删除");
  };

  const addKeyword = () => {
    if (!newKeyword.trim() || !editingRule) return;
    setEditingRule(prev => prev ? { ...prev, keywords: [...prev.keywords, newKeyword.trim()] } : prev);
    setNewKeyword("");
  };

  const removeKeyword = (kw: string) => {
    setEditingRule(prev => prev ? { ...prev, keywords: prev.keywords.filter(k => k !== kw) } : prev);
  };

  // ── 任务执行 ──────────────────────────────────────────────────────────────

  const LOG_SEQUENCE: Omit<LogEntry, "time">[] = [
    { type: "info", message: "🤖 RPA Agent 启动，初始化浏览器环境..." },
    { type: "info", message: "🔐 正在登录 BOSS 直聘账号..." },
    { type: "success", message: "✅ 登录成功，账号：HR·Horo AI" },
    { type: "info", message: "🔍 导航至搜索页面，输入关键词「AI产品经理」..." },
    { type: "info", message: "⚙️ 设置筛选条件：北京 · 3-5年 · 本科 · 20k-50k" },
    { type: "info", message: "📋 共发现 47 位候选人，开始逐一评估..." },
    { type: "success", message: "✅ 候选人「周鑫磊」匹配分 94，触发打招呼" },
    { type: "info", message: "⏱️ 随机等待 3.2 秒（防检测延迟）..." },
    { type: "success", message: "✅ 候选人「林思宇」匹配分 88，触发打招呼" },
    { type: "info", message: "🖱️ 随机浏览其他候选人主页（防检测行为）..." },
    { type: "success", message: "✅ 候选人「吴晓峰」匹配分 82，触发打招呼" },
    { type: "info", message: "⏸️ 随机暂停 3 分钟（模拟人工休息）..." },
    { type: "warn", message: "⚠️ 候选人「赵雨欣」匹配分 79，低于阈值 80，跳过" },
    { type: "info", message: "📥 开始导入已打招呼候选人简历..." },
    { type: "success", message: "✅ 简历导入完成，共导入 3 份至「高级AI产品经理」" },
    { type: "success", message: "🎉 任务完成！本次共处理 47 人，打招呼 3 人，导入 3 份简历" },
  ];

  const startTask = () => {
    if (!account || account.status !== "bound") {
      toast.error("请先绑定 BOSS 账号");
      setActiveTab("account");
      return;
    }
    if (rules.length === 0) {
      toast.error("请先设置抓取规则");
      setActiveTab("rules");
      return;
    }

    const newTask: RpaTask = {
      id: `task_${Date.now()}`,
      ruleId: rules[0].id,
      jobTitle: rules[0].jobTitle,
      status: "running",
      progress: 0,
      searched: 0,
      matched: 0,
      greeted: 0,
      imported: 0,
      startedAt: new Date().toLocaleString("zh-CN"),
      logs: [],
    };
    setTask(newTask);
    setRunningLogs([]);
    setActiveTab("task");

    // 模拟逐步执行日志
    let logIndex = 0;
    let progress = 0;
    const interval = setInterval(() => {
      if (logIndex < LOG_SEQUENCE.length) {
        const entry: LogEntry = {
          ...LOG_SEQUENCE[logIndex],
          time: new Date().toLocaleTimeString("zh-CN"),
        };
        setRunningLogs(prev => [...prev, entry]);
        progress = Math.min(100, Math.round((logIndex / (LOG_SEQUENCE.length - 1)) * 100));
        setTask(prev => prev ? {
          ...prev,
          progress,
          searched: Math.min(47, logIndex * 4),
          matched: Math.min(3, Math.floor(logIndex / 4)),
          greeted: Math.min(3, Math.floor(logIndex / 5)),
          imported: logIndex >= LOG_SEQUENCE.length - 2 ? 3 : 0,
        } : prev);
        logIndex++;
      } else {
        clearInterval(interval);
        setTask(prev => prev ? { ...prev, status: "done", progress: 100, searched: 47, matched: 3, greeted: 3, imported: 3 } : prev);
        toast.success("🎉 RPA 任务完成！已自动导入 3 份简历");
      }
    }, 1200);
  };

  const pauseTask = () => {
    setTask(prev => prev ? { ...prev, status: "paused" } : prev);
    toast.info("任务已暂停");
  };

  const stopTask = () => {
    setTask(prev => prev ? { ...prev, status: "idle" } : prev);
    toast.info("任务已停止");
  };

  // ─── 渲染 ─────────────────────────────────────────────────────────────────

  const tabs = [
    { id: "account", label: "账号绑定", icon: User },
    { id: "rules", label: "抓取规则", icon: Settings },
    { id: "task", label: "执行任务", icon: Bot },
    { id: "random", label: "随机事件", icon: Shield },
  ] as const;

  return (
    <AppLayout title="BOSS 机器人 RPA" breadcrumb={[{ label: "获取简历" }, { label: "BOSS 机器人 RPA" }]}>
      <div className="p-6 space-y-5 max-w-6xl">

        {/* Header Banner */}
        <div className="bg-gradient-to-r from-amber-50 via-orange-50 to-yellow-50 border border-amber-200 rounded-2xl p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shadow-lg shadow-amber-200">
                <Bot className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-base font-bold text-gray-900">BOSS 直聘 · 机器人 RPA</h2>
                  <span className="text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2 py-0.5 rounded-full font-medium">Beta</span>
                </div>
                <p className="text-sm text-gray-500 mt-0.5">自动搜索候选人 · 智能人岗匹配 · 自动打招呼 · 简历一键导入</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {account?.status === "bound" && (
                <div className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border border-amber-100">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-gray-600 font-medium">{account.nickname}</span>
                  <span className="text-xs text-gray-400">{account.phone}</span>
                </div>
              )}
              <Button
                size="sm"
                className="bg-amber-500 hover:bg-amber-600 text-white gap-1.5"
                onClick={startTask}
                disabled={task?.status === "running"}
              >
                {task?.status === "running" ? (
                  <><Loader2 className="w-3.5 h-3.5 animate-spin" />运行中...</>
                ) : (
                  <><Play className="w-3.5 h-3.5" />开始找简历</>
                )}
              </Button>
            </div>
          </div>

          {/* 进度条（任务运行时显示）*/}
          {task && task.status !== "idle" && (
            <div className="mt-4 pt-4 border-t border-amber-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-4 text-xs text-gray-600">
                  <span>搜索 <strong className="text-gray-900">{task.searched}</strong> 人</span>
                  <span>匹配 <strong className="text-indigo-600">{task.matched}</strong> 人</span>
                  <span>打招呼 <strong className="text-amber-600">{task.greeted}</strong> 人</span>
                  <span>已导入 <strong className="text-emerald-600">{task.imported}</strong> 份</span>
                </div>
                <span className="text-xs text-gray-400">{task.progress}%</span>
              </div>
              <div className="h-2 bg-amber-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full transition-all duration-500"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.id === "task" && task?.status === "running" && (
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
              )}
            </button>
          ))}
        </div>

        {/* ── Tab: 账号绑定 ─────────────────────────────────────────────────── */}
        {activeTab === "account" && (
          <div className="grid lg:grid-cols-2 gap-5">
            {/* 绑定表单 */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 space-y-5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-100 flex items-center justify-center">
                  <LogIn className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">绑定 BOSS 账号</h3>
                  <p className="text-xs text-gray-400">绑定后机器人将以此账号身份操作</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-gray-600 mb-1.5 block">手机号</Label>
                  <Input
                    placeholder="请输入 BOSS 直聘注册手机号"
                    value={bindPhone}
                    onChange={e => setBindPhone(e.target.value)}
                    className="h-9 text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-gray-600 mb-1.5 block">密码</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="请输入密码"
                      value={bindPassword}
                      onChange={e => setBindPassword(e.target.value)}
                      className="h-9 text-sm pr-9"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  className="flex-1 bg-amber-500 hover:bg-amber-600 text-white"
                  onClick={handleBind}
                  disabled={binding}
                >
                  {binding ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />绑定中...</> : "绑定账号"}
                </Button>
                <Button
                  variant="outline"
                  className="border-amber-200 text-amber-600 hover:bg-amber-50"
                  onClick={handleLoginBoss}
                >
                  <ExternalLink className="w-4 h-4 mr-1.5" />
                  前往登录
                </Button>
              </div>

              <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-xs text-amber-700 leading-relaxed">
                    账号信息仅用于本地 RPA 操作，不会上传至服务器。建议使用专属 HR 账号，避免使用个人主账号。
                  </p>
                </div>
              </div>
            </div>

            {/* 已绑定账号状态 */}
            <div className="space-y-4">
              {account && account.status === "bound" ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-5">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-sm font-bold text-gray-900">已绑定账号</h3>
                    <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded-full">已连接</span>
                  </div>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white font-bold text-sm">
                      HR
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-gray-900">{account.nickname}</div>
                      <div className="text-xs text-gray-400">{account.phone}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <div className="text-xs text-gray-400 mb-1">今日打招呼</div>
                      <div className="text-lg font-bold text-amber-600">{account.todayGreets}<span className="text-xs text-gray-400 font-normal">/{account.maxGreets}</span></div>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 text-center">
                      <div className="text-xs text-gray-400 mb-1">上次登录</div>
                      <div className="text-xs font-semibold text-gray-700">{account.lastLogin}</div>
                    </div>
                  </div>
                  <div className="mt-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">今日打招呼额度</span>
                      <span className="text-xs text-gray-400">{account.todayGreets}/{account.maxGreets}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-amber-400 to-orange-500 rounded-full"
                        style={{ width: `${(account.todayGreets / account.maxGreets) * 100}%` }}
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1 text-xs border-gray-200"
                      onClick={() => { setAccount(null); toast.info("账号已解绑"); }}>
                      解绑账号
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1 text-xs border-amber-200 text-amber-600"
                      onClick={handleLoginBoss}>
                      <RefreshCw className="w-3.5 h-3.5 mr-1" />刷新登录
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-8 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                    <User className="w-6 h-6 text-gray-400" />
                  </div>
                  <p className="text-sm text-gray-500">尚未绑定 BOSS 账号</p>
                  <p className="text-xs text-gray-400 mt-1">绑定后可使用 RPA 机器人自动获取简历</p>
                </div>
              )}

              {/* 使用说明 */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h4 className="text-xs font-semibold text-gray-700 mb-3">操作流程</h4>
                <div className="space-y-2.5">
                  {[
                    { step: "1", text: "绑定 BOSS 账号或点击「前往登录」扫码登录" },
                    { step: "2", text: "在「抓取规则」中配置岗位和筛选条件" },
                    { step: "3", text: "在「随机事件」中配置防检测参数" },
                    { step: "4", text: "点击「开始找简历」，机器人自动执行" },
                    { step: "5", text: "简历自动导入对应岗位候选人库" },
                  ].map(item => (
                    <div key={item.step} className="flex items-start gap-2.5">
                      <div className="w-5 h-5 rounded-full bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {item.step}
                      </div>
                      <span className="text-xs text-gray-600">{item.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: 抓取规则 ─────────────────────────────────────────────────── */}
        {activeTab === "rules" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-gray-900">抓取规则列表</h3>
                <p className="text-xs text-gray-400 mt-0.5">机器人将按顺序依次执行各岗位的抓取任务</p>
              </div>
              <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-white gap-1.5" onClick={openNewRule}>
                <Plus className="w-3.5 h-3.5" />新增规则
              </Button>
            </div>

            {/* 规则列表 */}
            <div className="space-y-3">
              {rules.map((rule, idx) => (
                <div key={rule.id} className="bg-white rounded-2xl border border-gray-100 p-5 hover:border-amber-100 transition-colors">
                  <div className="flex items-start gap-3">
                    <div className="flex items-center gap-2 shrink-0">
                      <GripVertical className="w-4 h-4 text-gray-300 cursor-grab" />
                      <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-bold text-gray-900">{rule.jobTitle}</span>
                        <span className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full">
                          最多 {rule.maxCandidates} 人
                        </span>
                        <span className="text-xs bg-emerald-50 text-emerald-600 border border-emerald-100 px-2 py-0.5 rounded-full">
                          匹配 ≥ {rule.matchThreshold}分
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {rule.keywords.map(kw => (
                          <span key={kw} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{kw}</span>
                        ))}
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs text-gray-500">
                        <div className="flex items-center gap-1"><MapPin className="w-3 h-3" />{rule.location}</div>
                        <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{rule.experience}</div>
                        <div className="flex items-center gap-1"><GraduationCap className="w-3 h-3" />{rule.education}</div>
                        <div className="flex items-center gap-1"><DollarSign className="w-3 h-3" />{rule.salaryMin}~{rule.salaryMax}</div>
                      </div>
                      <div className="mt-2.5 p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-1.5 mb-1">
                          <MessageSquare className="w-3 h-3 text-amber-500" />
                          <span className="text-xs font-medium text-gray-600">打招呼模板</span>
                        </div>
                        <p className="text-xs text-gray-500 leading-relaxed">{rule.greetTemplate}</p>
                      </div>
                    </div>
                    <div className="flex gap-1.5 shrink-0">
                      <Button size="sm" variant="outline" className="h-7 text-xs border-gray-200"
                        onClick={() => { setEditingRule(rule); setShowRuleForm(true); }}>
                        编辑
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs border-red-100 text-red-500 hover:bg-red-50"
                        onClick={() => deleteRule(rule.id)}>
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
              {rules.length === 0 && (
                <div className="bg-gray-50 rounded-2xl border border-dashed border-gray-200 p-10 text-center">
                  <Settings className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">暂无抓取规则</p>
                  <p className="text-xs text-gray-400 mt-1">点击「新增规则」为每个岗位配置抓取条件</p>
                </div>
              )}
            </div>

            {/* 规则编辑表单 */}
            {showRuleForm && editingRule && (
              <div className="bg-white rounded-2xl border border-amber-200 p-6 space-y-4 shadow-lg shadow-amber-50">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-bold text-gray-900">
                    {rules.find(r => r.id === editingRule.id) ? "编辑规则" : "新增规则"}
                  </h4>
                  <button onClick={() => setShowRuleForm(false)} className="text-gray-400 hover:text-gray-600 text-lg leading-none">×</button>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  {/* 关联岗位 */}
                  <div>
                    <Label className="text-xs text-gray-600 mb-1.5 block">关联岗位</Label>
                    <Select
                      value={editingRule.jobId}
                      onValueChange={v => {
                        const job = mockJobs.find(j => j.id === v);
                        setEditingRule(prev => prev ? { ...prev, jobId: v, jobTitle: job?.title || v } : prev);
                      }}
                    >
                      <SelectTrigger className="h-9 text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {mockJobs.map(j => (
                          <SelectItem key={j.id} value={j.id}>{j.title}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* 执行顺序 */}
                  <div>
                    <Label className="text-xs text-gray-600 mb-1.5 block">执行顺序</Label>
                    <Input
                      type="number"
                      min={1}
                      value={editingRule.order}
                      onChange={e => setEditingRule(prev => prev ? { ...prev, order: parseInt(e.target.value) || 1 } : prev)}
                      className="h-9 text-sm"
                    />
                  </div>

                  {/* 搜索关键词 */}
                  <div className="md:col-span-2">
                    <Label className="text-xs text-gray-600 mb-1.5 block">搜索关键词（可多个）</Label>
                    <div className="flex gap-2 mb-2">
                      <Input
                        placeholder="输入关键词后按回车或点击添加"
                        value={newKeyword}
                        onChange={e => setNewKeyword(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && addKeyword()}
                        className="h-9 text-sm flex-1"
                      />
                      <Button size="sm" variant="outline" onClick={addKeyword} className="h-9 border-amber-200 text-amber-600">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {editingRule.keywords.map(kw => (
                        <span key={kw} className="flex items-center gap-1 text-xs bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded-full">
                          {kw}
                          <button onClick={() => removeKeyword(kw)} className="hover:text-red-500">×</button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 城市 */}
                  <div>
                    <Label className="text-xs text-gray-600 mb-1.5 block">城市</Label>
                    <Select value={editingRule.location} onValueChange={v => setEditingRule(prev => prev ? { ...prev, location: v } : prev)}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>{LOCATION_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>

                  {/* 工作年限 */}
                  <div>
                    <Label className="text-xs text-gray-600 mb-1.5 block">工作年限</Label>
                    <Select value={editingRule.experience} onValueChange={v => setEditingRule(prev => prev ? { ...prev, experience: v } : prev)}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>{EXPERIENCE_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>

                  {/* 学历 */}
                  <div>
                    <Label className="text-xs text-gray-600 mb-1.5 block">最低学历</Label>
                    <Select value={editingRule.education} onValueChange={v => setEditingRule(prev => prev ? { ...prev, education: v } : prev)}>
                      <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                      <SelectContent>{EDUCATION_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>

                  {/* 薪资范围 */}
                  <div>
                    <Label className="text-xs text-gray-600 mb-1.5 block">薪资范围</Label>
                    <div className="flex items-center gap-2">
                      <Select value={editingRule.salaryMin} onValueChange={v => setEditingRule(prev => prev ? { ...prev, salaryMin: v } : prev)}>
                        <SelectTrigger className="h-9 text-sm flex-1"><SelectValue /></SelectTrigger>
                        <SelectContent>{SALARY_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                      </Select>
                      <span className="text-gray-400 text-sm">~</span>
                      <Select value={editingRule.salaryMax} onValueChange={v => setEditingRule(prev => prev ? { ...prev, salaryMax: v } : prev)}>
                        <SelectTrigger className="h-9 text-sm flex-1"><SelectValue /></SelectTrigger>
                        <SelectContent>{SALARY_OPTIONS.map(o => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* 匹配分阈值 */}
                  <div className="md:col-span-2">
                    <Label className="text-xs text-gray-600 mb-1.5 block">
                      最低匹配分阈值：<strong className="text-amber-600">{editingRule.matchThreshold} 分</strong>
                    </Label>
                    <Slider
                      min={50}
                      max={100}
                      step={5}
                      value={[editingRule.matchThreshold]}
                      onValueChange={([v]) => setEditingRule(prev => prev ? { ...prev, matchThreshold: v } : prev)}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-gray-400 mt-1">
                      <span>50分（宽松）</span><span>75分（推荐）</span><span>100分（严格）</span>
                    </div>
                  </div>

                  {/* 最大采集数 */}
                  <div>
                    <Label className="text-xs text-gray-600 mb-1.5 block">最大采集人数</Label>
                    <Input
                      type="number"
                      min={1}
                      max={200}
                      value={editingRule.maxCandidates}
                      onChange={e => setEditingRule(prev => prev ? { ...prev, maxCandidates: parseInt(e.target.value) || 50 } : prev)}
                      className="h-9 text-sm"
                    />
                  </div>

                  {/* 打招呼模板 */}
                  <div className="md:col-span-2">
                    <Label className="text-xs text-gray-600 mb-1.5 block">打招呼模板</Label>
                    <div className="space-y-2">
                      {GREET_TEMPLATES.map((tpl, i) => (
                        <button
                          key={i}
                          onClick={() => setEditingRule(prev => prev ? { ...prev, greetTemplate: tpl } : prev)}
                          className={`w-full text-left text-xs p-3 rounded-xl border transition-all ${
                            editingRule.greetTemplate === tpl
                              ? "bg-amber-50 border-amber-300 text-amber-800"
                              : "bg-gray-50 border-gray-100 text-gray-600 hover:border-amber-200"
                          }`}
                        >
                          {tpl}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button className="flex-1 bg-amber-500 hover:bg-amber-600 text-white" onClick={saveRule}>
                    保存规则
                  </Button>
                  <Button variant="outline" className="border-gray-200" onClick={() => setShowRuleForm(false)}>
                    取消
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Tab: 执行任务 ─────────────────────────────────────────────────── */}
        {activeTab === "task" && (
          <div className="grid lg:grid-cols-5 gap-5">
            {/* 左侧：任务控制 */}
            <div className="lg:col-span-2 space-y-4">
              {/* 任务控制面板 */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <h3 className="text-sm font-bold text-gray-900 mb-4">任务控制</h3>
                <div className="space-y-3">
                  <Button
                    className="w-full bg-amber-500 hover:bg-amber-600 text-white gap-2"
                    onClick={startTask}
                    disabled={task?.status === "running"}
                  >
                    {task?.status === "running" ? (
                      <><Loader2 className="w-4 h-4 animate-spin" />执行中...</>
                    ) : (
                      <><Play className="w-4 h-4" />开始找简历</>
                    )}
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      className="border-gray-200 gap-1.5"
                      onClick={pauseTask}
                      disabled={task?.status !== "running"}
                    >
                      <Pause className="w-4 h-4" />暂停
                    </Button>
                    <Button
                      variant="outline"
                      className="border-red-100 text-red-500 hover:bg-red-50 gap-1.5"
                      onClick={stopTask}
                      disabled={!task || task.status === "idle"}
                    >
                      <Square className="w-4 h-4" />停止
                    </Button>
                  </div>
                </div>

                {task && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">任务状态</span>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${
                        task.status === "running" ? "bg-amber-50 text-amber-600 border-amber-200" :
                        task.status === "done" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                        task.status === "paused" ? "bg-blue-50 text-blue-600 border-blue-200" :
                        "bg-gray-50 text-gray-500 border-gray-200"
                      }`}>
                        {task.status === "running" ? "运行中" : task.status === "done" ? "已完成" : task.status === "paused" ? "已暂停" : "空闲"}
                      </span>
                    </div>
                    {[
                      { label: "当前岗位", value: task.jobTitle },
                      { label: "开始时间", value: task.startedAt },
                      { label: "已搜索", value: `${task.searched} 人` },
                      { label: "已匹配", value: `${task.matched} 人` },
                      { label: "已打招呼", value: `${task.greeted} 人` },
                      { label: "已导入", value: `${task.imported} 份` },
                    ].map(item => (
                      <div key={item.label} className="flex items-center justify-between">
                        <span className="text-xs text-gray-400">{item.label}</span>
                        <span className="text-xs font-semibold text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 已采集候选人 */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold text-gray-900">已采集候选人</h3>
                  <Button size="sm" className="bg-indigo-600 text-white h-7 text-xs px-2.5"
                    onClick={() => toast.success("已批量导入至候选人库")}>
                    <Download className="w-3.5 h-3.5 mr-1" />批量导入
                  </Button>
                </div>
                <div className="space-y-2">
                  {candidates.slice(0, 4).map(c => (
                    <div key={c.id} className="flex items-center gap-2.5 p-2.5 bg-gray-50 rounded-xl">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {c.name.slice(0, 1)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-semibold text-gray-900">{c.name}</span>
                          {c.greeted && <MessageSquare className="w-3 h-3 text-amber-500" />}
                          {c.imported && <CheckCircle2 className="w-3 h-3 text-emerald-500" />}
                        </div>
                        <div className="text-xs text-gray-400 truncate">{c.title} · {c.company}</div>
                      </div>
                      <div className={`text-sm font-bold shrink-0 ${c.matchScore >= 90 ? "text-emerald-600" : c.matchScore >= 80 ? "text-indigo-600" : "text-amber-600"}`}>
                        {c.matchScore}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 右侧：实时日志 */}
            <div className="lg:col-span-3">
              <div className="bg-gray-900 rounded-2xl overflow-hidden h-full min-h-[500px] flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-red-500" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500" />
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                    </div>
                    <span className="text-xs text-gray-400 ml-2 font-mono">RPA Agent · 实时日志</span>
                  </div>
                  {task?.status === "running" && (
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                      <span className="text-xs text-amber-400 font-mono">RUNNING</span>
                    </div>
                  )}
                  {task?.status === "done" && (
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-xs text-emerald-400 font-mono">DONE</span>
                    </div>
                  )}
                </div>
                <div
                  ref={logRef}
                  className="flex-1 p-4 overflow-y-auto space-y-1.5 font-mono text-xs"
                >
                  {runningLogs.length === 0 ? (
                    <div className="text-gray-500 text-center mt-20">
                      <Bot className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      <p>等待任务启动...</p>
                      <p className="text-xs mt-1 opacity-60">点击「开始找简历」启动 RPA Agent</p>
                    </div>
                  ) : (
                    runningLogs.map((log, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <span className="text-gray-500 shrink-0">[{log.time}]</span>
                        <LogBadge type={log.type} />
                        <span className={`${
                          log.type === "success" ? "text-emerald-400" :
                          log.type === "warn" ? "text-amber-400" :
                          log.type === "error" ? "text-red-400" :
                          "text-gray-300"
                        }`}>{log.message}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Tab: 随机事件 ─────────────────────────────────────────────────── */}
        {activeTab === "random" && (
          <div className="grid lg:grid-cols-2 gap-5">
            {/* 左列 */}
            <div className="space-y-4">
              {/* 总开关 */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
                      <Shield className="w-4.5 h-4.5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-gray-900">防检测模式</h3>
                      <p className="text-xs text-gray-400">模拟人类操作行为，降低被平台识别风险</p>
                    </div>
                  </div>
                  <Switch
                    checked={randomConfig.enabled}
                    onCheckedChange={v => setRandomConfig(prev => ({ ...prev, enabled: v }))}
                  />
                </div>
                {randomConfig.enabled && (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {["随机延迟", "随机滚动", "随机暂停", "打字速度变化", "随机浏览"].map(tag => (
                      <span key={tag} className="text-xs bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* 操作延迟 */}
              <div className={`bg-white rounded-2xl border border-gray-100 p-5 space-y-4 ${!randomConfig.enabled ? "opacity-50 pointer-events-none" : ""}`}>
                <div className="flex items-center gap-2">
                  <Timer className="w-4 h-4 text-amber-500" />
                  <h4 className="text-sm font-semibold text-gray-900">操作间隔延迟</h4>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs text-gray-600">最小延迟</Label>
                    <span className="text-xs font-bold text-amber-600">{randomConfig.minDelay} 秒</span>
                  </div>
                  <Slider
                    min={1}
                    max={10}
                    step={1}
                    value={[randomConfig.minDelay]}
                    onValueChange={([v]) => setRandomConfig(prev => ({ ...prev, minDelay: v }))}
                  />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs text-gray-600">最大延迟</Label>
                    <span className="text-xs font-bold text-amber-600">{randomConfig.maxDelay} 秒</span>
                  </div>
                  <Slider
                    min={2}
                    max={30}
                    step={1}
                    value={[randomConfig.maxDelay]}
                    onValueChange={([v]) => setRandomConfig(prev => ({ ...prev, maxDelay: v }))}
                  />
                </div>
                <p className="text-xs text-gray-400">每次操作之间随机等待 {randomConfig.minDelay}~{randomConfig.maxDelay} 秒，模拟人工阅读时间</p>
              </div>

              {/* 随机暂停 */}
              <div className={`bg-white rounded-2xl border border-gray-100 p-5 space-y-4 ${!randomConfig.enabled ? "opacity-50 pointer-events-none" : ""}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Pause className="w-4 h-4 text-blue-500" />
                    <h4 className="text-sm font-semibold text-gray-900">随机暂停休息</h4>
                  </div>
                  <Switch
                    checked={randomConfig.randomPauseEnabled}
                    onCheckedChange={v => setRandomConfig(prev => ({ ...prev, randomPauseEnabled: v }))}
                  />
                </div>
                {randomConfig.randomPauseEnabled && (
                  <div className="space-y-3">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs text-gray-600">每隔多少分钟暂停</Label>
                        <span className="text-xs font-bold text-blue-600">{randomConfig.pauseIntervalMinutes} 分钟</span>
                      </div>
                      <Slider
                        min={10}
                        max={60}
                        step={5}
                        value={[randomConfig.pauseIntervalMinutes]}
                        onValueChange={([v]) => setRandomConfig(prev => ({ ...prev, pauseIntervalMinutes: v }))}
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-xs text-gray-600">暂停时长</Label>
                        <span className="text-xs font-bold text-blue-600">{randomConfig.pauseMinutes} 分钟</span>
                      </div>
                      <Slider
                        min={1}
                        max={15}
                        step={1}
                        value={[randomConfig.pauseMinutes]}
                        onValueChange={([v]) => setRandomConfig(prev => ({ ...prev, pauseMinutes: v }))}
                      />
                    </div>
                    <p className="text-xs text-gray-400">每运行 {randomConfig.pauseIntervalMinutes} 分钟后，随机暂停 {randomConfig.pauseMinutes} 分钟模拟休息</p>
                  </div>
                )}
              </div>
            </div>

            {/* 右列 */}
            <div className="space-y-4">
              {/* 随机滚动 */}
              <div className={`bg-white rounded-2xl border border-gray-100 p-5 ${!randomConfig.enabled ? "opacity-50 pointer-events-none" : ""}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-violet-500" />
                    <h4 className="text-sm font-semibold text-gray-900">随机页面滚动</h4>
                  </div>
                  <Switch
                    checked={randomConfig.randomScrollEnabled}
                    onCheckedChange={v => setRandomConfig(prev => ({ ...prev, randomScrollEnabled: v }))}
                  />
                </div>
                <p className="text-xs text-gray-500">在页面上随机滚动，模拟用户浏览行为，避免机械式操作被识别</p>
              </div>

              {/* 打字速度变化 */}
              <div className={`bg-white rounded-2xl border border-gray-100 p-5 ${!randomConfig.enabled ? "opacity-50 pointer-events-none" : ""}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Shuffle className="w-4 h-4 text-emerald-500" />
                    <h4 className="text-sm font-semibold text-gray-900">打字速度随机化</h4>
                  </div>
                  <Switch
                    checked={randomConfig.typingSpeedVariation}
                    onCheckedChange={v => setRandomConfig(prev => ({ ...prev, typingSpeedVariation: v }))}
                  />
                </div>
                <p className="text-xs text-gray-500">输入文字时随机变化打字速度，模拟人工输入节奏，避免匀速输入被检测</p>
              </div>

              {/* 随机浏览候选人 */}
              <div className={`bg-white rounded-2xl border border-gray-100 p-5 space-y-3 ${!randomConfig.enabled ? "opacity-50 pointer-events-none" : ""}`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Eye className="w-4 h-4 text-cyan-500" />
                    <h4 className="text-sm font-semibold text-gray-900">随机浏览候选人主页</h4>
                  </div>
                  <Switch
                    checked={randomConfig.randomProfileView}
                    onCheckedChange={v => setRandomConfig(prev => ({ ...prev, randomProfileView: v }))}
                  />
                </div>
                {randomConfig.randomProfileView && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-xs text-gray-600">每轮随机浏览数量</Label>
                      <span className="text-xs font-bold text-cyan-600">{randomConfig.profileViewCount} 个</span>
                    </div>
                    <Slider
                      min={1}
                      max={20}
                      step={1}
                      value={[randomConfig.profileViewCount]}
                      onValueChange={([v]) => setRandomConfig(prev => ({ ...prev, profileViewCount: v }))}
                    />
                    <p className="text-xs text-gray-400 mt-2">每轮操作中随机浏览 {randomConfig.profileViewCount} 个不打招呼的候选人主页，增加行为多样性</p>
                  </div>
                )}
              </div>

              {/* 会话时长 */}
              <div className={`bg-white rounded-2xl border border-gray-100 p-5 space-y-3 ${!randomConfig.enabled ? "opacity-50 pointer-events-none" : ""}`}>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-500" />
                  <h4 className="text-sm font-semibold text-gray-900">单次会话最长时长</h4>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-xs text-gray-600">最长运行时间</Label>
                    <span className="text-xs font-bold text-orange-600">{randomConfig.sessionDurationMinutes} 分钟</span>
                  </div>
                  <Slider
                    min={30}
                    max={480}
                    step={30}
                    value={[randomConfig.sessionDurationMinutes]}
                    onValueChange={([v]) => setRandomConfig(prev => ({ ...prev, sessionDurationMinutes: v }))}
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>30分钟</span><span>4小时</span><span>8小时</span>
                  </div>
                </div>
                <p className="text-xs text-gray-400">超过此时长后自动停止，避免长时间连续操作引起平台注意</p>
              </div>

              {/* 保存按钮 */}
              <Button
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                onClick={() => toast.success("随机事件配置已保存")}
              >
                <Shield className="w-4 h-4 mr-2" />保存防检测配置
              </Button>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
