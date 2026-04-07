
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
});

const tbody = document.querySelector('#grid tbody');

dummyData.forEach(addRowWithData);

function addRow() {
  addRowWithData({rec:'', title:'', type:'', team:'', wf:'', expiry:''});
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
    <td><button onclick="this.parentElement.parentElement.remove()">X</button></td>
  `;
  tbody.appendChild(row);
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
}

function clearFilter() {
  document.getElementById('startDate').value = '';
  document.getElementById('endDate').value = '';
  const rows = [...tbody.querySelectorAll('tr')];
  rows.forEach(row => {
    row.classList.remove('hidden');
  });
}

function logout() {
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('username');
  window.location.href = 'login.html';
}
