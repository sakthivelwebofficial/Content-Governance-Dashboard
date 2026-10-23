// Global variables
let workfrontData = [];
let filteredWorkfrontData = [];
let chartsInitialized = false;
let completedByTypeChart = null;
let intakesCompletedChart = null;
let progressDistributionChart = null;
let componentsDistributionChart = null;
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
window.addEventListener('load', async () => {
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

  // Prefer the localStorage copy when available, with IndexedDB as the large-file store.
  const saved = localStorage.getItem('workfrontData');
  if (saved) {
    try {
      const parsedData = JSON.parse(saved);
      workfrontData = Array.isArray(parsedData) ? parsedData : [];
    } catch (error) {
      workfrontData = [];
      const uploadError = document.getElementById('uploadError');
      uploadError.textContent = 'Saved Workfront data could not be read. Upload a valid CSV to replace it.';
      uploadError.style.display = 'block';
    }
  } else {
    try {
      workfrontData = await loadWorkfrontDataFromDatabase() || [];
    } catch (error) {
      workfrontData = [];
      const uploadError = document.getElementById('uploadError');
      uploadError.textContent = 'Saved Workfront data could not be loaded from browser storage.';
      uploadError.style.display = 'block';
    }
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
  reader.onload = async function(e) {
    try {
      const csv = e.target.result;
      workfrontData = parseCSV(csv);

      if (workfrontData.length === 0) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = 'Error: Could not parse CSV file. Check your file format.';
        errorDiv.style.color = '#ff6b6b';
        return;
      }

      const saveResult = await saveWorkfrontDataToStorage(workfrontData);
      populateMonthSelector();
      applyMonthFilter();
      
      if (!saveResult.success) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = `Loaded ${workfrontData.length} tasks for this session, but they could not be saved for a future visit. ${saveResult.message}`;
        errorDiv.style.color = '#ffa800';
      } else {
        errorDiv.style.display = 'block';
        errorDiv.textContent = `✓ Loaded ${saveResult.recordsStored} Workfront tasks (${saveResult.storageSizeMB} MB). Showing ${filteredWorkfrontData.length} tasks in this view. ${saveResult.message}`;
        errorDiv.style.color = '#51cf66';
      }
      
      setTimeout(() => {
        errorDiv.style.display = 'none';
      }, 4000);
    } catch (error) {
      errorDiv.style.display = 'block';
      errorDiv.textContent = `Error: ${error.message}`;
      errorDiv.style.color = '#ff6b6b';
    }
  };
  reader.readAsText(file);
}

function openWorkfrontDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('workfront-data', 1);

    request.onupgradeneeded = () => {
      request.result.createObjectStore('datasets');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function loadWorkfrontDataFromDatabase() {
  const database = await openWorkfrontDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction('datasets', 'readonly');
    const request = transaction.objectStore('datasets').get('current');

    request.onsuccess = () => {
      database.close();
      resolve(request.result ?? null);
    };
    request.onerror = () => {
      database.close();
      reject(request.error);
    };
  });
}

async function saveWorkfrontDataToDatabase(data) {
  const database = await openWorkfrontDatabase();

  return new Promise((resolve, reject) => {
    const transaction = database.transaction('datasets', 'readwrite');
    transaction.objectStore('datasets').put(data, 'current');

    transaction.oncomplete = () => {
      database.close();
      resolve();
    };
    transaction.onerror = () => {
      database.close();
      reject(transaction.error);
    };
    transaction.onabort = () => {
      database.close();
      reject(transaction.error || new Error('Browser storage transaction was aborted.'));
    };
  });
}

