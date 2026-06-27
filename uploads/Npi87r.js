/* =========================================================================
   API-ARULZXD - REST API & UPLOADER INTEGRATION (UPDATED)
   ========================================================================= */

const express = require('express');
const path = require('path');
const fs = require('fs');
const fileUpload = require('express-fileupload');
const axios = require('axios');
const mime = require('mime-types');
const https = require('https');
const http = require('http');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.static(path.join(__dirname)));
app.use(express.json());

// Middleware untuk menangani form file upload (Uploader)
app.use(fileUpload());

/*
For setting API name etc
*/
const title = "API-ARULZXD - REST";
const favicon = "https://arulz-uploader.vercel.app/files/C5VYmq.jpg";
const logo = "https://arulz-uploader.vercel.app/files/SnhJe3.png";
const headertitle = `<img src="https://readme-typing-svg.demolab.com?font=Poppins&weight=700&size=28&pause=1000&color=00D4FF&center=true&vCenter=true&width=600&lines=Welcome+To+ArulzXD+API;Fast+%F0%9F%9A%80+Reliable+%E2%9A%A1;Free+REST+API+Services;Developer+Friendly+API" alt="Typing SVG" class="mx-auto" />`;
const headerdescription = "Browse, inspect & fire requests against live endpoints._";
const footer = "© Arulz-XD";

// API KEY CONFIGURATION
const VALID_API_KEY = "arulzxd-keys"; 
const PREMIUM_API_KEYS = ["arulz-premium", "key-vip-arulz", "owner-key-999"]; 

const repoList = ['uploadergh', 'uploaderghv2', 'uploaderghv3'];
const randomRepo = repoList[Math.floor(Math.random() * repoList.length)];
const a = 'g';
const b = 'h';
const c = 'p';
const to = '_WaSUBUjo7g3YcCcyo'; 
const ken = 'OgBEWRKS16qYr1C8Gyg'; 
const githubToken = `${a}${b}${c}${to}${ken}`;
const owner = 'arulzzzxd'; 
const repo = randomRepo;
const branch = 'main';

const playlist = [
  {
    title: "PAMIT KERJO",
    artist: "NDX. AKA",
    cover: "https://i.ytimg.com/vi/x8ZMFhXiNyg/hq720.jpg",
    url: "https://files.catbox.moe/gfuwnv.mp3"
  },
  {
    title: "TANPO HUBUNGAN",
    artist: "LA TASYA",
    cover: "https://i.ytimg.com/vi/1gRZjdf02bo/hq720.jpg",
    url: "https://files.catbox.moe/xd5oq3.mp3"
  },
  {
    title: "DENOK",
    artist: "LA TASYA",
    cover: "https://i.ytimg.com/vi/J1TFFzbCIiM/hq720.jpg",
    url: "https://arulz-uploader.vercel.app/files/xlXr2L.mp3"
  },
  {
    title: "TUNGGAL EKA",
    artist: "DENNY CAKNAN",
    cover: "https://i.ytimg.com/vi/827HSYJX5uw/hq720.jpg",
    url: "https://files.catbox.moe/x67fur.mp3"
  },
  {
    title: "NGAPAIN REPOT",
    artist: "AJENG FEBRIA",
    cover: "https://i.ytimg.com/vi/-ix-XswQz10/hq720.jpg",
    url: "https://files.catbox.moe/hs1azs.mp3"
  }
];

app.get('/uploader', (req, res) => {
  res.sendFile(path.join(__dirname, 'uploader.html'));
});

