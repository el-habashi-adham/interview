// Shared types for app

export type ID = string;
export type DateISO = string;

// Knowledge sources
export type SourceType = 'Slack' | 'Notion' | 'GitHub' | 'Confluence';

export interface Person {
  id: ID;
  name: string;
  role: string;
  email: string;
  avatarUrl?: string;
}

export type Topic = string;

export interface Citation {
  source: SourceType;
  title: string;
  url: string;
  date: DateISO;
  authorId?: ID;
  repo?: string;
  pageId?: string;
  channel?: string;
}

// Search
export interface SearchQA {
  id: ID;
  question: string;
  answer: string;
  confidence: number;
  citations: Citation[];
  related: string[];
  date: DateISO;
  topics: Topic[];
  sourceTypes: SourceType[];
}

// Graph
export type NodeType = 'document' | 'person' | 'topic';

export interface GraphNode {
  id: ID;
  type: NodeType;
  label: string;
  meta?: Record<string, unknown>;
}

export interface GraphEdge {
  id: ID;
  source: ID;
  target: ID;
  relation: string;
  weight?: number;
}

// Dashboard
export interface DashboardMetrics {
  docsIndexed: number;
  questionsAnswered: number;
  timeSavedHours: number;
  healthScore: number;
}

export interface SearchVolumePoint {
  date: DateISO;
  count: number;
}

export interface TopTopic {
  topic: Topic;
  count: number;
}

export interface PieSlice {
  label: string;
  value: number;
}

export interface DashboardData {
  metrics: DashboardMetrics;
  searchVolume: SearchVolumePoint[];
  topTopics: TopTopic[];
  gapsByType: PieSlice[];
}

// API response wrapper
export interface ApiResponse<T> {
  data: T;
  error?: string;
}
