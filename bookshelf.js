/* ============================================
   墨韵小说 - 书架和阅读记录
   ============================================ */

const Bookshelf = {
  // 添加到书架
  async addToBookshelf(novelId) {
    const user = UserManager.currentUser;
    if (!user) {
      showToast('请先登录', 'error');
      return false;
    }

    try {
      const shelfRef = db.collection(COLLECTIONS.BOOKSHELF).doc(`${user.uid}_${novelId}`);
      const shelfDoc = await shelfRef.get();

      if (shelfDoc.exists) {
        showToast('已在书架中', 'info');
        return true;
      }

      await shelfRef.set({
        userId: user.uid,
        novelId: novelId,
        addedAt: firebase.firestore.FieldValue.serverTimestamp()
      });

      showToast('已加入书架', 'success');
      return true;
    } catch (error) {
      console.error('加入书架失败:', error);
      showToast('操作失败', 'error');
      return false;
    }
  },

  // 从书架移除
  async removeFromBookshelf(novelId) {
    const user = UserManager.currentUser;
    if (!user) return false;

    try {
      await db.collection(COLLECTIONS.BOOKSHELF)
        .doc(`${user.uid}_${novelId}`)
        .delete();
      showToast('已从书架移除', 'info');
      return true;
    } catch (error) {
      console.error('移除失败:', error);
      return false;
    }
  },

  // 检查是否在书架中
  async isInBookshelf(novelId) {
    const user = UserManager.currentUser;
    if (!user) return false;

    try {
      const doc = await db.collection(COLLECTIONS.BOOKSHELF)
        .doc(`${user.uid}_${novelId}`)
        .get();
      return doc.exists;
    } catch (error) {
      return false;
    }
  },

  // 获取用户书架
  async getMyBookshelf() {
    const user = UserManager.currentUser;
    if (!user) return [];

    try {
      const snapshot = await db.collection(COLLECTIONS.BOOKSHELF)
        .where('userId', '==', user.uid)
        .orderBy('addedAt', 'desc')
        .get();

      const bookshelf = [];
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const novel = await NovelDB.getById(data.novelId);
        if (novel) {
          bookshelf.push({
            ...novel,
            addedAt: data.addedAt
          });
        }
      }
      return bookshelf;
    } catch (error) {
      console.error('获取书架失败:', error);
      return [];
    }
  }
};

// ============================================
// 阅读记录
// ============================================
const ReadHistory = {
  // 更新阅读进度
  async updateProgress(novelId, chapterId, chapterIndex) {
    const user = UserManager.currentUser;
    if (!user) return;

    try {
      const historyRef = db.collection(COLLECTIONS.READ_HISTORY).doc(`${user.uid}_${novelId}`);
      await historyRef.set({
        userId: user.uid,
        novelId: novelId,
        chapterId: chapterId,
        chapterIndex: chapterIndex,
        lastReadAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });
    } catch (error) {
      console.error('更新阅读进度失败:', error);
    }
  },

  // 获取阅读进度
  async getProgress(novelId) {
    const user = UserManager.currentUser;
    if (!user) return null;

    try {
      const doc = await db.collection(COLLECTIONS.READ_HISTORY)
        .doc(`${user.uid}_${novelId}`)
        .get();

      if (doc.exists) {
        return doc.data();
      }
      return null;
    } catch (error) {
      return null;
    }
  },

  // 获取阅读历史
  async getHistory(limit = 20) {
    const user = UserManager.currentUser;
    if (!user) return [];

    try {
      const snapshot = await db.collection(COLLECTIONS.READ_HISTORY)
        .where('userId', '==', user.uid)
        .orderBy('lastReadAt', 'desc')
        .limit(limit)
        .get();

      const history = [];
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const novel = await NovelDB.getById(data.novelId);
        if (novel) {
          history.push({
            ...novel,
            lastChapterId: data.chapterId,
            lastChapterIndex: data.chapterIndex,
            lastReadAt: data.lastReadAt
          });
        }
      }
      return history;
    } catch (error) {
      console.error('获取阅读历史失败:', error);
      return [];
    }
  },

  // 清除阅读历史
  async clearHistory() {
    const user = UserManager.currentUser;
    if (!user) return false;

    try {
      const snapshot = await db.collection(COLLECTIONS.READ_HISTORY)
        .where('userId', '==', user.uid)
        .get();

      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      showToast('阅读历史已清除', 'info');
      return true;
    } catch (error) {
      console.error('清除历史失败:', error);
      return false;
    }
  },

  // 格式化时间
  timeAgo(timestamp) {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return '刚刚';
    if (diff < 3600) return `${Math.floor(diff / 60)}分钟前`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}小时前`;
    if (diff < 604800) return `${Math.floor(diff / 86400)}天前`;
    return date.toLocaleDateString();
  }
};
