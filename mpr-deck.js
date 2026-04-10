// Global variables
let jiraData = [];
let filteredJiraData = [];
let chartsInitialized = false;
let completedByTypeChart = null;
let intakesCompletedChart = null;
let requestsPerSquadChart = null;
let currentMonth = null;
let currentYear = null;

// Function to create custom legend below charts
function createCustomLegend(legendId, labels, colors, values) {
  const legendContainer = document.getElementById(legendId);
  if (!legendContainer) return;

  // Clear existing legend
  legendContainer.innerHTML = '';

  // Create legend items
  labels.forEach((label, index) => {
    const legendItem = document.createElement('div');
    legendItem.className = 'legend-item';

    const colorBox = document.createElement('div');
    colorBox.className = 'legend-color';
    colorBox.style.backgroundColor = colors[index];

    const label_text = document.createElement('span');
    label_text.textContent = label + ' (' + values[index] + ')';
    label_text.style.color = '#ffffff'; // Ensure text is white

    legendItem.appendChild(colorBox);
    legendItem.appendChild(label_text);
    legendContainer.appendChild(legendItem);
  });
}

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

  // Initialize month to current
  const now = new Date();
  currentMonth = now.getMonth();
  currentYear = now.getFullYear();

  // Load saved Jira data if exists, otherwise load default
  const saved = localStorage.getItem('jiraData');
  if (saved) {
    jiraData = JSON.parse(saved);
  } else {
    // Pre-load with demo data - will be replaced when CSV is uploaded
    jiraData = [];
  }

  // Populate month selector
  populateMonthSelector();

  // Apply filters and update display
  applyMonthFilter();
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

      // Re-apply filters with new data
      applyMonthFilter();
      
      // Success message
      errorDiv.style.display = 'block';
      errorDiv.textContent = `Successfully loaded ${jiraData.length} Jira issues. Showing ${filteredJiraData.length} issues for current view.`;
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
  // Parse header with proper quoted field handling
  const headerLine = lines[0];
  const headers = [];
  let current = '';
  let inQuotes = false;
  
  for (let i = 0; i < headerLine.length; i++) {
    const char = headerLine[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      headers.push(current.trim().toLowerCase().replace(/^\"|\"$/g, ''));
      current = '';
    } else {
      current += char;
    }
  }
  headers.push(current.trim().toLowerCase().replace(/^\"|\"$/g, ''));
  
  // Find column indices - look for exact match first
  const findIndex = (searchTerms) => {
    for (const term of searchTerms) {
      const idx = headers.findIndex(h => h === term);
      if (idx >= 0) return idx;
    }
    // Then look for partial match
    for (const term of searchTerms) {
      const idx = headers.findIndex(h => h.includes(term));
      if (idx >= 0) return idx;
    }
    return -1;
  };
  
  // Required column indices
  const keyIndex = findIndex(['issue key', 'issue key']);
  const summaryIndex = findIndex(['summary']);
  const statusIndex = findIndex(['status']);
  const priorityIndex = findIndex(['priority']);
  const assigneeIndex = findIndex(['assignee']);
  const createdIndex = findIndex(['created']);
  const updatedIndex = findIndex(['updated']);
  const issueTypeIndex = findIndex(['issue type']);
  const projectIndex = findIndex(['project name']);

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
        updated: updatedIndex >= 0 ? values[updatedIndex] : '',
        issueType: issueTypeIndex >= 0 ? values[issueTypeIndex] : '',
        project: projectIndex >= 0 ? values[projectIndex] : ''
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

function populateMonthSelector() {
  const selector = document.getElementById('monthSelect');
  selector.innerHTML = '';

  const now = new Date();
  
  // Add last 6 months
  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthStr = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    
    const option = document.createElement('option');
    option.value = `${date.getMonth()}-${date.getFullYear()}`;
    option.textContent = monthStr;
    
    if (i === 0) {
      option.selected = true;
    }
    
    selector.appendChild(option);
  }
}

function changeMonth() {
  const selector = document.getElementById('monthSelect');
  const [month, year] = selector.value.split('-').map(Number);
  currentMonth = month;
  currentYear = year;
  applyMonthFilter();
}

function getMonthData(month, year) {
  // Get all data for current month
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);

  return jiraData.filter(issue => {
    const createdDate = new Date(issue.created);
    return createdDate >= startDate && createdDate <= endDate;
  });
}

function getPreviousMonthData(month, year) {
  // Get last few entries from previous month
  let prevMonth = month - 1;
  let prevYear = year;

  if (prevMonth < 0) {
    prevMonth = 11;
    prevYear--;
  }

  const startDate = new Date(prevYear, prevMonth, 1);
  const endDate = new Date(prevYear, prevMonth + 1, 0, 23, 59, 59);

  const prevMonthData = jiraData.filter(issue => {
    const createdDate = new Date(issue.created);
    return createdDate >= startDate && createdDate <= endDate;
  });

  // Return only last 5 entries from previous month
  return prevMonthData.slice(-5);
}

function applyMonthFilter() {
  const currentMonthData = getMonthData(currentMonth, currentYear);
  const lastMonthData = getPreviousMonthData(currentMonth, currentYear);

  // Combine: last month data + current month data
  filteredJiraData = [...lastMonthData, ...currentMonthData];

  // Remove duplicates if any
  filteredJiraData = Array.from(
    new Map(filteredJiraData.map(item => [item.key, item])).values()
  );

  displayJiraTable();
  updateCharts();
  updateStatistics();
}

function filterJiraTable() {
  const searchTerm = document.getElementById('searchJira').value.toLowerCase();
  const rows = document.querySelectorAll('#jiraTable tbody tr');

  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(searchTerm) ? '' : 'none';
  });
}

