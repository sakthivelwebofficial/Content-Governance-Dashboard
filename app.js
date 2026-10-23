
const dummyData = [
  {rec:'REC-1001', title:'Homepage Explainer', type:'Explainer Pages', team:'Growth (J. Simeik)', placement:'Web', membership:'Public', wf:'WF-34021', expiry:'2026-06-30'},
  {rec:'REC-1002', title:'Feature Promo Card', type:'Feature Discovery / Carousel Items', team:'Mobile & Services (K. Chung)', placement:'Mobile', membership:'Premium', wf:'WF-34022', expiry:'2026-05-15'},
  {rec:'REC-1003', title:'Product Launch Guide', type:'Product Detail Pages', team:'App Strat. & Eng. (V. Soni)', placement:'Web', membership:'Public', wf:'WF-34023', expiry:'2026-07-20'},
  {rec:'REC-1004', title:'Email Campaign Template', type:'CX Messages', team:'External - Marketing', placement:'Email', membership:'All Users', wf:'WF-34024', expiry:'2026-04-30'},
  {rec:'REC-1005', title:'Video Tutorial Series', type:'Highlight Tiles', team:'Membership (R. Conston)', placement:'Portal', membership:'Registered', wf:'WF-34025', expiry:'2026-08-15'},
  {rec:'REC-1006', title:'FAQ Documentation', type:'BYOD Page', team:'Connectivity & WiFi (E. Bertrand)', placement:'Web', membership:'Public', wf:'WF-34026', expiry:'2026-05-31'},
  {rec:'REC-1007', title:'Social Media Post', type:'Commerce Plan Card', team:'External - Marketing', placement:'Social', membership:'Public', wf:'WF-34027', expiry:'2026-06-10'},
  {rec:'REC-1008', title:'API Documentation', type:'Dynamic App Cards', team:'App Strat. & Eng. (V. Soni)', placement:'Portal', membership:'Developer', wf:'WF-34028', expiry:'2026-09-30'},
  {rec:'REC-1009', title:'Mobile App Onboarding', type:'Explainer Pages', team:'Mobile & Services (K. Chung)', placement:'Mobile', membership:'All Users', wf:'WF-34029', expiry:'2026-07-05'},
  {rec:'REC-1010', title:'Customer Success Story', type:'Product Detail Pages', team:'Connectivity & WiFi (E. Bertrand)', placement:'Web', membership:'Public', wf:'WF-34030', expiry:'2026-06-15'},
  {rec:'REC-1011', title:'Blog Post: Best Practices', type:'Feature Discovery / Carousel Items', team:'Growth (J. Simeik)', placement:'Web', membership:'Public', wf:'WF-34031', expiry:'2026-05-20'},
  {rec:'REC-1012', title:'Webinar Recording', type:'Highlight Tiles', team:'Membership (R. Conston)', placement:'Portal', membership:'Registered', wf:'WF-34032', expiry:'2026-08-30'},
  {rec:'REC-1013', title:'Newsletter Template', type:'CX Messages', team:'External - Marketing', placement:'Email', membership:'Subscriber', wf:'WF-34033', expiry:'2026-04-25'},
  {rec:'REC-1014', title:'Product Roadmap', type:'BYOD Page', team:'App Strat. & Eng. (V. Soni)', placement:'Portal', membership:'Premium', wf:'WF-34034', expiry:'2026-10-15'},
  {rec:'REC-1015', title:'Training Course Module', type:'Dynamic App Cards', team:'Membership (R. Conston)', placement:'Portal', membership:'Employee', wf:'WF-34035', expiry:'2026-07-31'},
  {rec:'REC-1016', title:'Compliance Checklist', type:'Explainer Pages', team:'External - Service Feature', placement:'Portal', membership:'Employee', wf:'WF-34036', expiry:'2026-06-01'},
  {rec:'REC-1017', title:'System Architecture', type:'Commerce Plan Card', team:'App Strat. & Eng. (V. Soni)', placement:'Portal', membership:'Developer', wf:'WF-34037', expiry:'2026-09-15'},
  {rec:'REC-1018', title:'User Research Report', type:'Feature Discovery / Carousel Items', team:'Mobile & Services (K. Chung)', placement:'Portal', membership:'Internal', wf:'WF-34038', expiry:'2026-05-10'},
  {rec:'REC-1019', title:'Brand Guidelines', type:'Highlight Tiles', team:'Growth (J. Simeik)', placement:'Portal', membership:'Internal', wf:'WF-34039', expiry:'2026-12-31'},
  {rec:'REC-1020', title:'Promotional Flyer', type:'Product Detail Pages', team:'External - Marketing', placement:'Web', membership:'Public', wf:'WF-34040', expiry:'2026-04-15'},
  {rec:'REC-1021', title:'Service Level Agreement', type:'CX Messages', team:'External - Service Feature', placement:'Portal', membership:'Premium', wf:'WF-34041', expiry:'2026-08-20'},
  {rec:'REC-1022', title:'Interview Guide', type:'BYOD Page', team:'Membership (R. Conston)', placement:'Portal', membership:'Employee', wf:'WF-34042', expiry:'2026-06-25'},
  {rec:'REC-1023', title:'Performance Dashboard', type:'Dynamic App Cards', team:'Connectivity & WiFi (E. Bertrand)', placement:'Portal', membership:'Internal', wf:'WF-34043', expiry:'2026-07-10'},
  {rec:'REC-1024', title:'Deployment Manual', type:'Explainer Pages', team:'App Strat. & Eng. (V. Soni)', placement:'Portal', membership:'Developer', wf:'WF-34044', expiry:'2026-09-01'},
  {rec:'REC-1025', title:'Customer Feedback Summary', type:'Feature Discovery / Carousel Items', team:'External - Service Feature', placement:'Portal', membership:'Internal', wf:'WF-34045', expiry:'2026-05-05'},
  {rec:'REC-1026', title:'Pricing Strategy Document', type:'Highlight Tiles', team:'Membership (R. Conston)', placement:'Portal', membership:'Internal', wf:'WF-34046', expiry:'2026-04-30'},
  {rec:'REC-1027', title:'Social Media Strategy', type:'Commerce Plan Card', team:'External - Marketing', placement:'Social', membership:'Internal', wf:'WF-34047', expiry:'2026-06-30'},
  {rec:'REC-1028', title:'Security Policy', type:'Product Detail Pages', team:'App Strat. & Eng. (V. Soni)', placement:'Portal', membership:'Employee', wf:'WF-34048', expiry:'2026-11-30'},
  {rec:'REC-1029', title:'Quarterly Business Review', type:'CX Messages', team:'Growth (J. Simeik)', placement:'Portal', membership:'Executive', wf:'WF-34049', expiry:'2026-05-15'},
  {rec:'REC-1030', title:'Content Calendar', type:'BYOD Page', team:'Membership (R. Conston)', placement:'Portal', membership:'Internal', wf:'WF-34050', expiry:'2026-07-15'},
  {rec:'REC-1031', title:'Employee Handbook', type:'Dynamic App Cards', team:'External - Service Feature', placement:'Portal', membership:'Employee', wf:'WF-34051', expiry:'2026-08-01'},
  {rec:'REC-1032', title:'Market Analysis Report', type:'Explainer Pages', team:'Connectivity & WiFi (E. Bertrand)', placement:'Portal', membership:'Internal', wf:'WF-34052', expiry:'2026-05-20'},
  {rec:'REC-1033', title:'Design Mockups', type:'Feature Discovery / Carousel Items', team:'Mobile & Services (K. Chung)', placement:'Portal', membership:'Internal', wf:'WF-34053', expiry:'2026-06-05'},
  {rec:'REC-1034', title:'Test Plan Document', type:'Highlight Tiles', team:'App Strat. & Eng. (V. Soni)', placement:'Portal', membership:'Internal', wf:'WF-34054', expiry:'2026-04-20'},
  {rec:'REC-1035', title:'Vendor Agreement', type:'Product Detail Pages', team:'External - Service Feature', placement:'Portal', membership:'Internal', wf:'WF-34055', expiry:'2026-09-30'},
  {rec:'REC-1036', title:'Crisis Management Plan', type:'CX Messages', team:'Growth (J. Simeik)', placement:'Portal', membership:'Internal', wf:'WF-34056', expiry:'2026-07-01'},
  {rec:'REC-1037', title:'Training Presentation', type:'Commerce Plan Card', team:'Membership (R. Conston)', placement:'Portal', membership:'Employee', wf:'WF-34057', expiry:'2026-06-20'},
  {rec:'REC-1038', title:'Analytics Dashboard Guide', type:'BYOD Page', team:'Connectivity & WiFi (E. Bertrand)', placement:'Portal', membership:'Internal', wf:'WF-34058', expiry:'2026-05-25'},
  {rec:'REC-1039', title:'Partnership Proposal', type:'Dynamic App Cards', team:'External - Marketing', placement:'Portal', membership:'Internal', wf:'WF-34059', expiry:'2026-04-10'},
  {rec:'REC-1040', title:'Environmental Policy', type:'Explainer Pages', team:'Mobile & Services (K. Chung)', placement:'Portal', membership:'Public', wf:'WF-34060', expiry:'2026-12-31'},
  {rec:'REC-1041', title:'Customer Onboarding', type:'Feature Discovery / Carousel Items', team:'External - Service Feature', placement:'Web', membership:'All Users', wf:'WF-34061', expiry:'2026-06-10'},
  {rec:'REC-1042', title:'Release Notes', type:'Highlight Tiles', team:'App Strat. & Eng. (V. Soni)', placement:'Web', membership:'Public', wf:'WF-34062', expiry:'2026-08-15'},
  {rec:'REC-1043', title:'Brand Story', type:'Product Detail Pages', team:'Growth (J. Simeik)', placement:'Web', membership:'Public', wf:'WF-34063', expiry:'2026-05-30'},
  {rec:'REC-1044', title:'IT Infrastructure Plan', type:'CX Messages', team:'Connectivity & WiFi (E. Bertrand)', placement:'Portal', membership:'Internal', wf:'WF-34064', expiry:'2026-10-31'},
  {rec:'REC-1045', title:'Customer Satisfaction Survey', type:'Commerce Plan Card', team:'Membership (R. Conston)', placement:'Email', membership:'All Users', wf:'WF-34065', expiry:'2026-07-20'},
  {rec:'REC-1046', title:'Product Requirements', type:'BYOD Page', team:'Mobile & Services (K. Chung)', placement:'Portal', membership:'Internal', wf:'WF-34066', expiry:'2026-06-30'},
  {rec:'REC-1047', title:'Financial Forecast', type:'Dynamic App Cards', team:'External - Marketing', placement:'Portal', membership:'Executive', wf:'WF-34067', expiry:'2026-05-15'},
  {rec:'REC-1048', title:'Communication Strategy', type:'Explainer Pages', team:'App Strat. & Eng. (V. Soni)', placement:'Portal', membership:'Internal', wf:'WF-34068', expiry:'2026-07-30'},
  {rec:'REC-1049', title:'UX Design Specifications', type:'Feature Discovery / Carousel Items', team:'Growth (J. Simeik)', placement:'Portal', membership:'Internal', wf:'WF-34069', expiry:'2026-06-15'},
  {rec:'REC-1050', title:'Annual Compliance Report', type:'Highlight Tiles', team:'External - Service Feature', placement:'Portal', membership:'Executive', wf:'WF-34070', expiry:'2026-04-30'}
];

