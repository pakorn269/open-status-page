import React from 'react';
import { X, Bell, ExternalLink, Check } from 'lucide-react';

interface SubscribeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SubscribeModal: React.FC<SubscribeModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in">
      <div
        className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl max-w-md w-full p-6 shadow-2xl relative transition-all"
        onClick={e => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950 text-[#229ED9] rounded-xl border border-blue-100 dark:border-blue-900">
            <Bell size={22} />
          </div>
          <div>
            <h3 className="text-[17px] font-semibold text-gray-900 dark:text-gray-100">
              รับการแจ้งเตือนสถานะระบบ (Subscribe)
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              รับการแจ้งเตือนทันทีเมื่อระบบขัดข้องหรือกลับมาใช้งานได้ปกติ
            </p>
          </div>
        </div>

        {/* Telegram Subscription Card */}
        <div className="bg-gradient-to-br from-blue-50/70 to-sky-50/40 dark:from-blue-950/40 dark:to-sky-950/20 border border-blue-100 dark:border-blue-900/60 rounded-xl p-5 mb-5">
          <div className="flex items-start gap-3.5 mb-3">
            {/* Telegram Icon */}
            <div className="w-10 h-10 rounded-full bg-[#229ED9] flex items-center justify-center shrink-0 shadow-sm">
              <svg className="w-5 h-5 fill-white -ml-0.5 mt-0.5" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-1.5">
                <span>Telegram Broadcast Channel</span>
                <span className="text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-bold px-1.5 py-0.2 rounded">
                  OFFICIAL
                </span>
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                ช่องทางแจ้งเตือน: <strong className="text-blue-600 dark:text-blue-400 font-mono">@gateway9armstatus</strong>
              </p>
            </div>
          </div>

          <div className="space-y-1.5 text-xs text-gray-600 dark:text-gray-300 mb-4 pl-1">
            <div className="flex items-center gap-2">
              <Check size={13} className="text-green-500 shrink-0" />
              <span>แจ้งเตือนทันทีแบบ Real-time เมื่อตรวจพบระบบขัดข้อง</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={13} className="text-green-500 shrink-0" />
              <span>แจ้งเตือนอัตโนมัติเมื่อระบบกลับมาใช้งานได้ปกติ</span>
            </div>
            <div className="flex items-center gap-2">
              <Check size={13} className="text-green-500 shrink-0" />
              <span>บรอดแคสต์อัตโนมัติผ่าน @th9arm_bot ตลอด 24 ชม.</span>
            </div>
          </div>

          <a
            href="https://t.me/gateway9armstatus"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-2.5 px-4 bg-[#229ED9] hover:bg-[#1e8cc0] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <span>เข้าร่วมช่อง @gateway9armstatus</span>
            <ExternalLink size={13} />
          </a>
        </div>

        {/* Footer info */}
        <p className="text-[11px] text-center text-gray-400 dark:text-gray-500">
          ไม่ต้องลงทะเบียนหรือกรอกอีเมล เพียงกดเปิดใน Telegram เพื่อเข้าร่วม
        </p>
      </div>
    </div>
  );
};
