/* ============================================
   墨韵小说 - 全局交互脚本
   数据管理、页面逻辑、工具函数
   ============================================ */

// ============================================
// 数据管理
// ============================================
const NovelDB = {
  STORAGE_KEY: 'moYun_novels',

  // 默认示例数据
  defaultNovels: [
    {
      id: '1',
      title: '星辰大海',
      author: '云中鹤',
      category: '科幻',
      cover: 1,
      description: '在浩瀚的宇宙中，一位年轻的宇航员意外发现了一个通往平行世界的虫洞，从此踏上了一段惊心动魄的星际冒险之旅。',
      chapters: [
        { id: '1-1', title: '第一章 启程', content: '公元2157年，人类终于掌握了超光速航行技术。陈星站在"曙光号"飞船的舷窗前，望着那片无尽的星空，心中涌起一股难以言喻的激动。\n\n"所有系统检查完毕，准备进入超光速航道。"控制台传来AI助手小光的声音。\n\n陈星深吸一口气，按下了启动按钮。飞船周围的星光瞬间拉成了无数条光线，仿佛整个宇宙都在为他让路。\n\n然而，就在超光速航行开始后的第三分钟，警报突然响起。飞船前方出现了一个未知的能量波动——那不是恒星，不是黑洞，而是一个从未被记录过的空间异常。\n\n"检测到未知虫洞结构，建议立即改变航向。"小光的声音中带着一丝紧张。\n\n但陈星没有改变航向。作为人类最优秀的宇航员之一，他的直觉告诉他，这个虫洞可能是通往新世界的钥匙。' },
        { id: '1-2', title: '第二章 虫洞', content: '飞船穿过虫洞的瞬间，陈星感觉整个世界都在旋转。光线扭曲、时间错乱，他甚至看到了自己过去的画面在眼前闪过。\n\n不知过了多久，飞船终于稳定下来。陈星睁开眼睛，被眼前的景象惊呆了。\n\n一颗蔚蓝色的星球悬浮在太空中，比地球更加美丽。它周围环绕着三个月亮，大气层中闪烁着奇异的光芒。\n\n"这不可能……"陈星喃喃自语，"这里的物理法则似乎和我们的宇宙完全不同。"\n\n就在这时，飞船的通讯系统接收到了一段信号。那不是任何已知语言的编码，但小光却成功翻译了出来：\n\n"欢迎来到艾瑞斯星。我们等你很久了。"' },
        { id: '1-3', title: '第三章 新世界', content: '陈星驾驶飞船缓缓降落在艾瑞斯星的表面。这里的空气竟然可以呼吸，重力也和地球相差无几。\n\n走出飞船的那一刻，他被这里的美景震撼了。天空是淡紫色的，植物散发着柔和的荧光，远处可以看到巨大的水晶建筑群。\n\n"你终于来了。"一个温和的声音从身后传来。\n\n陈星转身，看到了一个身形修长、皮肤微微发光的生物。它的眼睛像两颗蓝宝石，闪烁着智慧的光芒。\n\n"我叫艾拉，是艾瑞斯星的守护者之一。"那个生物微笑着说，"我们的文明已经存在了三万年，但我们一直在等待一个来自另一个宇宙的访客。因为只有你，才能帮助我们解决一个困扰了千年的危机。"' }
      ],
      views: 12580,
      likes: 892,
      createdAt: '2026-03-15',
      updatedAt: '2026-05-10'
    },
    {
      id: '2',
      title: '长安月下',
      author: '墨染青衫',
      category: '古风',
      cover: 2,
      description: '大唐盛世，一位才华横溢的女诗人以男装身份踏入朝堂，在权谋与诗意的交织中，书写了一段传奇人生。',
      chapters: [
        { id: '2-1', title: '第一章 入京', content: '长安城的春天总是来得格外早。三月的风裹挟着花香，吹过朱雀大街，吹过太极宫的琉璃瓦，也吹进了苏晚意的心里。\n\n她穿着一身青色男装，头戴幞头，腰悬玉佩，站在城门口望着那巍峨的城墙，心中百感交集。\n\n"从今天起，我就是苏文清了。"她在心里默默对自己说。\n\n苏晚意出身江南书香门第，自幼聪慧过人，诗词歌赋无一不精。然而在这个女子无才便是德的年代，她的才华反而成了负担。父亲被奸臣陷害入狱后，她决定以孪生哥哥苏文清的身份进京赶考，一方面为父亲洗清冤屈，另一方面实现自己的抱负。\n\n"这位公子，请出示路引。"城门守卫拦住了她。\n\n苏晚意从容地递上路引和文牒，脸上没有一丝慌乱。三年的准备，就为了这一刻。' },
        { id: '2-2', title: '第二章 考场', content: '贡院里弥漫着墨香和紧张的气氛。数千名学子坐在各自的考棚中，等待着考试开始。\n\n苏晚意深吸一口气，展开试卷。今年的诗题是"月下长安"——这恰好是她最擅长的题材。\n\n她提起笔，略一思索，便洋洋洒洒地写了起来：\n\n"长安月色千年好，照尽繁华照尽愁。朱雀街前人似海，谁家玉笛暗飞声。"\n\n写完这首诗，她又继续作策论。关于边防、民生、吏治的见解，字字珠玑，条理清晰。\n\n然而她不知道的是，在贡院最高处的阁楼里，当朝宰相李德裕正通过暗格观察着考场。他的目光落在了苏晚意的考棚上，微微皱起了眉头。\n\n"这个苏文清……"他喃喃道，"字迹虽然刻意模仿男子，但笔锋之间有一股说不出的灵秀之气。"' },
        { id: '2-3', title: '第三章 金榜', content: '放榜那天，长安城万人空巷。苏晚意挤在人群中，紧张地寻找着自己的名字。\n\n"状元——苏文清！"\n\n当这个名字从礼部官员口中念出的那一刻，整个朱雀大街都沸腾了。苏晚意感觉自己的心跳几乎停止了。\n\n她做到了。一个女子，在大唐的科举中夺得了状元。\n\n然而喜悦之下，她也感到了深深的忧虑。越高的位置意味着越大的风险，她必须更加小心地隐藏自己的身份。\n\n"苏公子，恭喜高中！"一个爽朗的声音从身后传来。\n\n苏晚意回头，看到一个身穿白衣的年轻男子正对她拱手行礼。他面如冠玉，眉目间带着一股英气，嘴角挂着温和的微笑。\n\n"在下裴行俭，久仰苏公子大名。"那人笑道，"不知可否赏脸，同去曲江池饮一杯庆功酒？"' }
      ],
      views: 8930,
      likes: 756,
      createdAt: '2026-02-20',
      updatedAt: '2026-05-08'
    },
    {
      id: '3',
      title: '代码人生',
      author: '程序猿小王',
      category: '都市',
      cover: 3,
      description: '一个普通程序员在互联网大厂的奋斗历程，从菜鸟到技术总监，有欢笑有泪水，有爱情有友情。',
      chapters: [
        { id: '3-1', title: '第一章 入职', content: '七月的北京热得像蒸笼。王小明拖着一个行李箱，站在望京SOHO的楼下，仰头望着这座气势恢宏的建筑。\n\n"从今天起，我就是一名正式的互联网人了。"他在心里给自己打气。\n\n王小明是某985高校计算机系应届毕业生，经过三轮面试，终于拿到了这家知名互联网公司的offer。虽然只是初级开发工程师，但对于一个来自小城镇的普通家庭的孩子来说，这已经是了不起的成就。\n\n"你就是新来的王小明？"一个戴着黑框眼镜的女生走过来，手里拿着一台MacBook，"我是你的导师，张薇。跟我来吧。"\n\n王小明跟着张薇走进办公区，立刻被眼前的景象震住了：开放式办公区里坐满了人，每个人面前都摆着双显示器，键盘声此起彼伏，空气中弥漫着咖啡的味道。\n\n"这是你的工位。"张薇指了指角落里的一张桌子，"先配置开发环境，有问题随时问我。对了，今天下午三点有个新人培训，别迟到。"' },
        { id: '3-2', title: '第一章 第一次上线', content: '入职两个月后，王小明迎来了职业生涯中的第一次正式上线。\n\n"这次的需求很简单，就是给用户中心加一个头像上传功能。"项目经理在晨会上说，"小王，这个任务交给你了。"\n\n王小明信心满满地接下了任务。然而他很快发现，"简单"只是表象。图片压缩、裁剪、格式转换、CDN上传、回显优化……每一个环节都有无数的坑等着他。\n\n连续加班三天后，代码终于写完了。代码审查时，导师张薇看了他的代码，沉默了良久。\n\n"小王，你知道这段代码有什么问题吗？"\n\n王小明紧张地摇了摇头。\n\n"功能上没问题，但你的代码没有考虑并发上传的情况。如果一千个用户同时上传头像，你的服务器会直接崩溃。"\n\n那天晚上，王小明在工位上坐到了凌晨两点，重新设计了一套基于消息队列的异步上传方案。' }
      ],
      views: 6720,
      likes: 534,
      createdAt: '2026-04-01',
      updatedAt: '2026-05-11'
    },
    {
      id: '4',
      title: '末世觉醒',
      author: '暗夜行者',
      category: '玄幻',
      cover: 4,
      description: '一场突如其来的异变让世界陷入了末世，普通大学生林辰意外觉醒了隐藏血脉，踏上了拯救世界的道路。',
      chapters: [
        { id: '4-1', title: '第一章 异变', content: '那天本来是一个再普通不过的星期三。林辰像往常一样坐在大学图书馆里复习期末考试，窗外阳光明媚，一切看起来都很平静。\n\n然后天空变红了。\n\n不是夕阳的那种红，而是一种诡异的、像鲜血一样的深红色。所有人都停下了手中的事情，抬头望向窗外。\n\n紧接着，地面开始剧烈震动。书架上的书纷纷掉落，天花板上的灯管碎裂，尖叫声此起彼伏。\n\n林辰本能地躲到了桌子下面。透过窗户，他看到了令人毛骨悚然的一幕：校园里的树木正在疯狂生长，以肉眼可见的速度长到了几十米高，枝条像触手一样四处挥舞。\n\n更可怕的是，一些同学的身体开始发生变异。他们的皮肤变成了灰色，眼睛变成了红色，嘴里发出了野兽般的嘶吼。\n\n"这是……末世？"林辰的心沉到了谷底。\n\n就在这时，他的右手手背上突然亮起了一个金色的符文。一股温暖的力量从符文中涌出，流遍全身。' },
        { id: '4-2', title: '第二章 觉醒', content: '金色符文的出现给了林辰一种奇异的力量。他感觉自己的五感变得异常敏锐，甚至能听到远处细微的脚步声。\n\n"嗷——"一只变异的同学朝他扑来，速度极快。\n\n林辰的身体在意识反应之前就已经行动了。他侧身一闪，右手不自觉地挥出，一道金色的光芒从他掌心射出，直接将那只变异体击飞了出去。\n\n"什么……"林辰看着自己的手，难以置信。\n\n图书馆里一片混乱，到处都是尖叫声和打斗声。但林辰注意到，有几个人和他一样，身上也出现了不同颜色的符文。\n\n一个红发女生浑身燃烧着火焰，将靠近的变异体一一焚烧；一个高大的男生身上覆盖着岩石般的铠甲，用拳头砸碎了地面上的裂缝。\n\n"觉醒者……"林辰喃喃道。他不知道这个名词是从哪里冒出来的，但他确信，自己已经不再是普通人了。' }
      ],
      views: 15200,
      likes: 1023,
      createdAt: '2026-01-10',
      updatedAt: '2026-05-09'
    },
    {
      id: '5',
      title: '甜蜜陷阱',
      author: '糖果屋',
      category: '言情',
      cover: 5,
      description: '甜品店老板娘和冷酷律师的甜蜜爱情故事，一碗糖水引发的缘分，两颗心在甜蜜中慢慢靠近。',
      chapters: [
        { id: '5-1', title: '第一章 糖水', content: '夏日的午后，阳光透过梧桐树叶洒在青石板路上，斑驳陆离。\n\n苏念念的"念念不忘"甜品店就开在这条老街的拐角处。店面不大，只有五张桌子，但每天都会排起长队。\n\n"老板娘，来一碗杨枝甘露！"一个熟悉的声音响起。\n\n苏念念抬头，看到了那个已经连续来了一个星期的男人。他穿着一身黑色西装，打着领带，看起来和这条充满烟火气的老街格格不入。\n\n"顾律师，今天还是老样子？"苏念念笑着问。\n\n顾深言点了点头，在角落的老位置坐下。他习惯性地打开笔记本电脑，一边处理文件，一边等他的糖水。\n\n没有人知道，这位在法庭上以冷酷无情著称的金牌律师，每天下班后都会来到这家小小的甜品店，点一碗杨枝甘露，然后坐到打烊。\n\n而更没有人知道，他来这里的原因，不是因为糖水有多好喝。' },
        { id: '5-2', title: '第二章 心事', content: '"顾律师，今天试试新品吧，桂花酒酿圆子。"苏念念端着一碗热气腾腾的甜品走过来。\n\n顾深言抬起头，目光在她脸上停留了一秒，然后接过碗。\n\n"谢谢。"\n\n苏念念在他对面坐下，双手托腮看着他吃。这是她最近养成的习惯——反正店里没什么客人，她喜欢在顾深言对面坐着，有一搭没一搭地聊天。\n\n"顾律师，你为什么每天都来吃甜品啊？你不怕胖吗？"\n\n"不怕。"\n\n"那你为什么总是一个人？你女朋友不陪你吗？"\n\n顾深言的手顿了一下，然后平静地说："没有女朋友。"\n\n"啊？不可能吧！"苏念念瞪大了眼睛，"你长得这么帅，又是大律师，怎么会没有女朋友？"\n\n顾深言放下勺子，认真地看着她："因为我在等一个人。"\n\n苏念念的心突然跳了一下。她不知道为什么，但那个眼神让她有些慌乱。' }
      ],
      views: 11340,
      likes: 967,
      createdAt: '2026-03-28',
      updatedAt: '2026-05-11'
    },
    {
      id: '6',
      title: '深渊探秘',
      author: '探险家老周',
      category: '悬疑',
      cover: 6,
      description: '一支考古队在西南深山中发现了一座远古遗迹，随着探索的深入，他们发现这里隐藏着一个惊天秘密。',
      chapters: [
        { id: '6-1', title: '第一章 遗迹', content: '云南边境的原始森林深处，一支由七人组成的考古队正在艰难地前行。\n\n队长周远拿着一张泛黄的地图，对照着手中的GPS设备，确认着方向。\n\n"根据古籍记载，这里应该有一座距今至少五千年的地下遗迹。"周远对身后的队员们说，"如果找到它，将改写整个华夏文明的起源。"\n\n考古队的地质学家李薇突然停下了脚步："周队，你看这个。"\n\n在一片茂密的灌木丛后面，露出了一块巨大的石板。石板上刻着密密麻麻的符号，既不是甲骨文，也不是任何已知的古文字。\n\n周远蹲下来仔细辨认，脸色渐渐变了。\n\n"这些符号……和三星堆出土的金杖上的符号有相似之处，但更加复杂。这可能是某种……密码。"\n\n就在这时，队伍里最年轻的队员小陈突然惊叫起来。他指着石板旁边的地面，声音颤抖地说："周队，这里……这里有一个洞。"\n\n众人围过去一看，只见灌木丛下方有一个直径约两米的圆形洞口，深不见底，从里面吹出一股冰冷的气息。' },
        { id: '6-2', title: '第二章 下潜', content: '经过两天的准备，考古队决定进入洞穴。\n\n周远第一个下降。随着深度增加，洞壁上的符号越来越多，越来越密集。头灯照射下，那些符号似乎在微微发光。\n\n"这些不是雕刻上去的。"李薇用仪器检测后说，"这些符号是天然形成的——不，准确地说，是某种未知的矿物结晶。它们在吸收光线后会产生微弱的荧光。"\n\n下降到大约五十米深的时候，洞穴突然变得开阔起来。周远的脚踩到了平坦的地面，他环顾四周，被眼前的景象惊呆了。\n\n这是一个巨大的地下空间，面积至少有一个足球场那么大。空间的中央矗立着一座由黑色水晶构成的方尖碑，高度超过二十米。方尖碑的表面刻满了和洞壁上一样的符号，但更加精细。\n\n"天哪……"队员们陆续到达地面，看到这一幕都发出了惊叹。\n\n但周远的注意力被另一样东西吸引了。在方尖碑的底部，他看到了一具骸骨。骸骨的姿态很奇怪——它坐在地上，双手捧着一个发光的球体。' }
      ],
      views: 9870,
      likes: 812,
      createdAt: '2026-02-14',
      updatedAt: '2026-05-07'
    }
  ],

  // 初始化数据
  init() {
    if (!localStorage.getItem(this.STORAGE_KEY)) {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.defaultNovels));
    }
  },

  // 获取所有小说
  getAll() {
    this.init();
    return JSON.parse(localStorage.getItem(this.STORAGE_KEY));
  },

  // 根据ID获取小说
  getById(id) {
    const novels = this.getAll();
    return novels.find(n => n.id === id);
  },

  // 保存所有小说
  saveAll(novels) {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(novels));
  },

  // 添加小说
  add(novel) {
    const novels = this.getAll();
    novel.id = Date.now().toString();
    novel.createdAt = new Date().toISOString().split('T')[0];
    novel.updatedAt = novel.createdAt;
    novel.views = 0;
    novel.likes = 0;
    novel.cover = Math.floor(Math.random() * 8) + 1;
    novels.unshift(novel);
    this.saveAll(novels);
    return novel;
  },

  // 更新小说
  update(id, data) {
    const novels = this.getAll();
    const index = novels.findIndex(n => n.id === id);
    if (index !== -1) {
      novels[index] = { ...novels[index], ...data, updatedAt: new Date().toISOString().split('T')[0] };
      this.saveAll(novels);
      return novels[index];
    }
    return null;
  },

  // 删除小说
  delete(id) {
    let novels = this.getAll();
    novels = novels.filter(n => n.id !== id);
    this.saveAll(novels);
  },

  // 增加阅读量
  addView(id) {
    const novels = this.getAll();
    const novel = novels.find(n => n.id === id);
    if (novel) {
      novel.views++;
      this.saveAll(novels);
    }
  },

  // 点赞
  toggleLike(id) {
    const novels = this.getAll();
    const novel = novels.find(n => n.id === id);
    if (novel) {
      const likedKey = `liked_${id}`;
      const isLiked = localStorage.getItem(likedKey) === 'true';
      if (isLiked) {
        novel.likes--;
        localStorage.setItem(likedKey, 'false');
      } else {
        novel.likes++;
        localStorage.setItem(likedKey, 'true');
      }
      this.saveAll(novels);
      return { likes: novel.likes, isLiked: !isLiked };
    }
    return null;
  },

  // 搜索小说
  search(keyword) {
    const novels = this.getAll();
    if (!keyword) return novels;
    const kw = keyword.toLowerCase();
    return novels.filter(n =>
      n.title.toLowerCase().includes(kw) ||
      n.author.toLowerCase().includes(kw) ||
      n.description.toLowerCase().includes(kw)
    );
  },

  // 按分类筛选
  filterByCategory(category) {
    const novels = this.getAll();
    if (!category || category === '全部') return novels;
    return novels.filter(n => n.category === category);
  },

  // 获取所有分类
  getCategories() {
    const novels = this.getAll();
    const categories = [...new Set(novels.map(n => n.category))];
    return ['全部', ...categories];
  },

  // 获取推荐小说（按阅读量和点赞排序）
  getFeatured(count = 4) {
    const novels = this.getAll();
    return novels.sort((a, b) => (b.views + b.likes) - (a.views + a.likes)).slice(0, count);
  },

  // 获取最新小说
  getLatest(count = 6) {
    const novels = this.getAll();
    return novels.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)).slice(0, count);
  }
};

