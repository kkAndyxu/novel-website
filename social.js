/* ============================================
   墨韵小说 - 社交功能模块
   书友圈动态、关注系统、私信
   ============================================ */

// ============================================
// 书友圈 - 动态系统
// ============================================
const PostSystem = {
  // 发布动态
  async createPost(content, type = 'share') {
    const user = UserManager.currentUser;
    if (!user) {
      showToast('请先登录', 'error');
      return null;
    }

    if (!content.trim()) {
      showToast('动态内容不能为空', 'error');
      return null;
    }

    try {
      const postData = {
        userId: user.uid,
        authorName: UserManager.userProfile?.penName || '匿名',
        content: content.trim(),
        type: type, // share=分享, review=书评, inspiration=灵感
        likes: 0,
        commentCount: 0,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      const docRef = await db.collection('posts').add(postData);
      showToast('动态发布成功', 'success');
      return { id: docRef.id, ...postData };
    } catch (error) {
      console.error('发布动态失败:', error);
      showToast('发布失败', 'error');
      return null;
    }
  },

  // 删除动态
  async deletePost(postId) {
    const user = UserManager.currentUser;
    if (!user) return false;

    try {
      const doc = await db.collection('posts').doc(postId).get();
      if (!doc.exists) return false;

      const data = doc.data();
      if (data.userId !== user.uid) {
        showToast('无权删除此动态', 'error');
        return false;
      }

      // 同时删除该动态的所有评论
      const comments = await db.collection('postComments')
        .where('postId', '==', postId)
        .get();
      const batch = db.batch();
      comments.docs.forEach(d => batch.delete(d.ref));
      batch.delete(doc.ref);
      await batch.commit();

      showToast('动态已删除', 'info');
      return true;
    } catch (error) {
      console.error('删除动态失败:', error);
      return false;
    }
  },

  // 获取动态列表（关注的人 + 自己的动态）
  async getFeed(limit = 20) {
    try {
      // 获取所有动态，按时间排序
      const snapshot = await db.collection('posts')
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      const posts = [];
      for (const doc of snapshot.docs) {
        const data = doc.data();
        // 获取作者信息
        const userDoc = await db.collection(COLLECTIONS.USERS).doc(data.userId).get();
        const userData = userDoc.exists ? userDoc.data() : { penName: '匿名用户' };
        posts.push({
          id: doc.id,
          ...data,
          authorAvatar: userData.penName?.charAt(0) || '匿',
          authorName: userData.penName || '匿名用户'
        });
      }
      return posts;
    } catch (error) {
      console.error('获取动态失败:', error);
      return [];
    }
  },

  // 获取用户的动态
  async getUserPosts(userId, limit = 20) {
    try {
      const snapshot = await db.collection('posts')
        .where('userId', '==', userId)
        .orderBy('createdAt', 'desc')
        .limit(limit)
        .get();

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('获取用户动态失败:', error);
      return [];
    }
  },

  // 点赞动态
  async toggleLikePost(postId) {
    const user = UserManager.currentUser;
    if (!user) {
      showToast('请先登录', 'error');
      return null;
    }

    try {
      const likeRef = db.collection('postLikes').doc(`${user.uid}_${postId}`);
      const likeDoc = await likeRef.get();
      const postRef = db.collection('posts').doc(postId);

      if (likeDoc.exists) {
        await likeRef.delete();
        await postRef.update({ likes: firebase.firestore.FieldValue.increment(-1) });
        return { liked: false };
      } else {
        await likeRef.set({
          userId: user.uid,
          postId: postId,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        await postRef.update({ likes: firebase.firestore.FieldValue.increment(1) });
        return { liked: true };
      }
    } catch (error) {
      console.error('点赞失败:', error);
      return null;
    }
  },

  // 检查是否已点赞
  async checkPostLiked(postId) {
    const user = UserManager.currentUser;
    if (!user) return false;
    try {
      const doc = await db.collection('postLikes').doc(`${user.uid}_${postId}`).get();
      return doc.exists;
    } catch (error) {
      return false;
    }
  },

  // 发表评论
  async addComment(postId, content) {
    const user = UserManager.currentUser;
    if (!user) {
      showToast('请先登录', 'error');
      return null;
    }

    if (!content.trim()) {
      showToast('评论不能为空', 'error');
      return null;
    }

    try {
      const commentData = {
        postId: postId,
        userId: user.uid,
        authorName: UserManager.userProfile?.penName || '匿名',
        content: content.trim(),
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      await db.collection('postComments').add(commentData);
      await db.collection('posts').doc(postId).update({
        commentCount: firebase.firestore.FieldValue.increment(1)
      });

      showToast('评论成功', 'success');
      return commentData;
    } catch (error) {
      console.error('评论失败:', error);
      showToast('评论失败', 'error');
      return null;
    }
  },

  // 获取动态评论
  async getComments(postId) {
    try {
      const snapshot = await db.collection('postComments')
        .where('postId', '==', postId)
        .orderBy('createdAt', 'desc')
        .get();

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('获取评论失败:', error);
      return [];
    }
  },

  // 渲染动态卡片
  renderPostCard(post) {
    const typeLabels = {
      share: '📢 分享',
      review: '📝 书评',
      inspiration: '💡 灵感'
    };

    const timeAgo = this.timeAgo(post.createdAt);

    return `
      <div class="post-card" id="post-${post.id}">
        <div class="post-header">
          <div class="post-avatar">${post.authorAvatar || '?'}</div>
          <div class="post-meta">
            <span class="post-author">${post.authorName || '匿名用户'}</span>
            <span class="post-time">${timeAgo}</span>
          </div>
          <span class="post-type-tag">${typeLabels[post.type] || '📢 分享'}</span>
        </div>
        <div class="post-content">${this.formatContent(post.content)}</div>
        <div class="post-actions">
          <button class="post-action-btn" onclick="PostSystem.handleLikePost('${post.id}', this)">
            <span class="like-icon">🤍</span>
            <span class="like-count">${post.likes || 0}</span>
          </button>
          <button class="post-action-btn" onclick="PostSystem.toggleComments('${post.id}')">
            💬 ${post.commentCount || 0}
          </button>
        </div>
        <div class="post-comments" id="comments-${post.id}" style="display: none;">
          <div class="post-comment-form">
            <input type="text" placeholder="写下你的评论..." 
                   onkeypress="if(event.key==='Enter')PostSystem.submitComment('${post.id}', this)">
            <button onclick="PostSystem.submitComment('${post.id}', this.previousElementSibling)">发送</button>
          </div>
          <div class="post-comments-list" id="comments-list-${post.id}"></div>
        </div>
      </div>
    `;
  },

  // 点赞处理
  async handleLikePost(postId, btn) {
    const result = await this.toggleLikePost(postId);
    if (result) {
      const icon = btn.querySelector('.like-icon');
      const count = btn.querySelector('.like-count');
      const currentCount = parseInt(count.textContent);
      if (result.liked) {
        icon.textContent = '❤️';
        count.textContent = currentCount + 1;
      } else {
        icon.textContent = '🤍';
        count.textContent = Math.max(0, currentCount - 1);
      }
    }
  },

  // 切换评论区
  async toggleComments(postId) {
    const container = document.getElementById(`comments-${postId}`);
    const isVisible = container.style.display !== 'none';

    if (isVisible) {
      container.style.display = 'none';
    } else {
      container.style.display = 'block';
      // 加载评论
      const comments = await this.getComments(postId);
      const listEl = document.getElementById(`comments-list-${postId}`);
      if (comments.length === 0) {
        listEl.innerHTML = '<div class="empty-comments" style="padding: 16px;">暂无评论</div>';
      } else {
        listEl.innerHTML = comments.map(c => `
          <div class="post-comment-item">
            <span class="post-comment-author">${c.authorName || '匿名'}</span>
            <span class="post-comment-text">${c.content}</span>
            <span class="post-comment-time">${this.timeAgo(c.createdAt)}</span>
          </div>
        `).join('');
      }
    }
  },

  // 提交评论
  async submitComment(postId, input) {
    const content = input.value.trim();
    if (!content) return;

    const result = await this.addComment(postId, content);
    if (result) {
      input.value = '';
      // 刷新评论
      this.toggleComments(postId);
      this.toggleComments(postId);
    }
  },

  // 格式化内容（支持换行和链接）
  formatContent(content) {
    return content
      .replace(/\n/g, '<br>')
      .replace(/(https?:\/\/[^\s]+)/g, '<a href="$1" target="_blank" style="color: var(--accent);">$1</a>');
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
// 关注系统
// ============================================
const FollowSystem = {
  // 关注用户
  async follow(targetUserId) {
    const user = UserManager.currentUser;
    if (!user) {
      showToast('请先登录', 'error');
      return false;
    }

    if (user.uid === targetUserId) {
      showToast('不能关注自己', 'error');
      return false;
    }

    try {
      const followRef = db.collection('follows').doc(`${user.uid}_${targetUserId}`);
      const followDoc = await followRef.get();

      if (followDoc.exists) {
        // 取消关注
        await followRef.delete();
        await db.collection(COLLECTIONS.USERS).doc(targetUserId).update({
          followersCount: firebase.firestore.FieldValue.increment(-1)
        });
        await db.collection(COLLECTIONS.USERS).doc(user.uid).update({
          followingCount: firebase.firestore.FieldValue.increment(-1)
        });
        showToast('已取消关注', 'info');
        return false;
      } else {
        // 关注
        await followRef.set({
          followerId: user.uid,
          followingId: targetUserId,
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });
        await db.collection(COLLECTIONS.USERS).doc(targetUserId).update({
          followersCount: firebase.firestore.FieldValue.increment(1)
        });
        await db.collection(COLLECTIONS.USERS).doc(user.uid).update({
          followingCount: firebase.firestore.FieldValue.increment(1)
        });
        showToast('关注成功', 'success');
        return true;
      }
    } catch (error) {
      console.error('关注操作失败:', error);
      return false;
    }
  },

  // 检查是否已关注
  async isFollowing(targetUserId) {
    const user = UserManager.currentUser;
    if (!user) return false;

    try {
      const doc = await db.collection('follows').doc(`${user.uid}_${targetUserId}`).get();
      return doc.exists;
    } catch (error) {
      return false;
    }
  },

  // 获取关注列表
  async getFollowing(userId) {
    try {
      const snapshot = await db.collection('follows')
        .where('followerId', '==', userId)
        .get();

      const users = [];
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const userDoc = await db.collection(COLLECTIONS.USERS).doc(data.followingId).get();
        if (userDoc.exists) {
          users.push({ id: userDoc.id, ...userDoc.data() });
        }
      }
      return users;
    } catch (error) {
      console.error('获取关注列表失败:', error);
      return [];
    }
  },

  // 获取粉丝列表
  async getFollowers(userId) {
    try {
      const snapshot = await db.collection('follows')
        .where('followingId', '==', userId)
        .get();

      const users = [];
      for (const doc of snapshot.docs) {
        const data = doc.data();
        const userDoc = await db.collection(COLLECTIONS.USERS).doc(data.followerId).get();
        if (userDoc.exists) {
          users.push({ id: userDoc.id, ...userDoc.data() });
        }
      }
      return users;
    } catch (error) {
      console.error('获取粉丝列表失败:', error);
      return [];
    }
  },

  // 渲染关注按钮
  renderFollowButton(targetUserId) {
    return `<button class="btn btn-primary btn-sm" id="follow-btn-${targetUserId}" 
              onclick="FollowSystem.handleFollow('${targetUserId}')">+ 关注</button>`;
  },

  // 处理关注
  async handleFollow(targetUserId) {
    const isFollowed = await this.follow(targetUserId);
    const btn = document.getElementById(`follow-btn-${targetUserId}`);
    if (btn) {
      btn.textContent = isFollowed ? '已关注' : '+ 关注';
      btn.classList.toggle('btn-secondary', isFollowed);
      btn.classList.toggle('btn-primary', !isFollowed);
    }
  }
};

// ============================================
// 私信系统
// ============================================
const MessageSystem = {
  // 发送私信
  async sendMessage(toUserId, content) {
    const user = UserManager.currentUser;
    if (!user) {
      showToast('请先登录', 'error');
      return null;
    }

    if (!content.trim()) {
      showToast('消息不能为空', 'error');
      return null;
    }

    if (user.uid === toUserId) {
      showToast('不能给自己发消息', 'error');
      return null;
    }

    try {
      // 生成会话ID（两个用户ID按字母排序拼接，保证唯一性）
      const ids = [user.uid, toUserId].sort();
      const conversationId = ids.join('_');

      const messageData = {
        conversationId: conversationId,
        fromId: user.uid,
        fromName: UserManager.userProfile?.penName || '匿名',
        toId: toUserId,
        content: content.trim(),
        read: false,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      };

      await db.collection('messages').add(messageData);

      // 更新会话列表
      await db.collection('conversations').doc(conversationId).set({
        participants: ids,
        lastMessage: content.trim(),
        lastMessageFrom: user.uid,
        lastMessageAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
      }, { merge: true });

      return messageData;
    } catch (error) {
      console.error('发送消息失败:', error);
      showToast('发送失败', 'error');
      return null;
    }
  },

  // 获取会话列表
  async getConversations() {
    const user = UserManager.currentUser;
    if (!user) return [];

    try {
      // 获取所有包含当前用户的会话
      const snapshot = await db.collection('conversations')
        .where('participants', 'array-contains', user.uid)
        .orderBy('lastMessageAt', 'desc')
        .get();

      const conversations = [];
      for (const doc of snapshot.docs) {
        const data = doc.data();
        // 找到对方用户ID
        const otherUserId = data.participants.find(id => id !== user.uid);
        if (otherUserId) {
          const otherUser = await db.collection(COLLECTIONS.USERS).doc(otherUserId).get();
          const userData = otherUser.exists ? otherUser.data() : { penName: '匿名用户' };

          // 获取未读消息数
          const unreadSnapshot = await db.collection('messages')
            .where('conversationId', '==', doc.id)
            .where('toId', '==', user.uid)
            .where('read', '==', false)
            .get();

          conversations.push({
            id: doc.id,
            otherUserId: otherUserId,
            otherUserName: userData.penName || '匿名用户',
            otherUserAvatar: (userData.penName || '匿').charAt(0),
            lastMessage: data.lastMessage || '',
            lastMessageAt: data.lastMessageAt,
            unreadCount: unreadSnapshot.size
          });
        }
      }
      return conversations;
    } catch (error) {
      console.error('获取会话列表失败:', error);
      return [];
    }
  },

  // 获取聊天记录
  async getMessages(conversationId, limit = 50) {
    const user = UserManager.currentUser;
    if (!user) return [];

    try {
      const snapshot = await db.collection('messages')
        .where('conversationId', '==', conversationId)
        .orderBy('createdAt', 'asc')
        .limit(limit)
        .get();

      // 标记已读
      const batch = db.batch();
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.toId === user.uid && !data.read) {
          batch.update(doc.ref, { read: true });
        }
      });
      if (snapshot.size > 0) await batch.commit();

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('获取消息失败:', error);
      return [];
    }
  },

  // 获取或创建会话ID
  getConversationId(userId1, userId2) {
    return [userId1, userId2].sort().join('_');
  },

  // 渲染会话列表
  renderConversationList(conversations) {
    if (conversations.length === 0) {
      return `
        <div class="empty-state">
          <div class="empty-icon">💬</div>
          <h3>暂无会话</h3>
          <p>去关注一些书友，开始聊天吧！</p>
          <a href="community.html" class="btn btn-primary">逛逛书友圈</a>
        </div>
      `;
    }

    return conversations.map(conv => {
      const timeAgo = PostSystem.timeAgo(conv.lastMessageAt);
      return `
        <div class="conversation-item" onclick="MessageSystem.openConversation('${conv.id}', '${conv.otherUserId}', '${conv.otherUserName}')">
          <div class="conversation-avatar">${conv.otherUserAvatar}</div>
          <div class="conversation-info">
            <div class="conversation-header">
              <span class="conversation-name">${conv.otherUserName}</span>
              <span class="conversation-time">${timeAgo}</span>
            </div>
            <div class="conversation-preview">${conv.lastMessage || '...'}</div>
          </div>
          ${conv.unreadCount > 0 ? `<span class="unread-badge">${conv.unreadCount}</span>` : ''}
        </div>
      `;
    }).join('');
  },

  // 渲染聊天消息
  renderChatMessages(messages, currentUserId) {
    if (messages.length === 0) {
      return '<div class="empty-comments" style="padding: 40px;">暂无消息，发送第一条吧！</div>';
    }

    return messages.map(msg => {
      const isMine = msg.fromId === currentUserId;
      return `
        <div class="chat-message ${isMine ? 'mine' : 'other'}">
          <div class="chat-bubble">
            <div class="chat-text">${msg.content}</div>
            <div class="chat-time">${PostSystem.timeAgo(msg.createdAt)}</div>
          </div>
        </div>
      `;
    }).join('');
  },

  // 打开会话
  async openConversation(conversationId, otherUserId, otherUserName) {
    window.location.href = `chat.html?conv=${conversationId}&user=${otherUserId}&name=${encodeURIComponent(otherUserName)}`;
  }
};
