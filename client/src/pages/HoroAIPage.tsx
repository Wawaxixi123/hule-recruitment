/**
 * HoroAIPage - Horo AI 独立对话页
 * 支持聊天历史、新建对话、刷新当前对话
 * 白色主题，与主界面保持统一
 */
import { useState, useRef, useEffect, useCallback } from "react";
import AppLayout from "@/components/AppLayout";
import {
  Brain, Send, Plus, RefreshCw, Trash2, MessageSquare,
  Sparkles, Zap, CheckCircle2, Loader2, Paperclip, Wrench,
  FileText, BarChart3, Users, RotateCcw, ArrowRight,
  Star, AlertCircle, BookOpen, Hash, Search, X, Clock,
  ChevronRight
} from "lucide-react";
import { mockSkills } from "@/lib/mockData";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────
interface SkillCall {
  id: string; name: string; icon: string;
  status: "pending" | "running" | "done" | "error";
  duration?: number; output?: string;
}
interface TaskStep { id: string; label: string; status: "pending" | "running" | "done"; }
interface ActionCard {
  type: "jd" | "candidates" | "interview" | "compare" | "report";
  title: string; summary: string; actionLabel: string; actionPath: string;
}
interface Message {
  id: string; role: "user" | "assistant"; content: string; timestamp: Date;
  skillCalls?: SkillCall[]; taskSteps?: TaskStep[];
  quickReplies?: string[]; actionCard?: ActionCard;
}
interface ChatSession {
  id: string; title: string; createdAt: Date; updatedAt: Date;
  messages: Message[]; preview: string;
}

