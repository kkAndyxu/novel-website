/* ============================================
   墨韵小说 - 用户认证系统
   ============================================ */

const UserManager = {
  currentUser: null,
  userProfile: null,

  init() {
    auth.onAuthStateChanged(async (user) => {
      this.currentUser = user;
      if (user) {
        await this.loadUserProfile();
      } else {
        this.userProfile = null;
      }
      this.updateNavbar();
    });
  },

  async loadUserProfile() {
    if (!this.currentUser) return null;
    try {
      const doc = await db.collection(COLLECTIONS.USERS).doc(this.currentUser.uid).get();
      if (doc.exists) {
        this.userProfile = { id: doc.id, ...doc.data() };
      } else {
        this.userProfile = {
          id: this.currentUser.uid,
          email: this.currentUser.email,
          penName: this.currentUser.email.split('@')[0],
          avatar: null,
          bio: '',
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          novelsCount: 0,
          followersCount: 0,
          followingCount: 0
        };
        await db.collection(COLLECTIONS.USERS).doc(this.currentUser.uid).set(this.userProfile);
      }
      return this.userProfile;
    } catch (error) {
      console.error('加载用户资料失败:', error);
      return null;
    }
  },

  async updateProfile(data) {
    if (!this.currentUser) return false;
    try {
      await db.collection(COLLECTIONS.USERS).doc(this.currentUser.uid).update({
        ...data,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      this.userProfile = { ...this.userProfile, ...data };
      return true;
    } catch (error) {
      console.error('更新用户资料失败:', error);
      return false;
    }
  },

  updateNavbar() {
    const navLinks = document.querySelector('.nav-links');
    const navBtn = document.querySelector('.nav-btn');
    if (!navLinks) return;

    const oldUserBtn = navLinks.querySelector('.user-menu');
    if (oldUserBtn) oldUserBtn.remove();

    if (this.currentUser && this.userProfile) {
      if (navBtn) navBtn.style.display = 'none';
      const userMenu = document.createElement('div');
      userMenu.className = 'user-menu';
      userMenu.innerHTML = `
        <a href="profile.html" class="user-avatar-link">
          <div class="nav-avatar">${this.userProfile.penName.charAt(0).toUpperCase()}</div>
        </a>
        <div class="user-dropdown">
          <a href="profile.html"><span>👤</span> 个人中心</a>
          <a href="bookshelf.html"><span>📚</span> 我的书架</a>
          <a href="community.html"><span>👥</span> 书友圈</a>
          <a href="messages.html"><span>💬</span> 私信</a>
          <a href="publish.html"><span>✏️</span> 发布作品</a>
          <hr>
          <a href="#" onclick="UserManager.logout(); return false;"><span>🚪</span> 退出登录</a>
        </div>
      `;
      navLinks.appendChild(userMenu);
    } else {
      if (navBtn) {
        navBtn.style.display = 'inline-flex';
        navBtn.href = 'login.html';
        navBtn.textContent = '🔐 登录';
      }
    }
  },

  async register(email, password, penName) {
    try {
      const result = await auth.createUserWithEmailAndPassword(email, password);
      await db.collection(COLLECTIONS.USERS).doc(result.user.uid).set({
        email: email,
        penName: penName,
        avatar: null,
        bio: '',
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        novelsCount: 0,
        followersCount: 0,
        followingCount: 0
      });
      showToast('注册成功！欢迎加入墨韵小说', 'success');
      return { success: true, user: result.user };
    } catch (error) {
      let message = '注册失败';
      if (error.code === 'auth/email-already-in-use') message = '该邮箱已被注册';
      else if (error.code === 'auth/weak-password') message = '密码至少6位';
      else if (error.code === 'auth/invalid-email') message = '邮箱格式不正确';
      showToast(message, 'error');
      return { success: false, error: message };
    }
  },

  async login(email, password) {
    try {
      const result = await auth.signInWithEmailAndPassword(email, password);
      showToast('登录成功！', 'success');
      return { success: true, user: result.user };
    } catch (error) {
      let message = '登录失败';
      if (error.code === 'auth/user-not-found') message = '该邮箱未注册';
      else if (error.code === 'auth/wrong-password') message = '密码错误';
      showToast(message, 'error');
      return { success: false, error: message };
    }
  },

  async logout() {
    try {
      await auth.signOut();
      showToast('已退出登录', 'info');
      window.location.href = 'index.html';
    } catch (error) {
      showToast('退出失败', 'error');
    }
  },

  requireAuth(redirectUrl = 'login.html') {
    if (!this.currentUser) {
      showToast('请先登录', 'error');
      setTimeout(() => { window.location.href = redirectUrl; }, 1000);
      return false;
    }
    return true;
  },

  async getUserById(userId) {
    try {
      const doc = await db.collection(COLLECTIONS.USERS).doc(userId).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    } catch (error) {
      return null;
    }
  }
};

document.addEventListener('DOMContentLoaded', () => {
  UserManager.init();
});