function saveWorkfrontDataToStorage(data) {
  const maxSizeInBytes = 3048576;
  const jsonStr = JSON.stringify(data);
  const sizeInBytes = new Blob([jsonStr]).size;
  const sizeInMB = (sizeInBytes / (1024 * 1024)).toFixed(2);

  if (sizeInBytes <= maxSizeInBytes) {
    try {
      localStorage.setItem('workfrontData', jsonStr);
      return Promise.resolve({
        success: true,
        recordsStored: data.length,
        storageSizeMB: sizeInMB,
        message: `Saved all ${data.length} records in browser storage.`
      });
    } catch {
      // Fall through to IndexedDB when localStorage is full or unavailable.
    }
  }

  return saveWorkfrontDataToDatabase(data).then(() => {
    localStorage.removeItem('workfrontData');
    return {
      success: true,
      recordsStored: data.length,
      storageSizeMB: sizeInMB,
      message: `Saved all ${data.length} records in the browser database.`
    };
  }).catch(error => ({
    success: false,
    recordsStored: 0,
    storageSizeMB: sizeInMB,
    message: `Browser storage failed: ${error.message}`
  }));
}

function parseCSV(csvText) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const char = csvText[index];

    if (char === '"') {
      if (inQuotes && csvText[index + 1] === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(field.trim());
      field = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && csvText[index + 1] === '\n') index += 1;
      row.push(field.trim());
      if (row.some(value => value !== '')) rows.push(row);
      row = [];
      field = '';
    } else if ((char === '\n' || char === '\r') && inQuotes) {
      if (char === '\r' && csvText[index + 1] === '\n') index += 1;
      field += '\n';
    } else {
      field += char;
    }
  }

  if (inQuotes) throw new Error('CSV contains an unclosed quoted field.');
  row.push(field.trim());
  if (row.some(value => value !== '')) rows.push(row);
  if (rows.length < 2) throw new Error('CSV file must contain headers and at least one data row.');

  const headers = rows[0].map((header, index) =>
    (index === 0 ? header.replace(/^\uFEFF/, '') : header).toLowerCase().trim()
  );
  
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
  
  // Required column indices - support multiple column name variations
  const idHeaders = ['task id', 'ticket id', 'issue id', 'entry id', 'task key', 'issue key', 'id'];
  const idIndex = headers.findIndex(header => idHeaders.includes(header));
  const nameIndex = findIndex(['name', 'task name', 'summary', 'title']);
  if (nameIndex < 0) {
    throw new Error('CSV must include a Name column.');
  }
  const statusIndex = findIndex(['status', 'content status']);
  const priorityIndex = findIndex(['priority', 'request type', 'type']);
  const assigneeIndex = findIndex(['assignee', 'assigned to', 'assignments', 'owner']);
  const createdIndex = findIndex(['entry', 'created', 'created date', 'entry date', 'requested go-live date', 'requested']);
  const updatedIndex = findIndex(['updated', 'updated date', 'last modified', 'published date']);
  const taskTypeIndex = findIndex(['request type', 'task type', 'type']);
  const projectIndex = findIndex(['project', 'project name', 'team']);
  // Component column - look for 'component' with or without 's'
  const componentIndex = findIndex(['component/s', 'component', 'components']);

  const data = [];
  
  for (let i = 1; i < rows.length; i++) {
    const values = rows[i];
    if (values.some(value => value !== '')) {
      // Extract assignee name from complex assignment field
      let assigneeValue = assigneeIndex >= 0 ? values[assigneeIndex] : '';
      if (assigneeValue) {
        const assignment = assigneeValue.trim();
        if (/^team\s*:/i.test(assignment)) {
          assigneeValue = 'Team Assignment';
        } else if (/^job role\s*:/i.test(assignment)) {
          assigneeValue = 'Unassigned';
        } else {
          const person = assignment.match(/^(.+?)(?=,\s*(?:Team|Job Role)\s*:|$)/i);
          assigneeValue = person ? person[1].trim() : 'Unassigned';
        }
      }

      data.push({
        id: idIndex >= 0 && values[idIndex] ? values[idIndex] : `ROW-${i}`,
        name: values[nameIndex] || '',
        status: statusIndex >= 0 ? values[statusIndex] || '' : '',
        priority: priorityIndex >= 0 ? values[priorityIndex] || '' : '',
        assignee: assigneeValue || '',
        created: createdIndex >= 0 ? values[createdIndex] || '' : new Date().toISOString().split('T')[0],
        updated: updatedIndex >= 0 ? values[updatedIndex] || '' : new Date().toISOString().split('T')[0],
        taskType: taskTypeIndex >= 0 ? values[taskTypeIndex] || '' : '',
        project: projectIndex >= 0 ? values[projectIndex] || '' : '',
        component: componentIndex >= 0 ? values[componentIndex] || '' : ''
      });
    }
  }

  return data;
}

