import React, { useState } from 'react';
import { 
  Clock, 
  MapPin, 
  UserCheck, 
  Layers, 
  MoveRight, 
  Sparkles, 
  FileText, 
  Plus, 
  Trash2, 
  Edit3, 
  ChevronRight,
  Info
} from 'lucide-react';
import { Session, PosterPaper, AbstractItem, ClusteringResult } from '../types';

interface AgendaKanbanProps {
  clustering: ClusteringResult | null;
  abstracts: AbstractItem[];
  onUpdateClustering: (updated: ClusteringResult) => void;
  onSelectAbstractDetail: (item: AbstractItem) => void;
  onOpenChat: () => void;
}

export const AgendaKanban: React.FC<AgendaKanbanProps> = ({
  clustering,
  abstracts,
  onUpdateClustering,
  onSelectAbstractDetail,
  onOpenChat,
}) => {
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCommonality, setEditCommonality] = useState('');
  const [editRoom, setEditRoom] = useState('');
  const [editTimeSlot, setEditTimeSlot] = useState('');
  const [editChair, setEditChair] = useState('');

  if (!clustering || !clustering.sessions || clustering.sessions.length === 0) {
    return (
      <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 max-w-4xl mx-auto my-6 p-8">
        <Layers className="w-12 h-12 mx-auto text-emerald-800/60 dark:text-emerald-400/60 mb-3" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
          尚未執行論文摘要自動分群
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto mt-1 mb-6">
          請點擊頂部導航列的「執行自動分群」按鈕，系統將依據研究主題、空間尺度與研究方法，智慧編組為 4 個標準學術發表場次。
        </p>
      </div>
    );
  }

  const getAbstract = (id: string): AbstractItem | undefined => {
    return abstracts.find((a) => a.id === id);
  };

  const startEditSession = (session: Session) => {
    setEditingSessionId(session.id);
    setEditTitle(session.title);
    setEditCommonality(session.commonality);
    setEditRoom(session.room || '');
    setEditTimeSlot(session.timeSlot || '');
    setEditChair(session.chairSuggestion || '');
  };

  const saveEditSession = (sessionId: string) => {
    const updatedSessions = clustering.sessions.map((s) => {
      if (s.id === sessionId) {
        return {
          ...s,
          title: editTitle,
          commonality: editCommonality,
          room: editRoom,
          timeSlot: editTimeSlot,
          chairSuggestion: editChair
        };
      }
      return s;
    });

    onUpdateClustering({
      ...clustering,
      sessions: updatedSessions
    });
    setEditingSessionId(null);
  };

  const movePaperToSession = (paperId: string, fromSessionId: string, targetSessionId: string) => {
    const updatedSessions = clustering.sessions.map((s) => {
      if (s.id === fromSessionId) {
        return {
          ...s,
          paperIds: s.paperIds.filter((id) => id !== paperId)
        };
      }
      if (s.id === targetSessionId) {
        return {
          ...s,
          paperIds: s.paperIds.includes(paperId) ? s.paperIds : [...s.paperIds, paperId]
        };
      }
      return s;
    });

    onUpdateClustering({
      ...clustering,
      sessions: updatedSessions
    });
  };

  const movePaperToPoster = (paperId: string, fromSessionId: string) => {
    const updatedSessions = clustering.sessions.map((s) => {
      if (s.id === fromSessionId) {
        return {
          ...s,
          paperIds: s.paperIds.filter((id) => id !== paperId)
        };
      }
      return s;
    });

    const existingPoster = clustering.posters.find((p) => p.paperId === paperId);
    const updatedPosters = existingPoster
      ? clustering.posters
      : [
          ...clustering.posters,
          {
            paperId,
            reason: '由議程總召手動移轉為海報發表，建議加強展板交流'
          }
        ];

    onUpdateClustering({
      ...clustering,
      sessions: updatedSessions,
      posters: updatedPosters
    });
  };

  const movePosterToSession = (paperId: string, targetSessionId: string) => {
    const updatedPosters = clustering.posters.filter((p) => p.paperId !== paperId);
    const updatedSessions = clustering.sessions.map((s) => {
      if (s.id === targetSessionId) {
        return {
          ...s,
          paperIds: [...s.paperIds, paperId]
        };
      }
      return s;
    });

    onUpdateClustering({
      ...clustering,
      sessions: updatedSessions,
      posters: updatedPosters
    });
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto py-2">
      {/* Convener Review & Quick Chat Prompt Bar */}
      <div className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#064E3B] dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5 border border-emerald-200/70 dark:border-emerald-800/60">
            <Sparkles className="w-4 h-4 text-emerald-700 dark:text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
              <span className="font-bold text-slate-900 dark:text-slate-100">{clustering.versionName}</span>
              <span>·</span>
              <span className="font-mono-data">{clustering.timestamp}</span>
            </div>
            <p className="text-xs text-slate-700 dark:text-slate-300 mt-1 leading-relaxed max-w-3xl">
              {clustering.convenerNotes}
            </p>
          </div>
        </div>
        <button
          onClick={onOpenChat}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-[#064E3B] dark:text-emerald-300 bg-emerald-50/70 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800/80 rounded-lg hover:bg-emerald-100/70 dark:hover:bg-emerald-900/60 transition-colors shrink-0 whitespace-nowrap cursor-pointer shadow-2xs"
        >
          <span>教授微調對話 (AI Assistant)</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Oral Sessions Grid (Typically 4 sessions) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {clustering.sessions.map((session, sIdx) => {
          const isEditing = editingSessionId === session.id;

          return (
            <div
              key={session.id}
              className="p-5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between"
            >
              <div>
                {/* Session Top Bar: Number & Actions */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="min-w-6 px-1.5 h-6 rounded-md bg-[#064E3B] text-white font-mono-data text-xs font-bold flex items-center justify-center shadow-xs">
                      {session.sessionCode || session.sessionNumber || sIdx + 1}
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-900 dark:text-emerald-300">
                        {session.sessionCode ? `場次 ${session.sessionCode}` : `場次 ${sIdx + 1}`}
                      </span>
                      {session.timeBlockLabel && (
                        <span className="text-[10px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded border border-slate-200/80 dark:border-slate-700">
                          {session.timeBlockLabel}
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-slate-400 font-mono-data">
                      ({session.paperIds.length} 篇論文)
                    </span>
                  </div>
                  <button
                    onClick={() => (isEditing ? saveEditSession(session.id) : startEditSession(session))}
                    className="p-1 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                    title={isEditing ? '儲存修改' : '編輯場次資訊'}
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Session Header Fields */}
                {isEditing ? (
                  <div className="space-y-2 mb-4 bg-slate-50 dark:bg-slate-900/60 p-3 rounded-lg border border-slate-200 dark:border-slate-700 text-xs">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        學術標題
                      </label>
                      <input
                        type="text"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        className="w-full px-2 py-1 bg-white dark:bg-slate-800 border rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        核心共通點簡述 (30字內)
                      </label>
                      <input
                        type="text"
                        value={editCommonality}
                        onChange={(e) => setEditCommonality(e.target.value)}
                        className="w-full px-2 py-1 bg-white dark:bg-slate-800 border rounded text-xs"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                          時段
                        </label>
                        <input
                          type="text"
                          value={editTimeSlot}
                          onChange={(e) => setEditTimeSlot(e.target.value)}
                          placeholder="09:00 - 10:30"
                          className="w-full px-2 py-1 bg-white dark:bg-slate-800 border rounded text-xs font-mono-data"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                          會議室
                        </label>
                        <input
                          type="text"
                          value={editRoom}
                          onChange={(e) => setEditRoom(e.target.value)}
                          placeholder="第一國際會議廳"
                          className="w-full px-2 py-1 bg-white dark:bg-slate-800 border rounded text-xs"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                        推薦主持人專長
                      </label>
                      <input
                        type="text"
                        value={editChair}
                        onChange={(e) => setEditChair(e.target.value)}
                        placeholder="水文氣候與防災地理專長"
                        className="w-full px-2 py-1 bg-white dark:bg-slate-800 border rounded text-xs"
                      />
                    </div>
                    <button
                      onClick={() => saveEditSession(session.id)}
                      className="mt-1 px-3 py-1 bg-emerald-800 text-white rounded text-xs font-medium"
                    >
                      儲存變更
                    </button>
                  </div>
                ) : (
                  <div className="mb-4">
                    <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 leading-snug">
                      {session.title}
                    </h3>
                    
                    {/* Commonality box strictly obeying <= 30 words */}
                    <div className="mt-2 text-xs text-slate-800 dark:text-slate-200 bg-[#F8FAFC] dark:bg-slate-950/70 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 leading-relaxed">
                      <span className="font-bold text-slate-600 dark:text-slate-400 mr-1.5">共通點：</span>
                      <span>{session.commonality}</span>
                    </div>

                    {/* Schedule & Chair Metadata - unboxed with separators */}
                    <div className="mt-2.5 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 flex-wrap">
                      <div className="flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span className="font-mono-data text-slate-700 dark:text-slate-300">{session.timeSlot || '09:00 - 10:30'}</span>
                      </div>
                      <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                      <div className="flex items-center gap-1 font-medium">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-slate-700 dark:text-slate-300">{session.room || '第一國際會議廳'}</span>
                      </div>
                      {session.chairSuggestion && (
                        <>
                          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
                          <div className="flex items-center gap-1 truncate max-w-[200px]" title={session.chairSuggestion}>
                            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-slate-700 dark:text-slate-300">主持：{session.chairSuggestion}</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Papers List inside this Session */}
                <div className="space-y-2.5 mt-4">
                  {session.paperIds.map((pId) => {
                    const item = getAbstract(pId);
                    if (!item) return null;

                    return (
                      <div
                        key={pId}
                        className="p-3.5 rounded-lg bg-[#F8FAFC] dark:bg-slate-950/70 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-700/50 transition-colors shadow-2xs"
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="font-mono-data text-xs font-bold text-emerald-900 dark:text-emerald-400">
                            [摘要 {item.id}]
                          </span>
                          
                          {/* Reassign Paper Menu */}
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => onSelectAbstractDetail(item)}
                              className="text-[11px] font-medium text-slate-500 hover:text-emerald-800 dark:hover:text-emerald-400 px-1.5 py-0.5 rounded cursor-pointer transition-colors"
                              title="查看全文"
                            >
                              檢視
                            </button>
                            <select
                              defaultValue=""
                              onChange={(e) => {
                                const val = e.target.value;
                                if (val === 'poster') {
                                  movePaperToPoster(pId, session.id);
                                } else if (val) {
                                  movePaperToSession(pId, session.id, val);
                                }
                                e.target.value = '';
                              }}
                              className="text-[11px] bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 rounded px-2 py-0.5 text-slate-700 dark:text-slate-300 cursor-pointer shadow-2xs"
                            >
                              <option value="" disabled>移轉至...</option>
                              {clustering.sessions.map((otherS) => {
                                if (otherS.id === session.id) return null;
                                return (
                                  <option key={otherS.id} value={otherS.id}>
                                    移至：場次 {otherS.sessionNumber} ({otherS.title.slice(0, 10)}...)
                                  </option>
                                );
                              })}
                              <option value="poster">移至：海報發表區</option>
                            </select>
                          </div>
                        </div>

                        <h5 className="text-xs font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                          {item.title}
                        </h5>

                        {item.targetSubTheme && (
                          <div className="mt-1.5">
                            <span className="text-[10px] font-semibold text-emerald-950 dark:text-emerald-200 bg-emerald-50/90 dark:bg-emerald-950/70 border border-emerald-200/90 dark:border-emerald-800/80 px-2 py-0.5 rounded font-medium inline-block max-w-full truncate" title={item.targetSubTheme}>
                              子議題：{item.targetSubTheme}
                            </span>
                          </div>
                        )}

                        {item.author && (
                          <div className="mt-1.5 text-[11px] text-slate-400 dark:text-slate-500 truncate">
                            {item.author}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {session.paperIds.length === 0 && (
                    <div className="py-6 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                      本場次目前無論文，可從其他場次移轉或透過 AI 對話微調分配
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommended Poster Presentations Section (Special/Outlier Abstracts) */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 dark:text-amber-400 uppercase tracking-wider mb-0.5">
              <Info className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>建議轉為海報發表之獨立摘要 (Poster Presentations)</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400">
              依據底層 SOP 指令，主題或方法與四大口頭場次差異顯著之特殊研究，獨立列出以促進研討會茶敘期間進行深度展板交流。
            </p>
          </div>
          <span className="font-mono-data text-xs bg-amber-50 dark:bg-amber-950/70 text-amber-950 dark:text-amber-200 font-bold px-3 py-1 rounded-md self-start sm:self-auto border border-amber-200/90 dark:border-amber-800/80">
            {clustering.posters?.length || 0} 篇推薦海報發表
          </span>
        </div>

        {clustering.posters && clustering.posters.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {clustering.posters.map((poster) => {
              const item = getAbstract(poster.paperId);

              return (
                <div
                  key={poster.paperId}
                  className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-slate-950/70 border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between shadow-2xs"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="font-mono-data text-xs font-bold text-amber-900 dark:text-amber-400">
                        [摘要 {poster.paperId}]
                      </span>
                      <select
                        defaultValue=""
                        onChange={(e) => {
                          if (e.target.value) {
                            movePosterToSession(poster.paperId, e.target.value);
                          }
                          e.target.value = '';
                        }}
                        className="text-[11px] bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5 text-slate-600 dark:text-slate-300"
                      >
                        <option value="" disabled>移回口頭發表場次...</option>
                        {clustering.sessions.map((s) => (
                          <option key={s.id} value={s.id}>
                            移至場次 {s.sessionNumber} ({s.title.slice(0, 10)}...)
                          </option>
                        ))}
                      </select>
                    </div>

                    <h5 className="text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                      {item ? item.title : `摘要 ${poster.paperId}`}
                    </h5>

                    <div className="mt-2 text-xs text-slate-600 dark:text-slate-300 bg-amber-50/60 dark:bg-amber-950/30 p-2 rounded border border-amber-200/50 dark:border-amber-900/50 leading-relaxed">
                      <strong>推薦理由：</strong>{poster.reason}
                    </div>
                  </div>

                  {item && (
                    <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono-data">
                      <span>{item.spatialScale}</span>
                      <button
                        onClick={() => onSelectAbstractDetail(item)}
                        className="text-emerald-700 dark:text-emerald-400 hover:underline"
                      >
                        查看全文
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="py-6 text-center text-xs text-slate-400">
            目前所有摘要皆已編入口頭發表場次，無獨立海報發表論文。
          </div>
        )}
      </div>
    </div>
  );
};
