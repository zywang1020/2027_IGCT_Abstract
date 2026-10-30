import React from 'react';
import { X, FileText, User } from 'lucide-react';
import { AbstractItem } from '../types';

interface AbstractDetailModalProps {
  abstract: AbstractItem | null;
  onClose: () => void;
}

export const AbstractDetailModal: React.FC<AbstractDetailModalProps> = ({
  abstract,
  onClose,
}) => {
  if (!abstract) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono-data text-emerald-800 dark:text-emerald-400 font-bold mb-1">
              <span>[論文編號 {abstract.id}]</span>
              {abstract.targetSubTheme && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="font-semibold">{abstract.targetSubTheme}</span>
                </>
              )}
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
              {abstract.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metadata info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/60 rounded-lg text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">投稿指定所屬子議題：</span>
            <span className="font-semibold text-emerald-800 dark:text-emerald-400">
              {abstract.targetSubTheme || '未指定 (由系統依題目判斷)'}
            </span>
          </div>
          <div>
            <span className="text-slate-400 block text-[11px]">作者 / 發表單位：</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">
              {abstract.author || '去識別化作者'} {abstract.affiliation ? `(${abstract.affiliation})` : ''}
            </span>
          </div>
        </div>

        {/* Abstract/Content if exists */}
        {abstract.content && (
          <div className="space-y-1.5 pt-2">
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              補充說明或摘要內容
            </h4>
            <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans whitespace-pre-wrap">
              {abstract.content}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex justify-end pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-white bg-slate-900 dark:bg-slate-700 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            關閉檢視
          </button>
        </div>
      </div>
    </div>
  );
};