// ─── Mock response builder ────────────────────────────────────────────────────
function buildResponse(input: string): Omit<Message, "id" | "timestamp" | "role"> {
  const lower = input.toLowerCase();
  if (lower.includes("jd") || lower.includes("岗位") || lower.includes("职位")) {
    return {
      content: "好的，我将为您生成一份高质量的岗位描述。已参考知识库中的公司介绍、企业文化和薪酬福利文档，生成更贴合公司实际的JD。",
      skillCalls: [
        { id: "s1", name: "战略性岗位描述生成", icon: "📝", status: "done", duration: 1.2, output: "JD框架已生成" },
        { id: "s2", name: "雇主品牌内容策划", icon: "🌟", status: "done", duration: 0.8, output: "品牌亮点已提炼" },
        { id: "s3", name: "薪酬竞争力诊断", icon: "💰", status: "done", duration: 0.6, output: "薪酬区间已匹配" },
      ],
      taskSteps: [
        { id: "t1", label: "读取知识库：公司介绍、企业文化", status: "done" },
        { id: "t2", label: "分析岗位核心能力要求", status: "done" },
        { id: "t3", label: "生成JD正文", status: "done" },
        { id: "t4", label: "优化吸引力表达", status: "done" },
      ],
      actionCard: { type: "jd", title: "高级AI产品经理 · JD已生成", summary: "已生成包含岗位职责、任职要求、薪酬福利的完整JD，预计吸引力评分 92/100", actionLabel: "查看并编辑JD", actionPath: "/jobs/create" },
      quickReplies: ["调整薪酬区间", "增加技术要求", "优化福利描述", "一键发布"],
    };
  }
  if (lower.includes("评估") || lower.includes("筛选") || lower.includes("简历")) {
    return {
      content: "正在对候选人进行深度评估，结合知识库中的岗位说明书和团队介绍，提供更精准的匹配评分...",
      skillCalls: [
        { id: "s1", name: "智能简历深度评估", icon: "📊", status: "done", duration: 2.1, output: "五维评分完成" },
        { id: "s2", name: "高潜人才识别模型", icon: "⭐", status: "done", duration: 1.4, output: "潜力评级：A+" },
        { id: "s3", name: "录用决策辅助分析", icon: "🤖", status: "done", duration: 0.9, output: "推荐：强烈推荐" },
      ],
      taskSteps: [
        { id: "t1", label: "读取知识库：岗位说明书", status: "done" },
        { id: "t2", label: "解析简历结构", status: "done" },
        { id: "t3", label: "五维能力评分", status: "done" },
        { id: "t4", label: "生成评估报告", status: "done" },
      ],
      actionCard: { type: "candidates", title: "候选人评估完成 · 共筛选 12 人", summary: "强烈推荐 3 人，推荐 5 人，待定 4 人。AI评分最高：陈志远 94分", actionLabel: "查看候选人列表", actionPath: "/candidates" },
      quickReplies: ["为什么他只有68分？", "查看最高分候选人", "进行横向对比", "安排面试"],
    };
  }
  if (lower.includes("对比") || lower.includes("比较")) {
    return {
      content: "正在生成候选人横向对比分析，综合各维度数据...",
      skillCalls: [
        { id: "s1", name: "录用决策辅助分析", icon: "🤖", status: "done", duration: 1.8, output: "对比矩阵已生成" },
        { id: "s2", name: "团队能力矩阵分析", icon: "🗂️", status: "done", duration: 1.2, output: "能力互补分析完成" },
      ],
      taskSteps: [
        { id: "t1", label: "提取候选人维度数据", status: "done" },
        { id: "t2", label: "生成对比矩阵", status: "done" },
        { id: "t3", label: "识别差异化优势", status: "done" },
        { id: "t4", label: "输出推荐意见", status: "done" },
      ],
      actionCard: { type: "compare", title: "对比分析完成 · 3位候选人", summary: "综合推荐：陈志远 > 李明华 > 王芳。陈志远在技术深度和业务理解上均有优势。", actionLabel: "查看对比Canvas", actionPath: "/candidates/compare" },
      quickReplies: ["为什么推荐陈志远？", "查看详细对比", "安排终面", "发送Offer"],
    };
  }
  if (lower.includes("面试题") || lower.includes("面试问题")) {
    return {
      content: "正在为您生成结构化面试题库，结合岗位说明书和招聘流程SOP...",
      skillCalls: [
        { id: "s1", name: "深度面试题库生成", icon: "❓", status: "done", duration: 2.3, output: "已生成32道题" },
        { id: "s2", name: "面试官标准化培训", icon: "👨‍🏫", status: "done", duration: 0.7, output: "评分标准已配置" },
      ],
      taskSteps: [
        { id: "t1", label: "读取知识库：招聘流程SOP", status: "done" },
        { id: "t2", label: "分析岗位核心能力", status: "done" },
        { id: "t3", label: "生成各类型面试题", status: "done" },
        { id: "t4", label: "配置评分标准", status: "done" },
      ],
      actionCard: { type: "interview", title: "面试题库已生成 · 32道题", summary: "基础题 12道、深挖题 12道、风险验证题 8道，已按面试阶段分组", actionLabel: "查看面试题库", actionPath: "/interviews" },
      quickReplies: ["增加技术深挖题", "添加行为面试题", "导出题库", "安排面试"],
    };
  }
  return {
    content: "我理解您的需求。作为您的专属HR智能助手，我已接入公司知识库，可以更贴合公司实际情况提供以下支持：\n\n**招聘全链路支持**\n- 基于知识库生成高质量JD和岗位描述\n- 结合岗位说明书智能筛选和评估候选人\n- 生成结构化面试题库\n- 面试复盘和录用决策\n\n请告诉我您具体想做什么？",
    quickReplies: ["生成JD", "筛选简历", "生成面试题", "候选人对比"],
  };
}

