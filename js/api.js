// Shawarmer IT — API Layer
const API = {
  async call(action, params = {}, retries = 0) {
    const token = localStorage.getItem("shawarmer_token") || "";
    const query = new URLSearchParams({ action, token, ...params });
    const url = `${APP_CONFIG.API_URL}?${query.toString()}`;

    try {
      const response = await fetch(url, { 
        method: "GET",
        headers: { "Accept": "application/json" }
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const data = await response.json();

      if (!data.ok && data.error === "Unauthorized" && retries < APP_CONFIG.MAX_RETRIES) {
        await new Promise(r => setTimeout(r, APP_CONFIG.RETRY_DELAY));
        return this.call(action, params, retries + 1);
      }

      return data;
    } catch (err) {
      if (retries < APP_CONFIG.MAX_RETRIES) {
        await new Promise(r => setTimeout(r, APP_CONFIG.RETRY_DELAY));
        return this.call(action, params, retries + 1);
      }
      throw err;
    }
  },

  async ping() {
    const response = await fetch(`${APP_CONFIG.API_URL}?action=ping`);
    return response.json();
  },

  async verifyLogin(username, password) {
    const response = await fetch(
      `${APP_CONFIG.API_URL}?action=verifyLogin&username=${encodeURIComponent(username)}&password=${encodeURIComponent(password)}`
    );
    return response.json();
  },

  async getAll() {
    return this.call("getAll");
  },

  async getStores() {
    return this.call("getStores");
  },

  async getLists() {
    return this.call("getLists");
  },

  async getStats() {
    return this.call("getStats");
  },

  async getDashboardSummary() {
    return this.call("getDashboardSummary");
  },

  async getAuditLog(filters = {}) {
    return this.call("getAuditLog", filters);
  },

  async getStoreHistory(storeId) {
    return this.call("getHistory", { storeId });
  },

  async getIssues(filters = {}) {
    return this.call("getIssues", filters);
  },

  async getNotifications(filters = {}) {
    return this.call("getNotifications", filters);
  },

  async updateStore(storeData) {
    const user = JSON.parse(localStorage.getItem("shawarmer_user") || "{}");
    return this.call("updateStore", { ...storeData, user: user.username || user.name || "system" });
  },

  async addStore(storeData) {
    const user = JSON.parse(localStorage.getItem("shawarmer_user") || "{}");
    return this.call("addStore", { ...storeData, user: user.username || user.name || "system" });
  },

  async deleteStore(id) {
    const user = JSON.parse(localStorage.getItem("shawarmer_user") || "{}");
    return this.call("deleteStore", { id, user: user.username || user.name || "system" });
  },

  async updateUser(userData) {
    const user = JSON.parse(localStorage.getItem("shawarmer_user") || "{}");
    return this.call("updateUser", { ...userData, by: user.username || "admin" });
  },

  async removeUser(id) {
    const user = JSON.parse(localStorage.getItem("shawarmer_user") || "{}");
    return this.call("removeUser", { id, user: user.username || "admin" });
  },

  async changePassword(id, oldPassword, newPassword) {
    const user = JSON.parse(localStorage.getItem("shawarmer_user") || "{}");
    return this.call("changePassword", { id, oldPassword, newPassword, by: user.username || "admin" });
  },

  async addListItem(list, value) {
    return this.call("addListItem", { list, value });
  },

  async removeListItem(list, value) {
    return this.call("removeListItem", { list, value });
  },

  async logAction(type, detail, storeId) {
    const user = JSON.parse(localStorage.getItem("shawarmer_user") || "{}");
    return this.call("logAction", { type, user: user.username || user.name || "system", detail, storeId });
  }
};
