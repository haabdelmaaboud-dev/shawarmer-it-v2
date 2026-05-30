// Shawarmer IT — Critical View
const CriticalView = {
  render() {
    const stores = STATE.myStores().filter(s => STATE.healthLabel(s) === 'critical');

    return `
      <div class="view-header">
        <h2 class="view-title"><i class="ti ti-alert-triangle"></i> Critical Stores</h2>
        <div class="view-actions">
          <span class="badge badge-danger">${stores.length} Critical</span>
        </div>
      </div>

      <div class="card">
        <div class="card-body">
          ${stores.length ? `
            <div class="critical-list">
              ${stores.map(s => UI.criticalItem(s)).join('')}
            </div>
          ` : `
            <div class="empty-state">
              <i class="ti ti-check-circle"></i>
              <p>No critical stores</p>
              <p class="empty-state-sub">All stores are healthy!</p>
            </div>
          `}
        </div>
      </div>`;
  }
};
