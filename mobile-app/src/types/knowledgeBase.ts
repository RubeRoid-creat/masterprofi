// Knowledge Base types

export interface KnowledgeArticle {
  id: string;
  title: string;
  description: string;
  content: string;
  category: ArticleCategory;
  tags: string[];
  applianceTypes: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number; // in minutes
  views: number;
  likes: number;
  createdAt: string;
  updatedAt: string;
  author?: string;
  isFavorite?: boolean;
  isDownloaded?: boolean;
  attachments?: Attachment[];
}

export type ArticleCategory =
  | 'manual'
  | 'troubleshooting'
  | 'tutorial'
  | 'parts'
  | 'common_issue'
  | 'repair_guide';

export interface Attachment {
  id: string;
  type: 'pdf' | 'image' | 'video' | 'link';
  title: string;
  url: string;
  size?: number;
  duration?: number; // for videos
}

export interface TroubleshootingGuide {
  id: string;
  applianceType: string;
  issue: string;
  symptoms: string[];
  solutions: TroubleshootingSolution[];
  relatedArticles: string[];
}

export interface TroubleshootingSolution {
  step: number;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  estimatedTime: number;
  parts?: string[];
  tools?: string[];
}

export interface VideoTutorial {
  id: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  videoUrl: string;
  duration: number; // in seconds
  applianceType: string;
  category: string;
  views: number;
  likes: number;
  createdAt: string;
}

export interface PartsCompatibility {
  id: string;
  partNumber: string;
  partName: string;
  brand: string;
  compatibleWith: CompatiblePart[];
  incompatibleWith: string[];
  alternatives: string[];
}

export interface CompatiblePart {
  partNumber: string;
  partName: string;
  brand: string;
  compatibilityScore: number; // 0-100
  notes?: string;
}

export interface RepairEstimation {
  issue: string;
  applianceType: string;
  brand?: string;
  model?: string;
  estimatedTime: {
    min: number; // minutes
    max: number; // minutes
    average: number; // minutes
  };
  difficulty: 'easy' | 'medium' | 'hard';
  requiredParts?: string[];
  estimatedCost?: {
    parts: number;
    labor: number;
    total: number;
  };
}

export interface CommonIssue {
  id: string;
  applianceType: string;
  issue: string;
  description: string;
  frequency: number; // how common (0-100)
  quickFix?: string;
  solutions: string[]; // article IDs
}

export interface SearchFilters {
  category?: ArticleCategory[];
  applianceType?: string[];
  difficulty?: ('easy' | 'medium' | 'hard')[];
  minTime?: number;
  maxTime?: number;
  tags?: string[];
  hasVideo?: boolean;
  hasAttachment?: boolean;
}








