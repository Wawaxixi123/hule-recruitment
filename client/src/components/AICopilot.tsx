/**
 * Horo AI - 全局智能助手侧边栏
 * 常驻右侧，支持全屏模式，四种交互入口
 * 白色/浅色主题，与主界面保持统一
 */
import { useState, useRef, useEffect, useCallback } from "react";
import {
  Brain, Send, Maximize2, Minimize2, Sparkles, Zap, CheckCircle2,
  Loader2, X, Paperclip, FileText, BarChart3, Users, MessageSquare,
  Star, AlertCircle, BookOpen, Wrench, ArrowRight, RotateCcw, Hash, Plus, Search
} from "lucide-react";
import { mockSkills } from "@/lib/mockData";
import { toast } from "sonner";

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
interface ContextSuggestion { id: string; text: string; action: string; }

const QUICK_ACTIONS = [
  { label: "生成 JD", icon: <FileText className="w-3.5 h-3.5" />, prompt: "帮我生成一个高级AI产品经理的JD" },
  { label: "深度评估", icon: <Star className="w-3.5 h-3.5" />, prompt: "对当前候选人进行深度评估分析" },
  { label: "对比分析", icon: <BarChart3 className="w-3.5 h-3.5" />, prompt: "对比当前岗位的前3名候选人" },
  { label: "生成面试题", icon: <MessageSquare className="w-3.5 h-3.5" />, prompt: "为高级AI产品经理岗位生成面试题库" },
  { label: "复盘面试", icon: <RotateCcw className="w-3.5 h-3.5" />, prompt: "帮我复盘刚才的面试，生成评估报告" },
];

