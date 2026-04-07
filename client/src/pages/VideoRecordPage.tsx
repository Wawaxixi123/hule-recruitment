/**
 * VideoRecordPage - 面试录制（飞书视频会议）
 * 参考设计：视频录制（配置页面）.webp / 视频录制（已配置页面）.webp
 * 布局：左侧飞书配置与授权 + 右侧创建面试会议；下方会议与录制列表
 */
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { RefreshCw, Video, Trash2, ExternalLink, BarChart2, Plus, AlertTriangle, CheckCircle2, Settings } from "lucide-react";
import { toast } from "sonner";

interface Meeting {
  id: string;
  title: string;
  position: string;
  candidate: string;
  time: string;
  duration: string;
  recordDuration: string;
  joinLink: string;
  status: "analyzed" | "pending" | "no_record";
  analysisStatus: "done" | "processing" | "none";
}

const mockMeetings: Meeting[] = [
  {
    id: "1",
    title: "测试",
    position: "测试",
    candidate: "里斯",
    time: "2026/04/03 19:24",
    duration: "60 分钟",
    recordDuration: "0 分 34 秒",
    joinLink: "已生成",
    status: "analyzed",
    analysisStatus: "done",
  },
  {
    id: "2",
    title: "开发",
    position: "开发",
    candidate: "张三",
    time: "2026/04/03 19:04",
    duration: "60 分钟",
    recordDuration: "1 分 39 秒",
    joinLink: "已生成",
    status: "analyzed",
    analysisStatus: "done",
  },
];

