/**
 * EmailImportModal - 邮箱导入简历
 * 支持绑定个人邮箱，自动识别BOSS直聘标签邮件，对应到招聘岗位
 */
import { useState } from "react";
import { Mail, Link2, CheckCircle2, Loader2, X, ChevronRight, Inbox, Tag, Briefcase, AlertCircle, RefreshCw, Zap } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { mockJobs } from "@/lib/mockData";
import { toast } from "sonner";

interface EmailAccount {
  id: string;
  email: string;
  provider: "gmail" | "qq" | "163" | "outlook" | "enterprise";
  connected: boolean;
  lastSync?: string;
  unreadCount?: number;
}

interface ParsedEmail {
  id: string;
  subject: string;
  from: string;
  date: string;
  candidateName: string;
  candidateEmail: string;
  source: "boss" | "liepin" | "zhilian" | "lagou" | "other";
  suggestedJobId?: string;
  suggestedJobTitle?: string;
  matchConfidence: number;
  resumeAttached: boolean;
  selected: boolean;
}

const MOCK_EMAILS: ParsedEmail[] = [
  { id: "e1", subject: "【BOSS直聘】陈志远 投递 高级AI产品经理", from: "noreply@bosszhipin.com", date: "今天 09:32", candidateName: "陈志远", candidateEmail: "chen.zhiyuan@gmail.com", source: "boss", suggestedJobId: "job-001", suggestedJobTitle: "高级AI产品经理", matchConfidence: 97, resumeAttached: true, selected: true },
  { id: "e2", subject: "【BOSS直聘】李明华 投递 机器学习工程师", from: "noreply@bosszhipin.com", date: "今天 08:15", candidateName: "李明华", candidateEmail: "li.minghua@163.com", source: "boss", suggestedJobId: "job-002", suggestedJobTitle: "机器学习工程师", matchConfidence: 94, resumeAttached: true, selected: true },
  { id: "e3", subject: "【BOSS直聘】王芳 投递 HRBP", from: "noreply@bosszhipin.com", date: "今天 07:48", candidateName: "王芳", candidateEmail: "wang.fang@qq.com", source: "boss", suggestedJobId: "job-003", suggestedJobTitle: "HRBP", matchConfidence: 91, resumeAttached: true, selected: true },
  { id: "e4", subject: "【BOSS直聘】张伟 投递 前端开发工程师", from: "noreply@bosszhipin.com", date: "昨天 18:22", candidateName: "张伟", candidateEmail: "zhang.wei@outlook.com", source: "boss", suggestedJobId: "job-004", suggestedJobTitle: "前端开发工程师", matchConfidence: 88, resumeAttached: true, selected: false },
  { id: "e5", subject: "【猎聘】刘洋 简历投递", from: "noreply@liepin.com", date: "昨天 16:05", candidateName: "刘洋", candidateEmail: "liu.yang@gmail.com", source: "liepin", suggestedJobId: "job-001", suggestedJobTitle: "高级AI产品经理", matchConfidence: 82, resumeAttached: true, selected: false },
  { id: "e6", subject: "【BOSS直聘】赵磊 投递 数据分析师", from: "noreply@bosszhipin.com", date: "昨天 14:30", candidateName: "赵磊", candidateEmail: "zhao.lei@163.com", source: "boss", suggestedJobId: "job-005", suggestedJobTitle: "数据分析师", matchConfidence: 95, resumeAttached: false, selected: false },
];

const PROVIDERS = [
  { id: "gmail", name: "Gmail", icon: "📧", color: "bg-red-50 border-red-200 text-red-600" },
  { id: "qq", name: "QQ邮箱", icon: "💬", color: "bg-blue-50 border-blue-200 text-blue-600" },
  { id: "163", name: "网易163", icon: "📮", color: "bg-orange-50 border-orange-200 text-orange-600" },
  { id: "outlook", name: "Outlook", icon: "🔵", color: "bg-sky-50 border-sky-200 text-sky-600" },
  { id: "enterprise", name: "企业邮箱", icon: "🏢", color: "bg-indigo-50 border-indigo-200 text-indigo-600" },
];

const SOURCE_LABELS: Record<string, { label: string; color: string }> = {
  boss: { label: "BOSS直聘", color: "bg-yellow-50 text-yellow-700 border-yellow-200" },
  liepin: { label: "猎聘", color: "bg-blue-50 text-blue-700 border-blue-200" },
  zhilian: { label: "智联招聘", color: "bg-green-50 text-green-700 border-green-200" },
  lagou: { label: "拉勾网", color: "bg-orange-50 text-orange-700 border-orange-200" },
  other: { label: "其他", color: "bg-gray-50 text-gray-600 border-gray-200" },
};

interface Props {
  open: boolean;
  onClose: () => void;
  onImported?: (count: number) => void;
}

