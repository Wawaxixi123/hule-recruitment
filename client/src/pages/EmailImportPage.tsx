/**
 * EmailImportPage - 邮箱简历导入（重构版）
 * 邮箱配置区域可收起；简历列表为核心；状态分"待处理/已分析"；
 * 批量操作：发送到 Horo AI 分析 / 导入候选人库
 */
import { useState } from "react";
import { useLocation } from "wouter";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Mail, ChevronDown, ChevronUp, RefreshCw, Trash2,
  MessageSquare, Users, FileText, Search, Plus,
  CheckCircle2, Clock, Inbox, AlertCircle
} from "lucide-react";
import { toast } from "sonner";

type EmailType = "163" | "126" | "company" | "qq";

const EMAIL_CONFIGS: Record<EmailType, { label: string; host: string; port: string; hint: string }> = {
  "163": {
    label: "网易 163",
    host: "imap.163.com",
    port: "993",
    hint: "• 先去邮箱设置里开启 IMAP，并生成客户端授权码；建议不要直接填写网页登录密码。\n• 邮箱地址通常就是 IMAP 用户名；默认 Host、Port、SSL 已经按常见配置预填好了。\n• 密码栏请填写客户端授权码；同步文件夹一般填 INBOX，或者你专门收简历的文件夹名。\n• 首次导入范围表示第一次同步最近多少天邮件；后续再点同步时会按增量拉取新邮件。",
  },
  "126": {
    label: "网易 126",
    host: "imap.126.com",
    port: "993",
    hint: "• 先去邮箱设置里开启 IMAP，并生成客户端授权码；建议不要直接填写网页登录密码。\n• 邮箱地址通常就是 IMAP 用户名；默认 Host、Port、SSL 已经按常见配置预填好了。\n• 密码栏请填写客户端授权码；同步文件夹一般填 INBOX，或者你专门收简历的文件夹名。\n• 首次导入范围表示第一次同步最近多少天邮件；后续再点同步时会按增量拉取新邮件。",
  },
  "qq": {
    label: "QQ 邮箱",
    host: "imap.qq.com",
    port: "993",
    hint: "• 先去邮箱设置里开启 IMAP，并生成客户端授权码；建议不要直接填写网页登录密码。\n• 邮箱地址通常就是 IMAP 用户名；默认 Host、Port、SSL 已经按常见配置预填好了。\n• 密码栏请填写客户端授权码；同步文件夹一般填 INBOX，或者你专门收简历的文件夹名。\n• 首次导入范围表示第一次同步最近多少天邮件；后续再点同步时会按增量拉取新邮件。",
  },
  "company": {
    label: "公司邮箱 / 其他",
    host: "",
    port: "993",
    hint: "1. 进企业微信邮箱 → 收发信设置 → 找「开启 IMAP/SMTP 服务」并开启\n2. 微信绑定 → 开启安全登录 → 生成新密码\n3. 生成「客户端专用密码」（不是登录密码）\n4. 把生成的专用密码填到这里的密码栏",
  },
};

type ResumeStatus = "pending" | "analyzed";

interface EmailResume {
  id: string;
  name: string;
  fileName: string;
  fileSize: string;
  emailSubject: string;
  sender: string;
  receivedAt: string;
  importedAt: string;
  status: ResumeStatus;
  source: string;
}

const MOCK_RESUMES: EmailResume[] = [
  {
    id: "1", name: "张明远", fileName: "张明远-产品经理简历.pdf", fileSize: "560 KB",
    emailSubject: "应聘产品经理岗位 - 张明远", sender: "zhangmingyuan@163.com",
    receivedAt: "2026/04/07 09:36", importedAt: "2026/04/07 09:41",
    status: "analyzed", source: "网易 163",
  },
  {
    id: "2", name: "李思雨", fileName: "李思雨-游戏UI实习生.pdf", fileSize: "6.4 KB",
    emailSubject: "Fw: 广州美术学院-李思雨-游戏UI实习生", sender: "工具人-土耳其 <gongjurenhuerqi@10m.com.cn>",
    receivedAt: "2026/04/04 03:42", importedAt: "2026/04/04 03:42",
    status: "pending", source: "网易 163",
  },
  {
    id: "3", name: "王浩然", fileName: "王浩然-后端工程师.docx", fileSize: "6.4 KB",
    emailSubject: "应聘后端工程师 - 王浩然", sender: "wanghaoran@qq.com",
    receivedAt: "2026/04/04 03:41", importedAt: "2026/04/04 03:41",
    status: "pending", source: "QQ 邮箱",
  },
  {
    id: "4", name: "陈晓燕", fileName: "陈晓燕-前端开发简历.pdf", fileSize: "320 KB",
    emailSubject: "应聘前端开发工程师", sender: "chenxiaoyan@company.com",
    receivedAt: "2026/04/03 16:20", importedAt: "2026/04/03 16:25",
    status: "analyzed", source: "公司邮箱",
  },
  {
    id: "5", name: "刘子轩", fileName: "刘子轩-UI设计师.pdf", fileSize: "1.2 MB",
    emailSubject: "应聘UI设计师岗位 - 刘子轩", sender: "liuzixuan@126.com",
    receivedAt: "2026/04/03 11:05", importedAt: "2026/04/03 11:10",
    status: "pending", source: "网易 126",
  },
];

