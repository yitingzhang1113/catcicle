
export enum PostType {
  DAILY = 'DAILY',
  CARE_TIPS = 'CARE_TIPS',
  PROBLEM = 'PROBLEM'
}

export enum RiskLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export interface CatProfile {
  id: string;
  ownerId: string;
  name: string;
  breed: string;
  age: number;
  gender: 'Male' | 'Female';
  neutered: boolean;
  personality: string[];
  healthTags: string[];
  avatar: string;
  bio?: string;
  features?: number[]; // Vector embeddings for ML
}

export interface OwnerProfile {
  id: string;
  accountName: string; 
  email?: string;
  avatar: string;
  bio: string;
  coinBalance: number;
  followersCount: number;
  followingCount: number;
  cats: CatProfile[];
  interests: string[]; // Feature input for ML
}

export interface RecommendedMatch {
  owner: OwnerProfile;
  matchScore: number;
  reason: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text?: string;
  imageUrl?: string;
  timestamp: number;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  avatar: string;
  memberIds: string[];
  creatorId: string;
  breedTag?: string;
}

export interface Post {
  id: string;
  catId: string;
  ownerId: string;
  communityId?: string;
  type: PostType;
  content: string;
  mediaUrl?: string;
  timestamp: number;
  likes: number;
  tips: number; 
  comments: Comment[];
  riskLevel?: RiskLevel;
  tags: string[];
}

export interface Comment {
  id: string;
  ownerId: string; 
  text: string;
  timestamp: number;
}

export interface ProductReview {
  id: string;
  ownerId: string;
  rating: number;
  comment: string;
  timestamp: number;
}

export interface Product {
  id: string;
  name: string;
  usdPrice: number;
  catCoinPrice: number; 
  category: 'Food' | 'Clothes' | 'Gear';
  imageUrl: string;
  description: string;
  reviews: ProductReview[];
}

export interface PurchaseRecord {
  id: string;
  product: Product;
  paymentMethod: 'USD' | 'Coins';
  amountPaid: number;
  timestamp: number;
}

export interface AssistantMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  metadata?: {
    riskLevel: RiskLevel;
    analysis?: string;
    actionableSteps?: string[];
    citations?: string[];
    followUpQuestions?: string[];
    communitySummary?: string;
    recommendedProductIds?: string[];
  };
}

export interface CatChallenge {
  id: string;
  title: string;
  description: string;
  reward: number;
  tag: string;
  isActive: boolean;
  endDate: number;
}