function buildResponse(input: string): Omit<Message, "id" | "timestamp" | "role"> {
  const lower = input.toLowerCase();
  if (lower.includes("jd") || lower.includes("岗位") || lower.includes("职位")) {
    return {
      content: "好的，我将为您生成一份高质量的岗位描述。正在调用相关技能...",
      skillCalls: [
        { id: "s1", name: "战略性岗位描述生成", icon: "📝", status: "done", duration: 1.2, output: "JD框架已生成" },
        { id: "s2", name: "雇主品牌内容策划", icon: "🌟", status: "done", duration: 0.8, output: "品牌亮点已提炼" },
        { id: "s3", name: "薪酬竞争力诊断", icon: "💰", status: "done", duration: 0.6, output: "薪酬区间已匹配" },
      ],
      taskSteps: [
        { id: "t1", label: "分析岗位需求", status: "done" },
        { id: "t2", label: "生成JD正文", status: "done" },
        { id: "t3", label: "优化吸引力表达", status: "done" },
        { id: "t4", label: "输出最终版本", status: "done" },
      ],
      actionCard: { type: "jd", title: "高级AI产品经理 · JD已生成", summary: "已生成包含岗位职责、任职要求、薪酬福利的完整JD，预计吸引力评分 92/100", actionLabel: "查看并编辑JD", actionPath: "/jobs/create" },
      quickReplies: ["调整薪酬区间", "增加技术要求", "优化福利描述", "主动获取简历"],
    };
  }
  if (lower.includes("评估") || lower.includes("筛选") || lower.includes("简历")) {
    return {
      content: "正在对候选人进行深度评估，调用多个评估技能...",
      skillCalls: [
        { id: "s1", name: "智能简历深度评估", icon: "📊", status: "done", duration: 2.1, output: "五维评分完成" },
        { id: "s2", name: "高潜人才识别模型", icon: "⭐", status: "done", duration: 1.4, output: "潜力评级：A+" },
        { id: "s3", name: "录用决策辅助分析", icon: "🤖", status: "done", duration: 0.9, output: "推荐：强烈推荐" },
      ],
      taskSteps: [
        { id: "t1", label: "解析简历结构", status: "done" },
        { id: "t2", label: "五维能力评分", status: "done" },
        { id: "t3", label: "与岗位要求匹配", status: "done" },
        { id: "t4", label: "生成评估报告", status: "done" },
      ],
      actionCard: { type: "candidates", title: "候选人评估完成 · 共筛选 12 人", summary: "强烈推荐 3 人，推荐 5 人，待定 4 人。AI评分最高：陈志远 94分", actionLabel: "查看候选人列表", actionPath: "/candidates" },
      quickReplies: ["为什么他只有68分？", "查看最高分候选人", "进行横向对比", "安排面试"],
    };
  }
  if (lower.includes("对比") || lower.includes("比较")) {
    return {
      content: "正在生成候选人横向对比分析...",
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
      content: "正在为您生成结构化面试题库...",
      skillCalls: [
        { id: "s1", name: "深度面试题库生成", icon: "❓", status: "done", duration: 2.3, output: "已生成32道题" },
        { id: "s2", name: "面试官标准化培训", icon: "👨‍🏫", status: "done", duration: 0.7, output: "评分标准已配置" },
      ],
      taskSteps: [
        { id: "t1", label: "分析岗位核心能力", status: "done" },
        { id: "t2", label: "生成基础验证题", status: "done" },
        { id: "t3", label: "生成深挖追问题", status: "done" },
        { id: "t4", label: "生成风险验证题", status: "done" },
      ],
      actionCard: { type: "interview", title: "面试题库已生成 · 32道题", summary: "基础题 12道、深挖题 12道、风险验证题 8道，已按面试阶段分组", actionLabel: "查看面试题库", actionPath: "/interviews" },
      quickReplies: ["增加技术深挖题", "添加行为面试题", "导出题库", "安排面试"],
    };
  }
  if (lower.includes("复盘") || lower.includes("面试报告")) {
    return {
      content: "正在生成面试复盘报告...",
      skillCalls: [
        { id: "s1", name: "面试复盘与反馈生成", icon: "📋", status: "done", duration: 1.9, output: "复盘报告已生成" },
        { id: "s2", name: "录用决策辅助分析", icon: "🤖", status: "done", duration: 1.1, output: "录用建议：推荐" },
      ],
      taskSteps: [
        { id: "t1", label: "整合面试官反馈", status: "done" },
        { id: "t2", label: "分析候选人表现", status: "done" },
        { id: "t3", label: "生成能力评估", status: "done" },
        { id: "t4", label: "输出录用建议", status: "done" },
      ],
      actionCard: { type: "report", title: "面试复盘完成", summary: "综合评分 87/100，技术能力突出，沟通表达良好，建议进入下一轮。", actionLabel: "查看完整复盘", actionPath: "/interviews" },
      quickReplies: ["查看详细评分", "发送录用通知", "安排下一轮", "存入候选人档案"],
    };
  }
  return {
    content: "我理解您的需求。作为您的专属HR智能助手，我可以帮您：\n\n**招聘全链路支持**\n- 生成高质量JD和岗位描述\n- 智能筛选和评估候选人\n- 生成结构化面试题库\n- 面试复盘和录用决策\n\n请告诉我您具体想做什么？",
    quickReplies: ["生成JD", "筛选候选人", "生成面试题", "候选人对比"],
  };
}

