/* ============================================================
   私密空间 v4.0 · 逻辑脚本
   ============================================================ */
(function(){
  'use strict';

  /* ============================================================
     一、常量与硬编码概率（UI 不暴露，用户不可改）
     ============================================================ */
  const PROB = Object.freeze({
    READ_NO_REPLY: 0.50,
    LETTER: 0.65,
    LETTER_COOLDOWN_MS: 30 * 60 * 1000,
    MOMENT_LIKE: 0.50,
    MOMENT_COMMENT: 0.50,
    MOMENT_VISIBLE: 1.00,
    MOMENT_CONFLICT: 1.00,
    VISITOR_LOG: 1.00,
    CALL_INCOMING: 0.10,
    CALL_ANSWER: 0.80,
    STATUS_SWITCH_MS: 90 * 1000
  });

  const STORAGE_KEY = 'private-space-v4';
  const SCHEMA_VERSION = 4;

  const THEMES_PRESET = {
    'light': { bubbleMe: '#95ec69', bubbleMeText: '#191919', bubbleTa: '#ffffff', bubbleTaText: '#191919', chatBg: '#ededed' },
    'dark':  { bubbleMe: '#5b7fff', bubbleMeText: '#ffffff', bubbleTa: '#26262f', bubbleTaText: '#e8e8f0', chatBg: '#0f0f14' },
    'mint':  { bubbleMe: '#6bcf9e', bubbleMeText: '#14321f', bubbleTa: '#ffffff', bubbleTaText: '#1a3a2a', chatBg: '#e8f5ee' },
    'sky':   { bubbleMe: '#6cb8f0', bubbleMeText: '#0d2233', bubbleTa: '#ffffff', bubbleTaText: '#1a2e3d', chatBg: '#e6f2fb' },
    'sakura':{ bubbleMe: '#f8a8c8', bubbleMeText: '#4d1a2f', bubbleTa: '#ffffff', bubbleTaText: '#3d1a2a', chatBg: '#fcecf3' }
  };

  const DEFAULT_AVATARS = [
    '🌙','🐰','🐱','🐶','🦊','🐻','🐼','🐨',
    '🦁','🐯','🦄','🐸','🌸','⭐','🍀','💫',
    '🐧','🐦','🦋','🌺','🎈','🍎','🌈','🔥'
  ];

  const EMOJIS = [
    '😀','😃','😄','😁','😆','😅','🤣','😂','🙂','🙃',
    '😉','😊','😇','🥰','😍','🤩','😘','😗','😚','😙',
    '😋','😛','😜','🤪','😝','🤑','🤗','🤭','🤫','🤔',
    '🤐','🤨','😐','😑','😶','😏','😒','🙄','😬','🤥',
    '😌','😔','😪','🤤','😴','😷','🤒','🤕','🤢','🤮',
    '🥺','😢','😭','😤','😠','😡','🤬','😈','👿','💀',
    '❤️','🧡','💛','💚','💙','💜','🖤','🤍','💔','💕',
    '💖','💗','💘','💝','💞','💓','💟','❣️','💌','🌹',
    '🌸','🌺','🌻','🌼','🌷','🍀','🌿','🍃','⭐','✨',
    '🌙','☀️','⛅','🌈','🔥','💧','❄️','🎈','🎉','🎊',
    '👍','👎','👌','✌️','🤞','🤟','🤘','👏','🙌','🙏',
    '💪','👋','🤚','✋','🖐️','👆','👇','👈','👉','☝️'
  ];

  const TAROT_CARDS = [
    {name:'愚者', meaning:'新的开始，冒险与自由'},
    {name:'魔术师', meaning:'创造力，行动力，掌握主动'},
    {name:'女祭司', meaning:'直觉，潜意识，内在智慧'},
    {name:'女皇', meaning:'丰盛，滋养，母性能量'},
    {name:'皇帝', meaning:'秩序，权威，稳定的结构'},
    {name:'教皇', meaning:'传统，指引，精神导师'},
    {name:'恋人', meaning:'结合，选择，价值观一致'},
    {name:'战车', meaning:'意志力，胜利，前进'},
    {name:'力量', meaning:'内在力量，勇气，温柔征服'},
    {name:'隐者', meaning:'内省，独处，寻求真理'},
    {name:'命运之轮', meaning:'转机，循环，时机成熟'},
    {name:'正义', meaning:'公正，平衡，因果'},
    {name:'倒吊人', meaning:'换位思考，牺牲，等待'},
    {name:'死神', meaning:'结束与重生，蜕变'},
    {name:'节制', meaning:'调和，耐心，中庸之道'},
    {name:'恶魔', meaning:'欲望，束缚，阴影面'},
    {name:'塔', meaning:'剧变，崩塌，突破'},
    {name:'星星', meaning:'希望，疗愈，指引'},
    {name:'月亮', meaning:'幻象，潜意识，不确定'},
    {name:'太阳', meaning:'成功，喜悦，生命力'},
    {name:'审判', meaning:'觉醒，召唤，重生'},
    {name:'世界', meaning:'完成，圆满，整合'}
  ];

  const LENORMAND_CARDS = [
    {name:'骑士', meaning:'消息传来，行动开始'},
    {name:'幸运草', meaning:'小幸运，短暂的好运'},
    {name:'船', meaning:'远行，探索，旅程'},
    {name:'房子', meaning:'家庭，安全感，根基'},
    {name:'树', meaning:'成长，健康，长久'},
    {name:'云', meaning:'困惑，不确定，迷雾'},
    {name:'蛇', meaning:'曲折，诱惑，绕路'},
    {name:'棺材', meaning:'结束，转折，休息'},
    {name:'花束', meaning:'惊喜，礼物，美好'},
    {name:'镰刀', meaning:'突然，果断，切断'},
    {name:'鞭子', meaning:'冲突，争吵，重复'},
    {name:'鸟', meaning:'交流，消息，沟通'},
    {name:'小孩', meaning:'纯真，新开始，简单'},
    {name:'狐狸', meaning:'聪明，机敏，欺骗'},
    {name:'熊', meaning:'力量，保护，权威'},
    {name:'星星', meaning:'希望，指引，理想'},
    {name:'鹳', meaning:'变化，迁移，转变'},
    {name:'狗', meaning:'忠诚，友谊，信任'},
    {name:'塔', meaning:'权威，孤立，官方'},
    {name:'花园', meaning:'社交，公众，开放'},
    {name:'山', meaning:'阻碍，挑战，延迟'},
    {name:'十字路口', meaning:'选择，分岔，决定'},
    {name:'老鼠', meaning:'消耗，焦虑，损失'},
    {name:'心', meaning:'爱，情感，真心'},
    {name:'戒指', meaning:'承诺，契约，循环'},
    {name:'书', meaning:'秘密，知识，学习'},
    {name:'信', meaning:'文字，通知，消息'},
    {name:'男人', meaning:'男性，行动，主动'},
    {name:'女人', meaning:'女性，感受，接纳'},
    {name:'百合', meaning:'纯净，成熟，和平'},
    {name:'太阳', meaning:'成功，光明，活力'},
    {name:'月亮', meaning:'情感，直觉，认可'},
    {name:'钥匙', meaning:'关键，答案，解决'},
    {name:'鱼', meaning:'财富，流动，丰盛'},
    {name:'锚', meaning:'稳定，坚持，停泊'},
    {name:'十字架', meaning:'考验，信仰，承担'}
  ];

  const BUBBLE_COLORS = [
    '#95ec69', '#6cb8f0', '#f8a8c8', '#f5c26b',
    '#a8e6cf', '#d5a6ff', '#ff9b9b', '#ffffff',
    '#e8e8f0', '#7a6cff', '#ff6c9e', '#4d4d4d'
  ];

  const WALLPAPER_PRESETS = [
    'linear-gradient(135deg, #7a6cff, #ff6c9e)',
    'linear-gradient(135deg, #6cb8f0, #4dc9c9)',
    'linear-gradient(135deg, #f8a8c8, #ffcf7a)',
    'linear-gradient(135deg, #a8e6cf, #6bcf9e)',
    'linear-gradient(135deg, #d5a6ff, #7a6cff)',
    'linear-gradient(135deg, #ffd3a5, #fd6585)',
    'linear-gradient(180deg, #ededed, #d4d4d4)',
    'linear-gradient(180deg, #0f0f14, #26262f)'
  ];

  const PAPER_TEMPLATES = [
    { id: 'paper-1', name: '暖黄信笺', class: 'paper-1' },
    { id: 'paper-2', name: '樱花粉', class: 'paper-2' },
    { id: 'paper-3', name: '天空蓝', class: 'paper-3' },
    { id: 'paper-4', name: '薄荷绿', class: 'paper-4' },
    { id: 'paper-5', name: '紫罗兰', class: 'paper-5' },
    { id: 'paper-6', name: '纯白稿纸', class: 'paper-6' }
  ];

  const STATUS_LABELS = { online: '在线', away: '离开', busy: '忙碌' };
  const STATUS_COLORS = { online: 'online', away: 'away', busy: 'busy' };
  const STATUS_SPEED = { online: 1.0, away: 1.8, busy: 2.5 };

  /* ============================================================
     二、工具函数
     ============================================================ */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const uid = () => (window.crypto && crypto.randomUUID)
    ? crypto.randomUUID()
    : 'id-' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const clone = o => JSON.parse(JSON.stringify(o));
  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const rand = (a, b) => Math.floor(Math.random() * (b - a + 1)) + a;
  const pad2 = n => String(n).padStart(2, '0');
  const nowTime = () => Date.now();

  function fmtTime(ts){
    const d = new Date(ts);
    const n = new Date();
    const hm = pad2(d.getHours()) + ':' + pad2(d.getMinutes());
    if (d.toDateString() === n.toDateString()) return hm;
    const y = new Date(n); y.setDate(y.getDate() - 1);
    if (d.toDateString() === y.toDateString()) return '昨天 ' + hm;
    if (d.getFullYear() === n.getFullYear())
      return (d.getMonth()+1) + '月' + d.getDate() + '日 ' + hm;
    return d.getFullYear() + '/' + (d.getMonth()+1) + '/' + d.getDate() + ' ' + hm;
  }
  function fmtFull(ts){
    const d = new Date(ts);
    return d.getFullYear() + '-' + pad2(d.getMonth()+1) + '-' + pad2(d.getDate())
      + ' ' + pad2(d.getHours()) + ':' + pad2(d.getMinutes()) + ':' + pad2(d.getSeconds());
  }
  function isPlainEmoji(s){
    return typeof s === 'string' && s.length > 0 && s.length <= 8 && !s.startsWith('data:');
  }
  function isValidImageDataUrl(s){
    if (typeof s !== 'string') return false;
    if (s.length < 40 || s.length > 2000000) return false;
    return /^data:image\/[a-z0-9.+-]+;base64,[A-Za-z0-9+/=]+$/i.test(s);
  }
  function isNightTime(){
    const h = new Date().getHours();
    return h >= 22 || h < 6;
  }

  let toastTimer = null;
  function toast(msg){
    const el = $('#toast');
    if (!el) return;
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => el.classList.remove('show'), 2200);
  }

  /* ============================================================
     三、状态
     ============================================================ */
  const DEFAULTS = {
    version: SCHEMA_VERSION,
    me: { name: '我', avatar: '🌙' },
    ta: { name: 'TA', avatar: '🐰' },
    groups: [],
    activeChatId: 'ta',
    sessions: { ta: { messages: [], lastReadAt: 0, unread: 0 } },
    cards: [],
    moments: [],
    momentVisitors: [],
    calls: [],
    period: { dates: [] },
    divination: [],
    favorites: [],
    music: [],
    musicGroups: [{ id: 'default', name: '默认歌单' }],
    questions: [],
    water: { dates: {} },
    wishes: [],
    orders: [],
    ledger: [],
    checkins: {},
    balance: 520,
    diary: [],
    countdowns: [],
    letters: [],
    archivedLetters: [],
    characters: [{
      id: 'ta', name: 'TA', avatar: '🐰', birthday: '',
      personality: ['温柔','幽默'], likes: [], dislikes: [], notes: '',
      status: 'online', lastStatusSwitch: 0, affection: 0, lastLetterAt: 0
    }],
    settings: {
      theme: 'light', globalTheme: 'light',
      avatarShape: '50%', avatarSize: 40,
      fontSize: 15, fontWeight: 400, fontFamily: 'system',
      bubbleRadius: 16, bubblePad: 12,
      bubbleMeColor: '', bubbleTaColor: '',
      chatBgImage: null, chatBgOpacity: 0.7,
      momentCover: null, momentsVisible: true,
      splashImage: null, wallpaper: null,
      sounds: { msgOn: true, letterOn: true, callOn: true, bgmOn: false, msg: null, letter: null, call: null, bgm: null }
    },
    meta: { createdAt: nowTime(), lastSavedAt: null }
  };

  function mergeDeep(base, over){
    if (Array.isArray(base)) return Array.isArray(over) ? over : base;
    if (base && typeof base === 'object') {
      if (!over || typeof over !== 'object') return base;
      const out = { ...base };
      for (const k in over) out[k] = (k in base) ? mergeDeep(base[k], over[k]) : over[k];
      return out;
    }
    return over === undefined ? base : over;
  }

  let storageOK = true;
  try {
    localStorage.setItem('__ps_test__', '1');
    localStorage.removeItem('__ps_test__');
  } catch (e) {
    storageOK = false;
    const b = $('#sandboxHint');
    if (b) b.classList.add('show');
  }

  let state = loadState();
  let lastSerialized = JSON.stringify(state);

  function loadState(){
    if (!storageOK) return clone(DEFAULTS);
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return clone(DEFAULTS);
      const parsed = mergeDeep(clone(DEFAULTS), JSON.parse(raw));
      if (!parsed.sessions) parsed.sessions = clone(DEFAULTS.sessions);
      if (!parsed.sessions.ta) parsed.sessions.ta = clone(DEFAULTS.sessions.ta);
      if (!Array.isArray(parsed.moments)) parsed.moments = [];
      if (!Array.isArray(parsed.wishes)) parsed.wishes = [];
      if (!Array.isArray(parsed.orders)) parsed.orders = [];
      if (!Array.isArray(parsed.ledger)) parsed.ledger = [];
      if (!Array.isArray(parsed.diary)) parsed.diary = [];
      if (!Array.isArray(parsed.countdowns)) parsed.countdowns = [];
      if (!Array.isArray(parsed.letters)) parsed.letters = [];
      if (!Array.isArray(parsed.archivedLetters)) parsed.archivedLetters = [];
      if (!Array.isArray(parsed.characters)) parsed.characters = clone(DEFAULTS.characters);
      if (typeof parsed.balance !== 'number') parsed.balance = 520;
      if (!parsed.checkins) parsed.checkins = {};
      if (!parsed.settings.sounds) parsed.settings.sounds = clone(DEFAULTS.settings.sounds);
      return parsed;
    } catch (e) {
      return clone(DEFAULTS);
    }
  }

  let saveTimer = null;
  let isFlushing = false;

  function saveState(immediate){
    if (!storageOK) return;
    clearTimeout(saveTimer);
    if (immediate) flushState();
    else saveTimer = setTimeout(flushState, 100);
  }
  function flushState(){
    if (!storageOK || isFlushing) return;
    isFlushing = true;
    try {
      state.version = SCHEMA_VERSION;
      state.meta.lastSavedAt = nowTime();
      const serialized = JSON.stringify(state);
      if (serialized === lastSerialized) { isFlushing = false; return; }
      localStorage.setItem(STORAGE_KEY, serialized);
      lastSerialized = serialized;
    } catch (e) {
      console.error('[store] 保存失败', e);
      toast('保存失败：' + (e && e.message ? e.message : '未知错误'));
    } finally {
      isFlushing = false;
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') flushState();
  });
  window.addEventListener('pagehide', flushState);
  window.addEventListener('beforeunload', flushState);

  /* ============================================================
     四、音效
     ============================================================ */
  let bgmAudio = null;

  function playSound(type){
    const s = state.settings.sounds;
    if (!s) return null;
    if (type === 'msg' && !s.msgOn) return null;
    if (type === 'letter' && !s.letterOn) return null;
    if (type === 'call' && !s.callOn) return null;
    if (type === 'bgm' && !s.bgmOn) return null;
    const data = s[type];
    if (!data) return null;
    try {
      const audio = new Audio(data);
      audio.volume = type === 'bgm' ? 0.4 : 0.7;
      if (type === 'bgm') audio.loop = true;
      audio.play().catch(() => {});
      return audio;
    } catch (e) { return null; }
  }
  function startBgm(){ stopBgm(); bgmAudio = playSound('bgm'); }
  function stopBgm(){
    if (bgmAudio) {
      try { bgmAudio.pause(); bgmAudio.currentTime = 0; } catch (e) {}
      bgmAudio = null;
    }
  }

  /* ============================================================
     五、视图路由
     ============================================================ */
  const VIEWS = [
    'viewHome', 'viewChat', 'viewMoments', 'viewWishes', 'viewSettings',
    'viewPeriod', 'viewDivination', 'viewFavorites', 'viewMusic',
    'viewQuestions', 'viewWater', 'viewLetters', 'viewCalls',
    'viewDiary', 'viewCountdown', 'viewStats', 'viewCharacters',
    'viewWallpapers', 'viewSounds'
  ];

  function showView(id){
    VIEWS.forEach(v => {
      const el = $('#' + v);
      if (el) el.classList.toggle('active', v === id);
    });
    const tabMap = {
      viewHome: 'home', viewMoments: 'moments',
      viewWishes: 'wishes', viewSettings: 'settings'
    };
    const activeTab = tabMap[id];
    if (activeTab){
      $$('.tab-item').forEach(t => {
        t.classList.toggle('active', t.dataset.tab === activeTab);
      });
    }
  }

  /* ============================================================
     六、主题与设置应用
     ============================================================ */
  function applyGlobalTheme(theme){
    document.documentElement.dataset.theme = theme;
    const preset = THEMES_PRESET[theme] || THEMES_PRESET.light;
    if (!state.settings.bubbleMeColor) {
      document.documentElement.style.setProperty('--bubble-me', preset.bubbleMe);
    }
    if (!state.settings.bubbleTaColor) {
      document.documentElement.style.setProperty('--bubble-ta', preset.bubbleTa);
    }
    if (theme === 'dark') document.documentElement.style.setProperty('--chat-bg', '#0f0f14');
    else if (theme === 'macaron') document.documentElement.style.setProperty('--chat-bg', '#fcecf3');
    else document.documentElement.style.setProperty('--chat-bg', '#ededed');
  }

  function applySettings(){
    const s = state.settings;
    const root = document.documentElement.style;
    applyGlobalTheme(s.globalTheme || 'light');
    root.setProperty('--avatar-size', (s.avatarSize || 40) + 'px');
    root.setProperty('--avatar-radius', s.avatarShape || '50%');
    root.setProperty('--avatar-header-size', Math.max(32, Math.round((s.avatarSize || 40) * 0.9)) + 'px');
    root.setProperty('--msg-font-size', (s.fontSize || 15) + 'px');
    root.setProperty('--msg-font-weight', String(s.fontWeight || 400));
    if (s.fontFamily === 'serif') {
      root.setProperty('--msg-font-family', 'Georgia, "Songti SC", "SimSun", serif');
    } else if (s.fontFamily === 'mono') {
      root.setProperty('--msg-font-family', 'ui-monospace, "SF Mono", Menlo, Consolas, monospace');
    } else {
      root.setProperty('--msg-font-family', '-apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Segoe UI", sans-serif');
    }
    root.setProperty('--bubble-radius', (s.bubbleRadius || 16) + 'px');
    root.setProperty('--bubble-pad-x', (s.bubblePad || 12) + 'px');
    if (s.bubbleMeColor) root.setProperty('--bubble-me', s.bubbleMeColor);
    if (s.bubbleTaColor) root.setProperty('--bubble-ta', s.bubbleTaColor);
    applyChatBackground();
  }

  function applyChatBackground(){
    const layer = $('#chatBgLayer');
    if (!layer) return;
    layer.innerHTML = '';
    layer.style.background = '';
    const s = state.settings;
    if (isValidImageDataUrl(s.chatBgImage)) {
      const img = document.createElement('img');
      img.alt = '';
      img.src = s.chatBgImage;
      img.style.opacity = String(s.chatBgOpacity || 0.7);
      img.onerror = () => {
        layer.innerHTML = '';
        state.settings.chatBgImage = null;
        saveState();
      };
      layer.appendChild(img);
    } else if (s.wallpaper) {
      layer.style.background = s.wallpaper;
      layer.style.backgroundSize = 'cover';
    }
  }

  /* ============================================================
     七、头像
     ============================================================ */
  function setAvatarInto(el, avatarValue, fallback){
    if (!el) return;
    el.innerHTML = '';
    if (isValidImageDataUrl(avatarValue)) {
      const img = document.createElement('img');
      img.src = avatarValue;
      img.alt = '';
      img.draggable = false;
      img.onerror = () => { el.innerHTML = ''; el.textContent = fallback; };
      el.appendChild(img);
    } else if (isPlainEmoji(avatarValue)) {
      el.textContent = avatarValue;
    } else {
      el.textContent = fallback;
    }
  }

  /* ============================================================
     八、会话管理
     ============================================================ */
  function getCurrentSession(){
    if (state.activeChatId === 'ta') return state.sessions.ta;
    return state.sessions[state.activeChatId];
  }
  function getCurrentCharacter(){
    if (state.activeChatId === 'ta') return state.characters[0];
    return state.characters.find(c => c.id === state.activeChatId) || state.characters[0];
  }
  function getPeerInfo(){
    if (state.activeChatId === 'ta') {
      const c = state.characters[0];
      return { name: c.name || 'TA', avatar: c.avatar || '🐰', isGroup: false, characterId: 'ta', status: c.status || 'online' };
    }
    const g = state.groups.find(x => x.id === state.activeChatId);
    if (g) return { name: g.name, avatar: g.avatar || '👥', isGroup: true };
    return { name: 'TA', avatar: '🐰', isGroup: false, characterId: 'ta' };
  }

  function renderSessionList(){
    const list = $('#sessionList');
    if (!list) return;
    const frag = document.createDocumentFragment();

    const taSession = state.sessions.ta;
    const c = state.characters[0];
    const lastMsg = taSession.messages[taSession.messages.length - 1];
    const item = document.createElement('div');
    item.className = 'list-item';
    item.dataset.sessionId = 'ta';
    item.innerHTML = `
      <div class="avatar" data-avatar-slot="ta"></div>
      <div class="info">
        <div class="title">
          <span class="status-dot ${STATUS_COLORS[c.status] || 'online'}"></span>${c.name || 'TA'}
        </div>
        <div class="subtitle"></div>
      </div>
      <div class="tail"></div>
    `;
    setAvatarInto(item.querySelector('[data-avatar-slot="ta"]'), c.avatar, '🐰');
    item.querySelector('.subtitle').textContent = lastMsg
      ? (lastMsg.role === 'ta' && lastMsg.letter ? '💌 ' + lastMsg.text : lastMsg.text)
      : '开始聊天吧';
    item.querySelector('.tail').innerHTML = lastMsg
      ? `<div>${fmtTime(lastMsg.ts)}</div>${taSession.unread > 0 ? `<div class="unread-dot">${taSession.unread}</div>` : ''}`
      : '';
    frag.appendChild(item);

    for (const g of state.groups) {
      const sess = state.sessions[g.id];
      const last = sess && sess.messages[sess.messages.length - 1];
      const gItem = document.createElement('div');
      gItem.className = 'list-item';
      gItem.dataset.sessionId = g.id;
      gItem.innerHTML = `
        <div class="avatar" data-avatar-slot="g">${g.avatar || '👥'}</div>
        <div class="info">
          <div class="title">${g.name}</div>
          <div class="subtitle">${last ? last.text : '新群聊'}</div>
        </div>
        <div class="tail">${last ? fmtTime(last.ts) : ''}</div>
      `;
      frag.appendChild(gItem);
    }

    list.replaceChildren(frag);
    list.querySelectorAll('.list-item').forEach(el => {
      el.addEventListener('click', () => {
        const sid = el.dataset.sessionId;
        state.activeChatId = sid;
        if (sid === 'ta') state.sessions.ta.unread = 0;
        else if (state.sessions[sid]) state.sessions[sid].unread = 0;
        saveState();
        renderSessionList();
        openChatView();
      });
    });
  }

  /* ============================================================
     九、聊天视图
     ============================================================ */
  let isTyping = false;
  let replyToken = 0;

  function openChatView(){
    const peer = getPeerInfo();
    setAvatarInto($('#chatPeerAvatar'), peer.avatar, '🐰');
    $('#chatPeerName').textContent = peer.name;
    if (!peer.isGroup) {
      const c = getCurrentCharacter();
      const status = STATUS_LABELS[c.status] || '在线';
      $('#chatPeerSub').innerHTML = `<span class="status-dot ${STATUS_COLORS[c.status] || 'online'}"></span>${status}`;
    } else {
      $('#chatPeerSub').textContent = '群聊';
    }
    showView('viewChat');
    renderMessages();
    applyChatBackground();
    scrollChatToBottom();
    setTimeout(() => { $('#chatInput').focus(); }, 120);
  }

  function scrollChatToBottom(){
    const el = $('#chatScroll');
    if (!el) return;
    requestAnimationFrame(() => { el.scrollTop = el.scrollHeight; });
  }

  function makeMsgAvatarEl(role){
    const wrap = document.createElement('div');
    wrap.className = 'avatar';
    if (role === 'me') {
      setAvatarInto(wrap, state.me.avatar, '🌙');
    } else {
      const c = getCurrentCharacter();
      setAvatarInto(wrap, c.avatar, '🐰');
    }
    return wrap;
  }

  function makeMessageEl(m){
    const wrap = document.createElement('div');
    wrap.className = 'msg ' + (m.role === 'me' ? 'me' : 'ta');
    const isMe = m.role === 'me';
    const peer = getPeerInfo();

    const avatar = makeMsgAvatarEl(m.role);
    const body = document.createElement('div');
    body.className = 'msg-body';

    const nameEl = document.createElement('div');
    nameEl.className = 'msg-name';
    if (isMe) nameEl.textContent = state.me.name || '我';
    else nameEl.textContent = peer.name;

    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    if (m.letter) bubble.classList.add('letter');
    if (m.voicemail) bubble.classList.add('voicemail');
    bubble.textContent = m.text;

    const copyBtn = document.createElement('button');
    copyBtn.className = 'copy-btn';
    copyBtn.type = 'button';
    copyBtn.textContent = '📋';
    copyBtn.addEventListener('click', (e) => { e.stopPropagation(); copyToClipboard(m.text); });
    bubble.appendChild(copyBtn);

    const meta = document.createElement('div');
    meta.className = 'msg-meta';
    const timeEl = document.createElement('span');
    timeEl.textContent = fmtTime(m.ts);
    meta.appendChild(timeEl);
    if (isMe) {
      const statusEl = document.createElement('span');
      statusEl.className = 'msg-status ' + (m.read ? 'read' : 'unread');
      statusEl.textContent = m.read ? '已读' : '未读';
      meta.appendChild(statusEl);
    }

    body.append(nameEl, bubble, meta);
    wrap.append(avatar, body);
    return wrap;
  }

  function makeTypingEl(){
    const peer = getPeerInfo();
    const wrap = document.createElement('div');
    wrap.className = 'msg ta';
    const avatar = makeMsgAvatarEl('ta');
    const body = document.createElement('div');
    body.className = 'msg-body';
    const nameEl = document.createElement('div');
    nameEl.className = 'msg-name';
    nameEl.textContent = peer.name;
    const bubble = document.createElement('div');
    bubble.className = 'bubble typing';
    bubble.innerHTML = '<span></span><span></span><span></span>';
    body.append(nameEl, bubble);
    wrap.append(avatar, body);
    return wrap;
  }

  function renderMessages(){
    const sess = getCurrentSession();
    const el = $('#messages');
    if (!sess || !el) return;
    const frag = document.createDocumentFragment();
    for (const m of sess.messages) frag.appendChild(makeMessageEl(m));
    if (isTyping) frag.appendChild(makeTypingEl());
    el.replaceChildren(frag);
    scrollChatToBottom();
  }

  function copyToClipboard(text){
    const ok = () => toast('已复制');
    const fail = () => toast('复制失败');
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(ok).catch(() => { fallbackCopy(text) ? ok() : fail(); });
    } else {
      fallbackCopy(text) ? ok() : fail();
    }
  }
  function fallbackCopy(text){
    try {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.left = '-9999px';
      document.body.appendChild(ta);
      ta.select();
      ta.setSelectionRange(0, ta.value.length);
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch (e) { return false; }
  }

  /* ============================================================
     十、字卡系统
     ============================================================ */
  function parseCard(text){
    const card = { text: text, weight: 1, time: null, mood: null };
    const parts = text.split('|').map(s => s.trim());
    if (parts.length > 1) {
      card.text = parts[0];
      const params = parts.slice(1).join(',');
      params.split(',').forEach(p => {
        const [k, v] = p.split(':').map(s => s.trim());
        if (k === 'w') card.weight = Math.max(0.1, parseFloat(v) || 1);
        else if (k === 'time') card.time = v;
        else if (k === 'mood') card.mood = v;
      });
    }
    return card;
  }

  function moodLevel(){
    const c = getCurrentCharacter();
    const aff = c.affection || 0;
    if (aff >= 60) return 'high';
    if (aff >= 20) return 'mid';
    return 'low';
  }

  function pickCard(){
    const isNight = isNightTime();
    const mood = moodLevel();
    const pool = [];
    for (const raw of state.cards) {
      const c = parseCard(raw.text);
      if (c.time === 'day' && isNight) continue;
      if (c.time === 'night' && !isNight) continue;
      if (c.mood && c.mood !== mood) continue;
      pool.push({ ...c, raw });
    }
    if (!pool.length) {
      for (const raw of state.cards) pool.push({ ...parseCard(raw.text), raw });
    }
    if (!pool.length) return null;
    const total = pool.reduce((s, c) => s + (c.weight || 1), 0);
    let r = Math.random() * total;
    for (const c of pool) {
      r -= c.weight || 1;
      if (r <= 0) return c;
    }
    return pool[pool.length - 1];
  }

  function addCard(text){
    const parsed = parseCard(text);
    state.cards.push({
      id: uid(), text: parsed.text, rawText: text,
      weight: parsed.weight, time: parsed.time, mood: parsed.mood,
      used: 0, createdAt: nowTime()
    });
  }

  /* ============================================================
     十一、发送与自动回复
     ============================================================ */
  function sendMessage(){
    const input = $('#chatInput');
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    autoResize(input);
    updateSendState();

    const sess = getCurrentSession();
    const msg = { id: uid(), role: 'me', text, ts: nowTime(), read: false };
    sess.messages.push(msg);
    saveState(true);
    renderMessages();
    renderSessionList();
    addAffection(1);
    scheduleReply();
  }

  async function scheduleReply(){
    const token = ++replyToken;
    const c = getCurrentCharacter();
    const statusSpeed = STATUS_SPEED[c.status] || 1.0;
    const affection = c.affection || 0;
    const readNoReplyProb = PROB.READ_NO_REPLY * (affection >= 60 ? 0.4 : affection >= 20 ? 0.7 : 1);

    if (Math.random() < readNoReplyProb) {
      const sess = getCurrentSession();
      sess.messages.forEach(m => { if (m.role === 'me') m.read = true; });
      saveState();
      renderMessages();
      return;
    }

    const card = pickCard();
    if (!card) { await sleep(600); return; }

    await sleep(rand(500, 1200) * statusSpeed);
    if (token !== replyToken) return;

    isTyping = true;
    renderMessages();
    const duration = rand(700, 1500) * statusSpeed + Math.min(card.text.length * 25, 1100);
    await sleep(duration);
    if (token !== replyToken) { isTyping = false; renderMessages(); return; }
    isTyping = false;

    const sess = getCurrentSession();
    sess.messages.forEach(m => { if (m.role === 'me') m.read = true; });

    const reply = { id: uid(), role: 'ta', text: card.text, ts: nowTime(), cardId: card.raw && card.raw.id };
    sess.messages.push(reply);
    addAffection(2);
    saveState(true);
    renderMessages();
    renderSessionList();
    playSound('msg');

    if (c.likes && c.likes.length) {
      for (const like of c.likes) if (card.text.includes(like)) { addAffection(3); break; }
    }
    if (c.dislikes && c.dislikes.length) {
      for (const dislike of c.dislikes) if (card.text.includes(dislike)) { addAffection(-2); break; }
    }

    if (Math.random() < PROB.LETTER && canSendLetter()) {
      setTimeout(() => { if (token !== replyToken) return; scheduleLetter(); }, rand(3000, 8000));
    }
  }

  function canSendLetter(){
    const c = getCurrentCharacter();
    return (nowTime() - (c.lastLetterAt || 0)) >= PROB.LETTER_COOLDOWN_MS;
  }

  async function scheduleLetter(){
    const card = pickCard();
    if (!card) return;
    const c = getCurrentCharacter();
    const letter = {
      id: uid(), role: 'ta', text: card.text, ts: nowTime(),
      cardId: card.raw && card.raw.id, letter: true,
      paper: PAPER_TEMPLATES[Math.floor(Math.random() * PAPER_TEMPLATES.length)].id
    };
    const sess = getCurrentSession();
    sess.messages.push(letter);
    c.lastLetterAt = nowTime();
    saveState(true);
    renderMessages();
    renderSessionList();
    playSound('letter');
    toast('💌 TA 给你写了一封信');
    addAffection(3);
  }

  /* ============================================================
     十二、好感度
     ============================================================ */
  function addAffection(delta){
    const c = getCurrentCharacter();
    if (!c) return;
    c.affection = Math.max(0, Math.min(100, (c.affection || 0) + delta));
    saveState();
  }

  /* ============================================================
     十三、输入
     ============================================================ */
  function autoResize(el){
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = Math.min(el.scrollHeight, 110) + 'px';
  }
  function updateSendState(){
    const v = $('#chatInput').value.trim();
    $('#btnSend').disabled = !v;
  }
  function initEmojiPanel(){
    const grid = $('#emojiGrid');
    const frag = document.createDocumentFragment();
    for (const e of EMOJIS) {
      const btn = document.createElement('button');
      btn.className = 'emoji-item';
      btn.type = 'button';
      btn.textContent = e;
      btn.addEventListener('click', () => insertEmoji(e));
      frag.appendChild(btn);
    }
    grid.replaceChildren(frag);
  }
  function insertEmoji(e){
    const input = $('#chatInput');
    const start = input.selectionStart != null ? input.selectionStart : input.value.length;
    const end = input.selectionEnd != null ? input.selectionEnd : input.value.length;
    const before = input.value.slice(0, start);
    const after = input.value.slice(end);
    input.value = before + e + after;
    const np = start + e.length;
    try { input.setSelectionRange(np, np); } catch (err) {}
    input.focus();
    autoResize(input);
    updateSendState();
  }

  /* ============================================================
     十四、通话系统
     ============================================================ */
  let callState = {
    active: false, startAt: 0, timer: null,
    incomingTimer: null, incomingCountdown: 0,
    current: null, direction: 'out', answered: false
  };

  function openDialer(){
    const peer = getPeerInfo();
    setAvatarInto($('#dialerAvatar'), peer.avatar, '🐰');
    $('#dialerName').textContent = peer.name;
    $('#dialerStatus').textContent = '准备呼叫…';
    $('#dialerModal').classList.add('show');
  }
  function closeDialer(){ $('#dialerModal').classList.remove('show'); }

  function startCall(direction){
    const peer = getPeerInfo();
    callState.active = true;
    callState.startAt = nowTime();
    callState.current = peer;
    callState.direction = direction || 'out';
    callState.answered = true;

    setAvatarInto($('#callFloatAvatar'), peer.avatar, '🐰');
    $('#callFloatName').textContent = peer.name;
    $('#callFloatTime').textContent = '00:00';
    closeDialer();
    $('#incomingModal').classList.remove('show');
    $('#callFloat').classList.add('show');

    if (state.settings.sounds.bgmOn) startBgm();

    callState.timer = setInterval(() => {
      const dur = Math.floor((nowTime() - callState.startAt) / 1000);
      const mm = pad2(Math.floor(dur / 60));
      const ss = pad2(dur % 60);
      $('#callFloatTime').textContent = mm + ':' + ss;
    }, 500);
  }

  function endCall(wasAnswered){
    if (!callState.active) {
      $('#callFloat').classList.remove('show');
      return;
    }
    callState.active = false;
    clearInterval(callState.timer);
    callState.timer = null;
    stopBgm();

    const dur = Math.floor((nowTime() - callState.startAt) / 1000);
    const peer = callState.current || getPeerInfo();

    state.calls.unshift({
      id: uid(), peerName: peer.name, peerAvatar: peer.avatar,
      duration: dur, direction: callState.direction,
      answered: wasAnswered !== false && callState.answered, ts: callState.startAt
    });
    if (state.calls.length > 200) state.calls.length = 200;
    saveState();

    if (dur > 3 && callState.answered) {
      toast('通话结束 · 时长 ' + Math.floor(dur/60) + '分' + (dur%60) + '秒');
      addAffection(5);
    }
    $('#callFloat').classList.remove('show');
  }

  function triggerIncomingCall(){
    if (callState.active) return;
    if ($('#incomingModal').classList.contains('show')) return;

    const peer = getPeerInfo();
    setAvatarInto($('#incomingAvatar'), peer.avatar, '🐰');
    $('#incomingName').textContent = peer.name;
    $('#incomingCount').textContent = '15';
    callState.incomingCountdown = 15;
    callState.current = peer;

    $('#incomingModal').classList.add('show');
    playSound('call');

    callState.incomingTimer = setInterval(() => {
      callState.incomingCountdown--;
      $('#incomingCount').textContent = String(callState.incomingCountdown);
      if (callState.incomingCountdown <= 0) rejectIncomingCall(true);
    }, 1000);
  }

  function acceptIncomingCall(){
    clearInterval(callState.incomingTimer);
    callState.incomingTimer = null;
    callState.answered = true;
    $('#incomingModal').classList.remove('show');
    startCall('in');
  }

  async function rejectIncomingCall(isTimeout){
    if (callState.incomingTimer) {
      clearInterval(callState.incomingTimer);
      callState.incomingTimer = null;
    }
    $('#incomingModal').classList.remove('show');

    const peer = callState.current || getPeerInfo();
    state.calls.unshift({
      id: uid(), peerName: peer.name, peerAvatar: peer.avatar,
      duration: 0, direction: 'in', answered: false, ts: nowTime()
    });
    if (state.calls.length > 200) state.calls.length = 200;

    if (isTimeout) {
      const card = pickCard();
      const vmText = card ? card.text : '刚才想找你聊聊，方便回我一下吗？';
      const sess = getCurrentSession();
      sess.messages.push({ id: uid(), role: 'ta', text: vmText, ts: nowTime(), voicemail: true });
      toast('📞 TA 给你留了一条语音留言');
      renderMessages();
      renderSessionList();
      addAffection(1);
    } else {
      toast('已拒绝来电');
    }
    saveState();
  }

  /* ============================================================
     十五、朋友圈
     ============================================================ */
  function renderMoments(){
    const cover = $('#momentCoverImg');
    if (state.settings.momentCover) {
      cover.src = state.settings.momentCover;
    } else {
      cover.src = 'data:image/svg+xml;utf8,' + encodeURIComponent(
        '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#7a6cff"/><stop offset="100%" stop-color="#ff6c9e"/></linearGradient></defs><rect width="800" height="400" fill="url(#g)"/></svg>'
      );
    }
    setAvatarInto($('#momentMeAvatar'), state.me.avatar, '🌙');
    $('#momentMeName').textContent = state.me.name || '我';

    const list = $('#momentList');
    const frag = document.createDocumentFragment();
    if (!state.moments.length) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.innerHTML = '<div class="empty-icon">🌍</div><div>还没有动态，点击右上角 + 发布</div>';
      frag.appendChild(empty);
    } else {
      const sorted = [...state.moments].sort((a, b) => b.ts - a.ts);
      for (const m of sorted) frag.appendChild(makeMomentCard(m));
    }
    list.replaceChildren(frag);
  }

  function makeMomentCard(m){
    const card = document.createElement('div');
    card.className = 'moment-card';

    const authorIsTa = m.fromTa;
    const authorName = authorIsTa ? (state.ta.name || 'TA') : (state.me.name || '我');
    const authorAvatar = authorIsTa ? state.ta.avatar : state.me.avatar;

    const head = document.createElement('div');
    head.className = 'moment-head';
    const av = document.createElement('div');
    av.className = 'avatar';
    setAvatarInto(av, authorAvatar, '🐰');
    const author = document.createElement('div');
    author.className = 'author';
    author.innerHTML = `<div class="author-name">${authorName}</div><div class="time">${fmtTime(m.ts)}</div>`;
    head.append(av, author);
    card.appendChild(head);

    if (m.text) {
      const content = document.createElement('div');
      content.className = 'moment-content';
      content.textContent = m.text;
      card.appendChild(content);
    }

    if (m.likes && m.likes.length) {
      const likesEl = document.createElement('div');
      likesEl.className = 'moment-likes';
      likesEl.innerHTML = '❤️ ' + m.likes.map(l => l.name).join('、') + ' 觉得很赞';
      card.appendChild(likesEl);
    }

    if (m.comments && m.comments.length) {
      const commentsEl = document.createElement('div');
      commentsEl.className = 'moment-comments';
      for (const c of m.comments) {
        const line = document.createElement('div');
        line.className = 'comment-line';
        const cls = c.authorType === 'ta' ? 'ta' : c.authorType === 'other' ? 'other' : '';
        line.innerHTML = `<span class="comment-author ${cls}">${c.author}</span>${c.text}`;
        commentsEl.appendChild(line);
      }
      card.appendChild(commentsEl);
    }

    const actions = document.createElement('div');
    actions.className = 'moment-actions';

    const likeBtn = document.createElement('div');
    likeBtn.className = 'moment-action' + (m.likedByMe ? ' liked' : '');
    likeBtn.textContent = (m.likedByMe ? '❤️ 已赞' : '🤍 赞');
    likeBtn.addEventListener('click', () => toggleMomentLike(m.id));
    actions.appendChild(likeBtn);

    const commentBtn = document.createElement('div');
    commentBtn.className = 'moment-action';
    commentBtn.textContent = '💬 评论';
    commentBtn.addEventListener('click', () => promptMomentComment(m.id));
    actions.appendChild(commentBtn);

    const deleteBtn = document.createElement('div');
    deleteBtn.className = 'moment-action';
    deleteBtn.textContent = '🗑️';
    deleteBtn.addEventListener('click', () => {
      showConfirm('删除动态', '确定删除这条动态吗？', () => {
        state.moments = state.moments.filter(x => x.id !== m.id);
        saveState(true);
        renderMoments();
      });
    });
    actions.appendChild(deleteBtn);

    card.appendChild(actions);
    return card;
  }

  function toggleMomentLike(momentId){
    const m = state.moments.find(x => x.id === momentId);
    if (!m) return;
    if (!m.likes) m.likes = [];
    if (m.likedByMe) {
      m.likes = m.likes.filter(l => l.by !== 'me');
      m.likedByMe = false;
    } else {
      m.likes.push({ by: 'me', name: state.me.name || '我' });
      m.likedByMe = true;
      triggerMomentInteraction(momentId);
    }
    saveState(true);
    renderMoments();
  }

  function promptMomentComment(momentId){
    showForm('添加评论', [
      { key: 'text', label: '评论内容', type: 'textarea', placeholder: '说点什么…' }
    ], (data) => {
      const m = state.moments.find(x => x.id === momentId);
      if (!m || !data.text) return;
      if (!m.comments) m.comments = [];
      m.comments.push({
        id: uid(), author: state.me.name || '我',
        authorType: 'me', text: data.text, ts: nowTime()
      });
      saveState(true);
      renderMoments();
    });
  }

  function triggerMomentInteraction(momentId){
    if (!state.settings.momentsVisible) return;
    const m = state.moments.find(x => x.id === momentId);
    if (!m) return;

    state.momentVisitors.unshift({
      id: uid(), name: state.ta.name || 'TA',
      avatar: state.ta.avatar, ts: nowTime()
    });
    if (state.momentVisitors.length > 100) state.momentVisitors.length = 100;

    if (Math.random() < PROB.MOMENT_LIKE) {
      if (!m.likes) m.likes = [];
      m.likes.push({ by: 'ta', name: state.ta.name || 'TA' });
      addAffection(1);
    }
    if (Math.random() < PROB.MOMENT_COMMENT) {
      const card = pickCard();
      if (card) {
        if (!m.comments) m.comments = [];
        m.comments.push({
          id: uid(), author: state.ta.name || 'TA',
          authorType: 'ta', text: card.text, ts: nowTime()
        });
        addAffection(2);
      }
    }
    saveState(true);
    renderMoments();
  }

  function publishMoment(data){
    const m = {
      id: uid(), text: data.text || '', images: data.images || [],
      likes: [], comments: [], likedByMe: false, ts: nowTime()
    };
    state.moments.unshift(m);
    saveState(true);
    renderMoments();
    toast('已发布');
  }

  /* ============================================================
     十六、许愿商城
     ============================================================ */
  function renderWishes(){
    $('#balanceValue').textContent = state.balance;
    const list = $('#wishList');
    const frag = document.createDocumentFragment();
    if (!state.wishes.length) {
      const empty = document.createElement('div');
      empty.className = 'empty';
      empty.innerHTML = '<div class="empty-icon">🎁</div><div>还没有愿望，点击右上角 + 添加</div>';
      frag.appendChild(empty);
    } else {
      for (const w of state.wishes) {
        const item = document.createElement('div');
        item.className = 'wish-item';
        item.innerHTML = `
          <div class="wish-icon">${w.icon || '🎁'}</div>
          <div class="wish-info">
            <div class="wish-name">${w.name}</div>
            <div class="wish-price">价格：${w.price} 心愿币</div>
          </div>
          <button class="wish-buy">兑换</button>
          <button class="wish-del">✕</button>
        `;
        const buyBtn = item.querySelector('.wish-buy');
        if (state.balance < w.price) {
          buyBtn.disabled = true;
          buyBtn.textContent = '不足';
        }
        buyBtn.addEventListener('click', () => {
          if (state.balance < w.price) return;
          showConfirm('兑换愿望', `确定花费 ${w.price} 心愿币兑换「${w.name}」吗？`, () => {
            state.balance -= w.price;
            state.orders.unshift({
              id: uid(), wishId: w.id, wishName: w.name,
              price: w.price, status: 'pending', createdAt: nowTime()
            });
            state.ledger.unshift({
              id: uid(), amount: -w.price, type: 'wish',
              desc: '兑换愿望：' + w.name, ts: nowTime(), balance: state.balance
            });
            saveState(true);
            renderWishes();
            toast('兑换成功');
          });
        });
        item.querySelector('.wish-del').addEventListener('click', () => {
          showConfirm('删除愿望', '确定删除这个愿望吗？', () => {
            state.wishes = state.wishes.filter(x => x.id !== w.id);
            saveState(true);
            renderWishes();
          });
        });
        frag.appendChild(item);
      }
    }
    list.replaceChildren(frag);
  }

  function dailyCheckin(){
    const today = new Date().toISOString().slice(0, 10);
    if (state.checkins[today]) { toast('今天已签到'); return; }
    const reward = 10 + Math.floor(Math.random() * 21);
    state.checkins[today] = reward;
    state.balance += reward;
    state.ledger.unshift({
      id: uid(), amount: reward, type: 'checkin',
      desc: '每日签到', ts: nowTime(), balance: state.balance
    });
    saveState(true);
    renderWishes();
    toast(`签到成功 +${reward} 心愿币`);
  }

  /* ============================================================
     十七、经期
     ============================================================ */
  function renderPeriod(){
    const now = new Date();
    const y = now.getFullYear(), m = now.getMonth();
    const firstDay = new Date(y, m, 1).getDay();
    const days = new Date(y, m + 1, 0).getDate();
    const cal = $('#periodCalendar');
    const frag = document.createDocumentFragment();
    ['日','一','二','三','四','五','六'].forEach(w => {
      const c = document.createElement('div');
      c.textContent = w;
      c.style.cssText = 'text-align:center; font-size:11px; color:var(--text-muted); padding:6px 0;';
      frag.appendChild(c);
    });
    for (let i = 0; i < firstDay; i++) frag.appendChild(document.createElement('div'));
    const periodSet = new Set(state.period.dates || []);
    const todayStr = y + '-' + pad2(m+1) + '-' + pad2(now.getDate());
    for (let d = 1; d <= days; d++) {
      const c = document.createElement('div');
      const dateStr = y + '-' + pad2(m+1) + '-' + pad2(d);
      c.textContent = d;
      c.style.cssText = 'aspect-ratio:1; display:grid; place-items:center; font-size:13px; border-radius:8px;';
      if (periodSet.has(dateStr)) c.style.cssText += 'background:#ffd4e0; color:#c9224e; font-weight:600;';
      if (dateStr === todayStr) c.style.cssText += 'outline:2px solid var(--primary); outline-offset:-2px;';
      frag.appendChild(c);
    }
    cal.replaceChildren(frag);

    const list = $('#periodList');
    const dates = (state.period.dates || []).slice().sort().reverse();
    if (!dates.length) {
      list.innerHTML = '<div class="empty" style="padding:20px 0;">还没有记录</div>';
    } else {
      list.innerHTML = dates.slice(0, 12).map(d => `
        <div style="padding:8px 0; border-bottom:1px solid var(--border); font-size:13.5px; display:flex; justify-content:space-between;">
          <span>${d}</span>
          <button class="btn btn-ghost btn-sm" data-del-date="${d}" style="padding:2px 8px; min-height:26px;">删除</button>
        </div>
      `).join('');
      list.querySelectorAll('[data-del-date]').forEach(btn => {
        btn.addEventListener('click', () => {
          state.period.dates = state.period.dates.filter(x => x !== btn.dataset.delDate);
          saveState(true);
          renderPeriod();
        });
      });
    }
  }

  /* ============================================================
     十八、占卜
     ============================================================ */
  function drawDivination(type){
    const pool = type === 'tarot' ? TAROT_CARDS : LENORMAND_CARDS;
    const card = pool[Math.floor(Math.random() * pool.length)];
    state.divination.unshift({ id: uid(), type, name: card.name, meaning: card.meaning, ts: nowTime() });
    if (state.divination.length > 50) state.divination.length = 50;
    saveState(true);
    $('#divinationResult').innerHTML = `
      <div style="text-align:center; padding:14px; background:var(--card-2); border-radius:12px;">
        <div style="font-size:32px; margin-bottom:8px;">${type === 'tarot' ? '🃏' : '🔮'}</div>
        <div style="font-size:17px; font-weight:600; margin-bottom:6px;">${card.name}</div>
        <div style="font-size:13px; color:var(--text-muted); line-height:1.6;">${card.meaning}</div>
      </div>
    `;
    renderDivinationHistory();
  }

  function renderDivinationHistory(){
    const list = $('#divinationHistory');
    if (!list) return;
    if (!state.divination.length) {
      list.innerHTML = '<div class="empty" style="padding:20px 0;">还没有占卜记录</div>';
      return;
    }
    list.innerHTML = state.divination.slice(0, 10).map(d => `
      <div style="padding:8px 0; border-bottom:1px solid var(--border); font-size:13.5px;">
        <div style="display:flex; justify-content:space-between;">
          <span style="font-weight:500;">${d.name}</span>
          <span style="color:var(--text-muted); font-size:11.5px;">${fmtTime(d.ts)}</span>
        </div>
        <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">${d.meaning}</div>
      </div>
    `).join('');
  }

  /* ============================================================
     十九、收藏
     ============================================================ */
  let favSelectionMode = false;
  let favSelected = new Set();

  function renderFavorites(){
    const list = $('#favList');
    if (!state.favorites.length) {
      list.innerHTML = '<div class="empty"><div class="empty-icon">⭐</div><div>还没有收藏</div></div>';
      return;
    }
    list.innerHTML = state.favorites.map(f => `
      <div class="heart-item" data-fav-id="${f.id}" style="background:var(--card); border-radius:12px; padding:12px; margin-bottom:10px; display:flex; gap:10px; align-items:flex-start; box-shadow:var(--shadow-sm);">
        <div style="font-size:22px;">${favSelectionMode ? (favSelected.has(f.id) ? '✅' : '⬜') : '⭐'}</div>
        <div style="flex:1; min-width:0;">
          <div style="font-size:14.5px; font-weight:500; margin-bottom:4px;">${f.title}</div>
          <div style="font-size:12.5px; color:var(--text-muted); line-height:1.55;">${f.desc || ''}</div>
        </div>
      </div>
    `).join('');
    list.querySelectorAll('[data-fav-id]').forEach(el => {
      el.addEventListener('click', () => {
        const id = el.dataset.favId;
        if (favSelectionMode) {
          if (favSelected.has(id)) favSelected.delete(id);
          else favSelected.add(id);
          renderFavorites();
        }
      });
    });
  }

  /* ============================================================
     二十、音乐
     ============================================================ */
  function renderMusic(){
    const groups = $('#musicGroups');
    groups.innerHTML = state.musicGroups.map(g => `
      <button class="btn btn-ghost btn-sm" data-group="${g.id}">${g.name}</button>
    `).join('');
    const list = $('#musicList');
    if (!state.music.length) {
      list.innerHTML = '<div class="empty"><div class="empty-icon">🎵</div><div>还没有音乐</div></div>';
      return;
    }
    list.innerHTML = state.music.map(m => `
      <div class="music-item" data-music-id="${m.id}" style="background:var(--card); border-radius:12px; padding:12px; margin-bottom:10px; display:flex; gap:10px; align-items:center; box-shadow:var(--shadow-sm);">
        <div style="width:44px; height:44px; border-radius:10px; background:linear-gradient(135deg,#7a6cff,#ff6c9e); color:#fff; display:grid; place-items:center; font-size:22px; flex:0 0 auto;">🎵</div>
        <div style="flex:1; min-width:0;">
          <div style="font-size:14.5px; font-weight:500; margin-bottom:3px;">${m.title}</div>
          <div style="font-size:11.5px; color:var(--text-muted); overflow:hidden; text-overflow:ellipsis; white-space:nowrap;">${m.link}</div>
        </div>
        <div style="color:var(--text-light); font-size:16px; cursor:pointer;" data-del-music="${m.id}">✕</div>
      </div>
    `).join('');
    list.querySelectorAll('[data-del-music]').forEach(el => {
      el.addEventListener('click', (e) => {
        e.stopPropagation();
        state.music = state.music.filter(x => x.id !== el.dataset.delMusic);
        saveState(true);
        renderMusic();
      });
    });
  }

  /* ============================================================
     二十一、提问
     ============================================================ */
  function renderQuestions(){
    const list = $('#questionList');
    if (!state.questions.length) {
      list.innerHTML = '<div class="empty"><div class="empty-icon">❓</div><div>还没有问题</div></div>';
      return;
    }
    list.innerHTML = state.questions.map((q, idx) => `
      <div class="q-item" style="background:var(--card); border-radius:12px; padding:14px; margin-bottom:10px; box-shadow:var(--shadow-sm);">
        <div style="font-size:14.5px; font-weight:500; margin-bottom:10px;">${idx + 1}. ${q.title} <span style="font-size:11.5px; color:var(--text-muted);">(${q.multi ? '多选' : '单选'})</span></div>
        <div style="display:flex; flex-direction:column; gap:6px;">
          ${q.options.map((o, i) => `
            <label style="display:flex; align-items:center; gap:8px; padding:8px 10px; border-radius:8px; border:1px solid var(--border); font-size:13.5px;">
              <input type="${q.multi ? 'checkbox' : 'radio'}" name="q-${q.id}" value="${i}">
              <span>${o}</span>
            </label>
          `).join('')}
        </div>
        <div style="margin-top:10px;"><button class="btn btn-ghost btn-sm" data-del-q="${q.id}">删除</button></div>
      </div>
    `).join('');
    list.querySelectorAll('[data-del-q]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.questions = state.questions.filter(x => x.id !== btn.dataset.delQ);
        saveState(true);
        renderQuestions();
      });
    });
  }

  /* ============================================================
     二十二、喝水
     ============================================================ */
  function renderWater(){
    const today = new Date().toISOString().slice(0, 10);
    const count = (state.water.dates && state.water.dates[today]) || 0;
    $('#waterCount').textContent = count;
    const grid = $('#waterGrid');
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 8; i++) {
      const cup = document.createElement('div');
      cup.style.cssText = 'aspect-ratio:1; border-radius:50%; display:grid; place-items:center; font-size:20px; cursor:pointer; border:2px solid var(--border);';
      if (i < count) {
        cup.textContent = '💧';
        cup.style.background = '#d4e8ff';
        cup.style.borderColor = '#6cb8f0';
      }
      cup.addEventListener('click', () => {
        if (!state.water.dates) state.water.dates = {};
        state.water.dates[today] = i + 1;
        saveState(true);
        renderWater();
      });
      frag.appendChild(cup);
    }
    grid.replaceChildren(frag);
  }

  /* ============================================================
     二十三、信件
     ============================================================ */
  let showArchived = false;
  function renderLetters(){
    const list = $('#letterList');
    const letters = showArchived ? state.archivedLetters : state.letters.filter(l => !l.archived);
    if (!letters.length) {
      list.innerHTML = `<div class="empty"><div class="empty-icon">💌</div><div>${showArchived ? '归档箱为空' : '还没有收到信件'}</div></div>`;
      return;
    }
    list.innerHTML = letters.map(l => `
      <div class="card" style="margin-bottom:12px;">
        <div style="display:flex; gap:10px; align-items:center; margin-bottom:10px;">
          <div style="width:40px; height:40px; border-radius:50%; background:linear-gradient(135deg,#7a6cff,#ff6c9e); color:#fff; display:grid; place-items:center; font-size:18px;">💌</div>
          <div style="flex:1;">
            <div style="font-size:14.5px; font-weight:500;">来自 ${l.from || 'TA'} 的信</div>
            <div style="font-size:11.5px; color:var(--text-muted);">${fmtFull(l.ts)}</div>
          </div>
        </div>
        <div class="${l.paper || 'paper-1'}" style="padding:14px; border-radius:10px; font-size:14px; line-height:1.7; white-space:pre-wrap; word-break:break-word;">${l.text}</div>
        <div class="btn-row" style="margin-top:10px;">
          ${showArchived
            ? `<button class="btn btn-ghost btn-sm" data-unarchive="${l.id}">移出归档</button>`
            : `<button class="btn btn-ghost btn-sm" data-archive="${l.id}">归档</button>`}
          <button class="btn btn-ghost btn-sm" data-del-letter="${l.id}">删除</button>
        </div>
      </div>
    `).join('');
    list.querySelectorAll('[data-archive]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.archive;
        const l = state.letters.find(x => x.id === id);
        if (l) { l.archived = true; state.archivedLetters.push(l); state.letters = state.letters.filter(x => x.id !== id); }
        saveState(true);
        renderLetters();
      });
    });
    list.querySelectorAll('[data-unarchive]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.unarchive;
        const l = state.archivedLetters.find(x => x.id === id);
        if (l) { l.archived = false; state.letters.push(l); state.archivedLetters = state.archivedLetters.filter(x => x.id !== id); }
        saveState(true);
        renderLetters();
      });
    });
    list.querySelectorAll('[data-del-letter]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.delLetter;
        state.letters = state.letters.filter(x => x.id !== id);
        state.archivedLetters = state.archivedLetters.filter(x => x.id !== id);
        saveState(true);
        renderLetters();
      });
    });
  }

  /* ============================================================
     二十四、通话记录
     ============================================================ */
  function renderCallList(){
    const list = $('#callList');
    if (!state.calls.length) {
      list.innerHTML = '<div class="empty"><div class="empty-icon">📞</div><div>还没有通话记录</div></div>';
      return;
    }
    list.innerHTML = state.calls.map(c => {
      const isMiss = !c.answered;
      const icon = isMiss ? '📵' : (c.direction === 'in' ? '📥' : '📤');
      const cls = isMiss ? 'miss' : (c.direction === 'in' ? 'in' : 'out');
      const durText = c.answered
        ? `${Math.floor(c.duration/60)}分${c.duration%60}秒`
        : (isMiss ? '未接' : '已拒绝');
      return `
        <div class="call-record">
          <div class="call-icon ${cls}">${icon}</div>
          <div class="call-info">
            <div class="call-name">${c.peerName} ${isMiss ? '<span style="color:var(--danger); font-size:12px;">未接</span>' : ''}</div>
            <div class="call-time">${fmtFull(c.ts)} · ${c.direction === 'in' ? '呼入' : '呼出'}</div>
          </div>
          <div class="call-duration">${durText}</div>
        </div>
      `;
    }).join('');
  }

  /* ============================================================
     二十五、日记
     ============================================================ */
  function renderDiary(){
    const list = $('#diaryList');
    if (!state.diary.length) {
      list.innerHTML = '<div class="empty"><div class="empty-icon">📔</div><div>还没有日记</div></div>';
      return;
    }
    list.innerHTML = state.diary.map(d => `
      <div class="diary-item">
        <div class="diary-date">${fmtFull(d.ts)}</div>
        <div class="diary-title">${d.title || '无标题'}</div>
        <div class="diary-content">${d.content}</div>
        <div style="margin-top:8px; display:flex; gap:8px;">
          <button class="btn btn-ghost btn-sm" data-edit-diary="${d.id}">编辑</button>
          <button class="btn btn-danger btn-sm" data-del-diary="${d.id}">删除</button>
        </div>
      </div>
    `).join('');
    list.querySelectorAll('[data-edit-diary]').forEach(btn => {
      btn.addEventListener('click', () => {
        const d = state.diary.find(x => x.id === btn.dataset.editDiary);
        if (!d) return;
        showForm('编辑日记', [
          { key: 'title', label: '标题', type: 'text', value: d.title },
          { key: 'content', label: '内容', type: 'textarea', value: d.content }
        ], (data) => {
          d.title = data.title;
          d.content = data.content;
          saveState(true);
          renderDiary();
        });
      });
    });
    list.querySelectorAll('[data-del-diary]').forEach(btn => {
      btn.addEventListener('click', () => {
        showConfirm('删除日记', '确定删除这条日记吗？', () => {
          state.diary = state.diary.filter(x => x.id !== btn.dataset.delDiary);
          saveState(true);
          renderDiary();
        });
      });
    });
  }

  /* ============================================================
     二十六、倒计时
     ============================================================ */
  let countdownTimer = null;
  function renderCountdowns(){
    const list = $('#countdownList');
    if (!state.countdowns.length) {
      list.innerHTML = '<div class="empty"><div class="empty-icon">⏳</div><div>还没有倒计时</div></div>';
      return;
    }
    list.innerHTML = state.countdowns.map(c => {
      const diff = Math.max(0, c.target - nowTime());
      const days = Math.floor(diff / (24 * 3600 * 1000));
      const hours = Math.floor((diff % (24 * 3600 * 1000)) / (3600 * 1000));
      const mins = Math.floor((diff % (3600 * 1000)) / (60 * 1000));
      const secs = Math.floor((diff % (60 * 1000)) / 1000);
      return `
        <div class="countdown-card" data-cd-id="${c.id}">
          <div class="cd-name">${c.name}</div>
          <div class="cd-time">${days}天 ${pad2(hours)}:${pad2(mins)}:${pad2(secs)}</div>
          <div class="cd-date">目标：${fmtFull(c.target)}</div>
          <button class="btn btn-ghost btn-sm" data-del-cd="${c.id}" style="background:rgba(255,255,255,.2); color:#fff; border:none;">删除</button>
        </div>
      `;
    }).join('');
    list.querySelectorAll('[data-del-cd]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.countdowns = state.countdowns.filter(x => x.id !== btn.dataset.delCd);
        saveState(true);
        renderCountdowns();
      });
    });
  }

  function startCountdownTicker(){
    if (countdownTimer) clearInterval(countdownTimer);
    countdownTimer = setInterval(() => {
      if ($('#viewCountdown').classList.contains('active')) renderCountdowns();
    }, 1000);
  }

  /* ============================================================
     二十七、统计
     ============================================================ */
  function renderStats(){
    const totalMessages = Object.values(state.sessions).reduce((s, x) => s + (x.messages ? x.messages.length : 0), 0);
    const totalLetters = state.letters.length + state.archivedLetters.length;
    const totalMomentLikes = state.moments.reduce((s, m) => s + (m.likes ? m.likes.length : 0), 0);
    const totalMomentComments = state.moments.reduce((s, m) => s + (m.comments ? m.comments.length : 0), 0);
    const missedCalls = state.calls.filter(c => !c.answered).length;
    const c = state.characters[0];
    const aff = c.affection || 0;

    $('#statsContent').innerHTML = `
      <div class="card">
        <div class="card-title">总览统计</div>
        <div style="font-size:13.5px; line-height:2; color:var(--text);">
          消息总数：<b>${totalMessages}</b> 条<br>
          收到信件：<b>${totalLetters}</b> 封<br>
          朋友圈动态：<b>${state.moments.length}</b> 条<br>
          朋友圈获赞：<b>${totalMomentLikes}</b> 次<br>
          朋友圈评论：<b>${totalMomentComments}</b> 条<br>
          通话记录：<b>${state.calls.length}</b> 次（未接 ${missedCalls} 次）
        </div>
      </div>
      <div class="affection-bar">
        <div class="aff-head"><span>${c.name} 的感情值</span><span>${aff} / 100</span></div>
        <div class="aff-track"><div class="aff-fill" style="width:${aff}%;"></div></div>
      </div>
      <div class="card">
        <div class="card-title">愿望商城</div>
        <div style="font-size:13.5px; line-height:2; color:var(--text);">
          当前余额：<b>${state.balance}</b> 心愿币<br>
          愿望总数：<b>${state.wishes.length}</b> 个<br>
          订单总数：<b>${state.orders.length}</b> 笔<br>
          签到天数：<b>${Object.keys(state.checkins).length}</b> 天
        </div>
      </div>
      <div class="card">
        <div class="card-title">其他</div>
        <div style="font-size:13.5px; line-height:2; color:var(--text);">
          日记：<b>${state.diary.length}</b> 篇<br>
          收藏：<b>${state.favorites.length}</b> 条<br>
          音乐：<b>${state.music.length}</b> 首<br>
          提问：<b>${state.questions.length}</b> 个
        </div>
      </div>
    `;
  }

  /* ============================================================
     二十八、梦角档案
     ============================================================ */
  function daysToBirthday(birthday){
    if (!birthday) return '--';
    const now = new Date();
    const parts = birthday.split('-');
    if (parts.length < 3) return '--';
    const target = new Date(now.getFullYear(), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    if (target < now) target.setFullYear(now.getFullYear() + 1);
    return Math.ceil((target - now) / (24 * 3600 * 1000));
  }

  function renderCharacters(){
    const c = state.characters[0];
    const aff = c.affection || 0;
    const statusLabel = STATUS_LABELS[c.status] || '在线';
    const statusColor = STATUS_COLORS[c.status] || 'online';
    const birthdayInfo = c.birthday ? `距离生日还有 ${daysToBirthday(c.birthday)} 天` : '未设置生日';

    $('#characterContent').innerHTML = `
      <div class="profile-card">
        <div class="pc-top">
          <div class="avatar" id="charAvatarSlot"></div>
          <div class="pc-info">
            <div class="pc-name">${c.name || 'TA'}</div>
            <div class="pc-status"><span class="status-dot ${statusColor}"></span>${statusLabel}</div>
          </div>
        </div>
        <div class="pc-tags">${(c.personality || []).map(t => `<span class="pc-tag">${t}</span>`).join('')}</div>
      </div>
      <div class="affection-bar">
        <div class="aff-head"><span>感情值</span><span>${aff} / 100</span></div>
        <div class="aff-track"><div class="aff-fill" style="width:${aff}%;"></div></div>
        <div style="margin-top:8px; font-size:12px; color:var(--text-muted); line-height:1.6;">
          ${aff >= 80 ? '💕 感情深厚，更容易主动联系你' :
            aff >= 50 ? '💗 感情不错，会经常关心你' :
            aff >= 20 ? '💛 正在熟悉中' : '🤍 还需要多聊聊'}
        </div>
      </div>
      <div class="card">
        <div class="card-title">档案信息</div>
        <div class="setting-row">
          <div class="setting-label">生日</div>
          <div class="setting-value"><input type="date" class="field" id="charBirthday" value="${c.birthday || ''}" style="max-width:160px;"></div>
        </div>
        <div style="font-size:12px; color:var(--text-muted); padding:4px 0;">${birthdayInfo}</div>
        <div class="setting-row">
          <div class="setting-label">性格标签</div>
          <div class="setting-value"><input type="text" class="field" id="charPersonality" value="${(c.personality || []).join(',')}" placeholder="用逗号分隔" style="max-width:180px;"></div>
        </div>
        <div class="setting-row">
          <div class="setting-label">喜欢的话题</div>
          <div class="setting-value"><input type="text" class="field" id="charLikes" value="${(c.likes || []).join(',')}" placeholder="用逗号分隔" style="max-width:180px;"></div>
        </div>
        <div class="setting-row">
          <div class="setting-label">讨厌的话题</div>
          <div class="setting-value"><input type="text" class="field" id="charDislikes" value="${(c.dislikes || []).join(',')}" placeholder="用逗号分隔" style="max-width:180px;"></div>
        </div>
        <div style="margin-top:10px;">
          <label class="field-label">备注</label>
          <textarea class="field" id="charNotes" rows="3" placeholder="关于 TA 的任何记录…">${c.notes || ''}</textarea>
        </div>
        <div class="btn-row" style="margin-top:10px;">
          <button class="btn btn-primary" id="btnSaveChar">保存档案</button>
          <button class="btn btn-ghost" id="btnEditCharAvatar">更换头像</button>
        </div>
      </div>
    `;

    setAvatarInto($('#charAvatarSlot'), c.avatar, '🐰');

    $('#btnSaveChar').addEventListener('click', () => {
      c.birthday = $('#charBirthday').value;
      c.personality = $('#charPersonality').value.split(',').map(s => s.trim()).filter(Boolean);
      c.likes = $('#charLikes').value.split(',').map(s => s.trim()).filter(Boolean);
      c.dislikes = $('#charDislikes').value.split(',').map(s => s.trim()).filter(Boolean);
      c.notes = $('#charNotes').value;
      saveState(true);
      renderCharacters();
      toast('档案已保存');
    });

    $('#btnEditCharAvatar').addEventListener('click', () => openAvatarPickerForCharacter('ta'));
  }

  function openAvatarPickerForCharacter(id){
    const c = state.characters.find(x => x.id === id);
    if (!c) return;
    openDrawer('更换头像', `
      <div class="card">
        <div class="card-title">默认头像</div>
        <div style="display:grid; grid-template-columns:repeat(6,1fr); gap:8px;">
          ${DEFAULT_AVATARS.map(e => `
            <button data-emoji="${e}" style="aspect-ratio:1; border-radius:50%; border:2px solid transparent; background:var(--card-2); font-size:22px; display:grid; place-items:center; ${e === c.avatar ? 'border-color:var(--primary);' : ''}">${e}</button>
          `).join('')}
        </div>
      </div>
      <div class="card">
        <button class="btn btn-primary btn-block" id="btnUploadCustomAvatar">上传自定义图片</button>
      </div>
    `, (body) => {
      body.querySelectorAll('[data-emoji]').forEach(btn => {
        btn.addEventListener('click', () => {
          c.avatar = btn.dataset.emoji;
          if (c.id === 'ta') state.ta.avatar = c.avatar;
          saveState(true);
          closeDrawer();
          renderCharacters();
          renderHeader();
          renderMessages();
          renderSessionList();
          toast('头像已更换');
        });
      });
      body.querySelector('#btnUploadCustomAvatar').addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async () => {
          const file = input.files && input.files[0];
          if (!file) return;
          try {
            const dataUrl = await compressAvatar(file);
            c.avatar = dataUrl;
            if (c.id === 'ta') state.ta.avatar = dataUrl;
            saveState(true);
            closeDrawer();
            renderCharacters();
            renderHeader();
            renderMessages();
            renderSessionList();
            toast('头像已更换');
          } catch (e) { toast('处理失败'); }
        };
        input.click();
      });
    });
  }

  /* ============================================================
     二十九、壁纸库
     ============================================================ */
  function renderWallpapers(){
    const grid = $('#wallpaperGrid');
    const frag = document.createDocumentFragment();
    WALLPAPER_PRESETS.forEach(w => {
      const el = document.createElement('div');
      el.className = 'wallpaper-item';
      el.style.background = w;
      if (state.settings.wallpaper === w) el.classList.add('active');
      el.addEventListener('click', () => {
        state.settings.wallpaper = w;
        state.settings.chatBgImage = null;
        saveState(true);
        applyChatBackground();
        renderWallpapers();
        toast('壁纸已应用');
      });
      frag.appendChild(el);
    });
    const custom = document.createElement('div');
    custom.className = 'wallpaper-item';
    custom.style.cssText = 'background:var(--card-2); border:2px dashed var(--border); display:grid; place-items:center; color:var(--text-muted); font-size:12px;';
    custom.textContent = '+ 自定义';
    custom.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async () => {
        const file = input.files && input.files[0];
        if (!file) return;
        try {
          const dataUrl = await compressImage(file, 1280, 0.72);
          state.settings.chatBgImage = dataUrl;
          state.settings.wallpaper = null;
          saveState(true);
          applyChatBackground();
          renderWallpapers();
          toast('壁纸已应用');
        } catch (e) { toast('处理失败'); }
      };
      input.click();
    });
    frag.appendChild(custom);
    grid.replaceChildren(frag);
  }

  /* ============================================================
     三十、音效设置页
     ============================================================ */
  function renderSounds(){
    const s = state.settings.sounds;
    const nameMap = { msg: '消息提示音', letter: '来信铃声', call: '来电铃声', bgm: '通话背景音乐' };
    $('#soundsContent').innerHTML = `
      <div class="card">
        <div class="card-title">音效开关</div>
        <div class="sound-row">
          <div class="sound-label">消息提示音</div>
          <div class="switch"><input type="checkbox" id="sndMsgOn" ${s.msgOn ? 'checked' : ''}><span class="slider"></span></div>
        </div>
        <div class="sound-row">
          <div class="sound-label">来信铃声</div>
          <div class="switch"><input type="checkbox" id="sndLetterOn" ${s.letterOn ? 'checked' : ''}><span class="slider"></span></div>
        </div>
        <div class="sound-row">
          <div class="sound-label">来电铃声</div>
          <div class="switch"><input type="checkbox" id="sndCallOn" ${s.callOn ? 'checked' : ''}><span class="slider"></span></div>
        </div>
        <div class="sound-row">
          <div class="sound-label">通话背景音乐</div>
          <div class="switch"><input type="checkbox" id="sndBgmOn" ${s.bgmOn ? 'checked' : ''}><span class="slider"></span></div>
        </div>
      </div>
      <div class="card">
        <div class="card-title">自定义音效</div>
        ${['msg','letter','call','bgm'].map(k => `
          <div class="sound-row">
            <div class="sound-label">${nameMap[k]}</div>
            <button data-upload-sound2="${k}">${s[k] ? '已设置' : '上传'}</button>
            ${s[k] ? `<button data-test-sound="${k}">播放</button>` : ''}
            ${s[k] ? `<button data-clear-sound="${k}">清除</button>` : ''}
          </div>
        `).join('')}
      </div>
    `;
    $('#sndMsgOn').addEventListener('change', e => { s.msgOn = e.target.checked; saveState(); });
    $('#sndLetterOn').addEventListener('change', e => { s.letterOn = e.target.checked; saveState(); });
    $('#sndCallOn').addEventListener('change', e => { s.callOn = e.target.checked; saveState(); });
    $('#sndBgmOn').addEventListener('change', e => { s.bgmOn = e.target.checked; saveState(); });
    $$('[data-upload-sound2]').forEach(btn => {
      btn.addEventListener('click', () => uploadSound(btn.dataset.uploadSound2));
    });
    $$('[data-test-sound]').forEach(btn => {
      btn.addEventListener('click', () => playSound(btn.dataset.testSound));
    });
    $$('[data-clear-sound]').forEach(btn => {
      btn.addEventListener('click', () => {
        s[btn.dataset.clearSound] = null;
        saveState(true);
        renderSounds();
      });
    });
  }

  function uploadSound(type){
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'audio/*';
    input.onchange = () => {
      const file = input.files && input.files[0];
      if (!file) return;
      if (file.size > 2 * 1024 * 1024) { toast('音频文件太大（限 2MB）'); return; }
      const reader = new FileReader();
      reader.onload = () => {
        state.settings.sounds[type] = reader.result;
        saveState(true);
        renderSounds();
        toast('已上传');
      };
      reader.readAsDataURL(file);
    };
    input.click();
  }

  /* ============================================================
     三十一、通用弹窗
     ============================================================ */
  let confirmCb = null;
  function showConfirm(title, text, onOk){
    $('#confirmTitle').textContent = title;
    $('#confirmText').textContent = text;
    confirmCb = onOk;
    $('#confirmModal').classList.add('show');
  }
  function hideConfirm(){
    $('#confirmModal').classList.remove('show');
    confirmCb = null;
  }

  let formCb = null;
  function showForm(title, fields, onOk){
    $('#formTitle').textContent = title;
    const container = $('#formFields');
    container.innerHTML = '';
    fields.forEach(f => {
      const wrap = document.createElement('div');
      const label = document.createElement('label');
      label.className = 'field-label';
      label.textContent = f.label || '';
      let input;
      if (f.type === 'textarea') {
        input = document.createElement('textarea');
        input.className = 'field';
        input.rows = 3;
      } else if (f.type === 'select') {
        input = document.createElement('select');
        input.className = 'field';
        (f.options || []).forEach(opt => {
          const o = document.createElement('option');
          o.value = opt.value;
          o.textContent = opt.label;
          input.appendChild(o);
        });
      } else {
        input = document.createElement('input');
        input.className = 'field';
        input.type = f.type || 'text';
      }
      input.dataset.key = f.key;
      if (f.placeholder) input.placeholder = f.placeholder;
      if (f.value !== undefined) input.value = f.value;
      wrap.append(label, input);
      container.appendChild(wrap);
    });
    formCb = () => {
      const data = {};
      container.querySelectorAll('[data-key]').forEach(el => { data[el.dataset.key] = el.value; });
      onOk(data);
    };
    $('#formModal').classList.add('show');
    setTimeout(() => {
      const first = container.querySelector('input, textarea, select');
      if (first) first.focus();
    }, 100);
  }
  function hideForm(){
    $('#formModal').classList.remove('show');
    formCb = null;
  }

  function openDrawer(title, bodyHtml, onMount){
    $('#drawerTitle').textContent = title;
    $('#drawerBody').innerHTML = bodyHtml;
    $('#drawerPanel').classList.add('open');
    $('#drawerMask').classList.add('show');
    if (typeof onMount === 'function') onMount($('#drawerBody'));
  }
  function closeDrawer(){
    $('#drawerPanel').classList.remove('open');
    $('#drawerMask').classList.remove('show');
  }

  function openContextMenu(x, y, items){
    const menu = $('#contextMenu');
    menu.innerHTML = items.map(it => `
      <div class="context-menu-item ${it.danger ? 'danger' : ''}" data-cmd="${it.cmd}">${it.label}</div>
    `).join('');
    menu.classList.add('show');
    const rect = menu.getBoundingClientRect();
    let left = x, top = y;
    if (left + rect.width > window.innerWidth - 10) left = window.innerWidth - rect.width - 10;
    if (top + rect.height > window.innerHeight - 10) top = window.innerHeight - rect.height - 10;
    menu.style.left = left + 'px';
    menu.style.top = top + 'px';
    menu.querySelectorAll('[data-cmd]').forEach(el => {
      el.addEventListener('click', () => {
        const cmd = el.dataset.cmd;
        menu.classList.remove('show');
        const it = items.find(i => i.cmd === cmd);
        if (it && it.handler) it.handler();
      });
    });
  }
  function closeContextMenu(){
    $('#contextMenu').classList.remove('show');
  }

  /* ============================================================
     三十二、设置界面
     ============================================================ */
  function renderColorPickers(){
    const meWrap = $('#bubbleMeColors');
    const taWrap = $('#bubbleTaColors');
    if (!meWrap || !taWrap) return;
    const meCur = state.settings.bubbleMeColor || '';
    const taCur = state.settings.bubbleTaColor || '';

    meWrap.innerHTML = BUBBLE_COLORS.map(c =>
      `<div class="color-dot ${c === meCur ? 'active' : ''}" data-color="${c}" style="background:${c}"></div>`
    ).join('');
    taWrap.innerHTML = BUBBLE_COLORS.map(c =>
      `<div class="color-dot ${c === taCur ? 'active' : ''}" data-color="${c}" style="background:${c}"></div>`
    ).join('');

    meWrap.querySelectorAll('[data-color]').forEach(el => {
      el.addEventListener('click', () => {
        state.settings.bubbleMeColor = el.dataset.color;
        saveState(true);
        applySettings();
        renderColorPickers();
      });
    });
    taWrap.querySelectorAll('[data-color]').forEach(el => {
      el.addEventListener('click', () => {
        state.settings.bubbleTaColor = el.dataset.color;
        saveState(true);
        applySettings();
        renderColorPickers();
      });
    });
  }

  function renderCardList2(){
    const list = $('#cardList2');
    if (!list) return;
    $('#cardCountBadge').textContent = state.cards.length;
    if (!state.cards.length) {
      list.innerHTML = '<div class="empty" style="padding:16px 0; font-size:12.5px;">还没有字卡</div>';
      return;
    }
    list.innerHTML = state.cards.map(c => `
      <div style="display:flex; gap:8px; align-items:center; padding:8px 10px; background:var(--card-2); border-radius:8px; margin-bottom:6px;">
        <div style="flex:1; font-size:13.5px; word-break:break-word;">
          ${c.text}
          ${c.weight && c.weight !== 1 ? `<span style="color:var(--text-muted); font-size:11px;"> · 权重${c.weight}</span>` : ''}
          ${c.time ? `<span style="color:var(--text-muted); font-size:11px;"> · ${c.time === 'night' ? '深夜' : '白天'}</span>` : ''}
          ${c.mood ? `<span style="color:var(--text-muted); font-size:11px;"> · ${c.mood === 'high' ? '高好感' : c.mood === 'low' ? '低好感' : '中好感'}</span>` : ''}
        </div>
        <button class="btn btn-ghost btn-sm" data-del-card="${c.id}" style="padding:2px 8px; min-height:26px;">✕</button>
      </div>
    `).join('');
    list.querySelectorAll('[data-del-card]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.cards = state.cards.filter(x => x.id !== btn.dataset.delCard);
        saveState(true);
        renderCardList2();
      });
    });
  }

  function renderSettings(){
    $$('#globalThemeRow .theme-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.theme === state.settings.globalTheme);
    });
    $$('.shape-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.shape === state.settings.avatarShape);
    });
    $('#avatarSize').value = state.settings.avatarSize || 40;
    $('#avatarSizeVal').textContent = (state.settings.avatarSize || 40) + 'px';
    $('#fontSizeRange').value = state.settings.fontSize || 15;
    $('#fontSizeVal').textContent = (state.settings.fontSize || 15) + 'px';
    $$('[data-weight]').forEach(btn => {
      btn.classList.toggle('active', Number(btn.dataset.weight) === state.settings.fontWeight);
    });
    $('#bubbleRadius').value = state.settings.bubbleRadius || 16;
    $('#bubbleRadiusVal').textContent = (state.settings.bubbleRadius || 16) + 'px';
    $('#bubblePad').value = state.settings.bubblePad || 12;
    $('#bubblePadVal').textContent = (state.settings.bubblePad || 12) + 'px';
    renderColorPickers();
    $('#bgOpacity').value = Math.round((state.settings.chatBgOpacity || 0.7) * 100);
    $('#bgOpacityVal').textContent = Math.round((state.settings.chatBgOpacity || 0.7) * 100) + '%';
    renderCardList2();
    const s = state.settings.sounds;
    const msgOn = $('#soundMsgOn'); if (msgOn) msgOn.checked = s.msgOn;
    const letterOn = $('#soundLetterOn'); if (letterOn) letterOn.checked = s.letterOn;
    const callOn = $('#soundCallOn'); if (callOn) callOn.checked = s.callOn;
    const bgmOn = $('#soundBgmOn'); if (bgmOn) bgmOn.checked = s.bgmOn;
  }

  /* ============================================================
     三十三、导入导出
     ============================================================ */
  function exportJSON(){
    try {
      flushState();
      const payload = { ...state, exportedAt: new Date().toISOString() };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
      a.download = 'private-space-' + stamp + '.json';
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
      toast('已导出 JSON');
    } catch (e) { toast('导出失败'); }
  }

  function importJSON(file){
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (!data || typeof data !== 'object') throw new Error('格式不正确');
        const prev = state;
        state = mergeDeep(clone(DEFAULTS), data);
        if (storageOK) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            lastSerialized = JSON.stringify(state);
          } catch (e) {
            state = prev;
            toast('保存失败，可能空间不足');
            return;
          }
        }
        applySettings();
        renderAll();
        toast('导入成功');
      } catch (e) { toast('导入失败：' + e.message); }
    };
    reader.readAsText(file);
  }

  function exportTXT(){
    if (!state.sessions.ta.messages.length) { toast('没有聊天记录'); return; }
    let out = '# 聊天记录\n';
    out += '# 导出时间: ' + new Date().toISOString() + '\n\n';
    for (const m of state.sessions.ta.messages) {
      const role = m.role === 'me' ? 'me' : 'ta';
      const nick = role === 'me' ? (state.me.name || '我') : (state.ta.name || 'TA');
      const tag = m.letter ? '[信]' : m.voicemail ? '[留言]' : '';
      const text = String(m.text).replace(/\\/g, '\\\\').replace(/\n/g, '\\n');
      out += '[' + m.ts + '] ' + role + '|' + nick.replace(/\|/g, ' ') + '|' + tag + text + '\n';
    }
    const blob = new Blob([out], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat-' + new Date().toISOString().slice(0, 10) + '.txt';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    toast('已导出 TXT');
  }

  function importTXT(file){
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const lines = String(reader.result || '').split(/\r?\n/);
        const parsed = [];
        const re = /^\[(\d+)\]\s*(me|ta)\|([^|]*)\|(.*)$/;
        for (const line of lines) {
          if (!line || line.startsWith('#')) continue;
          const m = line.match(re);
          if (!m) continue;
          const ts = parseInt(m[1], 10);
          const role = m[2];
          let body = m[4];
          let letter = false, voicemail = false;
          if (body.startsWith('[信]')) { letter = true; body = body.slice(3); }
          else if (body.startsWith('[留言]')) { voicemail = true; body = body.slice(4); }
          const text = body.replace(/\\n/g, '\n').replace(/\\\\/g, '\\');
          if (!text) continue;
          parsed.push({ id: uid(), role, text, ts: isNaN(ts) ? nowTime() : ts, letter, voicemail });
        }
        if (!parsed.length) { toast('未识别到有效记录'); return; }
        showConfirm('导入 TXT', `将导入 ${parsed.length} 条消息，替换当前聊天记录。`, () => {
          parsed.sort((a, b) => a.ts - b.ts);
          state.sessions.ta.messages = parsed;
          state.sessions.ta.unread = 0;
          saveState(true);
          renderMessages();
          renderSessionList();
          toast(`成功导入 ${parsed.length} 条`);
        });
      } catch (e) { toast('导入失败：' + e.message); }
    };
    reader.readAsText(file);
  }

  function exportExcel(){
    const lines = [];
    lines.push('统计报表,' + new Date().toLocaleString());
    lines.push('');
    lines.push('指标,数值');
    lines.push('消息总数,' + Object.values(state.sessions).reduce((s, x) => s + (x.messages ? x.messages.length : 0), 0));
    lines.push('收到信件,' + (state.letters.length + state.archivedLetters.length));
    lines.push('朋友圈动态,' + state.moments.length);
    lines.push('通话记录,' + state.calls.length);
    lines.push('未接来电,' + state.calls.filter(c => !c.answered).length);
    lines.push('感情值,' + (state.characters[0].affection || 0));
    lines.push('当前余额,' + state.balance);
    lines.push('签到天数,' + Object.keys(state.checkins).length);
    lines.push('日记,' + state.diary.length);
    lines.push('收藏,' + state.favorites.length);
    lines.push('音乐,' + state.music.length);
    lines.push('提问,' + state.questions.length);
    const blob = new Blob(['\ufeff' + lines.join('\n')], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = '统计报表-' + new Date().toISOString().slice(0, 10) + '.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
    toast('已导出统计报表');
  }

  /* ============================================================
     三十四、群聊
     ============================================================ */
  function createGroup(){
    showForm('发起群聊', [
      { key: 'name', label: '群聊名称', type: 'text', placeholder: '例如：我们的秘密基地' },
      { key: 'avatar', label: '群头像（emoji）', type: 'text', placeholder: '👥', value: '👥' }
    ], (data) => {
      if (!data.name) { toast('请输入群聊名称'); return; }
      const g = { id: uid(), name: data.name, avatar: data.avatar || '👥', createdAt: nowTime() };
      state.groups.push(g);
      state.sessions[g.id] = { messages: [], unread: 0, lastReadAt: 0 };
      state.sessions[g.id].messages.push({
        id: uid(), role: 'ta', text: '群聊「' + g.name + '」已创建', ts: nowTime(), isSystem: true
      });
      saveState(true);
      renderSessionList();
      toast('群聊已创建');
    });
  }

  /* ============================================================
     三十五、头像选择器
     ============================================================ */
  function openAvatarPicker(role){
    const current = role === 'me' ? state.me.avatar : state.ta.avatar;
    openDrawer(role === 'me' ? '更换我的头像' : '更换 TA 的头像', `
      <div class="card">
        <div class="card-title">默认头像</div>
        <div style="display:grid; grid-template-columns:repeat(6,1fr); gap:8px;">
          ${DEFAULT_AVATARS.map(e => `
            <button data-emoji="${e}" style="aspect-ratio:1; border-radius:50%; border:2px solid transparent; background:var(--card-2); font-size:22px; display:grid; place-items:center; ${e === current ? 'border-color:var(--primary);' : ''}">${e}</button>
          `).join('')}
        </div>
      </div>
      <div class="card">
        <button class="btn btn-primary btn-block" id="btnUploadAvatarCustom">上传自定义图片</button>
      </div>
    `, (body) => {
      body.querySelectorAll('[data-emoji]').forEach(btn => {
        btn.addEventListener('click', () => {
          const emoji = btn.dataset.emoji;
          if (role === 'me') state.me.avatar = emoji;
          else {
            state.ta.avatar = emoji;
            const c = state.characters[0];
            if (c) c.avatar = emoji;
          }
          saveState(true);
          closeDrawer();
          renderAll();
          toast('头像已更换');
        });
      });
      body.querySelector('#btnUploadAvatarCustom').addEventListener('click', () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async () => {
          const file = input.files && input.files[0];
          if (!file) return;
          try {
            const dataUrl = await compressAvatar(file);
            if (role === 'me') state.me.avatar = dataUrl;
            else {
              state.ta.avatar = dataUrl;
              const c = state.characters[0];
              if (c) c.avatar = dataUrl;
            }
            saveState(true);
            closeDrawer();
            renderAll();
            toast('头像已更换');
          } catch (e) { toast('处理失败'); }
        };
        input.click();
      });
    });
  }

  /* ============================================================
     三十六、图片压缩
     ============================================================ */
  function compressImage(file, maxSize, quality){
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          let { width, height } = img;
          if (width > maxSize || height > maxSize) {
            const r = Math.min(maxSize / width, maxSize / height);
            width = Math.max(1, Math.round(width * r));
            height = Math.max(1, Math.round(height * r));
          }
          const canvas = document.createElement('canvas');
          canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, width, height);
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.onerror = () => reject(new Error('图片解码失败'));
        img.src = reader.result;
      };
      reader.onerror = () => reject(new Error('读取失败'));
      reader.readAsDataURL(file);
    });
  }

  function compressAvatar(file){
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => {
          const size = 200;
          const min = Math.min(img.width, img.height);
          const sx = (img.width - min) / 2;
          const sy = (img.height - min) / 2;
          const canvas = document.createElement('canvas');
          canvas.width = size; canvas.height = size;
          const ctx = canvas.getContext('2d');
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, size, size);
          ctx.drawImage(img, sx, sy, min, min, 0, 0, size, size);
          resolve(canvas.toDataURL('image/jpeg', 0.82));
        };
        img.onerror = () => reject(new Error('图片解码失败'));
        img.src = reader.result;
      };
      reader.onerror = () => reject(new Error('读取失败'));
      reader.readAsDataURL(file);
    });
  }

  /* ============================================================
     三十七、整体渲染
     ============================================================ */
  function renderAll(){
    renderSessionList();
    renderMessages();
    renderMoments();
    renderWishes();
    renderSettings();
    renderPeriod();
    renderDivinationHistory();
    renderFavorites();
    renderMusic();
    renderQuestions();
    renderWater();
    renderLetters();
    renderCallList();
    renderDiary();
    renderCountdowns();
    renderStats();
    renderCharacters();
    renderWallpapers();
    renderSounds();
  }

  function renderHeader(){
    const peer = getPeerInfo();
    setAvatarInto($('#chatPeerAvatar'), peer.avatar, '🐰');
    $('#chatPeerName').textContent = peer.name;
  }

  /* ============================================================
     三十八、事件绑定
     ============================================================ */
  function bindEvents(){
    $$('.tab-item').forEach(tab => {
      tab.addEventListener('click', () => {
        const t = tab.dataset.tab;
        if (t === 'home') showView('viewHome');
        else if (t === 'moments') { showView('viewMoments'); renderMoments(); }
        else if (t === 'wishes') { showView('viewWishes'); renderWishes(); }
        else if (t === 'settings') { showView('viewSettings'); renderSettings(); }
      });
    });

    $$('[data-nav]').forEach(el => {
      el.addEventListener('click', () => {
        const nav = el.dataset.nav;
        const map = {
          period: () => { showView('viewPeriod'); renderPeriod(); },
          divination: () => { showView('viewDivination'); renderDivinationHistory(); },
          favorites: () => { showView('viewFavorites'); renderFavorites(); },
          music: () => { showView('viewMusic'); renderMusic(); },
          questions: () => { showView('viewQuestions'); renderQuestions(); },
          water: () => { showView('viewWater'); renderWater(); },
          wishes: () => { showView('viewWishes'); renderWishes(); },
          settings: () => { showView('viewSettings'); renderSettings(); },
          moments: () => { showView('viewMoments'); renderMoments(); },
          letters: () => { showView('viewLetters'); renderLetters(); },
          calls: () => { showView('viewCalls'); renderCallList(); },
          diary: () => { showView('viewDiary'); renderDiary(); },
          countdown: () => { showView('viewCountdown'); renderCountdowns(); },
          stats: () => { showView('viewStats'); renderStats(); },
          characters: () => { showView('viewCharacters'); renderCharacters(); },
          wallpapers: () => { showView('viewWallpapers'); renderWallpapers(); },
          sounds: () => { showView('viewSounds'); renderSounds(); }
        };
        if (map[nav]) map[nav]();
      });
    });

    $$('[data-back]').forEach(btn => {
      btn.addEventListener('click', () => showView('viewHome'));
    });

    $('#btnChatBack').addEventListener('click', () => {
      showView('viewHome');
      renderSessionList();
    });

    $('#btnChatCall').addEventListener('click', openDialer);
    $('#btnDialerCancel').addEventListener('click', closeDialer);
    $('#btnDialerCall').addEventListener('click', () => {
      $('#dialerStatus').textContent = '正在呼叫…';
      setTimeout(() => {
        if (Math.random() < PROB.CALL_ANSWER) startCall('out');
        else { closeDialer(); toast('对方暂时无法接听'); }
      }, rand(1500, 2800));
    });
    $('#btnHangupFloat').addEventListener('click', () => endCall(true));
    $('#btnIncomingAccept').addEventListener('click', acceptIncomingCall);
    $('#btnIncomingReject').addEventListener('click', () => rejectIncomingCall(false));

    $('#btnChatMore').addEventListener('click', (e) => {
      e.stopPropagation();
      const rect = e.currentTarget.getBoundingClientRect();
      openContextMenu(rect.right - 160, rect.bottom + 6, [
        { cmd: 'clearChat', label: '🗑️ 清空本会话', danger: true, handler: () => {
          showConfirm('清空聊天', '确定清空当前会话的所有消息吗？', () => {
            const sess = getCurrentSession();
            sess.messages = [];
            saveState(true);
            renderMessages();
            renderSessionList();
            toast('已清空');
          });
        }},
        { cmd: 'simulateCall', label: '📞 模拟来电', handler: () => setTimeout(triggerIncomingCall, 300) },
        { cmd: 'writeLetter', label: '💌 模拟来信', handler: () => scheduleLetter() },
        { cmd: 'chatInfo', label: 'ℹ️ 会话信息', handler: () => {
          const sess = getCurrentSession();
          const peer = getPeerInfo();
          openDrawer('会话信息', `
            <div class="card">
              <div class="card-title">${peer.name}</div>
              <div style="font-size:13px; color:var(--text-muted); line-height:1.9;">
                消息总数：${sess.messages.length} 条<br>
                我的消息：${sess.messages.filter(m => m.role === 'me').length} 条<br>
                对方消息：${sess.messages.filter(m => m.role === 'ta').length} 条<br>
                类型：${peer.isGroup ? '群聊' : '私聊'}
              </div>
            </div>
          `);
        }}
      ]);
    });

    const chatInput = $('#chatInput');
    chatInput.addEventListener('input', () => {
      autoResize(chatInput);
      updateSendState();
    });
    chatInput.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
        e.preventDefault();
        sendMessage();
      }
    });
    chatInput.addEventListener('focus', () => {
      setTimeout(() => {
        scrollChatToBottom();
        if (Math.random() < PROB.CALL_INCOMING && !callState.active) {
          setTimeout(triggerIncomingCall, rand(2000, 5000));
        }
      }, 300);
    });
    $('#btnSend').addEventListener('click', sendMessage);
    $('#btnEmoji').addEventListener('click', () => {
      $('#emojiPanel').classList.toggle('open');
    });

    $('#btnNewGroup').addEventListener('click', createGroup);

    $('#momentCover').addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = async () => {
        const file = input.files && input.files[0];
        if (!file) return;
        try {
          const dataUrl = await compressImage(file, 1200, 0.75);
          state.settings.momentCover = dataUrl;
          saveState(true);
          renderMoments();
          toast('封面已更换');
        } catch (e) { toast('处理失败'); }
      };
      input.click();
    });
    $('#btnNewMoment').addEventListener('click', () => {
      showForm('发布动态', [
        { key: 'text', label: '这一刻的想法', type: 'textarea', placeholder: '分享你的心情…' }
      ], (data) => {
        if (!data.text) { toast('说点什么吧'); return; }
        publishMoment({ text: data.text });
      });
    });
    $('#btnMomentVisitors').addEventListener('click', () => {
      const visitors = state.momentVisitors;
      if (!visitors.length) { toast('还没有访客'); return; }
      openDrawer('访客记录', `
        <div class="card">
          <div class="card-title">最近访客 <span class="badge">${visitors.length}</span></div>
          ${visitors.slice(0, 30).map(v => `
            <div style="display:flex; gap:10px; align-items:center; padding:8px 0; border-bottom:1px solid var(--border);">
              <div class="avatar" style="width:36px; height:36px; font-size:18px;">${v.avatar && v.avatar.startsWith('data:') ? `<img src="${v.avatar}">` : (v.avatar || '🐰')}</div>
              <div style="flex:1;">
                <div style="font-size:14px;">${v.name}</div>
                <div style="font-size:11.5px; color:var(--text-muted);">${fmtTime(v.ts)}</div>
              </div>
            </div>
          `).join('')}
        </div>
      `);
    });

    $('#btnUpdateBalance').addEventListener('click', () => {
      const v = parseInt($('#balanceInput').value, 10);
      if (isNaN(v) || v < 0) { toast('请输入有效数字'); return; }
      const delta = v - state.balance;
      state.balance = v;
      state.ledger.unshift({
        id: uid(), amount: delta, type: 'adjust',
        desc: '手动修改余额', ts: nowTime(), balance: state.balance
      });
      saveState(true);
      renderWishes();
      $('#balanceInput').value = '';
      toast('余额已更新');
    });
    $('#btnDailyCheckin').addEventListener('click', dailyCheckin);
    $('#btnShowOrders').addEventListener('click', () => {
      if (!state.orders.length) { toast('还没有订单'); return; }
      openDrawer('订单记录', `
        <div class="card">
          ${state.orders.map(o => `
            <div class="order-item">
              <div class="order-head">
                <span>${o.wishName}</span>
                <span class="order-status ${o.status === 'done' ? 'done' : 'pending'}">${o.status === 'done' ? '已完成' : '待完成'}</span>
              </div>
              <div class="order-sub">${o.price} 心愿币 · ${fmtFull(o.createdAt)}</div>
              ${o.status === 'pending' ? `<button class="btn btn-primary btn-sm" data-complete-order="${o.id}" style="margin-top:6px;">标记完成</button>` : ''}
            </div>
          `).join('')}
        </div>
      `, (body) => {
        body.querySelectorAll('[data-complete-order]').forEach(btn => {
          btn.addEventListener('click', () => {
            const o = state.orders.find(x => x.id === btn.dataset.completeOrder);
            if (o) { o.status = 'done'; o.completedAt = nowTime(); }
            saveState(true);
            closeDrawer();
            toast('已标记完成');
          });
        });
      });
    });
    $('#btnShowLedger').addEventListener('click', () => {
      if (!state.ledger.length) { toast('还没有收支记录'); return; }
      openDrawer('收支明细', `
        <div class="card">
          ${state.ledger.slice(0, 100).map(l => `
            <div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid var(--border); font-size:13px;">
              <div>
                <div style="font-weight:500;">${l.desc}</div>
                <div style="font-size:11px; color:var(--text-muted);">${fmtFull(l.ts)} · 余额 ${l.balance}</div>
              </div>
              <div style="color:${l.amount >= 0 ? 'var(--primary)' : 'var(--danger)'}; font-weight:600;">
                ${l.amount >= 0 ? '+' : ''}${l.amount}
              </div>
            </div>
          `).join('')}
        </div>
      `);
    });
    $('#btnNewWish').addEventListener('click', () => {
      showForm('添加愿望', [
        { key: 'name', label: '愿望名称', type: 'text', placeholder: '例如：一次旅行' },
        { key: 'price', label: '心愿币价格', type: 'number', placeholder: '100', value: '100' },
        { key: 'icon', label: '图标（emoji）', type: 'text', placeholder: '🎁', value: '🎁' }
      ], (data) => {
        if (!data.name) { toast('请输入名称'); return; }
        state.wishes.push({
          id: uid(), name: data.name,
          price: parseInt(data.price, 10) || 0,
          icon: data.icon || '🎁', createdAt: nowTime()
        });
        saveState(true);
        renderWishes();
        toast('已添加');
      });
    });

    $('#btnPeriodMark').addEventListener('click', () => {
      const today = new Date().toISOString().slice(0, 10);
      if (!state.period.dates) state.period.dates = [];
      const idx = state.period.dates.indexOf(today);
      if (idx >= 0) { state.period.dates.splice(idx, 1); toast('已取消标记'); }
      else { state.period.dates.push(today); toast('已标记今天'); }
      saveState(true);
      renderPeriod();
    });

    $('#btnDrawTarot').addEventListener('click', () => drawDivination('tarot'));
    $('#btnDrawLenormand').addEventListener('click', () => drawDivination('lenormand'));

    $('#btnFavSelect').addEventListener('click', () => {
      favSelectionMode = !favSelectionMode;
      favSelected.clear();
      $('#favSelectionBar').classList.toggle('hidden', !favSelectionMode);
      renderFavorites();
    });
    $('#btnFavCancelSelect').addEventListener('click', () => {
      favSelectionMode = false;
      favSelected.clear();
      $('#favSelectionBar').classList.add('hidden');
      renderFavorites();
    });
    $('#btnFavDelete').addEventListener('click', () => {
      if (!favSelected.size) { toast('请选择要删除的收藏'); return; }
      showConfirm('删除收藏', `确定删除选中的 ${favSelected.size} 条收藏吗？`, () => {
        state.favorites = state.favorites.filter(f => !favSelected.has(f.id));
        favSelected.clear();
        favSelectionMode = false;
        $('#favSelectionBar').classList.add('hidden');
        saveState(true);
        renderFavorites();
        toast('已删除');
      });
    });

    $('#btnNewMusic').addEventListener('click', () => {
      showForm('添加音乐', [
        { key: 'title', label: '歌曲名称', type: 'text', placeholder: '例如：晴天' },
        { key: 'link', label: '链接', type: 'text', placeholder: 'https://music.example.com/song' }
      ], (data) => {
        if (!data.title || !data.link) { toast('请填写完整'); return; }
        state.music.push({ id: uid(), title: data.title, link: data.link, group: 'default', createdAt: nowTime() });
        saveState(true);
        renderMusic();
        toast('已添加');
      });
    });

    $('#btnNewQuestion').addEventListener('click', () => {
      showForm('添加问题', [
        { key: 'title', label: '问题', type: 'text', placeholder: '例如：今晚想吃什么？' },
        { key: 'options', label: '选项（每行一个）', type: 'textarea', placeholder: '火锅\n烧烤\n日料' },
        { key: 'multi', label: '允许多选（yes/no）', type: 'text', placeholder: 'no', value: 'no' }
      ], (data) => {
        if (!data.title || !data.options) { toast('请填写完整'); return; }
        const options = data.options.split('\n').map(s => s.trim()).filter(Boolean);
        if (options.length < 1) { toast('至少需要一个选项'); return; }
        state.questions.push({
          id: uid(), title: data.title, options,
          multi: /^y(es)?$/i.test((data.multi || '').trim()), createdAt: nowTime()
        });
        saveState(true);
        renderQuestions();
        toast('已添加');
      });
    });

    $('#btnWaterReset').addEventListener('click', () => {
      const today = new Date().toISOString().slice(0, 10);
      if (!state.water.dates) state.water.dates = {};
      state.water.dates[today] = 0;
      saveState(true);
      renderWater();
      toast('已重置');
    });

    $('#btnShowArchived').addEventListener('click', () => {
      showArchived = !showArchived;
      renderLetters();
    });

    $('#btnNewDiary').addEventListener('click', () => {
      showForm('新建日记', [
        { key: 'title', label: '标题', type: 'text', placeholder: '今天…' },
        { key: 'content', label: '内容', type: 'textarea', placeholder: '写点什么…' }
      ], (data) => {
        if (!data.content) { toast('写点什么吧'); return; }
        state.diary.unshift({ id: uid(), title: data.title || '无标题', content: data.content, ts: nowTime() });
        saveState(true);
        renderDiary();
        toast('已保存');
      });
    });

    $('#btnNewCountdown').addEventListener('click', () => {
      showForm('新建倒计时', [
        { key: 'name', label: '名称', type: 'text', placeholder: '例如：生日' },
        { key: 'date', label: '目标日期', type: 'datetime-local' }
      ], (data) => {
        if (!data.name || !data.date) { toast('请填写完整'); return; }
        const target = new Date(data.date).getTime();
        if (isNaN(target)) { toast('日期格式有误'); return; }
        state.countdowns.push({ id: uid(), name: data.name, target, createdAt: nowTime() });
        saveState(true);
        renderCountdowns();
        toast('已添加');
      });
    });

    $$('#globalThemeRow .theme-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.settings.globalTheme = btn.dataset.theme;
        saveState(true);
        applySettings();
        renderSettings();
      });
    });

    $('#btnSetSplash').addEventListener('click', () => $('#splashFile').click());
    $('#splashFile').addEventListener('change', async e => {
      const file = e.target.files && e.target.files[0];
      e.target.value = '';
      if (!file) return;
      try {
        const dataUrl = await compressImage(file, 1280, 0.75);
        state.settings.splashImage = dataUrl;
        saveState(true);
        toast('启动页已更新');
      } catch (err) { toast('处理失败'); }
    });

    $$('.shape-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        state.settings.avatarShape = btn.dataset.shape;
        saveState(true);
        applySettings();
        renderSettings();
      });
    });
    $('#avatarSize').addEventListener('input', e => {
      state.settings.avatarSize = parseInt(e.target.value, 10);
      $('#avatarSizeVal').textContent = state.settings.avatarSize + 'px';
      applySettings(); saveState();
    });
    $('#fontSizeRange').addEventListener('input', e => {
      state.settings.fontSize = parseInt(e.target.value, 10);
      $('#fontSizeVal').textContent = state.settings.fontSize + 'px';
      applySettings(); saveState();
    });
    $$('[data-weight]').forEach(btn => {
      btn.addEventListener('click', () => {
        state.settings.fontWeight = Number(btn.dataset.weight);
        saveState(true);
        applySettings();
        renderSettings();
      });
    });
    $('#bubbleRadius').addEventListener('input', e => {
      state.settings.bubbleRadius = parseInt(e.target.value, 10);
      $('#bubbleRadiusVal').textContent = state.settings.bubbleRadius + 'px';
      applySettings(); saveState();
    });
    $('#bubblePad').addEventListener('input', e => {
      state.settings.bubblePad = parseInt(e.target.value, 10);
      $('#bubblePadVal').textContent = state.settings.bubblePad + 'px';
      applySettings(); saveState();
    });
    $('#bgOpacity').addEventListener('input', e => {
      const pct = parseInt(e.target.value, 10);
      state.settings.chatBgOpacity = pct / 100;
      $('#bgOpacityVal').textContent = pct + '%';
      applyChatBackground(); saveState();
    });
    $('#btnUploadChatBg').addEventListener('click', () => $('#chatBgFile').click());
    $('#chatBgFile').addEventListener('change', async e => {
      const file = e.target.files && e.target.files[0];
      e.target.value = '';
      if (!file) return;
      try {
        const dataUrl = await compressImage(file, 1280, 0.72);
        if (dataUrl.length > 700 * 1024) { toast('图片太大'); return; }
        state.settings.chatBgImage = dataUrl;
        state.settings.wallpaper = null;
        saveState(true);
        applyChatBackground();
        toast('背景已保存');
      } catch (err) { toast('处理失败'); }
    });
    $('#btnResetChatBg').addEventListener('click', () => {
      state.settings.chatBgImage = null;
      state.settings.wallpaper = null;
      saveState(true);
      applyChatBackground();
      toast('已恢复默认背景');
    });
    $('#btnEditMyAvatar').addEventListener('click', () => openAvatarPicker('me'));
    $('#btnEditTaAvatar').addEventListener('click', () => openAvatarPicker('ta'));

    $('#btnAddCard2').addEventListener('click', () => {
      const el = $('#newCardText');
      const lines = el.value.split('\n').map(s => s.trim()).filter(Boolean);
      if (!lines.length) { toast('请输入内容'); return; }
      for (const text of lines) addCard(text);
      saveState(true);
      renderCardList2();
      el.value = '';
      toast(`已添加 ${lines.length} 张字卡`);
    });

    const soundMap = {
      soundMsgOn: 'msgOn', soundLetterOn: 'letterOn',
      soundCallOn: 'callOn', soundBgmOn: 'bgmOn'
    };
    for (const [id, key] of Object.entries(soundMap)) {
      const el = $('#' + id);
      if (el) {
        el.addEventListener('change', e => {
          state.settings.sounds[key] = e.target.checked;
          saveState();
        });
      }
    }
    $$('[data-upload-sound]').forEach(btn => {
      btn.addEventListener('click', () => uploadSound(btn.dataset.uploadSound));
    });
    $('#soundFile').addEventListener('change', e => e.target.value = '');

    $('#btnExportJson').addEventListener('click', exportJSON);
    $('#btnImportJson').addEventListener('click', () => $('#importJsonFile').click());
    $('#importJsonFile').addEventListener('change', e => {
      const f = e.target.files && e.target.files[0];
      e.target.value = '';
      if (f) importJSON(f);
    });
    $('#btnExportTxt2').addEventListener('click', exportTXT);
    $('#btnImportTxt2').addEventListener('click', () => $('#importTxtFile').click());
    $('#importTxtFile').addEventListener('change', e => {
      const f = e.target.files && e.target.files[0];
      e.target.value = '';
      if (f) importTXT(f);
    });
    $('#btnExportExcel').addEventListener('click', exportExcel);

    $('#btnClearChat').addEventListener('click', () => {
      showConfirm('清空聊天记录', '将清空所有会话消息（其他数据保留）', () => {
        for (const k in state.sessions) state.sessions[k].messages = [];
        saveState(true);
        renderMessages();
        renderSessionList();
        toast('已清空聊天记录');
      });
    });
    $('#btnClearAll').addEventListener('click', () => {
      showConfirm('清空所有数据', '将删除所有数据，此操作不可恢复！', () => {
        state = clone(DEFAULTS);
        if (storageOK) {
          try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
            lastSerialized = JSON.stringify(state);
          } catch (e) {}
        }
        applySettings();
        renderAll();
        toast('已清空所有数据');
      });
    });

    $('#confirmOk').addEventListener('click', () => {
      const cb = confirmCb;
      hideConfirm();
      if (cb) { try { cb(); } catch (e) { console.error(e); } }
    });
    $('#confirmCancel').addEventListener('click', hideConfirm);
    $('#confirmModal').addEventListener('click', e => {
      if (e.target.id === 'confirmModal') hideConfirm();
    });

    $('#formOk').addEventListener('click', () => {
      const cb = formCb;
      hideForm();
      if (cb) { try { cb(); } catch (e) { console.error(e); } }
    });
    $('#formCancel').addEventListener('click', hideForm);
    $('#formModal').addEventListener('click', e => {
      if (e.target.id === 'formModal') hideForm();
    });

    $('#btnDrawerClose').addEventListener('click', closeDrawer);
    $('#drawerMask').addEventListener('click', closeDrawer);

    document.addEventListener('click', (e) => {
      if (!e.target.closest('#contextMenu') && !e.target.closest('#btnChatMore')) {
        closeContextMenu();
      }
    });
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        closeDrawer();
        closeContextMenu();
        hideConfirm();
        hideForm();
      }
    });

    let homeStartX = null;
    const homeScroll = $('#homeScroll');
    const homePages = $('#homePages');
    let currentPage = 0;
    const totalPages = 2;

    function updatePageIndicator(){
      $$('.page-dot').forEach((d, i) => d.classList.toggle('active', i === currentPage));
    }

    homeScroll.addEventListener('touchstart', e => {
      homeStartX = e.touches[0].clientX;
    }, { passive: true });
    homeScroll.addEventListener('touchend', e => {
      if (homeStartX == null) return;
      const dx = e.changedTouches[0].clientX - homeStartX;
      if (Math.abs(dx) > 60) {
        if (dx < 0 && currentPage < totalPages - 1) currentPage++;
        else if (dx > 0 && currentPage > 0) currentPage--;
        homePages.style.transform = `translateX(-${currentPage * 100}%)`;
        updatePageIndicator();
      }
      homeStartX = null;
    }, { passive: true });

    let mouseStartX = null;
    homeScroll.addEventListener('mousedown', e => { mouseStartX = e.clientX; });
    homeScroll.addEventListener('mouseup', e => {
      if (mouseStartX == null) return;
      const dx = e.clientX - mouseStartX;
      if (Math.abs(dx) > 80) {
        if (dx < 0 && currentPage < totalPages - 1) currentPage++;
        else if (dx > 0 && currentPage > 0) currentPage--;
        homePages.style.transform = `translateX(-${currentPage * 100}%)`;
        updatePageIndicator();
      }
      mouseStartX = null;
    });
  }

  /* ============================================================
     三十九、初始化
     ============================================================ */
  function init(){
    const splash = $('#splashScreen');
    if (state.settings.splashImage) {
      splash.style.backgroundImage = `url("${state.settings.splashImage}")`;
      splash.style.backgroundSize = 'cover';
      splash.style.backgroundPosition = 'center';
    }
    setTimeout(() => splash.classList.add('hide'), 1200);

    initEmojiPanel();
    applySettings();

    if (!state.cards.length) {
      ['嗯嗯，我在听～ | w:2',
       '哈哈哈哈你怎么这么可爱',
       '今天也要好好吃饭哦 🍚 | time:day',
       '突然有点想你了 | w:3',
       '夜深了，早点睡吧 🌙 | time:night',
       '和你在一起真开心 | mood:high',
       '还好吗？ | mood:low'].forEach(addCard);
      saveState();
    }
    if (!state.favorites.length) {
      state.favorites.push(
        { id: uid(), title: '我们的第一次对话', desc: '永远记得那天', ts: nowTime() },
        { id: uid(), title: '最喜欢的一句话', desc: '你说会一直陪着我', ts: nowTime() }
      );
    }
    if (!state.questions.length) {
      state.questions.push({
        id: uid(), title: '今晚想吃什么？',
        options: ['火锅', '烧烤', '日料', '随便'],
        multi: false, createdAt: nowTime()
      });
    }
    if (!state.music.length) {
      state.music.push({
        id: uid(), title: '示例音乐',
        link: 'https://music.example.com/song',
        group: 'default', createdAt: nowTime()
      });
    }

    bindEvents();
    renderAll();
    showView('viewHome');
    startCountdownTicker();

    // 梦角状态随机切换
    setInterval(() => {
      const c = state.characters[0];
      if (!c) return;
      const pool = ['online', 'away', 'busy'];
      c.status = pool[Math.floor(Math.random() * pool.length)];
      c.lastStatusSwitch = nowTime();
      saveState();
      renderSessionList();
      if ($('#viewChat').classList.contains('active')) {
        const status = STATUS_LABELS[c.status];
        $('#chatPeerSub').innerHTML = `<span class="status-dot ${STATUS_COLORS[c.status]}"></span>${status}`;
      }
      if ($('#viewCharacters').classList.contains('active')) renderCharacters();
    }, PROB.STATUS_SWITCH_MS);

    // 梦角自动发朋友圈
    setInterval(() => {
      if (Math.random() < 0.3 && state.cards.length) {
        const card = pickCard();
        if (card) {
          state.moments.unshift({
            id: uid(), text: card.text, images: [], likes: [], comments: [],
            likedByMe: false, fromTa: true, ts: nowTime()
          });
          saveState();
          if ($('#viewMoments').classList.contains('active')) renderMoments();
        }
      }
    }, 180000);

    // 自动来电
    setInterval(() => {
      if ($('#viewHome').classList.contains('active') && !callState.active && Math.random() < 0.08) {
        triggerIncomingCall();
      }
    }, 60000);

    if (!storageOK) {
      setTimeout(() => toast('当前环境不支持本地存储，请下载到本地打开'), 1600);
    }

    window.addEventListener('error', (e) => {
      console.error('[global]', e.error || e.message);
    });

    window.PrivateSpace = {
      getState: () => state,
      save: () => saveState(true),
      render: renderAll,
      applySettings
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();