import React, { useState } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  Sparkles, 
  Check, 
  Clipboard, 
  Table, 
  HelpCircle,
  FileSpreadsheet
} from 'lucide-react';
import { AbstractItem, SubTheme } from '../types';
import { OFFICIAL_2027_SUBTHEMES } from '../data/sampleAbstracts';

interface BatchGridPasteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmImport: (items: AbstractItem[]) => void;
  subThemes: SubTheme[];
  currentCount: number;
}

interface GridRow {
  id: string;
  title: string;
  subTheme: string;
  author: string;
  spatialScale: AbstractItem['spatialScale'];
  content?: string;
}

export const BatchGridPasteModal: React.FC<BatchGridPasteModalProps> = ({
  isOpen,
  onClose,
  onConfirmImport,
  subThemes = OFFICIAL_2027_SUBTHEMES,
  currentCount,
}) => {
  const [pasteText, setPasteText] = useState('');
  const [gridRows, setGridRows] = useState<GridRow[]>([]);
  const [activeStep, setActiveStep] = useState<'paste' | 'review'>('paste');

  if (!isOpen) return null;

  // Auto detect subtheme based on text
  const matchSubTheme = (inputSub: string, titleText: string): string => {
    const raw = `${inputSub} ${titleText}`.toLowerCase();
    for (const st of subThemes) {
      if (
        raw.includes(st.name.slice(0, 4).toLowerCase()) ||
        (inputSub && inputSub.includes(String(st.number))) ||
        (st.number === 1 && (raw.includes('gis') || raw.includes('遙測') || raw.includes('無人機') || raw.includes('ai') || raw.includes('科技'))) ||
        (st.number === 2 && (raw.includes('氣候') || raw.includes('生態') || raw.includes('水文') || raw.includes('碳') || raw.includes('監測'))) ||
        (st.number === 3 && (raw.includes('災害') || raw.includes('韌性') || raw.includes('治理') || raw.includes('正義') || raw.includes('風險'))) ||
        (st.number === 4 && (raw.includes('文化') || raw.includes('地景') || raw.includes('場所') || raw.includes('認同') || raw.includes('記憶'))) ||
        (st.number === 5 && (raw.includes('原住') || raw.includes('部落') || raw.includes('傳統') || raw.includes('共治') || raw.includes('狩獵'))) ||
        (st.number === 6 && (raw.includes('教育') || raw.includes('學習') || raw.includes('教學') || raw.includes('戶外') || raw.includes('素養')))
      ) {
        return `${st.number}. ${st.name}`;
      }
    }
    return `${subThemes[0]?.number || 1}. ${subThemes[0]?.name || '空間資訊、地理人工智慧與新興科技'}`;
  };

  const handleParsePaste = () => {
    if (!pasteText.trim()) return;

    const lines = pasteText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    const parsed: GridRow[] = [];

    lines.forEach((line, index) => {
      // Split by tab (\t), pipe (|), or comma (,)
      let parts: string[] = [];
      if (line.includes('\t')) {
        parts = line.split('\t').map(p => p.trim());
      } else if (line.includes('|')) {
        parts = line.split('|').map(p => p.trim()).filter(Boolean);
      } else if (line.includes(',') && !line.startsWith('[')) {
        parts = line.split(',').map(p => p.trim());
      } else {
        // Single line title, possibly with [子議題] prefix or [摘要 XX]
        parts = [line];
      }

      let title = parts[0] || `論文題目 ${index + 1}`;
      let subThemeStr = parts[1] || '';
      let author = parts[2] || '去識別化作者';

      // Clean up common prefix like 1. 2. or [摘要 01]
      title = title.replace(/^(\d+[\.、\s]+|\[摘要\s*\d+\]\s*)/i, '').trim();

      const matchedSubTheme = matchSubTheme(subThemeStr, title);

      parsed.push({
        id: String(currentCount + index + 1).padStart(2, '0'),
        title,
        subTheme: matchedSubTheme,
        author,
        spatialScale: '流域/區域',
        content: `本論文聚焦於「${title}」，探討相關空間現象與實證脈絡。`
      });
    });

    setGridRows(parsed);
    setActiveStep('review');
  };

  const handleAddEmptyRow = () => {
    const nextId = String(currentCount + gridRows.length + 1).padStart(2, '0');
    setGridRows([
      ...gridRows,
      {
        id: nextId,
        title: '',
        subTheme: `${subThemes[0]?.number || 1}. ${subThemes[0]?.name || ''}`,
        author: '去識別化作者',
        spatialScale: '流域/區域',
        content: ''
      }
    ]);
  };

  const handleUpdateRow = (index: number, field: keyof GridRow, value: any) => {
    const updated = [...gridRows];
    updated[index] = { ...updated[index], [field]: value };
    setGridRows(updated);
  };

  const handleRemoveRow = (index: number) => {
    setGridRows(gridRows.filter((_, i) => i !== index));
  };

  const handleConfirm = () => {
    const validRows = gridRows.filter(r => r.title.trim().length > 0);
    if (validRows.length === 0) return;

    const items: AbstractItem[] = validRows.map((r, idx) => ({
      id: String(currentCount + idx + 1).padStart(2, '0'),
      title: r.title.trim(),
      targetSubTheme: r.subTheme,
      author: r.author || '去識別化作者',
      affiliation: '國立大學地理學系',
      spatialScale: r.spatialScale,
      methodology: '地理空間實證分析',
      keywords: [r.subTheme.slice(0, 4)],
      content: r.content || `論文篇名：${r.title}。所屬子議題：${r.subTheme}。`
    }));

    onConfirmImport(items);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 max-w-4xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#064E3B] text-white flex items-center justify-center shadow-xs">
                <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                複製貼上論文與子議題 (表格格式上傳)
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              每一欄為一個題目，也可直接附帶所屬子議題（如從 Excel 或 Word 表格整列複製貼上）
            </p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
          <button
            onClick={() => setActiveStep('paste')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeStep === 'paste'
                ? 'bg-[#064E3B] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            步驟 1：直接複製貼上文字/表格
          </button>
          <button
            onClick={() => { if (gridRows.length > 0) setActiveStep('review'); }}
            disabled={gridRows.length === 0}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeStep === 'review'
                ? 'bg-[#064E3B] text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 disabled:opacity-40'
            }`}
          >
            步驟 2：欄位檢閱與微調 ({gridRows.length} 篇)
          </button>
        </div>

        {/* Step 1: Text/Excel Paste Area */}
        {activeStep === 'paste' && (
          <div className="space-y-3 flex-1 flex flex-col overflow-hidden">
            <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              <span className="font-bold text-slate-800 dark:text-slate-200 block mb-1">
                📋 支援格式說明（支援從 Excel / Google 試算表直接整批複製）：
              </span>
              <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
                <li><strong>格式 A（題目 + 子議題）：</strong><code>論文題目 [Tab鍵或逗號] 空間資訊、地理人工智慧與新興科技</code></li>
                <li><strong>格式 B（僅貼上題目）：</strong>每一行就是一個題目，系統將自動比對關鍵字為您媒合 2027 研討會的 6 大子議題。</li>
              </ul>
            </div>

            <textarea
              rows={10}
              value={pasteText}
              onChange={(e) => setPasteText(e.target.value)}
              placeholder={`例如從 Excel 複製貼上：
基於無人機LiDAR之雪霸高山崩塌地微地貌監測	空間資訊、地理人工智慧與新興科技
氣候變遷情境下曾文水庫集水區崩塌敏感度模式	氣候變遷、環境監測與生態系統
氣候正義視角下的都市調適治理：臺北市韌性社區	環境災害、社會韌性與永續治理
澎湖傳統咾咕石眷落文化地景與地方認同	文化地景、感官經驗與地方認同
泰雅族傳統獵場空間建構與部落環境共治	原住民族地理、傳統智慧與環境共治
高中地理走讀VR虛擬實境教學模組設計與成效評估	地理教育、環境認知與跨域學習`}
              className="w-full flex-1 p-3 font-mono text-xs bg-slate-50 dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-1 focus:ring-emerald-700 leading-relaxed"
            />

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPasteText(`[論文題目範例一]\t1. 空間資訊、地理人工智慧與新興科技
[論文題目範例二]\t2. 氣候變遷、環境監測與生態系統
[論文題目範例三]\t3. 環境災害、社會韌性與永續治理`);
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 cursor-pointer"
                >
                  填入格式語法範本 (Tab分隔)
                </button>
                {pasteText && (
                  <button
                    type="button"
                    onClick={() => setPasteText('')}
                    className="text-xs text-rose-600 hover:text-rose-800 cursor-pointer"
                  >
                    清空輸入框
                  </button>
                )}
              </div>

              <button
                onClick={handleParsePaste}
                disabled={!pasteText.trim()}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#064E3B] hover:bg-[#043D2F] dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-all shadow-xs disabled:opacity-40 cursor-pointer active:scale-[0.98]"
              >
                自動解析欄位並預覽表格
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Grid Row Review & Editing */}
        {activeStep === 'review' && (
          <div className="space-y-3 flex-1 flex flex-col overflow-hidden">
            <div className="flex items-center justify-between text-xs text-slate-500">
              <span>已解析 {gridRows.length} 篇論文，您可在此直接手動微調題目或切換指定子議題：</span>
              <button
                onClick={handleAddEmptyRow}
                className="flex items-center gap-1 text-emerald-800 dark:text-emerald-400 font-semibold hover:underline cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>新增一列題目</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-10">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-200 w-12">#</th>
                    <th className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-200">論文題目 (Title)</th>
                    <th className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-200 w-72">所屬子議題 (Sub-Theme)</th>
                    <th className="py-2.5 px-3 font-semibold text-slate-700 dark:text-slate-200 w-16 text-center">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {gridRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40">
                      <td className="py-2 px-3 font-mono-data text-slate-400 font-bold">
                        {idx + 1}
                      </td>
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={row.title}
                          onChange={(e) => handleUpdateRow(idx, 'title', e.target.value)}
                          placeholder="請輸入論文題目..."
                          className="w-full px-2 py-1 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 font-medium"
                        />
                      </td>
                      <td className="py-2 px-3">
                        <select
                          value={row.subTheme}
                          onChange={(e) => handleUpdateRow(idx, 'subTheme', e.target.value)}
                          className="w-full px-2 py-1 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100 truncate"
                        >
                          {subThemes.map((st) => (
                            <option key={st.id} value={`${st.number}. ${st.name}`}>
                              {st.number}. {st.name}
                            </option>
                          ))}
                          <option value="獨立/特殊議題 (推薦海報發表)">
                            獨立/特殊議題 (推薦海報發表)
                          </option>
                        </select>
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => handleRemoveRow(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                          title="刪除此列"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                onClick={() => setActiveStep('paste')}
                className="text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 cursor-pointer"
              >
                ← 返回重新貼上
              </button>

              <button
                onClick={handleConfirm}
                disabled={gridRows.filter(r => r.title.trim()).length === 0}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#064E3B] hover:bg-[#043D2F] dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-all shadow-xs cursor-pointer disabled:opacity-40 active:scale-[0.98]"
              >
                確認匯入這 {gridRows.filter(r => r.title.trim()).length} 篇論文
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