// Global variable
let tbody;
let workfrontUrlTemplate = '';

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
  
  // Initialize tbody and load data
  tbody = document.querySelector('#grid tbody');

  if (!tbody) return;
  const workfrontUrlInput = document.getElementById('workfrontUrlTemplate');
  workfrontUrlTemplate = localStorage.getItem('workfrontUrlTemplate') || '';
  workfrontUrlInput.value = workfrontUrlTemplate;
  workfrontUrlInput.addEventListener('input', () => {
    workfrontUrlTemplate = workfrontUrlInput.value.trim();
    localStorage.setItem('workfrontUrlTemplate', workfrontUrlTemplate);
    updateWorkfrontLinks();
  });

  tbody.addEventListener('input', () => {
    updateCharts();
    saveData(false);
  });
  tbody.addEventListener('focusout', event => {
    const cell = event.target.closest('td');
    if (cell && cell.cellIndex === 5) renderWorkfrontLink(cell);
  });

  let initialData = dummyData;
  const savedData = localStorage.getItem('contentData');
  if (savedData !== null) {
    try {
      const parsedData = JSON.parse(savedData);
      if (Array.isArray(parsedData)) {
        initialData = parsedData.map(record => ({
          rec: record.rec ?? record.rec_id ?? '',
          title: record.title ?? '',
          type: record.type ?? '',
          team: record.team ?? '',
          placement: record.placement ?? '',
          wf: record.wf ?? record.workfront ?? '',
          expiry: record.expiry ?? record.expiry_date ?? ''
        }));
      }
    } catch (error) {
      console.error('Unable to load saved content data:', error);
    }
  }

  initialData.forEach(record => addRowWithData(record, false));
  
  // Initialize charts
  setTimeout(initializeCharts, 100);
});

