// Configuration for the API proxy UI

// Update this to your backend API URL
const API_URL = process.env.API_URL || 'http://localhost:3000/api';

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { API_URL };
}
