/* ============================================
   墨韵小说 - 评论和评分系统
   ============================================ */

const CommentSystem = {
  // 获取小说评论
  async getComments(novelId, chapterId = null) {
    try {
      let query = db.collection(COLLECTIONS.COMMENTS)
        .where('novelId', '==', novelId)
        .orderBy('createdAt', 'desc');

      if (chapterId) {
        query = query.where('chapterId', '==', chapterId);
      }

      const snapshot = await query.get();
      const comments = [];

      for (const doc of snapshot.docs) {
        const data = doc.data();
        // 获取评论者信息
        const userDoc = await db.collection(COLLECTIONS.USERS).doc(data.userId).get();
        const userData = userDoc.exists ? userDoc.data() : { penName: '匿名用户' };
        comments.push({
          id: doc.id,
          ...data,
          authorName: userData.penName,
          authorAvatar: userData.avatar
        });
      }

      return comments;
    } catch (error) {
      console.error('获取评论失败:', error);
      return [];
    }
  },

  // 发表评论
  async addComment(novelId, content, chapterId = null) {
    const user = UserManager.currentUser;
    if (!user) {
      showToast('请先登录', 'error');
      return null;
    }

    if (!content.trim()) {
      showToast('评论内容不能为空', 'error');
      return null;
    }

    try {
      const commentData = {
        novelId,
        userId: user.uid,
        content: content.trim(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      if (chapterId) {
        commentData.chapterId = chapterId;
      }

      const docRef = await db.collection(COLLECTIONS.COMMENTS).add(commentData);

      // 更新小说评论数
      await db.collection(COLLECTIONS.NOVELS).doc(novelId).update({
        commentCount: firebase.firestore.FieldValue.increment(1)
      });

      showToast('评论发表成功', 'success');
      return { id: docRef.id, ...commentData };
    } catch (error) {
      console.error('发表评论失败:', error);
      showToast('发表失败，请重试', 'error');
      return null;
    }
  },

  // 删除评论
  async deleteComment(commentId, novelId) {
    const user = UserManager.currentUser;
    if (!user) {
      showToast('请先登录', 'error');
      return false;
    }

    try {
      const commentDoc = await db.collection(COLLECTIONS.COMMENTS).doc(commentId).get();
      if (!commentDoc.exists) {
        showToast('评论不存在', 'error');
        return false;
      }

      const commentData = commentDoc.data();
      if (commentData.userId !== user.uid) {
        showToast('无权删除此评论', 'error');
        return false;
      }

      await db.collection(COLLECTIONS.COMMENTS).doc(commentId).delete();

      // 更新小说评论数
      await db.collection(COLLECTIONS.NOVELS).doc(novelId).update({
        commentCount: firebase.firestore.FieldValue.increment(-1)
      });

      showToast('评论已删除', 'info');
      return true;
    } catch (error) {
      console.error('删除评论失败:', error);
      return false;
    }
  },

  // 渲染评论区
  renderComments(container, comments, novelId, chapterId = null) {
    const user = UserManager.currentUser;

    let html = `
      <div class="comments-section">
        <h3 class="comments-title">💬 评论区 (${comments.length})</h3>
        <div class="comment-form">
          <textarea id="comment-input" placeholder="写下你的感想..." rows="3"></textarea>
          <button class="btn btn-primary" onclick="CommentSystem.submitComment('${novelId}'${chapterId ? `, '${chapterId}'` : ''})">发表评论</button>
        </div>
        <div class="comments-list">
    `;

    if (comments.length === 0) {
      html += `<div class="empty-comments">暂无评论，来发表第一条吧！</div>`;
    } else {
      comments.forEach(comment => {
        const timeAgo = this.timeAgo(comment.createdAt);
        const isOwner = user && user.uid === comment.userId;
        html += `
          <div class="comment-item">
            <div class="comment-avatar">${(comment.authorName || '匿').charAt(0)}</div>
            <div class="comment-content">
              <div class="comment-header">
                <span class="comment-author">${comment.authorName || '匿名用户'}</span>
                <span class="comment-time">${timeAgo}</span>
                ${isOwner ? `<button class="comment-delete" onclick="CommentSystem.deleteAndRefresh('${comment.id}', '${novelId}')">删除</button>` : ''}
              </div>
              <div class="comment-text">${comment.content}</div>
            </div>
          </div>
        `;
      });
    }

    html += `</div></div>`;
    container.innerHTML = html;
  },

  // 提交评论
  async submitComment(novelId, chapterId = null) {
    const input = document.getElementById('comment-input');
    const content = input.value;

    const result = await this.addComment(novelId, content, chapterId);
    if (result) {
      input.value = '';
      // 刷新评论
      const comments = await this.getComments(novelId, chapterId);
      this.renderComments(document.getElementById('comments-container'), comments, novelId, chapterId);
    }
  },

  // 删除并刷新
  async deleteAndRefresh(commentId, novelId) {
    const success = await this.deleteComment(commentId, novelId);
    if (success) {
      const comments = await this.getComments(novelId);
      this.renderComments(document.getElementById('comments-container'), comments, novelId);
    }
  },

  // 时间格式化
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

// ============================================
// 评分系统
// ============================================
const RatingSystem = {
  // 获取用户评分
  async getUserRating(novelId) {
    const user = UserManager.currentUser;
    if (!user) return 0;

    try {
      const doc = await db.collection(COLLECTIONS.RATINGS)
        .doc(`${user.uid}_${novelId}`)
        .get();
      return doc.exists ? doc.data().rating : 0;
    } catch (error) {
      return 0;
    }
  },

  // 提交评分
  async submitRating(novelId, rating) {
    const user = UserManager.currentUser;
    if (!user) {
      showToast('请先登录', 'error');
      return false;
    }

    if (rating < 1 || rating > 5) {
      showToast('评分必须在1-5之间', 'error');
      return false;
    }

    try {
      const ratingRef = db.collection(COLLECTIONS.RATINGS).doc(`${user.uid}_${novelId}`);
      const ratingDoc = await ratingRef.get();
      const novelRef = db.collection(COLLECTIONS.NOVELS).doc(novelId);

      if (ratingDoc.exists) {
        // 更新评分
        const oldRating = ratingDoc.data().rating;
        await ratingRef.update({
          rating: rating,
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // 更新小说平均评分
        const novelDoc = await novelRef.get();
        const novelData = novelDoc.data();
        const totalRating = novelData.rating * novelData.ratingCount - oldRating + rating;
        const avgRating = totalRating / novelData.ratingCount;
        await novelRef.update({ rating: avgRating });
      } else {
        // 新评分
        await ratingRef.set({
          userId: user.uid,
          novelId: novelId,
          rating: rating,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        // 更新小说评分
        const novelDoc = await novelRef.get();
        const novelData = novelDoc.data();
        const newCount = (novelData.ratingCount || 0) + 1;
        const totalRating = (novelData.rating || 0) * (novelData.ratingCount || 0) + rating;
        const avgRating = totalRating / newCount;

        await novelRef.update({
          rating: avgRating,
          ratingCount: newCount
        });
      }

      showToast(`评分成功：${rating}星`, 'success');
      return true;
    } catch (error) {
      console.error('评分失败:', error);
      showToast('评分失败，请重试', 'error');
      return false;
    }
  },

  // 渲染评分组件
  renderRating(container, novelId, currentRating = 0, avgRating = 0, ratingCount = 0) {
    const stars = [1, 2, 3, 4, 5];
    container.innerHTML = `
      <div class="rating-section">
        <div class="rating-display">
          <span class="rating-score">${avgRating ? avgRating.toFixed(1) : '暂无'}</span>
          <div class="rating-stars">
            ${stars.map(s => `<span class="star ${s <= Math.round(avgRating) ? 'filled' : ''}">★</span>`).join('')}
          </div>
          <span class="rating-count">(${ratingCount}人评分)</span>
        </div>
        <div class="rating-input">
          <span>我的评分：</span>
          <div class="rating-stars interactive" id="my-rating">
            ${stars.map(s => `
              <span class="star ${s <= currentRating ? 'filled' : ''}"
                    onclick="RatingSystem.clickRating('${novelId}', ${s})"
                    onmouseover="RatingSystem.hoverRating(${s})"
                    onmouseout="RatingSystem.resetHover(${currentRating})">★</span>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  },

  // 点击评分
  async clickRating(novelId, rating) {
    const success = await this.submitRating(novelId, rating);
    if (success) {
      // 更新显示
      const stars = document.querySelectorAll('#my-rating .star');
      stars.forEach((star, index) => {
        star.classList.toggle('filled', index < rating);
      });
      // 刷新小说数据
      const novel = await NovelDB.getById(novelId);
      if (novel) {
        this.renderRating(document.getElementById('rating-container'), novelId, rating, novel.rating, novel.ratingCount);
      }
    }
  },

  // 悬停效果
  hoverRating(rating) {
    const stars = document.querySelectorAll('#my-rating .star');
    stars.forEach((star, index) => {
      star.classList.toggle('hover', index < rating);
    });
  },

  resetHover(currentRating) {
    const stars = document.querySelectorAll('#my-rating .star');
    stars.forEach((star, index) => {
      star.classList.remove('hover');
      star.classList.toggle('filled', index < currentRating);
    });
  }
};
