/* =====================================================
   views/dashboard.js — Fully redesigned per UI/UX spec
   Engineer view: Daily Mission + Heat Grid + Activity
   Admin/Area view: Full ops command center
   ===================================================== */
const DashboardView = {
  render() {
    const u      = STATE.currentUser;
    const stores = STATE.myStores();
    const stats  = STATE.dailyStats();

    if (u.role === 'engineer') return DashboardView.engineerView(stores, stats);
    return DashboardView.managerView(stores, stats);
  },

  engineerView(stores, stats) {
    const critical = stores.filter(s => STATE.healthLabel(s) === 'critical');
    const recent   = (STATE.daily.checkedIds || []).slice(-5).reverse()
      .map(id => stores.find(s => String(s.id) === id)).filter(Boolean);

    return `
      <div class="dash-greeting">
        <div class="greeting-left">
          <h2>${UI.greeting(STATE.currentUser.name)} 👋</h2>
          <p>Here's your daily mission for today.</p>
        </div>
        <button class="btn btn-brand" id="startDayBtn" onclick="APP.startDay()">
          <i class="ti ti-player-play"></i> Start Day
        </button>
      </div>

      <!-- Daily Mission -->
      <div class="mission-card">
        <div class="mission-ring">${UI.progressRing(stats.pct)}</div>
        <div class="mission-stats">
          <div class="mission-row"><span class="mission-dot green"></span><span>Checked</span><strong>${stats.checked}</strong><span style="color:var(--success)">↗ ${stats.pct}%</span></div>
          <div class="mission-row"><span class="mission-dot gray"></span><span>Remaining</span><strong>${stats.remaining}</strong></div>
          <div class="mission-row"><span class="mission-dot red"></span><span>Critical</span><strong style="color:var(--danger)">${stats.critical}</strong></div>
          <div class="mission-row streak-row">
            <span>🔥 Current Streak</span><strong>${DashboardView.getStreak()} Days</strong>
          </div>
        </div>
      </div>

      <!-- KPI row -->
      <div class="kpi-grid" style="grid-template-columns:repeat(4,1fr)">
        ${UI.kpiCard({ icon:'ti-building-store',  iconClass:'kpi-burg',  label:'Total Stores',  value:stats.total,    sub:'Assigned to you' })}
        ${UI.kpiCard({ icon:'ti-circle-check',     iconClass:'kpi-green', label:'Checked Today', value:stats.checked,  sub:`${stats.pct}% Completed` })}
        ${UI.kpiCard({ icon:'ti-alert-circle',     iconClass:'kpi-red',   label:'Critical',      value:stats.critical, sub:'Require action' })}
        ${UI.kpiCard({ icon:'ti-flag',             iconClass:'kpi-amber', label:'Need Visit',    value:stores.filter(s=>s.issueStatus==='open'&&STATE.hasIssue(s)).length, sub:'On-site visit' })}
      </div>

      <!-- Store health grid -->
      <div class="section-card">
        <div class="section-hdr">
          <div class="section-title"><i class="ti ti-grid-3x3"></i> Store Health Overview</div>
          <button class="btn-link" onclick="APP.showTab('stores')">View All</button>
        </div>
        ${UI.heatGrid(stores)}
      </div>

      <!-- Critical stores + Recent activity -->
      <div class="dash-split">
        <div class="section-card">
          <div class="section-hdr">
            <div class="section-title"><i class="ti ti-alert-circle"></i> Critical Stores</div>
            <button class="btn-link" onclick="APP.showTab('critical')">View All</button>
          </div>
          ${critical.length
            ? critical.slice(0,5).map(s => UI.criticalItem(s)).join('')
            : '<div class="empty-mini"><i class="ti ti-circle-check"></i> All stores healthy</div>'}
        </div>
        <div class="section-card">
          <div class="section-hdr">
            <div class="section-title"><i class="ti ti-activity"></i> Recent Activity</div>
          </div>
          ${recent.length
            ? recent.map(s => `<div class="activity-item">
                <div class="activity-time">${STATE.isCheckedToday(s.id)?'✓':''}</div>
                <div class="activity-icon-wrap success"><i class="ti ti-circle-check"></i></div>
                <div class="activity-content"><div class="activity-text">Checked <strong>${s.branch}</strong></div></div>
                <span class="activity-status success">Done</span>
              </div>`).join('')
            : '<div class="empty-mini"><i class="ti ti-clock"></i> No activity yet today</div>'}
        </div>
      </div>`;
  },

  managerView(stores, stats) {
    const critical = stores.filter(s => STATE.healthLabel(s) === 'critical');
    const devs     = STATE.devList();
    const byEng    = {};
    stores.forEach(s => {
      if (!byEng[s.eng]) byEng[s.eng] = { t:0, ok:0, checked:0 };
      byEng[s.eng].t++;
      if (!STATE.hasIssue(s)) byEng[s.eng].ok++;
      if (STATE.isCheckedToday(s.id)) byEng[s.eng].checked++;
    });

    const topIssues = devs.map(d => ({
      d, n: stores.filter(s => !s[d]).length,
      icon: { DMB:'ti-device-tv', Kitchen:'ti-tools-kitchen', POS:'ti-cash-register', Kiosk:'ti-device-tablet', Tablet:'ti-device-mobile' }[d] || 'ti-device-laptop'
    })).filter(x => x.n > 0).sort((a,b) => b.n - a.n);

    return `
      <div class="dash-greeting">
        <div class="greeting-left">
          <h2>${UI.greeting(STATE.currentUser.name)} 👋</h2>
          <p>Here's what's happening with your stores today.</p>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-secondary" onclick="APP.showTab('reports')"><i class="ti ti-download"></i> Export</button>
          <button class="btn btn-brand" onclick="MODALS.openAddStore()"><i class="ti ti-plus"></i> Add Store</button>
        </div>
      </div>

      <!-- KPI cards -->
      <div class="kpi-grid">
        ${UI.kpiCard({ icon:'ti-building-store', iconClass:'kpi-burg',  label:'Total Stores',   value:stats.total,    sub:'Assigned to you' })}
        ${UI.kpiCard({ icon:'ti-circle-check',   iconClass:'kpi-green', label:'Checked Today',  value:stats.checked,  sub:`${stats.pct}% Completed` })}
        ${UI.kpiCard({ icon:'ti-alert-circle',   iconClass:'kpi-red',   label:'Critical Stores',value:stats.critical, sub:'Require immediate action' })}
        ${UI.kpiCard({ icon:'ti-flag',           iconClass:'kpi-amber', label:'Need Visit',      value:stores.filter(s=>s.issueStatus==='open'&&STATE.hasIssue(s)).length, sub:'On-site visit required' })}
      </div>

      <!-- Main 3-col grid -->
      <div class="dash-main-grid">

        <!-- Engineer progress -->
        <div class="section-card">
          <div class="section-hdr">
            <div class="section-title"><i class="ti ti-chart-pie"></i> Engineer Progress</div>
            <button class="btn-link" onclick="APP.showTab('engineers')">View All</button>
          </div>
          ${DashboardView.engineerProgressRing(byEng, stats)}
          <div class="eng-list">
            ${Object.entries(byEng).map(([name, d]) => {
              const pct = d.t ? Math.round(d.ok/d.t*100) : 0;
              return `<div class="eng-prog-row">
                <div class="eng-av">${UI.initials(name)}</div>
                <div class="eng-prog-info">
                  <div class="eng-prog-name">${name}</div>
                  <div class="eng-prog-bar"><div class="eng-prog-fill ${pct<50?'crit':pct<80?'warn':''}" style="width:${pct}%"></div></div>
                </div>
                <span class="eng-prog-pct">${pct}%</span>
              </div>`;
            }).join('')}
          </div>
        </div>

        <!-- Heat grid -->
        <div class="section-card">
          <div class="section-hdr">
            <div class="section-title"><i class="ti ti-grid-3x3"></i> Store Health Overview</div>
            <button class="btn-link" onclick="APP.showTab('stores')">View All</button>
          </div>
          ${UI.heatGrid(stores)}
        </div>

        <!-- Daily mission + top issues -->
        <div style="display:flex;flex-direction:column;gap:14px">
          <div class="section-card">
            <div class="section-hdr"><div class="section-title"><i class="ti ti-target"></i> Daily Mission</div></div>
            <div class="daily-mission-list">
              <div class="dm-row"><i class="ti ti-building-store"></i><span>Total Stores</span><strong>${stats.total}</strong></div>
              <div class="dm-row ok"><i class="ti ti-check"></i><span>Checked</span><strong>${stats.checked}</strong><span style="color:var(--success)">${stats.pct}%</span></div>
              <div class="dm-row"><i class="ti ti-clock"></i><span>Remaining</span><strong>${stats.remaining}</strong></div>
              <div class="dm-row crit"><i class="ti ti-alert-circle"></i><span>Critical</span><strong style="color:var(--danger)">${stats.critical}</strong></div>
              <div class="dm-row"><i class="ti ti-flag"></i><span>Need Visit</span><strong>${stores.filter(s=>s.issueStatus==='open'&&STATE.hasIssue(s)).length}</strong></div>
            </div>
            <button class="btn btn-brand full-btn" onclick="APP.showTab('stores')">
              <i class="ti ti-arrow-right"></i> View My Stores
            </button>
          </div>

          <div class="section-card">
            <div class="section-hdr">
              <div class="section-title"><i class="ti ti-trending-up"></i> Top Issues Today</div>
              <button class="btn-link" onclick="APP.showTab('critical')">View All</button>
            </div>
            ${topIssues.length
              ? topIssues.slice(0,4).map(({d,n,icon}) => `
                <div class="top-issue-row">
                  <div class="ti-icon-wrap"><i class="ti ${icon}"></i></div>
                  <span>${d} Offline</span>
                  <strong style="color:var(--danger);margin-left:auto">${n}</strong>
                </div>`).join('')
              : '<div class="empty-mini"><i class="ti ti-circle-check"></i> No device issues</div>'}
            <div class="insight-card">
              <i class="ti ti-bulb" style="color:var(--warning)"></i>
              <span>${DashboardView.getInsight(stores)}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Bottom row -->
      <div class="dash-split">
        <!-- Critical stores -->
        <div class="section-card">
          <div class="section-hdr">
            <div class="section-title"><i class="ti ti-alert-triangle"></i> Critical Stores</div>
            <button class="btn-link" onclick="APP.showTab('critical')">View All</button>
          </div>
          ${critical.length
            ? critical.slice(0,5).map(s => UI.criticalItem(s)).join('')
            : '<div class="empty-mini"><i class="ti ti-circle-check"></i> All stores operational</div>'}
        </div>

        <!-- Recent activity -->
        <div class="section-card">
          <div class="section-hdr">
            <div class="section-title"><i class="ti ti-activity"></i> Recent Activity</div>
            <button class="btn-link" onclick="APP.showTab('auditlog')">View All</button>
          </div>
          <div id="activityFeed">
            <div class="loading-block"><div class="spinner"></div></div>
          </div>
        </div>
      </div>`;
  },

  engineerProgressRing(byEng, stats) {
    const pct = stats.pct;
    return `<div style="display:flex;align-items:center;justify-content:center;margin-bottom:14px">
      ${UI.progressRing(pct, 120)}
    </div>
    <div style="display:flex;gap:14px;margin-bottom:14px;font-size:12px">
      <div class="streak-mini"><span>🔥 ${DashboardView.getStreak()} Days</span><span>Current Streak</span></div>
      <div class="streak-mini"><span>📈 ${stats.pct}%</span><span>Weekly Completion</span></div>
    </div>`;
  },

  getStreak() {
    return parseInt(localStorage.getItem('shawarmer_streak') || '0');
  },

  getInsight(stores) {
    const devs = STATE.devList();
    const posIssues = stores.filter(s => !s.POS).length;
    if (posIssues > 3) return `<strong>${posIssues} stores</strong> have repeated POS issues this week.`;
    const unchecked = stores.filter(s => !STATE.isCheckedToday(s.id)).length;
    if (unchecked > 5) return `<strong>${unchecked} stores</strong> haven't been checked today.`;
    return `System performance improved. Keep up the great work!`;
  }
};

// Load activity feed asynchronously after render
setTimeout(async () => {
  const el = document.getElementById('activityFeed');
  if (!el) return;
  try {
    const res = await API.getAuditLog({ limit: 5 });
    const log = (res.data || res || []).slice(0, 5);
    if (!log.length) { el.innerHTML = '<div class="empty-mini"><i class="ti ti-clock"></i> No recent activity</div>'; return; }
    el.innerHTML = log.map(entry => UI.activityItem({
      timestamp: entry.timestamp,
      type:      entry.type === 'STORE_UPDATE' ? 'check' : entry.type === 'STORE_ADD' ? 'check' : 'issue',
      details:   entry.detail || entry.type
    })).join('');
  } catch(e) {
    el.innerHTML = '<div class="empty-mini">Could not load activity</div>';
  }
}, 300);
