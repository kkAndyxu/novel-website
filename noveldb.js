/* ============================================
   墨韵小说 - 小说数据库操作
   ============================================ */

const NovelDB = {
  async getAll() {
    try {
      const snapshot = await db.collection(COLLECTIONS.NOVELS).orderBy('createdAt', 'desc').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) { console.error('获取小说列表失败:', error); return []; }
  },

  async getById(id) {
    try {
      const doc = await db.collection(COLLECTIONS.NOVELS).doc(id).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    } catch (error) { console.error('获取小说失败:', error); return null; }
  },

  async add(novel) {
    try {
      const user = UserManager.currentUser;
      if (!user) { showToast('请先登录', 'error'); return null; }
      const novelData = {
        ...novel,
        authorId: user.uid,
        authorName: UserManager.userProfile?.penName || user.email,
        cover: novel.cover || Math.floor(Math.random() * 8) + 1,
        views: 0, likes: 0, rating: 0, ratingCount: 0,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };
      const docRef = await db.collection(COLLECTIONS.NOVELS).add(novelData);
      await db.collection(COLLECTIONS.USERS).doc(user.uid).update({ novelsCount: firebase.firestore.FieldValue.increment(1) });
      showToast('小说发布成功！', 'success');
      return { id: docRef.id, ...novelData };
    } catch (error) { console.error('发布小说失败:', error); showToast('发布失败', 'error'); return null; }
  },

  async update(id, data) {
    try {
      await db.collection(COLLECTIONS.NOVELS).doc(id).update({ ...data, updatedAt: firebase.firestore.FieldValue.serverTimestamp() });
      return true;
    } catch (error) { return false; }
  },

  async delete(id) {
    try { await db.collection(COLLECTIONS.NOVELS).doc(id).delete(); return true; } catch (error) { return false; }
  },

  async addView(id) {
    try { await db.collection(COLLECTIONS.NOVELS).doc(id).update({ views: firebase.firestore.FieldValue.increment(1) }); } catch (error) {}
  },

  async toggleLike(id) {
    const user = UserManager.currentUser;
    if (!user) { showToast('请先登录', 'error'); return null; }
    try {
      const likeRef = db.collection('likes').doc(`${user.uid}_${id}`);
      const likeDoc = await likeRef.get();
      if (likeDoc.exists) {
        await likeRef.delete();
        await db.collection(COLLECTIONS.NOVELS).doc(id).update({ likes: firebase.firestore.FieldValue.increment(-1) });
        return { liked: false };
      } else {
        await likeRef.set({ userId: user.uid, novelId: id, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
        await db.collection(COLLECTIONS.NOVELS).doc(id).update({ likes: firebase.firestore.FieldValue.increment(1) });
        return { liked: true };
      }
    } catch (error) { return null; }
  },

  async checkLiked(id) {
    const user = UserManager.currentUser;
    if (!user) return false;
    try { const doc = await db.collection('likes').doc(`${user.uid}_${id}`).get(); return doc.exists; } catch (error) { return false; }
  },

  async search(keyword) {
    try {
      const snapshot = await db.collection(COLLECTIONS.NOVELS).orderBy('title').startAt(keyword).endAt(keyword + '\uf8ff').get();
      let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      if (results.length < 10) {
        const authorSnapshot = await db.collection(COLLECTIONS.NOVELS).orderBy('authorName').startAt(keyword).endAt(keyword + '\uf8ff').get();
        results = [...results, ...authorSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))];
      }
      return Array.from(new Map(results.map(item => [item.id, item])).values());
    } catch (error) { return []; }
  },

  async filterByCategory(category) {
    try {
      if (!category || category === '全部') return await this.getAll();
      const snapshot = await db.collection(COLLECTIONS.NOVELS).where('category', '==', category).orderBy('createdAt', 'desc').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) { return []; }
  },

  async getCategories() {
    try {
      const snapshot = await db.collection(COLLECTIONS.NOVELS).get();
      const categories = new Set();
      snapshot.docs.forEach(doc => { if (doc.data().category) categories.add(doc.data().category); });
      return ['全部', ...Array.from(categories)];
    } catch (error) { return ['全部']; }
  },

  async getFeatured(count = 4) {
    try {
      const snapshot = await db.collection(COLLECTIONS.NOVELS).orderBy('views', 'desc').limit(count).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) { return []; }
  },

  async getLatest(count = 6) {
    try {
      const snapshot = await db.collection(COLLECTIONS.NOVELS).orderBy('updatedAt', 'desc').limit(count).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) { return []; }
  },

  async getTopRated(count = 5) {
    try {
      const snapshot = await db.collection(COLLECTIONS.NOVELS).orderBy('rating', 'desc').limit(count).get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) { return []; }
  },

  async getByUserId(userId) {
    try {
      const snapshot = await db.collection(COLLECTIONS.NOVELS).where('authorId', '==', userId).orderBy('createdAt', 'desc').get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) { return []; }
  }
};

function createNovelCard(novel) {
  return `
    <div class="novel-card" onclick="window.location.href='reader.html?id=${novel.id}'">
      <div class="novel-cover cover-gradient-${novel.cover || 1}">
        <span class="cover-text">${novel.title}</span>
        <span class="cover-tag">${novel.category || '未分类'}</span>
      </div>
      <div class="novel-info">
        <div class="novel-title">${novel.title}</div>
        <div class="novel-author">✍️ ${novel.authorName || '匿名'}</div>
        <div class="novel-desc">${novel.description || '暂无简介'}</div>
        <div class="novel-meta">
          <span>📖 ${novel.chapters ? novel.chapters.length : 0} 章</span>
          <span>👁️ ${formatNumber(novel.views || 0)}</span>
          <span>❤️ ${formatNumber(novel.likes || 0)}</span>
        </div>
      </div>
    </div>
  `;
}
