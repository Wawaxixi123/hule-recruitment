/**
 * EmailImportPage - 邮箱简历导入
 * 参考设计：绑定163邮箱说明.webp / 绑定qq邮箱说明.png / 邮箱简历导入.webp
 * 布局：左侧连接邮箱配置 + 右侧已连接邮箱；下方候选人简历列表 + 批量操作
 */
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Mail, RefreshCw, Upload, Trash2, BarChart2, CheckSquare, Square, AlertCircle } from "lucide-react";
import { toast } from "sonner";

type EmailType = "126" | "163" | "company" | "qq";

interface EmailConfig {
  type: EmailType;
  label: string;
  host: string;
  port: string;
  instructions: React.ReactNode;
}

const EMAIL_CONFIGS: EmailConfig[] = [
  {
    type: "126",
    label: "网易 126",
    host: "imap.126.com",
    port: "993",
    instructions: (
      <div className="space-y-2 text-sm text-gray-600">
        <p>• 先去邮箱设置里开启 IMAP，并生成客户端授权码；该建议不要直接填写网页登录密码。</p>
        <p>• 邮箱地址通常就是 IMAP 用户名；默认 Host、Port、SSL 已经按常见配置预填好了。</p>
        <p>• 密码栏请填写客户端授权码；同步文件夹一般填 INBOX，或者你专门收简历的文件夹名。</p>
        <p>• 首次导入范围表示第一次同步最近多少天邮件；后续再点同步时会按增量拉取新邮件。</p>
      </div>
    ),
  },
  {
    type: "163",
    label: "网易 163",
    host: "imap.163.com",
    port: "993",
    instructions: (
      <div className="space-y-2 text-sm text-gray-600">
        <p>• 先去邮箱设置里开启 IMAP，并生成客户端授权码；该建议不要直接填写网页登录密码。</p>
        <p>• 邮箱地址通常就是 IMAP 用户名；默认 Host、Port、SSL 已经按常见配置预填好了。</p>
        <p>• 密码栏请填写客户端授权码；同步文件夹一般填 INBOX，或者你专门收简历的文件夹名。</p>
        <p>• 首次导入范围表示第一次同步最近多少天邮件；后续再点同步时会按增量拉取新邮件。</p>
      </div>
    ),
  },
  {
    type: "company",
    label: "公司邮箱 / 其他邮箱",
    host: "",
    port: "993",
    instructions: (
      <div className="space-y-2 text-sm text-gray-600">
        <p>• 进企业微信邮箱 → 收发信设置 → 找「开启 IMAP/SMTP 服务」并开启</p>
        <p>• 微信绑定 → 开启安全登录 → 生成新密码</p>
        <p>• 生成「客户端专用密码」（不是登录密码）</p>
        <p>• 把生成的专用密码填到这里的密码栏</p>
      </div>
    ),
  },
  {
    type: "qq",
    label: "QQ 邮箱",
    host: "imap.qq.com",
    port: "993",
    instructions: (
      <div className="space-y-2 text-sm text-gray-600">
        <p>• 先去邮箱设置里开启 IMAP，并生成客户端授权码；该建议不要直接填写网页登录密码。</p>
        <p>• 邮箱地址通常就是 IMAP 用户名；默认 Host、Port、SSL 已经按常见配置预填好了。</p>
        <p>• 密码栏请填写客户端授权码；同步文件夹一般填 INBOX，或者你专门收简历的文件夹名。</p>
        <p>• 首次导入范围表示第一次同步最近多少天邮件；后续再点同步时会按增量拉取新邮件。</p>
      </div>
    ),
  },
];

interface ConnectedEmail {
  id: string;
  type: EmailType;
  label: string;
  email: string;
  folder: string;
  host: string;
  port: string;
  status: "active" | "error";
  lastSync: string;
  syncDays: number;
  scanned: number;
  imported: number;
  attachments: number;
}

interface ResumeItem {
  id: string;
  name: string;
  fileName: string;
  fileSize: string;
  importTime: string;
  receiveTime: string;
  status: "pending" | "analyzed" | "archived";
  source: "email" | "manual";
  emailSubject?: string;
  sender?: string;
  snippet?: string;
}