function populateMonthSelector() {
  const selector = document.getElementById('monthSelect');
  selector.innerHTML = '';

  const now = new Date();

  const monthOptions = new Map();
  for (let i = 0; i < 6; i++) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthOptions.set(`${date.getMonth()}-${date.getFullYear()}`, date);
  }

  workfrontData.forEach(task => {
    const date = new Date(task.created);
    if (!Number.isNaN(date.getTime())) {
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      monthOptions.set(`${monthStart.getMonth()}-${monthStart.getFullYear()}`, monthStart);
    }
  });

  const allOption = document.createElement('option');
  allOption.value = 'all';
  allOption.textContent = 'All Data';
  selector.appendChild(allOption);

  const sortedMonths = [...monthOptions.entries()].sort((left, right) => right[1] - left[1]);
  sortedMonths.forEach(([value, date]) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    selector.appendChild(option);
  });

  selector.value = 'all';
  currentMonth = null;
  currentYear = null;
}

function changeMonth() {
  const selector = document.getElementById('monthSelect');
  if (selector.value === 'all') {
    currentMonth = null;
    currentYear = null;
    applyMonthFilter();
    return;
  }

  const [month, year] = selector.value.split('-').map(Number);
  currentMonth = month;
  currentYear = year;
  applyMonthFilter();
}

function getMonthData(month, year) {
  // Get all data for current month
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);

  return workfrontData.filter(task => {
    const createdDate = new Date(task.created);
    return createdDate >= startDate && createdDate <= endDate;
  });
}

function applyMonthFilter() {
  filteredWorkfrontData = currentMonth === null
    ? [...workfrontData]
    : getMonthData(currentMonth, currentYear);

  displayWorkfrontTable();
  updateCharts();
  updateStatistics();
}

function filterWorkfrontTable() {
  const searchTerm = document.getElementById('searchWorkfront').value.toLowerCase();
  const rows = document.querySelectorAll('#workfrontTable tbody tr');

  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    row.style.display = text.includes(searchTerm) ? '' : 'none';
  });
}

