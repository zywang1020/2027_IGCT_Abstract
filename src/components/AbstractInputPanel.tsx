import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Search, 
  UploadCloud, 
  FileText, 
  Eye, 
  Check, 
  Tag,
  AlertCircle,
  X
} from 'lucide-react';
import { AbstractItem, SubTheme } from '../types';
import { BatchGridPasteModal } from './BatchGridPasteModal';
import { OFFICIAL_2027_SUBTHEMES } from '../data/sampleAbstracts';

interface AbstractInputPanelProps {
  abstracts: AbstractItem[];
  subThemes?: SubTheme[];
  onAddAbstract: (item: AbstractItem) => void;
  onUpdateAbstract: (item: AbstractItem) => void;
  onDeleteAbstract: (id: string) => void;
  onClearAll: () => void;
  onBatchImport: (newItems: AbstractItem[]) => void;
  onSelectAbstractDetail: (item: AbstractItem) => void;
}

export const AbstractInputPanel: React.FC<AbstractInputPanelProps> = ({
  abstracts,
  subThemes = OFFICIAL_2027_SUBTHEMES,
  onAddAbstract,
  onUpdateAbstract,
  onDeleteAbstract,
  onClearAll,
  onBatchImport,
  onSelectAbstractDetail,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [subThemeFilter, setSubThemeFilter] = useState<string>('all');
  const [showGridModal, setShowGridModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchText, setBatchText] = useState('');
  const [showNewModal, setShowNewModal] = useState(false);
  const [confirmClearAll, setConfirmClearAll] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // New paper form state (only Title and Sub-theme as primary)
  const [newTitle, setNewTitle] = useState('');
  const [newSubTheme, setNewSubTheme] = useState(subThemes[0]?.name || '');
  const [newAuthor, setNewAuthor] = useState('');
  const [newContent, setNewContent] = useState('');

  // Handle File Upload (.csv, .tsv, .txt)
  const processUploadedFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;

      const fileName = file.name.toLowerCase();

      if (fileName.endsWith('.json')) {
        try {
          const parsed = JSON.parse(text);
          if (Array.isArray(parsed)) {
            const items: AbstractItem[] = parsed.map((item, idx) => ({
              id: item.id || String(abstracts.length + idx + 1).padStart(2, '0'),
              title: item.title || item.name || `論文 ${idx + 1}`,
              targetSubTheme: item.targetSubTheme || item.subTheme || item.category || '',
              author: item.author || '',
              content: item.content || item.abstract || ''
            }));
            onBatchImport(items);
            return;
          }
        } catch (err) {
          console.error('JSON parse error:', err);
        }
      }

      // CSV / TSV tabular parsing
      const delimiter = fileName.endsWith('.tsv') ? '\t' : ',';
      const lines = text.split(/\r?\n/).filter(l => l.trim().length > 0);
      if (lines.length > 0) {
        const header = lines[0].split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));
        const titleIdx = header.findIndex(h => /篇名|標題|題目|title/i.test(h));
        const subThemeIdx = header.findIndex(h => /子議題|議題|主題|類別|場次|theme|track/i.test(h));
        const authorIdx = header.findIndex(h => /作者|發表人|author/i.test(h));

        const startLine = (titleIdx !== -1 || subThemeIdx !== -1) ? 1 : 0;
        const parsedList: AbstractItem[] = [];

        for (let i = startLine; i < lines.length; i++) {
          const cols = lines[i].split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
          if (cols.length === 0 || !cols[0]) continue;

          const id = String(abstracts.length + parsedList.length + 1).padStart(2, '0');
          const title = (titleIdx !== -1 ? cols[titleIdx] : cols[0]) || `論文 ${id}`;
          const targetSubTheme = (subThemeIdx !== -1 && cols[subThemeIdx]) ? cols[subThemeIdx] : (cols[1] || '');
          const author = authorIdx !== -1 ? cols[authorIdx] : (cols[2] || '');

          parsedList.push({
            id,
            title,
            targetSubTheme,
            author
          });
        }

        if (parsedList.length > 0) {
          onBatchImport(parsedList);
          return;
        }
      }

      // Fallback text
      setBatchText(text);
      setShowBatchModal(true);
    };

    reader.readAsText(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processUploadedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processUploadedFile(e.dataTransfer.files[0]);
    }
  };

  // Filtered abstracts by search and subtheme
  const filtered = abstracts.filter((item) => {
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.title.toLowerCase().includes(q) ||
      item.id.includes(q) ||
      (item.targetSubTheme && item.targetSubTheme.toLowerCase().includes(q)) ||
      (item.author && item.author.toLowerCase().includes(q));

    let matchesTheme = true;
    if (subThemeFilter === 'unassigned') {
      matchesTheme = !item.targetSubTheme || item.targetSubTheme.trim() === '';
    } else if (subThemeFilter !== 'all') {
      matchesTheme = item.targetSubTheme?.includes(subThemeFilter) || false;
    }

    return matchesSearch && matchesTheme;
  });

  const assignedCount = abstracts.filter(a => a.targetSubTheme && a.targetSubTheme.trim() !== '').length;

  const handleCreateSingle = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const nextId = String(abstracts.length + 1).padStart(2, '0');
    const item: AbstractItem = {
      id: nextId,
      title: newTitle.trim(),
      targetSubTheme: newSubTheme.trim(),
      author: newAuthor.trim() || '去識別化作者',
      content: newContent.trim()
    };

    onAddAbstract(item);
    setNewTitle('');
    setNewAuthor('');
    setNewContent('');
    setShowNewModal(false);
  };

  const handleParseBatchText = () => {
    if (!batchText.trim()) return;
    const lines = batchText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const parsedList: AbstractItem[] = [];

    lines.forEach((line) => {
      // Split on tab or multiple spaces or comma
      const parts = line.split(/\t| {3,}/);
      const title = parts[0]?.trim();
      const theme = parts[1]?.trim() || '';
      if (!title) return;

      const id = String(abstracts.length + parsedList.length + 1).padStart(2, '0');
      parsedList.push({
        id,
        title,
        targetSubTheme: theme
      });
    });

    if (parsedList.length > 0) {
      onBatchImport(parsedList);
      setBatchText('');
      setShowBatchModal(false);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Metric strip - Focusing strictly on Titles, Sub-Themes & Sessions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-0 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.02)] divide-y sm:divide-y-0 sm:divide-x divide-slate-100 dark:divide-slate-800">
        <div className="p-5">
          <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">登錄論文總數</div>
          <div className="text-2xl font-bold font-mono-data text-slate-900 dark:text-slate-100 mt-1">
            {abstracts.length} <span className="text-xs font-normal text-slate-500">篇</span>
          </div>
        </div>
        <div className="p-5">
          <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">已指定所屬子議題</div>
          <div className="text-2xl font-bold font-mono-data text-emerald-900 dark:text-emerald-400 mt-1">
            {assignedCount} <span className="text-xs font-normal text-slate-500">篇 ({abstracts.length > 0 ? Math.round((assignedCount / abstracts.length) * 100) : 0}%)</span>
          </div>
        </div>
        <div className="p-5">
          <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">官方研討會子議題</div>
          <div className="text-2xl font-bold font-mono-data text-slate-900 dark:text-slate-100 mt-1">
            {subThemes.length} <span className="text-xs font-normal text-slate-500">大範疇</span>
          </div>
        </div>
        <div className="p-5">
          <div className="text-[11px] font-semibold tracking-wider text-slate-500 uppercase">未指定子議題</div>
          <div className="text-2xl font-bold font-mono-data text-amber-800 dark:text-amber-400 mt-1">
            {abstracts.length - assignedCount} <span className="text-xs font-normal text-slate-500">篇 (AI將依題目歸類)</span>
          </div>
        </div>
      </div>

      {/* Action Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {/* Main Excel/Spreadsheet Copy-Paste Modal */}
          <button
            onClick={() => setShowGridModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#064E3B] hover:bg-[#043D2F] dark:bg-emerald-700 dark:hover:bg-emerald-600 rounded-lg transition-all shadow-xs whitespace-nowrap cursor-pointer active:scale-[0.98]"
          >
            <FileText className="w-3.5 h-3.5" />
            <span>複製貼上題目與子議題 (表格格式)</span>
          </button>

          {/* File Upload Trigger */}
          <label className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer shadow-xs whitespace-nowrap">
            <UploadCloud className="w-3.5 h-3.5 text-slate-400" />
            <span>上傳檔案 (.csv / .txt)</span>
            <input
              type="file"
              accept=".csv,.txt,.json,.tsv"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </label>

          <button
            onClick={() => setShowNewModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-slate-400" />
            <span>新增單篇題目</span>
          </button>

          {/* In-app reliable Clear All (Never blocked by iframe sandbox) */}
          {abstracts.length > 0 && (
            confirmClearAll ? (
              <div className="flex items-center gap-1.5 bg-rose-50 dark:bg-rose-950/80 px-2.5 py-1 rounded-lg border border-rose-300 dark:border-rose-800 animate-in fade-in">
                <span className="text-xs text-rose-900 dark:text-rose-100 font-semibold flex items-center gap-1">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  確定清空全部論文？
                </span>
                <button
                  onClick={() => {
                    onClearAll();
                    setConfirmClearAll(false);
                  }}
                  className="px-2 py-1 text-xs bg-rose-700 hover:bg-rose-800 text-white rounded font-bold cursor-pointer transition-colors shadow-xs"
                >
                  確認清空
                </button>
                <button
                  onClick={() => setConfirmClearAll(false)}
                  className="p-1 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded cursor-pointer"
                  title="取消"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setConfirmClearAll(true)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-700 dark:text-rose-400 hover:bg-rose-50/80 dark:hover:bg-rose-950/40 rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                title="清空論文資料庫"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>清空所有論文</span>
              </button>
            )
          )}
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="搜尋篇名、子議題或編號..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors shadow-xs"
          />
        </div>
      </div>

      {/* Drag & Drop File Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        className={`p-4 rounded-xl border-2 border-dashed transition-colors text-center text-xs ${
          isDragging
            ? 'border-emerald-600 bg-emerald-50/80 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300'
            : 'border-slate-300 dark:border-slate-700/80 bg-white/60 dark:bg-slate-900/40 text-slate-500'
        }`}
      >
        <span className="font-semibold text-slate-800 dark:text-slate-200">
          可以直接從 Excel 複製貼上「論文題目」與「所屬子議題」，或將 CSV 檔案拖曳至此處
        </span>
        <span className="block text-[11px] text-slate-400 mt-0.5">
          系統僅依據論文題目與所屬子議題進行智慧場次編排
        </span>
      </div>

      {/* Sub-theme Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 mr-1 text-[11px] font-medium whitespace-nowrap">子議題篩選：</span>
        <button
          onClick={() => setSubThemeFilter('all')}
          className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 text-xs ${
            subThemeFilter === 'all'
              ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 font-bold shadow-xs'
              : 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300'
          }`}
        >
          全部論文 ({abstracts.length})
        </button>
        {subThemes.map((st) => {
          const count = abstracts.filter(a => a.targetSubTheme && a.targetSubTheme.includes(st.name.slice(0, 4))).length;
          return (
            <button
              key={st.id}
              onClick={() => setSubThemeFilter(st.name.slice(0, 4))}
              className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 text-xs ${
                subThemeFilter === st.name.slice(0, 4)
                  ? 'bg-[#064E3B] text-white dark:bg-emerald-700 dark:text-white font-bold shadow-xs'
                  : 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300'
              }`}
            >
              {st.number}. {st.name.slice(0, 8)}... ({count})
            </button>
          );
        })}
        <button
          onClick={() => setSubThemeFilter('unassigned')}
          className={`px-3 py-1.5 rounded-lg transition-all whitespace-nowrap shrink-0 text-xs ${
            subThemeFilter === 'unassigned'
              ? 'bg-amber-800 text-white font-bold shadow-xs'
              : 'bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:border-slate-300'
          }`}
        >
          未指定子議題 ({abstracts.length - assignedCount})
        </button>
      </div>

      {/* Papers List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800/90 hover:border-emerald-700/60 dark:hover:border-emerald-500/60 shadow-[0_1px_2px_rgba(0,0,0,0.03)] hover:shadow-xs transition-all flex flex-col justify-between"
          >
            <div>
              {/* Top meta: ID & Subtheme badge */}
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-mono-data text-xs font-bold text-emerald-900 dark:text-emerald-400 tracking-wide">
                  [論文 {item.id}]
                </span>
                {item.targetSubTheme ? (
                  <span className="text-[11px] font-semibold text-emerald-950 dark:text-emerald-200 bg-emerald-50/90 dark:bg-emerald-950/70 border border-emerald-200/90 dark:border-emerald-800/80 px-2.5 py-0.5 rounded-md truncate max-w-[280px]" title={item.targetSubTheme}>
                    子議題：{item.targetSubTheme}
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-amber-900 dark:text-amber-200 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 px-2 py-0.5 rounded-md">
                    未指定子議題
                  </span>
                )}
              </div>

              {/* Title as the primary centerpiece */}
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 leading-snug mb-2">
                {item.title}
              </h4>

              {item.content && (
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed mb-2">
                  {item.content}
                </p>
              )}
            </div>

            <div className="pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between mt-2">
              <div className="text-[11px] text-slate-400 dark:text-slate-500 truncate max-w-[200px]">
                {item.author ? `作者：${item.author}` : ''}
              </div>
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  onClick={() => onSelectAbstractDetail(item)}
                  className="p-1.5 text-slate-400 hover:text-emerald-800 dark:hover:text-emerald-400 transition-colors cursor-pointer"
                  title="檢視論文詳情"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteAbstract(item.id)}
                  className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors cursor-pointer"
                  title="刪除本篇"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white dark:bg-slate-900 rounded-xl border border-dashed border-slate-300 dark:border-slate-800 p-8 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
          <div className="w-12 h-12 mx-auto rounded-full bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-[#064E3B] dark:text-emerald-400 mb-3 border border-emerald-200/60 dark:border-emerald-800/60">
            <FileText className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            {abstracts.length === 0 ? '目前論文庫尚無論文資料' : '查無符合條件的論文'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto mt-1 mb-6 leading-relaxed">
            {abstracts.length === 0 
              ? '請點擊下方按鈕，直接從 Excel 或 Word 複製貼上兩欄資料（第一欄：論文題目，第二欄：所屬子議題），系統將自動建立論文庫並支援智慧分群！'
              : '請調整篩選條件或搜尋關鍵字'}
          </p>
          {abstracts.length === 0 && (
            <button
              onClick={() => setShowGridModal(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#064E3B] hover:bg-[#043D2F] dark:bg-emerald-700 dark:hover:bg-emerald-600 rounded-lg shadow-sm transition-all cursor-pointer active:scale-[0.98]"
            >
              <FileText className="w-4 h-4 text-emerald-300" />
              <span>開啟表格複製貼上視窗</span>
            </button>
          )}
        </div>
      )}

      {/* New Single Paper Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                新增單篇論文題目
              </h3>
              <button
                onClick={() => setShowNewModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleCreateSingle} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  論文題目 (Title) *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="例如：氣候變遷情境下臺灣水文環境調適策略分析"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  所屬子議題 (Target Sub-theme) *
                </label>
                <select
                  value={newSubTheme}
                  onChange={(e) => setNewSubTheme(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                >
                  {subThemes.map(st => (
                    <option key={st.id} value={`${st.number}. ${st.name}`}>
                      {st.number}. {st.name}
                    </option>
                  ))}
                  <option value="未指定子議題">未指定子議題 (由AI依題目判定)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  發表人 / 單位 (選填)
                </label>
                <input
                  type="text"
                  value={newAuthor}
                  onChange={(e) => setNewAuthor(e.target.value)}
                  placeholder="如：國立臺灣師範大學地理學系研究團隊 或 匿名"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  補充說明或摘要內容 (選填)
                </label>
                <textarea
                  rows={4}
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  placeholder="可選填研究內容概述..."
                  className="w-full p-2.5 font-sans text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-medium text-white bg-emerald-800 dark:bg-emerald-700 rounded-lg hover:bg-emerald-700 transition-colors cursor-pointer"
                >
                  確認加入論文庫
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Plain text block paste modal */}
      {showBatchModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-2xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                批次貼上論文題目與子議題
              </h3>
              <button
                onClick={() => setShowBatchModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm cursor-pointer"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              每列輸入一個「論文題目」及「所屬子議題」（以 Tab 鍵或空格分隔）：
            </p>
            <textarea
              rows={10}
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
              placeholder={`氣候變遷情境下曾文水庫集水區崩塌敏感度模式\t2. 氣候變遷、環境監測與生態系統
高山崩塌地無人機LiDAR點雲微地貌監測\t1. 空間資訊、地理人工智慧與新興科技
高雄港後工業地景之記憶重塑與文化觀光\t4. 文化地景、感官經驗與地方認同`}
              className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-700 leading-relaxed flex-1"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowBatchModal(false)}
                className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                取消
              </button>
              <button
                onClick={handleParseBatchText}
                disabled={!batchText.trim()}
                className="px-4 py-2 text-xs font-medium text-white bg-emerald-800 dark:bg-emerald-700 rounded-lg hover:bg-emerald-700 transition-colors disabled:opacity-50 cursor-pointer"
              >
                確認匯入
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid Modal */}
      <BatchGridPasteModal
        isOpen={showGridModal}
        onClose={() => setShowGridModal(false)}
        subThemes={subThemes}
        currentCount={abstracts.length}
        onConfirmImport={(items) => {
          onBatchImport(items);
        }}
      />
    </div>
  );
};