const mockConnected: ConnectedEmail[] = [
  {
    id: "1",
    type: "163",
    label: "网易 163",
    email: "13822362481@163.com",
    folder: "INBOX",
    host: "imap.163.com",
    port: "993",
    status: "active",
    lastSync: "2026/04/03 19:35",
    syncDays: 30,
    scanned: 5,
    imported: 1,
    attachments: 1,
  },
];

const mockResumes: ResumeItem[] = [
  {
    id: "1",
    name: "叶——述职材料",
    fileName: "叶——述职材料.docx",
    fileSize: "6.4 KB",
    importTime: "2026/04/04 03:42",
    receiveTime: "2026/04/04 03:42",
    status: "pending",
    source: "manual",
  },
  {
    id: "2",
    name: "叶——述职材料",
    fileName: "叶——述职材料.docx",
    fileSize: "6.4 KB",
    importTime: "2026/04/04 03:41",
    receiveTime: "2026/04/04 03:41",
    status: "pending",
    source: "manual",
  },
  {
    id: "3",
    name: "广州美术学院 张梦婕",
    fileName: "广州美术学院-张梦婕.pdf",
    fileSize: "560.2 KB",
    importTime: "2026/04/04 03:35",
    receiveTime: "2026/04/03 19:36",
    status: "analyzed",
    source: "email",
    emailSubject: "Fw: 广州美术学院-张梦婕-游戏ui实习生",
    sender: "工具人-土耳其 <gongjurenhuerqi@10m.com.cn>",
    snippet: "----------转发的邮件内容---------- 发件人：郑琳琳<linlin.zheng@10m.com.cn> 日期：2026年4月3日 周五 14:11 收件人：工具人-土耳机...",
  },
];

const statusConfig = {
  pending: { label: "待处理", color: "#f59e0b", bg: "#fffbeb", border: "#fde68a" },
  analyzed: { label: "已分析", color: "#10b981", bg: "#f0fdf4", border: "#bbf7d0" },
  archived: { label: "已归档", color: "#6b7280", bg: "#f9fafb", border: "#e5e7eb" },
};

