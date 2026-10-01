import { createApp } from '../backend/dist/app.js';

let appInstance = null;

function getApp() {
  if (!appInstance) {
    appInstance = createApp();
  }
  return appInstance;
}

export default function handler(req, res) {
  // 1. If Vercel rewrote the request to /api/index.js or /api, resolve original URL
  const matchedPath = req.headers['x-matched-path'] || req.headers['x-forwarded-uri'] || req.headers['x-now-route-matches'];
  if (matchedPath) {
    const cleanMatched = matchedPath.split('?')[0];
    if (cleanMatched && cleanMatched !== '/api/index.js' && cleanMatched !== '/api/index' && cleanMatched !== '/api') {
      const queryIdx = (req.url || '').indexOf('?');
      const queryStr = queryIdx !== -1 ? (req.url || '').substring(queryIdx) : (matchedPath.includes('?') ? matchedPath.substring(matchedPath.indexOf('?')) : '');
      req.url = cleanMatched + queryStr;
    }
  }

  // 2. Ensure req.url starts with /api so all backend Express routes match
  if (req.url && !req.url.startsWith('/api')) {
    req.url = `/api${req.url.startsWith('/') ? req.url : `/${req.url}`}`;
  }

  const app = getApp();
  return app(req, res);
}
