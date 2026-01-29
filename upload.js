const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');

const SERVER_URL = process.env.UPLOAD_SERVER || 'http://localhost:8080/upload';
const WATCH_DIR = process.env.WATCH_DIR || './watch';

async function uploadFile(filePath) {
  const filename = filePath.split('/').pop();
  const fileData = fs.readFileSync(filePath);

  const form = new FormData();
  form.append('file', fileData, filename);

  await axios.post(SERVER_URL, form, {
    headers: form.getHeaders(),
    maxContentLength: Infinity,
    maxBodyLength: Infinity
  });
}

function startWatching(watchDir) {
  if (!fs.existsSync(watchDir)) {
    fs.mkdirSync(watchDir, { recursive: true });
  }

  const existingFiles = fs.readdirSync(watchDir);
  for (const file of existingFiles) {
    const filePath = watchDir + '/' + file;
    if (fs.statSync(filePath).isFile()) {
      uploadFile(filePath);
    }
  }

  fs.watch(watchDir, (eventType, filename) => {
    if (!filename) return;

    const filePath = watchDir + '/' + filename;

    if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
      uploadFile(filePath);
    }
  });
}

// Start watching
const watchDir = process.argv[2] || WATCH_DIR;
startWatching(watchDir);
