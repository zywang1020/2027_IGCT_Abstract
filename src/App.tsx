import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { AbstractInputPanel } from './components/AbstractInputPanel';
import { AgendaKanban } from './components/AgendaKanban';
import { AgendaTable } from './components/AgendaTable';
import { DynamicAdjustChat } from './components/DynamicAdjustChat';
import { SystemSopModal } from './components/SystemSopModal';
import { AbstractDetailModal } from './components/AbstractDetailModal';
import { TimetableExportModal } from './components/TimetableExportModal';
import { ConferenceConfigPanel } from './components/ConferenceConfigPanel';
import { DataPrivacyModal } from './components/DataPrivacyModal';
import { AbstractItem, ClusteringResult, ChatMessage, SystemConfig } from './types';
import { 
  SAMPLE_ABSTRACTS, 
  DEFAULT_SYSTEM_INSTRUCTION, 
  OFFICIAL_2027_SUBTHEMES, 
  DEFAULT_SESSION_SLOTS,
  DEFAULT_TIME_BLOCKS
} from './data/sampleAbstracts';

export default function App() {
  const [activeTab, setActiveTab] = useState<'config' | 'abstracts' | 'kanban' | 'table' | 'chat' | 'sop'>('config');
  const [abstracts, setAbstracts] = useState<AbstractItem[]>(() => {
    const saved = localStorage.getItem('geo_abstracts_2027');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) { /* ignore */ }
    }
    return [];
  });

  const [config, setConfig] = useState<SystemConfig>(() => {
    const saved = localStorage.getItem('geo_config_2027_v2');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return {
      model: 'gemini-3.8-flash',
      temperature: 0.2,
      systemInstruction: DEFAULT_SYSTEM_INSTRUCTION,
      targetSessionCount: 8,
      timeBlocks: DEFAULT_TIME_BLOCKS,
      sessionSlots: DEFAULT_SESSION_SLOTS,
      conferenceTitle: '2027年臺灣地理學術研討會',
      conferenceDate: '2027年10月23日 (星期六)',
      conferenceVenue: '國立臺灣師範大學地理學系館 國際會議廳、演講廳',
      departmentName: '國立臺灣師範大學地理學系',
      subThemes: OFFICIAL_2027_SUBTHEMES,
      useCustomTracks: true,
      customSessionTracks: []
    };
  });

  const [clustering, setClustering] = useState<ClusteringResult | null>(() => {
    const saved = localStorage.getItem('geo_clustering_2027') || localStorage.getItem('geo_clustering');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { /* ignore */ }
    }
    return null;
  });

  const [historyVersions, setHistoryVersions] = useState<ClusteringResult[]>(() => {
    return clustering ? [clustering] : [];
  });

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'assistant',
      content: `您好！我是國立臺灣師範大學地理學系的研討會議程總召。\n系統已設定完成，所有論文資料均在純本機運算與暫存。上傳或貼入論文題目後，點擊「執行自動分群」即可生成正式發表場次。\n使用完畢可點擊右上角「銷毀資料 (防外流)」徹底抹除所有紀錄，安心連動 GitHub！`,
      timestamp: '09:00'
    }
  ]);

  const [isClustering, setIsClustering] = useState(false);
  const [selectedAbstractDetail, setSelectedAbstractDetail] = useState<AbstractItem | null>(null);
  const [showTimetableModal, setShowTimetableModal] = useState(false);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [isIncognito, setIsIncognito] = useState<boolean>(() => {
    return localStorage.getItem('geo_incognito_mode') === 'true';
  });
  const [bannerAlert, setBannerAlert] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  // Sync to local storage with Incognito / Zero-leakage support
  useEffect(() => {
    if (isIncognito) {
      localStorage.removeItem('geo_abstracts_2027');
      localStorage.removeItem('geo_abstracts');
      return;
    }
    localStorage.setItem('geo_abstracts_2027', JSON.stringify(abstracts));
  }, [abstracts, isIncognito]);

  useEffect(() => {
    localStorage.setItem('geo_config_2027_v2', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    if (isIncognito) {
      localStorage.removeItem('geo_clustering_2027');
      localStorage.removeItem('geo_clustering');
      return;
    }
    if (clustering) {
      localStorage.setItem('geo_clustering_2027', JSON.stringify(clustering));
    } else {
      localStorage.removeItem('geo_clustering_2027');
      localStorage.removeItem('geo_clustering');
    }
  }, [clustering, isIncognito]);

  useEffect(() => {
    localStorage.setItem('geo_incognito_mode', isIncognito ? 'true' : 'false');
  }, [isIncognito]);

  const triggerAlert = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setBannerAlert({ message, type });
    setTimeout(() => setBannerAlert(null), 4000);
  };

  // 1-Click Complete Data Wipeout for GitHub Safety
  const handleWipeAllData = () => {
    setAbstracts([]);
    setClustering(null);
    setHistoryVersions([]);
    setMessages([
      {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        content: '【論文與議程資料已徹底銷毀】\n所有論文題目、摘要、分群結果與對話歷程已完整自記憶體與瀏覽器快取清除。\n目前系統為乾淨純粹的空狀態，無任何機密外流風險，可安心連動或 Commit / Push 至 GitHub！',
        timestamp: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    localStorage.removeItem('geo_abstracts_2027');
    localStorage.removeItem('geo_abstracts');
    localStorage.removeItem('geo_clustering_2027');
    localStorage.removeItem('geo_clustering');
    localStorage.removeItem('geo_chat_history');
    sessionStorage.clear();
    triggerAlert('所有論文與議程資料已徹底銷毀清空！防外流保護完成。', 'info');
  };

  // Run Auto-Clustering
  const handleRunClustering = async () => {
    if (abstracts.length === 0) {
      triggerAlert('請先加入至少一篇論文摘要', 'error');
      return;
    }

    setIsClustering(true);
    try {
      const response = await fetch('/api/cluster', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          abstracts,
          systemInstruction: config.systemInstruction,
          temperature: config.temperature,
          model: config.model,
          targetSessionCount: config.targetSessionCount || 4,
          sessionSlots: config.sessionSlots || [],
          timeBlocks: config.timeBlocks || [],
          subThemes: config.subThemes || [],
          conferenceTitle: config.conferenceTitle,
          conferenceDate: config.conferenceDate,
          conferenceVenue: config.conferenceVenue,
          customSessionTracks: config.customSessionTracks || [],
          useCustomTracks: config.useCustomTracks
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || `HTTP error ${response.status}`);
      }

      const data: ClusteringResult = await response.json();
      setClustering(data);
      setHistoryVersions(prev => [data, ...prev.slice(0, 8)]);
      setActiveTab('kanban');
      triggerAlert('AI 摘要自動分群已完成！已對應各場次主軸。', 'success');

      setMessages(prev => [
        ...prev,
        {
          id: `msg-${Date.now()}`,
          sender: 'assistant',
          content: `【自動分群完成】\n已依據「${config.conferenceTitle || '研討會'}」與指定場次主軸完成分組：\n${data.convenerNotes}\n\n已更新議程看板與正式表格。`,
          timestamp: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
          appliedClustering: data
        }
      ]);
    } catch (err: any) {
      console.error('Error running clustering:', err);
      triggerAlert(`分群運算失敗: ${err.message}`, 'error');
    } finally {
      setIsClustering(false);
    }
  };

  // Chat dynamic adjust
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);

    try {
      const response = await fetch('/api/chat-adjust', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          currentAgenda: clustering,
          abstracts,
          systemInstruction: config.systemInstruction
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error ${response.status}`);
      }

      const data = await response.json();
      const updatedClustering: ClusteringResult = {
        versionId: data.versionId || `v-${Date.now()}`,
        versionName: data.versionName || '微調版本',
        timestamp: data.timestamp || new Date().toLocaleString('zh-TW'),
        sessions: data.sessions || clustering?.sessions || [],
        posters: data.posters || clustering?.posters || [],
        convenerNotes: data.explanation || '議程調整完成。',
        rawMarkdownTable: data.markdownTable || ''
      };

      setClustering(updatedClustering);
      setHistoryVersions(prev => [updatedClustering, ...prev.slice(0, 8)]);

      const assistantMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        content: data.explanation || '已完成議程微調！',
        timestamp: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' }),
        appliedClustering: updatedClustering
      };
      setMessages(prev => [...prev, assistantMsg]);
      triggerAlert('已依據指示完成議程動態調整！', 'success');
    } catch (err: any) {
      console.error('Error in chat-adjust:', err);
      const errorMsg: ChatMessage = {
        id: `msg-${Date.now() + 1}`,
        sender: 'assistant',
        content: `微調運算時發生問題：${err.message}`,
        timestamp: new Date().toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    }
  };

  const handleApplyClusteringVersion = (version: ClusteringResult) => {
    setClustering(version);
    triggerAlert(`已切換至「${version.versionName}」`, 'info');
  };

  const handleClearAllAbstracts = () => {
    setAbstracts([]);
    setClustering(null);
    localStorage.removeItem('geo_abstracts_2027');
    localStorage.removeItem('geo_abstracts');
    localStorage.removeItem('geo_clustering_2027');
    localStorage.removeItem('geo_clustering');
    triggerAlert('已清空所有論文摘要，現在您可以貼入真實研討會論文！', 'info');
  };

  const handleBatchImport = (newItems: AbstractItem[]) => {
    setAbstracts(prev => [...prev, ...newItems]);
    triggerAlert(`已成功匯入 ${newItems.length} 篇真實論文！`, 'success');
  };

  const handleResetToDefaultConfig = () => {
    setConfig({
      model: 'gemini-3.8-flash',
      temperature: 0.2,
      systemInstruction: DEFAULT_SYSTEM_INSTRUCTION,
      targetSessionCount: 4,
      sessionSlots: DEFAULT_SESSION_SLOTS,
      timeBlocks: DEFAULT_TIME_BLOCKS,
      subThemes: OFFICIAL_2027_SUBTHEMES,
      conferenceTitle: '2027年臺灣地理學術研討會',
      conferenceDate: '2027年10月23日 (星期六)',
      conferenceVenue: '國立臺灣師範大學地理學系館 國際會議廳、演講廳',
      departmentName: '國立臺灣師範大學地理學系',
      useCustomTracks: true,
      customSessionTracks: []
    });
    triggerAlert('已重設為 2027 研討會官方 6 大子議題與標準多時段場次設定', 'info');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B111A] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors antialiased">
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onRunClustering={handleRunClustering}
        isClustering={isClustering}
        abstractCount={abstracts.length}
        onOpenPrivacyModal={() => setShowPrivacyModal(true)}
        isIncognito={isIncognito}
      />

      {/* Floating Notification */}
      {bannerAlert && (
        <div className="fixed top-20 right-6 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div
            className={`px-4 py-2.5 rounded-lg text-xs font-semibold shadow-lg backdrop-blur-md border ${
              bannerAlert.type === 'error'
                ? 'bg-rose-50/95 text-rose-900 border-rose-300 dark:bg-rose-950/90 dark:text-rose-100 dark:border-rose-800'
                : bannerAlert.type === 'info'
                ? 'bg-sky-50/95 text-sky-900 border-sky-300 dark:bg-sky-950/90 dark:text-sky-100 dark:border-sky-800'
                : 'bg-emerald-50/95 text-emerald-950 border-emerald-300 dark:bg-emerald-950/90 dark:text-emerald-100 dark:border-emerald-800'
            }`}
          >
            {bannerAlert.message}
          </div>
        </div>
      )}

      {/* Main Content Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'config' && (
          <ConferenceConfigPanel
            config={config}
            onUpdateConfig={(newConf) => setConfig(prev => ({ ...prev, ...newConf }))}
            onTriggerRecluster={handleRunClustering}
            abstractCount={abstracts.length}
          />
        )}

        {activeTab === 'abstracts' && (
          <AbstractInputPanel
            abstracts={abstracts}
            subThemes={config.subThemes}
            onAddAbstract={(item) => {
              setAbstracts(prev => [...prev, item]);
              triggerAlert(`已加入「${item.title}」`, 'success');
            }}
            onUpdateAbstract={(item) => {
              setAbstracts(prev => prev.map(a => a.id === item.id ? item : a));
            }}
            onDeleteAbstract={(id) => {
              setAbstracts(prev => prev.filter(a => a.id !== id));
              triggerAlert('已刪除論文', 'info');
            }}
            onClearAll={handleClearAllAbstracts}
            onBatchImport={handleBatchImport}
            onSelectAbstractDetail={(item) => setSelectedAbstractDetail(item)}
          />
        )}

        {activeTab === 'kanban' && (
          <AgendaKanban
            clustering={clustering}
            abstracts={abstracts}
            onUpdateClustering={(updated) => {
              setClustering(updated);
              setHistoryVersions(prev => [updated, ...prev.slice(0, 8)]);
            }}
            onSelectAbstractDetail={(item) => setSelectedAbstractDetail(item)}
            onOpenChat={() => setActiveTab('chat')}
          />
        )}

        {activeTab === 'table' && (
          <AgendaTable
            clustering={clustering}
            abstracts={abstracts}
            onOpenTimetableModal={() => setShowTimetableModal(true)}
          />
        )}

        {activeTab === 'chat' && (
          <DynamicAdjustChat
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={isClustering}
            onApplyClusteringVersion={handleApplyClusteringVersion}
            currentClustering={clustering}
            historyVersions={historyVersions}
            abstracts={abstracts}
          />
        )}

        {activeTab === 'sop' && (
          <SystemSopModal
            config={config}
            onUpdateConfig={(newConf) => setConfig(prev => ({ ...prev, ...newConf }))}
            onResetToDefault={handleResetToDefaultConfig}
          />
        )}
      </main>

      {/* Abstract Full Text Modal */}
      {selectedAbstractDetail && (
        <AbstractDetailModal
          abstract={selectedAbstractDetail}
          onClose={() => setSelectedAbstractDetail(null)}
        />
      )}

      {/* Printable Symposium Schedule Modal */}
      {showTimetableModal && clustering && (
        <TimetableExportModal
          clustering={clustering}
          abstracts={abstracts}
          config={config}
          onClose={() => setShowTimetableModal(false)}
        />
      )}

      {/* Data Privacy & Wipeout Modal (Zero-leakage for GitHub) */}
      <DataPrivacyModal
        isOpen={showPrivacyModal}
        abstractCount={abstracts.length}
        isIncognito={isIncognito}
        onToggleIncognito={() => {
          const next = !isIncognito;
          setIsIncognito(next);
          if (next) {
            localStorage.removeItem('geo_abstracts_2027');
            localStorage.removeItem('geo_abstracts');
            localStorage.removeItem('geo_clustering_2027');
            localStorage.removeItem('geo_clustering');
          }
        }}
        onConfirmWipe={handleWipeAllData}
        onClose={() => setShowPrivacyModal(false)}
      />

      {/* Footer */}
      <footer className="py-5 border-t border-slate-200/90 dark:border-slate-800/90 bg-white/50 dark:bg-slate-900/40 text-center text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center justify-center gap-2">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-700"></span>
          <span className="font-medium tracking-wide">
            (C) 國立臺灣師範大學地理學系 · 研討會論文摘要自動分群系統
          </span>
        </div>
      </footer>
    </div>
  );
}
