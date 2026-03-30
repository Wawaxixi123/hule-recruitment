/**
 * AI Copilot - 全局AI助手侧边栏
 * Design: Copilot编排 + Worker执行 + Harness治理 + 人工接管
 * 支持四种交互入口：自然语言 / 固定按钮 / 上下文推荐 / 结果追问
 */
import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import {
  Brain, X, Send, Sparkles, ChevronRight, Loader2,
  Zap, FileSearch, GitCompare, MessageSquare, Target,
  CheckCircle2, Clock, AlertCircle, User, Bot,
  Maximize2, Minimize2, RefreshCw, ArrowRight,
  Play, Pause, RotateCcw, ChevronDown, ChevronUp
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

// ─── Types ────────────────────────────────────────────────────────────────────

type SkillStatus = "pending" | "running" | "done" | "error";

interface SkillCall {
  id: string;
  name: string;
  desc: string;
  icon: typeof Brain;
  status: SkillStatus;
  duration?: number;
  result?: string;
}

interface TaskStep {
  id: string;
  label: string;
  status: "pending" | "running" | "done";
  detail?: string;
}

type MessageRole = "user" | "assistant" | "system";

interface Message {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: Date;
  skills?: SkillCall[];
  taskSteps?: TaskStep[];
  quickReplies?: string[];
  actionButtons?: { label: string; action: string }[];
  isStreaming?: boolean;
}

interface ContextSuggestion {
  id: string;
  text: string;
  action: string;
  icon: typeof Brain;
  priority: "high" | "medium";
}

// ─── Scenario Definitions ─────────────────────────────────────────────────────

const QUICK_ACTIONS = [
  { label: "生成 JD", icon: Brain, action: "generate_jd", color: "indigo" },
  { label: "深度评估", icon: Target, action: "deep_eval", color: "cyan" },
  { label: "对比分析", icon: GitCompare, action: "compare", color: "indigo" },
  { label: "生成面试题", icon: MessageSquare, action: "interview_q", color: "cyan" },
  { label: "复盘面试", icon: FileSearch, action: "review", color: "indigo" },
];

const CONTEXT_SUGGESTIONS: Record<string, ContextSuggestion[]> = {
  "/candidates": [
    { id: "s1", text: "发现 16 份新简历，是否按当前岗位标准筛选？", action: "batch_screen", icon: FileSearch, priority: "high" },
    { id: "s2", text: "这 3 位候选人适合进行横向对比", action: "compare_3", icon: GitCompare, priority: "medium" },
  ],
  "/candidates/": [
    { id: "s3", text: "该候选人与岗位匹配度较低，是否查看原因？", action: "explain_low", icon: AlertCircle, priority: "high" },
    { id: "s4", text: "为该候选人生成定制化面试题", action: "gen_interview", icon: MessageSquare, priority: "medium" },
  ],
  "/jobs": [
    { id: "s5", text: "有 2 个职位 JD 描述不够清晰，AI 可优化", action: "optimize_jd", icon: Brain, priority: "medium" },
  ],
  "/interviews": [
    { id: "s6", text: "今日有 3 场面试，是否生成面试准备材料？", action: "prep_interview", icon: MessageSquare, priority: "high" },
  ],
  "/dashboard": [
    { id: "s7", text: "本周招聘进度落后，AI 建议优先处理 ML 工程师岗位", action: "focus_ml", icon: Zap, priority: "high" },
    { id: "s8", text: "有 5 位候选人等待超过 3 天，建议跟进", action: "followup", icon: Clock, priority: "medium" },
  ],
};

// ─── Scenario Responses ───────────────────────────────────────────────────────

function buildScenario(action: string, userInput?: string): {
  content: string;
  skills: SkillCall[];
  taskSteps: TaskStep[];
  quickReplies?: string[];
  actionButtons?: { label: string; action: string }[];
} {
  const id = () => Math.random().toString(36).slice(2, 8);

  switch (action) {
    case "generate_jd":
      return {
        content: "好的！我来帮你生成一份结构化的职位描述。正在调用 **JD生成引擎**，根据岗位标准和市场数据自动生成...",
        skills: [
          { id: id(), name: "JD生成引擎", desc: "解析岗位需求，对齐职级标准", icon: Brain, status: "pending" },
          { id: id(), name: "市场薪资校准", desc: "匹配当前市场薪资区间", icon: Target, status: "pending" },
          { id: id(), name: "合规审查", desc: "检查JD合规性和包容性", icon: CheckCircle2, status: "pending" },
        ],
        taskSteps: [
          { id: id(), label: "解析岗位关键词", status: "pending" },
          { id: id(), label: "生成职责描述", status: "pending" },
          { id: id(), label: "生成任职要求", status: "pending" },
          { id: id(), label: "薪资区间校准", status: "pending" },
          { id: id(), label: "合规性审查", status: "pending" },
        ],
        quickReplies: ["AI 产品经理", "ML 工程师", "HRBP", "前端工程师"],
        actionButtons: [{ label: "前往 JD 生成页", action: "nav:/jobs/create" }],
      };

    case "deep_eval":
      return {
        content: "正在对候选人进行深度评估，调用多维度评分模型，结合岗位要求生成可解释评估报告...",
        skills: [
          { id: id(), name: "简历语义解析", desc: "深度理解工作经历语义", icon: FileSearch, status: "pending" },
          { id: id(), name: "六维评分模型", desc: "核心技能/业务/项目/职级/成长/稳定", icon: Target, status: "pending" },
          { id: id(), name: "证据链提取", desc: "为每个评分提取原文依据", icon: CheckCircle2, status: "pending" },
          { id: id(), name: "风险信号检测", desc: "识别跳槽频率、职级倒退等风险", icon: AlertCircle, status: "pending" },
        ],
        taskSteps: [
          { id: id(), label: "解析简历结构", status: "pending" },
          { id: id(), label: "提取核心经历", status: "pending" },
          { id: id(), label: "计算六维评分", status: "pending" },
          { id: id(), label: "生成证据链", status: "pending" },
          { id: id(), label: "输出评估报告", status: "pending" },
        ],
        quickReplies: ["为什么他只有 68 分？", "查看证据链详情", "与岗位要求对比"],
        actionButtons: [{ label: "查看候选人画像", action: "nav:/candidates" }],
      };

    case "compare":
    case "compare_3":
      return {
        content: "好的！我将对选中的候选人进行横向对比分析，找出关键差异并给出适配场景建议...",
        skills: [
          { id: id(), name: "多维对比引擎", desc: "逐维度横向对比评分", icon: GitCompare, status: "pending" },
          { id: id(), name: "差异高亮分析", desc: "识别候选人间关键差异点", icon: Zap, status: "pending" },
          { id: id(), name: "场景适配推荐", desc: "根据岗位需求推荐最优候选人", icon: Target, status: "pending" },
        ],
        taskSteps: [
          { id: id(), label: "加载候选人数据", status: "pending" },
          { id: id(), label: "对齐评分维度", status: "pending" },
          { id: id(), label: "计算差异矩阵", status: "pending" },
          { id: id(), label: "生成对比报告", status: "pending" },
        ],
        quickReplies: ["谁更适合技术深度岗？", "谁的成长潜力更高？", "查看完整对比"],
        actionButtons: [{ label: "打开对比 Canvas", action: "nav:/candidates/compare" }],
      };

    case "interview_q":
    case "gen_interview":
      return {
        content: "正在根据候选人画像和岗位JD，生成差异化面试题库，覆盖基础题、深挖题和风险验证题...",
        skills: [
          { id: id(), name: "画像解读器", desc: "解读候选人优势与短板", icon: Target, status: "pending" },
          { id: id(), name: "面试题生成器", desc: "生成三类差异化面试题", icon: MessageSquare, status: "pending" },
          { id: id(), name: "难度校准", desc: "根据职级调整题目难度", icon: Zap, status: "pending" },
        ],
        taskSteps: [
          { id: id(), label: "分析候选人短板", status: "pending" },
          { id: id(), label: "生成基础验证题 (3题)", status: "pending" },
          { id: id(), label: "生成深挖追问题 (3题)", status: "pending" },
          { id: id(), label: "生成风险验证题 (2题)", status: "pending" },
          { id: id(), label: "输出面试题卡", status: "pending" },
        ],
        quickReplies: ["增加行为面试题", "调整难度为高级", "导出面试题卡"],
        actionButtons: [{ label: "前往面试管理", action: "nav:/interviews" }],
      };

    case "review":
      return {
        content: "正在生成面试复盘报告，整合面试官评价、候选人表现和AI分析...",
        skills: [
          { id: id(), name: "飞书数据同步", desc: "同步面试记录和评价", icon: RefreshCw, status: "pending" },
          { id: id(), name: "复盘分析引擎", desc: "分析面试表现与预期差距", icon: FileSearch, status: "pending" },
          { id: id(), name: "决策建议生成", desc: "输出录用/拒绝/待定建议", icon: CheckCircle2, status: "pending" },
        ],
        taskSteps: [
          { id: id(), label: "同步面试记录", status: "pending" },
          { id: id(), label: "整合多面试官评价", status: "pending" },
          { id: id(), label: "与预期画像对比", status: "pending" },
          { id: id(), label: "生成复盘报告", status: "pending" },
        ],
        quickReplies: ["查看详细评分", "与其他候选人对比", "发送复盘报告"],
        actionButtons: [{ label: "查看面试记录", action: "nav:/interviews" }],
      };

    case "batch_screen":
      return {
        content: "发现 16 份新简历！正在按当前岗位标准进行批量AI筛选，预计完成时间 2 分钟...",
        skills: [
          { id: id(), name: "批量解析引擎", desc: "并行解析 16 份简历", icon: FileSearch, status: "pending" },
          { id: id(), name: "岗位匹配模型", desc: "与当前 JD 进行语义匹配", icon: Target, status: "pending" },
          { id: id(), name: "排序与分层", desc: "按匹配度分为 A/B/C 三档", icon: Zap, status: "pending" },
        ],
        taskSteps: [
          { id: id(), label: "解析 16 份简历", status: "pending" },
          { id: id(), label: "语义匹配评分", status: "pending" },
          { id: id(), label: "分档排序", status: "pending" },
          { id: id(), label: "生成筛选报告", status: "pending" },
        ],
        quickReplies: ["查看 A 档候选人", "调整筛选标准", "导出筛选结果"],
        actionButtons: [{ label: "查看候选人列表", action: "nav:/candidates" }],
      };

    case "explain_low":
      return {
        content: "我来解释一下为什么这位候选人匹配度较低。根据六维评分模型分析：\n\n**核心技术能力 (52分)** — 简历中提到的技术栈与岗位要求存在较大差距，缺少大模型相关经验。\n\n**项目复杂度 (61分)** — 主导项目规模偏小，缺少百万级用户产品经验。\n\n**建议**：可以通过面试深入了解其学习能力，评估是否具备快速成长潜力。",
        skills: [
          { id: id(), name: "评分解释器", desc: "逐维度解析低分原因", icon: AlertCircle, status: "pending" },
          { id: id(), name: "差距分析", desc: "量化候选人与岗位的能力差距", icon: Target, status: "pending" },
        ],
        taskSteps: [
          { id: id(), label: "提取低分维度", status: "pending" },
          { id: id(), label: "定位证据片段", status: "pending" },
          { id: id(), label: "生成解释报告", status: "pending" },
        ],
        quickReplies: ["为什么他只有 68 分？", "是否值得面试？", "生成针对性面试题"],
      };

    default:
      // 自然语言通用回复
      if (userInput) {
        const lower = userInput.toLowerCase();
        if (lower.includes("jd") || lower.includes("职位描述") || lower.includes("岗位")) {
          return buildScenario("generate_jd");
        }
        if (lower.includes("面试题") || lower.includes("面试问题")) {
          return buildScenario("interview_q");
        }
        if (lower.includes("对比") || lower.includes("比较")) {
          return buildScenario("compare");
        }
        if (lower.includes("评估") || lower.includes("评分") || lower.includes("筛选")) {
          return buildScenario("deep_eval");
        }
        if (lower.includes("复盘") || lower.includes("面试结果")) {
          return buildScenario("review");
        }
        if (lower.includes("为什么") || lower.includes("原因") || lower.includes("解释")) {
          return buildScenario("explain_low");
        }
      }
      return {
        content: "我是葫乐AI Copilot，可以帮你完成招聘全流程的智能任务。你可以告诉我：\n\n- 「帮我生成一个 AI 产品经理 JD」\n- 「对这 3 位候选人进行对比分析」\n- 「为什么候选人只有 68 分？」\n\n或者点击上方快捷操作按钮快速开始。",
        skills: [],
        taskSteps: [],
        quickReplies: ["生成 JD", "批量筛选简历", "对比候选人", "生成面试题"],
      };
  }
}

// ─── Skill Execution Simulator ────────────────────────────────────────────────

async function simulateSkillExecution(
  skills: SkillCall[],
  onUpdate: (skills: SkillCall[]) => void
): Promise<void> {
  const updated = [...skills];
  for (let i = 0; i < updated.length; i++) {
    updated[i] = { ...updated[i], status: "running" };
    onUpdate([...updated]);
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 800));
    updated[i] = { ...updated[i], status: "done", duration: Math.round(400 + Math.random() * 600) };
    onUpdate([...updated]);
    await new Promise((r) => setTimeout(r, 150));
  }
}

