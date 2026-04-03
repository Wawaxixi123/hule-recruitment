/**
 * BackgroundCheckPage - 背景调查模块
 * 学历验证支持方案A（学信网在线验证码）和方案B（PDF报告OCR解析）
 */
import { useState, useRef, useEffect } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ShieldCheck, Search, CheckCircle2, AlertTriangle, XCircle,
  User, GraduationCap, Briefcase, Phone, Loader2, Plus,
  Clock, FileText, ExternalLink, Upload, Link2, ChevronDown,
  ChevronUp, Sparkles, Copy, RotateCcw, Info, X
} from "lucide-react";
import { mockCandidates } from "@/lib/mockData";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────────────────
type CheckStatus = "pending" | "running" | "passed" | "warning" | "failed";
type EduVerifyMethod = "code" | "pdf";
type EduVerifyState = "idle" | "inputting" | "verifying" | "done_pass" | "done_warn" | "done_fail";

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

interface EduRecord {
  school: string;
  degree: string;
  major: string;
  period: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const mockChecks: CheckItem[] = [
  { id: "bc1", candidateName: "陈志远", jobTitle: "高级AI产品经理", submittedAt: "2026-04-03 10:30", status: "passed", educationVerified: true, workVerified: true, contactFound: 3, riskLevel: "low" },
  { id: "bc2", candidateName: "李雨桐", jobTitle: "算法工程师", submittedAt: "2026-04-03 09:15", status: "warning", educationVerified: true, workVerified: false, contactFound: 1, riskLevel: "medium" },
  { id: "bc3", candidateName: "王浩然", jobTitle: "前端工程师", submittedAt: "2026-04-02 16:45", status: "running", riskLevel: undefined },
  { id: "bc4", candidateName: "张晓梅", jobTitle: "数据分析师", submittedAt: "2026-04-02 14:20", status: "failed", educationVerified: false, workVerified: false, contactFound: 0, riskLevel: "high" },
];

// 候选人简历中的学历记录（用于AI比对）
const resumeEduRecords: Record<string, EduRecord[]> = {
  bc1: [
    { school: "北京大学", degree: "硕士", major: "计算机科学", period: "2015–2018" },
    { school: "华中科技大学", degree: "学士", major: "软件工程", period: "2011–2015" },
  ],
  bc2: [
    { school: "清华大学", degree: "硕士", major: "人工智能", period: "2016–2019" },
  ],
  bc4: [
    { school: "复旦大学", degree: "学士", major: "统计学", period: "2012–2016" },
  ],
};

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

// ─── Education Verification Component ────────────────────────────────────────
function EducationVerifyPanel({ candidate }: { candidate: CheckItem }) {
  const [method, setMethod] = useState<EduVerifyMethod>("code");
  const [verifyState, setVerifyState] = useState<EduVerifyState>("idle");
  const [codeInput, setCodeInput] = useState("");
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const [expanded, setExpanded] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resumeRecords = resumeEduRecords[candidate.id] || [];

  // 模拟AI验证流程
  const handleVerify = () => {
    if (method === "code" && !codeInput.trim()) {
      toast.error("请输入在线验证码或报告编号");
      return;
    }
    if (method === "pdf" && !uploadedFile) {
      toast.error("请先上传学信网PDF报告");
      return;
    }
    setVerifyState("verifying");
    setTimeout(() => {
      // 模拟不同候选人的结果
      if (candidate.id === "bc4") {
        setVerifyState("done_fail");
      } else if (candidate.id === "bc2") {
        setVerifyState("done_warn");
      } else {
        setVerifyState("done_pass");
      }
    }, 3000);
  };

  const handleReset = () => {
    setVerifyState("idle");
    setCodeInput("");
    setUploadedFile(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.name.endsWith(".pdf")) {
        toast.error("请上传 PDF 格式文件");
        return;
      }
      setUploadedFile(file.name);
      toast.success(`已选择文件：${file.name}`);
    }
  };

