
const dummyData = [
  {rec:'REC-1001', title:'Homepage Explainer', type:'Explainer Page', team:'Growth', wf:'WF-34021', expiry:'2026-06-30'},
  {rec:'REC-1002', title:'Feature Promo Card', type:'Feature Card', team:'Offers', wf:'WF-34022', expiry:'2026-05-15'}
];

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
  
  // Initialize charts
  initializeCharts();
});

const tbody = document.querySelector('#grid tbody');

dummyData.forEach(addRowWithData);

function addRow() {
  addRowWithData({rec:'', title:'', type:'', team:'', wf:'', expiry:''});
}

// Chart instances
let monthlyChartInstance = null;
let teamChartInstance = null;
let typeChartInstance = null;

function initializeCharts() {
  updateCharts();
}

function addRowWithData(d) {
  const row = document.createElement('tr');
  row.innerHTML = `
    <td contenteditable="true">${d.rec}</td>
    <td contenteditable="true">${d.title}</td>
    <td contenteditable="true">${d.type}</td>
    <td contenteditable="true">${d.team}</td>
    <td contenteditable="true">${d.wf}</td>
    <td contenteditable="true">${d.expiry}</td>
    <td><button onclick="deleteRow(this)">X</button></td>
  `;
  tbody.appendChild(row);
  updateCharts();
}

function deleteRow(btn) {
  btn.parentElement.parentElement.remove();
  updateCharts();
}

function saveData() {
  const rows = [...tbody.querySelectorAll('tr')];
  const result = rows.map(r => {
    const c = r.querySelectorAll('td');
    return {
      rec_id: c[0].innerText,
      title: c[1].innerText,
      type: c[2].innerText,
      team: c[3].innerText,
      workfront: c[4].innerText,
      expiry: c[5].innerText
    };
  });
  localStorage.setItem('contentData', JSON.stringify(result, null, 2));
  alert('Data saved locally (simulate DB save).');
}

function exportData() {
  const rows = [...tbody.querySelectorAll('tr')];
  const csvData = rows.map(r => {
    const c = r.querySelectorAll('td');
    const values = [c[0].innerText, c[1].innerText, c[2].innerText, c[3].innerText, c[4].innerText, c[5].innerText];
    return values.map(v => `"${v.replace(/"/g, '""')}"`).join(',');
  });
  
  // Add header row
  const header = '"REC ID","Title","Type","Team","Workfront","Expiry Date"';
  const csv = header + '\n' + csvData.join('\n');
  
  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `content-governance-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function applyFilter() {
  const startDate = document.getElementById('startDate').value;
  const endDate = document.getElementById('endDate').value;
  
  if (!startDate && !endDate) {
    clearFilter();
    return;
  }
  
  const rows = [...tbody.querySelectorAll('tr')];
  rows.forEach(row => {
    const expiryCell = row.querySelectorAll('td')[5];
    const expiryDate = expiryCell.innerText;
    
    let isInRange = true;
    if (startDate && expiryDate < startDate) {
      isInRange = false;
    }
    if (endDate && expiryDate > endDate) {
      isInRange = false;
    }
    
    row.classList.toggle('hidden', !isInRange);
  });
  
  updateCharts();
}

function clearFilter() {
  document.getElementById('startDate').value = '';
  document.getElementById('endDate').value = '';
  const rows = [...tbody.querySelectorAll('tr')];
  rows.forEach(row => {
    row.classList.remove('hidden');
  });
  updateCharts();
}

function updateCharts() {
  const rows = [...tbody.querySelectorAll('tr:not(.hidden)')];
  
  // Extract data
  const monthlyData = {};
  const teamData = {};
  const typeData = {};
  
  rows.forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length >= 6) {
      const expiry = cells[5].innerText;
      const team = cells[3].innerText;
      const type = cells[2].innerText;
      
      if (expiry) {
        const month = expiry.substring(0, 7); // YYYY-MM format
        monthlyData[month] = (monthlyData[month] || 0) + 1;
      }
      
      if (team) {
        teamData[team] = (teamData[team] || 0) + 1;
      }
      
      if (type) {
        typeData[type] = (typeData[type] || 0) + 1;
      }
    }
  });
  
  // Update stats
  updateStats(rows, monthlyData);
  
  // Create charts
  createMonthlyChart(monthlyData);
  createTeamChart(teamData);
  createTypeChart(typeData);
}

function updateStats(rows, monthlyData) {
  const totalRecords = rows.length;
  const currentMonth = new Date().toISOString().substring(0, 7);
  const expiringThisMonth = monthlyData[currentMonth] || 0;
  
  const teams = new Set();
  rows.forEach(row => {
    const team = row.querySelectorAll('td')[3].innerText;
    if (team) teams.add(team);
  });
  
  document.getElementById('totalRecords').textContent = totalRecords;
  document.getElementById('expiringThisMonth').textContent = expiringThisMonth;
  document.getElementById('totalTeams').textContent = teams.size;
}

function createMonthlyChart(data) {
  const ctx = document.getElementById('monthlyChart');
  if (!ctx) return;
  
  const months = Object.keys(data).sort();
  const values = months.map(m => data[m]);
  
  if (monthlyChartInstance) {
    monthlyChartInstance.destroy();
  }
  
  monthlyChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months,
      datasets: [{
        label: 'Records',
        data: values,
        backgroundColor: '#1f6fd6',
        borderColor: '#1551a8',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: '#a0c9ff' }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: { color: '#a0c9ff' },
          grid: { color: '#2f5a68' }
        },
        x: {
          ticks: { color: '#a0c9ff' },
          grid: { color: '#2f5a68' }
        }
      }
    }
  });
}

function createTeamChart(data) {
  const ctx = document.getElementById('teamChart');
  if (!ctx) return;
  
  const teams = Object.keys(data);
  const values = teams.map(t => data[t]);
  
  const colors = ['#1f6fd6', '#28a745', '#dc3545', '#ffc107', '#17a2b8', '#e83e8c'];
  
  if (teamChartInstance) {
    teamChartInstance.destroy();
  }
  
  teamChartInstance = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: teams,
      datasets: [{
        data: values,
        backgroundColor: colors.slice(0, teams.length),
        borderColor: '#0a1f28',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: '#a0c9ff' },
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.label + ': ' + context.parsed + ' records';
            }
          }
        }
      }
    }
  });
}

function createTypeChart(data) {
  const ctx = document.getElementById('typeChart');
  if (!ctx) return;
  
  const types = Object.keys(data);
  const values = types.map(t => data[t]);
  
  const colors = ['#1f6fd6', '#28a745', '#dc3545', '#ffc107', '#17a2b8', '#e83e8c'];
  
  if (typeChartInstance) {
    typeChartInstance.destroy();
  }
  
  typeChartInstance = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: types,
      datasets: [{
        data: values,
        backgroundColor: colors.slice(0, types.length),
        borderColor: '#0a1f28',
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          labels: { color: '#a0c9ff' },
          position: 'bottom'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.label + ': ' + context.parsed + ' records';
            }
          }
        }
      }
    }
  });
}

function logout() {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('username');
  window.location.href = 'login.html';
}
