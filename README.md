# Content Governance Dashboard

A comprehensive content management tool with data governance, filtering, and component management capabilities.

## Features

- **Dashboard** - View and manage content records with real-time editing
- **Date Range Filtering** - Filter records by expiry date
- **Data Export** - Export filtered or all records as CSV
- **Components Management** - Create and maintain a library of reusable UI components
- **User Authentication** - Secure login system (Admin/admin)
- **Local Storage** - Data persists in browser storage

## Login Credentials

- **Username:** Admin
- **Password:** admin

## How to Access

This application is deployed on GitHub Pages and accessible at:
`https://[your-username].github.io/manual-table-dashboard/`

## Local Development

To run locally:
```bash
python -m http.server 8000
```
Then open: `http://localhost:8000/login.html`

## Files

- `login.html` - Login page
- `index.html` - Dashboard with data management
- `components.html` - Component library management
- `about.html` - About and help page
- `app.js` - Dashboard functionality
- `components.js` - Components page functionality
- `login.js` - Login functionality
- `style.css` - All styling

## Data Storage

All data is stored in the browser's localStorage and persists across sessions.
