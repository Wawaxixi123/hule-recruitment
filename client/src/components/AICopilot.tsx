/**
 * Horo AI - 全局AI Copilot侧边栏
 * 常驻右侧，支持全屏模式，四种交互入口
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
      quickReplies: ["调整薪酬区间", "增加技术要求", "优化福利描述", "一键发布"],
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
        { id: "t2", label: "生成基础/深度题", status: "done" },
        { id: "t3", label: "生成行为/情景题", status: "done" },
        { id: "t4", label: "配置评分标准", status: "done" },
      ],
      actionCard: { type: "interview", title: "面试题库已生成 · 32道题", summary: "基础题8道、深度题12道、行为题8道、情景题4道，覆盖技术、产品、管理三个维度", actionLabel: "查看面试题库", actionPath: "/interviews" },
      quickReplies: ["增加技术深度题", "调整题目难度", "导出题库PDF", "开始面试"],
    };
  }
  if (lower.includes("复盘") || lower.includes("面试结果")) {
    return {
      content: "正在分析面试复盘数据，生成评估报告...",
      skillCalls: [
        { id: "s1", name: "视频面试综合评估", icon: "🎥", status: "done", duration: 3.2, output: "多维评分完成" },
        { id: "s2", name: "360° 述职深度评估", icon: "🔄", status: "done", duration: 1.1, output: "综合评级：B+" },
      ],
      taskSteps: [
        { id: "t1", label: "解析面试记录", status: "done" },
        { id: "t2", label: "多维度评分", status: "done" },
        { id: "t3", label: "生成复盘报告", status: "done" },
        { id: "t4", label: "输出录用建议", status: "done" },
      ],
      actionCard: { type: "report", title: "面试复盘报告已生成", summary: "综合评分 78/100，技术能力强（88分），沟通表达待提升（65分），建议进行二面验证", actionLabel: "查看完整报告", actionPath: "/interviews" },
      quickReplies: ["发送给用人部门", "安排二面", "查看历史面试", "导出报告"],
    };
  }
  if (lower.includes("为什么") || lower.includes("原因")) {
    return {
      content: "根据AI评估数据，我来为您解释评分原因：\n\n**技术能力（68/100）**：候选人在核心技术栈上有一定基础，但缺乏大规模系统设计经验，项目复杂度相对较低。\n\n**业务理解（72/100）**：对行业有基本认知，但缺少直接相关的业务落地案例，与岗位要求的「深度业务理解」存在差距。\n\n**建议**：可以通过追问项目细节来进一步验证，重点考察「遇到技术瓶颈时的解决思路」。",
      quickReplies: ["如何进一步验证？", "与其他候选人对比", "是否值得面试？", "查看完整画像"],
    };
  }
  return {
    content: "你好！我是 **Horo AI**，你的专属 HR 智能助手。\n\n我可以帮你：\n\n• **生成JD** - 输入岗位名称，自动生成高质量职位描述\n• **筛选简历** - 批量评估候选人，五维量化评分\n• **生成面试题** - 基于JD和简历定制面试题库\n• **对比候选人** - 多维横向对比，辅助录用决策\n• **复盘面试** - 分析面试记录，生成评估报告\n\n请告诉我您想要完成什么任务？",
    quickReplies: ["生成JD", "筛选简历", "生成面试题", "对比候选人"],
  };
}

function SkillSelector({ onSelect, onClose }: { onSelect: (skill: string) => void; onClose: () => void }) {
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
    <div className="absolute bottom-full left-0 mb-2 w-[340px] bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
      <div className="p-3 border-b border-white/10">
        <div className="flex items-center gap-2 bg-white/5 rounded-lg px-3 py-2">
          <Search className="w-3.5 h-3.5 text-white/40" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索技能..." className="bg-transparent text-white text-sm flex-1 outline-none placeholder:text-white/30" autoFocus />
        </div>
      </div>
      <div className="flex gap-1 p-2 overflow-x-auto border-b border-white/10" style={{scrollbarWidth:"none"}}>
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)} className={`whitespace-nowrap px-2.5 py-1 rounded-full text-xs font-medium transition-all ${activeCategory === cat ? "bg-violet-600 text-white" : "text-white/50 hover:text-white hover:bg-white/10"}`}>{cat}</button>
        ))}
      </div>
      <div className="h-[240px] overflow-y-auto" style={{scrollbarWidth:"thin",scrollbarColor:"rgba(255,255,255,0.1) transparent"}}>
        <div className="p-2 space-y-1">
          {filtered.map(skill => (
            <button key={skill.id} onClick={() => { onSelect(`使用【${skill.name}】技能`); onClose(); }} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/8 transition-colors">
              <div className="flex items-start gap-2.5">
                <span className="text-lg leading-none mt-0.5">{skill.icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white/90 text-sm font-medium truncate">{skill.name}</span>
                    {(skill as any).accuracy && <span className="text-xs text-emerald-400 shrink-0">{(skill as any).accuracy}%</span>}
                  </div>
                  <p className="text-white/40 text-xs mt-0.5 line-clamp-1">{skill.description}</p>
                </div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && <div className="text-center py-8 text-white/30 text-sm">未找到匹配的技能</div>}
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
    <div className="absolute bottom-full left-0 mb-2 w-[280px] bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
      <div className="p-3 border-b border-white/10 flex items-center justify-between">
        <span className="text-white/70 text-sm font-medium">选择文件</span>
        <button onClick={onClose} className="text-white/40 hover:text-white/70"><X className="w-4 h-4" /></button>
      </div>
      <div className="p-2 space-y-1">
        {files.map((file, i) => (
          <button key={i} onClick={() => { onSelect(`[附件: ${file.name}]`); onClose(); }} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/8 transition-colors flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${file.type === "pdf" ? "bg-red-500/20 text-red-400" : file.type === "xlsx" ? "bg-emerald-500/20 text-emerald-400" : "bg-blue-500/20 text-blue-400"}`}>{file.type.toUpperCase().slice(0,3)}</div>
            <div className="flex-1 min-w-0"><p className="text-white/80 text-sm truncate">{file.name}</p><p className="text-white/30 text-xs">{file.size}</p></div>
          </button>
        ))}
        <button onClick={() => { toast.info("文件上传功能即将上线"); onClose(); }} className="w-full text-left px-3 py-2.5 rounded-lg hover:bg-white/8 transition-colors flex items-center gap-3 border border-dashed border-white/10">
          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center"><Plus className="w-4 h-4 text-white/40" /></div>
          <span className="text-white/40 text-sm">上传新文件</span>
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
        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shrink-0 mt-1">
          <Brain className="w-3.5 h-3.5 text-white" />
        </div>
      )}
      <div className={`flex flex-col gap-2 max-w-[85%] ${isUser ? "items-end" : "items-start"}`}>
        <div className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${isUser ? "bg-violet-600 text-white rounded-tr-sm" : "bg-white/8 text-white/85 rounded-tl-sm border border-white/8"}`}>
          {msg.content.split("\n").map((line, i) => {
            const parts = line.split(/\*\*(.*?)\*\*/g);
            return <p key={i} className={i > 0 ? "mt-1" : ""}>{parts.map((part, j) => j % 2 === 1 ? <strong key={j} className="font-semibold text-white">{part}</strong> : part)}</p>;
          })}
        </div>
        {msg.skillCalls && msg.skillCalls.length > 0 && (
          <div className="w-full space-y-1.5">
            <div className="flex items-center gap-1.5 text-white/40 text-xs"><Zap className="w-3 h-3" /><span>技能调用</span></div>
            {msg.skillCalls.map(skill => (
              <div key={skill.id} className="flex items-center gap-2.5 bg-white/5 border border-white/8 rounded-xl px-3 py-2">
                <span className="text-base leading-none">{skill.icon}</span>
                <div className="flex-1 min-w-0"><p className="text-white/80 text-xs font-medium truncate">{skill.name}</p>{skill.output && <p className="text-white/40 text-xs mt-0.5">{skill.output}</p>}</div>
                <div className="flex items-center gap-1.5 shrink-0">
                  {skill.duration && <span className="text-white/30 text-xs">{skill.duration}s</span>}
                  {skill.status === "done" && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                  {skill.status === "running" && <Loader2 className="w-3.5 h-3.5 text-violet-400 animate-spin" />}
                  {skill.status === "error" && <AlertCircle className="w-3.5 h-3.5 text-red-400" />}
                </div>
              </div>
            ))}
          </div>
        )}
        {msg.taskSteps && msg.taskSteps.length > 0 && (
          <div className="w-full space-y-1">
            <div className="flex items-center gap-1.5 text-white/40 text-xs"><Hash className="w-3 h-3" /><span>执行流程</span></div>
            <div className="bg-white/5 border border-white/8 rounded-xl px-3 py-2.5 space-y-2">
              {msg.taskSteps.map((step, i) => (
                <div key={step.id} className="flex items-center gap-2.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${step.status === "done" ? "bg-emerald-500/20 text-emerald-400" : step.status === "running" ? "bg-violet-500/20 text-violet-400" : "bg-white/5 text-white/30"}`}>{step.status === "done" ? "✓" : i + 1}</div>
                  <span className={`text-xs ${step.status === "done" ? "text-white/70" : step.status === "running" ? "text-violet-300" : "text-white/30"}`}>{step.label}</span>
                  {step.status === "running" && <Loader2 className="w-3 h-3 text-violet-400 animate-spin ml-auto" />}
                </div>
              ))}
            </div>
          </div>
        )}
        {msg.actionCard && (
          <div className="w-full bg-gradient-to-br from-violet-600/20 to-cyan-600/10 border border-violet-500/30 rounded-xl p-3.5">
            <div className="flex items-start gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-violet-500/20 flex items-center justify-center shrink-0">
                {msg.actionCard.type === "jd" && <FileText className="w-4 h-4 text-violet-400" />}
                {msg.actionCard.type === "candidates" && <Users className="w-4 h-4 text-violet-400" />}
                {msg.actionCard.type === "interview" && <MessageSquare className="w-4 h-4 text-violet-400" />}
                {msg.actionCard.type === "compare" && <BarChart3 className="w-4 h-4 text-violet-400" />}
                {msg.actionCard.type === "report" && <BookOpen className="w-4 h-4 text-violet-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white/90 text-sm font-semibold">{msg.actionCard.title}</p>
                <p className="text-white/50 text-xs mt-0.5 leading-relaxed">{msg.actionCard.summary}</p>
                <button onClick={() => { window.location.href = msg.actionCard!.actionPath; }} className="mt-2 flex items-center gap-1.5 text-violet-400 text-xs font-medium hover:text-violet-300 transition-colors">
                  {msg.actionCard.actionLabel}<ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>
        )}
        {msg.quickReplies && msg.quickReplies.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {msg.quickReplies.map((reply, i) => (
              <button key={i} onClick={() => onQuickReply(reply)} className="px-2.5 py-1 bg-white/8 hover:bg-white/15 border border-white/10 hover:border-violet-500/50 rounded-full text-white/60 hover:text-white/90 text-xs transition-all">{reply}</button>
            ))}
          </div>
        )}
        <span className="text-white/20 text-xs px-1">{msg.timestamp.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" })}</span>
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
      <button onClick={onToggle} className="fixed right-5 bottom-5 z-40 w-12 h-12 rounded-full bg-gradient-to-br from-violet-600 to-cyan-500 shadow-lg shadow-violet-500/30 flex items-center justify-center hover:scale-110 transition-transform" title="打开 Horo AI">
        <Brain className="w-5 h-5 text-white" />
      </button>
    );
  }

  return (
    <>
      {isFullscreen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40" onClick={() => setIsFullscreen(false)} />}
      <div className="fixed right-0 top-0 z-50 flex flex-col bg-[#0f0f1a] border-l border-white/8 shadow-2xl" style={{ width: isFullscreen ? "100vw" : "380px", height: "100vh" }}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/8 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
              <Brain className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold text-sm">Horo AI</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-white/40 text-xs">专属 HR 智能助手</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button onClick={() => setIsFullscreen(f => !f)} className="w-7 h-7 rounded-lg hover:bg-white/8 flex items-center justify-center text-white/40 hover:text-white/70 transition-colors" title={isFullscreen ? "退出全屏" : "全屏模式"}>
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
            </button>
            <button onClick={onToggle} className="w-7 h-7 rounded-lg hover:bg-white/8 flex items-center justify-center text-white/40 hover:text-white/70 transition-colors" title="收起">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        {/* Quick Actions */}
        <div className="px-3 py-2 border-b border-white/8 shrink-0">
          <div className="flex gap-1.5 overflow-x-auto" style={{scrollbarWidth:"none"}}>
            {QUICK_ACTIONS.map((action, i) => (
              <button key={i} onClick={() => sendMessage(action.prompt)} className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 hover:bg-violet-600/20 border border-white/8 hover:border-violet-500/40 rounded-lg text-white/60 hover:text-white/90 text-xs whitespace-nowrap transition-all shrink-0">
                {action.icon}{action.label}
              </button>
            ))}
          </div>
        </div>
        {/* Context Suggestions */}
        {visibleSuggestions.length > 0 && (
          <div className="px-3 py-2 space-y-1.5 border-b border-white/8 shrink-0">
            {visibleSuggestions.slice(0, 2).map(s => (
              <div key={s.id} className="flex items-center gap-2.5 bg-amber-500/10 border border-amber-500/20 rounded-xl px-3 py-2">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <p className="text-white/70 text-xs flex-1 leading-relaxed">{s.text}</p>
                <div className="flex items-center gap-1 shrink-0">
                  <button onClick={() => sendMessage(s.action)} className="text-amber-400 text-xs font-medium hover:text-amber-300 transition-colors">执行</button>
                  <button onClick={() => setDismissedSuggestions(d => [...d, s.id])} className="text-white/20 hover:text-white/50 transition-colors ml-1"><X className="w-3 h-3" /></button>
                </div>
              </div>
            ))}
          </div>
        )}
        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-3 space-y-4" style={{scrollbarWidth:"thin",scrollbarColor:"rgba(255,255,255,0.1) transparent"}}>
          {messages.map(msg => <MessageBubble key={msg.id} msg={msg} onQuickReply={sendMessage} />)}
          {isTyping && (
            <div className="flex gap-2.5">
              <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center shrink-0">
                <Brain className="w-3.5 h-3.5 text-white" />
              </div>
              <div className="bg-white/8 border border-white/8 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{animationDelay:"0ms"}} />
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{animationDelay:"150ms"}} />
                <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-bounce" style={{animationDelay:"300ms"}} />
              </div>
            </div>
          )}
        </div>
        {/* Input */}
        <div className="px-3 py-3 border-t border-white/8 shrink-0">
          <div className="relative">
            {showSkillSelector && <SkillSelector onSelect={text => setInput(prev => prev + " " + text)} onClose={() => setShowSkillSelector(false)} />}
            {showFileSelector && <FileSelector onSelect={text => setInput(prev => prev + " " + text)} onClose={() => setShowFileSelector(false)} />}
            <div className="flex flex-col gap-2 bg-white/5 border border-white/10 rounded-xl p-2.5 focus-within:border-violet-500/50 transition-colors">
              <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown} placeholder="输入任务或问题... (Enter发送)" rows={2} className="bg-transparent text-white/85 text-sm resize-none outline-none placeholder:text-white/25 leading-relaxed w-full" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <button onClick={() => { setShowSkillSelector(s => !s); setShowFileSelector(false); }} className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${showSkillSelector ? "bg-violet-600/30 text-violet-400" : "hover:bg-white/8 text-white/40 hover:text-white/70"}`} title="选择技能"><Wrench className="w-3.5 h-3.5" /></button>
                  <button onClick={() => { setShowFileSelector(s => !s); setShowSkillSelector(false); }} className={`w-7 h-7 rounded-lg flex items-center justify-center transition-colors ${showFileSelector ? "bg-violet-600/30 text-violet-400" : "hover:bg-white/8 text-white/40 hover:text-white/70"}`} title="附加文件"><Paperclip className="w-3.5 h-3.5" /></button>
                </div>
                <button onClick={() => sendMessage(input)} disabled={!input.trim() || isTyping} className="w-7 h-7 rounded-lg bg-violet-600 hover:bg-violet-500 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center transition-colors">
                  {isTyping ? <Loader2 className="w-3.5 h-3.5 text-white animate-spin" /> : <Send className="w-3.5 h-3.5 text-white" />}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
