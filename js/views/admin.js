// Shawarmer IT — Admin View
const AdminView = {
  render() {
    if (!STATE.isAdmin()) {
      return `<div class="empty-state"><i class="ti ti-lock"></i><p>Admin access required</p></div>`;
    }

    return `
      <div class="view-header">
        <h2 class="view-title"><i class="ti ti-settings"></i> Admin Panel</h2>
      </div>

      <div class="card">
        <div class="card-body">
          <div class="admin-grid" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px">
            <div class="admin-card" onclick="AdminView.manageUsers()">
              <i class="ti ti-users" style="font-size:32px;color:var(--brand)"></i>
              <div class="admin-card-title">Users</div>
              <div class="admin-card-desc">Manage users and permissions</div>
            </div>
            <div class="admin-card" onclick="AdminView.manageStores()">
              <i class="ti ti-building-store" style="font-size:32px;color:var(--brand)"></i>
              <div class="admin-card-title">Stores</div>
              <div class="admin-card-desc">Add, edit, or remove stores</div>
            </div>
            <div class="admin-card" onclick="AdminView.manageContacts()">
              <i class="ti ti-address-book" style="font-size:32px;color:var(--brand)"></i>
              <div class="admin-card-title">Contacts</div>
              <div class="admin-card-desc">Add manager phone numbers</div>
            </div>
            <div class="admin-card" onclick="AdminView.importData()">
              <i class="ti ti-upload" style="font-size:32px;color:var(--brand)"></i>
              <div class="admin-card-title">Import</div>
              <div class="admin-card-desc">Import stores from Excel</div>
            </div>
          </div>
        </div>
      </div>`;
  },

  manageUsers() {
    UI.toast('User management coming soon', 'info');
  },

  manageStores() {
    const stores = STATE.db.stores;

    UI.openModal(
      'Manage Stores',
      `<div class="store-list-admin">
        ${stores.map(s => `
          <div class="store-admin-item">
            <div class="store-admin-info">
              <div class="store-admin-name">${s.branch}</div>
              <div class="store-admin-meta">${s.eng || '—'} · ${s.area || '—'}</div>
            </div>
            <div class="store-admin-actions">
              <button class="btn btn-sm btn-ghost" onclick="AdminView.editStore(${s.id})"><i class="ti ti-edit"></i></button>
              <button class="btn btn-sm btn-danger" onclick="AdminView.deleteStore(${s.id})"><i class="ti ti-trash"></i></button>
            </div>
          </div>
        `).join('')}
      </div>`,
      `<button class="btn btn-secondary" onclick="UI.closeModal()">Close</button>
       <button class="btn btn-brand" onclick="AdminView.addStore()"><i class="ti ti-plus"></i> Add Store</button>`
    );
  },

  manageContacts() {
    const stores = STATE.db.stores;

    UI.openModal(
      'Manage Contacts',
      `<div class="contact-list-admin">
        <p style="margin-bottom:16px;color:var(--text-sec)">Click on a store to add/edit contact information</p>
        ${stores.map(s => `
          <div class="contact-admin-item" onclick="AdminView.editContact(${s.id})">
            <div class="contact-admin-info">
              <div class="contact-admin-name">${s.branch}</div>
              <div class="contact-admin-phones">
                ${s.branchManagerPhone ? `<span class="phone-tag"><i class="ti ti-phone"></i> BM</span>` : ''}
                ${s.supervisorPhone ? `<span class="phone-tag"><i class="ti ti-phone"></i> SV</span>` : ''}
                ${s.areaManagerPhone ? `<span class="phone-tag"><i class="ti ti-phone"></i> AM</span>` : ''}
                ${!s.branchManagerPhone && !s.supervisorPhone && !s.areaManagerPhone ? '<span class="phone-tag missing">No contacts</span>' : ''}
              </div>
            </div>
            <i class="ti ti-chevron-right"></i>
          </div>
        `).join('')}
      </div>`,
      `<button class="btn btn-secondary" onclick="UI.closeModal()">Close</button>`
    );
  },

  editContact(storeId) {
    const store = STATE.db.stores.find(s => String(s.id) === String(storeId));
    if (!store) return;

    UI.openModal(
      `Edit Contacts — ${store.branch}`,
      `<div class="contact-form">
        <div class="form-group">
          <label class="form-label">Branch Manager Name</label>
          <input class="form-input" id="contact-bm-name" value="${store.branchManagerName || ''}" placeholder="Enter name">
        </div>
        <div class="form-group">
          <label class="form-label">Branch Manager Phone</label>
          <input class="form-input" id="contact-bm-phone" value="${store.branchManagerPhone || ''}" placeholder="+966 5X XXX XXXX">
        </div>
        <div class="form-group">
          <label class="form-label">Supervisor Name</label>
          <input class="form-input" id="contact-sv-name" value="${store.supervisorName || ''}" placeholder="Enter name">
        </div>
        <div class="form-group">
          <label class="form-label">Supervisor Phone</label>
          <input class="form-input" id="contact-sv-phone" value="${store.supervisorPhone || ''}" placeholder="+966 5X XXX XXXX">
        </div>
        <div class="form-group">
          <label class="form-label">Area Manager Name</label>
          <input class="form-input" id="contact-am-name" value="${store.areaManagerName || ''}" placeholder="Enter name">
        </div>
        <div class="form-group">
          <label class="form-label">Area Manager Phone</label>
          <input class="form-input" id="contact-am-phone" value="${store.areaManagerPhone || ''}" placeholder="+966 5X XXX XXXX">
        </div>
      </div>`,
      `<button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
       <button class="btn btn-brand" onclick="AdminView.saveContact(${storeId})"><i class="ti ti-check"></i> Save</button>`
    );
  },

  async saveContact(storeId) {
    const store = STATE.db.stores.find(s => String(s.id) === String(storeId));
    if (!store) return;

    const updates = {
      id: storeId,
      branchManagerName: document.getElementById('contact-bm-name')?.value || '',
      branchManagerPhone: document.getElementById('contact-bm-phone')?.value || '',
      supervisorName: document.getElementById('contact-sv-name')?.value || '',
      supervisorPhone: document.getElementById('contact-sv-phone')?.value || '',
      areaManagerName: document.getElementById('contact-am-name')?.value || '',
      areaManagerPhone: document.getElementById('contact-am-phone')?.value || ''
    };

    try {
      await API.updateStore(updates);

      // Update local state
      Object.assign(store, updates);

      UI.toast('Contacts updated successfully!', 'ok');
      UI.closeModal();
      AdminView.manageContacts();
    } catch(e) {
      UI.toast('Failed to update contacts: ' + e.message, 'err');
    }
  },

  editStore(storeId) {
    UI.toast('Store edit coming soon', 'info');
  },

  deleteStore(storeId) {
    UI.confirm('Are you sure you want to delete this store?', () => {
      API.deleteStore(storeId).then(() => {
        UI.toast('Store deleted', 'ok');
        APP.refreshTab();
      }).catch(e => {
        UI.toast('Failed to delete: ' + e.message, 'err');
      });
    });
  },

  addStore() {
    UI.toast('Add store coming soon', 'info');
  },

  importData() {
    UI.toast('Import feature coming soon', 'info');
  }
};
