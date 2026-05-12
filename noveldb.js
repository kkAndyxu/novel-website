/* ============================================
   墨韵小说 - 小说数据库操作
   ============================================ */

const NovelDB = {
  // 获取所有小说
  async getAll() {
    try {
      const snapshot = await db.collection(COLLECTIONS.NOVELS)
        .orderBy('createdAt', 'desc')
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('获取小说列表失败:', error);
      return [];
    }
  },

  // 根据ID获取小说
  async getById(id) {
    try {
      const doc = await db.collection(COLLECTIONS.NOVELS).doc(id).get();
      if (doc.exists) {
        return { id: doc.id, ...doc.data() };
      }
      return null;
    } catch (error) {
      console.error('获取小说失败:', error);
      return null;
    }
  },

  // 添加小说
  async add(novel) {
    try {
      const user = UserManager.currentUser;
      if (!user) {
        showToast('请先登录', 'error');
        return null;
      }

      const novelData = {
        ...novel,
        authorId: user.uid,
        authorName: UserManager.userProfile?.penName || user.email,
        cover: novel.cover || Math.floor(Math.random() * 8) + 1,
        views: 0,
        likes: 0,
        rating: 0,
        ratingCount: 0,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await db.collection(COLLECTIONS.NOVELS).add(novelData);

      // 更新用户的小说数量
      await db.collection(COLLECTIONS.USERS).doc(user.uid).update({
        novelsCount: firebase.firestore.FieldValue.increment(1)
      });

      showToast('小说发布成功！', 'success');
      return { id: docRef.id, ...novelData };
    } catch (error) {
      console.error('发布小说失败:', error);
      showToast('发布失败，请重试', 'error');
      return null;
    }
  },

  // 更新小说
  async update(id, data) {
    try {
      await db.collection(COLLECTIONS.NOVELS).doc(id).update({
        ...data,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('更新小说失败:', error);
      return false;
    }
  },

  // 删除小说
  async delete(id) {
    try {
      await db.collection(COLLECTIONS.NOVELS).doc(id).delete();
      return true;
    } catch (error) {
      console.error('删除小说失败:', error);
      return false;
    }
  },

  // 增加阅读量
  async addView(id) {
    try {
      await db.collection(COLLECTIONS.NOVELS).doc(id).update({
        views: firebase.firestore.FieldValue.increment(1)
      });
    } catch (error) {
      console.error('更新阅读量失败:', error);
    }
  },

  // 点赞/取消点赞
  async toggleLike(id) {
    const user = UserManager.currentUser;
    if (!user) {
      showToast('请先登录', 'error');
      return null;
    }

    try {
      const likeRef = db.collection('likes').doc(`${user.uid}_${id}`);
      const likeDoc = await likeRef.get();
      const novelRef = db.collection(COLLECTIONS.NOVELS).doc(id);

      if (likeDoc.exists) {
        // 取消点赞
        await likeRef.delete();
        await novelRef.update({
          likes: firebase.firestore.FieldValue.increment(-1)
        });
        return { liked: false };
      } else {
        // 添加点赞
        await likeRef.set({
          userId: user.uid,
          novelId: id,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        await novelRef.update({
          likes: firebase.firestore.FieldValue.increment(1)
        });
        return { liked: true };
      }
    } catch (error) {
      console.error('点赞操作失败:', error);
      return null;
    }
  },

  // 检查是否已点赞
  async checkLiked(id) {
    const user = UserManager.currentUser;
    if (!user) return false;

    try {
      const doc = await db.collection('likes').doc(`${user.uid}_${id}`).get();
      return doc.exists;
    } catch (error) {
      return false;
    }
  },

  // 搜索小说
  async search(keyword) {
    try {
      // Firestore 不支持全文搜索，这里用简单的方式
      const snapshot = await db.collection(COLLECTIONS.NOVELS)
        .orderBy('title')
        .startAt(keyword)
        .endAt(keyword + '\uf8ff')
        .get();

      let results = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // 如果结果太少，再搜索作者名
      if (results.length < 10) {
        const authorSnapshot = await db.collection(COLLECTIONS.NOVELS)
          .orderBy('authorName')
          .startAt(keyword)
          .endAt(keyword + '\uf8ff')
          .get();
        const authorResults = authorSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        results = [...results, ...authorResults];
      }

      // 去重
      const uniqueResults = Array.from(new Map(results.map(item => [item.id, item])).values());
      return uniqueResults;
    } catch (error) {
      console.error('搜索失败:', error);
      return [];
    }
  },

  // 按分类筛选
  async filterByCategory(category) {
    try {
      if (!category || category === '全部') {
        return await this.getAll();
      }
      const snapshot = await db.collection(COLLECTIONS.NOVELS)
        .where('category', '==', category)
        .orderBy('createdAt', 'desc')
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('筛选失败:', error);
      return [];
    }
  },

  // 获取所有分类
  async getCategories() {
    try {
      const snapshot = await db.collection(COLLECTIONS.NOVELS).get();
      const categories = new Set();
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.category) categories.add(data.category);
      });
      return ['全部', ...Array.from(categories)];
    } catch (error) {
      console.error('获取分类失败:', error);
      return ['全部'];
    }
  },

  // 获取热门推荐
  async getFeatured(count = 4) {
    try {
      const snapshot = await db.collection(COLLECTIONS.NOVELS)
        .orderBy('views', 'desc')
        .limit(count)
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('获取推荐失败:', error);
      return [];
    }
  },

  // 获取最新更新
  async getLatest(count = 6) {
    try {
      const snapshot = await db.collection(COLLECTIONS.NOVELS)
        .orderBy('updatedAt', 'desc')
        .limit(count)
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('获取最新失败:', error);
      return [];
    }
  },

  // 获取评分排行
  async getTopRated(count = 5) {
    try {
      const snapshot = await db.collection(COLLECTIONS.NOVELS)
        .orderBy('rating', 'desc')
        .limit(count)
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('获取排行失败:', error);
      return [];
    }
  },

  // 获取用户的小说
  async getByUserId(userId) {
    try {
      const snapshot = await db.collection(COLLECTIONS.NOVELS)
        .where('authorId', '==', userId)
        .orderBy('createdAt', 'desc')
        .get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('获取用户小说失败:', error);
      return [];
    }
  }
};

// ============================================
// 生成小说卡片HTML
// ============================================
function createNovelCard(novel) {
  const rating = novel.rating ? novel.rating.toFixed(1) : '暂无';
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
