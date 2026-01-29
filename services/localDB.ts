
import { Post, OwnerProfile, PurchaseRecord, ChatMessage, Community } from '../types';
import { MOCK_POSTS, MOCK_OWNERS, MOCK_COMMUNITIES } from '../mockData';

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
