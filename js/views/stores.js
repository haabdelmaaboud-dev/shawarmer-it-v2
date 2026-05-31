/* =====================================================
   views/stores.js — My Stores with quick device update
   ===================================================== */
const StoresView = {
  filters: { view:'all', eng:'', area:'', device:'', q:'' },

  render() {
    const base = STATE.myStores();
    const fl   = STATE.applyFilters(base, StoresView.filters);
    const f    = StoresView.filters;
    const u    = STATE.currentUser;
    const stats= STATE.dailyStats();

    const filterBar = `<div class="filter-bar">
      <div class="filter-tabs">
        ${['all','issues','ok','unchecked','critical'].map(v => `
          <button class="filter-tab ${f.view===v?'active':''}" onclick="StoresView.setFilter('view','${v}')">
            ${v==='all'?'All':v==='issues'?'Issues':v==='ok'?'OK':v==='unchecked'?'Unchecked':'Critical'}
          </button>`).join('')}
      </div>
      <div class="filter-row">
        <div class="search-box"><i class="ti ti-search"></i>
          <input class="filter-inp" type="text" placeholder="Search store or number…" value="${f.q}"
            oninput="StoresView.setFilter('q',this.value)">
        </div>
        ${(u.role==='admin'||u.role==='ops') ? `
          <select class="filter-sel" onchange="StoresView.setFilter('eng',this.value)">
            <option value="">All Engineers</option>
            ${[...new Set(base.map(s=>s.eng))].sort().map(e=>`<option ${f.eng===e?'selected':''}>${e}</option>`).join('')}
          </select>` : ''}
        <select class="filter-sel" onchange="StoresView.setFilter('area',this.value)">
          <option value="">All Areas</option>
          ${[...new Set(base.map(s=>s.area))].sort().map(a=>`<option ${f.area===a?'selected':''}>${a}</option>`).join('')}
        </select>
        <select class="filter-sel" onchange="StoresView.setFilter('device',this.value)">
          <option value="">Any Device</option>
          ${STATE.devList().map(d=>`<option value="${d}" ${f.device===d?'selected':''}>${d} issues</option>`).join('')}
        </select>
        ${u.role==='admin' ? `<button class="btn btn-brand btn-sm" onclick="MODALS.openAddStore()"><i class="ti ti-plus"></i> Add</button>` : ''}
      </div>
    </div>`;

    const statusBar = `<div class="status-bar">
      <div class="sync-indicator"><div class="sync-dot"></div> Live sync</div>
      <span class="muted">${fl.length} of ${base.length} stores · ${stats.checked} checked today</span>
    </div>`;

    const rows = fl.map(s => StoresView.storeCard(s)).join('');
    const empty = `<div class="empty-state"><i class="ti ti-search-off"></i><p>No stores match these filters</p></div>`;

    return `
      <div class="view-header">
        <h2 class="view-title"><i class="ti ti-building-store"></i> My Stores</h2>
      </div>
      ${filterBar}
      ${statusBar}
      <div class="stores-list">${fl.length ? rows : empty}</div>`;
  },

  storeCard(s) {
    const devs    = STATE.devList();
    const health  = STATE.healthLabel(s);
    const checked = STATE.isCheckedToday(s.id);
    const pct     = STATE.pct(s);
    const canEdit = STATE.canEdit(s);

    return `<div class="store-card ${health} ${checked?'checked':''}">
      <div class="store-card-left">
        <div class="store-health-dot ${health}"></div>
        <div class="store-card-info">
          <div class="store-card-name">${s.branch}</div>
          <div class="store-card-meta">${s.eng||'—'} · ${s.area||'—'}</div>
          ${s.notes ? `<div class="store-card-note"><i class="ti ti-note"></i> ${String(s.notes).substring(0,50)}${s.notes.length>50?'…':''}</div>` : ''}
        </div>
      </div>
      <div class="store-card-devices">
        ${devs.map(d => `
          <div class="dev-quick-btn ${s[d]?'ok':'issue'}" title="${d}: ${s[d]?'Working':'Issue'}"
            ${canEdit ? `onclick="StoresView.quickToggle(${s.id},'${d}')"` : ''}>
            <i class="ti ${s[d]?'ti-check':'ti-x'}"></i>
            <span>${d}</span>
          </div>`).join('')}
      </div>
      <div class="store-card-right">
        <span class="score-pill ${health==='healthy'?'sp-100':health==='warning'?'sp-80':'sp-low'}">${pct}%</span>
        <div class="store-card-actions">
          ${canEdit
            ? `<button class="btn btn-sm btn-secondary" onclick="MODALS.openEdit(${s.id})"><i class="ti ti-edit"></i></button>`
            : `<button class="btn btn-sm btn-ghost" onclick="MODALS.openView(${s.id})"><i class="ti ti-eye"></i></button>`}
          <button class="btn btn-sm btn-ghost" onclick="COMM.openStoreCommunication(${s.id})" title="Contact">
            <i class="ti ti-message-circle"></i>
          </button>
          <button class="btn btn-sm btn-ghost" onclick="HistoryView.renderForStore(${s.id},'${s.branch.replace(/'/g,"\\'")}')">
            <i class="ti ti-history"></i>
          </button>
        </div>
      </div>
    </div>`;
  },

  setFilter(key, val) {
    StoresView.filters[key] = val;
    const area = document.getElementById('contentArea');
    if (area) area.innerHTML = StoresView.render();
  },

  async quickToggle(storeId, device) {
    const store = STATE.db.stores.find(s => String(s.id) === String(storeId));
    if (!store || !STATE.canEdit(store)) return;

    const newVal = store[device] ? 0 : 1;
    const original = store[device];
    store[device] = newVal; // optimistic update

    // Re-render this card
    const area = document.getElementById('contentArea');
    if (area) area.innerHTML = StoresView.render();

    try {
      const payload = {
        id: store.id, branch: store.branch, eng: store.eng,
        ops: store.ops, area: store.area, notes: store.notes || '',
        DMB: store.DMB, Kitchen: store.Kitchen, POS: store.POS,
        Kiosk: store.Kiosk, Tablet: store.Tablet
      };
      await API.updateStore(payload);
      STATE.markChecked(storeId);
      UI.toast(`${device} updated for ${store.branch}`, 'ok');
    } catch(e) {
      store[device] = original; // rollback
      if (area) area.innerHTML = StoresView.render();
      UI.toast('Update failed: ' + e.message, 'err');
    }
  }
};
