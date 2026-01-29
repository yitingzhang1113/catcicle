
import { Post, OwnerProfile, Community, PurchaseRecord, ChatMessage, RecommendedMatch } from '../types';
import { localDB } from './localDB';
import { MOCK_OWNERS } from '../mockData';

const BASE_URL = ''; 
const API_DELAY = 600;

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  await new Promise(resolve => setTimeout(resolve, API_DELAY));
  const token = localStorage.getItem('catcircle_token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  if (!BASE_URL) {
    return handleLocalFallback<T>(endpoint, options);
  }

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`API Request failed:`, error);
    throw error;
  }
}

function handleLocalFallback<T>(endpoint: string, options: RequestInit): T {
  const method = options.method || 'GET';
  const currentUserId = localDB.getCurrentUserId();
  
  if (endpoint === '/posts' && method === 'GET') return localDB.getPosts() as unknown as T;
  if (endpoint === '/posts' && method === 'POST') {
    const body = JSON.parse(options.body as string);
    localDB.savePosts([body, ...localDB.getPosts()]);
    return body as unknown as T;
  }
  if (endpoint.startsWith('/users/') && method === 'GET') {
    const id = endpoint.split('/').pop();
    return (localDB.getUsers().find(u => u.id === id) || null) as unknown as T;
  }
  if (endpoint === '/communities' && method === 'GET') return localDB.getCommunities() as unknown as T;
  
  // === 模拟高级 ML 匹配引擎接口 ===
  if (endpoint === '/discover/matches' && method === 'GET') {
    const me = MOCK_OWNERS.find(o => o.id === currentUserId) || MOCK_OWNERS[0];
    
    const matches: RecommendedMatch[] = MOCK_OWNERS
      .filter(o => o.id !== currentUserId)
      .map(o => {
        // 模拟向量相似度计算 (基于兴趣标签交集)
        const commonInterests = o.interests.filter(i => me.interests.includes(i));
        const score = 65 + (commonInterests.length * 8) + Math.floor(Math.random() * 5);
        
        let reason = "Matched via Neural Discovery. ";
        if (commonInterests.length > 0) {
          reason += `Both interested in ${commonInterests.join(', ')}. `;
        }
        if (o.cats[0].breed === me.cats[0].breed) {
          reason += `Shared passion for ${o.cats[0].breed}s.`;
        }

        return {
          owner: o,
          matchScore: Math.min(score, 99),
          reason
        };
      })
      .sort((a, b) => b.matchScore - a.matchScore);

    return matches as unknown as T;
  }

  return {} as T;
}

export const apiService = {
  async getCurrentUser(id: string): Promise<OwnerProfile | null> {
    return request<OwnerProfile | null>(`/users/${id}`);
  },
  async updateUser(user: OwnerProfile): Promise<void> {
    return request(`/users/${user.id}`, { method: 'PUT', body: JSON.stringify(user) });
  },
  async getPosts(): Promise<Post[]> {
    return request<Post[]>('/posts');
  },
  async createPost(post: Post): Promise<Post> {
    return request<Post>('/posts', { method: 'POST', body: JSON.stringify(post) });
  },
  async getCommunities(): Promise<Community[]> {
    return request<Community[]>('/communities');
  },
  async createCommunity(community: Community): Promise<Community> {
    return request<Community>('/communities', { method: 'POST', body: JSON.stringify(community) });
  },
  async getDirectMessages(userId: string): Promise<Record<string, ChatMessage[]>> {
    return new Promise(r => setTimeout(() => r(localDB.getChatMessages(userId)), 400));
  },
  async getFollowing(userId: string): Promise<string[]> {
    return new Promise(r => setTimeout(() => r(localDB.getFollowing(userId)), 200));
  },
  async saveFollowing(userId: string, ids: string[]): Promise<void> {
    localDB.saveFollowing(userId, ids);
  },
  async getPurchases(userId: string): Promise<PurchaseRecord[]> {
    const data = localDB.getPurchases(userId);
    return new Promise(r => setTimeout(() => r(data), 300));
  },
  async getRecommendedMatches(): Promise<RecommendedMatch[]> {
    return request<RecommendedMatch[]>('/discover/matches');
  }
};