// ============================================
// 工具函数
// ============================================

// Toast 提示
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

// 格式化数字
function formatNumber(num) {
  if (num >= 10000) {
    return (num / 10000).toFixed(1) + '万';
  }
  return num.toString();
}

// 生成小说卡片HTML
function createNovelCard(novel) {
  return `
    <div class="novel-card" onclick="window.location.href='reader.html?id=${novel.id}'">
      <div class="novel-cover cover-gradient-${novel.cover}">
        <span class="cover-text">${novel.title}</span>
        <span class="cover-tag">${novel.category}</span>
      </div>
      <div class="novel-info">
        <div class="novel-title">${novel.title}</div>
        <div class="novel-author">✍️ ${novel.author}</div>
        <div class="novel-desc">${novel.description}</div>
        <div class="novel-meta">
          <span>📖 ${novel.chapters ? novel.chapters.length : 0} 章</span>
          <span>👁️ ${formatNumber(novel.views)}</span>
          <span>❤️ ${formatNumber(novel.likes)}</span>
        </div>
      </div>
    </div>
  `;
}

// 获取URL参数
function getQueryParam(name) {
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

// ============================================
// 导航栏逻辑
// ============================================
function initNavbar() {
  // 移动端菜单
  const menuBtn = document.querySelector('.nav-menu-btn');
  const navLinks = document.querySelector('.nav-links');
  if (menuBtn && navLinks) {
    menuBtn.addEventListener('click', () => {
      navLinks.classList.toggle('open');
    });
  }

  // 搜索功能
  const searchInput = document.querySelector('.nav-search input');
  const searchBtn = document.querySelector('.nav-search .search-icon');
  if (searchInput) {
    const doSearch = () => {
      const keyword = searchInput.value.trim();
      if (keyword) {
        window.location.href = `novels.html?search=${encodeURIComponent(keyword)}`;
      }
    };
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') doSearch();
    });
    if (searchBtn) searchBtn.addEventListener('click', doSearch);
  }

  // 高亮当前页面
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage) {
      link.classList.add('active');
    }
  });
}

// 页面加载完成后初始化导航
document.addEventListener('DOMContentLoaded', initNavbar);
