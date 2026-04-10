// Global variables
let jiraData = [];
let chartsInitialized = false;
let completedByTypeChart = null;
let intakesCompletedChart = null;
let requestsPerSquadChart = null;

// Check login status
window.addEventListener('load', () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  if (!isLoggedIn) {
    window.location.href = 'login.html';
    return;
  }
  
  // Display username
  const username = localStorage.getItem('username');
  const userDisplay = document.getElementById('userDisplay');
  if (userDisplay) {
    userDisplay.textContent = `Welcome, ${username}`;
  }

  // Load saved Jira data if exists
  loadSavedJiraData();
  updateStatistics();
});

function handleCSVUpload(event) {
  const file = event.target.files[0];
  const errorDiv = document.getElementById('uploadError');
  errorDiv.style.display = 'none';

  if (!file) {
    return;
  }

  const reader = new FileReader();
  reader.onload = function(e) {
    try {
      const csv = e.target.result;
      const lines = csv.trim().split('\n');
      
      if (lines.length < 2) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = 'Error: CSV file must contain headers and at least one data row';
        errorDiv.style.color = '#ff6b6b';
        return;
      }

      // Parse CSV
      jiraData = parseCSV(lines);
      
      if (jiraData.length === 0) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = 'Error: Could not parse CSV file. Check your file format.';
        errorDiv.style.color = '#ff6b6b';
        return;
      }

      // Save to localStorage
      localStorage.setItem('jiraData', JSON.stringify(jiraData));

      // Update display
      displayJiraTable();
      updateCharts();
      updateStatistics();
      
      // Success message
      errorDiv.style.display = 'block';
      errorDiv.textContent = `Successfully loaded ${jiraData.length} Jira issues`;
      errorDiv.style.color = '#51cf66';
      
      setTimeout(() => {
        errorDiv.style.display = 'none';
      }, 3000);
    } catch (error) {
      errorDiv.style.display = 'block';
      errorDiv.textContent = `Error: ${error.message}`;
      errorDiv.style.color = '#ff6b6b';
    }
  };
  reader.readAsText(file);
}

function parseCSV(lines) {
  // Parse header
  const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
  
  // Required column indices
  const keyIndex = headers.findIndex(h => h.includes('issue') || h === 'key');
  const summaryIndex = headers.findIndex(h => h.includes('summary'));
  const statusIndex = headers.findIndex(h => h.includes('status'));
  const priorityIndex = headers.findIndex(h => h.includes('priority'));
  const assigneeIndex = headers.findIndex(h => h.includes('assignee'));
  const createdIndex = headers.findIndex(h => h.includes('created'));
  const updatedIndex = headers.findIndex(h => h.includes('updated'));

  const data = [];
  
  // Parse data rows
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const values = parseCSVLine(line);
    
    if (values.length > 0) {
      data.push({
        key: keyIndex >= 0 ? values[keyIndex] : '',
        summary: summaryIndex >= 0 ? values[summaryIndex] : '',
        status: statusIndex >= 0 ? values[statusIndex] : '',
        priority: priorityIndex >= 0 ? values[priorityIndex] : '',
        assignee: assigneeIndex >= 0 ? values[assigneeIndex] : '',
        created: createdIndex >= 0 ? values[createdIndex] : '',
        updated: updatedIndex >= 0 ? values[updatedIndex] : ''
      });
    }
  }

  return data;
}

function parseCSVLine(line) {
  const result = [];
  let current = '';
  let insideQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '"') {
      insideQuotes = !insideQuotes;
    } else if (char === ',' && !insideQuotes) {
      result.push(current.trim().replace(/^"|"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  
  result.push(current.trim().replace(/^"|"$/g, ''));
  return result;
}

function loadSavedJiraData() {
  const saved = localStorage.getItem('jiraData');
  if (saved) {
    jiraData = JSON.parse(saved);
    displayJiraTable();
    updateCharts();
  }
}

function displayJiraTable() {
  const tbody = document.querySelector('#jiraTable tbody');
  tbody.innerHTML = '';

  if (jiraData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">No Jira data loaded. Upload a CSV file to get started.</td></tr>';
    return;
  }

  jiraData.forEach(issue => {
    const row = document.createElement('tr');
    const statusClass = `status-${issue.status.toLowerCase().replace(/\s+/g, '-')}`;
    
    row.innerHTML = `
      <td><strong>${issue.key}</strong></td>
      <td>${issue.summary}</td>
      <td><span class="status-badge ${statusClass}">${issue.status}</span></td>
      <td>${issue.priority}</td>
      <td>${issue.assignee}</td>
      <td>${issue.created}</td>
      <td>${issue.updated}</td>
    `;
    tbody.appendChild(row);
  });
}

function filterJiraTable() {
  const searchTerm = document.getElementById('searchJira').value.toLowerCase();
  const rows = document.querySelectorAll('#jiraTable tbody tr');

  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(searchTerm) ? '' : 'none';
  });
}