function displayJiraTable() {
  const tbody = document.querySelector('#jiraTable tbody');
  tbody.innerHTML = '';

  if (filteredJiraData.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">No Jira data for selected month. Upload a CSV file to get started.</td></tr>';
    return;
  }

  // Sort by created date descending
  const sorted = [...filteredJiraData].sort((a, b) => {
    return new Date(b.created) - new Date(a.created);
  });

  sorted.forEach(issue => {
    const row = document.createElement('tr');
    const statusClass = `status-${issue.status.toLowerCase().replace(/\s+/g, '-')}`;
    
    row.innerHTML = `
      <td><strong>${issue.key}</strong></td>
      <td>${issue.summary}</td>
      <td><span class="status-badge ${statusClass}">${issue.status}</span></td>
      <td>${issue.priority}</td>
      <td>${issue.assignee}</td>
      <td>${formatDate(issue.created)}</td>
      <td>${formatDate(issue.updated)}</td>
    `;
    tbody.appendChild(row);
  });
}

function formatDate(dateStr) {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  } catch {
    return dateStr;
  }
}

function updateCharts() {
  if (filteredJiraData.length === 0) return;

  // Group data for charts - using filtered data
  const statusCounts = {};
  const issueTypeCounts = {};
  const assigneeCounts = {};

  filteredJiraData.forEach(issue => {
    // Only count non-empty values
    if (issue.status && issue.status.trim()) {
      statusCounts[issue.status.trim()] = (statusCounts[issue.status.trim()] || 0) + 1;
    }
    if (issue.issueType && issue.issueType.trim()) {
      issueTypeCounts[issue.issueType.trim()] = (issueTypeCounts[issue.issueType.trim()] || 0) + 1;
    }
    if (issue.assignee && issue.assignee.trim()) {
      assigneeCounts[issue.assignee.trim()] = (assigneeCounts[issue.assignee.trim()] || 0) + 1;
    }
  });

  // Create/Update Charts
  createCompletedByTypeChart(assigneeCounts);
  createIntakesCompletedChart(statusCounts);
  createRequestsPerSquadChart(issueTypeCounts);
}

