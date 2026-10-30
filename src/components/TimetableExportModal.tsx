import React, { useState } from 'react';
import { X, Printer, Copy, Check, Download, Calendar, MapPin, UserCheck, Sparkles } from 'lucide-react';
import { ClusteringResult, AbstractItem } from '../types';

interface TimetableExportModalProps {
  clustering: ClusteringResult;
  abstracts: AbstractItem[];
  config?: any;
  onClose: () => void;
}

export const TimetableExportModal: React.FC<TimetableExportModalProps> = ({
  clustering,
  abstracts,
  config,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  const confTitle = config?.conferenceTitle || '2027年臺灣地理學術研討會';
  const confDate = config?.conferenceDate || '2027年秋季研討會';
  const confVenue = config?.conferenceVenue || '國立臺灣師範大學地理學系館 國際會議廳、演講廳';
  const deptName = config?.departmentName || '國立臺灣師範大學地理學系';

  const getAbstractTitle = (id: string): string => {
    const item = abstracts.find((a) => a.id === id);
    return item ? item.title : `摘要 ${id}`;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleCopyFormattedHandbook = () => {
    let handbook = `${confTitle} 論文發表議程手冊\n`;
    handbook += `會議日期：${confDate}\n`;
    handbook += `主辦單位：${deptName}\n`;
    handbook += `舉辦地點：${confVenue}\n\n`;
    handbook += `========================================================\n\n`;

    clustering.sessions.forEach((s, idx) => {
      handbook += `【場次 ${idx + 1}】${s.title}\n`;
      handbook += `時間：${s.timeSlot || ''} ｜ 會議室：${s.room || ''} ｜ 主持人：${s.chairSuggestion || '邀請中'}\n`;
      handbook += `場次主軸：${s.commonality}\n`;
      handbook += `發表論文：\n`;
      s.paperIds.forEach((id, pIdx) => {
        handbook += `  ${pIdx + 1}. [摘要 ${id}] ${getAbstractTitle(id)}\n`;
      });
      handbook += `\n--------------------------------------------------------\n\n`;
    });

    if (clustering.posters && clustering.posters.length > 0) {
      handbook += `【海報論文展覽專區】(10:30-10:50 / 15:00-15:20 展板深度交流)\n`;
      clustering.posters.forEach((p, idx) => {
        handbook += `  P${idx + 1}. [摘要 ${p.paperId}] ${getAbstractTitle(p.paperId)}\n`;
        handbook += `     推薦理由：${p.reason}\n`;
      });
    }

    navigator.clipboard.writeText(handbook);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 max-w-4xl w-full p-6 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Modal Controls */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              研討會議程總表手冊 (Official Program Schedule)
            </h3>
            <p className="text-xs text-slate-500">
              可直接列印成研討會秩序冊或提供系辦印製會議講義
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyFormattedHandbook}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copied ? '已複製手冊全文' : '複製議程手冊文字'}</span>
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-1.5 text-xs font-semibold text-white bg-[#064E3B] hover:bg-[#043D2F] dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-all shadow-xs cursor-pointer active:scale-[0.98]"
            >
              <Printer className="w-3.5 h-3.5 text-emerald-300" />
              <span>列印 / 存為 PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors ml-2 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Symposium Schedule Document */}
        <div className="p-8 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 rounded-xl border border-slate-200 dark:border-slate-800 space-y-6 shadow-xs font-sans print:border-none print:p-0">
          {/* Header */}
          <div className="text-center pb-6 border-b border-slate-200 dark:border-slate-800">
            <div className="text-xs uppercase tracking-widest text-emerald-900 dark:text-emerald-400 font-bold mb-1">
              {deptName}
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100">
              {confTitle} 論文發表議程總表
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              日期：{confDate} ｜ 地點：{confVenue} ｜ 主辦：{deptName}
            </p>
          </div>

          {/* Schedule timeline */}
          <div className="space-y-4 text-xs">
            {/* Opening */}
            <div className="flex gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <span className="font-mono-data font-bold text-slate-500 w-28 shrink-0">
                08:30 - 09:00
              </span>
              <div>
                <span className="font-bold">報到領取會議手冊 & 開幕致詞</span>
                <span className="text-slate-500 ml-2">系主任、文學院院長致詞 (第一國際會議廳)</span>
              </div>
            </div>

            {/* Session 1 */}
            {clustering.sessions[0] && (
              <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-data font-bold text-emerald-800 dark:text-emerald-400 w-28 shrink-0">
                      {clustering.sessions[0].timeSlot || '09:00 - 10:30'}
                    </span>
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      場次一：{clustering.sessions[0].title}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    地點：{clustering.sessions[0].room || '第一國際會議廳'} ｜ 主持：{clustering.sessions[0].chairSuggestion}
                  </div>
                </div>
                <div className="text-slate-600 dark:text-slate-400 mb-2 italic">
                  場次主軸：{clustering.sessions[0].commonality}
                </div>
                <div className="space-y-1.5 pl-2 border-l-2 border-emerald-800/40">
                  {clustering.sessions[0].paperIds.map((id, pIdx) => (
                    <div key={id} className="flex items-start gap-2">
                      <span className="font-mono-data text-emerald-800 font-bold shrink-0">
                        {pIdx + 1}. [摘要 {id}]
                      </span>
                      <span>{getAbstractTitle(id)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Poster & Tea Break 1 */}
            <div className="flex gap-4 p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
              <span className="font-mono-data font-bold text-amber-800 dark:text-amber-400 w-28 shrink-0">
                10:30 - 10:50
              </span>
              <div>
                <span className="font-bold text-amber-900 dark:text-amber-200">
                  上午茶敘 ＆ 海報論文交流時間 (Poster Session I)
                </span>
                <span className="text-slate-500 ml-2">系館一樓大廳展板區自由交流</span>
              </div>
            </div>

            {/* Session 2 */}
            {clustering.sessions[1] && (
              <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-data font-bold text-emerald-800 dark:text-emerald-400 w-28 shrink-0">
                      {clustering.sessions[1].timeSlot || '10:50 - 12:20'}
                    </span>
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      場次二：{clustering.sessions[1].title}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    地點：{clustering.sessions[1].room || 'B棟202演講廳'} ｜ 主持：{clustering.sessions[1].chairSuggestion}
                  </div>
                </div>
                <div className="text-slate-600 dark:text-slate-400 mb-2 italic">
                  場次主軸：{clustering.sessions[1].commonality}
                </div>
                <div className="space-y-1.5 pl-2 border-l-2 border-emerald-800/40">
                  {clustering.sessions[1].paperIds.map((id, pIdx) => (
                    <div key={id} className="flex items-start gap-2">
                      <span className="font-mono-data text-emerald-800 font-bold shrink-0">
                        {pIdx + 1}. [摘要 {id}]
                      </span>
                      <span>{getAbstractTitle(id)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Lunch */}
            <div className="flex gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <span className="font-mono-data font-bold text-slate-500 w-28 shrink-0">
                12:20 - 13:30
              </span>
              <div>
                <span className="font-bold">午餐交流 ＆ 地理學系友會專題分享</span>
                <span className="text-slate-500 ml-2">系會議室 / 文學咖啡廳</span>
              </div>
            </div>

            {/* Session 3 */}
            {clustering.sessions[2] && (
              <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-data font-bold text-emerald-800 dark:text-emerald-400 w-28 shrink-0">
                      {clustering.sessions[2].timeSlot || '13:30 - 15:00'}
                    </span>
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      場次三：{clustering.sessions[2].title}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    地點：{clustering.sessions[2].room || '第一國際會議廳'} ｜ 主持：{clustering.sessions[2].chairSuggestion}
                  </div>
                </div>
                <div className="text-slate-600 dark:text-slate-400 mb-2 italic">
                  場次主軸：{clustering.sessions[2].commonality}
                </div>
                <div className="space-y-1.5 pl-2 border-l-2 border-emerald-800/40">
                  {clustering.sessions[2].paperIds.map((id, pIdx) => (
                    <div key={id} className="flex items-start gap-2">
                      <span className="font-mono-data text-emerald-800 font-bold shrink-0">
                        {pIdx + 1}. [摘要 {id}]
                      </span>
                      <span>{getAbstractTitle(id)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Afternoon Tea */}
            <div className="flex gap-4 p-3 rounded-lg bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40">
              <span className="font-mono-data font-bold text-amber-800 dark:text-amber-400 w-28 shrink-0">
                15:00 - 15:20
              </span>
              <div>
                <span className="font-bold text-amber-900 dark:text-amber-200">
                  下午茶敘 ＆ 海報作者現場解說 (Poster Session II)
                </span>
                <span className="text-slate-500 ml-2">海報發表人於展板前回答與會者提問</span>
              </div>
            </div>

            {/* Session 4 */}
            {clustering.sessions[3] && (
              <div className="p-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-slate-100 dark:border-slate-800 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono-data font-bold text-emerald-800 dark:text-emerald-400 w-28 shrink-0">
                      {clustering.sessions[3].timeSlot || '15:20 - 16:50'}
                    </span>
                    <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      場次四：{clustering.sessions[3].title}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">
                    地點：{clustering.sessions[3].room || 'A棟305研討室'} ｜ 主持：{clustering.sessions[3].chairSuggestion}
                  </div>
                </div>
                <div className="text-slate-600 dark:text-slate-400 mb-2 italic">
                  場次主軸：{clustering.sessions[3].commonality}
                </div>
                <div className="space-y-1.5 pl-2 border-l-2 border-emerald-800/40">
                  {clustering.sessions[3].paperIds.map((id, pIdx) => (
                    <div key={id} className="flex items-start gap-2">
                      <span className="font-mono-data text-emerald-800 font-bold shrink-0">
                        {pIdx + 1}. [摘要 {id}]
                      </span>
                      <span>{getAbstractTitle(id)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Closing */}
            <div className="flex gap-4 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
              <span className="font-mono-data font-bold text-slate-500 w-28 shrink-0">
                16:50 - 17:30
              </span>
              <div>
                <span className="font-bold">綜合座談 ＆ 優秀學生論文頒獎典禮</span>
                <span className="text-slate-500 ml-2">全體與會學者合影與閉幕致詞</span>
              </div>
            </div>
          </div>

          {/* Posters Annex in Handbook */}
          {clustering.posters && clustering.posters.length > 0 && (
            <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
              <h3 className="font-bold text-sm mb-2 text-slate-900 dark:text-slate-100">
                附錄：海報論文發表清單 (Poster Presentations)
              </h3>
              <div className="space-y-2">
                {clustering.posters.map((p, idx) => (
                  <div key={p.paperId} className="p-2.5 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs">
                    <span className="font-mono-data font-bold text-amber-800 dark:text-amber-400 mr-2">
                      [海報 P{idx + 1} / 摘要 {p.paperId}]
                    </span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {getAbstractTitle(p.paperId)}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-1">
                      備註：{p.reason}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
