/**
 * CreditsModal - 积分购买弹窗
 * 参考设计：积分购买.png
 * 功能：新用户赠30积分提示 + 4个套餐选择 + 微信/支付宝支付
 */
import { useState } from "react";
import { X, DollarSign, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Props {
  open: boolean;
  onClose: () => void;
  currentCredits?: number;
  isNewUser?: boolean;
}

const PACKAGES = [
  { id: "trial", name: "体验包", credits: 50, price: 29.9 },
  { id: "standard", name: "标准包", credits: 200, price: 59 },
  { id: "pro", name: "专业包", credits: 500, price: 99 },
  { id: "enterprise", name: "企业包", credits: 2000, price: 299 },
];

type PayMethod = "wechat" | "alipay";

export default function CreditsModal({ open, onClose, currentCredits = 15, isNewUser = false }: Props) {
  const [selectedPkg, setSelectedPkg] = useState("enterprise");
  const [payMethod, setPayMethod] = useState<PayMethod>("wechat");
  const [paying, setPaying] = useState(false);

  if (!open) return null;

  const pkg = PACKAGES.find(p => p.id === selectedPkg)!;

  const handlePay = () => {
    setPaying(true);
    setTimeout(() => {
      setPaying(false);
      toast.success(`支付成功！已充值 ${pkg.credits} 积分`);
      onClose();
    }, 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.45)", backdropFilter: "blur(4px)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden"
        style={{ boxShadow: "0 32px 80px rgba(0,0,0,0.2)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: "#f0fdf4" }}>
              <DollarSign className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">充值积分</h2>
              <p className="text-xs text-gray-500">当前余额：{currentCredits} 积分</p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* New user gift */}
          {isNewUser && (
            <div className="flex items-center gap-3 p-3.5 rounded-xl border"
              style={{ background: "linear-gradient(135deg, #f5f3ff, #ede9fe)", borderColor: "#ddd6fe" }}>
              <div className="text-2xl">🎁</div>
              <div>
                <p className="text-sm font-semibold text-indigo-800">新用户专属福利</p>
                <p className="text-xs text-indigo-600 mt-0.5">注册即赠 <span className="font-bold text-indigo-700">30 积分</span>，可直接体验所有 AI 功能</p>
              </div>
            </div>
          )}

          {/* Package Selection */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">选择套餐</p>
            <div className="grid grid-cols-2 gap-2.5">
              {PACKAGES.map(p => (
                <button
                  key={p.id}
                  onClick={() => setSelectedPkg(p.id)}
                  className="text-left p-4 rounded-xl border-2 transition-all"
                  style={selectedPkg === p.id ? {
                    borderColor: "#4F39F6",
                    background: "linear-gradient(135deg, #f5f3ff, #ede9fe)",
                  } : {
                    borderColor: "#f3f4f6",
                    background: "#fafafa",
                  }}
                >
                  <p className="text-sm font-semibold text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{p.credits} 积分</p>
                  <p className="text-base font-bold mt-2" style={{ color: "#4F39F6" }}>
                    ¥{p.price}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-3">支付方式</p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                onClick={() => setPayMethod("wechat")}
                className="p-3.5 rounded-xl border-2 text-left transition-all"
                style={payMethod === "wechat" ? {
                  borderColor: "#07c160",
                  background: "#f0fdf4",
                } : {
                  borderColor: "#f3f4f6",
                  background: "#fafafa",
                }}
              >
                <div className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#07c160">
                    <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 01.213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 00.167-.054l1.903-1.114a.864.864 0 01.717-.098 10.16 10.16 0 002.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178A1.17 1.17 0 014.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 01-1.162 1.178 1.17 1.17 0 01-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 01.598.082l1.584.926a.272.272 0 00.14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 01-.023-.156.49.49 0 01.201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-7.062-6.122zm-3.318 2.187c.537 0 .972.44.972.982a.976.976 0 01-.972.983.976.976 0 01-.972-.983c0-.542.435-.982.972-.982zm6.63 0c.537 0 .972.44.972.982a.976.976 0 01-.972.983.976.976 0 01-.972-.983c0-.542.435-.982.972-.982z"/>
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">微信支付</p>
                    <p className="text-xs text-gray-400">扫码支付</p>
                  </div>
                </div>
              </button>
              <button
                onClick={() => setPayMethod("alipay")}
                className="p-3.5 rounded-xl border-2 text-left transition-all"
                style={payMethod === "alipay" ? {
                  borderColor: "#1677ff",
                  background: "#eff6ff",
                } : {
                  borderColor: "#f3f4f6",
                  background: "#fafafa",
                }}
              >
                <div className="flex items-center gap-2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#1677ff">
                    <path d="M21.422 15.358c-3.83-1.153-6.055-1.84-6.055-1.84.588-1.107 1.046-2.364 1.32-3.737h-4.07V8.34h4.634V7.26h-4.634V4.5h-3.07c-.33 0-.33.3-.33.3V7.26H4.58v1.08h4.638v1.441H5.35v1.08h7.8c-.24.94-.57 1.79-.99 2.55 0 0-3.83-1.08-6.12-.48-2.28.6-3.54 2.52-3.3 4.44.24 1.92 1.86 3.36 4.26 3.36 2.4 0 4.68-1.44 6.54-4.08 0 0 3.24 1.56 6.48 2.76l1.4-3.15zm-13.2 3.36c-1.44 0-2.52-.84-2.64-1.92-.12-1.08.72-2.16 2.04-2.52 1.32-.36 3.12.12 4.68.84-1.2 2.16-2.64 3.6-4.08 3.6z"/>
                  </svg>
                  <div>
                    <p className="text-sm font-semibold text-gray-800">支付宝</p>
                    <p className="text-xs text-gray-400">网页支付</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onClose}
            className="flex-1 h-11 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-all"
          >
            关闭
          </button>
          <button
            onClick={handlePay}
            disabled={paying}
            className="flex-1 h-11 rounded-xl text-white text-sm font-semibold flex items-center justify-center gap-2 transition-all"
            style={{ background: "#4F39F6", boxShadow: "0 4px 12px rgba(79,57,246,0.3)" }}
          >
            {paying ? <Loader2 className="w-4 h-4 animate-spin" /> : <DollarSign className="w-4 h-4" />}
            {paying ? "支付中..." : `立即支付 ¥${pkg.price}`}
          </button>
        </div>
      </div>
    </div>
  );
}