  // 学信网AI提取的结果（模拟）
  const xuexinResult = {
    name: candidate.candidateName,
    school: resumeRecords[0]?.school || "北京大学",
    degree: resumeRecords[0]?.degree || "硕士",
    major: resumeRecords[0]?.major || "计算机科学",
    period: resumeRecords[0]?.period || "2015–2018",
    conclusion: candidate.id === "bc4" ? "未查询到该学历信息" : "毕业",
  };

  // AI比对结果
  const compareResult = candidate.id === "bc4"
    ? { match: false, issues: ["学信网未查询到对应学历记录，疑似伪造"], suggestion: "建议直接淘汰或要求候选人提供原件核验" }
    : candidate.id === "bc2"
    ? { match: true, issues: ["专业名称与简历存在轻微差异：学信网显示「人工智能」，简历填写「AI方向」"], suggestion: "差异较小，可接受，建议面试时确认" }
    : { match: true, issues: [], suggestion: "学历信息与简历完全一致，核验通过" };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <button
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-indigo-600" />
          <span className="text-sm font-semibold text-gray-900">学历验证</span>
          <span className="text-xs text-gray-400">· 学信网联动</span>
          {verifyState === "done_pass" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          {verifyState === "done_warn" && <AlertTriangle className="w-4 h-4 text-amber-500" />}
          {verifyState === "done_fail" && <XCircle className="w-4 h-4 text-red-500" />}
          {verifyState === "verifying" && <Loader2 className="w-4 h-4 text-indigo-500 animate-spin" />}
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>

      {expanded && (
        <div className="px-5 pb-5 space-y-4 border-t border-gray-50">

          {/* Resume Records */}
          <div className="pt-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">简历中的学历信息</p>
            <div className="space-y-2">
              {resumeRecords.length > 0 ? resumeRecords.map((r, i) => (
                <div key={i} className="flex items-center gap-3 bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                  <div className="w-7 h-7 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-700 text-xs font-bold shrink-0">
                    {r.degree.slice(0, 1)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900">{r.school}</p>
                    <p className="text-xs text-gray-400">{r.major} · {r.degree} · {r.period}</p>
                  </div>
                  {verifyState === "idle" && (
                    <span className="text-xs text-gray-300 shrink-0">待验证</span>
                  )}
                  {verifyState === "verifying" && (
                    <Loader2 className="w-3.5 h-3.5 text-indigo-400 animate-spin shrink-0" />
                  )}
                  {(verifyState === "done_pass") && (
                    <span className="text-xs text-emerald-600 font-medium flex items-center gap-1 shrink-0"><CheckCircle2 className="w-3.5 h-3.5" />已核实</span>
                  )}
                  {(verifyState === "done_warn") && (
                    <span className="text-xs text-amber-600 font-medium flex items-center gap-1 shrink-0"><AlertTriangle className="w-3.5 h-3.5" />轻微差异</span>
                  )}
                  {(verifyState === "done_fail") && (
                    <span className="text-xs text-red-600 font-medium flex items-center gap-1 shrink-0"><XCircle className="w-3.5 h-3.5" />核实失败</span>
                  )}
                </div>
              )) : (
                <div className="text-xs text-gray-300 py-3 text-center">简历中暂无学历记录</div>
              )}
            </div>
          </div>

          {/* Verification Method Selector */}
          {verifyState === "idle" && (
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">选择验证方式</p>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <button
                  onClick={() => setMethod("code")}
                  className={`p-3 rounded-xl border text-left transition-all ${method === "code" ? "bg-indigo-50 border-indigo-300" : "bg-gray-50 border-gray-200 hover:border-indigo-200"}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Link2 className={`w-4 h-4 ${method === "code" ? "text-indigo-600" : "text-gray-400"}`} />
                    <span className={`text-xs font-semibold ${method === "code" ? "text-indigo-700" : "text-gray-700"}`}>方案 A · 在线验证码</span>
                    <span className="text-xs bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-full ml-auto">推荐</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">输入《教育部学历证书电子注册备案表》上的在线验证码或报告编号，AI 自动访问学信网获取结果</p>
                </button>
                <button
                  onClick={() => setMethod("pdf")}
                  className={`p-3 rounded-xl border text-left transition-all ${method === "pdf" ? "bg-violet-50 border-violet-300" : "bg-gray-50 border-gray-200 hover:border-violet-200"}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Upload className={`w-4 h-4 ${method === "pdf" ? "text-violet-600" : "text-gray-400"}`} />
                    <span className={`text-xs font-semibold ${method === "pdf" ? "text-violet-700" : "text-gray-700"}`}>方案 B · PDF 报告</span>
                    <span className="text-xs bg-violet-100 text-violet-700 px-1.5 py-0.5 rounded-full ml-auto">快速上线</span>
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">上传候选人从学信网下载的 PDF 验证报告，AI OCR 解析后与简历自动比对</p>
                </button>
              </div>

              {/* Input Area */}
              {method === "code" ? (
                <div className="space-y-3">
                  <div className="bg-amber-50 border border-amber-100 rounded-xl px-3 py-2.5 flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-amber-700 leading-relaxed">
                      请告知候选人登录 <span className="font-semibold">学信网（xuexin.chsi.com.cn）</span> 下载《教育部学历证书电子注册备案表》，在报告右上角可找到「在线验证码」（24位字母数字）或「报告编号」。
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-700 mb-1.5 block">在线验证码 / 报告编号</label>
                    <div className="flex gap-2">
                      <input
                        value={codeInput}
                        onChange={e => setCodeInput(e.target.value.toUpperCase())}
                        placeholder="例：ABCD1234EFGH5678IJKL9012"
                        maxLength={32}
                        className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-900 outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-50 placeholder:text-gray-300 font-mono transition-all"
                      />
                      <button
                        onClick={() => { navigator.clipboard.readText().then(t => setCodeInput(t)).catch(() => toast.info("请手动粘贴验证码")); }}
                        className="w-9 h-9 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 transition-colors shrink-0"
                        title="粘贴"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="text-xs text-gray-300 mt-1">输入后 AI 将模拟访问学信网在线验证页面，提取验证结果</p>
                  </div>
                  <Button className="bg-indigo-600 text-white w-full" onClick={handleVerify}>
                    <Sparkles className="w-4 h-4 mr-1.5" />开始 AI 验证
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="bg-violet-50 border border-violet-100 rounded-xl px-3 py-2.5 flex items-start gap-2">
                    <Info className="w-3.5 h-3.5 text-violet-500 shrink-0 mt-0.5" />
                    <p className="text-xs text-violet-700 leading-relaxed">
                      请告知候选人登录学信网，在「学历查询」中下载 PDF 格式的《教育部学历证书电子注册备案表》，上传后 AI 将进行 OCR 解析并与简历自动比对。
                    </p>
                  </div>
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleFileChange}
                    />
                    {uploadedFile ? (
                      <div className="flex items-center gap-3 bg-violet-50 border border-violet-200 rounded-xl px-3 py-3">
                        <FileText className="w-5 h-5 text-violet-600 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">{uploadedFile}</p>
                          <p className="text-xs text-gray-400">PDF 已就绪，点击开始解析</p>
                        </div>
                        <button onClick={() => setUploadedFile(null)} className="text-gray-300 hover:text-red-500 transition-colors">
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full border-2 border-dashed border-violet-200 hover:border-violet-400 rounded-xl py-6 flex flex-col items-center gap-2 text-violet-400 hover:text-violet-600 transition-all bg-violet-50/50"
                      >
                        <Upload className="w-6 h-6" />
                        <span className="text-sm font-medium">点击上传学信网 PDF 报告</span>
                        <span className="text-xs text-gray-300">仅支持 .pdf 格式</span>
                      </button>
                    )}
                  </div>
                  <Button
                    className="bg-violet-600 hover:bg-violet-700 text-white w-full"
                    onClick={handleVerify}
                    disabled={!uploadedFile}
                  >
                    <Sparkles className="w-4 h-4 mr-1.5" />AI OCR 解析并比对
                  </Button>
                </div>
              )}
            </div>
          )}

          {/* Verifying State */}
          {verifyState === "verifying" && (
            <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-4">
                <Loader2 className="w-5 h-5 text-indigo-600 animate-spin shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-indigo-900">
                    {method === "code" ? "AI 正在访问学信网验证页面..." : "AI 正在 OCR 解析 PDF 报告..."}
                  </p>
                  <p className="text-xs text-indigo-500 mt-0.5">预计需要 10–30 秒</p>
                </div>
              </div>
              <div className="space-y-2.5">
                {(method === "code" ? [
                  "正在模拟访问学信网在线验证页面...",
                  "正在输入验证码并获取网页结果...",
                  "AI 提取姓名、学校、层次、专业、毕业结论...",
                  "正在与简历信息进行 1:1 自动比对...",
                ] : [
                  "正在解析 PDF 文件结构...",
                  "AI OCR 识别关键字段（姓名、学校、层次、专业）...",
                  "提取毕业结论与在校时间...",
                  "正在与简历信息进行 1:1 自动比对...",
                ]).map((step, i) => (
                  <div key={i} className="flex items-center gap-2.5">
                    <Loader2 className="w-3 h-3 text-indigo-400 animate-spin shrink-0" />
                    <span className="text-xs text-indigo-600">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Result: Pass */}
          {verifyState === "done_pass" && (
            <div className="space-y-3">
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                  <span className="text-sm font-bold text-emerald-800">学历核验通过</span>
                  <span className="text-xs text-emerald-600 ml-auto">
                    {method === "code" ? "学信网在线验证" : "PDF OCR 解析"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { label: "姓名", resume: candidate.candidateName, xuexin: xuexinResult.name, match: true },
                    { label: "学校", resume: xuexinResult.school, xuexin: xuexinResult.school, match: true },
                    { label: "学历层次", resume: xuexinResult.degree, xuexin: xuexinResult.degree, match: true },
                    { label: "专业", resume: xuexinResult.major, xuexin: xuexinResult.major, match: true },
                    { label: "在校时间", resume: xuexinResult.period, xuexin: xuexinResult.period, match: true },
                    { label: "毕业结论", resume: "毕业", xuexin: "毕业", match: true },
                  ].map((row, i) => (
                    <div key={i} className="bg-white rounded-lg p-2.5 border border-emerald-100">
                      <p className="text-xs text-gray-400 mb-1">{row.label}</p>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-medium text-gray-700 truncate">{row.resume}</span>
                        <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-emerald-700 bg-emerald-100 rounded-lg px-3 py-2">
                  <span className="font-semibold">AI 结论：</span>{compareResult.suggestion}
                </p>
              </div>
              <button onClick={handleReset} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                <RotateCcw className="w-3.5 h-3.5" />重新验证
              </button>
            </div>
          )}

          {/* Result: Warning */}
          {verifyState === "done_warn" && (
            <div className="space-y-3">
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                  <span className="text-sm font-bold text-amber-800">学历核验存在差异</span>
                  <span className="text-xs text-amber-600 ml-auto">
                    {method === "code" ? "学信网在线验证" : "PDF OCR 解析"}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[
                    { label: "姓名", resume: candidate.candidateName, xuexin: candidate.candidateName, match: true },
                    { label: "学校", resume: "清华大学", xuexin: "清华大学", match: true },
                    { label: "学历层次", resume: "硕士", xuexin: "硕士", match: true },
                    { label: "专业", resume: "AI方向", xuexin: "人工智能", match: false },
                    { label: "在校时间", resume: "2016–2019", xuexin: "2016–2019", match: true },
                    { label: "毕业结论", resume: "毕业", xuexin: "毕业", match: true },
                  ].map((row, i) => (
                    <div key={i} className={`rounded-lg p-2.5 border ${row.match ? "bg-white border-gray-100" : "bg-amber-100 border-amber-200"}`}>
                      <p className="text-xs text-gray-400 mb-1">{row.label}</p>
                      <div className="flex items-center justify-between gap-1">
                        <div className="min-w-0">
                          <span className="text-xs font-medium text-gray-700 block truncate">简历：{row.resume}</span>
                          {!row.match && <span className="text-xs text-amber-700 block truncate">学信网：{row.xuexin}</span>}
                        </div>
                        {row.match
                          ? <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
                          : <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
                        }
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  {compareResult.issues.map((issue, i) => (
                    <p key={i} className="text-xs text-amber-700 bg-amber-100 rounded-lg px-3 py-2">
                      <span className="font-semibold">⚠ 差异：</span>{issue}
                    </p>
                  ))}
                  <p className="text-xs text-gray-600 bg-white rounded-lg px-3 py-2 border border-amber-100">
                    <span className="font-semibold">AI 建议：</span>{compareResult.suggestion}
                  </p>
                </div>
              </div>
              <button onClick={handleReset} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                <RotateCcw className="w-3.5 h-3.5" />重新验证
              </button>
            </div>
          )}

          {/* Result: Fail */}
          {verifyState === "done_fail" && (
            <div className="space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3">
                  <XCircle className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-bold text-red-800">学历核验异常</span>
                  <span className="text-xs text-red-500 ml-auto">
                    {method === "code" ? "学信网在线验证" : "PDF OCR 解析"}
                  </span>
                </div>
                <div className="bg-red-100 rounded-lg px-3 py-3 mb-3">
                  <p className="text-xs text-red-700 font-semibold mb-1">学信网返回结果</p>
                  <p className="text-xs text-red-600">未查询到与该验证码/报告对应的学历信息。可能原因：验证码错误、报告已过期或学历信息不存在于教育部数据库。</p>
                </div>
                <div className="space-y-1.5">
                  {compareResult.issues.map((issue, i) => (
                    <p key={i} className="text-xs text-red-700 bg-red-100 rounded-lg px-3 py-2">
                      <span className="font-semibold">✗ 异常：</span>{issue}
                    </p>
                  ))}
                  <p className="text-xs text-gray-600 bg-white rounded-lg px-3 py-2 border border-red-100">
                    <span className="font-semibold">AI 建议：</span>{compareResult.suggestion}
                  </p>
                </div>
              </div>
              <button onClick={handleReset} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
                <RotateCcw className="w-3.5 h-3.5" />重新验证
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Initiate Check Modal ─────────────────────────────────────────────────────
function InitiateCheckModal({ open, onClose, preselectedIds }: {
  open: boolean;
  onClose: () => void;
  preselectedIds: string[];
}) {
  const [selCandidates, setSelCandidates] = useState<string[]>([]);
  const [checkItems, setCheckItems] = useState({ education: true, work: true, contact: false });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (open) setSelCandidates(preselectedIds);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const toggleC = (id: string) =>
    setSelCandidates(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const handleSubmit = async () => {
    if (selCandidates.length === 0) { toast.error("请至少选择一位候选人"); return; }
    if (!checkItems.education && !checkItems.work && !checkItems.contact) { toast.error("请至少选择一项调查内容"); return; }
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 1200));
    setSubmitting(false);
    toast.success(`已为 ${selCandidates.length} 位候选人发起背景调查`);
    onClose();
  };

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-bold text-gray-900">发起背景调查</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">选择候选人 <span className="text-red-500">*</span></p>
            <div className="border border-gray-200 rounded-xl overflow-hidden max-h-48 overflow-y-auto">
              {mockCandidates.slice(0, 8).map(c => (
                <label key={c.id} className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-gray-50 border-b border-gray-50 last:border-0 ${selCandidates.includes(c.id) ? "bg-indigo-50" : ""}` }>
                  <Checkbox checked={selCandidates.includes(c.id)} onCheckedChange={() => toggleC(c.id)} />
                  <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-100 to-cyan-100 flex items-center justify-center shrink-0">
                    <span className="text-xs font-semibold text-indigo-700">{c.name.slice(0, 1)}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{c.name}</p>
                    <p className="text-xs text-gray-400 truncate">{c.currentTitle} · {c.currentCompany}</p>
                  </div>
                </label>
              ))}
            </div>
            {selCandidates.length > 0 && <p className="text-xs text-indigo-600 mt-1.5">已选 {selCandidates.length} 位候选人</p>}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3">调查项目 <span className="text-red-500">*</span></p>
            <div className="space-y-2.5">
              {([
                { key: "education" as const, label: "学历验证", desc: "学信网在线验证码 / PDF OCR 解析，1:1 字段比对" },
                { key: "work" as const, label: "工作经历核实", desc: "核实任职公司、职位、在职时间是否与简历一致" },
                { key: "contact" as const, label: "前司背调联系人", desc: "AI 搜寻候选人前公司 HR 或直属上级联系方式" },
              ]).map(item => (
                <label key={item.key} className="flex items-start gap-3 cursor-pointer">
                  <Checkbox checked={checkItems[item.key]} onCheckedChange={(v: boolean | "indeterminate") => setCheckItems(p => ({ ...p, [item.key]: !!v }))} className="mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-gray-800">{item.label}</p>
                    <p className="text-xs text-gray-400">{item.desc}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
          <Button variant="outline" size="sm" onClick={onClose} className="border-gray-200">取消</Button>
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleSubmit} disabled={submitting}>
            {submitting ? <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />发起中...</> : <><ShieldCheck className="w-3.5 h-3.5 mr-1.5" />确认发起</>}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function BackgroundCheckPage() {
  const [selected, setSelected] = useState<CheckItem | null>(mockChecks[0]);
  const [searchQuery, setSearchQuery] = useState("");
  const [initiateOpen, setInitiateOpen] = useState(false);
  const [preselectedIds, setPreselectedIds] = useState<string[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cid = params.get("candidate");
    const cids = params.get("candidates");
    if (cid) { setPreselectedIds([cid]); setInitiateOpen(true); }
    else if (cids) { setPreselectedIds(cids.split(",")); setInitiateOpen(true); }
  }, []);

  const filtered = mockChecks.filter(c =>
    !searchQuery || c.candidateName.includes(searchQuery) || c.jobTitle.includes(searchQuery)
  );

  return (
    <AppLayout title="背景调查" breadcrumb={[{ label: "背景调查" }]}>
      <div className="flex h-full" style={{ height: "calc(100vh - 56px)" }}>
        {/* Left Panel */}
        <div className="w-80 border-r border-gray-100 bg-white flex flex-col shrink-0">
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-900">调查列表</h2>
              <Button size="sm" className="bg-indigo-600 text-white h-7 text-xs px-2.5"
                onClick={() => { setPreselectedIds([]); setInitiateOpen(true); }}>
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

        {/* Right Panel */}
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
                  {/* Education Verification — Full Interactive Flow */}
                  <EducationVerifyPanel candidate={selected} />

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
                    <Button className="bg-indigo-600 text-white" onClick={() => toast.success("背调报告已导出")}>
                      <FileText className="w-4 h-4 mr-1.5" />导出背调报告
                    </Button>
                    <Button variant="outline" className="border-gray-200" onClick={() => toast.info("功能即将上线")}>
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
      <InitiateCheckModal
        open={initiateOpen}
        onClose={() => setInitiateOpen(false)}
        preselectedIds={preselectedIds}
      />
    </AppLayout>
  );
}
