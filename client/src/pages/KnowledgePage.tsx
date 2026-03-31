/**
 * KnowledgePage - 知识库
 * 支持导入公司资料，JD编写和简历筛选时自动参考
 */
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import {
  BookOpen, Upload, FileText, Building2, Users, Target,
  Search, Plus, Trash2, Eye, CheckCircle2, Loader2,
  Star, Tag, Clock, MoreHorizontal, Sparkles, Brain,
  FileSpreadsheet, Image, Link, Globe, AlertCircle
} from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

interface KnowledgeDoc {
  id: string;
  title: string;
  type: "company_intro" | "culture" | "job_desc" | "team_info" | "benefit" | "process" | "other";
  format: "pdf" | "docx" | "xlsx" | "txt" | "url" | "image";
  size: string;
  uploadedAt: string;
  status: "indexed" | "indexing" | "failed";
  usedInJD: number;
  usedInScreen: number;
  tags: string[];
  summary?: string;
}

const TYPE_CONFIG: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  company_intro: { label: "公司介绍", icon: <Building2 className="w-4 h-4" />, color: "bg-blue-50 text-blue-600 border-blue-200" },
  culture: { label: "企业文化", icon: <Star className="w-4 h-4" />, color: "bg-amber-50 text-amber-600 border-amber-200" },
  job_desc: { label: "岗位说明书", icon: <FileText className="w-4 h-4" />, color: "bg-indigo-50 text-indigo-600 border-indigo-200" },
  team_info: { label: "团队介绍", icon: <Users className="w-4 h-4" />, color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
  benefit: { label: "薪酬福利", icon: <Target className="w-4 h-4" />, color: "bg-pink-50 text-pink-600 border-pink-200" },
  process: { label: "招聘流程", icon: <CheckCircle2 className="w-4 h-4" />, color: "bg-violet-50 text-violet-600 border-violet-200" },
  other: { label: "其他", icon: <BookOpen className="w-4 h-4" />, color: "bg-gray-50 text-gray-600 border-gray-200" },
};

const FORMAT_ICON: Record<string, React.ReactNode> = {
  pdf: <FileText className="w-4 h-4 text-red-500" />,
  docx: <FileText className="w-4 h-4 text-blue-500" />,
  xlsx: <FileSpreadsheet className="w-4 h-4 text-emerald-500" />,
  txt: <FileText className="w-4 h-4 text-gray-500" />,
  url: <Globe className="w-4 h-4 text-indigo-500" />,
  image: <Image className="w-4 h-4 text-orange-500" />,
};

const INITIAL_DOCS: KnowledgeDoc[] = [
  {
    id: "k1", title: "葫乐科技公司介绍2024", type: "company_intro", format: "pdf",
    size: "2.4MB", uploadedAt: "2024-03-10", status: "indexed",
    usedInJD: 12, usedInScreen: 8,
    tags: ["公司背景", "业务方向", "发展历程"],
    summary: "葫乐科技成立于2020年，专注于AI+HR领域，已服务500+企业客户，融资B轮。",
  },
  {
    id: "k2", title: "企业文化手册V3", type: "culture", format: "pdf",
    size: "5.1MB", uploadedAt: "2024-02-28", status: "indexed",
    usedInJD: 18, usedInScreen: 15,
    tags: ["价值观", "行为准则", "团队氛围"],
    summary: "核心价值观：极致、开放、共赢。强调数据驱动决策，鼓励创新试错。",
  },
  {
    id: "k3", title: "技术团队岗位说明书", type: "job_desc", format: "docx",
    size: "890KB", uploadedAt: "2024-03-15", status: "indexed",
    usedInJD: 24, usedInScreen: 19,
    tags: ["技术岗位", "能力要求", "晋升路径"],
    summary: "涵盖P5-P9各级别技术岗位的能力模型、职责范围和晋升标准。",
  },
  {
    id: "k4", title: "薪酬福利体系说明", type: "benefit", format: "xlsx",
    size: "340KB", uploadedAt: "2024-03-01", status: "indexed",
    usedInJD: 9, usedInScreen: 4,
    tags: ["薪酬结构", "股权激励", "福利清单"],
    summary: "基本薪资+绩效奖金+股权激励，五险一金+补充医疗，弹性工作制。",
  },
  {
    id: "k5", title: "产品团队介绍", type: "team_info", format: "pdf",
    size: "1.8MB", uploadedAt: "2024-03-08", status: "indexed",
    usedInJD: 7, usedInScreen: 11,
    tags: ["团队规模", "工作方式", "项目案例"],
    summary: "产品团队30人，负责AI招聘、HR SaaS两条产品线，敏捷开发，双周迭代。",
  },
  {
    id: "k6", title: "标准招聘流程SOP", type: "process", format: "docx",
    size: "620KB", uploadedAt: "2024-02-20", status: "indexed",
    usedInJD: 3, usedInScreen: 22,
    tags: ["流程规范", "面试标准", "决策机制"],
    summary: "简历筛选→电话初筛→技术面→综合面→HR面→Offer，全程3-4周。",
  },
];

