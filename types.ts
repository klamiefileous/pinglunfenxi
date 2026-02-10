
export interface Review {
  id: string;
  date: string;
  rating: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  text: string;
  score: number;
}

export interface Keyword {
  text: string;
  value: number;
  type: 'positive' | 'negative';
}

export interface AnalysisResult {
  reviews: Review[];
  positiveKeywords: Keyword[];
  negativeKeywords: Keyword[];
  summary: string;
  actionableImprovements: string[];
  trendAnalysis: string;
  mostLiked: string[];
  mostDisliked: string[];
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}
