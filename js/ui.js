// Shawarmer IT — UI Components
const UI = {
  setSync(state, label) {
    const dot = document.getElementById('syncDot');
    const lbl = document.getElementById('syncLabel');
    if (!dot) return;
    dot.className = 'sync-dot' + (state === 'busy' ? ' busy' : state === 'offline' ? ' offline' : '');
    if (lbl) lbl.textContent = label || (state === 'live' ? 'Live' : state === 'busy' ? 'Syncing…' : 'Offline');
  },

  showContentLoader(show) {
    const el = document.getElementById('contentLoader');
    if (el) el.classList.toggle('hidden', !show);
  },

  toast(msg, type = 'info', duration = 4000) {
    const stack = document.getElementById('toastStack');
    if (!stack) return;
    const icons = { ok:'ti-circle-check', err:'ti-alert-circle', info:'ti-info-circle', warn:'ti-alert-triangle' };
    const cls = { ok:'toast-ok', err:'toast-err', info:'toast-info', warn:'toast-warn' };
    const el = document.createElement('div');
    el.className = `toast ${cls[type] || 'toast-info'}`;
    el.innerHTML = `<i class="ti ${icons[type] || 'ti-info-circle'}"></i><span>${msg}</span>`;
    stack.appendChild(el);
    requestAnimationFrame(() => {
      el.classList.add('show');
      setTimeout(() => { el.classList.remove('show'); setTimeout(() => el.remove(), 300); }, duration);
    });
  },

  openModal(title, body, footer) {
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = body;
    document.getElementById('modalFooter').innerHTML = footer || '';
    document.getElementById('modalOverlay').classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  },

  closeModal() {
    document.getElementById('modalOverlay').classList.add('hidden');
    document.body.style.overflow = '';
  },

  confirm(msg, onConfirm, danger = true) {
    UI.openModal(
      'Confirm Action',
      `<div class="confirm-msg"><i class="ti ti-alert-triangle" style="color:var(--warning);font-size:32px"></i><p>${msg}</p></div>`,
      `<button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
       <button class="btn ${danger ? 'btn-danger' : 'btn-brand'}" onclick="(${onConfirm.toString()})();UI.closeModal()">Confirm</button>`
    );
  },

  initials(name) {
    return (name || '').split(' ').map(w => w[0] || '').join('').substring(0, 2).toUpperCase();
  },

  roleLabel(r) { return ROLE_LABELS[r] || r; },
  roleCls(r) { return { admin:'rc-admin', engineer:'rc-eng', area:'rc-area', ops:'rc-ops' }[r] || ''; },

  greeting(name) {
    const h = new Date().getHours();
    let text = 'Good Evening';
    if (h < 12) text = 'Good Morning';
    else if (h < 17) text = 'Good Afternoon';
    return name ? `${text}, ${name.split(' ')[0]}` : text;
  },

  formatDate() {
    const d = new Date();
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    return { day: `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`, weekday: days[d.getDay()] };
  },

  kpiCard({ icon, iconClass, label, value, sub, trend, trendDir }) {
    const trendHtml = trend ? `<span class="kpi-trend ${trendDir}">${trend}</span>` : '';
    return `
      <div class="kpi-card">
        <div class="kpi-header">
          <div class="kpi-icon-wrap ${iconClass}"><i class="ti ${icon}"></i></div>
          ${trendHtml}
        </div>
        <div class="kpi-value">${value}</div>
        <div class="kpi-label">${label}</div>
        ${sub ? `<div class="kpi-sub">${sub}</div>` : ''}
      </div>`;
  },

  progressRing(pct, size = 140) {
    const radius = (size - 16) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (pct / 100) * circumference;
    return `
      <div class="progress-ring-wrap">
        <svg class="progress-ring-svg" width="${size}" height="${size}">
          <circle class="progress-ring-bg" cx="${size/2}" cy="${size/2}" r="${radius}"/>
          <circle class="progress-ring-fill" cx="${size/2}" cy="${size/2}" r="${radius}" 
            stroke-dasharray="${circumference}" stroke-dashoffset="${offset}"/>
        </svg>
        <div class="progress-ring-text">
          <div class="progress-ring-pct">${pct}%</div>
          <div class="progress-ring-label">Completed Today</div>
        </div>
      </div>`;
  },

  activityItem(act) {
    const time = new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    let icon = 'ti-check', cls = 'success', status = 'Completed';
    if (act.type === 'issue') { icon = 'ti-alert-triangle'; cls = 'warning'; status = 'Warning'; }
    else if (act.type === 'critical') { icon = 'ti-alert-circle'; cls = 'danger'; status = 'Critical'; }
    else if (act.type === 'check') { icon = 'ti-circle-check'; cls = 'success'; status = 'Completed'; }
    return `
      <div class="activity-item">
        <div class="activity-time">${time}</div>
        <div class="activity-icon-wrap ${cls}"><i class="ti ${icon}"></i></div>
        <div class="activity-content">
          <div class="activity-text">${act.details || act.type}</div>
        </div>
        <span class="activity-status ${cls}">${status}</span>
      </div>`;
  },

  criticalItem(store) {
    const issues = STATE.devList().filter(d => !store[d]);
    return `
      <div class="critical-item" onclick="StoresView.viewStore(${store.id})">
        <div class="critical-indicator"></div>
        <div class="critical-info">
          <div class="critical-name">${store.branch}</div>
          <div class="critical-meta">${store.area || '—'} · ${store.eng || '—'}</div>
        </div>
        <div class="critical-issues"><i class="ti ti-alert-circle"></i> ${issues.length} Issues</div>
        <div class="critical-time">${store.lastUpdate || '—'}</div>
        <i class="ti ti-chevron-right critical-arrow"></i>
      </div>`;
  },

  deviceToggle(device, checked, idPrefix) {
    const id = `${idPrefix}-${device}`;
    const iconMap = { DMB:'ti-device-tv', Kitchen:'ti-tools-kitchen', POS:'ti-cash-register', Kiosk:'ti-device-tablet', Tablet:'ti-device-mobile' };
    const icon = iconMap[device] || 'ti-device-laptop';
    return `
      <div class="toggle-item ${checked ? 'active' : ''}">
        <div class="toggle-label"><i class="ti ${icon}"></i>${device}</div>
        <label class="toggle-sw">
          <input type="checkbox" id="${id}" ${checked ? 'checked' : ''} onchange="UI.refreshDeviceToggle('${id}')">
          <span class="tog-track"></span>
        </label>
      </div>`;
  },

  refreshDeviceToggle(id) {
    const chk = document.getElementById(id)?.checked;
    const item = document.getElementById(id)?.closest('.toggle-item');
    if (item) item.classList.toggle('active', chk);
  },

  branchRow(store) {
    const devs = STATE.devList();
    const health = STATE.healthLabel(store);
    const issues = devs.filter(d => !store[d]);
    const checked = STATE.isCheckedToday(store.id);

    return `
      <div class="branch-row" onclick="StoresView.viewStore(${store.id})">
        <div class="branch-avatar">${UI.initials(store.branch)}</div>
        <div class="branch-info">
          <div class="branch-name">${store.branch}</div>
          <div class="branch-meta">${store.eng || '—'} · ${store.area || '—'}</div>
        </div>
        <div class="branch-devices">
          ${devs.map(d => `<span class="dev-status ${store[d] ? 'ok' : 'issue'}"><i class="ti ${store[d] ? 'ti-check' : 'ti-x'}"></i> ${d}</span>`).join('')}
        </div>
        <div class="branch-actions">
          <span class="score-pill ${health}">${STATE.pct(store)}%</span>
          <button class="btn btn-sm btn-ghost" onclick="event.stopPropagation();StoresView.contactStore(${store.id})" title="Contact">
            <i class="ti ti-message-circle"></i>
          </button>
          ${STATE.canEdit(store) ? 
            `<button class="btn btn-sm btn-secondary" onclick="event.stopPropagation();StoresView.checkStore(${store.id})"><i class="ti ti-edit"></i></button>` :
            `<button class="btn btn-sm btn-ghost" onclick="event.stopPropagation();StoresView.viewStore(${store.id})"><i class="ti ti-eye"></i></button>`}
        </div>
      </div>`;
  },

  table(headers, rows, emptyMsg = 'No data available') {
    if (!rows.length) return `<div class="empty-state"><i class="ti ti-inbox"></i><p>${emptyMsg}</p></div>`;
    return `
      <div class="table-wrap">
        <table>
          <thead><tr>${headers.map(h => `<th>${h}</th>`).join('')}</tr></thead>
          <tbody>${rows.join('')}</tbody>
        </table>
      </div>`;
  },

  formGroup(label, inputHTML) {
    return `<div class="form-group"><label class="form-label">${label}</label>${inputHTML}</div>`;
  },

  formInput(id, type = 'text', placeholder = '', value = '') {
    return `<input class="form-input" type="${type}" id="${id}" placeholder="${placeholder}" value="${value}">`;
  },

  devChip(val) {
    return val ? '<span class="dev-status ok"><i class="ti ti-check"></i></span>' 
               : '<span class="dev-status issue"><i class="ti ti-x"></i></span>';
  },

  scorePill(store) {
    const pct = STATE.pct(store);
    const cls = pct === 100 ? 'healthy' : pct >= 70 ? 'warning' : 'critical';
    return `<span class="score-pill ${cls}">${pct}%</span>`;
  },

  paginate(items, page, perPage = 25) {
    const total = items.length;
    const pages = Math.ceil(total / perPage);
    const start = (page - 1) * perPage;
    const slice = items.slice(start, start + perPage);
    return { slice, pages, total, page };
  }
};

function closeModal() { UI.closeModal(); }
function handleOverlayClick(e) { if (e.target === document.getElementById('modalOverlay')) UI.closeModal(); }
