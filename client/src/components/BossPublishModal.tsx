/**
 * BossPublishModal - 一键发布职位到BOSS直聘
 * 参照BOSS直聘发布职位页面字段设计
 */
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, CheckCircle2, ExternalLink, Building2, MapPin,
  Briefcase, GraduationCap, Banknote, Tag, X, Plus, AlertCircle
} from "lucide-react";
import { toast } from "sonner";

interface BossPublishModalProps {
  open: boolean;
  onClose: () => void;
  jobTitle?: string;
  jobDescription?: string;
}

type PublishStep = "form" | "connecting" | "success";

const JOB_TYPES = ["社招全职", "应届校园招聘", "实习生招聘", "兼职招聘"];

const JOB_CATEGORIES = [
  "技术/研发", "产品", "设计", "运营", "市场/营销",
  "销售", "人力资源", "财务/法务", "行政/后勤", "其他"
];

const EXPERIENCE_OPTIONS = [
  "经验不限", "在校生/应届生", "1年以内", "1-3年", "3-5年", "5-10年", "10年以上"
];

const EDUCATION_OPTIONS = [
  "学历不限", "初中及以下", "中专/中技", "高中", "大专", "本科", "硕士", "博士"
];

const SALARY_MIN_OPTIONS = [
  "1k", "2k", "3k", "4k", "5k", "6k", "8k", "10k", "12k", "15k", "20k", "25k", "30k", "40k", "50k"
];
const SALARY_MAX_OPTIONS = [
  "2k", "3k", "4k", "5k", "6k", "8k", "10k", "12k", "15k", "20k", "25k", "30k", "40k", "50k", "80k", "100k"
];

