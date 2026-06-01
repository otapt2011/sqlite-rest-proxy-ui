# SQLite REST API Proxy UI

A modern, responsive frontend for interacting with the SQLite REST API Proxy backend.

## Features

- ✨ **Modern UI** - Clean, responsive design
- 📊 **Database Browser** - View and manage tables
- ➕ **CRUD Operations** - Create, Read, Update, Delete records
- 🔍 **Search & Filter** - Find records easily
- 📄 **Pagination** - Navigate large datasets
- ⚡ **Real-time Updates** - Instant feedback
- 🎨 **Dark Mode Support** - Works in light and dark themes
- 📱 **Mobile Responsive** - Works on all devices

## Quick Start

### Local Development

```bash
npm install
npm run dev
```

Open your browser to `http://localhost:8000`

## Configuration

Edit `app.js` to set your API endpoint:

```javascript
const API_URL = 'http://localhost:3000/api'; // Local development
// or
const API_URL = 'https://your-vercel-app.vercel.app/api'; // Production
```

## Usage

1. **Enter Table Name** - Type the SQLite table name
2. **Load Records** - Click "Load Records" to fetch data
3. **Create Record** - Fill in the form and click "Add Record"
4. **View Record** - Click on any row to see details
5. **Edit Record** - Modify fields and click "Update"
6. **Delete Record** - Click the delete button to remove

## API Integration

This frontend connects to the SQLite REST API Proxy:

- **GET** `/api/:table` - Fetch all records
- **GET** `/api/:table/:id` - Fetch single record
- **POST** `/api/:table` - Create record
- **PUT** `/api/:table/:id` - Update record
- **DELETE** `/api/:table/:id` - Delete record

## Deployment

### Vercel

```bash
vercel deploy
```

### GitHub Pages

Push to repository and enable GitHub Pages in settings.

### Any Static Host

Simply upload the files to any web host (Netlify, Firebase, etc.)

## License

MIT
