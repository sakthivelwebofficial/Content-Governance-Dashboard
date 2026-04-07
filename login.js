function handleLogin(event) {
  event.preventDefault();

  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const errorMessage = document.getElementById('errorMessage');

  // Default credentials
  if (username === 'Admin' && password === 'admin') {
    // Store session in localStorage
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('username', username);
    
    // Redirect to dashboard
    window.location.href = 'index.html';
  } else {
    errorMessage.textContent = 'Invalid username or password';
    errorMessage.style.display = 'block';
    document.getElementById('password').value = '';
  }
}

// Check if user is already logged in on page load
window.addEventListener('load', () => {
  const isLoggedIn = localStorage.getItem('isLoggedIn');
  if (isLoggedIn) {
    window.location.href = 'index.html';
  }
});
