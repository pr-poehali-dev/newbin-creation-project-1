const API_URLS = {
  auth: 'https://functions.poehali.dev/c8890f8d-dd4e-47ef-8d9b-9c9a2fe45709',
  pins: 'https://functions.poehali.dev/2fc3f67a-0fd4-4e30-aa8e-a0e91e211259',
  comments: 'https://functions.poehali.dev/1880ecd7-64be-4b09-b1f9-0c2420408f9a',
  actions: 'https://functions.poehali.dev/3f3101e3-f8d3-444d-adf1-1b2d4aac84ea',
  admin: 'https://functions.poehali.dev/b5cf0db9-5864-4d78-83a1-d554993a5335',
};

export const api = {
  async auth(action: 'register' | 'login', username: string, password: string) {
    const res = await fetch(API_URLS.auth, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action, username, password }),
    });
    return res.json();
  },

  async getPins(params?: { user_id?: number; sort?: string; search?: string }) {
    const query = new URLSearchParams(params as any).toString();
    const res = await fetch(`${API_URLS.pins}?${query}`);
    return res.json();
  },

  async getPin(id: number, user_id?: number) {
    const res = await fetch(`${API_URLS.pins}?id=${id}&user_id=${user_id || 0}`);
    return res.json();
  },

  async createPin(data: {
    title: string;
    content: string;
    author_id: number;
    is_private: boolean;
    tags: string[];
  }) {
    const res = await fetch(API_URLS.pins, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  async deletePin(pin_id: number, user_id: number) {
    const res = await fetch(API_URLS.pins, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin_id, user_id }),
    });
    return res.json();
  },

  async getComments(pin_id: number) {
    const res = await fetch(`${API_URLS.comments}?pin_id=${pin_id}`);
    return res.json();
  },

  async createComment(pin_id: number, author_id: number, content: string) {
    const res = await fetch(API_URLS.comments, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pin_id, author_id, content }),
    });
    return res.json();
  },

  async report(entity_type: 'pin' | 'comment', entity_id: number) {
    const res = await fetch(API_URLS.actions, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'report', entity_type, entity_id }),
    });
    return res.json();
  },

  async toggleFavorite(user_id: number, pin_id: number, is_favorite: boolean) {
    const res = await fetch(API_URLS.actions, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'favorite', user_id, pin_id, is_favorite }),
    });
    return res.json();
  },

  async getFavorites(user_id: number) {
    const res = await fetch(API_URLS.actions, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'get_favorites', user_id }),
    });
    return res.json();
  },

  async isFavorite(user_id: number, pin_id: number) {
    const res = await fetch(API_URLS.actions, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'is_favorite', user_id, pin_id }),
    });
    return res.json();
  },

  async getUsers(admin_id: number, search: string = '') {
    const res = await fetch(`${API_URLS.admin}?admin_id=${admin_id}&search=${search}`);
    return res.json();
  },

  async adminAction(admin_id: number, action: string, user_id: number) {
    const res = await fetch(API_URLS.admin, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ admin_id, action, user_id }),
    });
    return res.json();
  },
};
