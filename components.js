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

  // Load components
  loadComponents();
});

function addComponent(event) {
  event.preventDefault();

  const name = document.getElementById('compName').value;
  const type = document.getElementById('compType').value;
  const description = document.getElementById('compDescription').value;
  const status = document.getElementById('compStatus').value;
  const wiki = document.getElementById('compWiki').value;
  const errorMessage = document.getElementById('errorMessage');

  // Validate wiki link
  if (!isValidUrl(wiki)) {
    errorMessage.style.display = 'block';
    errorMessage.textContent = 'Error: Please enter a valid URL (must start with http:// or https://)';
    errorMessage.style.color = '#ff6b6b';
    return;
  }

  errorMessage.style.display = 'none';

  let components = JSON.parse(localStorage.getItem('components')) || [];

  const newComponent = {
    id: Date.now(),
    name: name,
    type: type,
    description: description,
    wiki: wiki,
    status: status,
    createdDate: new Date().toISOString().split('T')[0]
  };

  components.push(newComponent);
  localStorage.setItem('components', JSON.stringify(components));

  // Clear form
  document.querySelector('form').reset();
  errorMessage.style.display = 'none';

  // Reload components
  loadComponents();
  alert('Component added successfully!');
}

// Function to validate URL
function isValidUrl(string) {
  try {
    const url = new URL(string);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch (_) {
    return false;
  }
}

function loadComponents() {
  const components = JSON.parse(localStorage.getItem('components')) || [];
  const tbody = document.querySelector('#componentsTable tbody');
  tbody.innerHTML = '';

  if (components.length === 0) {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 20px;">No components yet. Add one to get started!</td></tr>';
    return;
  }

  components.forEach(component => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${component.name}</td>
      <td>${component.type}</td>
      <td>${component.description}</td>
      <td><a href="${component.wiki}" target="_blank" class="wiki-link">📖 Open Wiki</a></td>
      <td><span class="status-badge ${component.status.toLowerCase()}">${component.status}</span></td>
      <td>${component.createdDate}</td>
      <td><button onclick="deleteComponent(${component.id})" class="delete-btn">Delete</button></td>
    `;
    tbody.appendChild(row);
  });
}

function deleteComponent(id) {
  if (confirm('Are you sure you want to delete this component?')) {
    let components = JSON.parse(localStorage.getItem('components')) || [];
    components = components.filter(c => c.id !== id);
    localStorage.setItem('components', JSON.stringify(components));
    loadComponents();
    alert('Component deleted successfully!');
  }
}

function exportComponents() {
  const components = JSON.parse(localStorage.getItem('components')) || [];

  if (components.length === 0) {
    alert('No components to export!');
    return;
  }

  const csvData = components.map(c => {
    const values = [c.name, c.type, c.description, c.wiki, c.status, c.createdDate];
    return values.map(v => `"${v.replace(/"/g, '""')}"`).join(',');
  });

  const header = '"Name","Type","Description","Wiki Link","Status","Created Date"';
  const csv = header + '\n' + csvData.join('\n');

  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `components-${new Date().toISOString().split('T')[0]}.csv`);
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
