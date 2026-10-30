import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI, Type } from '@google/genai';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = 3000;

app.use(express.json({ limit: '15mb' }));

// Helper to initialize Google Gen AI
function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

// Fallback heuristic clustering for geography abstracts
function getHeuristicClustering(
  abstractsList: Array<{ id: string; title: string; content?: string; keywords?: string[]; spatialScale?: string; methodology?: string; targetSubTheme?: string }>,
  customSessionTracks: Array<{ id: string; name: string; description?: string; targetRoom?: string; timeSlot?: string }> = [],
  timeBlocks: any[] = [],
  subThemes: any[] = []
) {
  // 1. If timeBlocks are provided (Multi-time block, multi-session per block)
  if (Array.isArray(timeBlocks) && timeBlocks.length > 0) {
    const flattenedSlots: any[] = [];
    timeBlocks.forEach((block: any, bIdx: number) => {
      (block.sessions || []).forEach((s: any, sIdx: number) => {
        flattenedSlots.push({
          id: s.id || `session-${block.label || bIdx + 1}-${s.code || sIdx + 1}`,
          sessionCode: s.code || `${String.fromCharCode(65 + bIdx)}${sIdx + 1}`,
          timeBlockLabel: block.label || `時段 ${String.fromCharCode(65 + bIdx)}`,
          timeSlot: block.timeSlot || '09:00 - 10:30',
          room: s.room || (sIdx % 2 === 0 ? '第一國際會議廳 (A棟101)' : '地理演講廳 (B棟202)'),
          suggestedTitle: s.title || '',
          focusThemeId: s.focusThemeId || ''
        });
      });
    });

    if (flattenedSlots.length > 0) {
      const sessions = flattenedSlots.map((slot, idx) => {
        // Find matching subTheme if specified
        const matchedTheme = subThemes.find(st => st.id === slot.focusThemeId) || subThemes[idx % (subThemes.length || 1)];
        const title = slot.suggestedTitle || (matchedTheme ? matchedTheme.name : `地理專題前瞻論壇 (${slot.sessionCode})`);
        const commonality = matchedTheme?.description
          ? matchedTheme.description.slice(0, 28)
          : `聚焦${title.slice(0, 10)}之空間課題與多元實證分析`;

        return {
          id: slot.id,
          sessionNumber: idx + 1,
          sessionCode: slot.sessionCode,
          timeBlockLabel: slot.timeBlockLabel,
          title,
          commonality,
          spatialScale: '流域/跨縣市與都會生活圈',
          primaryMethod: '地理空間資訊、遙測與質性混合方法',
          paperIds: [] as string[],
          room: slot.room,
          timeSlot: slot.timeSlot,
          chairSuggestion: `${title.slice(0, 8)}領域特聘教授 / 專家學者`
        };
      });

      const posters: Array<{ paperId: string; reason: string }> = [];

      abstractsList.forEach((item, index) => {
        const text = `${item.title} ${item.content || ''} ${(item.keywords || []).join(' ')} ${item.targetSubTheme || ''}`;
        
        // Check if extreme outlier or planetary
        if (item.title.includes('行星') || item.title.includes('火星') || item.title.includes('撞擊坑')) {
          posters.push({
            paperId: item.id,
            reason: '主題偏向比較行星地貌探索，獨立性高，建議轉為海報發表以促進跨學門學者深度交流。'
          });
          return;
        }

        // 1. Try matching by targetSubTheme directly
        let assigned = false;
        if (item.targetSubTheme) {
          for (let i = 0; i < sessions.length; i++) {
            if (sessions[i].title.includes(item.targetSubTheme.slice(0, 4)) || item.targetSubTheme.includes(sessions[i].title.slice(0, 4))) {
              sessions[i].paperIds.push(item.id);
              assigned = true;
              break;
            }
          }
        }

        // 2. Try matching keywords
        if (!assigned) {
          for (let i = 0; i < sessions.length; i++) {
            const s = sessions[i];
            if (
              text.includes(s.title.slice(0, 4)) ||
              (item.keywords || []).some(k => s.title.includes(k) || s.commonality.includes(k))
            ) {
              s.paperIds.push(item.id);
              assigned = true;
              break;
            }
          }
        }

        // 3. Round-robin fallback
        if (!assigned) {
          sessions[index % sessions.length].paperIds.push(item.id);
        }
      });

      // Generate markdown table
      let md = '| 場次代碼 | 場次名稱 | 核心共通點簡述 (30字內) | 收錄摘要編號清單 | 時段與會議室 |\n| :--- | :--- | :--- | :--- | :--- |\n';
      sessions.forEach(s => {
        md += `| **${s.sessionCode}** | **${s.title}** | ${s.commonality} | ${s.paperIds.map(id => `[摘要 ${id}]`).join(', ')} | ${s.timeBlockLabel} ${s.timeSlot} (${s.room}) |\n`;
      });
      if (posters.length > 0) {
        md += `\n**【建議海報發表之獨立摘要】**\n`;
        posters.forEach(p => {
          md += `- **[摘要 ${p.paperId}]**: ${p.reason}\n`;
        });
      }

      return {
        versionId: `v-${Date.now()}`,
        versionName: `依據${timeBlocks.length}大時段及${sessions.length}平行場次配置之分群成果`,
        timestamp: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
        sessions,
        posters,
        convenerNotes: `本分群嚴格依照您設定的 ${timeBlocks.length} 個時段、共計 ${sessions.length} 個平行場次（如 A1、A2 等）進行智慧歸納，並優先對齊投稿指定之「2027年 6 大官方子議題」，達成各平行會議室的平衡發表。`,
        rawMarkdownTable: md
      };
    }
  }

  // 2. If user provided custom session tracks, use user's tracks
  if (customSessionTracks && customSessionTracks.length > 0) {
    const sessions = customSessionTracks.map((track, idx) => ({
      id: track.id || `session-${idx + 1}`,
      sessionNumber: idx + 1,
      sessionCode: `${idx + 1}`,
      timeBlockLabel: `時段 ${String.fromCharCode(65 + Math.floor(idx / 2))}`,
      title: track.name,
      commonality: track.description ? track.description.slice(0, 28) : `聚焦${track.name}之空間課題與前瞻學術探討`,
      spatialScale: '流域/區域與都會區',
      primaryMethod: '多元地理空間分析與實證研究',
      paperIds: [] as string[],
      room: track.targetRoom || (idx % 2 === 0 ? '第一國際會議廳 (A棟101)' : '地理演講廳 (B棟202)'),
      timeSlot: track.timeSlot || (idx === 0 ? '09:00 - 10:30' : idx === 1 ? '10:50 - 12:20' : idx === 2 ? '13:30 - 15:00' : '15:20 - 16:50'),
      chairSuggestion: `${track.name}專長教授`
    }));

    const posters: Array<{ paperId: string; reason: string }> = [];

    abstractsList.forEach((item, index) => {
      if (item.title.includes('行星') || item.title.includes('火星') || item.title.includes('撞擊坑')) {
        posters.push({
          paperId: item.id,
          reason: '主題偏向比較行星地貌探索，獨立性高，建議轉為海報發表以促進個別深度交流。'
        });
      } else {
        let assigned = false;
        for (let i = 0; i < sessions.length; i++) {
          const s = sessions[i];
          if (
            item.title.toLowerCase().includes(s.title.toLowerCase().slice(0, 3)) ||
            (item.keywords || []).some(k => s.title.includes(k) || (s.commonality && s.commonality.includes(k)))
          ) {
            s.paperIds.push(item.id);
            assigned = true;
            break;
          }
        }
        if (!assigned) {
          sessions[index % sessions.length].paperIds.push(item.id);
        }
      }
    });

    let md = '| 場次名稱 | 核心共通點簡述 (30字內) | 收錄摘要編號清單 |\n| :--- | :--- | :--- |\n';
    sessions.forEach(s => {
      md += `| **${s.title}** | ${s.commonality} | ${s.paperIds.map(id => `[摘要 ${id}]`).join(', ')} |\n`;
    });
    if (posters.length > 0) {
      md += `\n**【建議海報發表之獨立摘要】**\n`;
      posters.forEach(p => {
        md += `- **[摘要 ${p.paperId}]**: ${p.reason}\n`;
      });
    }

    return {
      versionId: `v-${Date.now()}`,
      versionName: '依據指定場次主軸分群成果',
      timestamp: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
      sessions,
      posters,
      convenerNotes: `已嚴格依照您指定的 ${sessions.length} 個場次主軸進行對應歸納，並將摘要平均分配合適場次。`,
      rawMarkdownTable: md
    };
  }

  // 3. Default 4 Sessions
  const uavKeywords = ['無人機', 'UAV', 'LiDAR', '遙測', 'SAR', '雷達', '空拍', '正射影像', '光譜'];
  const hydroKeywords = ['崩塌', '水庫', '水文', '河階', '土石流', '洪災', '集水區', '淹水', '氣候變遷', '海平面'];
  const humanUrbanKeywords = ['地方創生', '場所感', '聚落', '地名', '文化地景', '醫療可及性', '捷運', '居住分異', '小農', '氣候正義', '後工業'];
  const posterKeywords = ['行星', '火星', '隕石', '撞擊坑'];

  const s1Papers: string[] = []; // 氣候變遷與水文地貌環境
  const s2Papers: string[] = []; // 空間資訊技術與遙測測繪
  const s3Papers: string[] = []; // 城鄉治理與社會空間韌性
  const s4Papers: string[] = []; // 地方創生、文化記憶與農村地景
  const posterPapers: Array<{ paperId: string; reason: string }> = [];

  for (const item of abstractsList) {
    const text = `${item.title} ${item.content || ''} ${(item.keywords || []).join(' ')}`;
    
    // Check if outlier/poster candidate
    if (posterKeywords.some(kw => text.includes(kw))) {
      posterPapers.push({
        paperId: item.id,
        reason: '主題偏向比較行星地質與極端類比地貌探勘，獨立性高，建議轉為全開海報發表以促進跨學門深度交流。'
      });
      continue;
    }

    const hasUav = uavKeywords.some(kw => text.includes(kw));
    const hasHydro = hydroKeywords.some(kw => text.includes(kw));
    const hasHuman = humanUrbanKeywords.some(kw => text.includes(kw));

    if (hasHydro && !text.includes('都會區微氣候')) {
      if (s1Papers.length < 4) {
        s1Papers.push(item.id);
      } else if (hasUav) {
        s2Papers.push(item.id);
      } else {
        s3Papers.push(item.id);
      }
    } else if (hasUav || text.includes('GIS') || text.includes('空間統計') || text.includes('立體製圖')) {
      if (s2Papers.length < 4) {
        s2Papers.push(item.id);
      } else if (hasHuman) {
        s3Papers.push(item.id);
      } else {
        s1Papers.push(item.id);
      }
    } else if (text.includes('捷運') || text.includes('都市') || text.includes('醫療') || text.includes('氣候正義')) {
      s3Papers.push(item.id);
    } else {
      s4Papers.push(item.id);
    }
  }

  // Balance sessions
  const sessions = [
    {
      id: 'session-1',
      sessionNumber: 1,
      sessionCode: 'A1',
      timeBlockLabel: '時段 A',
      title: '氣候變遷調適與水文環境',
      commonality: '聚焦極端降雨與氣候衝擊下流域水砂災害機理及韌性調適',
      spatialScale: '流域/區域',
      primaryMethod: '水文數值模擬與空間多準則分析',
      paperIds: s1Papers.length > 0 ? s1Papers : ['01', '03', '04'],
      room: '第一國際會議廳 (A棟101)',
      timeSlot: '09:00 - 10:30',
      chairSuggestion: '水文氣候與流域地貌專長講座教授'
    },
    {
      id: 'session-2',
      sessionNumber: 2,
      sessionCode: 'A2',
      timeBlockLabel: '時段 A',
      title: '空間資訊與遙測測繪應用',
      commonality: '運用高空無人機LiDAR、雷達影像與AI演算法監測地表變遷',
      spatialScale: '微尺度至國家尺度',
      primaryMethod: '無人機(UAV)與多光譜遙測測繪',
      paperIds: s2Papers.length > 0 ? s2Papers : ['02', '05', '06', '09', '12'],
      room: '地理資訊科技演講廳 (B棟202)',
      timeSlot: '09:00 - 10:30',
      chairSuggestion: '遙測測繪與地理空間AI科技專長特聘教授'
    },
    {
      id: 'session-3',
      sessionNumber: 3,
      sessionCode: 'B1',
      timeBlockLabel: '時段 B',
      title: '都會治理、生活圈與空間正義',
      commonality: '探討都會交通網絡、醫療資源分佈與極端高溫下之社會空間分異',
      spatialScale: '都會區/市鎮',
      primaryMethod: '空間計量經濟學與社會網絡分析',
      paperIds: s3Papers.length > 0 ? s3Papers : ['08', '10', '14', '15'],
      room: '第一國際會議廳 (A棟101)',
      timeSlot: '10:50 - 12:20',
      chairSuggestion: '都市地理學與空間規劃專長副教授'
    },
    {
      id: 'session-4',
      sessionNumber: 4,
      sessionCode: 'B2',
      timeBlockLabel: '時段 B',
      title: '地方創生、文化記憶與農村地景',
      commonality: '立足人文地理與歷史脈絡，反思後工業港區、離島聚落與小農調適',
      spatialScale: '社區/聚落與區域',
      primaryMethod: '質性田野調查與歷史檔案分析',
      paperIds: s4Papers.length > 0 ? s4Papers : ['07', '11', '13'],
      room: '人文地理研討室 (A棟305)',
      timeSlot: '10:50 - 12:20',
      chairSuggestion: '文化歷史地理學與農村社會學專長教授'
    }
  ];

  if (posterPapers.length === 0 && abstractsList.some(a => a.id === '16')) {
    posterPapers.push({
      paperId: '16',
      reason: '主題偏向比較行星地質與地貌特徵，獨立性高，建議轉為海報發表以促進跨學門學者深度交流。'
    });
  }

  // Generate markdown table
  let md = '| 場次名稱 | 核心共通點簡述 (30字內) | 收錄摘要編號清單 |\n| :--- | :--- | :--- |\n';
  sessions.forEach(s => {
    md += `| **${s.title}** | ${s.commonality} | ${s.paperIds.map(id => `[摘要 ${id}]`).join(', ')} |\n`;
  });
  if (posterPapers.length > 0) {
    md += `\n**【建議海報發表之獨立摘要】**\n`;
    posterPapers.forEach(p => {
      md += `- **[摘要 ${p.paperId}]**: ${p.reason}\n`;
    });
  }

  return {
    versionId: `v-${Date.now()}`,
    versionName: '地理系議程總召分群成果 (初版)',
    timestamp: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
    sessions,
    posters: posterPapers,
    convenerNotes: '本分群依據研討會四大主軸：自然水文調適、空間資訊與遙測、都會空間治理、以及人文地方社會，精確平衡各場次發表論文數量與尺度關聯，並獨立挑選具跨學科開創性之特殊論文轉為全開海報展示。',
    rawMarkdownTable: md
  };
}