function updateCharts() {
  if (jiraData.length === 0) return;

  // Group data for charts
  const statusCounts = {};
  const priorityCounts = {};
  const assigneeCounts = {};

  jiraData.forEach(issue => {
    statusCounts[issue.status] = (statusCounts[issue.status] || 0) + 1;
    priorityCounts[issue.priority] = (priorityCounts[issue.priority] || 0) + 1;
    assigneeCounts[issue.assignee] = (assigneeCounts[issue.assignee] || 0) + 1;
  });

  // Create/Update Charts
  createCompletedByTypeChart(assigneeCounts);
  createIntakesCompletedChart(statusCounts);
  createRequestsPerSquadChart(priorityCounts);
}

function createCompletedByTypeChart(data) {
  const ctx = document.getElementById('completedByTypeChart').getContext('2d');
  
  if (completedByTypeChart) {
    completedByTypeChart.destroy();
  }

  const colors = ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff9f40', '#ff6384', '#c9cbcf'];
  
  completedByTypeChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: Object.keys(data),
      datasets: [{
        data: Object.values(data),
        backgroundColor: colors.slice(0, Object.keys(data).length),
        borderColor: '#0e2a33',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#a0c9ff',
            font: { size: 12 }
          }
        }
      }
    }
  });
}

function createIntakesCompletedChart(statusData) {
  const ctx = document.getElementById('intakesCompletedChart').getContext('2d');
  
  if (intakesCompletedChart) {
    intakesCompletedChart.destroy();
  }

  intakesCompletedChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(statusData),
      datasets: [{
        label: 'Count',
        data: Object.values(statusData),
        backgroundColor: ['#1f6fd6', '#ff6b6b'],
        borderColor: ['#1a5ab8', '#cc5555'],
        borderWidth: 1
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          labels: { color: '#a0c9ff' }
        }
      },
      scales: {
        x: {
          ticks: { color: '#a0c9ff' },
          grid: { color: '#2f5a68' }
        },
        y: {
          ticks: { color: '#a0c9ff' },
          grid: { color: '#2f5a68' }
        }
      }
    }
  });
}

function createRequestsPerSquadChart(priorityData) {
  const ctx = document.getElementById('requestsPerSquadChart').getContext('2d');
  
  if (requestsPerSquadChart) {
    requestsPerSquadChart.destroy();
  }

  const colors = ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff'];
  
  requestsPerSquadChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: Object.keys(priorityData),
      datasets: [{
        data: Object.values(priorityData),
        backgroundColor: colors.slice(0, Object.keys(priorityData).length),
        borderColor: '#0e2a33',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: '#a0c9ff',
            font: { size: 12 }
          }
        }
      }
    }
  });
}

function updateStatistics() {
  const now = new Date();
  const last30Days = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  const yearStart = new Date(now.getFullYear(), 0, 1);

  let count30 = 0;
  let countYTD = 0;

  jiraData.forEach(issue => {
    const createdDate = new Date(issue.created);
    
    if (createdDate >= last30Days) {
      count30++;
    }
    
    if (createdDate >= yearStart) {
      countYTD++;
    }
  });

  document.getElementById('statLast30').textContent = count30;
  document.getElementById('statYTD').textContent = countYTD;
}

function exportJiraData() {
  if (jiraData.length === 0) {
    alert('No data to export!');
    return;
  }

  const csvData = jiraData.map(issue => {
    const values = [issue.key, issue.summary, issue.status, issue.priority, issue.assignee, issue.created, issue.updated];
    return values.map(v => `"${(v || '').replace(/"/g, '""')}"`).join(',');
  });

  const header = '"Issue Key","Summary","Status","Priority","Assignee","Created","Updated"';
  const csv = header + '\n' + csvData.join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `jira-issues-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function logout() {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('username');
  window.location.href = 'login.html';
}