// ─── Skill Selector ───────────────────────────────────────────────────────────
function SkillSelector({ onSelect, onClose }: { onSelect: (text: string) => void; onClose: () => void }) {
  const [search, setSearch] = useState("");
  const officialSkills = mockSkills.filter(s => s.type === "official").slice(0, 20);
  const filtered = officialSkills.filter(s => !search || s.name.includes(search) || s.description.includes(search));
  return (
    <div className="absolute bottom-full left-0 mb-2 w-[340px] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">
      <div className="p-3 border-b border-gray-100">
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
          <Search className="w-3.5 h-3.5 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索技能..." className="bg-transparent text-gray-800 text-sm flex-1 outline-none placeholder:text-gray-400" autoFocus />
        </div>
      </div>
      <div className="h-[240px] overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
        <div className="p-2 space-y-1">
          {filtered.map(skill => (
            <button key={skill.id} onClick={() => { onSelect(`使用【${skill.name}】技能`); onClose(); }}
              className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors flex items-start gap-2.5">
              <span className="text-lg leading-none mt-0.5">{skill.icon}</span>
              <div className="flex-1 min-w-0">
                <span className="text-gray-800 text-sm font-medium truncate block">{skill.name}</span>
                <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{skill.description}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Message Bubble ───────────────────────────────────────────────────────────
function MessageBubble({ msg, onQuickReply }: { msg: Message; onQuickReply: (text: string) => void }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shrink-0 mt-1">
          <Brain className="w-4 h-4 text-white" />
        </div>
      )}
      <div className={`flex flex-col gap-2 max-w-[75%] ${isUser ? "items-end" : "items-start"}`}>
        <div className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
          isUser ? "bg-indigo-600 text-white rounded-tr-sm" : "bg-white text-gray-800 rounded-tl-sm border border-gray-100 shadow-sm"
        }`}>
          {msg.content.split("\n").map((line, i) => {
            const parts = line.split(/\*\*(.*?)\*\*/g);
            return (
              <p key={i} className={i > 0 ? "mt-1" : ""}>
                {parts.map((part, j) =>
                  j % 2 === 1 ? <strong key={j} className={`font-semibold ${isUser ? "text-white" : "text-gray-900"}`}>{part}</strong> : part
                )}
              </p>
            );
          })}
        </div>

        {msg.skillCalls && msg.skillCalls.length > 0 && (
          <div className="w-full space-y-1.5">
            <div className="flex items-center gap-1.5 text-gray-400 text-xs"><Zap className="w-3 h-3" /><span>技能调用</span></div>
            {msg.skillCalls.map(skill => (
              <div key={skill.id} className="flex items-center gap-2.5 bg-white border border-gray-100 rounded-xl px-3 py-2 shadow-sm">
                <span className="text-base leading-none">{skill.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-700 text-xs font-medium truncate">{skill.name}</p>
                  {skill.output && <p className="text-gray-400 text-xs mt-0.5">{skill.output}</p>}
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {skill.duration && <span className="text-gray-300 text-xs">{skill.duration}s</span>}
                  {skill.status === "done" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />}
                  {skill.status === "running" && <Loader2 className="w-3.5 h-3.5 text-indigo-500 animate-spin" />}
                </div>
              </div>
            ))}
          </div>
        )}

        {msg.taskSteps && msg.taskSteps.length > 0 && (
          <div className="w-full space-y-1">
            <div className="flex items-center gap-1.5 text-gray-400 text-xs"><Hash className="w-3 h-3" /><span>执行流程</span></div>
            <div className="bg-white border border-gray-100 rounded-xl px-3 py-2.5 space-y-2 shadow-sm">
              {msg.taskSteps.map((step, i) => (
                <div key={step.id} className="flex items-center gap-2.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    step.status === "done" ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-400"
                  }`}>{step.status === "done" ? "✓" : i + 1}</div>
                  <span className={`text-xs ${step.status === "done" ? "text-gray-600" : "text-gray-300"}`}>{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {msg.actionCard && (
          <div className="w-full bg-gradient-to-br from-indigo-50 to-cyan-50 border border-indigo-100 rounded-xl p-3.5">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                {msg.actionCard.type === "jd" && <FileText className="w-4 h-4 text-indigo-600" />}
                {msg.actionCard.type === "candidates" && <Users className="w-4 h-4 text-indigo-600" />}
                {msg.actionCard.type === "interview" && <MessageSquare className="w-4 h-4 text-indigo-600" />}
                {msg.actionCard.type === "compare" && <BarChart3 className="w-4 h-4 text-indigo-600" />}
                {msg.actionCard.type === "report" && <BookOpen className="w-4 h-4 text-indigo-600" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-gray-800 text-sm font-semibold">{msg.actionCard.title}</p>
                <p className="text-gray-500 text-xs mt-0.5 leading-relaxed">{msg.actionCard.summary}</p>
                <button onClick={() => { window.location.href = msg.actionCard!.actionPath; }}
                  className="mt-2 flex items-center gap-1.5 text-indigo-600 text-xs font-medium hover:text-indigo-700 transition-colors">
                  {msg.actionCard.actionLabel}<ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {msg.quickReplies && msg.quickReplies.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {msg.quickReplies.map((reply, i) => (
              <button key={i} onClick={() => onQuickReply(reply)}
                className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-full text-gray-500 hover:text-indigo-600 text-xs transition-all">
                {reply}
              </button>
            ))}
          </div>
        )}

        <span className="text-gray-300 text-xs px-1">
          {msg.timestamp.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>
    </div>
  );
}

// ─── Initial welcome message ──────────────────────────────────────────────────
function makeWelcomeMsg(): Message {
  return {
    id: "welcome-" + Date.now(), role: "assistant",
    content: "你好！我是 **Horo AI**，你的专属 HR 智能助手。\n\n我已接入公司知识库，可以基于公司实际情况提供更精准的支持：生成贴合公司文化的JD、结合岗位说明书筛选简历、生成面试题、对比候选人等。\n\n有什么我可以帮你的吗？",
    timestamp: new Date(),
    quickReplies: ["生成JD", "筛选简历", "生成面试题", "对比候选人"],
  };
}

function makeSession(title: string, messages?: Message[]): ChatSession {
  const now = new Date();
  const msgs = messages || [makeWelcomeMsg()];
  return {
    id: "session-" + Date.now() + Math.random(),
    title, createdAt: now, updatedAt: now,
    messages: msgs,
    preview: msgs[msgs.length - 1]?.content.slice(0, 40) || "",
  };
}

const QUICK_ACTIONS = [
  { label: "生成 JD", icon: <FileText className="w-3.5 h-3.5" />, prompt: "帮我生成一个高级AI产品经理的JD" },
  { label: "深度评估", icon: <Star className="w-3.5 h-3.5" />, prompt: "对当前候选人进行深度评估分析" },
  { label: "对比分析", icon: <BarChart3 className="w-3.5 h-3.5" />, prompt: "对比当前岗位的前3名候选人" },
  { label: "生成面试题", icon: <MessageSquare className="w-3.5 h-3.5" />, prompt: "为高级AI产品经理岗位生成面试题库" },
  { label: "复盘面试", icon: <RotateCcw className="w-3.5 h-3.5" />, prompt: "帮我复盘刚才的面试，生成评估报告" },
];

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function HoroAIPage() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => [
    makeSession("高级AI产品经理JD生成", [
      makeWelcomeMsg(),
      { id: "u1", role: "user", content: "帮我生成一个高级AI产品经理的JD", timestamp: new Date(Date.now() - 300000) },
      { id: "a1", role: "assistant", content: "好的，已基于知识库生成JD，请查看。", timestamp: new Date(Date.now() - 290000), actionCard: { type: "jd", title: "高级AI产品经理 · JD已生成", summary: "已生成包含岗位职责、任职要求、薪酬福利的完整JD", actionLabel: "查看并编辑JD", actionPath: "/jobs/create" } },
    ]),
    makeSession("候选人筛选分析"),
  ]);
  const [activeSessionId, setActiveSessionId] = useState(sessions[0].id);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSkillSelector, setShowSkillSelector] = useState(false);
  const [searchHistory, setSearchHistory] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId) || sessions[0];

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [activeSession?.messages, isTyping]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setInput(""); setShowSkillSelector(false);
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text, timestamp: new Date() };
    setSessions(prev => prev.map(s => s.id === activeSessionId
      ? { ...s, messages: [...s.messages, userMsg], updatedAt: new Date(), preview: text.slice(0, 40) }
      : s
    ));
    setIsTyping(true);
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    const response = buildResponse(text);
    const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", timestamp: new Date(), ...response };
    setSessions(prev => prev.map(s => s.id === activeSessionId
      ? { ...s, messages: [...s.messages, aiMsg], updatedAt: new Date(), preview: aiMsg.content.slice(0, 40) }
      : s
    ));
    setIsTyping(false);
  }, [activeSessionId]);

  const handleNewChat = () => {
    const newSession = makeSession("新对话 " + new Date().toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" }));
    setSessions(prev => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    toast.success("已创建新对话");
  };

  const handleRefresh = () => {
    setSessions(prev => prev.map(s => s.id === activeSessionId
      ? { ...s, messages: [makeWelcomeMsg()], updatedAt: new Date(), preview: "新对话开始" }
      : s
    ));
    toast.success("对话已刷新");
  };

  const handleDeleteSession = (id: string) => {
    if (sessions.length === 1) { toast.error("至少保留一个对话"); return; }
    setSessions(prev => {
      const next = prev.filter(s => s.id !== id);
      if (activeSessionId === id) setActiveSessionId(next[0].id);
      return next;
    });
    toast.success("对话已删除");
  };

  const filteredSessions = sessions.filter(s =>
    !searchHistory || s.title.includes(searchHistory) || s.preview.includes(searchHistory)
  );

  return (
    <AppLayout title="Horo AI" breadcrumb={[{ label: "Horo AI" }]}>
      <div className="flex h-full" style={{ height: "calc(100vh - 56px)" }}>
        {/* Left: Session History */}
        <div className="w-64 border-r border-gray-100 bg-white flex flex-col shrink-0">
          <div className="p-3 border-b border-gray-100">
            <button onClick={handleNewChat}
              className="w-full flex items-center gap-2 px-3 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" />新建对话
            </button>
          </div>
          <div className="px-3 py-2 border-b border-gray-50">
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-2">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input value={searchHistory} onChange={e => setSearchHistory(e.target.value)}
                placeholder="搜索对话..." className="bg-transparent text-xs text-gray-700 flex-1 outline-none placeholder:text-gray-300" />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: "thin" }}>
            {filteredSessions.length === 0 && (
              <div className="text-center py-8 text-gray-300 text-xs">暂无对话记录</div>
            )}
            {filteredSessions.map(session => (
              <div key={session.id}
                className={`group mx-2 mb-1 rounded-xl transition-all ${activeSessionId === session.id ? "bg-indigo-50 border border-indigo-100" : "hover:bg-gray-50"}`}>
                <button onClick={() => setActiveSessionId(session.id)}
                  className="w-full text-left px-3 py-2.5 flex items-start gap-2">
                  <MessageSquare className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${activeSessionId === session.id ? "text-indigo-500" : "text-gray-300"}`} />
                  <div className="flex-1 min-w-0">
                    <p className={`text-xs font-medium truncate ${activeSessionId === session.id ? "text-indigo-700" : "text-gray-700"}`}>
                      {session.title}
                    </p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{session.preview}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock className="w-2.5 h-2.5 text-gray-300" />
                      <span className="text-xs text-gray-300">
                        {session.updatedAt.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                  <button onClick={e => { e.stopPropagation(); handleDeleteSession(session.id); }}
                    className="opacity-0 group-hover:opacity-100 w-5 h-5 rounded flex items-center justify-center text-gray-300 hover:text-red-500 transition-all shrink-0">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Chat Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-gray-50/30">
          {/* Chat header */}
          <div className="bg-white border-b border-gray-100 px-5 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
                <Brain className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">{activeSession?.title}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {activeSession?.messages.length} 条消息 · 已接入知识库
                </p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={handleRefresh}
                className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                title="刷新对话">
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Quick actions */}
          <div className="bg-white border-b border-gray-100 px-4 py-2 shrink-0">
            <div className="flex gap-1.5 overflow-x-auto" style={{ scrollbarWidth: "none" }}>
              {QUICK_ACTIONS.map((action, i) => (
                <button key={i} onClick={() => sendMessage(action.prompt)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-lg text-gray-500 hover:text-indigo-600 text-xs whitespace-nowrap transition-all shrink-0">
                  {action.icon}{action.label}
                </button>
              ))}
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-6 py-5 space-y-5"
            style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(0,0,0,0.1) transparent" }}>
            {activeSession?.messages.map(msg => (
              <MessageBubble key={msg.id} msg={msg} onQuickReply={sendMessage} />
            ))}
            {isTyping && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shrink-0">
                  <Brain className="w-4 h-4 text-white" />
                </div>
                <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5 shadow-sm">
                  {[0, 150, 300].map(d => (
                    <span key={d} className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="bg-white border-t border-gray-100 px-4 py-3 shrink-0">
            <div className="max-w-3xl mx-auto relative">
              {showSkillSelector && (
                <SkillSelector
                  onSelect={text => setInput(prev => prev + " " + text)}
                  onClose={() => setShowSkillSelector(false)}
                />
              )}
              <div className="flex flex-col gap-2 bg-white border border-gray-200 rounded-xl p-3 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-50 transition-all shadow-sm">
                <textarea
                  value={input} onChange={e => setInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                  placeholder="输入任务或问题... (Enter 发送，Shift+Enter 换行)"
                  rows={2}
                  className="bg-transparent text-gray-800 text-sm resize-none outline-none placeholder:text-gray-300 leading-relaxed w-full"
                />
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <button onClick={() => setShowSkillSelector(s => !s)}
                      className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${showSkillSelector ? "bg-indigo-100 text-indigo-600" : "hover:bg-gray-100 text-gray-400 hover:text-gray-600"}`}
                      title="选择技能">
                      <Wrench className="w-3.5 h-3.5" />
                    </button>
                    <button onClick={() => toast.info("文件上传功能即将上线")}
                      className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                      title="附加文件">
                      <Paperclip className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs text-gray-300 ml-1">已接入知识库 · 6 份文档</span>
                  </div>
                  <button onClick={() => sendMessage(input)} disabled={!input.trim() || isTyping}
                    className="w-8 h-8 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors">
                    {isTyping ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Send className="w-3.5 h-3.5 text-white" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