function displayWorkfrontTable() {
  const tbody = document.querySelector('#workfrontTable tbody');
  tbody.innerHTML = '';

  if (filteredWorkfrontData.length === 0) {
    tbody.innerHTML = '<tr><td colspan=\"7\" style=\"text-align: center; padding: 20px;\">No Workfront data for selected month. Upload a CSV file to get started.</td></tr>';
    return;
  }

  // Sort by created date descending
  const sorted = [...filteredWorkfrontData].sort((a, b) => {
    return new Date(b.created) - new Date(a.created);
  });

  sorted.forEach(task => {
    const row = document.createElement('tr');
    const idCell = document.createElement('td');
    const idText = document.createElement('strong');
    idText.textContent = task.id || '';
    idCell.appendChild(idText);
    row.appendChild(idCell);

    [task.name, task.status, task.priority, task.assignee, formatDate(task.created), formatDate(task.updated)]
      .forEach((value, index) => {
        const cell = document.createElement('td');
        if (index === 1) {
          const badge = document.createElement('span');
          badge.className = 'status-badge';
          const statusClass = (value || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
          if (statusClass) badge.classList.add(`status-${statusClass}`);
          badge.textContent = value || '';
          cell.appendChild(badge);
        } else {
          cell.textContent = value || '';
        }
        row.appendChild(cell);
      });
    tbody.appendChild(row);
  });

  filterWorkfrontTable();
}

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function updateCharts() {
  if (filteredWorkfrontData.length === 0) {
    [completedByTypeChart, intakesCompletedChart, progressDistributionChart, componentsDistributionChart]
      .forEach(chart => chart?.destroy());
    completedByTypeChart = null;
    intakesCompletedChart = null;
    progressDistributionChart = null;
    componentsDistributionChart = null;
    document.querySelectorAll('.custom-legend').forEach(legend => legend.replaceChildren());
    return;
  }

  // Group data for charts - using filtered data
  const statusCounts = {};
  const completedTypeCounts = {};
  const componentCounts = {};
  const progressCounts = { 'In Progress': 0, 'Completed': 0 };

  filteredWorkfrontData.forEach(task => {
    // Only count non-empty values
    if (task.status && task.status.trim()) {
      statusCounts[task.status.trim()] = (statusCounts[task.status.trim()] || 0) + 1;
      
      // Group into In Progress vs Completed
      const status = task.status.trim().toLowerCase();
      if (status === 'in progress' || status === 'inprogress' || status === 'current') {
        progressCounts['In Progress']++;
      } else if (status === 'done' || status === 'closed' || status === 'resolved' || status === 'complete' || status === 'completed') {
        progressCounts['Completed']++;
        if (task.taskType && task.taskType.trim()) {
          const taskType = task.taskType.trim();
          completedTypeCounts[taskType] = (completedTypeCounts[taskType] || 0) + 1;
        }
      }
    }
    if (task.component && task.component.trim()) {
      componentCounts[task.component.trim()] = (componentCounts[task.component.trim()] || 0) + 1;
    }
  });

  // Create/Update Charts
  createCompletedByTypeChart(completedTypeCounts);
  createIntakesCompletedChart(statusCounts);
  createProgressDistributionChart(progressCounts);
  createComponentsDistributionChart(componentCounts);
}

function createCompletedByTypeChart(data) {
  const ctx = document.getElementById('completedByTypeChart').getContext('2d');
  
  if (completedByTypeChart) {
    completedByTypeChart.destroy();
  }

  if (Object.keys(data).length === 0) {
    createCustomLegend('completedByTypeLegend', [], [], []);
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
          display: false,
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
    }
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

function createProgressDistributionChart(progressData) {
  const ctx = document.getElementById('progressDistributionChart').getContext('2d');
  
  if (progressDistributionChart) {
    progressDistributionChart.destroy();
  }

  const labels = Object.keys(progressData).filter(key => progressData[key] > 0);
  const values = labels.map(key => progressData[key]);
  
  if (labels.length === 0) {
    createCustomLegend('progressDistributionLegend', [], [], []);
    return;
  }

  // Color mapping for progress status
  const progressColors = {
    'In Progress': '#ffd43b',  // Yellow - active work
    'Completed': '#51cf66'     // Green - done work
  };

  const colors = labels.map(label => progressColors[label] || '#9966ff');

  progressDistributionChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderColor: '#0e2a33',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false,
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
    }
  });

  createCustomLegend('progressDistributionLegend', labels, colors, values);
}

function createComponentsDistributionChart(componentData) {
  const ctx = document.getElementById('componentsDistributionChart').getContext('2d');
  
  if (componentsDistributionChart) {
    componentsDistributionChart.destroy();
  }

  // Filter out empty component names and get non-empty data
  const filteredComponentData = {};
  Object.keys(componentData).forEach(key => {
    if (key && key.trim()) {
      filteredComponentData[key] = componentData[key];
    }
  });

  // If no valid component data, show placeholder
  if (Object.keys(filteredComponentData).length === 0) {
    // Create empty chart with message
    componentsDistributionChart = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: ['No Component Data'],
        datasets: [{
          data: [1],
          backgroundColor: ['#cccccc'],
          borderColor: '#0e2a33',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            enabled: true,
            callbacks: {
              label: function() {
                return 'Upload CSV to see component distribution';
              }
            }
          }
        }
      }
    });
    return;
  }

  // Color palette for components - vibrant and distinct colors
  const componentColors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#95E1D3', '#F38181',
    '#AA4465', '#FCBAD3', '#B4A7D6', '#FECA57', '#48DBFB',
    '#FF9FF3', '#54A0FF', '#1ABC9C', '#E74C3C', '#3498DB'
  ];

  const labels = Object.keys(filteredComponentData);
  const values = Object.values(filteredComponentData);
  const colors = labels.map((label, idx) => componentColors[idx % componentColors.length]);

  componentsDistributionChart = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: labels,
      datasets: [{
        data: values,
        backgroundColor: colors,
        borderColor: '#0e2a33',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: false,
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
    }
  });

  createCustomLegend('componentsDistributionLegend', labels, colors, values);
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
    }
  });

  // Create custom legend below chart
  createCustomLegend('requestsPerSquadLegend', labels, colors.slice(0, labels.length), values);
}