function addRow() {
  addRowWithData({rec:'', title:'', type:'', team:'', placement:'', wf:'', expiry:''});
  saveData(false);
}

// Chart instances
let monthlyChartInstance = null;
let teamChartInstance = null;
let typeChartInstance = null;

function initializeCharts() {
  updateCharts();
}

function addRowWithData(d, shouldUpdateCharts = true) {
  const row = document.createElement('tr');
  [d.rec, d.title, d.type, d.team, d.placement, d.wf, d.expiry].forEach(value => {
    const cell = document.createElement('td');
    cell.contentEditable = 'true';
    cell.textContent = value ?? '';
    row.appendChild(cell);
  });
  renderWorkfrontLink(row.cells[5]);

  const actionCell = document.createElement('td');
  const deleteButton = document.createElement('button');
  deleteButton.textContent = 'X';
  deleteButton.addEventListener('click', () => deleteRow(deleteButton));
  actionCell.appendChild(deleteButton);
  row.appendChild(actionCell);
  tbody.appendChild(row);

  if (shouldUpdateCharts) updateCharts();
}

function getWorkfrontHref(value) {
  const ticket = (value || '').trim();
  if (!ticket) return '';

  let href = ticket;
  try {
    const directUrl = new URL(href);
    if (directUrl.protocol === 'http:' || directUrl.protocol === 'https:') return directUrl.href;
  } catch {
    // The cell contains a ticket ID, not a full URL.
  }

  if (!workfrontUrlTemplate.includes('{id}') && !workfrontUrlTemplate.includes('{{id}}')) return '';
  href = workfrontUrlTemplate
    .replaceAll('{{id}}', encodeURIComponent(ticket))
    .replaceAll('{id}', encodeURIComponent(ticket));

  try {
    const parsedUrl = new URL(href);
    return parsedUrl.protocol === 'http:' || parsedUrl.protocol === 'https:' ? parsedUrl.href : '';
  } catch {
    return '';
  }
}

