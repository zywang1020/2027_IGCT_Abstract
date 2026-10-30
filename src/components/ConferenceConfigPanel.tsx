import React, { useState } from 'react';
import { 
  Calendar, 
  MapPin, 
  Layers, 
  Plus, 
  Trash2, 
  Clock, 
  Check, 
  Info,
  Sliders,
  Sparkles,
  BookOpen,
  Edit2,
  Copy
} from 'lucide-react';
import { SystemConfig, SubTheme, TimeBlockConfig, ParallelSessionConfig } from '../types';
import { OFFICIAL_2027_SUBTHEMES, DEFAULT_TIME_BLOCKS } from '../data/sampleAbstracts';

interface ConferenceConfigPanelProps {
  config: SystemConfig;
  onUpdateConfig: (newConfig: Partial<SystemConfig>) => void;
  onTriggerRecluster: () => void;
  abstractCount: number;
}

export const ConferenceConfigPanel: React.FC<ConferenceConfigPanelProps> = ({
  config,
  onUpdateConfig,
  onTriggerRecluster,
  abstractCount,
}) => {
  const [newSubThemeName, setNewSubThemeName] = useState('');
  const [newSubThemeDesc, setNewSubThemeDesc] = useState('');
  const [newBlockLabel, setNewBlockLabel] = useState('');
  const [newBlockTime, setNewBlockTime] = useState('');

  const timeBlocks = config.timeBlocks || DEFAULT_TIME_BLOCKS;

  // Calculate total sessions across all time blocks
  const totalSessionsCount = timeBlocks.reduce((acc, block) => acc + (block.sessions?.length || block.sessionCount || 0), 0);

  // Time Block Operations
  const handleUpdateBlockLabel = (blockId: string, label: string) => {
    const updated = timeBlocks.map(b => b.id === blockId ? { ...b, label } : b);
    onUpdateConfig({ timeBlocks: updated });
  };

  const handleUpdateBlockTime = (blockId: string, timeSlot: string) => {
    const updated = timeBlocks.map(b => b.id === blockId ? { ...b, timeSlot } : b);
    onUpdateConfig({ timeBlocks: updated });
  };

  const handleSetBlockSessionCount = (blockId: string, count: number) => {
    const validCount = Math.max(1, Math.min(count, 8));
    const updated = timeBlocks.map(b => {
      if (b.id !== blockId) return b;

      const currentSessions = b.sessions || [];
      const newSessions: ParallelSessionConfig[] = [];
      const blockLetter = b.label.match(/[A-Za-z]/)?.[0] || 'A';

      for (let i = 1; i <= validCount; i++) {
        if (currentSessions[i - 1]) {
          newSessions.push(currentSessions[i - 1]);
        } else {
          newSessions.push({
            id: `s-${b.id}-${i}`,
            code: `${blockLetter}${i}`,
            room: i % 2 === 1 ? '第一國際會議廳 (A棟101)' : '地理資訊科技演講廳 (B棟202)',
            chairSuggestion: `${b.label}場次 ${i} 專題主持`
          });
        }
      }

      return {
        ...b,
        sessionCount: validCount,
        sessions: newSessions
      };
    });

    const newTotal = updated.reduce((acc, b) => acc + (b.sessions?.length || 0), 0);
    onUpdateConfig({ 
      timeBlocks: updated,
      targetSessionCount: newTotal
    });
  };

  const handleUpdateSessionInBlock = (blockId: string, sessionIndex: number, field: keyof ParallelSessionConfig, value: string) => {
    const updated = timeBlocks.map(b => {
      if (b.id !== blockId) return b;
      const sessions = [...b.sessions];
      if (sessions[sessionIndex]) {
        sessions[sessionIndex] = { ...sessions[sessionIndex], [field]: value };
      }
      return { ...b, sessions };
    });
    onUpdateConfig({ timeBlocks: updated });
  };

  const handleAddSessionToBlock = (blockId: string) => {
    const targetBlock = timeBlocks.find(b => b.id === blockId);
    if (!targetBlock) return;
    handleSetBlockSessionCount(blockId, (targetBlock.sessions?.length || 0) + 1);
  };

  const handleRemoveSessionFromBlock = (blockId: string, sessionIndex: number) => {
    const updated = timeBlocks.map(b => {
      if (b.id !== blockId) return b;
      const sessions = b.sessions.filter((_, i) => i !== sessionIndex);
      return {
        ...b,
        sessionCount: sessions.length,
        sessions
      };
    });
    const newTotal = updated.reduce((acc, b) => acc + (b.sessions?.length || 0), 0);
    onUpdateConfig({ 
      timeBlocks: updated,
      targetSessionCount: newTotal
    });
  };

  const handleAddNewTimeBlock = () => {
    const nextLetterIndex = timeBlocks.length;
    const letter = String.fromCharCode(65 + (nextLetterIndex % 26)); // A, B, C, D, E...
    const label = newBlockLabel.trim() || `時段 ${letter}`;
    const timeSlot = newBlockTime.trim() || '15:20 - 16:50';

    const newBlock: TimeBlockConfig = {
      id: `block-${Date.now()}`,
      label,
      timeSlot,
      sessionCount: 2,
      sessions: [
        {
          id: `s-${Date.now()}-1`,
          code: `${letter}1`,
          room: '第一國際會議廳 (A棟101)',
          chairSuggestion: `${label} 場次 1 主持`
        },
        {
          id: `s-${Date.now()}-2`,
          code: `${letter}2`,
          room: '地理資訊科技演講廳 (B棟202)',
          chairSuggestion: `${label} 場次 2 主持`
        }
      ]
    };

    const updated = [...timeBlocks, newBlock];
    const newTotal = updated.reduce((acc, b) => acc + (b.sessions?.length || 0), 0);
    onUpdateConfig({
      timeBlocks: updated,
      targetSessionCount: newTotal
    });

    setNewBlockLabel('');
    setNewBlockTime('');
  };

  const handleRemoveTimeBlock = (blockId: string) => {
    const updated = timeBlocks.filter(b => b.id !== blockId);
    const newTotal = updated.reduce((acc, b) => acc + (b.sessions?.length || 0), 0);
    onUpdateConfig({
      timeBlocks: updated,
      targetSessionCount: newTotal
    });
  };

  // Sub-theme operations
  const handleAddSubTheme = () => {
    if (!newSubThemeName.trim()) return;
    const nextNumber = (config.subThemes || []).length + 1;
    const newSub: SubTheme = {
      id: `subtheme-${Date.now()}`,
      number: nextNumber,
      name: newSubThemeName.trim(),
      description: newSubThemeDesc.trim() || '涵蓋相關領域之多元研究主題。'
    };
    onUpdateConfig({
      subThemes: [...(config.subThemes || []), newSub]
    });
    setNewSubThemeName('');
    setNewSubThemeDesc('');
  };

  const handleRemoveSubTheme = (id: string) => {
    const updated = (config.subThemes || []).filter(s => s.id !== id).map((s, idx) => ({
      ...s,
      number: idx + 1
    }));
    onUpdateConfig({ subThemes: updated });
  };

  const handleResetTo2027OfficialSubThemes = () => {
    onUpdateConfig({
      subThemes: OFFICIAL_2027_SUBTHEMES,
      conferenceTitle: '2027年臺灣地理學術研討會',
      conferenceDate: '2027年10月23日 (星期六)',
      conferenceVenue: '國立臺灣師範大學地理學系館 國際會議廳、演講廳',
      departmentName: '國立臺灣師範大學地理學系',
      timeBlocks: DEFAULT_TIME_BLOCKS,
      targetSessionCount: 8
    });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto py-2">
      {/* 2027 Conference Banner */}
      <div className="p-6 rounded-xl bg-[#064E3B] text-white shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 border border-emerald-700/60">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-900/90 text-emerald-200 mb-2 font-mono-data border border-emerald-600/40">
            2027 NTNU GEOGRAPHY SYMPOSIUM
          </div>
          <h2 className="text-xl font-bold tracking-tight text-white">
            2027 地理學術研討會 · 多時段與多場次配置
          </h2>
          <p className="text-xs text-emerald-100/90 mt-1 max-w-2xl leading-relaxed">
            支援「多個時段（如時段 A、B、C）」且「每個時段分開設定平行場次數（例如時段 A 有 2 個場次）」。AI 將自動在不同時段安排平行論文發表。
          </p>
        </div>
        <button
          onClick={handleResetTo2027OfficialSubThemes}
          className="px-3.5 py-2 text-xs font-semibold text-emerald-950 bg-white rounded-lg hover:bg-emerald-50 transition-all shrink-0 shadow-xs whitespace-nowrap self-start md:self-auto cursor-pointer"
        >
          還原 2027 官方設定
        </button>
      </div>

      {/* 1. Basic Conference Information */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-400 uppercase tracking-wider">
          <Calendar className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span>研討會基本資訊 (可隨時修改)</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              研討會全名
            </label>
            <input
              type="text"
              value={config.conferenceTitle}
              onChange={(e) => onUpdateConfig({ conferenceTitle: e.target.value })}
              placeholder="例如：2027年臺灣地理學術研討會"
              className="w-full px-3 py-2 text-xs bg-slate-50/70 dark:bg-slate-950 border border-slate-200/90 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-semibold focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              主辦學系
            </label>
            <input
              type="text"
              value={config.departmentName}
              onChange={(e) => onUpdateConfig({ departmentName: e.target.value })}
              placeholder="國立臺灣師範大學地理學系"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              舉辦日期
            </label>
            <input
              type="text"
              value={config.conferenceDate}
              onChange={(e) => onUpdateConfig({ conferenceDate: e.target.value })}
              placeholder="例如：2027年10月23日 (星期六)"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 font-mono-data"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              舉辦地點 / 會議館舍
            </label>
            <input
              type="text"
              value={config.conferenceVenue}
              onChange={(e) => onUpdateConfig({ conferenceVenue: e.target.value })}
              placeholder="例如：國立臺灣師範大學地理學系館 國際會議廳、演講廳"
              className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>
      </div>

      {/* 2. 多時段與多場次分開設定 (User's Exact Requirement: 分開設定 時段A幾個場次、時段B幾個場次) */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-5 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-400 uppercase tracking-wider mb-0.5">
              <Clock className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>多時段與平行場次分開設定 (Time Blocks & Parallel Tracks)</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              每個時段可個別設定平行場次數（例如：時段 A 設定 2 個場次 A1 與 A2，時段 B 設定 3 個場次等）。
            </p>
          </div>

          <div className="flex items-center gap-2 font-mono-data text-xs bg-emerald-50 dark:bg-emerald-950/70 text-emerald-950 dark:text-emerald-200 px-3 py-1.5 rounded-lg border border-emerald-200/90 dark:border-emerald-800/80">
            <span>共 {timeBlocks.length} 個時段</span>
            <span>·</span>
            <span className="font-bold">合計 {totalSessionsCount} 個平行發表場次</span>
          </div>
        </div>

        {/* List of Time Blocks */}
        <div className="space-y-4">
          {timeBlocks.map((block, bIdx) => (
            <div
              key={block.id}
              className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-slate-950/70 border border-slate-200/90 dark:border-slate-800 space-y-3"
            >
              {/* Block Header: Name, Time, Session Count Stepper */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-2 border-b border-slate-200/70 dark:border-slate-800">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-6 h-6 rounded-md bg-[#064E3B] text-white font-mono-data text-xs font-bold flex items-center justify-center shadow-xs">
                    {String.fromCharCode(65 + bIdx)}
                  </span>
                  <input
                    type="text"
                    value={block.label}
                    onChange={(e) => handleUpdateBlockLabel(block.id, e.target.value)}
                    placeholder="例如：時段 A (上午第一節)"
                    className="font-bold text-sm text-slate-900 dark:text-slate-100 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-md border border-slate-200/90 dark:border-slate-700 w-44 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                  />
                  <div className="flex items-center gap-1.5 text-xs text-slate-500">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={block.timeSlot}
                      onChange={(e) => handleUpdateBlockTime(block.id, e.target.value)}
                      placeholder="09:00 - 10:30"
                      className="text-xs bg-white dark:bg-slate-900 px-2.5 py-1 rounded-md border border-slate-200/90 dark:border-slate-700 w-32 font-mono-data text-slate-800 dark:text-slate-200 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Session count controller for this block */}
                  <div className="flex items-center gap-1.5 text-xs bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200/90 dark:border-slate-700 shadow-xs">
                    <span className="text-slate-700 dark:text-slate-300 font-semibold">
                      本時段場次數：
                    </span>
                    <select
                      value={block.sessions?.length || block.sessionCount || 1}
                      onChange={(e) => handleSetBlockSessionCount(block.id, parseInt(e.target.value, 10))}
                      className="font-mono-data font-bold text-emerald-900 dark:text-emerald-300 bg-transparent focus:outline-hidden cursor-pointer"
                    >
                      {[1, 2, 3, 4, 5, 6].map(num => (
                        <option key={num} value={num}>
                          {num} 場次 (平行軌道)
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    onClick={() => handleRemoveTimeBlock(block.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="刪除此時段"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Parallel sessions inside this block */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                {(block.sessions || []).map((session, sIdx) => (
                  <div
                    key={session.id || sIdx}
                    className="p-2.5 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 space-y-1.5 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono-data font-bold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded text-[11px]">
                          {session.code || `${String.fromCharCode(65 + bIdx)}${sIdx + 1}`}
                        </span>
                        <input
                          type="text"
                          value={session.code}
                          onChange={(e) => handleUpdateSessionInBlock(block.id, sIdx, 'code', e.target.value)}
                          placeholder="代碼 (如 A1)"
                          className="font-semibold text-slate-800 dark:text-slate-200 bg-transparent w-20 px-1 border-b border-dashed border-slate-300"
                        />
                      </div>
                      <button
                        onClick={() => handleRemoveSessionFromBlock(block.id, sIdx)}
                        className="text-slate-400 hover:text-rose-600 text-[10px]"
                        title="移除此場次"
                      >
                        ✕
                      </button>
                    </div>

                    <div>
                      <label className="block text-[10px] text-slate-400">會議室教室：</label>
                      <input
                        type="text"
                        value={session.room}
                        onChange={(e) => handleUpdateSessionInBlock(block.id, sIdx, 'room', e.target.value)}
                        placeholder="第一國際會議廳"
                        className="w-full text-xs px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Add New Time Block Form */}
        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-emerald-700" />
            <span>新增一個新時段 (例如：時段 E 或 閉幕綜合座談)</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-2">
            <input
              type="text"
              value={newBlockLabel}
              onChange={(e) => setNewBlockLabel(e.target.value)}
              placeholder="時段名稱 (例如：時段 E 或 下午第三節)"
              className="text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg w-full sm:w-60"
            />
            <input
              type="text"
              value={newBlockTime}
              onChange={(e) => setNewBlockTime(e.target.value)}
              placeholder="舉辦時段 (例如：17:00 - 18:30)"
              className="text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg w-full sm:w-44 font-mono-data"
            />
            <button
              onClick={handleAddNewTimeBlock}
              className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-emerald-800 dark:bg-emerald-700 rounded-lg hover:bg-emerald-700 transition-colors whitespace-nowrap"
            >
              加入此時段
            </button>
          </div>
        </div>
      </div>

      {/* 3. 2027 研討會 6 大子議題 */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 dark:text-emerald-400 uppercase tracking-wider mb-0.5">
              <Layers className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
              <span>2027 研討會 6 大子議題 (Sub-Themes)</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              已完整建立您所提供之子議題，並提供清晰欄位讓您隨時修改名稱或涵蓋範疇說明。
            </p>
          </div>
          <span className="text-xs bg-emerald-50 dark:bg-emerald-950/70 text-emerald-950 dark:text-emerald-200 font-mono-data px-3 py-1 rounded-md self-start sm:self-auto font-bold border border-emerald-200/90 dark:border-emerald-800/80">
            共 {(config.subThemes || []).length} 個子議題
          </span>
        </div>

        {/* 6 Sub-Themes Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(config.subThemes || OFFICIAL_2027_SUBTHEMES).map((sub, sIdx) => (
            <div
              key={sub.id}
              className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-slate-950/70 border border-slate-200/90 dark:border-slate-800 flex flex-col justify-between text-xs hover:border-emerald-600/50 transition-colors shadow-2xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-start gap-2">
                    <span className="w-5 h-5 rounded-md bg-[#064E3B] text-white font-mono-data text-[11px] font-bold flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      {sub.number || sIdx + 1}
                    </span>
                    <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug">
                      {sub.name}
                    </h4>
                  </div>
                  <button
                    onClick={() => handleRemoveSubTheme(sub.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                    title="刪除此子議題"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="mt-2 text-slate-600 dark:text-slate-300 leading-relaxed bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800 text-[11px]">
                  {sub.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add New Sub-Theme Form */}
        <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-slate-950/40 border border-dashed border-slate-300 dark:border-slate-700 space-y-3">
          <div className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5 text-emerald-800 dark:text-emerald-400" />
            <span>自訂新增其他子議題欄位 (Add Custom Sub-Theme)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              value={newSubThemeName}
              onChange={(e) => setNewSubThemeName(e.target.value)}
              placeholder="子議題名稱 (如：7. 智慧農業與鄉村調適)"
              className="text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 rounded-lg sm:col-span-1 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
            <input
              type="text"
              value={newSubThemeDesc}
              onChange={(e) => setNewSubThemeDesc(e.target.value)}
              placeholder="涵蓋範疇 (如：涵蓋智慧農業、農村生計、水資源調配等)"
              className="text-xs px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 rounded-lg sm:col-span-2 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={handleAddSubTheme}
              disabled={!newSubThemeName.trim()}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-[#064E3B] hover:bg-[#043D2F] dark:bg-emerald-700 dark:hover:bg-emerald-600 rounded-lg transition-all disabled:opacity-40 cursor-pointer shadow-xs"
            >
              新增至子議題清單
            </button>
          </div>
        </div>

        {/* Recluster CTA */}
        <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
          <span className="text-xs text-slate-500 dark:text-slate-400 font-mono-data">
            摘要庫共有 {abstractCount} 篇論文待編排 · 合計 {totalSessionsCount} 個發表場次
          </span>
          <button
            onClick={onTriggerRecluster}
            disabled={abstractCount === 0}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#064E3B] hover:bg-[#043D2F] dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-all shadow-sm disabled:opacity-40 cursor-pointer active:scale-[0.98]"
          >
            <Sparkles className="w-4 h-4 text-emerald-300" />
            <span>依此多時段與多場次配置 執行自動分群</span>
          </button>
        </div>
      </div>
    </div>
  );
};
