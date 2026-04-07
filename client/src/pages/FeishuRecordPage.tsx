/**
 * FeishuRecordPage - 飞书面试录制独立设置页
 * 布局参考：视频录制（配置页面）.webp / 视频录制（已配置页面）.webp
 * 左侧：飞书配置与授权（Step1 + Step2）
 * 右侧：创建面试会议
 * 下方：会议与录制列表
 *
 * 通过 Context 共享飞书配置状态，供面试列表页读取
 */
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import {
  CheckCircle2, AlertCircle, ExternalLink, RefreshCw,
  Video, Settings, Edit3, User, Calendar, Clock, X, Plus
} from "lucide-react";
import { toast } from "sonner";
import { useFeishu } from "@/contexts/FeishuContext";

const OAUTH_URL = "https://interview.10m.com.cn/api/integrations/feishu/oauth/callback";

export default function FeishuRecordPage() {
  const { config, setConfig } = useFeishu();

  const isConfigured = !!config;

  // 配置表单状态
  const [editMode, setEditMode] = useState(!isConfigured);
  const [appId, setAppId] = useState(config?.appId ?? "");
  const [appSecret, setAppSecret] = useState(config?.appSecret ?? "");
  const [saving, setSaving] = useState(false);
  const [authorizing, setAuthorizing] = useState(false);

  // 会议创建表单
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingJob, setMeetingJob] = useState("");
  const [meetingCandidate, setMeetingCandidate] = useState("");
  const [meetingEmail, setMeetingEmail] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingDuration, setMeetingDuration] = useState("60");
  const [creating, setCreating] = useState(false);

  const handleSave = async () => {
    if (!appId.trim()) { toast.error("请填写 App ID"); return; }
    if (!appSecret.trim()) { toast.error("请填写 App Secret"); return; }
    setSaving(true);
    await new Promise(r => setTimeout(r, 1200));
    setSaving(false);
    setConfig({ appId, appSecret, oauthUrl: OAUTH_URL, authorized: config?.authorized ?? false });
    setEditMode(false);
    toast.success("飞书应用配置已保存");
  };

  const handleAuthorize = async () => {
    if (!isConfigured && !appId) { toast.error("请先保存飞书应用配置"); return; }
    setAuthorizing(true);
    await new Promise(r => setTimeout(r, 1800));
    setAuthorizing(false);
    setConfig({ ...(config ?? { appId, appSecret, oauthUrl: OAUTH_URL }), authorized: true });
    toast.success("飞书账号授权成功！");
  };

  const handleCreateMeeting = async () => {
    if (!config?.authorized) { toast.error("请先授权飞书账号"); return; }
    if (!meetingTitle.trim()) { toast.error("请填写会议标题"); return; }
    if (!meetingDate) { toast.error("请选择面试时间"); return; }
    setCreating(true);
    await new Promise(r => setTimeout(r, 1500));
    setCreating(false);
    toast.success("飞书会议已创建，邀请链接已发送给候选人");
    setMeetingTitle(""); setMeetingJob(""); setMeetingCandidate(""); setMeetingEmail(""); setMeetingDate("");
  };

  return (
    <AppLayout breadcrumb={[{ label: "面试管理" }, { label: "飞书面试录制" }]}>
      <div className="p-6 space-y-6 max-w-[1200px]">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">飞书面试录制</h1>
            <p className="text-sm text-gray-500 mt-0.5">
              创建飞书会议，会后录制自动同步到 OSS，再一键发起视频分析
            </p>
          </div>
          <button
            onClick={() => toast.info("正在同步最新录制...")}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />自动同步
          </button>
        </div>

        {/* Main: Config + Create Meeting */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* ─── 左侧：飞书配置与授权 ─── */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-5">
            <div>
              <h2 className="text-sm font-bold text-gray-900 mb-1">飞书配置与授权</h2>
              <p className="text-xs text-gray-500 leading-relaxed">
                先配置你自己的飞书应用参数，再授权你自己的飞书账号，后面创建会议和回收录制视频都会走你已经配置。
              </p>
            </div>

            {/* Step 1 */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">1</div>
                  <span className="text-sm font-semibold text-gray-800">配置飞书应用</span>
                  {isConfigured && !editMode && (
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700">
                      <CheckCircle2 className="w-2.5 h-2.5" />已配置
                    </span>
                  )}
                </div>
                {isConfigured && !editMode && (
                  <button onClick={() => setEditMode(true)} className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 font-medium">
                    <Edit3 className="w-3 h-3" />修改配置
                  </button>
                )}
              </div>

              {isConfigured && !editMode ? (
                <div className="space-y-1.5 text-xs text-gray-600">
                  <div><span className="text-gray-400">App ID：</span><span className="font-mono">{config.appId}</span></div>
                  <div><span className="text-gray-400">OAuth 回调地址：</span><span className="font-mono text-gray-500 break-all">{OAUTH_URL}</span></div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-gray-500">这里填的是你自己飞书开放平台应用参数，不是别人的，也不是系统公用测试账号。</p>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">App ID</label>
                    <input className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="cli_xxxxxxxxxxxxxxxx" value={appId} onChange={e => setAppId(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">App Secret</label>
                    <input type="password" className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="留空则保持原值" value={appSecret} onChange={e => setAppSecret(e.target.value)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">OAuth 回调地址</label>
                    <div className="w-full px-3 py-2 rounded-lg border border-gray-100 bg-gray-50 text-xs font-mono text-gray-500 break-all select-all">{OAUTH_URL}</div>
                    <p className="text-xs text-gray-400 mt-1">将此地址填到飞书开放平台，保存后当用户授权的飞书账号会失效一次，需要重新授权。</p>
                  </div>
                  {/* 权限指引 */}
                  <div className="bg-white rounded-lg border border-gray-100 p-3">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-gray-700">飞书开放平台权限指引</span>
                      <a href="https://open.feishu.cn/document/home/index" target="_blank" rel="noreferrer" className="flex items-center gap-0.5 text-xs text-indigo-600 hover:underline">
                        查看飞书配置指引 <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    <p className="text-xs text-gray-500 mb-1.5">请在飞书开放平台应用中申请这些权限：</p>
                    <ol className="text-xs text-gray-600 space-y-1 list-decimal list-inside">
                      <li>创建会议：<code className="bg-gray-100 px-1 rounded text-[11px]">vc:reserve</code></li>
                      <li>查询会议：<code className="bg-gray-100 px-1 rounded text-[11px]">vc.meeting.search:read</code></li>
                      <li>读取录制：<code className="bg-gray-100 px-1 rounded text-[11px]">vc:record.readonly</code></li>
                      <li>导出纪要媒体：<code className="bg-gray-100 px-1 rounded text-[11px]">minutes.media:export</code></li>
                    </ol>
                    <p className="text-xs text-gray-400 mt-2">这些权限系统会帮您默认保存，不需要在这里填写 scope。</p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white text-sm font-medium rounded-lg transition-colors">
                      {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Settings className="w-3.5 h-3.5" />}
                      保存飞书配置
                    </button>
                    {isConfigured && (
                      <button onClick={() => setEditMode(false)} className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg hover:bg-gray-50 transition-colors">取消</button>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Step 2 */}
            <div className="rounded-xl border border-gray-100 bg-gray-50/50 p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[10px] font-bold flex items-center justify-center">2</div>
                <span className="text-sm font-semibold text-gray-800">授权飞书账号</span>
                {config?.authorized && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700">
                    <CheckCircle2 className="w-2.5 h-2.5" />已授权
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">
                飞书应用参数保存后，你还需要授权你自己的飞书账号，之后才能创建会议，并在会后自动拉取录制视频。
              </p>
              <button onClick={handleAuthorize} disabled={authorizing || (!isConfigured && !appId)} className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors">
                {authorizing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Video className="w-3.5 h-3.5" />}
                {config?.authorized ? "重新授权飞书账号" : "授权飞书账号"}
              </button>
            </div>
          </div>

          {/* ─── 右侧：创建面试会议 ─── */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5">
            <h2 className="text-sm font-bold text-gray-900 mb-1">创建面试会议</h2>
            <p className="text-xs text-gray-500 leading-relaxed mb-4">
              这里只创建会议并拿到入会链接，录制视频会在会后由系统自动同步回来，不需要你手动上传。
            </p>

            {!config?.authorized && (
              <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4">
                <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-amber-700 leading-relaxed">
                  当前还不能创建会议，请先在左侧授权你自己的飞书账号。
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "会议标题，如：后端开发一面", placeholder: "如：后端开发一面", value: meetingTitle, onChange: setMeetingTitle, type: "text" },
                { label: "岗位名称，如：后端工程师", placeholder: "如：后端工程师", value: meetingJob, onChange: setMeetingJob, type: "text" },
                { label: "候选人姓名（可选）", placeholder: "候选人姓名", value: meetingCandidate, onChange: setMeetingCandidate, type: "text" },
                { label: "候选人邮箱（可选）", placeholder: "candidate@example.com", value: meetingEmail, onChange: setMeetingEmail, type: "email" },
              ].map((f, i) => (
                <div key={i}>
                  <label className="block text-xs font-medium text-gray-700 mb-1.5">{f.label}</label>
                  <input type={f.type} className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:bg-gray-50 disabled:text-gray-400" placeholder={f.placeholder} value={f.value} onChange={e => f.onChange(e.target.value)} disabled={!config?.authorized} />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">面试时间</label>
                <input type="datetime-local" className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:bg-gray-50 disabled:text-gray-400" value={meetingDate} onChange={e => setMeetingDate(e.target.value)} disabled={!config?.authorized} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">时长（分钟）</label>
                <input type="number" className="w-full h-9 px-3 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300 disabled:bg-gray-50 disabled:text-gray-400" value={meetingDuration} onChange={e => setMeetingDuration(e.target.value)} disabled={!config?.authorized} />
              </div>
            </div>

            <button onClick={handleCreateMeeting} disabled={!config?.authorized || creating} className="mt-4 flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-xl transition-colors">
              {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Video className="w-4 h-4" />}
              创建飞书会议
            </button>
          </div>
        </div>

        {/* ─── 会议与录制列表 ─── */}
        <div className="bg-white rounded-2xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-gray-900">会议与录制列表</h2>
              <p className="text-xs text-gray-400 mt-0.5">
                没开网站时视频也会照样同步，下次打开这里就能看到哪些已经同步、哪些还没分析、哪些需要重试。
              </p>
            </div>
            <button onClick={() => toast.success("已刷新")} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />刷新
            </button>
          </div>

          <div className="space-y-3">
            {MOCK_RECORDS.map(rec => (
              <div key={rec.id} className="flex items-start justify-between gap-4 p-4 bg-gray-50 rounded-xl">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                    <span className="text-sm font-semibold text-gray-900">{rec.title}</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-indigo-100 text-indigo-700">已分析</span>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-700">分析完成</span>
                  </div>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 text-xs text-gray-500">
                    <div className="flex items-center gap-1"><User className="w-3 h-3 text-gray-400" />候选人：{rec.candidateName}</div>
                    <div className="flex items-center gap-1"><Calendar className="w-3 h-3 text-gray-400" />岗位：{rec.jobTitle}</div>
                    <div className="flex items-center gap-1"><Clock className="w-3 h-3 text-gray-400" />会议时间：{rec.scheduledAt}</div>
                    <div className="flex items-center gap-1"><Clock className="w-3 h-3 text-gray-400" />时长：{rec.duration} 分钟</div>
                    <div>入会链接：{rec.joinUrl}</div>
                    <div>录制时长：{rec.recordDuration}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 flex-wrap justify-end">
                  <button onClick={() => toast.success("正在跳转 Horo AI 分析...")} className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-medium rounded-lg transition-colors">
                    <Video className="w-3 h-3" />查看分析
                  </button>
                  <button onClick={() => toast.info("视频链接已复制")} className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-medium rounded-lg transition-colors">
                    <ExternalLink className="w-3 h-3" />查看视频
                  </button>
                  <button onClick={() => toast.success("已删除")} className="flex items-center gap-1.5 px-3 py-1.5 border border-red-100 text-red-500 hover:bg-red-50 text-xs font-medium rounded-lg transition-colors">
                    <X className="w-3 h-3" />删除
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}

const MOCK_RECORDS = [
  { id: "r1", title: "测试", candidateName: "里斯", jobTitle: "测试", scheduledAt: "2026/04/03 19:24", duration: 60, joinUrl: "已生成", recordDuration: "0分34秒" },
  { id: "r2", title: "开发", candidateName: "张三", jobTitle: "开发", scheduledAt: "2026/04/03 19:04", duration: 60, joinUrl: "已生成", recordDuration: "1分39秒" },
];
