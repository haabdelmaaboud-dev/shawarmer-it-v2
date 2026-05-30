// Shawarmer IT — State Management
const STATE = {
  db: {
    stores: [],
    users: [],
    lists: { engineers:[], ops:[], areas:[], devices:[] },
    contacts: {}
  },
  currentUser: null,
  notifications: [],
  activities: [],
  checkedToday: new Set(),

  init() {
    const stored = localStorage.getItem('notifs');
    if (stored) {
      try { this.notifications = JSON.parse(stored); } catch(e) {}
    }
    const acts = localStorage.getItem('activities');
    if (acts) {
      try { this.activities = JSON.parse(acts); } catch(e) {}
    }
  },

  myStores() {
    if (!this.currentUser) return [];

    const stores = this.db.stores || [];
    const user = this.currentUser;
    const userName = user.name || user.username || '';
    const userRef = user.ref || userName;

    // Admin sees all
    if (user.role === 'admin') return stores;

    // Engineer sees only their stores
    if (user.role === 'engineer') {
      return stores.filter(s => {
        const engName = (s.eng || '').trim().toLowerCase();
        const myName = userName.trim().toLowerCase();
        const myRef = (userRef || '').trim().toLowerCase();
        return engName === myName || engName === myRef || engName.includes(myName) || myName.includes(engName);
      });
    }

    // Area Manager sees stores in their area
    if (user.role === 'area') {
      return stores.filter(s => {
        const areaName = (s.area || '').trim().toLowerCase();
        const myName = userName.trim().toLowerCase();
        const myRef = (userRef || '').trim().toLowerCase();
        return areaName === myName || areaName === myRef || areaName.includes(myName) || myName.includes(areaName);
      });
    }

    // Ops Manager sees stores under their ops
    if (user.role === 'ops') {
      return stores.filter(s => {
        const opsName = (s.ops || '').trim().toLowerCase();
        const myName = userName.trim().toLowerCase();
        const myRef = (userRef || '').trim().toLowerCase();
        return opsName === myName || opsName === myRef || opsName.includes(myName) || myName.includes(opsName);
      });
    }

    return [];
  },

  devList() {
    return this.db.lists.devices || CONFIG.deviceFields;
  },

  isAdmin() {
    return this.currentUser?.role === 'admin';
  },

  isEngineer() {
    return this.currentUser?.role === 'engineer';
  },

  canEdit(store) {
    if (!this.currentUser) return false;
    if (this.currentUser.role === 'admin') return true;
    if (this.currentUser.role === 'engineer') {
      return store.eng === this.currentUser.name || store.eng === this.currentUser.ref;
    }
    return false;
  },

  hasIssue(store) {
    return CONFIG.deviceFields.some(d => !store[d]);
  },

  healthLabel(store) {
    const working = CONFIG.deviceFields.filter(d => store[d]).length;
    if (working === 5) return 'healthy';
    if (working >= 3) return 'warning';
    return 'critical';
  },

  pct(store) {
    const working = CONFIG.deviceFields.filter(d => store[d]).length;
    return working * CONFIG.devicePoints;
  },

  isCheckedToday(storeId) {
    return this.checkedToday.has(String(storeId));
  },

  markChecked(storeId) {
    this.checkedToday.add(String(storeId));
  },

  getEngineerStats() {
    const stores = this.myStores();
    const total = stores.length;
    const checked = stores.filter(s => this.isCheckedToday(s.id)).length;
    const critical = stores.filter(s => this.healthLabel(s) === 'critical').length;
    const remaining = total - checked;
    const pct = total ? Math.round(checked / total * 100) : 0;
    return { total, checked, critical, remaining, pct };
  },

  getRecentActivities(limit = 10) {
    return this.activities.slice(-limit).reverse();
  },

  addActivity(type, store, details) {
    this.activities.push({
      type,
      storeId: store?.id,
      branch: store?.branch,
      details,
      timestamp: Date.now()
    });
    localStorage.setItem('activities', JSON.stringify(this.activities.slice(-100)));
  },

  getInsights() {
    const stores = this.myStores();
    const critical = stores.filter(s => this.healthLabel(s) === 'critical');
    if (critical.length) {
      return [{ text: `${critical.length} stores require immediate attention. Check Critical tab.` }];
    }
    const unchecked = stores.filter(s => !this.isCheckedToday(s.id));
    if (unchecked.length) {
      return [{ text: `${unchecked.length} stores pending daily check.` }];
    }
    return [{ text: 'All stores are healthy! Great work today.' }];
  },

  unreadCount() {
    return this.notifications.filter(n => !n.read).length;
  },

  addNotification(msg, type, storeId) {
    const n = { id: Date.now(), msg, type, storeId, ts: Date.now(), read: false };
    this.notifications.unshift(n);
    localStorage.setItem('notifs', JSON.stringify(this.notifications.slice(0, 50)));
    return n;
  }
};

STATE.init();
