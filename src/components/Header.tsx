import React from 'react';
import { Layers, FileText, Calendar, MessageSquare, BookOpen, Sparkles, RefreshCw, ShieldAlert, ShieldCheck } from 'lucide-react';

interface HeaderProps {
  activeTab: 'config' | 'abstracts' | 'kanban' | 'table' | 'chat' | 'sop';
  setActiveTab: (tab: 'config' | 'abstracts' | 'kanban' | 'table' | 'chat' | 'sop') => void;
  onRunClustering: () => void;
  isClustering: boolean;
  abstractCount: number;
  onOpenPrivacyModal: () => void;
  isIncognito?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onRunClustering,
  isClustering,
  abstractCount,
  onOpenPrivacyModal,
  isIncognito = false,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-[#0B111A]/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800/90 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Wordmark with academic crest & security status */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="w-9 h-9 rounded-md bg-[#064E3B] flex items-center justify-center text-emerald-100 font-bold text-sm shadow-xs border border-emerald-600/30">
              師大
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="text-[15px] font-bold tracking-tight text-slate-900 dark:text-slate-100 whitespace-nowrap">
                  地理系研討會 · 摘要自動分群系統
                </span>
                {isIncognito ? (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    無痕防外流模式
                  </span>
                ) : (
                  <span className="hidden md:inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    本機運算 · GitHub防洩保護
                  </span>
                )}
              </div>
              <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400 whitespace-nowrap hidden sm:inline">
                國立臺灣師範大學地理學系 · 研討會議程編排與系辦數位資產
              </span>
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-5 text-sm">
            <button
              onClick={() => setActiveTab('config')}
              className={`flex items-center gap-1.5 py-2 transition-all whitespace-nowrap shrink-0 border-b-2 text-xs uppercase tracking-wider ${
                activeTab === 'config'
                  ? 'border-emerald-800 text-emerald-950 dark:border-emerald-400 dark:text-emerald-300 font-bold'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>研討會與場次主軸</span>
            </button>

            <button
              onClick={() => setActiveTab('abstracts')}
              className={`flex items-center gap-1.5 py-2 transition-all whitespace-nowrap shrink-0 border-b-2 text-xs uppercase tracking-wider ${
                activeTab === 'abstracts'
                  ? 'border-emerald-800 text-emerald-950 dark:border-emerald-400 dark:text-emerald-300 font-bold'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>論文摘要庫</span>
              <span className="text-[11px] bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 px-1.5 py-0.2 rounded font-mono-data border border-slate-200 dark:border-slate-700">
                {abstractCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('kanban')}
              className={`flex items-center gap-1.5 py-2 transition-all whitespace-nowrap shrink-0 border-b-2 text-xs uppercase tracking-wider ${
                activeTab === 'kanban'
                  ? 'border-emerald-800 text-emerald-950 dark:border-emerald-400 dark:text-emerald-300 font-bold'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>議程分群看板</span>
            </button>

            <button
              onClick={() => setActiveTab('table')}
              className={`flex items-center gap-1.5 py-2 transition-all whitespace-nowrap shrink-0 border-b-2 text-xs uppercase tracking-wider ${
                activeTab === 'table'
                  ? 'border-emerald-800 text-emerald-950 dark:border-emerald-400 dark:text-emerald-300 font-bold'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>正式議程表格</span>
            </button>

            <button
              onClick={() => setActiveTab('chat')}
              className={`flex items-center gap-1.5 py-2 transition-all whitespace-nowrap shrink-0 border-b-2 text-xs uppercase tracking-wider ${
                activeTab === 'chat'
                  ? 'border-emerald-800 text-emerald-950 dark:border-emerald-400 dark:text-emerald-300 font-bold'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <MessageSquare className="w-3.5 h-3.5 text-slate-400" />
              <span>動態微調對話</span>
            </button>

            <button
              onClick={() => setActiveTab('sop')}
              className={`flex items-center gap-1.5 py-2 transition-all whitespace-nowrap shrink-0 border-b-2 text-xs uppercase tracking-wider ${
                activeTab === 'sop'
                  ? 'border-emerald-800 text-emerald-950 dark:border-emerald-400 dark:text-emerald-300 font-bold'
                  : 'border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5 text-slate-400" />
              <span>系辦交接SOP</span>
            </button>
          </nav>

          {/* Zone 3: Actions - Data Privacy & Run Clustering */}
          <div className="flex items-center gap-2.5 shrink-0">
            {/* 1-click Security & Wipe Modal button */}
            <button
              onClick={onOpenPrivacyModal}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-lg hover:bg-rose-100 transition-colors shadow-2xs cursor-pointer whitespace-nowrap"
              title="徹底銷毀資料，防外流並安心連動 GitHub"
            >
              <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
              <span>銷毀資料 (防外流)</span>
            </button>

            <button
              onClick={onRunClustering}
              disabled={isClustering || abstractCount === 0}
              className="flex items-center gap-2 px-3.5 py-1.5 sm:px-4 sm:py-2 text-xs font-semibold text-white bg-[#064E3B] hover:bg-[#043D2F] dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-all shadow-xs disabled:opacity-40 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer active:scale-[0.98]"
            >
              {isClustering ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>AI分群運算中...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
                  <span>執行自動分群</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