export default function KnowledgePage() {
  const [docs, setDocs] = useState<KnowledgeDoc[]>(INITIAL_DOCS);
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("all");
  const [uploading, setUploading] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [previewDoc, setPreviewDoc] = useState<KnowledgeDoc | null>(null);

  const filtered = docs.filter(d => {
    const matchType = activeType === "all" || d.type === activeType;
    const matchSearch = !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.tags.some(t => t.includes(search));
    return matchType && matchSearch;
  });

  const handleUpload = async () => {
    setUploading(true);
    await new Promise(r => setTimeout(r, 2000));
    const newDoc: KnowledgeDoc = {
      id: `k-${Date.now()}`, title: "新上传文档_" + new Date().toLocaleDateString(),
      type: "other", format: "pdf", size: "1.2MB",
      uploadedAt: new Date().toISOString().split("T")[0],
      status: "indexing", usedInJD: 0, usedInScreen: 0, tags: ["待分类"],
      summary: "AI正在解析文档内容...",
    };
    setDocs(prev => [newDoc, ...prev]);
    setUploading(false);
    toast.success("文档上传成功，AI正在建立索引...");
    setTimeout(() => {
      setDocs(prev => prev.map(d => d.id === newDoc.id ? { ...d, status: "indexed", summary: "文档已成功建立索引，可在JD生成和简历筛选中使用。" } : d));
      toast.success("文档索引完成，已加入知识库");
    }, 3000);
  };

  const handleAddUrl = async () => {
    if (!urlInput.trim()) return;
    setUploading(true);
    await new Promise(r => setTimeout(r, 1500));
    const newDoc: KnowledgeDoc = {
      id: `k-url-${Date.now()}`, title: urlInput,
      type: "other", format: "url", size: "-",
      uploadedAt: new Date().toISOString().split("T")[0],
      status: "indexing", usedInJD: 0, usedInScreen: 0, tags: ["网页内容"],
    };
    setDocs(prev => [newDoc, ...prev]);
    setUrlInput(""); setShowUrlInput(false); setUploading(false);
    toast.success("网页内容正在抓取并建立索引...");
    setTimeout(() => {
      setDocs(prev => prev.map(d => d.id === newDoc.id ? { ...d, status: "indexed", summary: "网页内容已成功抓取并建立索引。" } : d));
    }, 3000);
  };

  const handleDelete = (id: string) => {
    setDocs(prev => prev.filter(d => d.id !== id));
    toast.success("文档已删除");
  };

  const totalUsage = docs.reduce((s, d) => s + d.usedInJD + d.usedInScreen, 0);

  return (
    <AppLayout title="知识库" breadcrumb={[{ label: "知识库" }]}>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        {/* Header stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "知识文档", value: docs.length, sub: "已建立索引", icon: <BookOpen className="w-5 h-5 text-indigo-500" />, bg: "bg-indigo-50" },
            { label: "AI引用次数", value: totalUsage, sub: "JD生成+简历筛选", icon: <Sparkles className="w-5 h-5 text-amber-500" />, bg: "bg-amber-50" },
            { label: "覆盖岗位", value: 8, sub: "个招聘岗位", icon: <Target className="w-5 h-5 text-emerald-500" />, bg: "bg-emerald-50" },
            { label: "知识准确率", value: "96%", sub: "AI评估", icon: <Brain className="w-5 h-5 text-violet-500" />, bg: "bg-violet-50" },
          ].map((stat, i) => (
            <div key={i} className="bg-white border border-gray-100 rounded-xl p-4 flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center shrink-0`}>{stat.icon}</div>
              <div>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-400">{stat.label} · {stat.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* AI Usage Banner */}
        <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 border border-indigo-100 rounded-xl p-4 flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
            <Brain className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-indigo-800">知识库已与 Horo AI 深度集成</p>
            <p className="text-xs text-indigo-600 mt-0.5 leading-relaxed">
              编写JD时，AI将自动参考公司介绍、企业文化、薪酬福利等文档，生成更贴合公司实际的岗位描述；
              筛选简历时，AI将结合团队介绍和岗位说明书，提供更精准的匹配评分。
            </p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-medium shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5" />已启用
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setActiveType("all")}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeType === "all" ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300"}`}
            >全部 ({docs.length})</button>
            {Object.entries(TYPE_CONFIG).map(([key, cfg]) => {
              const count = docs.filter(d => d.type === key).length;
              if (count === 0) return null;
              return (
                <button key={key} onClick={() => setActiveType(key)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${activeType === key ? "bg-indigo-600 text-white" : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-300"}`}
                >{cfg.label} ({count})</button>
              );
            })}
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg px-3 py-2">
              <Search className="w-3.5 h-3.5 text-gray-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="搜索文档..." className="text-sm outline-none w-36 text-gray-700 placeholder:text-gray-300" />
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowUrlInput(v => !v)} className="gap-1.5 text-gray-600">
              <Link className="w-3.5 h-3.5" />添加网页
            </Button>
            <Button size="sm" onClick={handleUpload} disabled={uploading} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1.5">
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Upload className="w-3.5 h-3.5" />}
              上传文档
            </Button>
          </div>
        </div>

        {/* URL input */}
        {showUrlInput && (
          <div className="flex gap-2 bg-white border border-indigo-200 rounded-xl p-3">
            <Globe className="w-4 h-4 text-indigo-500 shrink-0 mt-2" />
            <input
              value={urlInput} onChange={e => setUrlInput(e.target.value)}
              placeholder="输入网页URL，如公司官网、招聘页面..."
              className="flex-1 text-sm outline-none text-gray-700 placeholder:text-gray-300"
              onKeyDown={e => e.key === "Enter" && handleAddUrl()}
            />
            <Button size="sm" onClick={handleAddUrl} disabled={!urlInput.trim() || uploading} className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0">
              {uploading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "添加"}
            </Button>
          </div>
        )}

        {/* Document grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(doc => {
            const typeCfg = TYPE_CONFIG[doc.type];
            return (
              <div key={doc.id} className="bg-white border border-gray-100 rounded-xl p-4 hover:border-indigo-200 hover:shadow-sm transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                      {FORMAT_ICON[doc.format]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-gray-900 truncate">{doc.title}</span>
                        {doc.status === "indexing" && (
                          <span className="flex items-center gap-1 text-xs text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-md">
                            <Loader2 className="w-3 h-3 animate-spin" />建立索引中
                          </span>
                        )}
                        {doc.status === "failed" && (
                          <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 px-1.5 py-0.5 rounded-md">
                            <AlertCircle className="w-3 h-3" />索引失败
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className={`px-1.5 py-0.5 text-xs rounded-md border ${typeCfg.color} flex items-center gap-1`}>
                          {typeCfg.icon}{typeCfg.label}
                        </span>
                        <span className="text-xs text-gray-400">{doc.size}</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3 h-3" />{doc.uploadedAt}</span>
                      </div>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 shrink-0">
                        <MoreHorizontal className="w-4 h-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => setPreviewDoc(doc)}>
                        <Eye className="w-4 h-4 mr-2" />预览摘要
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDelete(doc.id)} className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />删除
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* Summary */}
                {doc.summary && (
                  <p className="text-xs text-gray-500 mt-3 leading-relaxed line-clamp-2 pl-13">{doc.summary}</p>
                )}

                {/* Tags */}
                <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                  {doc.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-gray-50 border border-gray-100 rounded-full text-xs text-gray-500 flex items-center gap-1">
                      <Tag className="w-2.5 h-2.5" />{tag}
                    </span>
                  ))}
                </div>

                {/* Usage stats */}
                {doc.status === "indexed" && (
                  <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-50">
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <FileText className="w-3 h-3 text-indigo-400" />
                      <span>JD生成引用 <span className="text-indigo-600 font-medium">{doc.usedInJD}</span> 次</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Users className="w-3 h-3 text-emerald-400" />
                      <span>简历筛选引用 <span className="text-emerald-600 font-medium">{doc.usedInScreen}</span> 次</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Upload placeholder */}
          <button
            onClick={handleUpload}
            disabled={uploading}
            className="border-2 border-dashed border-gray-200 rounded-xl p-8 flex flex-col items-center justify-center gap-3 hover:border-indigo-300 hover:bg-indigo-50/30 transition-all text-gray-400 hover:text-indigo-500"
          >
            {uploading ? <Loader2 className="w-8 h-8 animate-spin" /> : <Plus className="w-8 h-8" />}
            <div className="text-center">
              <p className="text-sm font-medium">上传新文档</p>
              <p className="text-xs mt-0.5">支持 PDF、Word、Excel、TXT</p>
            </div>
          </button>
        </div>

        {/* Preview modal */}
        {previewDoc && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={() => setPreviewDoc(null)}>
            <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-base font-semibold text-gray-900">{previewDoc.title}</h3>
                  <p className="text-xs text-gray-400 mt-0.5">{TYPE_CONFIG[previewDoc.type].label} · {previewDoc.uploadedAt}</p>
                </div>
                <button onClick={() => setPreviewDoc(null)} className="text-gray-400 hover:text-gray-600"><X className="w-4 h-4" /></button>
              </div>
              <div className="bg-gray-50 rounded-xl p-4">
                <p className="text-sm font-medium text-gray-700 mb-2">AI 摘要</p>
                <p className="text-sm text-gray-600 leading-relaxed">{previewDoc.summary || "暂无摘要"}</p>
              </div>
              <div className="mt-4">
                <p className="text-xs font-medium text-gray-500 mb-2">标签</p>
                <div className="flex flex-wrap gap-1.5">
                  {previewDoc.tags.map(tag => (
                    <span key={tag} className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-full text-xs">{tag}</span>
                  ))}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-4 text-xs text-gray-400">
                <span>JD引用 <strong className="text-indigo-600">{previewDoc.usedInJD}</strong> 次</span>
                <span>筛选引用 <strong className="text-emerald-600">{previewDoc.usedInScreen}</strong> 次</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

// Need to add X import
function X({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18"/><path d="m6 6 12 12"/>
    </svg>
  );
}