function renderWorkfrontLink(cell) {
  if (!cell) return;
  const ticket = cell.textContent.trim();
  const href = getWorkfrontHref(ticket);
  cell.replaceChildren();

  if (!href) {
    cell.textContent = ticket;
    return;
  }

  const link = document.createElement('a');
  link.href = href;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  link.textContent = ticket;
  cell.appendChild(link);
}

function updateWorkfrontLinks() {
  document.querySelectorAll('#grid tbody tr').forEach(row => renderWorkfrontLink(row.cells[5]));
  const status = document.getElementById('workfrontUrlStatus');
  if (workfrontUrlTemplate && !workfrontUrlTemplate.includes('{id}') && !workfrontUrlTemplate.includes('{{id}}')) {
    status.textContent = 'Add {id} to the URL pattern to link ticket IDs.';
  } else {
    status.textContent = 'Ticket IDs open in a new tab; direct URLs in a cell are used as-is.';
  }
}

function deleteRow(btn) {
  btn.parentElement.parentElement.remove();
  updateCharts();
  saveData(false);
}

function saveData(showConfirmation = true) {
  const rows = [...tbody.querySelectorAll('tr')];
  const result = rows.map(r => {
    const c = r.querySelectorAll('td');
    return {
      rec_id: c[0].innerText,
      title: c[1].innerText,
      type: c[2].innerText,
      team: c[3].innerText,
      placement: c[4].innerText,
      workfront: c[5].innerText,
      expiry: c[6].innerText
    };
  });
  localStorage.setItem('contentData', JSON.stringify(result, null, 2));
  if (showConfirmation) alert('Data saved locally.');
}

function exportData() {
  const rows = [...tbody.querySelectorAll('tr')];
  const csvData = rows.map(r => {
    const c = r.querySelectorAll('td');
    const values = [c[0].innerText, c[1].innerText, c[2].innerText, c[3].innerText, c[4].innerText, c[5].innerText, c[6].innerText];
    return values.map(v => `"${v.replace(/"/g, '""')}"`).join(',');
  });
  
  // Add header row
  const header = '"REC ID","Title","Type","Team","Placement","Workfront","Expiry Date"';
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
    const cells = row.querySelectorAll('td');
    const expiryDate = cells[6].innerText;
    
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
    if (cells.length >= 8) {
      // Column indices: 0=REC ID, 1=Title, 2=Type, 3=Team, 4=Placement, 5=Workfront, 6=Expiry Date
      const expiry = cells[6].innerText;
      const team = cells[3].innerText;
      const type = cells[2].innerText;
      
      if (expiry && expiry.trim() !== '') {
        const month = expiry.substring(0, 7); // YYYY-MM format
        monthlyData[month] = (monthlyData[month] || 0) + 1;
      }
      
      if (team && team.trim() !== '') {
        teamData[team] = (teamData[team] || 0) + 1;
      }
      
      if (type && type.trim() !== '') {
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
    const cells = row.querySelectorAll('td');
    const team = cells[3].innerText;
    if (team && team.trim() !== '') teams.add(team);
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
  
  // If no data, show empty state
  if (months.length === 0) {
    months.push('No Data');
    values.push(0);
  }
  
  if (monthlyChartInstance) {
    monthlyChartInstance.destroy();
  }
  
  monthlyChartInstance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: months.length > 0 ? months : ['No Data'],
      datasets: [{
        label: 'Records',
        data: values.length > 0 ? values : [0],
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
