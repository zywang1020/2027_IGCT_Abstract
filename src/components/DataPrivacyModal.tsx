import React from 'react';
import { ShieldAlert, Trash2, X, CheckCircle2, Lock, GitBranch, AlertTriangle } from 'lucide-react';

interface DataPrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmWipe: () => void;
  isIncognito: boolean;
  onToggleIncognito: () => void;
  abstractCount: number;
}

export const DataPrivacyModal: React.FC<DataPrivacyModalProps> = ({
  isOpen,
  onClose,
  onConfirmWipe,
  isIncognito,
  onToggleIncognito,
  abstractCount,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 max-w-xl w-full p-6 space-y-5 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-50 dark:bg-rose-950/70 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-xs">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                徹底銷毀資料 · GitHub 連動零外流防護
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                保證論文資料不儲存於伺服器、清空本機快取、保護學術資產安全
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* System Zero-Leakage Architecture Guarantee */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200/90 dark:border-slate-800 space-y-2.5 text-xs">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
            <Lock className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
            <span>系統資安與零外流三大防護保證：</span>
          </div>
          <ul className="space-y-1.5 text-slate-600 dark:text-slate-400 text-[11px] leading-relaxed pl-5 list-disc">
            <li>
              <strong className="text-slate-800 dark:text-slate-200">純前端運算與零伺服器儲存：</strong>
              本系統所有論文資料僅於瀏覽器前端運作，後端與伺服器絕不寫入任何資料庫或硬碟日誌。
            </li>
            <li>
              <strong className="text-slate-800 dark:text-slate-200">GitHub 原始碼庫完全純淨：</strong>
              專案程式碼已移除所有預設論文與範例檔案，您可以安全地將此系統 commit 或連動到 GitHub 倉儲。
            </li>
            <li>
              <strong className="text-slate-800 dark:text-slate-200">即時徹底抹除（Wipeout）：</strong>
              點擊下方銷毀按鈕，將即刻清除記憶體狀態並抹除瀏覽器 LocalStorage / SessionStorage 快取。
            </li>
          </ul>
        </div>

        {/* Incognito Mode Switch */}
        <div className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/60">
          <div className="flex items-center gap-2.5">
            <Lock className="w-4 h-4 text-emerald-800 dark:text-emerald-400 shrink-0" />
            <div>
              <span className="text-xs font-bold text-emerald-950 dark:text-emerald-200 block">
                啟用「無痕防外流模式」(Session-Only Mode)
              </span>
              <span className="text-[11px] text-emerald-800/80 dark:text-emerald-300/80">
                開啟後資料僅保留於當前分頁記憶體中，關閉或重新整理網頁時自動銷毀，不寫入任何本機儲存
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onToggleIncognito}
            className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
              isIncognito ? 'bg-emerald-800' : 'bg-slate-300 dark:bg-slate-700'
            }`}
          >
            <span
              className={`block w-4 h-4 rounded-full bg-white shadow-xs transition-transform absolute top-1 ${
                isIncognito ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>

        {/* Warning if data currently exists */}
        {abstractCount > 0 && (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700 dark:text-amber-400" />
            <span>
              目前系統記憶體內登錄有 <strong>{abstractCount} 篇</strong> 論文。執行銷毀後將永久刪除，無法復原。
            </span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer"
          >
            取消返回
          </button>

          <button
            type="button"
            onClick={() => {
              onConfirmWipe();
              onClose();
            }}
            className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-rose-700 hover:bg-rose-800 rounded-lg shadow-xs transition-all cursor-pointer active:scale-[0.98]"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>立即徹底銷毀所有論文資料</span>
          </button>
        </div>
      </div>
    </div>
  );
};
