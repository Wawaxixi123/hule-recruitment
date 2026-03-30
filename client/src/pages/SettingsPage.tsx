/**
 * Settings Page - 设置与权限管理
 * Module H: 协作与权限管理
 */
import { useState } from "react";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Users, Shield, Bell, Settings, Plus, Edit, Trash2,
  Crown, Eye, Lock, ChevronRight, Check, X, UserPlus
} from "lucide-react";
import { toast } from "sonner";

const TEAM_MEMBERS = [
  { id: 1, name: "张晓雯", email: "zhangxw@company.com", role: "admin", department: "HR部门", avatar: "张", status: "active" },
  { id: 2, name: "李总监", email: "lizhd@company.com", role: "manager", department: "产品部", avatar: "李", status: "active" },
  { id: 3, name: "王工", email: "wangg@company.com", role: "interviewer", department: "技术部", avatar: "王", status: "active" },
  { id: 4, name: "陈HR", email: "chenhr@company.com", role: "hr", department: "HR部门", avatar: "陈", status: "active" },
  { id: 5, name: "赵助理", email: "zhaozy@company.com", role: "viewer", department: "HR部门", avatar: "赵", status: "pending" },
];

const ROLES = [
  { key: "admin", label: "管理员", desc: "完整权限，可管理成员和设置", icon: Crown, color: "text-amber-600 bg-amber-50 border-amber-200" },
  { key: "manager", label: "业务负责人", desc: "可查看和决策所有候选人", icon: Shield, color: "text-indigo-600 bg-indigo-50 border-indigo-200" },
  { key: "hr", label: "HR", desc: "可管理职位和候选人全流程", icon: Users, color: "text-cyan-600 bg-cyan-50 border-cyan-200" },
  { key: "interviewer", label: "面试官", desc: "可查看分配的候选人和面试", icon: Eye, color: "text-emerald-600 bg-emerald-50 border-emerald-200" },
  { key: "viewer", label: "只读", desc: "仅可查看，不可操作", icon: Lock, color: "text-gray-600 bg-gray-50 border-gray-200" },
];