function createCompletedByTypeChart(data) {
  const ctx = document.getElementById('completedByTypeChart').getContext('2d');
  
  if (completedByTypeChart) {
    completedByTypeChart.destroy();
  }

  if (Object.keys(data).length === 0) {
    return;
  }

  const colors = ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff9f40', '#ff6384', '#c9cbcf'];
  const labels = Object.keys(data);
  const values = Object.values(data);
  
  completedByTypeChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: colors.slice(0, labels.length),
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
            color: '#ffffff',
            font: { size: 12, weight: 'bold' },
            padding: 15,
            generateLabels: (chart) => {
              const data = chart.data;
              return data.labels.map((label, i) => ({
                text: label + ' (' + data.datasets[0].data[i] + ')',
                fillStyle: data.datasets[0].backgroundColor[i],
                hidden: false,
                index: i
              }));
            }
          }
        }
      }
    },
    plugins: [{
      id: 'textCenter',
      afterDatasetsDraw(chart) {
        const { ctx, data: { datasets } } = chart;
        
        ctx.save();
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        
        datasets.forEach((dataset) => {
          const meta = chart.getDatasetMeta(0);
          meta.data.forEach((datapoint, index) => {
            const value = dataset.data[index];
            const { x, y } = datapoint;
            
            // Draw stroke first for outline
            ctx.strokeText(value, x, y);
            // Then draw filled text in white
            ctx.fillStyle = '#ffffff';
            ctx.fillText(value, x, y);
          });
        });
        
        ctx.restore();
      }
    }]
  });

  // Create custom legend below chart
  createCustomLegend('completedByTypeLegend', labels, colors.slice(0, labels.length), values);
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
        },
        datalabels: {
          color: '#ffffff',
          font: { weight: 'bold', size: 14 },
          anchor: 'end',
          align: 'end'
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
    },
    plugins: [{
      id: 'datalabels',
      afterDatasetsDraw: function(chart) {
        const ctx = chart.ctx;
        chart.data.datasets.forEach((dataset, datasetIndex) => {
          const meta = chart.getDatasetMeta(datasetIndex);
          meta.data.forEach((bar, index) => {
            const data = dataset.data[index];
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px Arial';
            ctx.textAlign = 'left';
            ctx.textBaseline = 'middle';
            
            const x = bar.x + 10;
            const y = bar.y;
            
            ctx.fillText(data, x, y);
          });
        });
      }
    }]
  });
}

function createRequestsPerSquadChart(issueTypeData) {
  const ctx = document.getElementById('requestsPerSquadChart').getContext('2d');
  
  if (requestsPerSquadChart) {
    requestsPerSquadChart.destroy();
  }

  if (Object.keys(issueTypeData).length === 0) {
    return;
  }

  const colors = ['#ff6384', '#36a2eb', '#ffce56', '#4bc0c0', '#9966ff', '#ff9f40', '#c9cbcf'];
  const labels = Object.keys(issueTypeData);
  const values = Object.values(issueTypeData);
  
  requestsPerSquadChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: colors.slice(0, labels.length),
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
            color: '#ffffff',
            font: { size: 12, weight: 'bold' },
            padding: 15,
            generateLabels: (chart) => {
              const data = chart.data;
              return data.labels.map((label, i) => ({
                text: label + ' (' + data.datasets[0].data[i] + ')',
                fillStyle: data.datasets[0].backgroundColor[i],
                hidden: false,
                index: i
              }));
            }
          }
        }
      }
    },
    plugins: [{
      id: 'textCenter',
      afterDatasetsDraw(chart) {
        const { ctx, data: { datasets } } = chart;
        
        ctx.save();
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        
        datasets.forEach((dataset) => {
          const meta = chart.getDatasetMeta(0);
          meta.data.forEach((datapoint, index) => {
            const value = dataset.data[index];
            const { x, y } = datapoint;
            
            // Draw stroke first for outline
            ctx.strokeText(value, x, y);
            // Then draw filled text in white
            ctx.fillStyle = '#ffffff';
            ctx.fillText(value, x, y);
          });
        });
        
        ctx.restore();
      }
    }]
  });

  // Create custom legend below chart
  createCustomLegend('requestsPerSquadLegend', labels, colors.slice(0, labels.length), values);
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
  document.getElementById('statCurrentMonth').textContent = filteredJiraData.length;
}

function exportJiraData() {
  if (filteredJiraData.length === 0) {
    alert('No data to export!');
    return;
  }

  const csvData = filteredJiraData.map(issue => {
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
