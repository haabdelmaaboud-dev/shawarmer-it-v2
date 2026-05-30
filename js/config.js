// Shawarmer IT — Configuration
const APP_CONFIG = {
  API_URL: "https://script.google.com/macros/s/AKfycbz4gxMy_T7MiyO2tUsIOlJZpTw37wJrhJMoJ_wlVc8k0TL3Gt_J4u5fcCbRMMRDn4iK/exec",
  MAX_RETRIES: 3,
  RETRY_DELAY: 1000,
  LAST_TAB: localStorage.getItem("shawarmer_last_tab") || "dashboard"
};

const NAV_ITEMS = [
  { id: "dashboard", label: "Dashboard", icon: "layout-dashboard", roles: ["admin","engineer","area","ops"] },
  { id: "stores", label: "Stores", icon: "building-store", roles: ["admin","engineer","area","ops"] },
  { id: "critical", label: "Critical", icon: "alert-triangle", roles: ["admin","engineer","area","ops"] },
  { id: "reports", label: "Reports", icon: "file-report", roles: ["admin","ops","area"] },
  { id: "engineers", label: "Engineers", icon: "users", roles: ["admin","ops","area"] },
  { id: "alerts", label: "Alerts", icon: "bell", roles: ["admin","engineer","area","ops"] },
  { id: "auditlog", label: "Audit Log", icon: "history", roles: ["admin"] },
  { id: "history", label: "History", icon: "clock", roles: ["admin","engineer","area","ops"] },
  { id: "admin", label: "Admin", icon: "settings", roles: ["admin"] },
  { id: "profile", label: "Profile", icon: "user", roles: ["admin","engineer","area","ops"] }
];

const ROLE_LABELS = {
  admin: "Administrator",
  engineer: "Engineer",
  area: "Area Manager",
  ops: "Ops Manager"
};

const CONFIG = {
  deviceFields: ["DMB","Kitchen","POS","Kiosk","Tablet"],
  devicePoints: 20,
  criticalDevices: ["POS","Kiosk"]
};
