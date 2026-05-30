// Shawarmer IT — Reports View with Export
const ReportsView = {
  render() {
    const stores = STATE.myStores();
    const stats = STATE.getEngineerStats();

    return `
      <div class="view-header">
        <h2 class="view-title"><i class="ti ti-file-report"></i> Reports</h2>
        <div class="view-actions">
          <button class="btn btn-sm btn-brand" onclick="ReportsView.exportExcel()">
            <i class="ti ti-file-spreadsheet"></i> Export Excel
          </button>
          <button class="btn btn-sm btn-secondary" onclick="ReportsView.exportPDF()">
            <i class="ti ti-file-type-pdf"></i> Export PDF
          </button>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3><i class="ti ti-chart-bar"></i> Store Health Summary</h3>
        </div>
        <div class="card-body">
          <div class="report-summary">
            <div class="report-stat">
              <div class="report-stat-value">${stores.length}</div>
              <div class="report-stat-label">Total Stores</div>
            </div>
            <div class="report-stat">
              <div class="report-stat-value" style="color:var(--success)">${stores.filter(s => STATE.healthLabel(s) === 'healthy').length}</div>
              <div class="report-stat-label">Healthy</div>
            </div>
            <div class="report-stat">
              <div class="report-stat-value" style="color:var(--warning)">${stores.filter(s => STATE.healthLabel(s) === 'warning').length}</div>
              <div class="report-stat-label">Warning</div>
            </div>
            <div class="report-stat">
              <div class="report-stat-value" style="color:var(--danger)">${stores.filter(s => STATE.healthLabel(s) === 'critical').length}</div>
              <div class="report-stat-label">Critical</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3><i class="ti ti-table"></i> Detailed Report</h3>
        </div>
        <div class="card-body">
          ${this.renderTable(stores)}
        </div>
      </div>`;
  },

  renderTable(stores) {
    const devs = STATE.devList();
    return `
      <div class="table-wrap">
        <table id="reportTable">
          <thead>
            <tr>
              <th>Branch</th>
              <th>Engineer</th>
              <th>Area</th>
              <th>Ops</th>
              ${devs.map(d => `<th>${d}</th>`).join('')}
              <th>Health</th>
              <th>Status</th>
              <th>Last Check</th>
            </tr>
          </thead>
          <tbody>
            ${stores.map(s => `
              <tr>
                <td>${s.branch}</td>
                <td>${s.eng || '—'}</td>
                <td>${s.area || '—'}</td>
                <td>${s.ops || '—'}</td>
                ${devs.map(d => `<td>${s[d] ? '✅' : '❌'}</td>`).join('')}
                <td>${STATE.pct(s)}%</td>
                <td><span class="score-pill ${STATE.healthLabel(s)}">${STATE.healthLabel(s)}</span></td>
                <td>${s.lastCheckAt ? new Date(s.lastCheckAt).toLocaleDateString() : '—'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>`;
  },

  exportExcel() {
    const stores = STATE.myStores();
    const devs = STATE.devList();

    let csv = 'Branch,Engineer,Area,Ops Manager,' + devs.join(',') + ',Health Score,Status,Notes\n';

    stores.forEach(s => {
      csv += `"${s.branch}","${s.eng || ''}","${s.area || ''}","${s.ops || ''}",`;
      csv += devs.map(d => s[d] ? 'OK' : 'Issue').join(',') + ',';
      csv += `${STATE.pct(s)}%,${STATE.healthLabel(s)},"${s.notes || ''}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Shawarmer_Report_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();

    UI.toast('Excel report downloaded!', 'ok');
  },

  exportPDF() {
    const stores = STATE.myStores();
    const devs = STATE.devList();

    let html = `
      <html>
      <head>
        <title>Shawarmer IT Report</title>
        <style>
          body { font-family: Arial; margin: 20px; }
          h1 { color: #6E0F1F; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th { background: #6E0F1F; color: white; padding: 10px; text-align: left; }
          td { padding: 8px; border-bottom: 1px solid #ddd; }
          .healthy { color: #22C55E; }
          .warning { color: #F59E0B; }
          .critical { color: #EF4444; }
        </style>
      </head>
      <body>
        <h1>Shawarmer IT Operations Report</h1>
        <p>Generated: ${new Date().toLocaleString()}</p>
        <p>Total Stores: ${stores.length}</p>
        <table>
          <tr>
            <th>Branch</th><th>Engineer</th><th>Area</th>
            ${devs.map(d => `<th>${d}</th>`).join('')}
            <th>Health</th><th>Status</th>
          </tr>
          ${stores.map(s => `
            <tr>
              <td>${s.branch}</td>
              <td>${s.eng || '—'}</td>
              <td>${s.area || '—'}</td>
              ${devs.map(d => `<td>${s[d] ? '✅' : '❌'}</td>`).join('')}
              <td>${STATE.pct(s)}%</td>
              <td class="${STATE.healthLabel(s)}">${STATE.healthLabel(s).toUpperCase()}</td>
            </tr>
          `).join('')}
        </table>
      </body>
      </html>`;

    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.print();

    UI.toast('PDF report generated!', 'ok');
  }
};
