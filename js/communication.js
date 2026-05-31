/* =====================================================
   communication.js — WhatsApp + branch contact system
   ===================================================== */
const COMM = {

  openStoreCommunication(storeId) {
    const store = STATE.db.stores.find(s => String(s.id) === String(storeId));
    if (!store) { UI.toast('Store not found', 'err'); return; }

    const devs    = STATE.devList();
    const issues  = devs.filter(d => !store[d]);
    const working = devs.filter(d =>  store[d]);
    const score   = STATE.pct(store);
    const user    = STATE.currentUser;

    const statusLines = devs.map(d =>
      `${store[d] ? '✅' : '❌'} ${d}`
    ).join('\n');

    const branchMsg = encodeURIComponent(
      `🏪 *Store Check — ${store.branch}*\n` +
      `👷 Engineer: ${user?.name || 'IT Engineer'}\n` +
      `📅 Date: ${new Date().toLocaleDateString()}\n\n` +
      `*Device Status:*\n${statusLines}\n\n` +
      `📊 Health Score: ${score}%\n` +
      (store.notes ? `📝 Notes: ${store.notes}\n` : '') +
      `\n_Sent via Shawarmer IT Operations_`
    );

    const areaMsg = encodeURIComponent(
      `📋 *Branch Update — ${store.branch}*\n` +
      `👷 Engineer: ${user?.name || 'IT Engineer'}\n` +
      `📅 Date: ${new Date().toLocaleDateString()}\n\n` +
      (issues.length > 0
        ? `⚠️ *Issues Found (${issues.length}):*\n${issues.map(d=>`❌ ${d} offline`).join('\n')}\n\n`
        : `✅ *All devices working*\n\n`) +
      `📊 Health Score: ${score}%\n` +
      (store.notes ? `📝 Notes: ${store.notes}` : '') +
      `\n_Sent via Shawarmer IT Operations_`
    );

    const phoneField = (label, fieldId, msg, phone) => `
      <div class="contact-row">
        <div class="contact-info">
          <div class="contact-label">${label}</div>
          <div class="contact-name" id="${fieldId}-name">${store[fieldId+'Name'] || '—'}</div>
          <div class="contact-phone">${store[fieldId+'Phone'] || 'No phone saved'}</div>
        </div>
        ${store[fieldId+'Phone']
          ? `<a class="btn btn-whatsapp" href="https://wa.me/${store[fieldId+'Phone'].replace(/[^0-9]/g,'')}?text=${msg}" target="_blank">
              <i class="ti ti-brand-whatsapp"></i> WhatsApp
            </a>`
          : `<span class="btn-disabled">No phone</span>`}
      </div>`;

    UI.openModal(`Contact — ${store.branch}`,
      `<div class="store-info-block">
        <div class="sib-name">${store.branch}</div>
        <div class="sib-meta">Score: ${score}% · ${issues.length > 0 ? `${issues.length} issue${issues.length>1?'s':''}` : 'All OK'}</div>
      </div>

      <div class="section-div">Branch Contacts</div>
      ${phoneField('Branch Manager',  'branchManager',  branchMsg, 'branchManager')}
      ${phoneField('Supervisor',      'supervisor',     branchMsg, 'supervisor')}
      ${phoneField('Area Manager',    'areaManager',    areaMsg,   'areaManager')}

      <div class="section-div">Send Message</div>
      <div style="display:flex;flex-direction:column;gap:8px">
        <a class="btn btn-whatsapp-full" href="https://wa.me/?text=${branchMsg}" target="_blank">
          <i class="ti ti-brand-whatsapp"></i> Send Branch Status Message
        </a>
        <a class="btn btn-whatsapp-outline" href="https://wa.me/?text=${areaMsg}" target="_blank">
          <i class="ti ti-send"></i> Send Area Manager Summary
        </a>
      </div>

      ${STATE.canEdit(store) ? `
        <div class="section-div">Update Contacts</div>
        <div class="form-grid">
          ${UI.formGroup('Branch Manager Name', UI.formInput('bc-mgr-name','text','', store.branchManagerName||''))}
          ${UI.formGroup('Branch Manager Phone', UI.formInput('bc-mgr-phone','tel','+966…', store.branchManagerPhone||''))}
          ${UI.formGroup('Supervisor Name', UI.formInput('bc-sup-name','text','', store.supervisorName||''))}
          ${UI.formGroup('Supervisor Phone', UI.formInput('bc-sup-phone','tel','+966…', store.supervisorPhone||''))}
        </div>
        <button class="btn btn-secondary btn-sm" onclick="COMM.saveContacts(${store.id})">
          <i class="ti ti-device-floppy"></i> Save Contacts
        </button>` : ''}`,

      `<button class="btn btn-secondary" onclick="UI.closeModal()">Close</button>`
    );
  },

  async saveContacts(storeId) {
    const store = STATE.db.stores.find(s => String(s.id) === String(storeId));
    if (!store) return;
    const fields = {
      branchManagerName:  document.getElementById('bc-mgr-name')?.value  || '',
      branchManagerPhone: document.getElementById('bc-mgr-phone')?.value || '',
      supervisorName:     document.getElementById('bc-sup-name')?.value  || '',
      supervisorPhone:    document.getElementById('bc-sup-phone')?.value || '',
    };
    try {
      await API.updateStore({ ...store, ...fields });
      Object.assign(store, fields);
      UI.toast('Contacts saved', 'ok');
    } catch(e) { UI.toast('Failed: ' + e.message, 'err'); }
  },

  async openAreaSummary() {
    const user   = STATE.currentUser;
    const stores = STATE.myStores();
    const stats  = STATE.dailyStats();
    const devs   = STATE.devList();
    const issues = stores.filter(s => STATE.hasIssue(s));

    const deviceSummary = devs.map(d => {
      const n = stores.filter(s => !s[d]).length;
      return n > 0 ? `❌ ${d}: ${n} stores offline` : `✅ ${d}: All working`;
    }).join('\n');

    const criticalList = issues.slice(0, 5)
      .map(s => `• ${s.branch} (${STATE.pct(s)}%)`)
      .join('\n');

    const msg = encodeURIComponent(
      `📊 *Area IT Summary Report*\n` +
      `👷 By: ${user?.name || 'IT Team'}\n` +
      `📅 ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}\n\n` +
      `*Overview:*\n` +
      `✅ Checked: ${stats.checked}/${stats.total} (${stats.pct}%)\n` +
      `⚠️ With Issues: ${issues.length}\n` +
      `🔴 Critical: ${stats.critical}\n\n` +
      `*Device Health:*\n${deviceSummary}\n\n` +
      (issues.length > 0 ? `*Stores Needing Attention:*\n${criticalList}\n\n` : '') +
      `_Shawarmer IT Operations_`
    );

    UI.openModal('Send Area Summary',
      `<div style="margin-bottom:14px;font-size:13px;color:var(--text-sec)">
        This will open WhatsApp with a pre-filled summary of your area's current IT status.
      </div>
      <div class="store-info-block">
        <div class="sib-meta">
          ${stats.checked}/${stats.total} checked · ${issues.length} issues · ${stats.critical} critical
        </div>
      </div>`,
      `<button class="btn btn-secondary" onclick="UI.closeModal()">Cancel</button>
       <a class="btn btn-brand" href="https://wa.me/?text=${msg}" target="_blank" onclick="UI.closeModal()">
         <i class="ti ti-brand-whatsapp"></i> Open WhatsApp
       </a>`
    );
  }
};
