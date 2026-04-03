/**
 * BackgroundCheckPage - 背景调查模块
 * 利用 AI 与外部数据源验证候选人学历真实性，辅助搜寻前司背调联系人
 */
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShieldCheck, Search, CheckCircle2, AlertTriangle, XCircle,
  User, GraduationCap, Briefcase, Phone, Loader2, Plus,
  ChevronRight, Clock, FileText, Star, ExternalLink
} from "lucide-react";
import { toast } from "sonner";

type CheckStatus = "pending" | "running" | "passed" | "warning" | "failed";

interface CheckItem {
  id: string;
  candidateName: string;
  jobTitle: string;
  submittedAt: string;
  status: CheckStatus;
  educationVerified?: boolean;
  workVerified?: boolean;
  contactFound?: number;
  riskLevel?: "low" | "medium" | "high";
}

const mockChecks: CheckItem[] = [
  {
    id: "bc1",
    candidateName: "陈志远",
    jobTitle: "高级AI产品经理",
    submittedAt: "2026-04-03 10:30",
    status: "passed",
    educationVerified: true,
    workVerified: true,
    contactFound: 3,
    riskLevel: "low",
  },
  {
    id: "bc2",
    candidateName: "李雨桐",
    jobTitle: "算法工程师",
    submittedAt: "2026-04-03 09:15",
    status: "warning",
    educationVerified: true,
    workVerified: false,
    contactFound: 1,
    riskLevel: "medium",
  },
  {
    id: "bc3",
    candidateName: "王浩然",
    jobTitle: "前端工程师",
    submittedAt: "2026-04-02 16:45",
    status: "running",
    riskLevel: undefined,
  },
  {
    id: "bc4",
    candidateName: "张晓梅",
    jobTitle: "数据分析师",
    submittedAt: "2026-04-02 14:20",
    status: "failed",
    educationVerified: false,
    workVerified: false,
    contactFound: 0,
    riskLevel: "high",
  },
];

const statusConfig: Record<CheckStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: { label: "待调查", color: "text-gray-500 bg-gray-50 border-gray-200", icon: <Clock className="w-3.5 h-3.5" /> },
  running: { label: "调查中", color: "text-indigo-600 bg-indigo-50 border-indigo-200", icon: <Loader2 className="w-3.5 h-3.5 animate-spin" /> },
  passed: { label: "通过", color: "text-emerald-600 bg-emerald-50 border-emerald-200", icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  warning: { label: "存在风险", color: "text-amber-600 bg-amber-50 border-amber-200", icon: <AlertTriangle className="w-3.5 h-3.5" /> },
  failed: { label: "背调异常", color: "text-red-600 bg-red-50 border-red-200", icon: <XCircle className="w-3.5 h-3.5" /> },
};

const riskConfig = {
  low: { label: "低风险", color: "text-emerald-600 bg-emerald-50" },
  medium: { label: "中风险", color: "text-amber-600 bg-amber-50" },
  high: { label: "高风险", color: "text-red-600 bg-red-50" },
};