const CONNECTED_EMAIL = {
  address: "13822362481@163.com",
  host: "imap.163.com:993",
  folder: "INBOX",
  lastSync: "2026/04/07 09:35",
  lastResult: "扫描 5 封，导入 1 份，跳过 1 个附件",
};

export default function EmailImportPage() {
  const [, navigate] = useLocation();
  const [configCollapsed, setConfigCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState<EmailType>("163");
  const [form, setForm] = useState({
    email: "", displayName: "", folder: "INBOX", days: "30",
    username: "", password: "", ssl: true,
  });
  const [statusFilter, setStatusFilter] = useState<"all" | ResumeStatus>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [isConnected] = useState(true);
  const [syncing, setSyncing] = useState(false);

  const cfg = EMAIL_CONFIGS[activeTab];

  const filteredResumes = MOCK_RESUMES.filter(r => {
    const matchStatus = statusFilter === "all" || r.status === statusFilter;
    const matchSearch = !searchQuery ||
      r.name.includes(searchQuery) ||
      r.fileName.includes(searchQuery) ||
      r.emailSubject.includes(searchQuery) ||
      r.sender.includes(searchQuery);
    return matchStatus && matchSearch;
  });

  const allSelected = filteredResumes.length > 0 && filteredResumes.every(r => selectedIds.includes(r.id));

  const toggleAll = () => {
    if (allSelected) setSelectedIds([]);
    else setSelectedIds(filteredResumes.map(r => r.id));
  };

  const toggleOne = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleAnalyzeWithHoro = () => {
    if (selectedIds.length === 0) { toast.warning("请先勾选简历"); return; }
    toast.success(`已将 ${selectedIds.length} 份简历发送至 Horo AI 进行分析`);
    navigate("/horo-ai");
  };

  const handleImportCandidates = () => {
    if (selectedIds.length === 0) { toast.warning("请先勾选简历"); return; }
    toast.success(`已将 ${selectedIds.length} 份简历导入候选人库`);
    setSelectedIds([]);
  };

  const handleConnect = () => {
    if (!form.email) { toast.error("请填写邮箱地址"); return; }
    toast.success("邮箱连接成功，开始同步简历...");
    setConfigCollapsed(true);
  };

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => { setSyncing(false); toast.success("同步完成，共导入 1 份新简历"); }, 2000);
  };

  const pendingCount = MOCK_RESUMES.filter(r => r.status === "pending").length;
  const analyzedCount = MOCK_RESUMES.filter(r => r.status === "analyzed").length;

  return (
    <AppLayout title="邮箱简历导入" breadcrumb={[{ label: "获取简历" }, { label: "邮箱简历导入" }]}>
      <div className="p-6 space-y-5 max-w-5xl mx-auto">

        {/* 邮箱配置区域（可收起） */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div
            className="flex items-center justify-between px-6 py-4 cursor-pointer select-none"
            onClick={() => setConfigCollapsed(v => !v)}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center">
                <Mail className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-900">连接招聘邮箱</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {isConnected
                    ? `已连接：${CONNECTED_EMAIL.address}  ·  最近同步 ${CONNECTED_EMAIL.lastSync}`
                    : "先接收件箱，把邮件里的简历附件同步进简历库"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2" onClick={e => e.stopPropagation()}>
              {isConnected && (
                <button
                  onClick={handleSync}
                  disabled={syncing}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
                  邮箱同步
                </button>
              )}
              <div onClick={() => setConfigCollapsed(v => !v)} className="p-1">
                {configCollapsed
                  ? <ChevronDown className="w-4 h-4 text-gray-400" />
                  : <ChevronUp className="w-4 h-4 text-gray-400" />
                }
              </div>
            </div>
          </div>

          {!configCollapsed && (
            <div className="border-t border-gray-100 px-6 py-5">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* 左：配置表单 */}
                <div>
                  <div className="flex gap-2 mb-4 flex-wrap">
                    {(["126", "163", "company", "qq"] as EmailType[]).map(type => (
                      <button
                        key={type}
                        onClick={() => setActiveTab(type)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-all ${
                          activeTab === type
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300"
                        }`}
                      >
                        {EMAIL_CONFIGS[type].label}
                      </button>
                    ))}
                  </div>

                  <div className="bg-gray-50 rounded-xl p-4 mb-4 text-xs text-gray-600 leading-relaxed whitespace-pre-line">
                    <p className="font-medium text-gray-700 mb-1.5">{cfg.label} 邮箱配置说明</p>
                    {cfg.hint}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <input
                      className="col-span-2 sm:col-span-1 h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      placeholder="HR 邮箱地址"
                      value={form.email}
                      onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    />
                    <input
                      className="col-span-2 sm:col-span-1 h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      placeholder="显示名称（可选）"
                      value={form.displayName}
                      onChange={e => setForm(f => ({ ...f, displayName: e.target.value }))}
                    />
                    <input
                      className="h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      placeholder="同步文件夹（INBOX）"
                      value={form.folder}
                      onChange={e => setForm(f => ({ ...f, folder: e.target.value }))}
                    />
                    <input
                      className="h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      placeholder="首次导入范围（天）"
                      value={form.days}
                      onChange={e => setForm(f => ({ ...f, days: e.target.value }))}
                    />
                    <input
                      className="h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      placeholder="IMAP 用户名（默认同邮箱）"
                      value={form.username}
                      onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                    />
                    <input
                      type="password"
                      className="h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
                      placeholder="客户端授权码 / 应用密码"
                      value={form.password}
                      onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    />
                    <input
                      className="h-10 px-3 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-500"
                      value={cfg.host || "IMAP Host（自定义）"}
                      readOnly={!!cfg.host}
                      placeholder="IMAP Host"
                    />
                    <input
                      className="h-10 px-3 rounded-xl border border-gray-200 text-sm bg-gray-50 text-gray-500"
                      value={cfg.port}
                      readOnly
                      placeholder="端口"
                    />
                  </div>

                  <div className="flex items-center gap-2 mt-3 mb-4">
                    <Checkbox
                      id="ssl"
                      checked={form.ssl}
                      onCheckedChange={(v: boolean | "indeterminate") => setForm(f => ({ ...f, ssl: v === true }))}
                    />
                    <label htmlFor="ssl" className="text-sm text-gray-600">使用 SSL / TLS 安全连接</label>
                  </div>

                  <div className="flex gap-2">
                    <Button onClick={handleConnect} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2">
                      <Mail className="w-4 h-4" />连接邮箱
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setForm({ email: "", displayName: "", folder: "INBOX", days: "30", username: "", password: "", ssl: true })}
                      className="rounded-xl"
                    >
                      重置表单
                    </Button>
                  </div>
                </div>

                {/* 右：已连接邮箱 */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-700">已连接邮箱</h3>
                    <button onClick={() => toast.success("正在刷新...")} className="text-xs text-gray-400 hover:text-gray-600 flex items-center gap-1">
                      <RefreshCw className="w-3 h-3" />刷新
                    </button>
                  </div>
                  {isConnected ? (
                    <div className="bg-gray-50 rounded-xl p-4 space-y-2">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-sm font-medium text-gray-900">{CONNECTED_EMAIL.address}</span>
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">正常</span>
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div>{CONNECTED_EMAIL.host} · 文件夹 {CONNECTED_EMAIL.folder}</div>
                        <div>首次导入范围 30 天 · 最近同步 {CONNECTED_EMAIL.lastSync}</div>
                        <div className="text-gray-400">{CONNECTED_EMAIL.lastResult}</div>
                      </div>
                      <div className="flex gap-2 pt-1 flex-wrap">
                        <button
                          onClick={handleSync}
                          disabled={syncing}
                          className="flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg"
                        >
                          <RefreshCw className={`w-3 h-3 ${syncing ? "animate-spin" : ""}`} />
                          立即同步
                        </button>
                        <button onClick={() => toast.info("功能开发中")} className="text-xs text-gray-500 hover:text-gray-700 underline">修改范围</button>
                        <button onClick={() => toast.success("已移除邮箱连接")} className="text-xs text-red-500 hover:text-red-700 underline">移除</button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 rounded-xl p-6 text-center text-sm text-gray-400">
                      <Inbox className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                      尚未连接任何邮箱
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 简历列表区域 */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-100">
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <div>
                <h2 className="text-sm font-semibold text-gray-900">候选人简历</h2>
                <p className="text-xs text-gray-400 mt-0.5">邮箱同步和手动导入的简历都会显示在这里，分析时直接跳转到 Horo AI 对话</p>
              </div>
              <button
                onClick={() => toast.info("手动导入功能开发中")}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />手动导入
              </button>
            </div>

            <div className="flex items-center gap-4 mt-4 flex-wrap">
              <div className="flex gap-1 bg-gray-100 rounded-xl p-1">
                {([
                  { key: "all", label: `全部 ${MOCK_RESUMES.length}` },
                  { key: "pending", label: `待处理 ${pendingCount}` },
                  { key: "analyzed", label: `已分析 ${analyzedCount}` },
                ] as { key: "all" | ResumeStatus; label: string }[]).map(tab => (
                  <button
                    key={tab.key}
                    onClick={() => setStatusFilter(tab.key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      statusFilter === tab.key
                        ? "bg-white text-gray-900 shadow-sm"
                        : "text-gray-500 hover:text-gray-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 flex-1 min-w-[200px] bg-gray-50 rounded-xl px-3 py-2 border border-gray-100">
                <Search className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <input
                  className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
                  placeholder="搜索候选人、文件名、邮件主题、发件人"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {selectedIds.length > 0 && (
            <div className="px-6 py-3 bg-indigo-50 border-b border-indigo-100 flex items-center gap-3 flex-wrap">
              <AlertCircle className="w-4 h-4 text-indigo-500 flex-shrink-0" />
              <span className="text-sm font-medium text-indigo-700">已选 {selectedIds.length} 份简历</span>
              <div className="flex gap-2 ml-auto flex-wrap">
                <Button size="sm" onClick={handleAnalyzeWithHoro} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-1.5 text-xs h-8">
                  <MessageSquare className="w-3.5 h-3.5" />批量分析（Horo AI）
                </Button>
                <Button size="sm" variant="outline" onClick={handleImportCandidates} className="rounded-xl gap-1.5 text-xs h-8 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                  <Users className="w-3.5 h-3.5" />批量导入候选人库
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setSelectedIds([])} className="rounded-xl text-xs h-8 text-gray-500">取消</Button>
              </div>
            </div>
          )}

          <div className="px-6 py-3 border-b border-gray-50 flex items-center gap-3 text-xs font-medium text-gray-400">
            <Checkbox checked={allSelected} onCheckedChange={toggleAll} className="flex-shrink-0" />
            <span className="flex-1">候选人 / 文件</span>
            <span className="w-20 text-center hidden sm:block">来源</span>
            <span className="w-20 text-center hidden md:block">状态</span>
            <span className="w-32 text-right hidden lg:block">导入时间</span>
            <span className="w-24 text-right">操作</span>
          </div>

          <div className="divide-y divide-gray-50">
            {filteredResumes.length === 0 ? (
              <div className="py-16 text-center">
                <Inbox className="w-10 h-10 mx-auto text-gray-200 mb-3" />
                <p className="text-sm text-gray-400">暂无简历，请先连接邮箱或手动导入</p>
              </div>
            ) : (
              filteredResumes.map(resume => (
                <div
                  key={resume.id}
                  className={`px-6 py-4 flex items-start gap-3 hover:bg-gray-50/50 transition-colors ${selectedIds.includes(resume.id) ? "bg-indigo-50/30" : ""}`}
                >
                  <Checkbox
                    checked={selectedIds.includes(resume.id)}
                    onCheckedChange={() => toggleOne(resume.id)}
                    className="mt-0.5 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-gray-900">{resume.name}</span>
                      {resume.status === "pending" ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                          <Clock className="w-3 h-3" />待处理
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
                          <CheckCircle2 className="w-3 h-3" />已分析
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1">
                      <FileText className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="text-xs text-gray-500 truncate">{resume.fileName}</span>
                      <span className="text-xs text-gray-300">·</span>
                      <span className="text-xs text-gray-400">{resume.fileSize}</span>
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5 truncate">邮件主题：{resume.emailSubject}</div>
                    <div className="text-xs text-gray-400 truncate">发件人：{resume.sender} · 收件时间：{resume.receivedAt}</div>
                  </div>
                  <div className="w-20 text-center hidden sm:block">
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">{resume.source}</span>
                  </div>
                  <div className="w-20 text-center hidden md:flex justify-center">
                    {resume.status === "pending" ? (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-600"><Clock className="w-3 h-3" />待处理</span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 className="w-3 h-3" />已分析</span>
                    )}
                  </div>
                  <div className="w-32 text-right hidden lg:block">
                    <span className="text-xs text-gray-400">{resume.importedAt}</span>
                  </div>
                  <div className="w-24 flex items-center justify-end gap-1 flex-shrink-0">
                    <button
                      onClick={() => { toast.success(`正在分析 ${resume.name} 的简历...`); navigate("/horo-ai"); }}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                      title="发送到 Horo AI 分析"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toast.success(`${resume.name} 已导入候选人库`)}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition-colors"
                      title="导入候选人库"
                    >
                      <Users className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => toast.success("已删除")}
                      className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                      title="删除"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {filteredResumes.length > 0 && (
            <div className="px-6 py-3 border-t border-gray-50 flex items-center justify-between text-xs text-gray-400">
              <span>共 {filteredResumes.length} 份简历</span>
              <span>勾选后可批量分析或导入候选人库</span>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