export default function BossPublishModal({ open, onClose, jobTitle = "", jobDescription = "" }: BossPublishModalProps) {
  const [step, setStep] = useState<PublishStep>("form");
  const [publishProgress, setPublishProgress] = useState(0);
  const [progressText, setProgressText] = useState("");

  // Form state
  const [recruitType, setRecruitType] = useState("社招全职");
  const [title, setTitle] = useState(jobTitle);
  const [description, setDescription] = useState(jobDescription);
  const [category, setCategory] = useState("");
  const [experience, setExperience] = useState("");
  const [education, setEducation] = useState("");
  const [salaryMin, setSalaryMin] = useState("");
  const [salaryMax, setSalaryMax] = useState("");
  const [address, setAddress] = useState("深圳南山区南山科学园B2单元11栋1101");
  const [keywords, setKeywords] = useState<string[]>(["AI", "招聘", "产品经理"]);
  const [keywordInput, setKeywordInput] = useState("");
  const [activeDescTab, setActiveDescTab] = useState<"岗位职责" | "任职要求" | "岗位福利">("岗位职责");

  const descTabs = ["岗位职责", "任职要求", "岗位福利"] as const;

  const addKeyword = () => {
    const kw = keywordInput.trim();
    if (kw && !keywords.includes(kw) && keywords.length < 10) {
      setKeywords([...keywords, kw]);
      setKeywordInput("");
    }
  };

  const removeKeyword = (kw: string) => setKeywords(keywords.filter(k => k !== kw));

  const simulatePublish = async () => {
    setStep("connecting");
    const steps = [
      { pct: 15, text: "正在连接 BOSS 直聘 API..." },
      { pct: 35, text: "验证账号授权..." },
      { pct: 55, text: "上传职位信息..." },
      { pct: 75, text: "设置职位要求..." },
      { pct: 90, text: "提交审核..." },
      { pct: 100, text: "发布成功！" },
    ];
    for (const s of steps) {
      await new Promise(r => setTimeout(r, 600));
      setPublishProgress(s.pct);
      setProgressText(s.text);
    }
    await new Promise(r => setTimeout(r, 400));
    setStep("success");
  };

  const handleSubmit = () => {
    if (!title.trim()) { toast.error("请填写职位名称"); return; }
    if (!description.trim()) { toast.error("请填写职位描述"); return; }
    if (!category) { toast.error("请选择职位类型"); return; }
    if (!experience) { toast.error("请选择经验要求"); return; }
    if (!education) { toast.error("请选择学历要求"); return; }
    if (!salaryMin || !salaryMax) { toast.error("请选择薪资范围"); return; }
    simulatePublish();
  };

  const handleClose = () => {
    setStep("form");
    setPublishProgress(0);
    setProgressText("");
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-0">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-100 px-6 py-4">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2.5 text-base font-bold text-gray-900">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black" style={{ background: "#00C8A0" }}>
                B
              </div>
              发布职位到 BOSS 直聘
            </DialogTitle>
          </DialogHeader>
        </div>

        {step === "form" && (
          <div className="px-6 py-5 space-y-8">
            {/* Section 1: 职位基本信息 */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">1</div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">职位基本信息</h3>
                  <p className="text-xs text-gray-400 mt-0.5">职位发布成功后，招聘类型、职位名称、职位类型、工作城市，将无法修改</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* 公司 */}
                <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                  <Building2 className="w-4 h-4 text-gray-400 flex-shrink-0" />
                  <div>
                    <span className="text-xs text-gray-400 mr-2">公司</span>
                    <span className="text-sm text-gray-700 font-medium">葫乐科技·互联网 深圳葫乐科技有限公司</span>
                  </div>
                </div>

                {/* 招聘类型 */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium text-gray-700">招聘类型</Label>
                  <div className="flex gap-2 flex-wrap">
                    {JOB_TYPES.map(t => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setRecruitType(t)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
                          recruitType === t
                            ? "bg-indigo-600 text-white border-indigo-600"
                            : "bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 职位名称 */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">职位名称</Label>
                  <Input
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder='请填写职位名称，如"销售专员"'
                    className="h-10 border-gray-200 focus:border-indigo-400"
                  />
                </div>

                {/* 职位描述 */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">职位描述</Label>
                  {/* Tab switcher */}
                  <div className="flex gap-1 border-b border-gray-100 mb-2">
                    {descTabs.map(tab => (
                      <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveDescTab(tab)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-t-lg transition-all ${
                          activeDescTab === tab
                            ? "bg-indigo-50 text-indigo-700 border border-b-0 border-indigo-200"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        {tab}
                      </button>
                    ))}
                  </div>
                  <Textarea
                    value={description}
                    onChange={e => setDescription(e.target.value)}
                    placeholder={`请填写${activeDescTab}内容，请勿填写QQ、微信、电话等联系方式及特殊符号、性别歧视词，违反劳动法相关内容，否则有可能会导致您的账号被封禁`}
                    className="min-h-[140px] border-gray-200 focus:border-indigo-400 text-sm resize-none"
                  />
                  <div className="flex items-center justify-between">
                    <button
                      type="button"
                      className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                      onClick={() => toast.info("AI 正在优化职位描述...")}
                    >
                      <span className="w-4 h-4 rounded bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-[10px]">AI</span>
                      帮写
                    </button>
                    <span className="text-xs text-gray-400">{description.length} / 5000</span>
                  </div>
                </div>

                {/* 职位类型 */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700">职位类型</Label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="h-10 border-gray-200 focus:border-indigo-400">
                      <SelectValue placeholder="选择职位类型" />
                    </SelectTrigger>
                    <SelectContent>
                      {JOB_CATEGORIES.map(c => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Section 2: 职位要求 */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-6 h-6 rounded-full bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">2</div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-sm">职位要求</h3>
                  <p className="text-xs text-gray-400 mt-0.5">我们将通过以下条件，为您精确推荐合适的牛人，请尽量详细填写</p>
                </div>
              </div>

              <div className="space-y-5">
                {/* 经验 */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <Briefcase className="w-3.5 h-3.5 text-gray-400" />经验
                  </Label>
                  <Select value={experience} onValueChange={setExperience}>
                    <SelectTrigger className="h-10 border-gray-200 focus:border-indigo-400">
                      <SelectValue placeholder="请选择经验要求" />
                    </SelectTrigger>
                    <SelectContent>
                      {EXPERIENCE_OPTIONS.map(o => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 学历 */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-gray-400" />学历
                  </Label>
                  <Select value={education} onValueChange={setEducation}>
                    <SelectTrigger className="h-10 border-gray-200 focus:border-indigo-400">
                      <SelectValue placeholder="请选择最低学历" />
                    </SelectTrigger>
                    <SelectContent>
                      {EDUCATION_OPTIONS.map(o => (
                        <SelectItem key={o} value={o}>{o}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 薪资范围 */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <Banknote className="w-3.5 h-3.5 text-gray-400" />薪资范围
                  </Label>
                  <div className="flex items-center gap-2">
                    <Select value={salaryMin} onValueChange={setSalaryMin}>
                      <SelectTrigger className="h-10 border-gray-200 focus:border-indigo-400 flex-1">
                        <SelectValue placeholder="最低月薪" />
                      </SelectTrigger>
                      <SelectContent>
                        {SALARY_MIN_OPTIONS.map(o => (
                          <SelectItem key={o} value={o}>{o}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <span className="text-gray-400 text-sm">至</span>
                    <Select value={salaryMax} onValueChange={setSalaryMax}>
                      <SelectTrigger className="h-10 border-gray-200 focus:border-indigo-400 flex-1">
                        <SelectValue placeholder="最高月薪" />
                      </SelectTrigger>
                      <SelectContent>
                        {SALARY_MAX_OPTIONS.map(o => (
                          <SelectItem key={o} value={o}>{o}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  {salaryMin && salaryMax && (
                    <p className="text-xs text-indigo-600">
                      ✓ {salaryMin}元 ~ {salaryMax}元
                    </p>
                  )}
                </div>

                {/* 职位关键词 */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <Tag className="w-3.5 h-3.5 text-gray-400" />职位关键词
                    <span className="text-xs text-gray-400 font-normal">（最多10个）</span>
                  </Label>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    {keywords.map(kw => (
                      <Badge key={kw} variant="secondary" className="flex items-center gap-1 px-2 py-0.5 text-xs bg-indigo-50 text-indigo-700 border border-indigo-100">
                        {kw}
                        <button type="button" onClick={() => removeKeyword(kw)} className="hover:text-red-500 transition-colors">
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                    {keywords.length < 10 && (
                      <div className="flex items-center gap-1">
                        <Input
                          value={keywordInput}
                          onChange={e => setKeywordInput(e.target.value)}
                          onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addKeyword(); } }}
                          placeholder="添加关键词"
                          className="h-7 w-28 text-xs border-dashed border-gray-300 focus:border-indigo-400"
                        />
                        <button type="button" onClick={addKeyword} className="w-7 h-7 rounded-lg border border-dashed border-gray-300 flex items-center justify-center text-gray-400 hover:text-indigo-600 hover:border-indigo-300 transition-all">
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* 工作地址 */}
                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-gray-700 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />工作地址
                  </Label>
                  <Input
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    placeholder="请填写详细工作地址"
                    className="h-10 border-gray-200 focus:border-indigo-400"
                  />
                  <p className="text-xs text-gray-400">请填写真实有效地址，将发送到平台处理</p>
                </div>
              </div>
            </div>

            {/* Notice */}
            <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100">
              <AlertCircle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-amber-700">
                <p className="font-medium mb-0.5">发布须知</p>
                <p>简历将发送到绑定的企业邮箱。发布即表示您已阅读并遵守《招聘行为管理规范》。职位将在 BOSS 直聘平台审核后上线，通常需要 1-2 小时。</p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100">
              <Button variant="outline" onClick={handleClose} className="h-10">
                取消
              </Button>
              <Button
                onClick={handleSubmit}
                className="h-10 px-6 text-white font-semibold"
                style={{ background: "#00C8A0" }}
              >
                发布到 BOSS 直聘
              </Button>
            </div>
          </div>
        )}

        {step === "connecting" && (
          <div className="px-6 py-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white text-2xl font-black mb-6 shadow-lg" style={{ background: "#00C8A0" }}>
              B
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">正在发布到 BOSS 直聘</h3>
            <p className="text-sm text-gray-500 mb-8">{progressText}</p>

            {/* Progress bar */}
            <div className="w-full max-w-xs bg-gray-100 rounded-full h-2 mb-3">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{ width: `${publishProgress}%`, background: "#00C8A0" }}
              />
            </div>
            <p className="text-sm font-semibold" style={{ color: "#00C8A0" }}>{publishProgress}%</p>

            <div className="mt-8 space-y-2 w-full max-w-xs">
              {[
                { label: "职位名称", value: title },
                { label: "招聘类型", value: recruitType },
                { label: "薪资范围", value: salaryMin && salaryMax ? `${salaryMin} ~ ${salaryMax}` : "-" },
              ].map(item => (
                <div key={item.label} className="flex items-center justify-between text-xs">
                  <span className="text-gray-400">{item.label}</span>
                  <span className="text-gray-700 font-medium">{item.value || "-"}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {step === "success" && (
          <div className="px-6 py-16 flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-5">
              <CheckCircle2 className="w-9 h-9 text-emerald-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">发布成功！</h3>
            <p className="text-sm text-gray-500 mb-1">职位已提交至 BOSS 直聘，审核通常需要 1-2 小时</p>
            <p className="text-xs text-gray-400 mb-8">审核通过后，求职者即可在 BOSS 直聘上看到您的职位</p>

            <div className="w-full max-w-xs bg-gray-50 rounded-xl p-4 mb-8 text-left space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">职位名称</span>
                <span className="font-semibold text-gray-900">{title}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">发布平台</span>
                <span className="font-semibold" style={{ color: "#00C8A0" }}>BOSS 直聘</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">薪资范围</span>
                <span className="font-semibold text-gray-900">{salaryMin} ~ {salaryMax}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">状态</span>
                <span className="text-amber-600 font-medium">审核中</span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" onClick={handleClose} className="h-10">
                关闭
              </Button>
              <Button
                onClick={() => { toast.info("即将跳转到 BOSS 直聘后台..."); handleClose(); }}
                className="h-10 px-5 text-white font-medium flex items-center gap-1.5"
                style={{ background: "#00C8A0" }}
              >
                <ExternalLink className="w-3.5 h-3.5" />
                查看 BOSS 直聘后台
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
