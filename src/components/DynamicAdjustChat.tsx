import React, { useState } from 'react';
import { 
  Send, 
  Sparkles, 
  RefreshCw, 
  RotateCcw, 
  MessageSquare, 
  Check, 
  ArrowRight,
  History,
  Bot,
  User,
  Sliders
} from 'lucide-react';
import { ChatMessage, ClusteringResult, AbstractItem } from '../types';

interface DynamicAdjustChatProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  isLoading: boolean;
  onApplyClusteringVersion: (clustering: ClusteringResult) => void;
  currentClustering: ClusteringResult | null;
  historyVersions: ClusteringResult[];
  abstracts: AbstractItem[];
}

export const DynamicAdjustChat: React.FC<DynamicAdjustChatProps> = ({
  messages,
  onSendMessage,
  isLoading,
  onApplyClusteringVersion,
  currentClustering,
  historyVersions,
  abstracts,
}) => {
  const [inputText, setInputText] = useState('');

  const quickPrompts = [
    '請將『空間資訊』場次中，偏向無人機應用的文章抽出來，與第 12 號摘要合併成一個新場次',
    '請將第 01 號與第 03 號水文論文合併為「流域水文與複合地質災害」，並設定每場至多 4 篇',
    '教授建議：將地方創生與文化地景場次移至下午最後一場，並推薦人文地理學專長主持人',
    '請檢查各場次共通點簡述，確保每條嚴格控制在 30 字以內，並精簡學術標題'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || isLoading) return;
    const text = inputText;
    setInputText('');
    await onSendMessage(text);
  };

  const handleQuickPromptClick = async (prompt: string) => {
    if (isLoading) return;
    await onSendMessage(prompt);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 max-w-7xl mx-auto py-2">
      {/* Version History Sidebar */}
      <div className="lg:col-span-1 space-y-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider mb-3">
            <History className="w-4 h-4 text-emerald-800 dark:text-emerald-400" />
            <span>議程微調版本歷程</span>
          </div>

          <div className="space-y-2">
            {historyVersions.map((version, index) => {
              const isCurrent = currentClustering?.versionId === version.versionId;
              return (
                <button
                  key={version.versionId}
                  onClick={() => onApplyClusteringVersion(version)}
                  className={`w-full text-left p-2.5 rounded-lg border text-xs transition-colors flex flex-col cursor-pointer ${
                    isCurrent
                      ? 'bg-emerald-50/80 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-950 dark:text-emerald-200 shadow-2xs'
                      : 'bg-[#F8FAFC] dark:bg-slate-950/60 border-slate-200/90 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold truncate max-w-[140px]">
                      {version.versionName || `版本 #${index + 1}`}
                    </span>
                    {isCurrent && (
                      <span className="text-[10px] bg-[#064E3B] text-white px-1.5 py-0.2 rounded font-mono-data font-bold">
                        當前套用
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono-data mt-1">
                    {version.timestamp}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {version.sessions.length} 場次 · {version.posters?.length || 0} 海報
                  </span>
                </button>
              );
            })}

            {historyVersions.length === 0 && (
              <p className="text-xs text-slate-400 py-3 text-center">
                尚未產生分群版本
              </p>
            )}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
          <h5 className="font-bold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
            <span>💡 系辦助理微調指引</span>
          </h5>
          <p className="leading-relaxed text-[11px]">
            教授審查或會議籌備會提出抽換、合併需求時，直接在對話框輸入自然語言指示。Gemini 會記住全部上下文並維持底層 30 字共通點與海報獨立規則。
          </p>
        </div>
      </div>

      {/* Main Chat Conversation View */}
      <div className="lg:col-span-3 flex flex-col h-[700px] bg-white dark:bg-slate-900 rounded-xl border border-slate-200/90 dark:border-slate-800 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.02)]">
        {/* Chat Header */}
        <div className="p-4 border-b border-slate-200/90 dark:border-slate-800 bg-[#F8FAFC] dark:bg-slate-950/70 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#064E3B] text-white flex items-center justify-center shadow-xs">
              <Bot className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100">
                地理系議程總召 AI 微調對話 (Interactive Assistant)
              </h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                對話模式 (Chat Prompt) · 具備 200 萬 Token 上下文記憶，支援反覆重組
              </p>
            </div>
          </div>
          <span className="text-xs font-mono-data font-semibold text-emerald-900 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200/80 dark:border-emerald-800/80 px-2.5 py-1 rounded-md">
            溫度: 0.2 (學術嚴謹)
          </span>
        </div>

        {/* Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-8 h-8 rounded-lg bg-[#064E3B] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <Bot className="w-4 h-4 text-emerald-200" />
                  </div>
                )}

                <div
                  className={`max-w-2xl p-4 rounded-xl text-xs leading-relaxed ${
                    isUser
                      ? 'bg-[#064E3B] text-white shadow-xs'
                      : 'bg-[#F8FAFC] dark:bg-slate-950/70 border border-slate-200/90 dark:border-slate-800 text-slate-800 dark:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between gap-4 mb-1.5 text-[10px] opacity-75">
                    <span className="font-bold">
                      {isUser ? '系辦 / 教授審查意見' : '議程總召'}
                    </span>
                    <span className="font-mono-data">{msg.timestamp}</span>
                  </div>

                  <p className="whitespace-pre-wrap">{msg.content}</p>

                  {/* If message returned an updated clustering */}
                  {msg.appliedClustering && (
                    <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
                      <div className="font-bold text-emerald-900 dark:text-emerald-400">
                        {msg.appliedClustering.versionName}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        包含 {msg.appliedClustering.sessions.length} 個場次，{msg.appliedClustering.posters?.length || 0} 篇海報發表
                      </div>
                      <button
                        onClick={() => onApplyClusteringVersion(msg.appliedClustering!)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#064E3B] hover:bg-[#043D2F] dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white rounded-lg transition-colors font-semibold text-xs mt-1 shadow-xs cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>套用此版本至看板與正式表格</span>
                      </button>
                    </div>
                  )}
                </div>

                {isUser && (
                  <div className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                    <User className="w-4 h-4 text-slate-300" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex gap-3 justify-start items-center text-xs text-slate-500 py-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-[#064E3B] dark:text-emerald-400 flex items-center justify-center shrink-0 animate-spin border border-emerald-200/70">
                <RefreshCw className="w-4 h-4" />
              </div>
              <span>議程總召正在根據學術主軸與微調指令重組議程架構...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts Bar */}
        <div className="p-3 bg-[#F8FAFC] dark:bg-slate-950/70 border-t border-slate-200/90 dark:border-slate-800">
          <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mb-2">常用教授微調指令範本：</div>
          <div className="flex gap-1.5 overflow-x-auto pb-1 text-xs">
            {quickPrompts.map((qp, idx) => (
              <button
                key={idx}
                disabled={isLoading}
                onClick={() => handleQuickPromptClick(qp)}
                className="px-2.5 py-1 text-[11px] rounded-md bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-600 hover:text-emerald-900 dark:hover:text-emerald-300 transition-colors whitespace-nowrap shrink-0 disabled:opacity-50 cursor-pointer shadow-2xs"
              >
                {qp}
              </button>
            ))}
          </div>
        </div>

        {/* Input Bar */}
        <form
          onSubmit={handleSubmit}
          className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200/90 dark:border-slate-800 flex items-center gap-2"
        >
          <input
            type="text"
            value={inputText}
            disabled={isLoading}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="例如：請將『空間資訊』場次中，偏向無人機應用的文章抽出來，與第 12 號摘要合併成一個新場次..."
            className="flex-1 px-3 py-2 text-xs bg-[#F8FAFC] dark:bg-slate-950 border border-slate-200/90 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-colors"
          />
          <button
            type="submit"
            disabled={!inputText.trim() || isLoading}
            className="px-4 py-2 text-xs font-semibold text-white bg-[#064E3B] hover:bg-[#043D2F] dark:bg-emerald-600 dark:hover:bg-emerald-500 rounded-lg transition-all flex items-center gap-1.5 disabled:opacity-40 cursor-pointer shadow-xs active:scale-[0.98]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>送出指令</span>
          </button>
        </form>
      </div>
    </div>
  );
};
