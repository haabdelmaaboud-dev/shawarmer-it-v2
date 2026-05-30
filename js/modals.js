// Shawarmer IT — Modals & Communication
const COMM = {
  openStoreCommunication(storeId) {
    const store = STATE.db.stores.find(s => String(s.id) === String(storeId));
    if (!store) return;

    const phone = store.branchManagerPhone || store.supervisorPhone || store.areaManagerPhone;
    if (phone) {
      window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}`, '_blank');
    } else {
      UI.toast('No phone number available', 'warn');
    }
  }
};
