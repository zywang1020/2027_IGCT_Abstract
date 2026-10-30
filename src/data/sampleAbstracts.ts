import { AbstractItem, SubTheme, SessionSlot, TimeBlockConfig } from '../types';

export const OFFICIAL_2027_SUBTHEMES: SubTheme[] = [
  {
    id: "subtheme-1",
    number: 1,
    name: "空間資訊、地理人工智慧與新興科技",
    description: "涵蓋 GIS、遙測、GeoAI、與地理資料科學、時空大數據、無人機、數位孿生與智慧治理等。"
  },
  {
    id: "subtheme-2",
    number: 2,
    name: "氣候變遷、環境監測與生態系統",
    description: "涵蓋氣候變遷觀測與推估、大氣海洋、地形、水文、生態系統、生物多樣性、環境 DNA、生態系服務、碳循環與環境監測等。"
  },
  {
    id: "subtheme-3",
    number: 3,
    name: "環境災害、社會韌性與永續治理",
    description: "涵蓋災害風險評估、極端氣候、社會脆弱度、韌性社區、環境治理、政治生態、政治經濟、環境正義、淨零轉型、ESG、糧食安全與永續發展等。"
  },
  {
    id: "subtheme-4",
    number: 4,
    name: "文化地景、感官經驗與地方認同",
    description: "涵蓋文化地景、地景療癒、音景與氣味、感官地理、地方記憶、地方認同、生活與身體空間、性別議題、人口流動、觀光與文化資產等。"
  },
  {
    id: "subtheme-5",
    number: 5,
    name: "原住民族地理、傳統智慧與環境共治",
    description: "涵蓋原住民族地理、傳統生態知識、部落土地關係、採集狩獵文化、資源利用、環境共治與文化韌性等。"
  },
  {
    id: "subtheme-6",
    number: 6,
    name: "地理教育、環境認知與跨域學習",
    description: "涵蓋地理教育、環境教育與地理教學、戶外教育、地方本位學習、永續素養、跨域學程與教學創新等。"
  }
];

export const DEFAULT_TIME_BLOCKS: TimeBlockConfig[] = [
  {
    id: "block-a",
    label: "時段 A",
    timeSlot: "09:00 - 10:30",
    sessionCount: 2,
    sessions: [
      { id: "s-a1", code: "A1", room: "第一國際會議廳 (A棟101)", chairSuggestion: "空間資訊與地理AI專長" },
      { id: "s-a2", code: "A2", room: "地理資訊科技演講廳 (B棟202)", chairSuggestion: "氣候變遷與水文專長" }
    ]
  },
  {
    id: "block-b",
    label: "時段 B",
    timeSlot: "10:50 - 12:20",
    sessionCount: 2,
    sessions: [
      { id: "s-b1", code: "B1", room: "第一國際會議廳 (A棟101)", chairSuggestion: "環境災害與社會韌性專長" },
      { id: "s-b2", code: "B2", room: "地理資訊科技演講廳 (B棟202)", chairSuggestion: "無人機與遙測測繪專長" }
    ]
  },
  {
    id: "block-c",
    label: "時段 C",
    timeSlot: "13:30 - 15:00",
    sessionCount: 2,
    sessions: [
      { id: "s-c1", code: "C1", room: "第一國際會議廳 (A棟101)", chairSuggestion: "文化地景與地方認同專長" },
      { id: "s-c2", code: "C2", room: "地理資訊科技演講廳 (B棟202)", chairSuggestion: "原住民族地理與環境共治專長" }
    ]
  },
  {
    id: "block-d",
    label: "時段 D",
    timeSlot: "15:20 - 16:50",
    sessionCount: 2,
    sessions: [
      { id: "s-d1", code: "D1", room: "人文地理研討室 (A棟305)", chairSuggestion: "地理教育與教學創新專長" },
      { id: "s-d2", code: "D2", room: "第一國際會議廳 (A棟101)", chairSuggestion: "環境監測與永續治理專長" }
    ]
  }
];

export const DEFAULT_SESSION_SLOTS: SessionSlot[] = [
  {
    sessionNumber: 1,
    name: "場次一",
    timeSlot: "09:00 - 10:30",
    room: "第一國際會議廳 (A棟101)",
    chairSuggestion: "資深講座教授"
  },
  {
    sessionNumber: 2,
    name: "場次二",
    timeSlot: "10:50 - 12:20",
    room: "地理資訊科技演講廳 (B棟202)",
    chairSuggestion: "特聘教授"
  },
  {
    sessionNumber: 3,
    name: "場次三",
    timeSlot: "13:30 - 15:00",
    room: "第一國際會議廳 (A棟101)",
    chairSuggestion: "副教授"
  },
  {
    sessionNumber: 4,
    name: "場次四",
    timeSlot: "15:20 - 16:50",
    room: "人文地理研討室 (A棟305)",
    chairSuggestion: "助理教授 / 專題主持"
  }
];

export const DEFAULT_SYSTEM_INSTRUCTION = `你現在是一位國立臺灣師範大學地理學系的研討會議程總召，具備深厚的地理學科知識。
你的任務是將使用者提供的論文清單，嚴格根據論文的「題目」以及其指定的「所屬子議題」，依據 2027 研討會 6 大官方子議題以及設定的多時段與平行場次（如 A1、A2、B1、B2 等），邏輯性地分群為各個論文發表場次。
判斷標準：
1. 嚴格以每篇論文的「題目」核心課題與其指定之「所屬子議題」為依歸進行分類與媒合。
2. 為每個場次擬定專業的學術標題，緊扣該場次收錄之核心子議題。
3. 必須以「表格」輸出，包含：場次代碼、場次名稱、核心共通點簡述（30字內）、收錄的摘要編號與論文題目清單、時段與會議室。
4. 若有跨界或難以歸類的論文，請獨立列於表格下方，建議轉為海報發表。`;

// 預設為純淨空陣列，防止任何論文摘要與研究資料被 commit 外流至 GitHub 倉儲
export const SAMPLE_ABSTRACTS: AbstractItem[] = [];

