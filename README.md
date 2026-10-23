# Content Governance Dashboard

A browser-based dashboard for tracking content expiry, reviewing Workfront intake data, and using text utilities.

## Features

- Content Tracking dashboard records with expiry filtering, charts, CSV export, and automatic local saving
- MPR Deck CSV import, all-data and month views, leadership KPIs, assignee workload, charts, search, and export
- Snake Case Converter, Text Compare, and URL Decoder/Encoder utilities
- Browser localStorage persistence

## Login

- Username: `Admin`
- Password: `admin`

## Local Development

Run locally with:

```bash
python -m http.server 8000
```

Then open `http://localhost:8000/login.html`.

## Main Files

- `index.html` / `app.js` - Dashboard
- `mpr-deck.html` / `mpr-deck.js` - MPR Deck
- `snake-case.html` / `snake-case.js` - Snake Case Converter
- `text-compare.html` / `text-compare.js` - Text Compare
- `url-encoder.html` / `url-encoder.js` - URL Decoder/Encoder
- `login.html` / `login.js` - Login
- `style.css` - Shared styling
