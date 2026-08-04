export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  const rawBackend = process.env.BACKEND_URL || process.env.VITE_BASEURL || 'http://localhost:3000';
  // Ensure backend base URL does not end with a trailing slash or an extra '/api'
  let backendBaseUrl = rawBackend.replace(/\/+$/, '');
  if (backendBaseUrl.endsWith('/api')) {
    backendBaseUrl = backendBaseUrl.slice(0, -4);
  }

  // req.url is expected to start with '/api/...'; join without duplicating '/api'
  const path = req.url.startsWith('/') ? req.url : `/${req.url}`;
  const targetUrl = `${backendBaseUrl}${path}`;

  const headers = {};
  Object.entries(req.headers || {}).forEach(([key, value]) => {
    if (value === undefined) return;
    headers[key] = Array.isArray(value) ? value.join(',') : value;
  });

  delete headers.host;

  let body;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    const chunks = [];
    for await (const chunk of req) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    if (chunks.length > 0) {
      body = Buffer.concat(chunks);
    }
  }

  const response = await fetch(targetUrl, {
    method: req.method,
    headers,
    body,
  });

  const responseText = await response.text();

  res.status(response.status);
  response.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  res.send(responseText);
}