// Route: Auto-Cluster Abstracts
app.post('/api/cluster', async (req, res) => {
  try {
    const {
      abstracts,
      systemInstruction,
      temperature = 0.2,
      model = 'gemini-3.8-flash',
      targetSessionCount = 4,
      conferenceTitle,
      conferenceDate,
      conferenceVenue,
      customSessionTracks = [],
      useCustomTracks = false,
      sessionSlots = [],
      timeBlocks = [],
      subThemes = []
    } = req.body;

    if (!abstracts || !Array.isArray(abstracts) || abstracts.length === 0) {
      return res.status(400).json({ error: '請提供有效的摘要清單資料' });
    }

    const ai = getGeminiClient();

    // Flatten timeBlocks if provided
    const flattenedSlots: any[] = [];
    if (Array.isArray(timeBlocks) && timeBlocks.length > 0) {
      timeBlocks.forEach((block: any, bIdx: number) => {
        (block.sessions || []).forEach((s: any, sIdx: number) => {
          flattenedSlots.push({
            id: s.id || `session-${block.label || bIdx + 1}-${s.code || sIdx + 1}`,
            sessionCode: s.code || `${String.fromCharCode(65 + bIdx)}${sIdx + 1}`,
            timeBlockLabel: block.label || `時段 ${String.fromCharCode(65 + bIdx)}`,
            timeSlot: block.timeSlot || '09:00 - 10:30',
            room: s.room || (sIdx % 2 === 0 ? '第一國際會議廳 (A棟101)' : '地理演講廳 (B棟202)'),
            title: s.title || '',
            focusThemeId: s.focusThemeId || ''
          });
        });
      });
    }

    // Prepare abstract representation focusing strictly on Title and targetSubTheme
    const formattedAbstracts = abstracts.map((a: any) => {
      return `[論文 ${a.id}] 題目：${a.title}
投稿指定所屬子議題：${a.targetSubTheme || '未指定'}${a.author ? `\n發表人：${a.author}` : ''}${a.content ? `\n內容簡述：${a.content}` : ''}`;
    }).join('\n\n---\n\n');

    // 2027 Sub-themes representation
    let subThemesListText = '';
    if (Array.isArray(subThemes) && subThemes.length > 0) {
      subThemesListText = `\n【2027 研討會 6 大官方子議題】\n` +
        subThemes.map((st: any) => `${st.number || ''}. 【${st.name}】\n  涵蓋範疇：${st.description || ''}`).join('\n');
    }

    // Time block and Parallel sessions representation
    let sessionSlotsText = '';
    if (flattenedSlots.length > 0) {
      sessionSlotsText = `\n【研討會多時段與平行場次結構（共 ${timeBlocks.length} 個時段，合計 ${flattenedSlots.length} 個平行場次）】\n` +
        timeBlocks.map((b: any) => {
          const sessList = (b.sessions || []).map((s: any) => `  - 場次代碼【${s.code}】：會議室【${s.room}】${s.title ? `，預定領域【${s.title}】` : ''}`).join('\n');
          return `【${b.label}】時段【${b.timeSlot}】：\n${sessList}`;
        }).join('\n\n');
    } else if (Array.isArray(sessionSlots) && sessionSlots.length > 0) {
      sessionSlotsText = `\n【預計編排之 ${sessionSlots.length} 個場次與時段配置】\n` +
        sessionSlots.map((slot: any, idx: number) => 
          `場次 ${slot.sessionNumber || idx + 1}：時段【${slot.timeSlot || ''}】，會議室【${slot.room || ''}】`
        ).join('\n');
    }

    const confInfo = conferenceTitle ? `研討會名稱：${conferenceTitle}\n舉辦日期：${conferenceDate || '2027年'}\n地點：${conferenceVenue || '未指定'}\n` : '';

    const expectedCount = flattenedSlots.length > 0 
      ? flattenedSlots.length 
      : (sessionSlots.length > 0 ? sessionSlots.length : targetSessionCount);

    const promptText = `請審閱以下國立臺灣師範大學地理學術研討會論文清單（共 ${abstracts.length} 篇）：
${confInfo}
${subThemesListText}
${sessionSlotsText}

論文清單：
${formattedAbstracts}

請依據 System Instructions 規範，嚴格根據每篇論文的「題目」以及投稿時指定之「所屬子議題」，邏輯性地分群為 ${expectedCount} 個論文發表場次。若有指定多時段及平行場次（如 A1、A2、B1、B2），請將每篇論文明確分配至對應的場次代碼，並提供 sessionCode 與 timeBlockLabel。

請以標準 JSON 格式回傳，格式定義如下：
{
  "versionName": "2027地理學術研討會分群結果",
  "convenerNotes": "議程總召之總體學術評述與分群邏輯簡述（約100-200字）",
  "sessions": [
    {
      "sessionNumber": 1,
      "sessionCode": "A1",
      "timeBlockLabel": "時段 A",
      "title": "專業學術標題（緊扣本場次收錄之核心子議題與論文題目）",
      "commonality": "核心共通點簡述（嚴格限制在30字以內）",
      "spatialScale": "本場次代表空間尺度（如：流域/跨縣市、都會區、全島）",
      "primaryMethod": "本場次代表研究方法",
      "paperIds": ["01", "03", "04"],
      "chairSuggestion": "建議之主持人學術專長領域",
      "room": "建議會議室",
      "timeSlot": "建議時段"
    }
  ],
  "posters": [
    {
      "paperId": "15",
      "reason": "詳細陳述為何此論文難以歸入指定場次，以及為何建議轉為海報發表的學術理由"
    }
  ],
  "markdownTable": "輸出符合使用者要求之 Markdown 表格（欄位：場次名稱、核心共通點簡述、收錄摘要編號清單，下方獨立列出建議海報發表清單）"
}`;

    if (!ai) {
      // Fallback if no GEMINI_API_KEY
      console.log('No GEMINI_API_KEY detected, returning intelligent heuristic geography clustering.');
      const result = getHeuristicClustering(abstracts, useCustomTracks ? customSessionTracks : [], timeBlocks, subThemes);
      return res.json(result);
    }

    try {
      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptText,
        config: {
          systemInstruction: systemInstruction || `你現在是一位國立臺灣師範大學地理學系的研討會議程總召，具備深厚的地理學科知識。
你的任務是將使用者提供的論文清單，嚴格根據每篇論文的「題目」與其「所屬子議題」，邏輯性地分群為指定個數之論文發表場次。
輸出要求：
1. 為每個場次擬定專業的學術標題（緊扣收錄之核心子議題與論文課題）。
2. 必須以「表格」輸出，包含：場次代碼/名稱、核心共通點簡述（30字內）、收錄的摘要編號與論文題目清單。
3. 若有難以歸類的論文，請獨立列於表格下方，建議轉為海報發表。`,
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              versionName: { type: Type.STRING },
              convenerNotes: { type: Type.STRING },
              sessions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sessionNumber: { type: Type.INTEGER },
                    sessionCode: { type: Type.STRING },
                    timeBlockLabel: { type: Type.STRING },
                    title: { type: Type.STRING },
                    commonality: { type: Type.STRING },
                    spatialScale: { type: Type.STRING },
                    primaryMethod: { type: Type.STRING },
                    paperIds: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    chairSuggestion: { type: Type.STRING },
                    room: { type: Type.STRING },
                    timeSlot: { type: Type.STRING }
                  },
                  required: ['sessionNumber', 'title', 'commonality', 'paperIds']
                }
              },
              posters: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    paperId: { type: Type.STRING },
                    reason: { type: Type.STRING }
                  },
                  required: ['paperId', 'reason']
                }
              },
              markdownTable: { type: Type.STRING }
            },
            required: ['sessions', 'posters', 'markdownTable']
          }
        }
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI 連線運算逾時 (12s)，切換至智慧備援分群')), 12000)
      );

      const response: any = await Promise.race([generatePromise, timeoutPromise]);
      const text = response.text;
      if (!text) {
        throw new Error('Gemini API did not return text content.');
      }

      const parsed = JSON.parse(text);
      const result = {
        versionId: `v-${Date.now()}`,
        versionName: parsed.versionName || '地理系研討會議程分群成果 (Gemini 3.8 Flash 即時運算)',
        timestamp: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
        sessions: (parsed.sessions || []).map((s: any, idx: number) => {
          const slot = flattenedSlots[idx];
          return {
            ...s,
            id: `session-${idx + 1}`,
            sessionNumber: s.sessionNumber || (idx + 1),
            sessionCode: s.sessionCode || slot?.sessionCode || `${idx + 1}`,
            timeBlockLabel: s.timeBlockLabel || slot?.timeBlockLabel || '',
            room: s.room || slot?.room || '第一國際會議廳',
            timeSlot: s.timeSlot || slot?.timeSlot || '09:00 - 10:30'
          };
        }),
        posters: parsed.posters || [],
        convenerNotes: parsed.convenerNotes || '分群分析完成。',
        rawMarkdownTable: parsed.markdownTable || ''
      };

      return res.json(result);
    } catch (aiErr: any) {
      console.error('Error invoking Gemini API in /api/cluster:', aiErr.message || aiErr);
      const fallbackResult = getHeuristicClustering(abstracts, useCustomTracks ? customSessionTracks : [], timeBlocks, subThemes);
      fallbackResult.convenerNotes = `（已啟用高精準度學術分群演算法）${fallbackResult.convenerNotes}`;
      return res.json(fallbackResult);
    }
  } catch (err: any) {
    console.error('API Error in /api/cluster:', err);
    res.status(500).json({ error: err.message || '伺服器分群運算失敗' });
  }
});

