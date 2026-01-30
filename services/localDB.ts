
import { Post, OwnerProfile, PurchaseRecord, ChatMessage, Community } from '../types';
import { MOCK_POSTS, MOCK_OWNERS, MOCK_COMMUNITIES, MOCK_PRODUCTS } from '../mockData';

const STORAGE_KEYS = {
  POSTS: 'catcircle_posts',
  USERS: 'catcircle_users',
  SESSION: 'catcircle_session',
  PURCHASES: 'catcircle_purchases',
  CHATS: 'catcircle_chats',
  FOLLOWING: 'catcircle_following',
  COMMUNITIES: 'catcircle_communities',
  GROUP_CHATS: 'catcircle_group_chats'
};

export const localDB = {
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
      localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(MOCK_POSTS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(MOCK_OWNERS));
    }
    if (!localStorage.getItem(STORAGE_KEYS.COMMUNITIES)) {
      localStorage.setItem(STORAGE_KEYS.COMMUNITIES, JSON.stringify(MOCK_COMMUNITIES));
    }

    // Seed purchases for the demo main account so the Purchases tab isn't empty.
    const me = MOCK_OWNERS.find(u => u.id === 'owner_me');
    const purchasesKey = me ? `${STORAGE_KEYS.PURCHASES}_${me.id}` : null;
    if (purchasesKey && !localStorage.getItem(purchasesKey)) {
      const byId = new Map(MOCK_PRODUCTS.map(p => [p.id, p] as const));
      const seed: PurchaseRecord[] = [
        {
          id: 'pur_seed_1',
          product: byId.get('pr1') || MOCK_PRODUCTS[0],
          paymentMethod: 'USD',
          amountPaid: 12.99,
          timestamp: Date.now() - 1000 * 60 * 60 * 24 * 12
        },
        {
          id: 'pur_seed_2',
          product: byId.get('pr2') || MOCK_PRODUCTS[1],
          paymentMethod: 'Coins',
          amountPaid: 1200,
          timestamp: Date.now() - 1000 * 60 * 60 * 24 * 5
        }
      ];
      localStorage.setItem(purchasesKey, JSON.stringify(seed));
    }
  },

  getCurrentUserId(): string | null {
    return localStorage.getItem(STORAGE_KEYS.SESSION);
  },
  setCurrentUserId(id: string | null) {
    if (id) localStorage.setItem(STORAGE_KEYS.SESSION, id);
    else localStorage.removeItem(STORAGE_KEYS.SESSION);
  },

  getUsers(): OwnerProfile[] {
    const data = localStorage.getItem(STORAGE_KEYS.USERS);
    return data ? JSON.parse(data) : MOCK_OWNERS;
  },
  saveUser(user: OwnerProfile) {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === user.id);
    if (index > -1) {
      users[index] = user;
    } else {
      users.push(user);
    }
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
  },

  getPosts(): Post[] {
    const data = localStorage.getItem(STORAGE_KEYS.POSTS);
    return data ? JSON.parse(data) : [];
  },
  savePosts(posts: Post[]) {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  },

  getCommunities(): Community[] {
    const data = localStorage.getItem(STORAGE_KEYS.COMMUNITIES);
    return data ? JSON.parse(data) : MOCK_COMMUNITIES;
  },
  saveCommunities(communities: Community[]) {
    localStorage.setItem(STORAGE_KEYS.COMMUNITIES, JSON.stringify(communities));
  },

  getPurchases(userId: string): PurchaseRecord[] {
    const data = localStorage.getItem(`${STORAGE_KEYS.PURCHASES}_${userId}`);
    return data ? JSON.parse(data) : [];
  },
  savePurchases(userId: string, purchases: PurchaseRecord[]) {
    localStorage.setItem(`${STORAGE_KEYS.PURCHASES}_${userId}`, JSON.stringify(purchases));
  },

  getFollowing(userId: string): string[] {
    const data = localStorage.getItem(`${STORAGE_KEYS.FOLLOWING}_${userId}`);
    return data ? JSON.parse(data) : [];
  },
  saveFollowing(userId: string, ids: string[]) {
    localStorage.setItem(`${STORAGE_KEYS.FOLLOWING}_${userId}`, JSON.stringify(ids));
  },

  getChatMessages(userId: string): Record<string, ChatMessage[]> {
    const data = localStorage.getItem(`${STORAGE_KEYS.CHATS}_${userId}`);
    return data ? JSON.parse(data) : {};
  },
  saveChatMessages(userId: string, messages: Record<string, ChatMessage[]>) {
    localStorage.setItem(`${STORAGE_KEYS.CHATS}_${userId}`, JSON.stringify(messages));
  },

  getGroupChatMessages(): Record<string, ChatMessage[]> {
    const data = localStorage.getItem(STORAGE_KEYS.GROUP_CHATS);
    return data ? JSON.parse(data) : {};
  },
  saveGroupChatMessages(messages: Record<string, ChatMessage[]>) {
    localStorage.setItem(STORAGE_KEYS.GROUP_CHATS, JSON.stringify(messages));
  }
};
