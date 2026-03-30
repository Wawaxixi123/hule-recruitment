/**
 * Interview Detail Page - 面试详情
 */
import { useParams } from "wouter";
import AppLayout from "@/components/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Calendar, Clock, Users, Video, Brain, Star,
  CheckCircle2, MessageSquare, Sparkles, ArrowLeft
} from "lucide-react";
import { mockInterviews } from "@/lib/mockData";
import { useNavigate } from "@/hooks/useNavigate";
import { toast } from "sonner";

export default function InterviewDetailPage() {
  const params = useParams<{ id: string }>();
  const navigate = useNavigate();
  const interview = mockInterviews.find((i) => i.id === params.id) || mockInterviews[0];

  return (
    <AppLayout
      breadcrumb={[
        { label: "面试管理", path: "/interviews" },
        { label: `${interview.candidateName} · ${interview.roundName}` },
      ]}
    >
      <div className="p-6 max-w-3xl space-y-5">
        {/* Header */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-lg font-bold text-gray-900">{interview.candidateName}</h1>
                <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                  interview.status === "completed" ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                  interview.status === "scheduled" ? "bg-amber-50 text-amber-700 border-amber-200" :
                  "bg-gray-50 text-gray-600 border-gray-200"
                }`}>
                  {interview.status === "completed" ? "已完成" : interview.status === "scheduled" ? "已安排" : "待安排"}
                </span>
              </div>
              <div className="text-sm text-gray-500">{interview.jobTitle} · {interview.roundName}</div>
            </div>
            {interview.score && (
              <div className="text-3xl font-extrabold text-indigo-600" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {interview.score}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { icon: Calendar, label: "面试时间", value: interview.scheduledAt },
              { icon: Clock, label: "时长", value: interview.duration ? `${interview.duration}分钟` : "待定" },
              { icon: Video, label: "形式", value: interview.type === "online" ? "视频面试" : interview.type === "onsite" ? "现场面试" : "电话面试" },
              { icon: Users, label: "面试官", value: interview.interviewers.join("、") },
            ].map((item) => (
              <div key={item.label} className="bg-gray-50 rounded-xl p-3">
                <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-1">
                  <item.icon className="w-3.5 h-3.5" />
                  {item.label}
                </div>
                <div className="text-sm font-medium text-gray-900">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Feedback */}
        {interview.feedback && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-3">
              <MessageSquare className="w-4 h-4 text-indigo-600" />
              <span className="text-sm font-semibold text-gray-900">面试反馈</span>
            </div>
            <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl p-4">
              {interview.feedback}
            </p>
          </div>
        )}

        {/* AI Review */}
        {interview.status === "completed" && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-indigo-600 to-cyan-500 flex items-center justify-center">
                <Brain className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="text-sm font-semibold text-gray-900">AI复盘分析</span>
            </div>
            <div className="space-y-3 mb-4">
              {[
                { dim: "技术能力", score: 85 },
                { dim: "产品思维", score: 88 },
                { dim: "沟通表达", score: 82 },
                { dim: "业务理解", score: 90 },
                { dim: "文化契合", score: 87 },
              ].map((item) => (
                <div key={item.dim} className="flex items-center gap-3">
                  <span className="text-xs text-gray-600 w-16">{item.dim}</span>
                  <Progress value={item.score} className="flex-1 h-1.5" />
                  <span className="text-xs font-bold text-indigo-600 w-8 text-right">{item.score}</span>
                </div>
              ))}
            </div>
            <div className="bg-gradient-to-r from-indigo-50 to-cyan-50 rounded-xl p-3 border border-indigo-100 text-xs text-indigo-800 leading-relaxed">
              候选人整体表现良好，技术理解深度和业务思维均达到预期。建议进入下一轮面试，重点验证管理能力和团队协作风格。
            </div>
            <div className="flex gap-2 mt-3">
              <Button size="sm" className="bg-indigo-600 text-white text-xs" onClick={() => toast.success("复盘报告已保存")}>
                <Sparkles className="w-3.5 h-3.5 mr-1" />
                保存复盘报告
              </Button>
              <Button size="sm" variant="outline" className="border-gray-200 text-xs" onClick={() => toast.success("已同步至飞书")}>
                同步至飞书
              </Button>
            </div>
          </div>
        )}

        {/* Questions */}
        {interview.questions && interview.questions.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="text-sm font-semibold text-gray-900 mb-3">面试题记录</div>
            <div className="space-y-3">
              {interview.questions.map((q, i) => (
                <div key={q.id} className="border border-gray-100 rounded-xl p-3">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-xs font-bold text-gray-500">Q{i + 1}</span>
                    <span className="tag-indigo">{q.dimension}</span>
                    {q.score && (
                      <span className="ml-auto text-xs font-bold text-indigo-600">{q.score}分</span>
                    )}
                  </div>
                  <p className="text-sm text-gray-800">{q.question}</p>
                  {q.answer && (
                    <div className="mt-2 bg-gray-50 rounded-lg p-2 text-xs text-gray-600">
                      {q.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            variant="outline"
            className="border-gray-200"
            onClick={() => navigate("/interviews")}
          >
            <ArrowLeft className="w-4 h-4 mr-1.5" />
            返回列表
          </Button>
          {interview.status === "scheduled" && (
            <Button
              className="bg-indigo-600 text-white"
              onClick={() => navigate("/interviews")}
            >
              <Sparkles className="w-4 h-4 mr-1.5" />
              生成面试题
            </Button>
          )}
          <Button
            variant="outline"
            className="border-indigo-200 text-indigo-700"
            onClick={() => navigate(`/candidates/${interview.candidateId}`)}
          >
            查看候选人画像
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