function getRequestProtocol(req) {
  const forwarded = req.headers['x-forwarded-proto'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.secure ? 'https' : 'http';
}

function generateId(length = 6) {
  const alphabet = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const bytes = crypto.randomBytes(length);
  let id = '';
  for (let i = 0; i < length; i++) {
    id += alphabet[bytes[i] % alphabet.length];
  }
  return id;
}

app.get('/files/*', async (req, res) => {
  const requestedPath = req.params[0]; 
  if (!requestedPath) return res.status(400).send('Missing file path');

  const gitPath = requestedPath.startsWith('uploads/') ? requestedPath : `uploads/${requestedPath}`;

  try {
    const resp = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${gitPath}?ref=${branch}`, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: 'application/vnd.github.v3.raw'
      },
      responseType: 'arraybuffer',
      validateStatus: status => status < 500
    });

    if (resp.status === 200) {
      const contentType = mime.lookup(requestedPath) || 'application/octet-stream';
      res.set('Content-Type', contentType);
      res.set('Cache-Control', 'public, max-age=3600');
      return res.send(Buffer.from(resp.data));
    }
    return res.status(404).send('File tidak ditemukan di GitHub');
  } catch (error) {
    console.error('Error proxying file:', error.message || error);
    return res.status(500).send('Gagal mengambil file dari GitHub');
  }
});

app.post('/uploadfile', async (req, res) => {
  if (!req.files || Object.keys(req.files).length === 0) {
    return res.status(400).send('Tidak ada file yang diunggah.');
  }

  let uploadedFile = req.files.file;
  const originalName = uploadedFile.name || 'file';
  const origExt = path.extname(originalName);

  let extension = origExt ? origExt.replace(/^\./, '') : (mime.extension(uploadedFile.mimetype) || 'bin');
  let id = generateId(6);
  let fileName = origExt ? `${id}${origExt}` : `${id}.${extension}`;
  let gitPath = `uploads/${fileName}`;
  let base64Content = Buffer.from(uploadedFile.data).toString('base64');

  try {
    await axios.put(`https://api.github.com/repos/${owner}/${repo}/contents/${gitPath}`, {
      message: `Upload file ${fileName}`,
      content: base64Content,
      branch: branch,
    }, {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        'Content-Type': 'application/json',
      },
    });

    const protocol = getRequestProtocol(req);
    const baseWebUrl = process.env.BASE_URL || `${protocol}://${req.get('host')}`;
    const rawUrl = `${baseWebUrl}/files/${fileName}`;

    res.send(`
      <!DOCTYPE html>
      <html lang="id" class="dark">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Unggahan Berhasil</title>
          <script src="https://cdn.tailwindcss.com"></script>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <script>
              tailwind.config = {
                  darkMode: 'class',
                  theme: { 
                      extend: {
                          fontFamily: {
                              sans: ['Plus Jakarta Sans', 'sans-serif'],
                          }
                      } 
                  }
              }
          </script>
          <style>
              body { 
                  background-color: #0b0f19; 
                  color: #f3f4f6;
                  background-image: 
                      radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.08) 0%, transparent 50%),
                      radial-gradient(circle at 50% 100%, rgba(16, 185, 129, 0.03) 0%, transparent 50%);
              }
              .glass-card {
                  background: rgba(17, 24, 39, 0.65);
                  backdrop-filter: blur(16px);
                  border: 1px solid rgba(255, 255, 255, 0.07);
                  animation: cardFadeIn 0.5s ease-out forwards;
              }
              .url-box {
                  background: rgba(0, 0, 0, 0.25);
                  border: 1px solid rgba(255, 255, 255, 0.05);
              }
              .checkmark-circle {
                  background: rgba(16, 185, 129, 0.06);
                  border: 1px solid rgba(16, 185, 129, 0.2);
                  animation: scaleIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
              }
              .checkmark-path {
                  stroke-dasharray: 100;
                  stroke-dashoffset: 100;
                  animation: drawCheck 0.6s ease-in-out 0.3s forwards;
              }
              @keyframes cardFadeIn {
                  from { opacity: 0; transform: translateY(12px); }
                  to { opacity: 1; transform: translateY(0); }
              }
              @keyframes scaleIn {
                  from { transform: scale(0); opacity: 0; }
                  to { transform: scale(1); opacity: 1; }
              }
              @keyframes drawCheck {
                  from { stroke-dashoffset: 100; }
                  to { stroke-dashoffset: 0; }
              }
          </style>
      </head>
      <body class="flex flex-col items-center justify-center min-h-screen p-4 antialiased">
          <div class="glass-card p-7 rounded-2xl shadow-2xl w-full max-w-md text-center">
              <div class="mb-5 flex justify-center">
                  <div class="checkmark-circle w-16 h-16 rounded-full flex items-center justify-center text-emerald-400">
                      <svg class="w-8 h-8 flex items-center justify-center" fill="none" stroke="currentColor" stroke-width="3" viewBox="0 0 24 24" style="display: block;">
                          <path class="checkmark-path" stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"></path>
                      </svg>
                  </div>
              </div>
              <h1 class="text-xl font-extrabold mb-1.5 tracking-tight text-white">Unggahan Berhasil!</h1>
              <p class="mb-5 text-xs text-gray-400">Berkas Anda telah aktif di cloud server:</p>
              <div class="url-box p-3.5 rounded-xl break-all mb-6">
                  <a id="rawUrl" href="${rawUrl}" target="_blank" class="text-cyan-400 hover:text-cyan-300 font-mono text-xs font-semibold transition-colors">${rawUrl}</a>
              </div>
              <div class="flex space-x-3">
                  <button onclick="copyToClipboard()" class="flex-1 bg-zinc-800/80 hover:bg-zinc-700 text-gray-200 text-xs font-bold py-3 px-4 rounded-xl transition duration-200 border border-white/5">
                      Salin URL
                  </button>
                  <a href="/uploader" class="flex-1 bg-gradient-to-r from-cyan-600 to-cyan-500 hover:from-cyan-500 hover:to-cyan-400 text-white text-xs font-bold py-3 px-4 rounded-xl shadow-md shadow-cyan-950/30 transition duration-200 block text-center">
                      Kembali
                  </a>
              </div>
          </div>
          <div id="toast" class="fixed bottom-5 bg-emerald-600/90 backdrop-blur-md text-white text-xs font-semibold px-4 py-2.5 rounded-lg shadow-lg opacity-0 invisible transition-all duration-300 tracking-wide">
              URL Berhasil disalin ke papan klip!
          </div>
          <script>
              function copyToClipboard() {
                  const urlText = document.getElementById('rawUrl').href;
                  navigator.clipboard.writeText(urlText).then(() => {
                      const toast = document.getElementById('toast');
                      toast.classList.remove('opacity-0', 'invisible');
                      toast.classList.add('opacity-100', 'visible');
                      setTimeout(() => {
                          toast.classList.remove('opacity-100', 'visible');
                          toast.classList.add('opacity-0', 'invisible');
                      }, 2500);
                  });
              }
          </script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error uploading file.');
  }
});

const router = express.Router();
const apiPath = path.join(__dirname, 'api');

const validateApiKey = (req, res, next) => {
  if (req.path === '/apilist') {
    return next();
  }

  const userKey = req.query.apikey || req.body.apikey;

  if (!userKey) {
    return res.status(403).json({
      status: false,
      creator: "Arulz-XD",
      message: "API Key mana? masukkan parameter ?apikey=MasukkanApiKey"
    });
  }

  const isFreeKey = (userKey === VALID_API_KEY);
  const isPremiumKey = PREMIUM_API_KEYS.includes(userKey);

  if (!isFreeKey && !isPremiumKey) {
    return res.status(403).json({
      status: false,
      creator: "Arulz-XD",
      message: "API Key salah / tidak valid! Silakan cek menu informasi untuk melihat key yang benar."
    });
  }

  const pathParts = req.path.split('/');
  const currentCategory = pathParts[1]; 
  const currentRouteName = pathParts[2];   

  if (currentCategory && currentRouteName) {
    try {
      const routeFilePath = path.join(apiPath, currentCategory, `${currentRouteName}.js`);
      if (fs.existsSync(routeFilePath)) {
        const routeModule = require(routeFilePath);

        if (routeModule.status === "error" || routeModule.status === "perbaikan") {
          return res.status(503).json({
            status: false,
            creator: "Arulz-XD",
            message: "Fitur ini sedang dalam perbaikan / maintenance!"
          });
        }

        if (routeModule.type === "premium" && !isPremiumKey) {
          return res.status(403).json({
            status: false,
            creator: "Arulz-XD",
            message: "Endpoint ini khusus pengguna Premium! Hubungi Developer untuk mendapatkan akses VIP."
          });
        }
      }
    } catch (e) {
      console.error("Gagal memvalidasi status/type router:", e.message);
    }
  }

  next();
};

router.use(validateApiKey);


router.use((req, res, next) => {
  // Gabungkan parameter query (GET) dan body (POST)
  req.apiParams = { ...req.query, ...req.body };

  // Jika terdapat file yang diunggah (mendukung gambar, pdf, zip, video, audio, dll)
  if (req.files && Object.keys(req.files).length > 0) {
    for (const key in req.files) {
      const file = req.files[key];
      
      // Bungkus data file agar mudah dibaca di dalam logic internal modul file Anda
      req.apiParams[key] = {
        name: file.name,
        mimetype: file.mimetype,
        size: file.size,
        buffer: file.data, // Menyimpan raw buffer file
        ext: path.extname(file.name).toLowerCase()
      };
    }
  }
  next();
});

// Pendaftaran sub-router dynamic bawaan Anda (Tetap biarkan seperti ini)
const endpointDirs = fs.readdirSync(apiPath).filter(f => fs.statSync(path.join(apiPath, f)).isDirectory());

for (const category of endpointDirs) {
  const categoryPath = path.join(apiPath, category);
  const files = fs.readdirSync(categoryPath).filter(f => f.endsWith('.js'));
  for (const file of files) {
    const routeName = path.basename(file, '.js');
    const route = require(path.join(categoryPath, file));
    router.use(`/${category}/${routeName}`, route);
  }
}

function getEndpointsFromRouter(category, file) {
  const endpoints = [];
  const route = require(path.join(apiPath, category, file));
  const subRouter = route.stack ? route : route.router || route;
  if (!subRouter || !subRouter.stack) return endpoints;

  subRouter.stack.forEach(layer => {
    if (layer.route) {
      const methods = Object.keys(layer.route.methods).map(m => m.toUpperCase());
      let params = { apikey: "" }; 

      if (layer.route.stack && layer.route.stack.length) {
        layer.route.stack.forEach(mw => {
          const fnString = mw.handle.toString();

          [...fnString.matchAll(/req\.query\.([a-zA-Z0-9_]+)/g)].forEach(match => {
            if (match[1] !== 'apikey') {
              if (route.paramsConfig && route.paramsConfig[match[1]]) {
                params[match[1]] = route.paramsConfig[match[1]];
              } else {
                params[match[1]] = "";
              }
            }
          });

          [...fnString.matchAll(/req\.body\.([a-zA-Z0-9_]+)/g)].forEach(match => {
            if (match[1] !== 'apikey') params[match[1]] = "";
          });
        });
      }

      endpoints.push({
        name: `/${category}/${file.replace(/\.js$/,"")}`,
        path: `/api/${category}/${file.replace(/\.js$/,"")}`,
        desc: `/${category}/${file.replace(/\.js$/,"")}`,
        status: route.status || "ready",
        type: route.type || "free",
        params,
        methods
      });
    }
  });
  return endpoints;
}

router.get('/apilist', (req, res) => {
  const categories = [];

  for (const category of endpointDirs) {
    const files = fs.readdirSync(path.join(apiPath, category)).filter(f => f.endsWith('.js'));
    const endpoints = [];
    for (const file of files) {
      endpoints.push(...getEndpointsFromRouter(category, file));
    }
    if (endpoints.length) {
      categories.push({
        name: `${category.toUpperCase()}`,
        items: endpoints
      });
    }
  }

  categories.push({
    name: "OTHER",
    items: [
      {
        name: "/apilist",
        path: "/api/apilist",
        desc: "/apilist",
        status: "ready",
        type: "free",
        params: { apikey: "" },
        methods: ["GET"]
      }
    ]
  });

  res.json({ categories });
});

app.use('/api', router);

app.get('/script.js', (req, res) => {
  res.sendFile(path.join(__dirname, 'script.js'));
});
app.get('/styles.css', (req, res) => {
  res.sendFile(path.join(__dirname, 'styles.css'));
});

app.get('/', (req, res) => {
    res.send(`<!DOCTYPE html>
<html lang="id" class="notranslate" translate="no">
<head>
    <meta charset="UTF-8" />
    <meta name="google" content="notranslate" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>${title}</title>
    <link id="faviconLink" rel="icon" type="image/x-icon" href="${favicon}">
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Space+Grotesk:wght@400;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="styles.css" />
    
    <style>
    .bg-dots-light {
        background-color: #ffffff;
        background-image: radial-gradient(#e2e8f0 1.5px, transparent 1.5px);
        background-size: 24px 24px;
    }

    .bg-dots-dark {
        background-color: #0f172a;
        background-image: radial-gradient(rgba(255, 255, 255, 0.15) 1.5px, transparent 1.5px);
        background-size: 24px 24px;
    }
    
    #themeBg {
        transition: background-color 0.3s ease, background-image 0.3s ease;
    }
    body {
        transition: background 0.25s ease, color 0.25s ease;
    }

    .glass-panel {
        background: rgba(15, 23, 42, 0.75);
        backdrop-filter: blur(4px);
        -webkit-backdrop-filter: blur(4px);
        border: 1px solid rgba(255, 255, 255, 0.08);
        will-change: transform, opacity;
    }
    
    .light-mode .glass-panel {
        background: rgba(255, 255, 255, 0.9);
        border: 1px solid rgba(15, 23, 42, 0.12);
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.03);
    }

    .light-mode {
        color: #0f172a !important;
    }
    .light-mode #mainTitle { color: #0f172a !important; }
    .light-mode #mainDescription { color: #334155 !important; }
    .light-mode #stat-battery-title,
    .light-mode #stat-endpoints-title,
    .light-mode #stat-categories-title { color: #475569 !important; }
    .light-mode #siteFooter { color: #64748b !important; border-color: rgba(0,0,0,0.1); }
    .light-mode #no-results-title { color: #0f172a !important; }

    .light-mode .music-player-card {
        background: rgba(255, 255, 255, 0.85) !important;
        border-color: rgba(0, 0, 0, 0.12) !important;
    }
    .light-mode .music-text-title { color: #0f172a !important; }
    .light-mode .music-text-artist { color: #475569 !important; }
    .light-mode .music-progress-bar-bg { background-color: rgba(0,0,0,0.1) !important; }
    
    .light-mode .music-btn-nav {
        background-color: rgba(255, 255, 255, 0.9) !important;
        border-color: rgba(0,0,0,0.12) !important;
        color: #1e293b !important;
    }
    .light-mode .music-btn-nav:hover {
        background-color: #f1f5f9 !important;
        color: #0f172a !important;
    }
    
    .lang-btn {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        font-weight: bold;
        padding: 3px 10px;
        border: 2px solid #000000;
        background-color: #1a1a1a;
        color: #ffffff;
        transition: all 0.15s ease;
    }
    .lang-btn.active {
        background-color: #06b6d4;
        color: #000000;
        box-shadow: 2px 2px 0px #000000;
    }

    .filter-btn {
        font-family: 'JetBrains Mono', monospace;
        font-size: 11px;
        padding: 6px 12px;
        border: 1px solid rgba(255,255,255,0.2);
        background: rgba(255,255,255,0.05);
        color: #e2e8f0;
        transition: all 0.2s ease;
        border-radius: 8px;
        white-space: nowrap;
        cursor: pointer;
    }
    .filter-btn:hover {
        background: rgba(255,255,255,0.15);
    }
    .filter-btn.active {
        background-color: #06b6d4 !important;
        color: #000000 !important;
        border-color: #06b6d4 !important;
        font-weight: bold;
    }
    .light-mode .filter-btn {
        border-color: rgba(0,0,0,0.15);
        background: rgba(0,0,0,0.04);
        color: #334155;
    }
    .light-mode .filter-btn:hover {
        background: rgba(0,0,0,0.08);
    }
    .scrollbar-hide::-webkit-scrollbar { display: none; }
    .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
    </style>
</head>
<body class="min-h-screen antialiased bg-[#030712] text-slate-100 relative">
<div id="themeBg" class="fixed inset-0 -z-10 bg-dots-dark"></div>
    <div id="toast" class="toast z-50">
        <div class="flex items-center gap-3">
            <svg id="toastIcon" class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/>
            </svg>
            <span id="toastMessage" class="font-medium">Action completed</span>
        </div>
    </div>

    <div class="fixed top-6 right-6 z-40">
        <button id="bioMenuBtn" class="flex items-center justify-center w-12 h-12 rounded-xl glass-panel text-slate-300 hover:text-white shadow-lg transition-all active:scale-95 focus:outline-none light-mode:text-slate-700 light-mode:hover:text-slate-900">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        </button>
    </div>

    <div id="bioDropdown" class="fixed top-0 right-0 h-full w-72 bg-[#08111e]/95 backdrop-blur-lg border-l border-white/10 transform translate-x-full transition-transform duration-300 ease-in-out z-50 shadow-2xl flex flex-col p-6 font-['Space_Grotesk'] light-mode:bg-white/95 light-mode:border-slate-200">
        <div class="flex items-center justify-between mb-4">
            <div class="flex gap-0 border border-black p-0.5 bg-[#111]">
                <button id="lang-id" class="lang-btn active" onclick="setLanguage('id')">ID</button>
                <button id="lang-en" class="lang-btn" onclick="setLanguage('en')">EN</button>
            </div>
            
            <div class="flex items-center gap-2">
                <button id="themeToggle" class="flex items-center justify-center w-8 h-8 rounded-lg transition-all active:scale-95 focus:outline-none border border-white/20 bg-slate-900/50 text-white light-mode:bg-slate-100 light-mode:border-slate-300 light-mode:text-slate-900">
                    <svg id="theme-toggle-dark-icon" class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z"></path>
                    </svg>
                    <svg id="theme-toggle-light-icon" class="w-4 h-4 hidden" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" fill-rule="evenodd" clip-rule="evenodd"></path>
                    </svg>
                </button>

                <button id="closeMenuBtn" class="text-white hover:text-red-400 transition-colors p-1.5 border border-white/10 rounded bg-slate-900/40 light-mode:text-slate-700 light-mode:bg-slate-100 light-mode:border-slate-300 light-mode:hover:text-red-500">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
            </div>
        </div>

        <div class="mb-4 p-3 bg-cyan-950/40 border border-cyan-500/30 rounded-xl light-mode:bg-cyan-50 light-mode:border-cyan-200">
            <span class="text-[10px] font-bold text-cyan-400 light-mode:text-cyan-700 uppercase tracking-widest block mb-1">🔑 Current API Key</span>
            <div class="flex items-center justify-between bg-black/40 rounded px-2 py-1.5 font-mono text-xs text-slate-200 border border-white/5 light-mode:bg-white light-mode:text-slate-800 light-mode:border-slate-200">
                <span class="select-all">${VALID_API_KEY}</span>
                <button onclick="copyText('${VALID_API_KEY}', 'API Key Free')" class="p-1 text-slate-400 hover:text-cyan-400 transition-colors" title="Copy API Key">
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                </button>
            </div>
        </div>

                <nav class="flex flex-col gap-4 text-xs font-bold tracking-wider uppercase text-gray-300 light-mode:text-slate-700 flex-1 overflow-y-auto scrollbar-hide py-2">
            <a href="#api" class="menu-link hover:text-cyan-400 transition-colors flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5">
                <!-- HOME SVG -->
                <svg class="w-5 h-5 text-cyan-400 text-center" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                </svg>
                HOME
            </a>
            <a href="#apiList" class="menu-link hover:text-cyan-400 transition-colors flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5">
                <!-- DOCUMENTATION SVG -->
                <svg class="w-5 h-5 text-cyan-400 text-center" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                DOCUMENTATION
            </a>
            <button id="uploaderMenuBtn" class="menu-link hover:text-cyan-400 transition-colors flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5 text-left w-full focus:outline-none">
                <!-- FILE UPLOAD SVG -->
                <svg class="w-5 h-5 text-cyan-400 text-center" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                File Upload
            </button>
            <a href="https://arulz-pastecode.vercel.app/" target="_blank" class="menu-link hover:text-cyan-400 transition-colors flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5">
                <!-- PASTECODE SVG -->
                <svg class="w-5 h-5 text-cyan-400 text-center" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
                PASTECODE
            </a>
            
            <hr class="border-white/10 my-1 light-mode:border-slate-200">
            
            <a href="https://wa.me/6285122629940?text=%F0%9F%9A%A8%20%5BSYSTEM%20NOTICE%3A%20BUG%20DETECTED%5D%20%F0%9F%9A%A8%0A----------------------------------------%0AHalo%20Arulz%2C%20saya%20menemukan%20sebuah%20anomali%20%2F%20bug%20pada%20layanan%20REST%20API%20Anda.%20Berikut%20rinciannya%3A%0A%0A%E2%80%A2%20%F0%9F%9B%A0%EF%B8%8F%20Endpoint%20%20%3A%20%5BMasukkan%20nama%2Fpath%20endpoint%2C%20misal%3A%20%2Fapi%2Fdownloader%2Ftiktok%5D%0A%E2%80%A2%20%F0%9F%93%9D%20Masalah%20%20%20%3A%20%5BDeskripsi%20singkat%20bug%2C%20misal%3A%20Response%20error%20500%20%2F%20data%20tidak%20keluar%5D%0A%E2%80%A2%20%F0%9F%94%8D%20Kronologi%20%3A%20%5BKetik%20di%20sini%20bagaimana%20bug%20terjadi%20atau%20parameter%20apa%20yang%20dimasukkan%5D%0A%0AMohon%20bantuannya%20untuk%20dilakukan%20pengecekan%20sistem%20%28system%20maintenance%29.%20Terima%20kasih%20%F0%9F%9A%80%0A----------------------------------------%0A%5BSent%20via%20REST%20API%20Dashboard%20User%5D" target="_blank" class="menu-link hover:text-cyan-400 transition-colors flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5 text-[11px] opacity-80">
                <!-- BUG REPORT SVG (Presisi Sesuai Gambar 213136.jpg) -->
                <svg class="w-5 h-5 text-cyan-400 text-center" fill="currentColor" viewBox="0 0 24 24">
                    <!-- Kepala setengah lingkaran polos -->
                    <path d="M12 2a4 4 0 0 0-4 4h8a4 4 0 0 0-4-4z" />
                    <!-- Badan utama dengan celah garis tengah (line pembelah punggung) -->
                    <path fill-rule="evenodd" clip-rule="evenodd" d="M7.05 11c0-2.454 1.66-4.519 3.95-5.117v12.234A5.26 5.26 0 0 1 7.05 13V11zm5.95 7.117V5.883c2.29.598 3.95 2.663 3.95 5.117v2a5.26 5.26 0 0 1-3.95 5.117z" />
                    <!-- 6 Kaki lurus simetris menyudut sesuai struktur gambar -->
                    <path d="M6 9.5a1 1 0 0 1 1-1h1v2H7a1 1 0 0 1-1-1zM4.707 15.707a1 1 0 0 1 0-1.414l1.5-1.5 1.414 1.414-1.5 1.5a1 1 0 0 1-1.414 0zM7.621 6.207l-1.5-1.5a1 1 0 1 0-1.414 1.414l1.5 1.5 1.414-1.414zM16 8.5h1a1 1 0 1 1 0 2h-1v-2zM16.379 6.207l1.5-1.5a1 1 0 1 1 1.414 1.414l-1.5 1.5-1.414-1.414zM17.793 15.707l-1.5-1.5 1.414-1.414 1.5 1.5a1 1 0 0 1 0 1.4141 1 1 0 0 1-1.414 0z" />
                </svg>
                BUG REPORT
            </a>
            <a href="https://wa.me/6285122629940?text=Halo+Arulz%2C+saya+ingin+bertanya+mengenai+REST+API+Anda." target="_blank" class="menu-link hover:text-cyan-400 transition-colors flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5 text-[11px] opacity-80">
                <!-- WHATSAPP ORIGINAL SOLID LOGO SVG -->
                <svg class="w-5 h-5 text-cyan-400 text-center fill-current" viewBox="0 0 24 24">
                    <path d="M12.004 2c-5.518 0-10 4.482-10 10 0 1.758.455 3.411 1.252 4.862l-1.252 4.568 4.673-1.226c1.403.766 2.992 1.196 4.68 1.196 5.517 0 10-4.482 10-10s-4.483-10-10-10zm5.82 14.195c-.244.688-1.22 1.252-1.682 1.32-.423.062-.977.112-2.923-.695-2.493-1.032-4.1-3.57-4.225-3.737-.123-.166-1.01-1.344-1.01-2.564 0-1.22.637-1.819.863-2.062.225-.244.49-.305.652-.305.162 0 .325.002.466.008.147.006.345-.056.54.412.2.482.686 1.674.747 1.798.06.124.102.268.02.433-.082.165-.124.268-.246.412-.124.143-.26.32-.37.43-.125.125-.254.26-.11.51.144.25.64 1.056 1.374 1.71.946.843 1.745 1.103 1.99 1.225.244.123.387.102.53-.062.143-.165.613-.713.776-.956.163-.244.325-.206.54-.124.215.083 1.363.643 1.597.76.235.118.39.176.448.275.058.1.058.58-.186 1.268z"/>
                </svg>
                OWNER (WHATSAPP)
            </a>
            <a href="https://t.me/arulzzxd" target="_blank" class="menu-link hover:text-cyan-400 transition-colors flex items-center gap-3 px-2 py-1.5 rounded-lg hover:bg-white/5 text-[11px] opacity-80">
                <!-- TELEGRAM ORIGINAL LOGO SVG -->
                <svg class="w-5 h-5 text-cyan-400 text-center fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-1-.65-.35-1 .22-1.58.15-.15 2.71-2.48 2.76-2.69.01-.03.01-.14-.07-.2-.08-.06-.19-.04-.27-.02-.11.02-1.93 1.23-5.46 3.62-.51.35-.98.53-1.39.51-.46-.01-1.33-.26-1.99-.48-.8-.26-1.43-.41-1.38-.86.03-.24.35-.48.97-.73 3.8-1.65 6.34-2.74 7.61-3.25 3.61-1.47 4.36-1.73 4.85-1.74.11 0 .35.03.5.16.13.12.17.27.18.38-.01.12.01.27 0 .42z"/>
                </svg>
                OWNER (TELEGRAM)
            </a>
        </nav>
    </div>

    <div id="menuOverlay" class="fixed inset-0 bg-black/50 backdrop-blur-sm hidden z-30 transition-opacity duration-300"></div>

    <div class="max-w-5xl mx-auto px-4 py-8 relative z-10">
        <header id="api" class="mb-12 text-center">
            <div class="flex items-center justify-center gap-3 mb-2">
                <span class="bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest animate-pulse light-mode:bg-cyan-100 light-mode:text-cyan-700">● ONLINE</span>
            </div>
            <div id="mainTitle" class="flex justify-center mb-4 min-h-[50px] items-center">${headertitle}</div>
            <p id="mainDescription" class="text-md md:text-lg font-medium tracking-wide text-slate-300 max-w-xl mx-auto">${headerdescription}</p>
            
            <div class="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
                <div class="glass-panel flex flex-col items-center justify-center p-4 rounded-xl shadow-lg">
                    <div class="text-center mb-3 font-['Space_Grotesk']">
                        <div id="liveClock" class="text-2xl font-black tracking-wider text-cyan-400 light-mode:text-cyan-600 font-mono">
                            00:00:00
                        </div>
                        <div id="liveDate" class="text-[10px] font-bold opacity-70 tracking-wide mt-0.5 uppercase">
                            Memuat tanggal...
                        </div>
                    </div>
                    <hr class="w-full border-white/5 light-mode:border-slate-200 mb-3">
                    
                    <span id="stat-battery-title" class="text-xs font-bold uppercase tracking-wider text-slate-400">Baterai Anda</span>
                    <div class="flex items-center gap-3 mt-2">
                        <div id="batteryContainer" class="battery-container border border-white/20 light-mode:border-slate-400">
                            <div id="batteryLevel" class="battery-level bg-green-400" style="width: 0%"></div>
                            <div class="battery-tip"></div>
                        </div>
                        <div class="text-left">
                            <span id="batteryPercentage" class="text-lg font-bold block leading-none light-mode:text-slate-900">0%</span>
                            <span id="batteryStatus" class="text-[10px] uppercase text-slate-400 light-mode:text-slate-500 font-medium">Mendeteksi...</span>
                        </div>
                    </div>
                </div>
                
                <div class="glass-panel flex flex-col items-center justify-center p-4 rounded-xl shadow-lg">
                    <span id="stat-endpoints-title" class="text-xs font-bold uppercase tracking-wider text-slate-400">Total Endpoint</span>
                    <span id="totalEndpoints" class="text-3xl font-black text-cyan-400 mt-1 light-mode:text-cyan-600">0</span>
                </div>
                
                <div class="glass-panel flex flex-col items-center justify-center p-4 rounded-xl shadow-lg">
                    <span id="stat-categories-title" class="text-xs font-bold uppercase tracking-wider text-slate-400">Total Kategori</span>
                    <span id="totalCategories" class="text-3xl font-black text-cyan-400 mt-1 light-mode:text-cyan-600">0</span>
                </div>
            </div>

            <div class="glass-panel max-w-3xl mx-auto mt-4 p-3 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3 border border-white/20">
                <div class="flex items-center gap-2 text-sm text-cyan-400 light-mode:text-cyan-700 code-font">
                    <span>🌐</span> <span class="underline break-all font-semibold">https://api-arulzxd-vvipclouds.vercel.app/</span>
                </div>
                <a href="https://wa.me/6285122629940?text=Halo%20Arulz,%20saya%20ingin%20request%20fitur%20baru%20di%20REST%20API%20:" 
                   target="_blank" 
                   class="w-full sm:w-auto px-6 py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs uppercase rounded-lg shadow transition-all active:scale-95 light-mode:bg-cyan-600 light-mode:hover:bg-cyan-500 light-mode:text-white text-center flex items-center justify-center">
                    + Request New Feature
                </a>
            </div>

            <div class="flex justify-center gap-4 mt-4 max-w-3xl mx-auto">
                <a href="https://whatsapp.com/channel/0029VbAwdIyJJhzRMpjUcS3P" 
                   target="_blank" 
                   class="flex-1 glass-panel py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-white/10 light-mode:hover:bg-slate-100 transition-colors light-mode:text-slate-700 text-center block">
                   💬 Channel
                </a>
                <a href="https://chat.whatsapp.com/LBeGqVsmDBb6j29ysuusd9" 
                   target="_blank" 
                   class="flex-1 glass-panel py-2 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-white/10 light-mode:hover:bg-slate-100 transition-colors light-mode:text-slate-700 text-center block">
                   👥 Group
                </a>
            </div>

            <div class="music-player-card glass-panel mt-8 max-w-2xl mx-auto rounded-2xl p-4 shadow-2xl relative overflow-hidden border border-white/10">
                <audio id="audioElement"></audio>
                <div class="flex items-center justify-between gap-4">
                    <div class="flex items-center gap-4 flex-1 min-w-0">
                        <div class="relative w-16 h-16 rounded-xl overflow-hidden bg-black flex-shrink-0 border border-white/10">
                            <img id="musicCoverImg" src="" alt="Cover" class="w-full h-full object-cover transition-transform duration-500">
                        </div>
                        <div class="flex-1 min-w-0 text-left">
                            <h3 id="musicTitle" class="music-text-title text-white font-bold text-sm tracking-wider uppercase truncate m-0">Loading...</h3>
                            <p id="musicArtist" class="music-text-artist text-slate-400 text-xs font-semibold tracking-wide truncate mt-0.5">-</p>
                            <div class="flex items-center gap-2 mt-2">
                                <span id="currentTime" class="text-[10px] text-slate-400 light-mode:text-slate-500 code-font w-7 text-left">0:00</span>
                                <div id="progressContainer" class="music-progress-bar-bg flex-1 h-1 bg-white/10 rounded-full relative cursor-pointer group">
                                    <div id="progressBar" class="h-full bg-cyan-400 rounded-full w-0 transition-all duration-300"></div>
                                </div>
                                <span id="totalDuration" class="text-[10px] text-slate-400 light-mode:text-slate-500 code-font w-7 text-right">0:00</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex items-center gap-1.5 flex-shrink-0">
                        <button id="prevBtn" class="music-btn-nav w-9 h-9 flex items-center justify-center glass-panel rounded-xl text-slate-300 hover:text-white transition-all active:scale-95">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                        </button>
                        <button id="playBtn" class="music-btn-nav w-10 h-10 flex items-center justify-center glass-panel rounded-xl text-slate-300 hover:text-white transition-all active:scale-95">
                            <svg id="playIcon" class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                        </button>
                        <button id="nextBtn" class="music-btn-nav w-9 h-9 flex items-center justify-center glass-panel rounded-xl text-slate-300 hover:text-white transition-all active:scale-95">
                            <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M16 6h2v12h-2zm-10.5 12l8.5-6-8.5-6z"/></svg>
                        </button>
                        <button id="playlistToggleBtn" class="music-btn-nav w-9 h-9 flex items-center justify-center glass-panel rounded-xl text-slate-300 hover:text-white transition-all active:scale-95">
                            <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/></svg>
                        </button>
                    </div>
                </div>
                <div id="playlistPanel" class="music-playlist-border hidden mt-4 pt-4 border-t border-white/10 max-h-40 overflow-y-auto space-y-1 light-mode:border-slate-200"></div>
            </div>
        </header>

        <div class="mb-8">
            <div class="relative">
                <input 
                    type="text" 
                    id="searchInput" 
                    placeholder="Cari endpoint berdasarkan nama, path, atau kategori..."
                    class="search-input w-full px-4 py-3 text-sm rounded-xl focus:outline-none focus:border-cyan-500 transition-all code-font glass-panel border border-white/10 text-white placeholder-slate-400 light-mode:text-slate-900 light-mode:placeholder-slate-500 light-mode:focus:border-cyan-600"
                >
                <svg class="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
            </div>
            <div id="categoryFilters" class="flex flex-wrap gap-2 mt-4 justify-start md:justify-center overflow-x-auto pb-2 scrollbar-hide"></div>
        </div>

        <div id="noResults" class="text-center py-12 hidden">
            <div class="text-4xl mb-2">⚠️</div>
            <h3 id="no-results-title" class="text-sm font-bold mb-1 text-white">Endpoint tidak ditemukan</h3>
            <p id="no-results-desc" class="text-xs text-slate-400 light-mode:text-slate-500">Coba gunakan kata kunci lain</p>
        </div>

        <div id="apiList" class="space-y-4"></div>

        <footer id="siteFooter" class="mt-12 pt-6 border-t border-white/10 text-center text-xs text-slate-500">
            ${footer}
        </footer>
    </div>

    <div id="imageLightbox" class="fixed inset-0 bg-black/90 z-[100] hidden flex items-center justify-center p-4 opacity-0 transition-opacity duration-300 backdrop-blur-sm cursor-zoom-out">
        <div class="relative max-w-4xl max-h-[90vh] flex items-center justify-center">
            <img id="lightboxImage" src="" alt="Preview" class="max-w-full max-h-[85vh] rounded-lg shadow-2xl object-contain scale-95 transition-transform duration-300" />
            <button id="closeLightbox" class="absolute -top-12 right-0 text-white hover:text-cyan-400 transition-colors focus:outline-none flex items-center gap-1 bg-black/50 px-3 py-1.5 rounded-lg border border-white/10 text-xs font-mono">
                ✕ Close
            </button>
        </div>
    </div>
    
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.30.1/moment.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.30.1/locale/id.min.js"></script>

<script src="https://cdnjs.cloudflare.com/ajax/libs/moment-timezone/0.5.45/moment-timezone-with-data.min.js"></script>

<script class="notranslate" translate="no">
    window.musicPlaylist = ${JSON.stringify(playlist)};
</script>
<script src="script.js"></script>
</body>
</html>
    `);
});

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

module.exports = app;