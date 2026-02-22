// ui.js - UI rendering and helpers
const UI = {
  escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str || '';
    return d.innerHTML;
  },

  showToast(msg, isError = false) {
    const c = document.getElementById('toastContainer');
    const t = document.createElement('div');
    t.className = 'toast' + (isError ? ' error' : '');
    t.textContent = msg;
    c.appendChild(t);
    setTimeout(() => t.remove(), 3000);
  },

  categoryEmojis: {
    '设计基础': '🎯', '心理与动机': '🧠', '机制系统': '🏗️',
    '叙事角色': '🎭', '世界构建': '🌐', '社交系统': '👥', '测试评估': '🔍'
  },

  rarityEmojis: {
    '初级': '🟢', '中级': '🔵', '高级': '🟣', '专家': '🟠', '大师': '🌟'
  },

  updateProgress(collected, total) {
    const pct = total > 0 ? Math.round(collected / total * 100) : 0;
    document.getElementById('progressText').textContent = `已收集 ${collected} / ${total}`;
    document.getElementById('progressPct').textContent = pct + '%';
    document.getElementById('progressFill').style.width = pct + '%';
  },

  renderGallery(allSkills, categories) {
    const container = document.getElementById('galleryContent');
    container.innerHTML = '';
    const col = Store.getCollection();

    categories.forEach(cat => {
      const skills = allSkills.filter(s => s.category === cat.name);
      if (!skills.length) return;
      const collectedCount = skills.filter(s => col[s.id]).length;

      const section = document.createElement('div');
      section.className = 'category-section';
      section.innerHTML = `
        <div class="category-header">
          <span class="cat-icon">${cat.icon}</span>
          <span class="cat-name">${this.escapeHtml(cat.name)}</span>
          <span class="cat-count">${collectedCount}/${skills.length}</span>
        </div>
        <div class="skill-grid"></div>`;

      const grid = section.querySelector('.skill-grid');
      skills.forEach(skill => {
        const isCollected = !!col[skill.id];
        const card = document.createElement('div');
        card.className = 'skill-card ' + (isCollected ? 'collected card-border-' + skill.rarity : 'locked');
        card.innerHTML = `
          <span class="skill-rarity"><span class="rarity-badge rarity-${this.escapeHtml(skill.rarity)}" style="font-size:0.6rem;padding:0.1rem 0.4rem">${this.escapeHtml(skill.rarity)}</span></span>
          <div class="skill-emoji">${this.categoryEmojis[skill.category] || '🎮'}</div>
          <div class="skill-name">${this.escapeHtml(skill.name)}</div>
          <div class="skill-score">${skill.score}pts</div>`;
        if (isCollected) {
          card.addEventListener('click', () => this.showDetail(skill, col[skill.id]));
        }
        grid.appendChild(card);
      });
      container.appendChild(section);
    });
  },

  showDetail(skill, collected) {
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('detailContent');
    let imgHtml = '';
    if (collected?.image_b64) {
      imgHtml = `<img src="data:${collected.image_type};base64,${collected.image_b64}" style="width:100%;max-height:180px;object-fit:cover;border-radius:0.5rem;margin-bottom:0.8rem">`;
    }
    content.innerHTML = `
      ${imgHtml}
      <div class="detail-name">${this.escapeHtml(skill.name)}</div>
      <div class="detail-cat">${this.categoryEmojis[skill.category] || ''} ${this.escapeHtml(skill.category)}</div>
      <div class="detail-desc">${this.escapeHtml(skill.description)}</div>
      <div class="detail-app">📌 ${this.escapeHtml(skill.application)}</div>
      <div class="detail-meta">
        <span class="rarity-badge rarity-${this.escapeHtml(skill.rarity)}">${this.escapeHtml(skill.rarity)}</span>
        <span>难度 ${'⭐'.repeat(skill.difficulty)}</span>
        <span>${skill.score}pts</span>
      </div>`;
    modal.classList.add('active');
  },

  renderAchievements(allSkills) {
    const stats = Store.getStats();
    const col = Store.getCollection();
    const categories = [...new Set(allSkills.map(s => s.category))];

    const achievements = [
      { name: '新手设计师', desc: '收集10个技能', icon: '🌱', check: () => stats.uniqueCount >= 10 },
      { name: '资深设计师', desc: '收集30个技能', icon: '🔥', check: () => stats.uniqueCount >= 30 },
      { name: '设计大师', desc: '收集全部72个技能', icon: '👑', check: () => stats.uniqueCount >= 72 },
    ];
    categories.forEach(cat => {
      const catSkills = allSkills.filter(s => s.category === cat);
      achievements.push({
        name: `${cat}精通`, desc: `收集${cat}全部${catSkills.length}个技能`,
        icon: this.categoryEmojis[cat] || '⭐',
        check: () => catSkills.every(s => col[s.id])
      });
    });

    const list = document.getElementById('achieveList');
    list.innerHTML = achievements.map(a => {
      const unlocked = a.check();
      return `<div class="achievement-item ${unlocked ? 'unlocked' : ''}">
        <div class="ach-icon">${a.icon}</div>
        <div class="ach-info"><div class="ach-name">${this.escapeHtml(a.name)}</div><div class="ach-desc">${this.escapeHtml(a.desc)}</div></div>
        <div class="ach-status">${unlocked ? '✅ 已达成' : '🔒'}</div>
      </div>`;
    }).join('');
  },

  renderProfile(totalSkills) {
    const stats = Store.getStats();
    const grid = document.getElementById('statsGrid');
    grid.innerHTML = `
      <div class="stat-card"><div class="stat-value">${stats.uniqueCount}</div><div class="stat-label">已收集技能</div></div>
      <div class="stat-card"><div class="stat-value">${totalSkills}</div><div class="stat-label">总技能数</div></div>
      <div class="stat-card"><div class="stat-value">${stats.totalScore}</div><div class="stat-label">总积分</div></div>
      <div class="stat-card"><div class="stat-value">${stats.totalCollects}</div><div class="stat-label">收集次数</div></div>`;
  },

  renderResultCard(skill, imageB64, imageType) {
    const back = document.getElementById('cardBack');
    let imgHtml = imageB64
      ? `<img class="card-img" src="data:${imageType};base64,${imageB64}" alt="">`
      : `<div class="card-img" style="background:var(--bg-secondary);display:flex;align-items:center;justify-content:center;font-size:2.5rem">${this.categoryEmojis[skill.category] || '🎮'}</div>`;
    back.innerHTML = `
      ${imgHtml}
      <div class="card-name">${this.escapeHtml(skill.name)}</div>
      <div class="card-category">${this.categoryEmojis[skill.category] || ''} ${this.escapeHtml(skill.category)}</div>
      <div class="card-desc">${this.escapeHtml(skill.description)}</div>
      <div class="card-meta">
        <span class="rarity-badge rarity-${this.escapeHtml(skill.rarity)}">${this.escapeHtml(skill.rarity)}</span>
        <span>${skill.score}pts · 难度${'⭐'.repeat(skill.difficulty)}</span>
      </div>`;
    back.parentElement.parentElement.querySelector('.card-back').classList.add('card-border-' + skill.rarity);
  }
};
