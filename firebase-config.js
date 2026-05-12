/* ============================================
   墨韵小说 - Firebase 配置
   ============================================ */

// Firebase 配置信息
const firebaseConfig = {
  apiKey: "AIzaSyAYdKR7uH2L8wA2yRVEOeHr58pbQFnDvgQ",
  authDomain: "moyunnovel.firebaseapp.com",
  projectId: "moyunnovel",
  storageBucket: "moyunnovel.firebasestorage.app",
  messagingSenderId: "285934679085",
  appId: "1:285934679085:web:2cb8f0ac55dea62c0a74a4"
};

// 初始化 Firebase
firebase.initializeApp(firebaseConfig);

// 获取服务实例
const auth = firebase.auth();
const db = firebase.firestore();

// ============================================
// 数据库集合名称
// ============================================
const COLLECTIONS = {
  NOVELS: 'novels',
  USERS: 'users',
  COMMENTS: 'comments',
  RATINGS: 'ratings',
  BOOKSHELF: 'bookshelf',
  READ_HISTORY: 'readHistory'
};

// ============================================
// 工具函数
// ============================================

// 生成唯一ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 格式化日期
function formatDate(date) {
  if (!date) return '';
  const d = date.toDate ? date.toDate() : new Date(date);
  return d.toISOString().split('T')[0];
}

// 格式化数字
function formatNumber(num) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toString();
}

// 显示 Toast 提示
function showToast(message, type = 'info') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = {
    success: '✅',
    error: '❌',
    info: 'ℹ️'
  };

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || ''}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// 获取URL参数
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// 防抖函数
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

console.log('🔥 Firebase 初始化成功');