export default function EmailImportPage() {
  const [activeTab, setActiveTab] = useState<EmailType>("163");
  const [connectedEmails] = useState<ConnectedEmail[]>(mockConnected);
  const [resumes] = useState<ResumeItem[]>(mockResumes);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "analyzed" | "archived">("all");
  const [syncing, setSyncing] = useState(false);

  const config = EMAIL_CONFIGS.find(c => c.type === activeTab)!;

  // Form state
  const [formEmail, setFormEmail] = useState("");
  const [formName, setFormName] = useState("");
  const [formFolder, setFormFolder] = useState("INBOX");
  const [formDays, setFormDays] = useState("30");
  const [formUser, setFormUser] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formHost, setFormHost] = useState(config.host);
  const [formPort, setFormPort] = useState(config.port);
  const [formSSL, setFormSSL] = useState(true);
  const [connecting, setConnecting] = useState(false);

  const handleTabChange = (t: EmailType) => {
    setActiveTab(t);
    const c = EMAIL_CONFIGS.find(x => x.type === t)!;
    setFormHost(c.host);
    setFormPort(c.port);
  };

  const handleConnect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formEmail) { toast.error("请填写邮箱地址"); return; }
    if (!formPassword) { toast.error("请填写客户端授权码"); return; }
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      toast.success("邮箱连接成功！开始同步简历...");
    }, 1800);
  };

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => { setSyncing(false); toast.success("同步完成，共导入 1 份新简历"); }, 2000);
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === filteredResumes.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredResumes.map(r => r.id)));
    }
  };

  const filteredResumes = resumes.filter(r => filterStatus === "all" || r.status === filterStatus);

  const stats = {
    syncing: resumes.filter(r => r.status === "pending").length,
    total: resumes.length,
    pending: resumes.filter(r => r.status === "pending").length,
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">简历库</h1>
          <p className="text-sm text-gray-500 mt-0.5">邮箱同步和手动导入的简历都会显示，分析时直接跳到当前会话</p>
        </div>

        {/* Top Section: Connect + Connected */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left: Connect Email */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-semibold text-gray-900">连接招聘邮箱</h2>
              <button
                onClick={handleSync}
                disabled={syncing}
                className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all"
                style={{ borderColor: "#4F39F6", color: "#4F39F6", background: "#f5f3ff" }}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
                邮箱同步
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              先接收件箱，把邮件里的简历附件同步进简历库。当前先开放 163、126、QQ 和通用 IMAP 邮箱接入。
            </p>

            {/* Email Type Tabs */}
            <div className="flex gap-2 mb-4 flex-wrap">
              {EMAIL_CONFIGS.map(c => (
                <button
                  key={c.type}
                  onClick={() => handleTabChange(c.type)}
                  className="px-4 py-1.5 rounded-lg text-sm font-medium border transition-all"
                  style={activeTab === c.type ? {
                    background: "#4F39F6", color: "#fff", borderColor: "#4F39F6"
                  } : {
                    background: "#fff", color: "#374151", borderColor: "#e5e7eb"
                  }}
                >
                  {c.label}
                </button>
              ))}
            </div>

            {/* Instructions */}
            <div className="bg-gray-50 rounded-xl p-4 mb-4 border border-gray-100">
              <p className="text-sm font-medium text-gray-700 mb-2">
                {activeTab === "company" ? "企业邮箱配置说明" : "网易 / QQ 邮箱配置说明"}
              </p>
              {config.instructions}
            </div>

            {/* Form */}
            <form onSubmit={handleConnect} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="email"
                  placeholder="HR 邮箱地址"
                  value={formEmail}
                  onChange={e => setFormEmail(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 bg-white"
                />
                <input
                  type="text"
                  placeholder="显示名称（可选）"
                  value={formName}
                  onChange={e => setFormName(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="INBOX"
                  value={formFolder}
                  onChange={e => setFormFolder(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 bg-white"
                />
                <input
                  type="number"
                  placeholder="30"
                  value={formDays}
                  onChange={e => setFormDays(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="IMAP 用户名，默认同邮箱"
                  value={formUser}
                  onChange={e => setFormUser(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 bg-white"
                />
                <input
                  type="password"
                  placeholder="客户端授权码 / 应用密码"
                  value={formPassword}
                  onChange={e => setFormPassword(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 bg-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={formHost}
                  onChange={e => setFormHost(e.target.value)}
                  placeholder={activeTab === "company" ? "IMAP 服务器地址" : config.host}
                  className="h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 bg-white"
                />
                <input
                  type="text"
                  value={formPort}
                  onChange={e => setFormPort(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 bg-white"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <div
                  onClick={() => setFormSSL(!formSSL)}
                  className="w-4 h-4 rounded flex items-center justify-center border transition-all"
                  style={formSSL ? { background: "#4F39F6", borderColor: "#4F39F6" } : { background: "#fff", borderColor: "#d1d5db" }}
                >
                  {formSSL && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4l3 3 5-6" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <span className="text-sm text-gray-600">使用 SSL / TLS 安全连接</span>
              </label>
              <div className="flex gap-3 pt-1">
                <button
                  type="submit"
                  disabled={connecting}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                  style={{ background: "#4F39F6", boxShadow: "0 4px 12px rgba(79,57,246,0.25)" }}
                >
                  <Mail className="w-4 h-4" />
                  {connecting ? "连接中..." : "连接邮箱"}
                </button>
                <button
                  type="button"
                  onClick={() => { setFormEmail(""); setFormName(""); setFormFolder("INBOX"); setFormDays("30"); setFormUser(""); setFormPassword(""); }}
                  className="px-5 py-2.5 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all"
                >
                  重置表单
                </button>
              </div>
            </form>
          </div>

          {/* Right: Connected Emails */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-semibold text-gray-900">已连接邮箱</h2>
              <button onClick={handleSync} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 transition-colors">
                <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
                刷新
              </button>
            </div>
            <p className="text-xs text-gray-500 mb-4">同步后，邮件里的简历附件会直接出现在下面的简历库里。</p>

            {connectedEmails.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Mail className="w-10 h-10 mb-3 opacity-30" />
                <p className="text-sm">暂未连接任何邮箱</p>
              </div>
            ) : (
              <div className="space-y-3">
                {connectedEmails.map(em => (
                  <div key={em.id} className="rounded-xl border border-gray-100 p-4 bg-gray-50">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium text-sm text-gray-900">{em.label} · {em.email}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                            style={em.status === "active" ? { background: "#dcfce7", color: "#16a34a" } : { background: "#fee2e2", color: "#dc2626" }}>
                            {em.status === "active" ? "正常" : "异常"}
                          </span>
                          <span className="text-xs text-gray-400 border border-gray-200 px-2 py-0.5 rounded-full">客户端授权码</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">{em.email}</p>
                        <p className="text-xs text-gray-400">{em.host}:{em.port} · 文件夹 {em.folder}</p>
                        <p className="text-xs text-gray-400">首次导入范围 {em.syncDays} 天 · 最近同步 {em.lastSync}</p>
                        <p className="text-xs text-gray-400">最近一次：扫描 {em.scanned} 封，导入 {em.imported} 份，跳过 {em.attachments} 个附件</p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-3">
                      <button className="text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-white transition-all">
                        修改范围
                      </button>
                      <button
                        onClick={handleSync}
                        className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium text-white transition-all"
                        style={{ background: "#4F39F6" }}
                      >
                        <RefreshCw className={`w-3 h-3 ${syncing ? "animate-spin" : ""}`} />
                        立即同步
                      </button>
                      <button className="text-xs px-3 py-1.5 rounded-lg border border-red-100 text-red-500 hover:bg-red-50 transition-all">
                        移除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Bottom Section: Resume List + Batch Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Resume List */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-semibold text-gray-900">候选人简历</h2>
              <div className="flex items-center gap-2">
                <button onClick={handleSync} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 transition-colors">
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
                  刷新
                </button>
                <button className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg text-white transition-all"
                  style={{ background: "#4F39F6" }}>
                  <Upload className="w-3.5 h-3.5" />
                  导入简历
                </button>
              </div>
            </div>
            <p className="text-xs text-gray-500 mb-4">
              这里会汇总手动导入和邮箱同步进来的简历，支持搜索、筛选，以及单个或批量直接跳进当前对话分析。
            </p>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 mb-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="搜索候选人、文件名、邮件主题、发件人"
                  className="w-full h-9 pl-8 pr-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 bg-gray-50"
                />
                <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
              </div>
              {(["all", "pending", "analyzed", "archived"] as const).map(s => (
                <button
                  key={s}
                  onClick={() => setFilterStatus(s)}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                  style={filterStatus === s ? { background: "#4F39F6", color: "#fff", borderColor: "#4F39F6" } : { background: "#fff", color: "#6b7280", borderColor: "#e5e7eb" }}
                >
                  {s === "all" ? "全部" : s === "pending" ? "待处理" : s === "analyzed" ? "已分析" : "已归档"}
                </button>
              ))}
            </div>

            <p className="text-xs text-gray-500 mb-3">共 {filteredResumes.length} 份简历
              <span className="ml-2 text-gray-400">单个分析或批量分析都会跳到当前对话</span>
            </p>

            {/* Resume Items */}
            <div className="space-y-2">
              {/* Select All */}
              <div className="flex items-center gap-2 pb-1 border-b border-gray-100">
                <button onClick={toggleAll} className="text-gray-400 hover:text-indigo-600 transition-colors">
                  {selectedIds.size === filteredResumes.length && filteredResumes.length > 0
                    ? <CheckSquare className="w-4 h-4 text-indigo-600" />
                    : <Square className="w-4 h-4" />
                  }
                </button>
                <span className="text-xs text-gray-400">全选</span>
              </div>

              {filteredResumes.map(resume => {
                const sc = statusConfig[resume.status];
                return (
                  <div key={resume.id}
                    className="rounded-xl border border-gray-100 p-3.5 hover:border-indigo-200 transition-all"
                    style={{ background: selectedIds.has(resume.id) ? "#f5f3ff" : "#fafafa" }}>
                    <div className="flex items-start gap-3">
                      <button onClick={() => toggleSelect(resume.id)} className="mt-0.5 text-gray-400 hover:text-indigo-600 transition-colors flex-shrink-0">
                        {selectedIds.has(resume.id)
                          ? <CheckSquare className="w-4 h-4 text-indigo-600" />
                          : <Square className="w-4 h-4" />
                        }
                      </button>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm text-gray-900">{resume.name}</span>
                          <span className="text-xs px-2 py-0.5 rounded-full font-medium border"
                            style={{ color: sc.color, background: sc.bg, borderColor: sc.border }}>
                            {sc.label}
                          </span>
                          {resume.source === "manual" && (
                            <span className="text-xs text-gray-400 border border-gray-200 px-2 py-0.5 rounded-full">手动导入</span>
                          )}
                          {resume.source === "email" && (
                            <span className="text-xs text-indigo-500 border border-indigo-100 px-2 py-0.5 rounded-full bg-indigo-50">邮箱同步</span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                          <span>📄 {resume.fileName}</span>
                          <span>{resume.fileSize}</span>
                          <span>导入时间：{resume.importTime}</span>
                        </div>
                        {resume.source === "email" && resume.emailSubject && (
                          <div className="mt-2 text-xs text-gray-500 space-y-0.5">
                            <p>收件时间：{resume.receiveTime}</p>
                            <p>邮件主题：{resume.emailSubject}</p>
                            <p>发件人：{resume.sender}</p>
                            <p className="text-gray-400 line-clamp-2">邮件摘要：{resume.snippet}</p>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-indigo-200 text-indigo-600 hover:bg-indigo-50 transition-all">
                          <BarChart2 className="w-3 h-3" />
                          分析
                        </button>
                        <button className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 transition-all">
                          <Trash2 className="w-3 h-3" />
                          删除
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Batch Actions */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">批量动作</h2>
            <p className="text-xs text-gray-500 mb-5">
              这里勾选中的简历会直接作为附件带到所有工作台，并自动加入简历评估技能。
            </p>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 mb-5">
              <div className="rounded-xl p-3 text-center" style={{ background: "#f0fdf4" }}>
                <div className="text-xl font-bold text-green-600">{stats.syncing}</div>
                <div className="text-xs text-gray-500 mt-0.5">当前同中</div>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ background: "#f5f3ff" }}>
                <div className="text-xl font-bold text-indigo-600">{stats.total}</div>
                <div className="text-xs text-gray-500 mt-0.5">列表总数</div>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ background: "#fffbeb" }}>
                <div className="text-xl font-bold text-amber-600">{stats.pending}</div>
                <div className="text-xs text-gray-500 mt-0.5">待处理</div>
              </div>
            </div>

            {/* Batch Buttons */}
            <div className="space-y-2">
              <button
                disabled={selectedIds.size === 0}
                onClick={() => toast.info(`正在批量分析 ${selectedIds.size} 份简历...`)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white transition-all"
                style={selectedIds.size > 0 ? { background: "#4F39F6", boxShadow: "0 4px 12px rgba(79,57,246,0.25)" } : { background: "#e5e7eb", color: "#9ca3af", cursor: "not-allowed" }}
              >
                <BarChart2 className="w-4 h-4" />
                分析选中简历 {selectedIds.size > 0 ? `(${selectedIds.size})` : ""}
              </button>
              <button
                disabled={selectedIds.size === 0}
                onClick={() => toast.info("已全选当前筛选结果")}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium border transition-all"
                style={selectedIds.size > 0 ? { borderColor: "#4F39F6", color: "#4F39F6", background: "#f5f3ff" } : { borderColor: "#e5e7eb", color: "#9ca3af", cursor: "not-allowed" }}
              >
                <CheckSquare className="w-4 h-4" />
                全选当前结果
              </button>
            </div>

            {selectedIds.size > 0 && (
              <div className="mt-4 p-3 rounded-xl border flex items-start gap-2"
                style={{ background: "#f5f3ff", borderColor: "#ddd6fe" }}>
                <AlertCircle className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-indigo-700">
                  已选中 <span className="font-bold">{selectedIds.size}</span> 份简历，点击「分析选中简历」将跳转到 Horo AI 进行批量分析
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
