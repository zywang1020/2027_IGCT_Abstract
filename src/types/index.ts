export interface SubTheme {
  id: string;
  number: number;
  name: string;
  description: string;
}

export interface SessionSlot {
  sessionNumber: number;
  name?: string; // 場次預計主題或名稱
  timeSlot: string; // 例如 09:00 - 10:30
  room: string; // 例如 第一國際會議廳 (A棟101)
  chairSuggestion?: string;
}

export interface AbstractItem {
  id: string; // e.g., "01", "02"
  title: string; // 論文題目 (主要依據)
  targetSubTheme?: string; // 投稿指定所屬子議題 (主要依據)
  author?: string;
  affiliation?: string;
  keywords?: string[];
  spatialScale?: string;
  methodology?: string;
  content?: string;
}

export interface SessionPaperAssignment {
  paperId: string;
  title: string;
  targetSubTheme?: string;
  matchHighlight?: string;
}

export interface ParallelSessionConfig {
  id: string;
  code: string; // e.g. "A1", "A2", "場次 1"
  name?: string;
  room: string;
  chairSuggestion?: string;
}

export interface TimeBlockConfig {
  id: string;
  label: string; // e.g. "時段 A", "上午時段"
  timeSlot: string; // e.g. "09:00 - 10:30"
  sessionCount: number; // 本時段平行場次數量 (例如 2)
  sessions: ParallelSessionConfig[];
}

export interface Session {
  id: string;
  sessionNumber: number;
  sessionCode?: string; // e.g. "A1", "B2"
  timeBlockLabel?: string; // e.g. "時段 A"
  title: string; // 學術標題
  commonality: string; // 核心共通點簡述（30字內）
  spatialScale: string;
  primaryMethod: string;
  paperIds: string[];
  papers?: SessionPaperAssignment[];
  room?: string;
  timeSlot?: string;
  chairSuggestion?: string;
  assignedSubThemes?: string[]; // 本場次涵蓋之子議題
}

export interface PosterPaper {
  paperId: string;
  title?: string;
  targetSubTheme?: string;
  reason: string;
}

export interface ClusteringResult {
  versionId: string;
  versionName: string;
  timestamp: string;
  sessions: Session[];
  posters: PosterPaper[];
  convenerNotes: string;
  rawMarkdownTable?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedAction?: string;
  appliedClustering?: ClusteringResult;
}

export interface SessionTrackConfig {
  id: string;
  name: string;
  description?: string;
  targetRoom?: string;
  timeSlot?: string;
}

export interface SystemConfig {
  model: string;
  temperature: number;
  systemInstruction: string;
  targetSessionCount: number; // 總場次數量
  timeBlocks: TimeBlockConfig[]; // 多時段、每時段多場次配置
  sessionSlots: SessionSlot[]; // 相容性場次配置
  conferenceTitle: string;
  conferenceDate: string;
  conferenceVenue: string;
  departmentName: string;
  subThemes: SubTheme[]; // 2027 研討會子議題清單
  useCustomTracks: boolean;
  customSessionTracks: SessionTrackConfig[];
}