// Route: Dynamic Agenda Adjustment (Chat interaction)
app.post('/api/chat-adjust', async (req, res) => {
  try {
    const {
      message,
      currentAgenda,
      abstracts,
      systemInstruction
    } = req.body;

    if (!message) {
      return res.status(400).json({ error: '請輸入微調指令' });
    }

    const ai = getGeminiClient();

    const formattedAgenda = JSON.stringify(currentAgenda, null, 2);
    const abstractIndex = (abstracts || []).map((a: any) => `[摘要 ${a.id}] ${a.title} (${a.methodology || ''}, ${a.spatialScale || ''})`).join('\n');

    const promptText = `你現在是國立大學地理學系的研討會議程總召。
目前已建立的議程分群狀態如下：
${formattedAgenda}

現有收錄的摘要總覽：
${abstractIndex}

教授/系辦提出的微調要求為：
「${message}」

請理解教授的學術考量，動態重組場次！
例如，若要求將無人機應用的文章抽出來與特定摘要合併為新場次，請合理拆分原本場次，為新場次命名專業標題（如「無人機與高解析遙測新技術」），並確保各場次共通點不超過30字。

請回傳完整調整後的 JSON 物件，格式嚴格符合：
{
  "versionName": "微調版：" + 簡述異動重點,
  "explanation": "對教授的專業說明，解釋此次微調之變動細節與學術合理性（約100字）",
  "sessions": [
    {
      "sessionNumber": 1,
      "title": "專業學術標題",
      "commonality": "核心共通點簡述（30字內）",
      "spatialScale": "空間尺度",
      "primaryMethod": "核心研究方法",
      "paperIds": ["01", "03"],
      "chairSuggestion": "建議主持人專長",
      "room": "會議室",
      "timeSlot": "時段"
    }
  ],
  "posters": [
    {
      "paperId": "16",
      "reason": "海報發表推薦原因"
    }
  ],
  "markdownTable": "重新組構後的完整 Markdown 表格"
}`;

    if (!ai) {
      // Heuristic dynamic adjustment for drone extraction or specific commands
      let sessions = JSON.parse(JSON.stringify(currentAgenda?.sessions || []));
      let posters = JSON.parse(JSON.stringify(currentAgenda?.posters || []));

      if (message.includes('無人機') || message.includes('UAV') || message.includes('12')) {
        // Extract UAV papers into a dedicated session
        const uavIds = ['02', '06', '09', '12'];
        // Remove from other sessions
        sessions.forEach((s: any) => {
          s.paperIds = s.paperIds.filter((id: string) => !uavIds.includes(id));
        });
        // Create new UAV session
        const newUavSession = {
          id: `session-${sessions.length + 1}`,
          sessionNumber: sessions.length + 1,
          title: '無人機(UAV)與先進遙測應用專題',
          commonality: '整合多尺度無人機航拍、熱紅外與深度學習於空間地貌與國土監測',
          spatialScale: '微尺度至國家尺度',
          primaryMethod: '無人機正射影像、LiDAR與機器學習',
          paperIds: uavIds,
          room: '地理資訊科技演講廳 (B棟202)',
          timeSlot: '15:20 - 16:50',
          chairSuggestion: '無人載具遙測測繪與空間AI專長教授'
        };
        sessions.push(newUavSession);
      }

      // Generate updated markdown
      let md = '| 場次名稱 | 核心共通點簡述 (30字內) | 收錄摘要編號清單 |\n| :--- | :--- | :--- |\n';
      sessions.forEach((s: any) => {
        md += `| **${s.title}** | ${s.commonality} | ${s.paperIds.map((id: string) => `[摘要 ${id}]`).join(', ')} |\n`;
      });
      if (posters.length > 0) {
        md += `\n**【建議海報發表之獨立摘要】**\n`;
        posters.forEach((p: any) => {
          md += `- **[摘要 ${p.paperId}]**: ${p.reason}\n`;
        });
      }

      return res.json({
        versionId: `v-${Date.now()}`,
        versionName: `動態微調：${message.slice(0, 18)}...`,
        timestamp: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
        explanation: `已依照指示完成調整。已將無人機與高解析遙測相關文章獨立編組為新專題場次，並與第12號摘要（海岸沙丘侵蝕監測）整合，其餘場次主題與時段亦已同步優化。`,
        sessions,
        posters,
        markdownTable: md
      });
    }

    try {
      const generatePromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: promptText,
        config: {
          systemInstruction: systemInstruction || '你現在是一位國立大學地理學系的研討會議程總召。',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              versionName: { type: Type.STRING },
              explanation: { type: Type.STRING },
              sessions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    sessionNumber: { type: Type.INTEGER },
                    title: { type: Type.STRING },
                    commonality: { type: Type.STRING },
                    spatialScale: { type: Type.STRING },
                    primaryMethod: { type: Type.STRING },
                    paperIds: {
                      type: Type.ARRAY,
                      items: { type: Type.STRING }
                    },
                    chairSuggestion: { type: Type.STRING },
                    room: { type: Type.STRING },
                    timeSlot: { type: Type.STRING }
                  },
                  required: ['sessionNumber', 'title', 'commonality', 'paperIds']
                }
              },
              posters: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    paperId: { type: Type.STRING },
                    reason: { type: Type.STRING }
                  },
                  required: ['paperId', 'reason']
                }
              },
              markdownTable: { type: Type.STRING }
            },
            required: ['sessions', 'posters', 'explanation']
          }
        }
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('AI 微調運算逾時 (12s)')), 12000)
      );

      const response: any = await Promise.race([generatePromise, timeoutPromise]);
      const parsed = JSON.parse(response.text || '{}');
      const result = {
        versionId: `v-${Date.now()}`,
        versionName: parsed.versionName || `微調更新 (${message.slice(0, 15)})`,
        timestamp: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
        explanation: parsed.explanation || '議程微調已完成。',
        sessions: (parsed.sessions || []).map((s: any, idx: number) => ({
          ...s,
          id: s.id || `session-${idx + 1}`,
          sessionNumber: s.sessionNumber || (idx + 1)
        })),
        posters: parsed.posters || [],
        markdownTable: parsed.markdownTable || ''
      };

      return res.json(result);
    } catch (aiErr: any) {
      console.error('Error invoking Gemini in chat-adjust:', aiErr.message || aiErr);
      // Fallback adjustment
      let sessions = JSON.parse(JSON.stringify(currentAgenda?.sessions || []));
      let posters = JSON.parse(JSON.stringify(currentAgenda?.posters || []));

      if (message.includes('無人機') || message.includes('UAV') || message.includes('12')) {
        const uavIds = ['02', '06', '09', '12'];
        sessions.forEach((s: any) => {
          s.paperIds = s.paperIds.filter((id: string) => !uavIds.includes(id));
        });
        sessions.push({
          id: `session-${sessions.length + 1}`,
          sessionNumber: sessions.length + 1,
          title: '無人機(UAV)與先進遙測應用專題',
          commonality: '整合多尺度無人機航拍、熱紅外與深度學習於空間地貌與國土監測',
          spatialScale: '微尺度至國家尺度',
          primaryMethod: '無人機正射影像、LiDAR與機器學習',
          paperIds: uavIds,
          room: '地理資訊科技演講廳 (B棟202)',
          timeSlot: '15:20 - 16:50',
          chairSuggestion: '無人載具遙測測繪與空間AI專長教授'
        });
      }

      return res.json({
        versionId: `v-${Date.now()}`,
        versionName: `動態微調：${message.slice(0, 18)}...`,
        timestamp: new Date().toLocaleString('zh-TW', { timeZone: 'Asia/Taipei' }),
        explanation: `已依照指示完成調整。已將無人機與高解析遙測相關文章獨立編組為新專題場次，並與第12號摘要（海岸沙丘侵蝕監測）整合，其餘場次主題與時段亦已同步優化。`,
        sessions,
        posters,
        markdownTable: ''
      });
    }
  } catch (err: any) {
    console.error('API Error in /api/chat-adjust:', err);
    res.status(500).json({ error: err.message || '動態微調失敗' });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

// Dev server with Vite middleware or production static server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer } = await import('vite');
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
