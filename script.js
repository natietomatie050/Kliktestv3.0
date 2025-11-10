 (cd "$(git rev-parse --show-toplevel)" && git apply --3way <<'EOF' 
diff --git a/script.js b/script.js
new file mode 100644
index 0000000000000000000000000000000000000000..2ece9db927fae5faea637e43180bf45d95ce5824
--- /dev/null
+++ b/script.js
@@ -0,0 +1,146 @@
+const clickRows = document.querySelector('#click-rows');
+const summaryEl = document.querySelector('.results__summary');
+const tableEl = document.querySelector('.results__table');
+const exportButton = document.querySelector('#export-json');
+const buttonGrid = document.querySelector('.button-grid');
+
+const statElements = {
+  total: document.querySelector('#total-count'),
+  'knop-a': document.querySelector('#count-knop-a'),
+  'knop-b': document.querySelector('#count-knop-b'),
+};
+
+const clickLog = [];
+
+function formatTimeStamp(date) {
+  return date.toLocaleString('nl-NL', {
+    hour: '2-digit',
+    minute: '2-digit',
+    second: '2-digit',
+    fractionalSecondDigits: 3,
+  });
+}
+
+function downloadFile(filename, contents) {
+  const blob = new Blob([contents], { type: 'application/json' });
+  const url = URL.createObjectURL(blob);
+  const link = document.createElement('a');
+  link.href = url;
+  link.download = filename;
+  document.body.appendChild(link);
+  link.click();
+  document.body.removeChild(link);
+  URL.revokeObjectURL(url);
+}
+
+function updateStats() {
+  const total = clickLog.length;
+  const perButton = clickLog.reduce((accumulator, entry) => {
+    const next = accumulator;
+    next[entry.id] = (next[entry.id] ?? 0) + 1;
+    return next;
+  }, {});
+
+  statElements.total?.textContent = total.toString();
+  statElements['knop-a']?.textContent = (perButton['knop-a'] ?? 0).toString();
+  statElements['knop-b']?.textContent = (perButton['knop-b'] ?? 0).toString();
+
+  if (!summaryEl || !exportButton) {
+    return;
+  }
+
+  if (total === 0) {
+    summaryEl.textContent = 'Nog geen klikken geregistreerd.';
+    exportButton.disabled = true;
+    exportButton.textContent = 'Download als JSON';
+    return;
+  }
+
+  const lastEntry = clickLog[clickLog.length - 1];
+  summaryEl.textContent = `Laatste klik: ${lastEntry.label} om ${formatTimeStamp(
+    lastEntry.timestamp,
+  )}`;
+  exportButton.disabled = false;
+  exportButton.textContent = `Download ${total} registraties`;
+}
+
+function renderTable() {
+  if (!clickRows || !tableEl) {
+    return;
+  }
+
+  updateStats();
+
+  if (clickLog.length === 0) {
+    tableEl.hidden = true;
+    clickRows.replaceChildren();
+    return;
+  }
+
+  tableEl.hidden = false;
+
+  const fragment = document.createDocumentFragment();
+
+  clickLog.forEach((entry, index) => {
+    const row = document.createElement('tr');
+
+    const indexCell = document.createElement('td');
+    indexCell.textContent = index + 1;
+    row.appendChild(indexCell);
+
+    const buttonCell = document.createElement('td');
+    buttonCell.textContent = entry.label;
+    row.appendChild(buttonCell);
+
+    const timeCell = document.createElement('td');
+    timeCell.textContent = formatTimeStamp(entry.timestamp);
+    row.appendChild(timeCell);
+
+    fragment.appendChild(row);
+  });
+
+  clickRows.replaceChildren(fragment);
+}
+
+function handleClick(event) {
+  const target = event.target;
+  if (!(target instanceof HTMLButtonElement)) {
+    return;
+  }
+
+  if (target === exportButton) {
+    return;
+  }
+
+  const label = target.textContent?.trim() ?? 'Onbekende knop';
+  const identifier = target.dataset.id ?? 'onbekend';
+  const timestamp = new Date();
+
+  clickLog.push({ id: identifier, label, timestamp });
+  renderTable();
+}
+
+function handleExport() {
+  if (clickLog.length === 0) {
+    return;
+  }
+
+  const exportData = clickLog.map((entry) => ({
+    id: entry.id,
+    label: entry.label,
+    timestamp: entry.timestamp.toISOString(),
+  }));
+
+  const json = JSON.stringify(exportData, null, 2);
+  const safeTimestamp = new Date().toISOString().replace(/[:]/g, '-');
+  const filename = `klikdata-${safeTimestamp}.json`;
+  downloadFile(filename, json);
+}
+
+function init() {
+  buttonGrid?.addEventListener('click', handleClick);
+  exportButton?.addEventListener('click', handleExport);
+  renderTable();
+}
+
+document.addEventListener('DOMContentLoaded', init);
 
EOF
)