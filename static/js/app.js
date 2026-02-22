// app.js - Main application logic
let allSkills = [];
let categories = [];
let currentFile = null;
let currentResult = null;

async function init() {
  [allSkills, categories] = await Promise.all([API.fetchSkills(), API.fetchCategories()]);
  if (!allSkills.length) {
    UI.showToast('无法加载技能数据，请刷新页面', true);
    return;
  }
  refreshAll();
  bindEvents();
}

function refreshAll() {
  const stats = Store.getStats();
  UI.updateProgress(stats.uniqueCount, allSkills.length);
  UI.renderGallery(allSkills, categories);
  UI.renderAchievements(allSkills);
  UI.renderProfile(allSkills.length);
}

function bindEvents() {
  // Navigation
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById('page-' + btn.dataset.page).classList.add('active');
    });
  });

  // Upload zone
  const zone = document.getElementById('uploadZone');
  const fileInput = document.getElementById('fileInput');
  zone.addEventListener('click', () => fileInput.click());
  zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('dragover'); });
  zone.addEventListener('dragleave', () => zone.classList.remove('dragover'));
  zone.addEventListener('drop', e => {
    e.preventDefault();
    zone.classList.remove('dragover');
    if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
  });
  fileInput.addEventListener('change', () => {
    if (fileInput.files[0]) handleFile(fileInput.files[0]);
  });

  // Preview actions
  document.getElementById('cancelBtn').addEventListener('click', resetCollect);
  document.getElementById('recognizeBtn').addEventListener('click', doRecognize);
  document.getElementById('confirmBtn').addEventListener('click', doConfirm);
  document.getElementById('retryBtn').addEventListener('click', resetCollect);

  // Modals
  document.getElementById('closeDetail').addEventListener('click', () => {
    document.getElementById('detailModal').classList.remove('active');
  });
  document.getElementById('detailModal').addEventListener('click', e => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove('active');
  });

  // Share
  document.getElementById('shareBtn').addEventListener('click', openShare);
  document.getElementById('closeShare').addEventListener('click', () => {
    document.getElementById('shareModal').classList.remove('active');
  });
  document.getElementById('shareModal').addEventListener('click', e => {
    if (e.target === e.currentTarget) e.currentTarget.classList.remove('active');
  });

  // Clear data
  document.getElementById('clearDataBtn').addEventListener('click', () => {
    if (confirm('确定清除所有收集数据？此操作不可恢复。')) {
      Store.clear();
      refreshAll();
      UI.showToast('数据已清除');
    }
  });
}

function handleFile(file) {
  if (!file.type.match(/^image\/(jpeg|png|webp)$/)) {
    UI.showToast('请上传 JPG/PNG/WEBP 格式图片', true);
    return;
  }
  if (file.size > 10 * 1024 * 1024) {
    UI.showToast('图片大小不能超过 10MB', true);
    return;
  }
  currentFile = file;
  const reader = new FileReader();
  reader.onload = e => {
    document.getElementById('previewImg').src = e.target.result;
    document.getElementById('uploadZone').style.display = 'none';
    document.getElementById('previewArea').style.display = 'block';
  };
  reader.readAsDataURL(file);
}

async function doRecognize() {
  if (!currentFile) return;
  const btn = document.getElementById('recognizeBtn');
  btn.disabled = true;
  btn.textContent = '识别中...';
  document.getElementById('previewArea').style.display = 'none';
  document.getElementById('loadingArea').style.display = 'block';

  try {
    currentResult = await API.recognize(currentFile);
    document.getElementById('loadingArea').style.display = 'none';

    if (!currentResult.matched) {
      UI.showToast(currentResult.reason || '未识别到相关技能，请换张图片试试', true);
      resetCollect();
      return;
    }

    // Show flip card
    UI.renderResultCard(currentResult.skill, currentResult.image_b64, currentResult.image_type);
    const wrap = document.getElementById('resultCard');
    const flipper = document.getElementById('cardFlipper');
    wrap.style.display = 'block';
    flipper.classList.remove('flipped');
    setTimeout(() => {
      flipper.classList.add('flipped');
      document.getElementById('confirmWrap').style.display = 'block';
    }, 400);
  } catch (e) {
    document.getElementById('loadingArea').style.display = 'none';
    UI.showToast(e.message || '识别失败，请重试', true);
    resetCollect();
  } finally {
    btn.disabled = false;
    btn.textContent = '🔍 识别技能';
  }
}

function doConfirm() {
  if (!currentResult?.skill) return;
  Store.collectSkill(currentResult.skill, currentResult.image_b64, currentResult.image_type);
  UI.showToast(`✨ 收藏成功：${currentResult.skill.name} +${currentResult.skill.score}pts`);
  refreshAll();
  resetCollect();
}

function resetCollect() {
  currentFile = null;
  currentResult = null;
  document.getElementById('fileInput').value = '';
  document.getElementById('uploadZone').style.display = '';
  document.getElementById('previewArea').style.display = 'none';
  document.getElementById('loadingArea').style.display = 'none';
  document.getElementById('resultCard').style.display = 'none';
  document.getElementById('confirmWrap').style.display = 'none';
  document.getElementById('cardFlipper').classList.remove('flipped');
}

function openShare() {
  const modal = document.getElementById('shareModal');
  const stats = Store.getStats();
  const resultImg = document.getElementById('shareResultImg');
  resultImg.style.display = 'none';

  document.getElementById('shareStats').innerHTML = `
    <span>收集 <strong>${stats.uniqueCount}</strong> 技能</span>
    <span>积分 <strong>${stats.totalScore}</strong></span>
    <span>次数 <strong>${stats.totalCollects}</strong></span>`;

  // QR code
  const qrEl = document.getElementById('share-qr');
  qrEl.innerHTML = '';
  new QRCode(qrEl, { text: window.location.href, width: 100, height: 100, colorDark: '#6D72C3', colorLight: '#1a1b2e' });

  const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);
  document.getElementById('shareTip').textContent = isMobile ? '长按图片保存分享' : '右键图片另存为';

  modal.classList.add('active');

  // Generate image after render
  setTimeout(() => {
    const card = document.getElementById('shareCardContent');
    if (typeof html2canvas !== 'undefined') {
      html2canvas(card, { backgroundColor: '#1a1b2e', scale: 2 }).then(canvas => {
        resultImg.src = canvas.toDataURL('image/png');
        resultImg.style.display = 'block';
      }).catch(() => {});
    }
  }, 500);
}

// Init
document.addEventListener('DOMContentLoaded', init);