export default function EmailImportModal({ open, onClose, onImported }: Props) {
  const [step, setStep] = useState<"connect" | "scanning" | "review" | "importing" | "done">("connect");
  const [accounts, setAccounts] = useState<EmailAccount[]>([
    { id: "acc1", email: "hr@hule.ai", provider: "enterprise", connected: true, lastSync: "5分钟前", unreadCount: 6 },
  ]);
  const [emails, setEmails] = useState<ParsedEmail[]>(MOCK_EMAILS);
  const [connectingProvider, setConnectingProvider] = useState<string | null>(null);
  const [importProgress, setImportProgress] = useState(0);
  const [jobOverrides, setJobOverrides] = useState<Record<string, string>>({});

  const selectedEmails = emails.filter(e => e.selected);

  const handleConnect = async (providerId: string) => {
    setConnectingProvider(providerId);
    await new Promise(r => setTimeout(r, 1800));
    const provider = PROVIDERS.find(p => p.id === providerId);
    const newAcc: EmailAccount = {
      id: `acc-${Date.now()}`,
      email: providerId === "gmail" ? "user@gmail.com" : providerId === "qq" ? "user@qq.com" : "user@163.com",
      provider: providerId as any,
      connected: true,
      lastSync: "刚刚",
      unreadCount: Math.floor(Math.random() * 10) + 2,
    };
    setAccounts(prev => [...prev, newAcc]);
    setConnectingProvider(null);
    toast.success(`${provider?.name} 绑定成功`);
  };

  const handleScan = async () => {
    setStep("scanning");
    await new Promise(r => setTimeout(r, 2200));
    setStep("review");
  };

  const handleImport = async () => {
    setStep("importing");
    for (let i = 0; i <= 100; i += 10) {
      await new Promise(r => setTimeout(r, 120));
      setImportProgress(i);
    }
    setStep("done");
    onImported?.(selectedEmails.length);
  };

  const toggleEmail = (id: string) => {
    setEmails(prev => prev.map(e => e.id === id ? { ...e, selected: !e.selected } : e));
  };

  const toggleAll = () => {
    const allSelected = emails.every(e => e.selected);
    setEmails(prev => prev.map(e => ({ ...e, selected: !allSelected })));
  };

  const getJobForEmail = (email: ParsedEmail) => {
    const overrideId = jobOverrides[email.id];
    if (overrideId) return mockJobs.find(j => j.id === overrideId);
    return mockJobs.find(j => j.id === email.suggestedJobId);
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (!v) onClose(); }}>
      <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-gray-100 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center">
                <Mail className="w-4 h-4 text-indigo-600" />
              </div>
              <div>
                <DialogTitle className="text-base font-semibold text-gray-900">邮箱导入简历</DialogTitle>
                <p className="text-xs text-gray-400 mt-0.5">自动识别BOSS直聘等平台邮件，智能匹配招聘岗位</p>
              </div>
            </div>
            {/* Steps */}
            <div className="flex items-center gap-1.5 text-xs">
              {["connect", "review", "done"].map((s, i) => (
                <div key={s} className="flex items-center gap-1.5">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                    step === s || (s === "review" && step === "scanning") || (s === "review" && step === "importing")
                      ? "bg-indigo-600 text-white"
                      : step === "done" ? "bg-emerald-500 text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}>{i + 1}</div>
                  {i < 2 && <ChevronRight className="w-3 h-3 text-gray-300" />}
                </div>
              ))}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "thin" }}>
          {/* Step 1: Connect */}
          {step === "connect" && (
            <div className="p-6 space-y-5">
              {/* Connected accounts */}
              {accounts.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-3">已绑定邮箱</p>
                  <div className="space-y-2">
                    {accounts.map(acc => (
                      <div key={acc.id} className="flex items-center gap-3 p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800">{acc.email}</p>
                          <p className="text-xs text-gray-400">上次同步：{acc.lastSync}</p>
                        </div>
                        {acc.unreadCount && (
                          <span className="px-2 py-0.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full">
                            {acc.unreadCount} 封待处理
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add more */}
              <div>
                <p className="text-sm font-medium text-gray-700 mb-3">绑定更多邮箱</p>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {PROVIDERS.filter(p => !accounts.find(a => a.provider === p.id)).map(provider => (
                    <button
                      key={provider.id}
                      onClick={() => handleConnect(provider.id)}
                      disabled={connectingProvider === provider.id}
                      className={`flex items-center gap-2.5 p-3 rounded-xl border transition-all hover:shadow-sm ${provider.color} disabled:opacity-60`}
                    >
                      <span className="text-lg">{provider.icon}</span>
                      <span className="text-sm font-medium">{provider.name}</span>
                      {connectingProvider === provider.id && <Loader2 className="w-3.5 h-3.5 animate-spin ml-auto" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Auto-detect rule */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-start gap-2.5">
                  <Zap className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">自动识别规则</p>
                    <ul className="mt-1.5 space-y-1">
                      {["自动识别来自 BOSS直聘、猎聘、智联、拉勾 的简历邮件", "根据邮件主题中的岗位名称，智能匹配已发布的招聘岗位", "未能自动匹配的简历，可手动指定岗位后导入"].map((t, i) => (
                        <li key={i} className="flex items-start gap-1.5 text-xs text-amber-700">
                          <span className="mt-0.5 shrink-0">•</span>{t}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Scanning */}
          {step === "scanning" && (
            <div className="p-12 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <Inbox className="w-8 h-8 text-indigo-600 animate-pulse" />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-gray-900">正在扫描邮箱...</p>
                <p className="text-sm text-gray-400 mt-1">识别招聘平台邮件并解析简历信息</p>
              </div>
              <div className="flex gap-1.5 mt-2">
                {[0, 150, 300].map(d => (
                  <span key={d} className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Review */}
          {step === "review" && (
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={emails.every(e => e.selected)} onChange={toggleAll} className="w-4 h-4 accent-indigo-600" />
                  <span className="text-sm text-gray-600">全选（{selectedEmails.length}/{emails.length}）</span>
                </div>
                <button onClick={handleScan} className="flex items-center gap-1.5 text-xs text-indigo-600 hover:text-indigo-700">
                  <RefreshCw className="w-3 h-3" />刷新
                </button>
              </div>
              {emails.map(email => {
                const job = getJobForEmail(email);
                const src = SOURCE_LABELS[email.source];
                return (
                  <div key={email.id} className={`flex gap-3 p-3.5 rounded-xl border transition-all ${email.selected ? "border-indigo-200 bg-indigo-50/30" : "border-gray-100 bg-white"}`}>
                    <input type="checkbox" checked={email.selected} onChange={() => toggleEmail(email.id)} className="w-4 h-4 accent-indigo-600 mt-0.5 shrink-0" />
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-gray-900">{email.candidateName}</span>
                            <span className={`px-1.5 py-0.5 text-xs rounded-md border ${src.color}`}>{src.label}</span>
                            {!email.resumeAttached && (
                              <span className="px-1.5 py-0.5 text-xs rounded-md border bg-orange-50 text-orange-600 border-orange-200 flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />无附件
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5 truncate">{email.subject}</p>
                        </div>
                        <span className="text-xs text-gray-300 shrink-0">{email.date}</span>
                      </div>
                      {/* Job mapping */}
                      <div className="flex items-center gap-2">
                        <Tag className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                        <select
                          value={jobOverrides[email.id] || email.suggestedJobId || ""}
                          onChange={e => setJobOverrides(prev => ({ ...prev, [email.id]: e.target.value }))}
                          className="flex-1 text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-white text-gray-700 focus:outline-none focus:border-indigo-400"
                        >
                          <option value="">-- 请选择岗位 --</option>
                          {mockJobs.map(j => (
                            <option key={j.id} value={j.id}>{j.title}</option>
                          ))}
                        </select>
                        {job && (
                          <span className="text-xs text-emerald-600 font-medium shrink-0 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />{email.matchConfidence}% 匹配
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Step 4: Importing */}
          {step === "importing" && (
            <div className="p-12 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-gray-900">正在导入简历...</p>
                <p className="text-sm text-gray-400 mt-1">AI解析简历内容，自动填充候选人信息</p>
              </div>
              <div className="w-full max-w-xs bg-gray-100 rounded-full h-2 overflow-hidden">
                <div className="h-full bg-indigo-600 rounded-full transition-all duration-300" style={{ width: `${importProgress}%` }} />
              </div>
              <p className="text-sm text-indigo-600 font-medium">{importProgress}%</p>
            </div>
          )}

          {/* Step 5: Done */}
          {step === "done" && (
            <div className="p-12 flex flex-col items-center justify-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <div className="text-center">
                <p className="text-base font-semibold text-gray-900">导入成功！</p>
                <p className="text-sm text-gray-400 mt-1">已成功导入 <span className="text-indigo-600 font-semibold">{selectedEmails.length}</span> 份简历，并自动匹配到对应岗位</p>
              </div>
              <div className="w-full max-w-sm bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2">
                {selectedEmails.slice(0, 4).map(e => {
                  const job = getJobForEmail(e);
                  return (
                    <div key={e.id} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="font-medium text-gray-800">{e.candidateName}</span>
                      <ChevronRight className="w-3 h-3 text-gray-300" />
                      <span className="text-gray-500 truncate">{job?.title || "待分配"}</span>
                    </div>
                  );
                })}
                {selectedEmails.length > 4 && <p className="text-xs text-gray-400 pl-6">还有 {selectedEmails.length - 4} 份...</p>}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between shrink-0 bg-white">
          <button onClick={onClose} className="text-sm text-gray-500 hover:text-gray-700 transition-colors">
            {step === "done" ? "关闭" : "取消"}
          </button>
          <div className="flex gap-2">
            {step === "connect" && (
              <Button onClick={handleScan} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                <Inbox className="w-4 h-4 mr-1.5" />扫描邮箱
              </Button>
            )}
            {step === "review" && (
              <Button onClick={handleImport} disabled={selectedEmails.length === 0} className="bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40">
                <Briefcase className="w-4 h-4 mr-1.5" />导入 {selectedEmails.length} 份简历
              </Button>
            )}
            {step === "done" && (
              <Button onClick={onClose} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                查看候选人
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