function SkillSelector({ onSelect, onClose }: { onSelect: (text: string) => void; onClose: () => void }) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("全部");
  const categories = ["全部", "招聘全链路", "人才管理", "组织与文化", "合规文档", "数据与洞察", "AI辅助决策"];
  const officialSkills = mockSkills.filter(s => s.type === "official");
  const filtered = officialSkills.filter(s => {
    const matchCat = activeCategory === "全部" || s.category === activeCategory;
    const matchSearch = !search || s.name.includes(search) || s.description.includes(search);
    return matchCat && matchSearch;
  });
  return (
    <div className="absolute bottom-full left-0 mb-2 w-[340px] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">
      <div className="p-3 border-b border-gray-100">
        <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-3 py-2">
          <Search className="w-3.5 h-3.5 text-gray-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索技能..." className="bg-transparent text-gray-800 text-sm flex-1 outline-none placeholder:text-gray-400" autoFocus />
        </div>
      </div>
      <div className="flex gap-1 p-2 overflow-x-auto border-b border-gray-100" style={{scrollbarWidth:"none"}}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} className={`whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-medium transition-all ${activeCategory === cat ? "bg-indigo-600 text-white" : "text-gray-500 hover:text-gray-800 hover:bg-gray-100"}`}>{cat}</button>
        ))}
      </div>
      <div className="h-[240px] overflow-y-auto" style={{scrollbarWidth:"thin",scrollbarColor:"rgba(0,0,0,0.1) transparent"}}>
        <div className="p-2 space-y-1">
          {filtered.map(skill => (
            <button key={skill.id} onClick={() => { onSelect(`使用【${skill.name}】技能`); onClose(); }} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-2.5">
                <span className="text-lg leading-none mt-0.5">{skill.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-800 text-sm font-medium truncate">{skill.name}</span>
                    {(skill as any).accuracy && <span className="text-xs text-emerald-600 shrink-0">{(skill as any).accuracy}%</span>}
                  </div>
                  <p className="text-gray-400 text-xs mt-0.5 line-clamp-1">{skill.description}</p>
                </div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && <div className="text-center py-8 text-gray-400 text-sm">未找到匹配的技能</div>}
        </div>
      </div>
    </div>
  );
}

function FileSelector({ onSelect, onClose }: { onSelect: (file: string) => void; onClose: () => void }) {
  const files = [
    { name: "高级AI产品经理_JD.pdf", type: "pdf", size: "128KB" },
    { name: "候选人简历_陈志远.pdf", type: "pdf", size: "256KB" },
    { name: "面试评估表_2024Q1.xlsx", type: "xlsx", size: "48KB" },
    { name: "岗位能力模型.docx", type: "docx", size: "96KB" },
  ];
  return (
    <div className="absolute bottom-full left-0 mb-2 w-[280px] bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden z-50">
      <div className="p-3 border-b border-gray-100 flex items-center justify-between">
        <span className="text-gray-700 text-sm font-medium">选择文件</span>
        <button onClick={onClose} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
      </div>
      <div className="p-2 space-y-1">
        {files.map((file, i) => (
          <button key={i} onClick={() => { onSelect(`[附件: ${file.name}]`); onClose(); }} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${file.type === "pdf" ? "bg-red-50 text-red-500" : file.type === "xlsx" ? "bg-emerald-50 text-emerald-600" : "bg-blue-50 text-blue-500"}`}>{file.type.toUpperCase().slice(0,3)}</div>
            <div className="flex-1 min-w-0"><p className="text-gray-700 text-sm truncate">{file.name}</p><p className="text-gray-400 text-xs">{file.size}</p></div>
          </button>
        ))}
        <button onClick={() => { toast.info("文件上传功能即将上线"); onClose(); }} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-3 border border-dashed border-gray-200">
          <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center"><Plus className="w-4 h-4 text-gray-400" /></div>
          <span className="text-gray-400 text-sm">上传新文件</span>
        </button>
      </div>
    </div>
  );
}

function MessageBubble({ msg, onQuickReply }: { msg: Message; onQuickReply: (text: string) => void }) {
  const isUser = msg.role === "user";
  return (
    <div className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
      {!isUser && (
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shrink-0 mt-1">
          <Brain className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div className={`flex flex-col gap-2 max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
        {/* 消息气泡 */}
        <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-indigo-600 text-white rounded-tr-sm"
            : "bg-gray-50 text-gray-800 rounded-tl-sm border border-gray-100"
        }`}>
          {msg.content.split("\n").map((line, i) => {
            const parts = line.split(/\*\*(.*?)\*\*/g);
            return (
              <p key={i} className={i > 0 ? "mt-1" : ""}>
                {parts.map((part, j) =>
                  j % 2 === 1
                    ? <strong key={j} className={`font-semibold ${isUser ? "text-white" : "text-gray-900"}`}>{part}</strong>
                    : part
                )}
              </p>
            );
          })}
        </div>

        {/* 技能调用 */}
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
                  {skill.status === "error" && <AlertCircle className="w-3.5 h-3.5 text-red-500" />}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 执行流程 */}
        {msg.taskSteps && msg.taskSteps.length > 0 && (
          <div className="w-full space-y-1">
            <div className="flex items-center gap-1.5 text-gray-400 text-xs"><Hash className="w-3 h-3" /><span>执行流程</span></div>
            <div className="bg-white border border-gray-100 rounded-xl px-3 py-2.5 space-y-2 shadow-sm">
              {msg.taskSteps.map((step, i) => (
                <div key={step.id} className="flex items-center gap-2.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                    step.status === "done" ? "bg-emerald-50 text-emerald-600" :
                    step.status === "running" ? "bg-indigo-50 text-indigo-600" :
                    "bg-gray-50 text-gray-400"
                  }`}>{step.status === "done" ? "✓" : i + 1}</div>
                  <span className={`text-xs ${
                    step.status === "done" ? "text-gray-600" :
                    step.status === "running" ? "text-indigo-600" :
                    "text-gray-300"
                  }`}>{step.label}</span>
                  {step.status === "running" && <Loader2 className="w-3 h-3 text-indigo-500 animate-spin ml-auto" />}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 操作卡片 */}
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
                <button
                  onClick={() => { window.location.href = msg.actionCard!.actionPath; }}
                  className="mt-2 flex items-center gap-1.5 text-indigo-600 text-xs font-medium hover:text-indigo-700 transition-colors"
                >
                  {msg.actionCard.actionLabel}<ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 快速回复 */}
        {msg.quickReplies && msg.quickReplies.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {msg.quickReplies.map((reply, i) => (
              <button
                key={i}
                onClick={() => onQuickReply(reply)}
                className="px-2.5 py-1 bg-white hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-full text-gray-500 hover:text-indigo-600 text-xs transition-all"
              >
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

interface AICopilotProps {
  isOpen: boolean;
  onToggle: () => void;
  currentPage?: string;
}

export default function AICopilot({ isOpen, onToggle, currentPage = "dashboard" }: AICopilotProps) {
  const [messages, setMessages] = useState<Message[]>([{
    id: "welcome", role: "assistant",
    content: "你好！我是 **Horo AI**，你的专属 HR 智能助手。\n\n我可以帮你生成JD、筛选简历、生成面试题、对比候选人，或者回答任何招聘相关问题。\n\n有什么我可以帮你的吗？",
    timestamp: new Date(),
    quickReplies: ["生成JD", "筛选简历", "生成面试题", "对比候选人"],
  }]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSkillSelector, setShowSkillSelector] = useState(false);
  const [showFileSelector, setShowFileSelector] = useState(false);
  const [dismissedSuggestions, setDismissedSuggestions] = useState<string[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const contextSuggestions: ContextSuggestion[] = currentPage === "candidates"
    ? [
        { id: "cs1", text: "发现 16 份新简历，是否按当前岗位标准筛选？", action: "筛选新简历，按高级AI产品经理标准评分" },
        { id: "cs2", text: "这 3 位候选人适合进行横向对比。", action: "对比当前岗位的前3名候选人" },
      ]
    : currentPage === "interviews"
    ? [{ id: "is1", text: "今日有 3 场面试，是否为每位候选人生成专属面试题？", action: "为今日3场面试生成专属面试题库" }]
    : [{ id: "ds1", text: "本周新增 23 份简历待筛选，是否立即处理？", action: "筛选本周新增的23份简历" }];

  const visibleSuggestions = contextSuggestions.filter(s => !dismissedSuggestions.includes(s.id));

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, isTyping]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim()) return;
    setInput(""); setShowSkillSelector(false); setShowFileSelector(false);
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setIsTyping(true);
    await new Promise(r => setTimeout(r, 1200 + Math.random() * 800));
    const response = buildResponse(text);
    const aiMsg: Message = { id: (Date.now() + 1).toString(), role: "assistant", timestamp: new Date(), ...response };
    setMessages(prev => [...prev, aiMsg]);
    setIsTyping(false);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(input); }
  };

  if (!isOpen) {
    return (
      <button
        onClick={onToggle}
        className="fixed right-5 bottom-5 z-40 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-600 to-cyan-500 shadow-lg shadow-indigo-200 flex items-center justify-center hover:scale-110 transition-transform"
        title="打开 Horo AI"
      >
        <Brain className="w-5 h-5 text-white" />
      </button>
    );
  }

  return (
    <>
      {isFullscreen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40" onClick={() => setIsFullscreen(false)} />
      )}
      <div
        className="fixed right-0 top-0 z-50 flex flex-col bg-white border-l border-gray-200 shadow-xl"
        style={{ width: isFullscreen ? "100vw" : "380px", height: "100vh" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 shrink-0 bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-gray-900 font-semibold text-sm">Horo AI</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-gray-400 text-xs">专属 HR 智能助手</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setIsFullscreen(f => !f)}
              className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              title={isFullscreen ? "退出全屏" : "全屏模式"}
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button
              onClick={onToggle}
              className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
              title="收起"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="px-3 py-2 border-b border-gray-100 shrink-0 bg-white">
          <div className="flex gap-1.5 overflow-x-auto" style={{scrollbarWidth:"none"}}>
            {QUICK_ACTIONS.map((action, i) => (
              <button
                key={i}
                onClick={() => sendMessage(action.prompt)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gray-50 hover:bg-indigo-50 border border-gray-200 hover:border-indigo-300 rounded-lg text-gray-500 hover:text-indigo-600 text-xs whitespace-nowrap transition-all shrink-0"
              >
                {action.icon}{action.label}
              </button>
            ))}
          </div>
        </div>

        {/* Context Suggestions */}
        {visibleSuggestions.length > 0 && (
          <div className="px-3 py-2 space-y-1.5 border-b border-gray-100 shrink-0 bg-amber-50/50">
            {visibleSuggestions.slice(0, 2).map(s => (
              <div key={s.id} className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <p className="text-gray-600 text-xs flex-1 leading-relaxed">{s.text}</p>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => sendMessage(s.action)}
                    className="text-amber-600 text-xs font-medium hover:text-amber-700 transition-colors"
                  >执行</button>
                  <button
                    onClick={() => setDismissedSuggestions(d => [...d, s.id])}
                    className="text-gray-300 hover:text-gray-500 transition-colors ml-1"
                  ><X className="w-3 h-3" /></button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Messages */}
        <div
          ref={scrollRef}
          className="flex-1 overflow-y-auto px-3 py-3 space-y-4 bg-gray-50/30"
          style={{scrollbarWidth:"thin", scrollbarColor:"rgba(0,0,0,0.1) transparent"}}
        >
          {messages.map(msg => <MessageBubble key={msg.id} msg={msg} onQuickReply={sendMessage} />)}
          {isTyping && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shrink-0">
                <Brain className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5 shadow-sm">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{animationDelay:"0ms"}} />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{animationDelay:"150ms"}} />
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-bounce" style={{animationDelay:"300ms"}} />
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="px-3 py-3 border-t border-gray-100 shrink-0 bg-white">
          <div className="relative">
            {showSkillSelector && (
              <SkillSelector
                onSelect={text => setInput(prev => prev + " " + text)}
                onClose={() => setShowSkillSelector(false)}
              />
            )}
            {showFileSelector && (
              <FileSelector
                onSelect={text => setInput(prev => prev + " " + text)}
                onClose={() => setShowFileSelector(false)}
              />
            )}
            <div className="flex flex-col gap-2 bg-white border border-gray-200 rounded-xl p-2.5 focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-50 transition-all">
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="输入任务或问题... (Enter 发送)"
                rows={2}
                className="bg-transparent text-gray-800 text-sm resize-none outline-none placeholder:text-gray-300 leading-relaxed w-full"
              />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setShowSkillSelector(s => !s); setShowFileSelector(false); }}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${showSkillSelector ? "bg-indigo-100 text-indigo-600" : "hover:bg-gray-100 text-gray-400 hover:text-gray-600"}`}
                    title="选择技能"
                  ><Wrench className="w-3.5 h-3.5" /></button>
                  <button
                    onClick={() => { setShowFileSelector(s => !s); setShowSkillSelector(false); }}
                    className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${showFileSelector ? "bg-indigo-100 text-indigo-600" : "hover:bg-gray-100 text-gray-400 hover:text-gray-600"}`}
                    title="附加文件"
                  ><Paperclip className="w-3.5 h-3.5" /></button>
                </div>
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || isTyping}
                  className="w-7 h-7 rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                >
                  {isTyping
                    ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" />
                    : <Send className="w-3.5 h-3.5 text-white" />
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
