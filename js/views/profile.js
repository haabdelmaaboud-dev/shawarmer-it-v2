// Shawarmer IT — Profile View
const ProfileView = {
  render() {
    const user = STATE.currentUser || APP.user || {};

    return `
      <div class="view-header">
        <h2 class="view-title"><i class="ti ti-user"></i> Profile</h2>
      </div>

      <div class="card">
        <div class="card-body">
          <div class="profile-header">
            <div class="profile-avatar">${UI.initials(user.name || user.username)}</div>
            <div class="profile-info">
              <div class="profile-name">${user.name || user.username || 'User'}</div>
              <div class="profile-role">${UI.roleLabel(user.role)}</div>
            </div>
          </div>

          <div class="profile-details">
            <div class="profile-row">
              <div class="profile-label">Username</div>
              <div class="profile-value">${user.username || '—'}</div>
            </div>
            <div class="profile-row">
              <div class="profile-label">Role</div>
              <div class="profile-value">${UI.roleLabel(user.role)}</div>
            </div>
            <div class="profile-row">
              <div class="profile-label">Status</div>
              <div class="profile-value"><span class="badge badge-success">Active</span></div>
            </div>
          </div>

          <div class="profile-actions" style="margin-top:24px">
            <button class="btn btn-secondary" onclick="ProfileView.changePassword()">
              <i class="ti ti-lock"></i> Change Password
            </button>
          </div>
        </div>
      </div>`;
  },

  changePassword() {
    UI.toast('Change password coming soon', 'info');
  }
};
