// api.js - API calls and data management
const API = {
  async fetchSkills() {
    try {
      const res = await fetch('/api/skills');
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
      return await res.json();
    } catch (e) {
      console.error('fetchSkills error:', e);
      UI.showToast('加载技能数据失败: ' + e.message, true);
      return [];
    }
  },

  async fetchCategories() {
    try {
      const res = await fetch('/api/categories');
      if (!res.ok) throw new Error(`${res.status}: ${await res.text()}`);
      return await res.json();
    } catch (e) {
      console.error('fetchCategories error:', e);
      return [];
    }
  },

  async recognize(file) {
    const form = new FormData();
    form.append('file', file);
    try {
      const res = await fetch('/api/recognize', { method: 'POST', body: form });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.detail || data.message || '识别失败';
        throw new Error(msg);
      }
      return data;
    } catch (e) {
      console.error('recognize error:', e);
      throw e;
    }
  }
};

// localStorage data manager
const Store = {
  KEY: 'skill_deck_collection',

  getCollection() {
    try {
      return JSON.parse(localStorage.getItem(this.KEY) || '{}');
    } catch { return {}; }
  },

  saveCollection(data) {
    localStorage.setItem(this.KEY, JSON.stringify(data));
  },

  collectSkill(skill, imageB64, imageType) {
    const col = this.getCollection();
    const entry = {
      ...skill,
      collected_at: new Date().toISOString(),
      image_b64: imageB64 || '',
      image_type: imageType || '',
      collect_count: (col[skill.id]?.collect_count || 0) + 1,
      total_score: (col[skill.id]?.total_score || 0) + (skill.score || 0),
    };
    col[skill.id] = entry;
    this.saveCollection(col);
    return entry;
  },

  isCollected(skillId) {
    return !!this.getCollection()[skillId];
  },

  getStats() {
    const col = this.getCollection();
    const entries = Object.values(col);
    const uniqueCount = entries.length;
    const totalScore = entries.reduce((s, e) => s + (e.total_score || e.score || 0), 0);
    const totalCollects = entries.reduce((s, e) => s + (e.collect_count || 1), 0);
    return { uniqueCount, totalScore, totalCollects, entries };
  },

  clear() {
    localStorage.removeItem(this.KEY);
  }
};
