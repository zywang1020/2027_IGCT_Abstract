import React, { useState } from 'react';
import { Copy, Check, Sliders, ShieldCheck, Download, Sparkles, BookOpen, ExternalLink, RefreshCw } from 'lucide-react';
import { SystemConfig } from '../types';
import { DEFAULT_SYSTEM_INSTRUCTION } from '../data/sampleAbstracts';

interface SystemSopModalProps {
  config: SystemConfig;
  onUpdateConfig: (newConfig: Partial<SystemConfig>) => void;
  onResetToDefault: () => void;
}

export const SystemSopModal: React.FC<SystemSopModalProps> = ({
  config,
  onUpdateConfig,
  onResetToDefault,
}) => {
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedConfig, setCopiedConfig] = useState(false);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(config.systemInstruction);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  const handleExportAssetJson = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(config, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `地理系研討會_系統組態_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setCopiedConfig(true);
    setTimeout(() => setCopiedConfig(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto py-4">
      {/* Overview Banner */}
      <div className="p-6 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-emerald-800 dark:text-emerald-400 mb-1">
              <ShieldCheck className="w-4 h-4" />
              <span>系辦標準作業程序 (SOP) · 數位資產永續交接</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">
              地理系研討會_摘要自動分群系統 指引手冊
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 max-w-2xl">
              本系統由地理學系辦公室建置，提供助理、行政人員與教學助理在籌備年度地理學術研討會時，無縫完成數十篇匿名摘要分類、時段配置與教授審查動態微調。
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleExportAssetJson}
              className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{copiedConfig ? '已匯出檔案' : '備份系辦設定檔 (JSON)'}</span>
            </button>
            <a
              href="https://aistudio.google.com"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-white bg-slate-900 dark:bg-slate-700 rounded-lg hover:bg-slate-800 transition-colors"
            >
              <span>前往 AI Studio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      {/* 5-Step SOP Documentation matching user request */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Step 1 */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 font-mono-data">
                STEP 01
              </span>
              <span className="text-xs text-slate-400">專案初始化</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
              1. 登入與建立專案
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              前往 <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-xs font-mono">aistudio.google.com</code>，使用系辦的 Google 帳號登入。點擊畫面左上角的 <strong>「Create New Prompt」</strong>，然後選擇 <strong>「Chat prompt」</strong>（對話模式）。
            </p>
            <div className="mt-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-900/50 p-2.5 rounded-lg border border-slate-100 dark:border-slate-800">
              💡 <strong>核心要點：</strong>選擇對話模式非常適合排議程，因為教授們後續一定會要求來回微調與修改。
            </div>
          </div>
        </div>

        {/* Step 2 */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 font-mono-data">
                STEP 02
              </span>
              <span className="text-xs text-slate-400">模型參數控制</span>
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
              2. 設定模型與參數
            </h3>
            <div className="text-sm text-slate-600 dark:text-slate-300 space-y-2">
              <p>
                <strong>Model（模型）：</strong>務必確認選擇 Pro / Flash 高上下文視窗模型。具備 100 萬至 200 萬 Token，能輕鬆吞下 50~100 篇完整學術摘要，杜絕幻覺與前後遺忘。
              </p>
              <p>
                <strong>Temperature（溫度）：</strong>將拉桿調低至 <code className="px-1 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded font-mono-data text-xs">0.2</code> 或 <code className="px-1 py-0.5 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 rounded font-mono-data text-xs">0.3</code>。調低溫度能讓回答具備嚴謹邏輯性與結果穩定性。
              </p>
            </div>
          </div>
        </div>

        {/* Step 3 */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800 md:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 font-mono-data">
              STEP 03
            </span>
            <span className="text-xs text-slate-400">大腦底層設定</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              3. 寫入核心 SOP (System Instructions)
            </h3>
            <button
              onClick={handleCopyPrompt}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 rounded-lg hover:bg-emerald-100 transition-colors w-fit"
            >
              {copiedPrompt ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedPrompt ? '已複製指令到剪貼簿' : '一鍵複製 System Instructions'}</span>
            </button>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 mb-3">
            在畫面最上方的「System Instructions」區塊貼入以下規則，這將成為 AI 的絕對指令：
          </p>
          <div className="bg-slate-950 text-slate-200 p-4 rounded-lg font-mono text-xs leading-relaxed overflow-x-auto border border-slate-800">
            <pre className="whitespace-pre-wrap">{config.systemInstruction}</pre>
          </div>
        </div>

        {/* Step 4 */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 font-mono-data">
              STEP 04
            </span>
            <span className="text-xs text-slate-400">執行與對話</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
            4. 執行分群與微調 (對話框)
          </h3>
          <ul className="text-sm text-slate-600 dark:text-slate-300 space-y-2">
            <li>
              <strong>貼上摘要：</strong>在輸入框直接貼上已編號的數十篇摘要（例如：<code>[摘要 01] 標題...內文...</code>）。
            </li>
            <li>
              <strong>點擊 Run：</strong>系統在數秒內根據底層指令吐出格式完美的分類表格。
            </li>
            <li>
              <strong>動態調整議程：</strong>教授審閱後若需修改，助理可直接輸入：「請將『空間資訊』場次中，偏向無人機應用的文章抽出來，與第 12 號摘要合併成一個新場次」，AI 會記住上下文瞬間重組表格。
            </li>
          </ul>
        </div>

        {/* Step 5 */}
        <div className="p-5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 font-mono-data">
              STEP 05
            </span>
            <span className="text-xs text-slate-400">資產傳承</span>
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mb-2">
            5. 儲存為系辦數位資產 (Save)
          </h3>
          <div className="text-sm text-slate-600 dark:text-slate-300 space-y-2 leading-relaxed">
            <p>
              點擊畫面頂部的 <strong>「Save」</strong>，將專案命名為：
              <span className="block mt-1 font-semibold text-emerald-800 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded">
                「地理系研討會_摘要自動分群系統」
              </span>
            </p>
            <p>
              專案會自動儲存。未來系辦助理或工讀生交接時，只要登入同一個後台打開此專案，<strong>完全不需要重新設定 System Instructions 或是背誦提示詞</strong>，直接把新一年度的摘要貼入下方對話框，就能無縫繼續工作！
            </p>
          </div>
        </div>
      </div>

      {/* Interactive System Instructions & Parameter Customizer */}
      <div className="p-6 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-emerald-800 dark:text-emerald-400" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">
              系統運行參數設定 (Runtime Settings)
            </h3>
          </div>
          <button
            onClick={onResetToDefault}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>重設為系辦預設值</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              模型版本 (Model Selection)
            </label>
            <select
              value={config.model}
              onChange={(e) => onUpdateConfig({ model: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-700"
            >
              <option value="gemini-3.8-flash">Gemini 3.8 Flash (推薦，秒速高吞吐)</option>
              <option value="gemini-4-argon">Gemini 4 Argon (Pro級深度長文推理)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro 相容模式</option>
            </select>
            <p className="mt-1 text-xs text-slate-500">具備百萬級上下文視窗，可處理大量全文摘要</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                溫度 (Temperature)：
              </label>
              <span className="font-mono-data text-xs font-bold text-emerald-800 dark:text-emerald-400">
                {config.temperature}
              </span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={config.temperature}
              onChange={(e) => onUpdateConfig({ temperature: parseFloat(e.target.value) })}
              className="w-full accent-emerald-700 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono-data mt-1">
              <span>0.0 (最嚴謹)</span>
              <span>0.2 (建議值)</span>
              <span>1.0 (高創意)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              預設口頭發表場次數量 (Target Sessions)
            </label>
            <select
              value={config.targetSessionCount}
              onChange={(e) => onUpdateConfig({ targetSessionCount: parseInt(e.target.value, 10) })}
              className="w-full px-3 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-700 font-mono-data"
            >
              <option value="3">3 個場次 (半日型研討會)</option>
              <option value="4">4 個場次 (標準全日研討會 - 預設)</option>
              <option value="5">5 個場次 (雙軌平行會議)</option>
              <option value="6">6 個場次 (大型全國性地理研討會)</option>
            </select>
            <p className="mt-1 text-xs text-slate-500">難以歸類之特殊文章將自動推薦為海報發表</p>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            底層 System Instructions (系統指令自訂)
          </label>
          <textarea
            rows={7}
            value={config.systemInstruction}
            onChange={(e) => onUpdateConfig({ systemInstruction: e.target.value })}
            className="w-full p-3 font-mono text-xs bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-700 leading-relaxed"
          />
        </div>
      </div>
    </div>
  );
};