export default function BackgroundCheckPage() {
  const [selected, setSelected] = useState<CheckItem | null>(mockChecks[0]);
  const [searchQuery, setSearchQuery] = useState("");

  const filtered = mockChecks.filter(c =>
    !searchQuery || c.candidateName.includes(searchQuery) || c.jobTitle.includes(searchQuery)
  );

  return (
    <AppLayout title="背景调查" breadcrumb={[{ label: "背景调查" }]}>
      <div className="flex h-full" style={{ height: "calc(100vh - 56px)" }}>
        {/* Left Panel: List */}
        <div className="w-80 border-r border-gray-100 bg-white flex flex-col shrink-0">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">调查列表</h2>
              <Button size="sm" className="bg-indigo-600 text-white h-7 text-xs px-2.5"
                onClick={() => toast.info("发起背景调查功能即将上线")}>
                <Plus className="w-3.5 h-3.5 mr-1" />发起调查
              </Button>
            </div>
            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-2">
              <Search className="w-3.5 h-3.5 text-gray-400 shrink-0" />
              <input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="搜索候选人..."
                className="bg-transparent text-xs text-gray-700 flex-1 outline-none placeholder:text-gray-300"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-2" style={{ scrollbarWidth: "thin" }}>
            {filtered.map(item => {
              const sc = statusConfig[item.status];
              return (
                <button
                  key={item.id}
                  onClick={() => setSelected(item)}
                  className={`w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-50 ${selected?.id === item.id ? "bg-indigo-50" : ""}`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-semibold text-gray-900">{item.candidateName}</span>
                    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border ${sc.color}`}>
                      {sc.icon}{sc.label}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400">{item.jobTitle}</div>
                  <div className="text-xs text-gray-300 mt-0.5">{item.submittedAt}</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Panel: Detail */}
        <div className="flex-1 overflow-y-auto bg-gray-50/30 p-6" style={{ scrollbarWidth: "thin" }}>
          {selected ? (
            <div className="max-w-3xl mx-auto space-y-5">
              {/* Header */}
              <div className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-400 flex items-center justify-center text-white text-lg font-bold">
                      {selected.candidateName.slice(0, 1)}
                    </div>
                    <div>
                      <h2 className="text-base font-bold text-gray-900">{selected.candidateName}</h2>
                      <p className="text-sm text-gray-500">{selected.jobTitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {selected.riskLevel && (
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${riskConfig[selected.riskLevel].color}`}>
                        {riskConfig[selected.riskLevel].label}
                      </span>
                    )}
                    <span className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border font-medium ${statusConfig[selected.status].color}`}>
                      {statusConfig[selected.status].icon}
                      {statusConfig[selected.status].label}
                    </span>
                  </div>
                </div>
              </div>

              {selected.status === "running" ? (
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                  <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mx-auto mb-3" />
                  <p className="text-sm font-semibold text-gray-900 mb-1">AI 正在进行背景调查</p>
                  <p className="text-xs text-gray-400">正在验证学历信息、工作经历，并搜寻前司联系人，预计需要 3–5 分钟</p>
                  <div className="mt-4 space-y-2 text-left max-w-xs mx-auto">
                    {["正在查询学历认证数据库...", "正在匹配工作经历信息...", "正在搜寻前司背调联系人..."].map((step, i) => (
                      <div key={i} className="flex items-center gap-2.5">
                        <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin shrink-0" />
                        <span className="text-xs text-gray-500">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <>
                  {/* Education Verification */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <GraduationCap className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm font-semibold text-gray-900">学历验证</span>
                      {selected.educationVerified !== undefined && (
                        selected.educationVerified
                          ? <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />
                          : <XCircle className="w-4 h-4 text-red-500 ml-auto" />
                      )}
                    </div>
                    <div className="space-y-3">
                      {[
                        { school: "北京大学", degree: "硕士", major: "计算机科学", period: "2015–2018", verified: selected.educationVerified },
                        { school: "华中科技大学", degree: "学士", major: "软件工程", period: "2011–2015", verified: selected.educationVerified },
                      ].map((edu, i) => (
                        <div key={i} className={`flex items-center justify-between p-3 rounded-xl border ${edu.verified ? "bg-emerald-50 border-emerald-100" : "bg-red-50 border-red-100"}`}>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{edu.school}</p>
                            <p className="text-xs text-gray-500">{edu.major} · {edu.degree} · {edu.period}</p>
                          </div>
                          {edu.verified
                            ? <span className="text-xs text-emerald-600 font-medium flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />已核实</span>
                            : <span className="text-xs text-red-600 font-medium flex items-center gap-1"><XCircle className="w-3.5 h-3.5" />核实失败</span>
                          }
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Work History Verification */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Briefcase className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm font-semibold text-gray-900">工作经历核实</span>
                      {selected.workVerified !== undefined && (
                        selected.workVerified
                          ? <CheckCircle2 className="w-4 h-4 text-emerald-500 ml-auto" />
                          : <AlertTriangle className="w-4 h-4 text-amber-500 ml-auto" />
                      )}
                    </div>
                    <div className="space-y-3">
                      {[
                        { company: "字节跳动", title: "高级产品经理", period: "2021–2024", verified: selected.workVerified, note: selected.workVerified ? "在职时间与简历一致" : "在职时间存在出入，实际离职时间比简历早6个月" },
                        { company: "腾讯", title: "产品经理", period: "2018–2021", verified: true, note: "在职时间与简历一致" },
                      ].map((work, i) => (
                        <div key={i} className={`p-3 rounded-xl border ${work.verified ? "bg-gray-50 border-gray-100" : "bg-amber-50 border-amber-100"}`}>
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-sm font-semibold text-gray-900">{work.company} · {work.title}</p>
                            {work.verified
                              ? <span className="text-xs text-emerald-600 font-medium flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5" />核实通过</span>
                              : <span className="text-xs text-amber-600 font-medium flex items-center gap-1"><AlertTriangle className="w-3.5 h-3.5" />存在出入</span>
                            }
                          </div>
                          <p className="text-xs text-gray-400">{work.period}</p>
                          <p className={`text-xs mt-1 ${work.verified ? "text-gray-500" : "text-amber-700"}`}>{work.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Background Contacts */}
                  <div className="bg-white rounded-2xl border border-gray-100 p-5">
                    <div className="flex items-center gap-2 mb-4">
                      <Phone className="w-4 h-4 text-indigo-600" />
                      <span className="text-sm font-semibold text-gray-900">前司背调联系人</span>
                      <span className="text-xs text-gray-400 ml-auto">AI 辅助搜寻 · {selected.contactFound ?? 0} 位联系人</span>
                    </div>
                    {(selected.contactFound ?? 0) > 0 ? (
                      <div className="space-y-2">
                        {[
                          { name: "刘经理", title: "字节跳动 · 前直属上级", relation: "直属上级", available: true },
                          { name: "王总监", title: "字节跳动 · 产品总监", relation: "跨部门协作", available: true },
                          { name: "赵同事", title: "字节跳动 · 同组成员", relation: "同事", available: false },
                        ].slice(0, selected.contactFound).map((contact, i) => (
                          <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold">
                                {contact.name.slice(0, 1)}
                              </div>
                              <div>
                                <p className="text-sm font-semibold text-gray-900">{contact.name}</p>
                                <p className="text-xs text-gray-400">{contact.title} · {contact.relation}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => toast.info("联系功能即将上线")}
                              className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-colors ${contact.available ? "bg-indigo-50 text-indigo-600 hover:bg-indigo-100" : "bg-gray-100 text-gray-400 cursor-not-allowed"}`}
                            >
                              {contact.available ? "联系" : "不可用"}
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-6 text-gray-300">
                        <User className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-xs">未找到可用的背调联系人</p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Button
                      className="bg-indigo-600 text-white"
                      onClick={() => toast.success("背调报告已导出")}
                    >
                      <FileText className="w-4 h-4 mr-1.5" />导出背调报告
                    </Button>
                    <Button variant="outline" className="border-gray-200"
                      onClick={() => toast.info("功能即将上线")}>
                      <ExternalLink className="w-4 h-4 mr-1.5" />查看候选人画像
                    </Button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-300">
              <div className="text-center">
                <ShieldCheck className="w-12 h-12 mx-auto mb-3" />
                <p className="text-sm">选择左侧候选人查看背调详情</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