async function simulateTaskSteps(
  steps: TaskStep[],
  onUpdate: (steps: TaskStep[]) => void
): Promise<void> {
  const updated = [...steps];
  for (let i = 0; i < updated.length; i++) {
    updated[i] = { ...updated[i], status: "running" };
    onUpdate([...updated]);
    await new Promise((r) => setTimeout(r, 500 + Math.random() * 700));
    updated[i] = { ...updated[i], status: "done" };
    onUpdate([...updated]);
    await new Promise((r) => setTimeout(r, 100));
  }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SkillCallCard({ skill }: { skill: SkillCall }) {
  const Icon = skill.icon;
  return (
    <div className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all duration-300 ${
      skill.status === "running"
        ? "border-indigo-200 bg-indigo-50/80"
        : skill.status === "done"
        ? "border-emerald-200 bg-emerald-50/60"
        : "border-gray-100 bg-gray-50/60"
    }`}>
      <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
        skill.status === "running" ? "bg-indigo-500" :
        skill.status === "done" ? "bg-emerald-500" : "bg-gray-300"
      }`}>
        {skill.status === "running" ? (
          <Loader2 className="w-3 h-3 text-white animate-spin" />
        ) : skill.status === "done" ? (
          <CheckCircle2 className="w-3 h-3 text-white" />
        ) : (
          <Icon className="w-3 h-3 text-white" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`text-xs font-semibold truncate ${
          skill.status === "running" ? "text-indigo-700" :
          skill.status === "done" ? "text-emerald-700" : "text-gray-500"
        }`}>
          {skill.name}
        </div>
        <div className="text-xs text-gray-400 truncate">{skill.desc}</div>
      </div>
      {skill.status === "running" && (
        <div className="flex gap-0.5 flex-shrink-0">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-1 h-3 bg-indigo-400 rounded-full animate-pulse"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          ))}
        </div>
      )}
      {skill.status === "done" && skill.duration && (
        <span className="text-xs text-emerald-500 flex-shrink-0">{skill.duration}ms</span>
      )}
    </div>
  );
}

function TaskStepList({ steps }: { steps: TaskStep[] }) {
  const [expanded, setExpanded] = useState(true);
  const doneCount = steps.filter((s) => s.status === "done").length;
  const total = steps.length;

  return (
    <div className="border border-gray-100 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Play className="w-3 h-3 text-indigo-500" />
          <span className="text-xs font-semibold text-gray-700">任务流程</span>
          <span className="text-xs text-gray-400">{doneCount}/{total}</span>
        </div>
        {expanded ? <ChevronUp className="w-3 h-3 text-gray-400" /> : <ChevronDown className="w-3 h-3 text-gray-400" />}
      </button>
      {expanded && (
        <div className="px-3 py-2 space-y-1.5">
          {steps.map((step, i) => (
            <div key={step.id} className="flex items-center gap-2">
              <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 transition-all ${
                step.status === "done" ? "bg-emerald-500" :
                step.status === "running" ? "bg-indigo-500" : "bg-gray-200"
              }`}>
                {step.status === "running" ? (
                  <Loader2 className="w-2.5 h-2.5 text-white animate-spin" />
                ) : step.status === "done" ? (
                  <CheckCircle2 className="w-2.5 h-2.5 text-white" />
                ) : (
                  <span className="text-xs text-gray-400 font-bold" style={{ fontSize: 8 }}>{i + 1}</span>
                )}
              </div>
              <span className={`text-xs transition-colors ${
                step.status === "done" ? "text-gray-600 line-through" :
                step.status === "running" ? "text-indigo-700 font-medium" : "text-gray-400"
              }`}>
                {step.label}
              </span>
              {step.status === "running" && (
                <span className="text-xs text-indigo-400 animate-pulse">处理中...</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function MessageBubble({
  msg,
  onQuickReply,
  onAction,
}: {
  msg: Message;
  onQuickReply: (text: string) => void;
  onAction: (action: string) => void;
}) {
  const isUser = msg.role === "user";

  return (
    <div className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {/* Avatar */}
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
        isUser ? "bg-indigo-100" : "bg-gradient-to-br from-indigo-500 to-cyan-500"
      }`}>
        {isUser ? (
          <User className="w-3.5 h-3.5 text-indigo-600" />
        ) : (
          <Brain className="w-3.5 h-3.5 text-white" />
        )}
      </div>

      <div className={`flex-1 space-y-2 ${isUser ? "items-end" : "items-start"} flex flex-col`}>
        {/* Bubble */}
        <div className={`max-w-full rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-indigo-600 text-white rounded-tr-sm"
            : "bg-white border border-gray-100 text-gray-800 rounded-tl-sm shadow-sm"
        }`}>
          {msg.isStreaming ? (
            <span className="flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-indigo-400" />
              <span className="text-gray-400 text-xs">AI 思考中...</span>
            </span>
          ) : (
            <div className="whitespace-pre-wrap">
              {msg.content.split(/(\*\*[^*]+\*\*)/).map((part, i) =>
                part.startsWith("**") && part.endsWith("**") ? (
                  <strong key={i} className={isUser ? "text-white" : "text-gray-900"}>
                    {part.slice(2, -2)}
                  </strong>
                ) : (
                  <span key={i}>{part}</span>
                )
              )}
            </div>
          )}
        </div>

        {/* Skills */}
        {!isUser && msg.skills && msg.skills.length > 0 && (
          <div className="w-full space-y-1.5">
            <div className="flex items-center gap-1.5 px-1">
              <Zap className="w-3 h-3 text-indigo-400" />
              <span className="text-xs text-gray-400 font-medium">技能调用</span>
            </div>
            {msg.skills.map((skill) => (
              <SkillCallCard key={skill.id} skill={skill} />
            ))}
          </div>
        )}

        {/* Task Steps */}
        {!isUser && msg.taskSteps && msg.taskSteps.length > 0 && (
          <div className="w-full">
            <TaskStepList steps={msg.taskSteps} />
          </div>
        )}

        {/* Action Buttons */}
        {!isUser && msg.actionButtons && msg.actionButtons.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {msg.actionButtons.map((btn) => (
              <button
                key={btn.action}
                onClick={() => onAction(btn.action)}
                className="flex items-center gap-1 text-xs bg-indigo-600 text-white px-3 py-1.5 rounded-full hover:bg-indigo-700 transition-colors font-medium"
              >
                {btn.label}
                <ArrowRight className="w-3 h-3" />
              </button>
            ))}
          </div>
        )}

        {/* Quick Replies */}
        {!isUser && msg.quickReplies && msg.quickReplies.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {msg.quickReplies.map((reply) => (
              <button
                key={reply}
                onClick={() => onQuickReply(reply)}
                className="text-xs border border-indigo-200 text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-full hover:bg-indigo-100 transition-colors"
              >
                {reply}
              </button>
            ))}
          </div>
        )}

        {/* Timestamp */}
        <span className="text-xs text-gray-300 px-1">
          {msg.timestamp.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

// ─── Context Suggestion Banner ─────────────────────────────────────────────────

function ContextSuggestionBanner({
  suggestions,
  onAccept,
  onDismiss,
}: {
  suggestions: ContextSuggestion[];
  onAccept: (s: ContextSuggestion) => void;
  onDismiss: (id: string) => void;
}) {
  if (suggestions.length === 0) return null;
  const s = suggestions[0];
  const Icon = s.icon;

  return (
    <div className={`mx-3 mb-2 rounded-xl border p-3 ${
      s.priority === "high"
        ? "bg-amber-50 border-amber-200"
        : "bg-indigo-50 border-indigo-200"
    }`}>
      <div className="flex items-start gap-2">
        <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${
          s.priority === "high" ? "bg-amber-400" : "bg-indigo-400"
        }`}>
          <Icon className="w-3 h-3 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className={`text-xs leading-relaxed ${
            s.priority === "high" ? "text-amber-800" : "text-indigo-800"
          }`}>
            {s.text}
          </p>
          <div className="flex gap-2 mt-2">
            <button
              onClick={() => onAccept(s)}
              className={`text-xs font-semibold px-2.5 py-1 rounded-full transition-colors ${
                s.priority === "high"
                  ? "bg-amber-500 text-white hover:bg-amber-600"
                  : "bg-indigo-500 text-white hover:bg-indigo-600"
              }`}
            >
              执行
            </button>
            <button
              onClick={() => onDismiss(s.id)}
              className="text-xs text-gray-400 hover:text-gray-600 px-1"
            >
              忽略
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Copilot Component ────────────────────────────────────────────────────

interface AICopilotProps {
  isOpen: boolean;
  onClose: () => void;
  isExpanded: boolean;
  onToggleExpand: () => void;
}

export function AICopilot({ isOpen, onClose, isExpanded, onToggleExpand }: AICopilotProps) {
  const [location, navigate] = useLocation();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "你好！我是葫乐AI Copilot 🤖\n\n我可以帮你完成招聘全流程的智能任务，包括 JD 生成、简历筛选、候选人评估、面试题生成等。\n\n试着告诉我你想做什么，或者点击下方快捷操作开始！",
      timestamp: new Date(),
      quickReplies: ["帮我生成一个 AI 产品经理 JD", "批量筛选候选人", "对比分析候选人"],
    },
  ]);
  const [input, setInput] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState<ContextSuggestion[]>([]);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<Set<string>>(new Set());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Update context suggestions based on current route
  useEffect(() => {
    const routeSuggestions =
      CONTEXT_SUGGESTIONS[location] ||
      (location.startsWith("/candidates/") ? CONTEXT_SUGGESTIONS["/candidates/"] : []) ||
      [];
    const filtered = routeSuggestions.filter((s) => !dismissedSuggestions.has(s.id));
    setSuggestions(filtered);
  }, [location, dismissedSuggestions]);

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const addMessage = useCallback((msg: Omit<Message, "id" | "timestamp">) => {
    const newMsg: Message = {
      ...msg,
      id: Math.random().toString(36).slice(2),
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, newMsg]);
    return newMsg.id;
  }, []);

  const updateMessage = useCallback((id: string, updates: Partial<Message>) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  }, []);

  const processAction = useCallback(async (action: string, userText?: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    // Add thinking message
    const thinkingId = addMessage({ role: "assistant", content: "", isStreaming: true, skills: [], taskSteps: [] });

    await new Promise((r) => setTimeout(r, 600));

    const scenario = buildScenario(action, userText);

    // Replace thinking with real message
    updateMessage(thinkingId, {
      content: scenario.content,
      isStreaming: false,
      skills: scenario.skills,
      taskSteps: scenario.taskSteps,
      quickReplies: scenario.quickReplies,
      actionButtons: scenario.actionButtons,
    });

    // Simulate skill execution
    if (scenario.skills.length > 0) {
      await simulateSkillExecution(scenario.skills, (updatedSkills) => {
        updateMessage(thinkingId, { skills: updatedSkills });
      });
    }

    // Simulate task steps
    if (scenario.taskSteps.length > 0) {
      await simulateTaskSteps(scenario.taskSteps, (updatedSteps) => {
        updateMessage(thinkingId, { taskSteps: updatedSteps });
      });
    }

    // Final completion message
    if (scenario.skills.length > 0 || scenario.taskSteps.length > 0) {
      addMessage({
        role: "assistant",
        content: "✅ 任务已完成！你可以继续追问或点击上方按钮查看详细结果。",
        quickReplies: scenario.quickReplies,
      });
    }

    setIsProcessing(false);
  }, [isProcessing, addMessage, updateMessage]);

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || isProcessing) return;
    setInput("");

    addMessage({ role: "user", content: text });
    await processAction("default", text);
  }, [input, isProcessing, addMessage, processAction]);

  const handleQuickReply = useCallback(async (text: string) => {
    if (isProcessing) return;
    addMessage({ role: "user", content: text });
    await processAction("default", text);
  }, [isProcessing, addMessage, processAction]);

  const handleAction = useCallback((action: string) => {
    if (action.startsWith("nav:")) {
      navigate(action.slice(4));
      toast.success("已跳转到对应页面");
    }
  }, [navigate]);

  const handleSuggestionAccept = useCallback(async (s: ContextSuggestion) => {
    setDismissedSuggestions((prev) => { const next = new Set(Array.from(prev)); next.add(s.id); return next; });
    addMessage({ role: "user", content: s.text });
    await processAction(s.action);
  }, [addMessage, processAction]);

  const handleSuggestionDismiss = useCallback((id: string) => {
    setDismissedSuggestions((prev) => { const next = new Set(Array.from(prev)); next.add(id); return next; });
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) return null;

  const panelWidth = isExpanded ? "w-[520px]" : "w-[360px]";

  return (
    <>
      {/* Backdrop for expanded mode */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/10 z-40"
          onClick={onToggleExpand}
        />
      )}

      <div
        className={`fixed right-0 top-0 bottom-0 ${panelWidth} bg-white border-l border-gray-100 shadow-2xl z-50 flex flex-col transition-all duration-300`}
        style={{ boxShadow: "-4px 0 40px rgba(79,70,229,0.08)" }}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-gray-100 bg-gradient-to-r from-indigo-600 to-cyan-500 flex-shrink-0">
          <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
            <Brain className="w-4.5 h-4.5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold text-white">AI Copilot</div>
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-300 animate-pulse" />
              <span className="text-xs text-indigo-100">在线 · 随时可用</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onToggleExpand}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              title={isExpanded ? "收起" : "展开"}
            >
              {isExpanded ? (
                <Minimize2 className="w-3.5 h-3.5 text-white" />
              ) : (
                <Maximize2 className="w-3.5 h-3.5 text-white" />
              )}
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-lg bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-3 py-2.5 border-b border-gray-50 flex-shrink-0">
          <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-0.5">
            {QUICK_ACTIONS.map((qa) => {
              const Icon = qa.icon;
              return (
                <button
                  key={qa.action}
                  onClick={() => {
                    addMessage({ role: "user", content: qa.label });
                    processAction(qa.action);
                  }}
                  disabled={isProcessing}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all flex-shrink-0 ${
                    qa.color === "indigo"
                      ? "bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-100"
                      : "bg-cyan-50 text-cyan-700 hover:bg-cyan-100 border border-cyan-100"
                  } disabled:opacity-50`}
                >
                  <Icon className="w-3 h-3" />
                  {qa.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Context Suggestions */}
        {suggestions.length > 0 && (
          <div className="pt-2 flex-shrink-0">
            <ContextSuggestionBanner
              suggestions={suggestions}
              onAccept={handleSuggestionAccept}
              onDismiss={handleSuggestionDismiss}
            />
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-4">
          {messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              msg={msg}
              onQuickReply={handleQuickReply}
              onAction={handleAction}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="px-3 py-3 border-t border-gray-100 flex-shrink-0">
          <div className="flex items-end gap-2 bg-gray-50 rounded-2xl border border-gray-200 px-3 py-2 focus-within:border-indigo-300 focus-within:ring-2 focus-within:ring-indigo-50 transition-all">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="告诉我你想做什么..."
              disabled={isProcessing}
              rows={1}
              className="flex-1 bg-transparent text-sm text-gray-800 placeholder-gray-400 resize-none focus:outline-none min-h-[24px] max-h-[80px] leading-6 disabled:opacity-50"
              style={{ height: "auto" }}
              onInput={(e) => {
                const target = e.target as HTMLTextAreaElement;
                target.style.height = "auto";
                target.style.height = Math.min(target.scrollHeight, 80) + "px";
              }}
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isProcessing}
              className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center flex-shrink-0 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              {isProcessing ? (
                <Loader2 className="w-4 h-4 text-white animate-spin" />
              ) : (
                <Send className="w-3.5 h-3.5 text-white" />
              )}
            </button>
          </div>
          <p className="text-xs text-gray-300 text-center mt-1.5">Enter 发送 · Shift+Enter 换行</p>
        </div>
      </div>
    </>
  );
}

// ─── Floating Trigger Button ───────────────────────────────────────────────────

interface CopilotTriggerProps {
  isOpen: boolean;
  onClick: () => void;
  hasNotification?: boolean;
}

export function CopilotTrigger({ isOpen, onClick, hasNotification }: CopilotTriggerProps) {
  if (isOpen) return null;
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95"
      title="打开 AI Copilot"
    >
      <Brain className="w-6 h-6 text-white" />
      {hasNotification && (
        <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
          <span className="text-white text-xs font-bold" style={{ fontSize: 9 }}>!</span>
        </div>
      )}
    </button>
  );
}