function updateStatistics() {
  const now = new Date();
  const last30Days = new Date(now.getTime() - (30 * 24 * 60 * 60 * 1000));
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const tomorrow = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1);

  let count30 = 0;
  let countYTD = 0;
  let countCurrentMonth = 0;

  workfrontData.forEach(task => {
    const createdDate = new Date(task.created);

    if (createdDate >= last30Days && createdDate < tomorrow) {
      count30++;
    }

    if (createdDate >= yearStart && createdDate < tomorrow) {
      countYTD++;
    }

    if (createdDate.getFullYear() === now.getFullYear() && createdDate.getMonth() === now.getMonth()) {
      countCurrentMonth++;
    }
  });

  document.getElementById('statLast30').textContent = count30;
  document.getElementById('statYTD').textContent = countYTD;
  document.getElementById('statCurrentMonth').textContent = countCurrentMonth;
  updateLeadershipSummary();
}

function getTicketStatusCategory(status) {
  const normalized = (status || '').trim().toLowerCase();
  if (['done', 'closed', 'resolved', 'complete', 'completed'].includes(normalized)) return 'completed';
  if (['in progress', 'inprogress', 'current'].includes(normalized)) return 'inProgress';
  return 'other';
}

function updateLeadershipSummary() {
  let completedCount = 0;
  let inProgressCount = 0;
  const assigneeCounts = new Map();

  filteredWorkfrontData.forEach(task => {
    const category = getTicketStatusCategory(task.status);
    if (category === 'completed') completedCount++;
    if (category === 'inProgress') inProgressCount++;

    const assignee = task.assignee?.trim() || 'Unassigned';
    if (!assigneeCounts.has(assignee)) {
      assigneeCounts.set(assignee, { total: 0, completed: 0, inProgress: 0, other: 0 });
    }

    const counts = assigneeCounts.get(assignee);
    counts.total++;
    counts[category]++;
  });

  const totalInView = filteredWorkfrontData.length;
  document.getElementById('summaryAllTickets').textContent = workfrontData.length;
  document.getElementById('summaryTicketsInView').textContent = totalInView;
  document.getElementById('summaryCompleted').textContent = completedCount;
  document.getElementById('summaryInProgress').textContent = inProgressCount;
  document.getElementById('summaryCompletionRate').textContent = totalInView
    ? `${Math.round((completedCount / totalInView) * 100)}%`
    : '0%';

  const summaryBody = document.getElementById('assigneeSummaryBody');
  summaryBody.replaceChildren();

  const sortedAssignees = [...assigneeCounts.entries()].sort((left, right) =>
    right[1].total - left[1].total || left[0].localeCompare(right[0])
  );

  if (sortedAssignees.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 5;
    cell.textContent = 'No tickets in this view.';
    row.appendChild(cell);
    summaryBody.appendChild(row);
    return;
  }

  sortedAssignees.forEach(([assignee, counts]) => {
    const row = document.createElement('tr');
    [assignee, counts.total, counts.completed, counts.inProgress, counts.other].forEach(value => {
      const cell = document.createElement('td');
      cell.textContent = value;
      row.appendChild(cell);
    });
    summaryBody.appendChild(row);
  });
}

function exportWorkfrontData() {
  if (filteredWorkfrontData.length === 0) {
    alert('No data to export!');
    return;
  }

  const csvData = filteredWorkfrontData.map(task => {
    const values = [task.id, task.name, task.status, task.priority, task.assignee, task.created, task.updated];
    return values.map(v => `"${(v || '').replace(/"/g, '""')}"`).join(',');
  });

  const header = '"Task ID","Name","Status","Priority","Assignee","Created","Updated"';
  const csv = header + '\n' + csvData.join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `workfront-tasks-${new Date().toISOString().split('T')[0]}.csv`);
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