export default function VideoRecordPage() {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [appId, setAppId] = useState("cli_a945cc4020221bcd");
  const [appSecret, setAppSecret] = useState("");
  const [saving, setSaving] = useState(false);
  const [authorizing, setAuthorizing] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Create meeting form
  const [meetingTitle, setMeetingTitle] = useState("");
  const [meetingPosition, setMeetingPosition] = useState("");
  const [meetingCandidate, setMeetingCandidate] = useState("");
  const [meetingEmail, setMeetingEmail] = useState("");
  const [meetingDate, setMeetingDate] = useState("");
  const [meetingDuration, setMeetingDuration] = useState("60");
  const [creating, setCreating] = useState(false);

  const oauthUrl = "https://interview.10m.com.cn/api/integrations/feishu/oauth/callback";

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appId) { toast.error("请填写 App ID"); return; }
    if (!appSecret) { toast.error("请填写 App Secret"); return; }
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setIsConfigured(true);
      toast.success("飞书配置保存成功");
    }, 1200);
  };

  const handleAuthorize = () => {
    setAuthorizing(true);
    setTimeout(() => {
      setAuthorizing(false);
      setIsAuthorized(true);
      toast.success("飞书账号授权成功！");
    }, 1800);
  };

  const handleCreateMeeting = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthorized) { toast.error("请先授权飞书账号"); return; }
    if (!meetingTitle) { toast.error("请填写会议标题"); return; }
    setCreating(true);
    setTimeout(() => {
      setCreating(false);
      toast.success("飞书面试会议创建成功！入会链接已生成");
      setMeetingTitle("");
      setMeetingPosition("");
      setMeetingCandidate("");
      setMeetingEmail("");
      setMeetingDate("");
    }, 1500);
  };

  const handleSync = () => {
    setSyncing(true);
    setTimeout(() => { setSyncing(false); toast.success("同步完成，已拉取最新录制视频"); }, 2000);
  };

  return (
    <AppLayout>
      <div className="p-6 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">面试录制</h1>
          <p className="text-sm text-gray-500 mt-0.5">创建飞书会议，会后录制自动同步到 OSS，再一键发起视频分析</p>
        </div>

        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Left: Feishu Config */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-semibold text-gray-900">飞书配置与授权</h2>
              {isConfigured && (
                <button onClick={handleSync} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-all"
                  style={{ borderColor: "#4F39F6", color: "#4F39F6", background: "#f5f3ff" }}>
                  <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
                  自动同步
                </button>
              )}
            </div>
            <p className="text-sm text-gray-500 mb-5">
              先配置你自己的飞书应用参数，再授权你自己的飞书账号，后面创建会议和回收录制视频会走你自己这套配置。
            </p>

            {/* Step 1 */}
            <div className="rounded-xl border border-gray-100 p-4 mb-4"
              style={{ background: "#fafafa" }}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                    style={{ background: isConfigured ? "#10b981" : "#4F39F6" }}>
                    {isConfigured ? "✓" : "1"}
                  </div>
                  <p className="text-sm font-semibold text-gray-800">第一步：配置飞书应用</p>
                </div>
                {isConfigured && (
                  <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                    style={{ background: "#dcfce7", color: "#16a34a" }}>已配置</span>
                )}
              </div>
              <p className="text-xs text-gray-500 mb-3">
                这里填的是你自己飞书开放平台应用参数，不是别人的，也不是系统公用测试账号。
              </p>

              {isConfigured ? (
                <div className="space-y-1.5 text-xs text-gray-600">
                  <p><span className="text-gray-400">App ID：</span>{appId}</p>
                  <p><span className="text-gray-400">回调地址：</span>{oauthUrl}</p>
                  <button
                    onClick={() => setIsConfigured(false)}
                    className="flex items-center gap-1.5 mt-2 text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                  >
                    <Settings className="w-3.5 h-3.5" />
                    修改配置
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSaveConfig} className="space-y-3">
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">App ID</label>
                    <input
                      type="text"
                      value={appId}
                      onChange={e => setAppId(e.target.value)}
                      placeholder="cli_xxxxxxxxxxxxxxxxx"
                      className="w-full h-9 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">App Secret</label>
                    <input
                      type="password"
                      value={appSecret}
                      onChange={e => setAppSecret(e.target.value)}
                      placeholder="留空则保持现有值"
                      className="w-full h-9 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 bg-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-500 mb-1 block">OAuth 回调地址</label>
                    <div className="h-9 px-3 rounded-xl border border-gray-100 bg-gray-50 flex items-center text-xs text-gray-500 select-all">
                      {oauthUrl}
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">
                      回调地址应当在本地环境生成，应有用户登录后才能修改，请把这个地址填到飞书开放平台，保存后，当用户授权飞书账号会失去一次，需要重新授权。
                    </p>
                  </div>

                  <div className="rounded-xl border p-3" style={{ background: "#f5f3ff", borderColor: "#ddd6fe" }}>
                    <p className="text-xs font-medium text-indigo-700 mb-2">飞书开放平台权限指引</p>
                    <a href="https://open.feishu.cn/document" target="_blank" rel="noreferrer"
                      className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700 mb-2">
                      查看飞书配置指引 <ExternalLink className="w-3 h-3" />
                    </a>
                    <p className="text-xs text-gray-600 mb-1">请在飞书开放平台应用后台申请这些权限：</p>
                    <ol className="text-xs text-gray-600 space-y-0.5 list-decimal list-inside">
                      <li>创建会议：<code className="bg-gray-100 px-1 rounded">vc:reserve</code></li>
                      <li>查询会议：<code className="bg-gray-100 px-1 rounded">vc.meeting.search:read</code></li>
                      <li>读取录制：<code className="bg-gray-100 px-1 rounded">vc:record.readonly</code></li>
                      <li>导出纪要：<code className="bg-gray-100 px-1 rounded">minutes.media:export</code></li>
                    </ol>
                    <p className="text-xs text-gray-400 mt-2">这些权限系统会自动帮你保存，你不需要在这里手填 scope。</p>
                  </div>

                  <div className="flex gap-2 pt-1">
                    <button type="submit" disabled={saving}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                      style={{ background: "#4F39F6" }}>
                      {saving ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                      保存飞书配置
                    </button>
                    <button type="button" onClick={() => { setAppId(""); setAppSecret(""); }}
                      className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 border border-gray-200 hover:bg-gray-50 transition-all">
                      取消
                    </button>
                  </div>
                </form>
              )}
            </div>

            {/* Step 2 */}
            <div className="rounded-xl border border-gray-100 p-4"
              style={{ background: "#fafafa" }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold text-white"
                  style={{ background: isAuthorized ? "#10b981" : isConfigured ? "#4F39F6" : "#d1d5db" }}>
                  {isAuthorized ? "✓" : "2"}
                </div>
                <p className="text-sm font-semibold text-gray-800">第二步：授权飞书账号</p>
              </div>
              <p className="text-xs text-gray-500 mb-3">
                飞书应用参数保存后，你还需要授权你自己的飞书账号，之后才能创建会议，并在会后自动拉取录制视频。
              </p>
              {isAuthorized ? (
                <div className="flex items-center gap-2 text-sm text-green-700">
                  <CheckCircle2 className="w-4 h-4" />
                  飞书账号已授权
                </div>
              ) : (
                <button
                  onClick={handleAuthorize}
                  disabled={!isConfigured || authorizing}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-white transition-all"
                  style={isConfigured ? { background: "#4F39F6", boxShadow: "0 4px 12px rgba(79,57,246,0.25)" } : { background: "#e5e7eb", color: "#9ca3af", cursor: "not-allowed" }}
                >
                  {authorizing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : null}
                  授权飞书账号
                </button>
              )}
            </div>
          </div>

          {/* Right: Create Meeting */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-base font-semibold text-gray-900 mb-1">创建面试会议</h2>
            <p className="text-sm text-gray-500 mb-4">
              这里只创建会议并拿到入会链接。录制视频会在会后由系统自动同步回来，不需要你手动上传。
            </p>

            {!isAuthorized && (
              <div className="flex items-start gap-2.5 p-3.5 rounded-xl border mb-4"
                style={{ background: "#fffbeb", borderColor: "#fde68a" }}>
                <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-amber-700">
                  当前还不能创建会议，请先在左侧授权你自己的飞书账号。
                </p>
              </div>
            )}

            <form onSubmit={handleCreateMeeting} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="会议标题，如：后端开发一面"
                  value={meetingTitle}
                  onChange={e => setMeetingTitle(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 bg-gray-50"
                />
                <input
                  type="text"
                  placeholder="岗位名称，如：后端工程师"
                  value={meetingPosition}
                  onChange={e => setMeetingPosition(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 bg-gray-50"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  placeholder="候选人姓名（可选）"
                  value={meetingCandidate}
                  onChange={e => setMeetingCandidate(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 bg-gray-50"
                />
                <input
                  type="email"
                  placeholder="候选人邮箱（可选）"
                  value={meetingEmail}
                  onChange={e => setMeetingEmail(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 bg-gray-50"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="datetime-local"
                  value={meetingDate}
                  onChange={e => setMeetingDate(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 bg-gray-50 text-gray-600"
                />
                <input
                  type="number"
                  placeholder="60"
                  value={meetingDuration}
                  onChange={e => setMeetingDuration(e.target.value)}
                  className="h-10 px-3 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-indigo-400 bg-gray-50"
                />
              </div>
              <button
                type="submit"
                disabled={!isAuthorized || creating}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all"
                style={isAuthorized ? { background: "#4F39F6", boxShadow: "0 4px 12px rgba(79,57,246,0.25)" } : { background: "#e5e7eb", color: "#9ca3af", cursor: "not-allowed" }}
              >
                {creating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                {creating ? "创建中..." : "创建飞书会议"}
              </button>
            </form>
          </div>
        </div>

        {/* Meeting & Recording List */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-1">
            <h2 className="text-base font-semibold text-gray-900">会议与录制列表</h2>
            <button onClick={handleSync} className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-indigo-600 transition-colors">
              <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
              刷新
            </button>
          </div>
          <p className="text-xs text-gray-500 mb-5">
            没开网站时视频也会样样同步，下次打开这里就能看到哪些已经同步、哪些还没分析、哪些需要重试。
          </p>

          <div className="space-y-3">
            {mockMeetings.map(meeting => (
              <div key={meeting.id} className="rounded-xl border border-gray-100 p-4 hover:border-indigo-100 transition-all"
                style={{ background: "#fafafa" }}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="font-semibold text-gray-900">{meeting.title}</span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: "#dcfce7", color: "#16a34a" }}>
                        已分析
                      </span>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium"
                        style={{ background: "#dbeafe", color: "#1d4ed8" }}>
                        分析完成
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-xs text-gray-500">
                      <span>候选人：{meeting.candidate}</span>
                      <span>岗位：{meeting.position}</span>
                      <span>会议时间：{meeting.time}</span>
                      <span>时长：{meeting.duration}</span>
                      <span>入会链接：{meeting.joinLink}</span>
                      <span>录制时长：{meeting.recordDuration}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                    <button
                      onClick={() => toast.info("正在跳转到视频分析...")}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg font-medium text-white transition-all"
                      style={{ background: "#4F39F6" }}>
                      <BarChart2 className="w-3.5 h-3.5" />
                      查看分析
                    </button>
                    <button
                      onClick={() => toast.info("正在打开视频...")}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-white transition-all">
                      <Video className="w-3.5 h-3.5" />
                      查看视频
                    </button>
                    <button
                      onClick={() => toast.error("已删除该会议记录")}
                      className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg border border-red-100 text-red-400 hover:bg-red-50 transition-all">
                      <Trash2 className="w-3.5 h-3.5" />
                      删除
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