const PERMISSIONS = [
  { module: "职位管理", admin: true, manager: true, hr: true, interviewer: false, viewer: false },
  { module: "候选人管理", admin: true, manager: true, hr: true, interviewer: false, viewer: false },
  { module: "AI筛选结果", admin: true, manager: true, hr: true, interviewer: true, viewer: true },
  { module: "面试安排", admin: true, manager: true, hr: true, interviewer: true, viewer: false },
  { module: "面试评价", admin: true, manager: true, hr: true, interviewer: true, viewer: false },
  { module: "Offer管理", admin: true, manager: true, hr: true, interviewer: false, viewer: false },
  { module: "数据分析", admin: true, manager: true, hr: false, interviewer: false, viewer: false },
  { module: "Skill Hub", admin: true, manager: false, hr: true, interviewer: false, viewer: false },
  { module: "系统设置", admin: true, manager: false, hr: false, interviewer: false, viewer: false },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"team" | "roles" | "notifications" | "integrations">("team");
  const [members, setMembers] = useState(TEAM_MEMBERS);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("hr");
  const [notifications, setNotifications] = useState({
    newApplication: true,
    aiScreeningDone: true,
    interviewReminder: true,
    offerApproval: true,
    weeklyReport: false,
    systemUpdate: false,
  });

  const getRoleConfig = (role: string) => ROLES.find((r) => r.key === role) || ROLES[4];

  const handleInvite = () => {
    if (!inviteEmail) {
      toast.error("请输入邮箱地址");
      return;
    }
    toast.success(`邀请已发送至 ${inviteEmail}`);
    setInviteEmail("");
  };

  return (
    <AppLayout breadcrumb={[{ label: "设置" }]}>
      <div className="p-6 space-y-5 max-w-4xl mx-auto">
        {/* Header */}
        <div>
          <h1 className="text-xl font-bold text-gray-900">设置与权限管理</h1>
          <p className="text-sm text-gray-500 mt-0.5">管理团队成员、权限配置和系统集成</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
          {[
            { key: "team", label: "团队成员" },
            { key: "roles", label: "权限配置" },
            { key: "notifications", label: "通知设置" },
            { key: "integrations", label: "系统集成" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Team Members */}
        {activeTab === "team" && (
          <div className="space-y-4 max-w-3xl">
            {/* Invite */}
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="text-sm font-semibold text-gray-900 mb-3">邀请成员</div>
              <div className="flex gap-2">
                <Input
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="输入邮箱地址..."
                  className="flex-1 border-gray-200 h-9"
                />
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 focus:outline-none focus:ring-1 focus:ring-indigo-400"
                >
                  {ROLES.map((r) => (
                    <option key={r.key} value={r.key}>{r.label}</option>
                  ))}
                </select>
                <Button className="bg-indigo-600 text-white h-9" onClick={handleInvite}>
                  <UserPlus className="w-4 h-4 mr-1.5" />
                  邀请
                </Button>
              </div>
            </div>

            {/* Member List */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-50 flex items-center justify-between">
                <span className="text-sm font-semibold text-gray-900">团队成员 ({members.length})</span>
              </div>
              <div className="divide-y divide-gray-50">
                {members.map((member) => {
                  const roleConfig = getRoleConfig(member.role);
                  const RoleIcon = roleConfig.icon;
                  return (
                    <div key={member.id} className="flex items-center gap-4 px-5 py-3 hover:bg-gray-50">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                        {member.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium text-gray-900">{member.name}</span>
                          {member.status === "pending" && (
                            <span className="text-xs bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.5 rounded-full">待接受</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-400">{member.email} · {member.department}</div>
                      </div>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-medium ${roleConfig.color}`}>
                        <RoleIcon className="w-3 h-3" />
                        {roleConfig.label}
                      </div>
                      <div className="flex gap-1">
                        <button
                          className="w-7 h-7 rounded-lg hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-indigo-600 transition-colors"
                          onClick={() => toast.success("进入编辑模式")}
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          className="w-7 h-7 rounded-lg hover:bg-red-50 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
                          onClick={() => {
                            setMembers(members.filter((m) => m.id !== member.id));
                            toast.success(`已移除 ${member.name}`);
                          }}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Roles & Permissions */}
        {activeTab === "roles" && (
          <div className="space-y-4 max-w-4xl">
            {/* Role Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              {ROLES.map((role) => {
                const RoleIcon = role.icon;
                return (
                  <div key={role.key} className={`rounded-xl border p-3 ${role.color}`}>
                    <RoleIcon className="w-4 h-4 mb-1.5" />
                    <div className="text-xs font-bold">{role.label}</div>
                    <div className="text-xs opacity-70 mt-0.5 leading-tight">{role.desc}</div>
                  </div>
                );
              })}
            </div>

            {/* Permission Matrix */}
            <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <div className="px-5 py-3 border-b border-gray-50">
                <span className="text-sm font-semibold text-gray-900">权限矩阵</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-50">
                      <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 w-32">功能模块</th>
                      {ROLES.map((r) => (
                        <th key={r.key} className="text-center px-3 py-3 text-xs font-semibold text-gray-500">{r.label}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {PERMISSIONS.map((perm) => (
                      <tr key={perm.module} className="hover:bg-gray-50">
                        <td className="px-5 py-2.5 text-sm text-gray-700">{perm.module}</td>
                        {["admin", "manager", "hr", "interviewer", "viewer"].map((role) => (
                          <td key={role} className="px-3 py-2.5 text-center">
                            {(perm as Record<string, boolean | string>)[role] ? (
                              <Check className="w-4 h-4 text-emerald-500 mx-auto" />
                            ) : (
                              <X className="w-4 h-4 text-gray-200 mx-auto" />
                            )}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Notifications */}
        {activeTab === "notifications" && (
          <div className="max-w-xl space-y-4">
            <div className="bg-white rounded-2xl border border-gray-100 p-5">
              <div className="text-sm font-semibold text-gray-900 mb-4">通知偏好设置</div>
              <div className="space-y-3">
                {[
                  { key: "newApplication", label: "新简历投递", desc: "有新候选人投递职位时通知" },
                  { key: "aiScreeningDone", label: "AI筛选完成", desc: "AI完成批量简历筛选时通知" },
                  { key: "interviewReminder", label: "面试提醒", desc: "面试前1小时发送提醒" },
                  { key: "offerApproval", label: "Offer审批", desc: "Offer需要审批时通知" },
                  { key: "weeklyReport", label: "周报", desc: "每周一发送招聘数据周报" },
                  { key: "systemUpdate", label: "系统更新", desc: "系统功能更新和维护通知" },
                ].map((item) => (
                  <div key={item.key} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{item.label}</div>
                      <div className="text-xs text-gray-400">{item.desc}</div>
                    </div>
                    <button
                      onClick={() => {
                        setNotifications((prev) => ({ ...prev, [item.key]: !prev[item.key as keyof typeof prev] }));
                        toast.success("通知设置已更新");
                      }}
                      className={`w-10 h-5.5 rounded-full transition-all relative ${
                        notifications[item.key as keyof typeof notifications] ? "bg-indigo-600" : "bg-gray-200"
                      }`}
                      style={{ height: 22, width: 40 }}
                    >
                      <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${
                        notifications[item.key as keyof typeof notifications] ? "left-5" : "left-0.5"
                      }`} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Integrations */}
        {activeTab === "integrations" && (
          <div className="max-w-2xl space-y-4">
            {[
              { name: "飞书", desc: "同步面试日历、候选人评价和复盘报告", status: "connected", logo: "🪶" },
              { name: "钉钉", desc: "接收招聘通知和审批流程", status: "disconnected", logo: "📎" },
              { name: "企业微信", desc: "团队协作和候选人沟通", status: "disconnected", logo: "💬" },
              { name: "BOSS直聘", desc: "自动同步候选人简历", status: "connected", logo: "👔" },
              { name: "拉勾网", desc: "职位发布和简历获取", status: "disconnected", logo: "🎯" },
            ].map((integration) => (
              <div key={integration.name} className="bg-white rounded-2xl border border-gray-100 p-4 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl flex-shrink-0">
                  {integration.logo}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{integration.name}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                      integration.status === "connected"
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-gray-50 text-gray-500 border-gray-200"
                    }`}>
                      {integration.status === "connected" ? "已连接" : "未连接"}
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{integration.desc}</div>
                </div>
                <Button
                  size="sm"
                  variant={integration.status === "connected" ? "outline" : "default"}
                  className={integration.status === "connected" ? "border-gray-200 text-xs" : "bg-indigo-600 text-white text-xs"}
                  onClick={() => toast.success(integration.status === "connected" ? `已断开 ${integration.name}` : `正在连接 ${integration.name}...`)}
                >
                  {integration.status === "connected" ? "断开" : "连接"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
