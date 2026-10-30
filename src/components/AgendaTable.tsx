import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Printer, 
  FileSpreadsheet, 
  Table as TableIcon, 
  ExternalLink,
  Info
} from 'lucide-react';
import { ClusteringResult, AbstractItem } from '../types';

interface AgendaTableProps {
  clustering: ClusteringResult | null;
  abstracts: AbstractItem[];
  onOpenTimetableModal: () => void;
}

export const AgendaTable: React.FC<AgendaTableProps> = ({
  clustering,
  abstracts,
  onOpenTimetableModal,
}) => {
  const [copiedMd, setCopiedMd] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  if (!clustering || !clustering.sessions || clustering.sessions.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 max-w-4xl mx-auto my-6 p-8">
        <TableIcon className="w-12 h-12 mx-auto text-emerald-800/60 dark:text-emerald-400/60 mb-3" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          尚未產出正式議程表格
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto mt-1">
          請先在「論文摘要庫」點擊「執行自動分群」，系統將輸出符合系辦標準格式之學術場次表格。
        </p>
      </div>
    );
  }

  const getAbstractTitle = (id: string): string => {
    const item = abstracts.find((a) => a.id === id);
    return item ? item.title : `摘要 ${id}`;
  };

  const generateMarkdownTable = (): string => {
    let md = `## 國立大學地理學系學術研討會 論文發表議程表\n\n`;
    md += `| 場次名稱 | 核心共通點簡述 (30字內) | 收錄摘要編號清單 | 建議時段與會議室 |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;

    clustering.sessions.forEach((s) => {
      const papers = s.paperIds.map((id) => `[摘要 ${id}] ${getAbstractTitle(id)}`).join('<br/>');
      md += `| **${s.title}** | ${s.commonality} | ${papers} | ${s.timeSlot || ''} (${s.room || ''}) |\n`;
    });

    if (clustering.posters && clustering.posters.length > 0) {
      md += `\n### 建議轉為海報發表之獨立摘要 (Poster Presentations)\n\n`;
      md += `| 摘要編號 | 論文篇名 | 建議轉為海報發表之原因 |\n`;
      md += `| :--- | :--- | :--- |\n`;
      clustering.posters.forEach((p) => {
        md += `| **[摘要 ${p.paperId}]** | ${getAbstractTitle(p.paperId)} | ${p.reason} |\n`;
      });
    }

    return md;
  };

  const handleCopyMarkdown = () => {
    const md = generateMarkdownTable();
    navigator.clipboard.writeText(md);
    setCopiedMd(true);
    setTimeout(() => setCopiedMd(false), 2000);
  };

  const handleCopyPlainText = () => {
    let txt = `【國立大學地理學系學術研討會 論文發表分群表】\n\n`;
    clustering.sessions.forEach((s, idx) => {
      txt += `[場次 ${idx + 1}] ${s.title}\n`;
      txt += `核心共通點：${s.commonality}\n`;
      txt += `時段/地點：${s.timeSlot || ''} / ${s.room || ''}\n`;
      txt += `收錄摘要：\n`;
      s.paperIds.forEach((id) => {
        txt += `  - [摘要 ${id}] ${getAbstractTitle(id)}\n`;
      });
      txt += `\n`;
    });

    if (clustering.posters && clustering.posters.length > 0) {
      txt += `【建議海報發表之獨立摘要】\n`;
      clustering.posters.forEach((p) => {
        txt += `  - [摘要 ${p.paperId}] ${getAbstractTitle(p.paperId)} (${p.reason})\n`;
      });
    }

    navigator.clipboard.writeText(txt);
    setCopiedText(true);
    setTimeout(() => setCopiedText(false), 2000);
  };

  const handleExportCsv = () => {
    let csv = `場次名稱,核心共通點簡述,摘要編號,論文標題,時段,會議室,主持人\n`;
    clustering.sessions.forEach((s) => {
      s.paperIds.forEach((id) => {
        const title = getAbstractTitle(id).replace(/"/g, '""');
        const comm = s.commonality.replace(/"/g, '""');
        csv += `"${s.title}","${comm}","${id}","${title}","${s.timeSlot || ''}","${s.room || ''}","${s.chairSuggestion || ''}"\n`;
      });
    });

    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `地理研討會議程分群表_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto py-2">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
            研討會論文發表正式表格 (Official Symposium Table)
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            符合系辦 SOP 要求：場次名稱、核心共通點（30字內）、收錄摘要編號清單、海報獨立專區
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={handleCopyMarkdown}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
          >
            {copiedMd ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copiedMd ? '已複製 Markdown' : '複製 Markdown 表格'}</span>
          </button>

          <button
            onClick={handleCopyPlainText}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
          >
            {copiedText ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
            <span>{copiedText ? '已複製純文字' : '複製純文字簡報'}</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors whitespace-nowrap cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
            <span>匯出 CSV</span>
          </button>

          <button
            onClick={onOpenTimetableModal}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#064E3B] hover:bg-[#043D2F] dark:bg-emerald-700 dark:hover:bg-emerald-600 rounded-lg transition-all whitespace-nowrap cursor-pointer shadow-xs active:scale-[0.98]"
          >
            <Printer className="w-3.5 h-3.5 text-emerald-300" />
            <span>列印 / 預覽研討會議程手冊</span>
          </button>
        </div>
      </div>

      {/* Main Academic Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200/90 dark:border-slate-800">
              <th className="py-3 px-4 font-bold text-slate-700 dark:text-slate-200 w-48 tracking-wider uppercase text-[11px]">
                場次名稱
              </th>
              <th className="py-3 px-4 font-bold text-slate-700 dark:text-slate-200 w-64 tracking-wider uppercase text-[11px]">
                核心共通點簡述 (30字內)
              </th>
              <th className="py-3 px-4 font-bold text-slate-700 dark:text-slate-200 tracking-wider uppercase text-[11px]">
                收錄摘要編號清單與篇名
              </th>
              <th className="py-3 px-4 font-bold text-slate-700 dark:text-slate-200 w-44 tracking-wider uppercase text-[11px]">
                建議時段 / 會議室
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {clustering.sessions.map((session, idx) => (
              <tr
                key={session.id}
                className="hover:bg-slate-50/70 dark:hover:bg-slate-900/50 transition-colors align-top"
              >
                <td className="py-4 px-4 font-semibold text-slate-900 dark:text-slate-100">
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <span className="min-w-5 px-1.5 h-5 rounded bg-[#064E3B] text-white font-mono-data text-[10px] font-bold flex items-center justify-center shrink-0 shadow-2xs">
                      {session.sessionCode || session.sessionNumber || idx + 1}
                    </span>
                    <span className="text-emerald-950 dark:text-emerald-300 font-bold text-sm">
                      {session.title}
                    </span>
                  </div>
                  {session.timeBlockLabel && (
                    <div className="inline-block text-[10px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200/80 dark:border-slate-700 mt-0.5 mb-1">
                      {session.timeBlockLabel}
                    </div>
                  )}
                  {session.chairSuggestion && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 font-normal mt-0.5">
                      主持：{session.chairSuggestion}
                    </div>
                  )}
                </td>

                <td className="py-4 px-4 text-slate-700 dark:text-slate-300 leading-relaxed">
                  <div className="p-3 rounded-lg bg-[#F8FAFC] dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 text-xs">
                    {session.commonality}
                  </div>
                  <div className="mt-1.5 text-[10px] text-slate-400 font-mono-data">
                    字數：{session.commonality.length} 字 (限制 $\le$ 30字)
                  </div>
                </td>

                <td className="py-4 px-4 text-slate-800 dark:text-slate-200 space-y-2.5">
                  {session.paperIds.map((pId) => {
                    const item = abstracts.find((a) => a.id === pId);
                    return (
                      <div key={pId} className="flex items-start gap-2.5">
                        <span className="font-mono-data text-xs font-bold text-emerald-900 dark:text-emerald-400 shrink-0">
                          [摘要 {pId}]
                        </span>
                        <div className="flex-1">
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {item ? item.title : `摘要 ${pId}`}
                          </span>
                          {item?.targetSubTheme && (
                            <span className="inline-block ml-2 text-[10px] text-emerald-950 dark:text-emerald-200 bg-emerald-50/90 dark:bg-emerald-950/70 border border-emerald-200/90 dark:border-emerald-800/80 px-2 py-0.5 rounded font-semibold">
                              {item.targetSubTheme}
                            </span>
                          )}
                          {item?.author && (
                            <span className="block text-[11px] text-slate-400 dark:text-slate-500 font-mono-data mt-0.5">
                              作者：{item.author}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </td>

                <td className="py-4 px-4 text-slate-600 dark:text-slate-400 font-mono-data text-xs">
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{session.timeSlot || '09:00 - 10:30'}</div>
                  <div className="text-slate-500 text-[11px] font-sans mt-0.5">
                    {session.room || '第一國際會議廳'}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Recommended Poster Presentations Table (Bottom of Table) */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100 dark:border-slate-800">
          <Info className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          <h4 className="text-sm font-bold text-amber-950 dark:text-amber-300">
            【建議轉為海報發表之獨立摘要清單】(依據底層 SOP 指令獨立列出)
          </h4>
        </div>

        {clustering.posters && clustering.posters.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-slate-200/90 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950/70">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-100/80 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-4 w-24">摘要編號</th>
                  <th className="py-2.5 px-4 w-80">論文篇名</th>
                  <th className="py-2.5 px-4">建議轉為海報發表之學術理由</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {clustering.posters.map((poster) => {
                  const item = abstracts.find((a) => a.id === poster.paperId);
                  return (
                    <tr key={poster.paperId} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                      <td className="py-3 px-4 font-mono-data font-bold text-amber-900 dark:text-amber-400">
                        [摘要 {poster.paperId}]
                      </td>
                      <td className="py-3 px-4 font-bold text-slate-900 dark:text-slate-100">
                        {item ? item.title : `摘要 ${poster.paperId}`}
                      </td>
                      <td className="py-3 px-4 text-slate-700 dark:text-slate-300 leading-relaxed">
                        {poster.reason}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-slate-500">目前無難以歸類之特殊論文，皆已合宜納入口頭發表場次。</p>
        )}
      </div>
    </div>
  );
};
