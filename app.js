// hush home: runs inside tizenbrew on the tv (served from 127.0.0.1:8081).
// for previews on the mac, pass ?tv=<tv ip> to aim app launches at the real tv.

const params = new URLSearchParams(location.search);
const TV = params.get('tv') || '127.0.0.1';
const HUSH = `http://${params.get('mac') || '192.168.1.236'}:8787`;
const IN_TIZENBREW = location.port === '8081';

const APPS = [
  { key: 'netflix', name: 'Netflix', appId: '3201907018807', icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/49/40/c4/4940c495-d5d5-00ac-0d3b-65945eb7e4a2/AppIcon-0-0-1x_U007epad-0-1-0-sRGB-0-85-220.png/512x512bb.jpg' },
  { key: 'disney', name: 'Disney+', appId: '3201901017640', icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/fa/74/2f/fa742f2d-ce8d-f1ab-18b4-c7a775d5ba94/AppIcon-0-0-1x_U007emarketing-0-8-0-0-0-85-220.png/512x512bb.jpg' },
  { key: 'prime', name: 'Prime Video', appId: '3201910019365', icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/1b/66/ff/1b66ffd8-2f43-9f46-f4ad-f308ad3dcb13/AppIcon-0-0-1x_U007epad-0-1-0-0-85-220.png/512x512bb.jpg' },
  { key: 'youtube', name: 'YouTube', appId: '111299001912', module: 'tizentube', badge: 'no ads', icon: 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/82/43/be/8243be7f-17c3-33ae-720a-ffcde48bed61/logo_youtube_2024_q4_color-0-0-1x_U007emarketing-0-0-0-7-0-0-0-85-220.png/512x512bb.jpg' },
];

// original avatar art: a chill tabby in headphones, and a goofy googly-eyed blob
const AVATARS = {
  p1: `<svg viewBox="0 0 200 200">
    <path d="M44 104c0-46 25-70 56-70s56 24 56 70" fill="none" stroke="#15171a" stroke-width="11" stroke-linecap="round"/>
    <path d="M52 92 60 40l34 30zM148 92l-8-52-34 30z" fill="#8f959e"/>
    <path d="M62 78 66 52l18 18zM138 78l-4-26-18 18z" fill="#6c717a"/>
    <ellipse cx="100" cy="116" rx="60" ry="52" fill="#9ca2aa"/>
    <path d="M90 74v12M100 70v15M110 74v12" stroke="#6f757d" stroke-width="5" stroke-linecap="round"/>
    <path d="M68 112q12-7 24 0M108 112q12-7 24 0" fill="none" stroke="#1b1d21" stroke-width="5" stroke-linecap="round"/>
    <path d="M70 106h20M110 106h20" stroke="#7d838b" stroke-width="4" stroke-linecap="round"/>
    <path d="M95 126h10l-5 6z" fill="#f2a7b8"/>
    <path d="M90 136q5 5 10 0q5 5 10 0" fill="none" stroke="#1b1d21" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M58 128h-22M58 136l-20 6M142 128h22M142 136l20 6" stroke="#e8eaed" stroke-width="2.5" stroke-linecap="round" opacity=".7"/>
    <rect x="26" y="96" width="26" height="44" rx="12" fill="#1c1e22"/>
    <rect x="148" y="96" width="26" height="44" rx="12" fill="#1c1e22"/>
    <rect x="32" y="104" width="6" height="28" rx="3" fill="#d6d9df"/>
    <rect x="162" y="104" width="6" height="28" rx="3" fill="#d6d9df"/>
  </svg>`,
  p2: `<svg viewBox="0 0 200 200">
    <path d="M100 52c0-14 4-22 10-28" fill="none" stroke="#3f9a5a" stroke-width="5" stroke-linecap="round"/>
    <path d="M108 30c10-12 26-10 30-4-8 8-20 10-30 4zM104 36c-8-12-24-12-28-6 8 8 20 10 28 6z" fill="#5cc17a"/>
    <path d="M38 128c0-48 28-78 62-78s62 30 62 78c0 30-26 46-62 46s-62-16-62-46z" fill="#ff9cc4"/>
    <ellipse cx="62" cy="140" rx="13" ry="8" fill="#ff6fa3" opacity=".55"/>
    <ellipse cx="140" cy="140" rx="13" ry="8" fill="#ff6fa3" opacity=".55"/>
    <circle cx="76" cy="104" r="24" fill="#fff"/>
    <circle cx="86" cy="112" r="10" fill="#1b1d21"/>
    <circle cx="130" cy="100" r="14" fill="#fff"/>
    <circle cx="124" cy="94" r="6" fill="#1b1d21"/>
    <path d="M80 142q20 18 40 0z" fill="#7a2140"/>
    <path d="M98 148q-2 20 10 20t8-22z" fill="#ff5e8e"/>
    <path d="M107 152v10" stroke="#e0467a" stroke-width="2" stroke-linecap="round"/>
  </svg>`,
};

const PROFILES = {
  p1: { name: 'User 1', theme: 'graphite', avatar: 'linear-gradient(150deg, #4a4e56, #1d1f23)' },
  p2: { name: 'User 2', theme: 'blush', avatar: 'linear-gradient(150deg, #ffd1e3, #ff8fbd)' },
};

// real names live on the mac, never in this public repo; the tv keeps the last ones it heard
let names = {};
try {
  names = JSON.parse(storage('hush.names') || '{}');
} catch (e) {
  names = {};
}

function nameOf(key) {
  return names[key] || PROFILES[key].name;
}

function paintNames() {
  document.querySelectorAll('.person').forEach((el) => {
    el.querySelector('.person-name').textContent = nameOf(el.dataset.profile);
  });
  if (state.profile) {
    document.getElementById('me-name').textContent = nameOf(state.profile);
    tickClock();
  }
}

// a picture dropped into the mac's avatars folder wins over the built-in art
function paintAvatar(el, key) {
  el.style.background = PROFILES[key].avatar;
  el.innerHTML = AVATARS[key];
  const img = new Image();
  img.onload = () => {
    el.innerHTML = '';
    el.appendChild(img);
  };
  img.src = `${HUSH}/avatars/${key}`;
}

const ICONS = {
  gamepad: '<svg viewBox="0 0 24 24"><path d="M6 9h4M8 7v4M15 10h.01M18 8h.01"/><path d="M7.5 4.5h9A5.5 5.5 0 0 1 22 10v4.5a3 3 0 0 1-5.3 1.9L15 14H9l-1.7 2.4A3 3 0 0 1 2 14.5V10a5.5 5.5 0 0 1 5.5-5.5z"/></svg>',
  shield: '<svg viewBox="0 0 24 24"><path d="M12 3l7 3v6c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6z"/><path d="M9 12l2 2 4-4"/></svg>',
};

const state = { profile: null, mac: null, focus: null, countdown: null };

// stage scaling for non-1080p previews; the tv is 1920x1080 already
function fit() {
  const s = Math.min(innerWidth / 1920, innerHeight / 1080);
  document.getElementById('stage').style.transform = `scale(${s})`;
}
addEventListener('resize', fit);
fit();

function storage(key, value) {
  try {
    if (value === undefined) return localStorage.getItem(key);
    localStorage.setItem(key, value);
  } catch (e) {
    return null;
  }
}

// MARK: focus and remote navigation

function focusables() {
  const screen = document.querySelector('.screen:not([hidden])');
  return [...screen.querySelectorAll('.focusable')];
}

function setFocus(el) {
  if (!el) return;
  state.focus?.classList.remove('focused');
  state.focus = el;
  el.classList.add('focused');
}

// nearest element in the pressed direction, favouring ones lined up with the current focus
function move(dir) {
  const from = state.focus?.getBoundingClientRect();
  if (!from) return setFocus(focusables()[0]);
  const fx = from.left + from.width / 2;
  const fy = from.top + from.height / 2;
  let best = null;
  let bestScore = Infinity;
  for (const el of focusables()) {
    if (el === state.focus) continue;
    const r = el.getBoundingClientRect();
    const dx = r.left + r.width / 2 - fx;
    const dy = r.top + r.height / 2 - fy;
    const along = { left: -dx, right: dx, up: -dy, down: dy }[dir];
    if (along <= 1) continue;
    const across = dir === 'left' || dir === 'right' ? Math.abs(dy) : Math.abs(dx);
    const score = along + across * 2.5;
    if (score < bestScore) {
      bestScore = score;
      best = el;
    }
  }
  if (best) setFocus(best);
}

addEventListener('keydown', (e) => {
  stopCountdown();
  const dir = { 37: 'left', 38: 'up', 39: 'right', 40: 'down' }[e.keyCode];
  if (dir) {
    e.preventDefault();
    move(dir);
  } else if (e.keyCode === 13) {
    e.preventDefault();
    state.focus?.click();
  } else if (e.keyCode === 10009 || e.keyCode === 27) {
    // tv back button: stay home instead of dropping to tizenbrew
    e.preventDefault();
    if (!document.getElementById('home').hidden) showWho();
  }
});

addEventListener('mousemove', (e) => {
  const el = e.target.closest?.('.focusable');
  if (el) setFocus(el);
});

// MARK: who's watching

function showWho() {
  document.getElementById('home').hidden = true;
  document.getElementById('who').hidden = false;
  const last = storage('hush.profile') || 'p1';
  setFocus(document.querySelector(`.person[data-profile="${last}"]`));
  startCountdown(last);
}

function startCountdown(key) {
  let left = 4;
  const hint = document.getElementById('who-hint');
  const tick = () => {
    hint.textContent = `Continuing as ${nameOf(key)} in ${left}`;
    if (left-- === 0) {
      stopCountdown();
      choose(key);
    }
  };
  tick();
  state.countdown = setInterval(tick, 1000);
}

function stopCountdown() {
  if (!state.countdown) return;
  clearInterval(state.countdown);
  state.countdown = null;
  document.getElementById('who-hint').textContent = '';
}

function choose(key) {
  const profile = PROFILES[key];
  state.profile = key;
  storage('hush.profile', key);
  document.body.dataset.theme = profile.theme;
  document.getElementById('me-name').textContent = nameOf(key);
  paintAvatar(document.getElementById('me-avatar'), key);
  document.getElementById('who').hidden = true;
  document.getElementById('home').hidden = false;
  renderHome();
  setFocus(document.querySelector('.app'));
}

document.querySelectorAll('.person').forEach((el) => {
  paintAvatar(el.querySelector('.avatar'), el.dataset.profile);
  el.addEventListener('click', () => {
    stopCountdown();
    choose(el.dataset.profile);
  });
});
document.getElementById('me').addEventListener('click', showWho);

// MARK: home

function renderHome() {
  const apps = document.getElementById('apps');
  apps.innerHTML = '';

  // ps5 leads the row: it's the most used thing on this tv
  const ps5 = document.createElement('button');
  ps5.className = 'app focusable';
  ps5.id = 'ps5';
  ps5.innerHTML = `
    <span class="app-icon lift ps5-icon">${ICONS.gamepad}<span class="ps5-word">PS5</span></span>
    <span class="app-name">PlayStation<span class="badge" id="ps5-badge"></span></span>`;
  ps5.addEventListener('click', () => {
    pressed(ps5);
    playPS5();
  });
  apps.appendChild(ps5);

  for (const app of APPS) {
    const el = document.createElement('button');
    el.className = 'app focusable';
    el.innerHTML = `
      <span class="app-icon lift"><span class="fallback">${app.name}</span><img alt=""></span>
      <span class="app-name">${app.name}${app.badge ? `<span class="badge">${app.badge}</span>` : ''}</span>`;
    const img = el.querySelector('img');
    img.onload = () => el.querySelector('.fallback').remove();
    img.onerror = () => img.remove();
    img.src = app.icon;
    el.addEventListener('click', () => {
      pressed(el);
      launch(app);
    });
    apps.appendChild(el);
  }
  renderCards();
  tickClock();
}

function renderCards() {
  const mac = state.mac;
  const badge = document.getElementById('ps5-badge');
  if (badge) {
    // switching the tv needs the mac; without it the tile can't do anything
    badge.textContent = mac ? { on: 'on', rest: 'asleep', off: 'off' }[mac.ps5] || '' : 'mac offline';
    document.getElementById('ps5').classList.toggle('unavailable', !mac);
  }

  const cards = document.getElementById('cards');
  const focusedKey = state.focus?.dataset.card;
  cards.innerHTML = '';
  if (!mac) return;

  const blocking = mac.protection ? `${mac.blocked.toLocaleString()} ads blocked today` : 'Ad blocking is off';
  addCard(cards, 'blocking', ICONS.shield, 'Hush', blocking, mac.protection, null);

  if (focusedKey) setFocus(cards.querySelector(`[data-card="${focusedKey}"]`));
}

function addCard(parent, key, icon, title, status, on, action) {
  const el = document.createElement('button');
  el.className = `card focusable${on ? ' on' : ''}`;
  el.dataset.card = key;
  el.innerHTML = `<span class="card-icon">${icon}</span><span><div class="card-title">${title}</div><div class="card-status">${status}</div></span>`;
  if (action) el.addEventListener('click', action);
  parent.appendChild(el);
}

function tickClock() {
  const now = new Date();
  let h = now.getHours();
  const m = String(now.getMinutes()).padStart(2, '0');
  const part = h < 12 ? 'morning' : h < 18 ? 'afternoon' : 'evening';
  h = h % 12 || 12;
  document.getElementById('clock').textContent = `${h}:${m}`;
  document.getElementById('date').textContent = now.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  const name = state.profile ? nameOf(state.profile) : '';
  document.getElementById('greeting').textContent = `Good ${part}${name ? `, ${name}` : ''}`;
}
setInterval(tickClock, 10000);

// MARK: launching

function pressed(el) {
  el.classList.add('pressed');
  setTimeout(() => el.classList.remove('pressed'), 140);
}

let toastTimer = null;
function toast(text) {
  let el = document.querySelector('.toast');
  if (!el) {
    el = document.createElement('div');
    el.className = 'toast';
    document.getElementById('stage').appendChild(el);
  }
  el.textContent = text;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.remove(), 2200);
}

// errors from the tv's browser are invisible otherwise; ship them to the mac's log
function report(message) {
  try {
    new Image().src = `${HUSH}/api/log/${encodeURIComponent(message)}`;
  } catch (e) {}
}

function launch(app) {
  toast(`Opening ${app.name}`);
  if (app.module) {
    launchModule(app.module).then((ok) => {
      report(`module ${app.module} via tizenbrew: ${ok}`);
      if (!ok) launchTizenBrewModule('npm', '@foxreis/tizentube');
    });
    return;
  }
  // 1: the tv's own app api, when the runtime hands it to module pages
  if (window.tizen && tizen.application) {
    try {
      tizen.application.launch(
        app.appId,
        () => report(`tizen launch ok ${app.key}`),
        (e) => {
          report(`tizen launch failed ${app.key}: ${e.name} ${e.message}`);
          launchElsewhere(app);
        },
      );
      return;
    } catch (e) {
      report(`tizen launch threw ${app.key}: ${e.message}`);
    }
  }
  launchElsewhere(app);
}

// 2: the mac relays to the tv's rest api (known to work); 3: hit that api directly
function launchElsewhere(app) {
  if (state.mac) {
    post(`/api/launch/${app.appId}`);
    return;
  }
  fetch(`http://${TV}:8001/api/v2/applications/${app.appId}`, { method: 'POST', mode: 'no-cors' })
    .then(() => report(`direct rest sent ${app.key}`))
    .catch((e) => report(`direct rest failed ${app.key}: ${e.message}`));
}

function playPS5() {
  if (!state.mac) return toast('The Mac is offline, so Hush can’t switch inputs');
  toast(state.mac.ps5 === 'on' ? 'Switching to PS5' : 'Waking the PS5');
  post('/api/ps5');
}

// inside tizenbrew: ask its service for the module list, launch the match, then navigate, the same way tizenbrew's own ui does
function launchModule(match) {
  return new Promise((resolve) => {
    if (!IN_TIZENBREW) return resolve(false);
    let ws;
    try {
      ws = new WebSocket('ws://localhost:8081');
    } catch (e) {
      return resolve(false);
    }
    const timer = setTimeout(() => {
      ws.close();
      resolve(false);
    }, 3000);
    ws.onopen = () => ws.send(JSON.stringify({ type: 4, payload: true }));
    ws.onmessage = (e) => {
      const msg = JSON.parse(e.data);
      if (msg.type !== 4 || !Array.isArray(msg.payload)) return;
      clearTimeout(timer);
      const mdl = msg.payload.find((m) => (m.fullName || m.name || '').toLowerCase().includes(match));
      if (!mdl) {
        ws.close();
        return resolve(false);
      }
      ws.send(JSON.stringify({ type: 5, payload: mdl }));
      resolve(true);
      setTimeout(() => {
        location.href = mdl.appPath;
      }, 150);
    };
    ws.onerror = () => {
      clearTimeout(timer);
      resolve(false);
    };
  });
}

// outside tizenbrew: relaunch tizenbrew with the module as app-control data
function launchTizenBrewModule(type, name) {
  fetch(`http://${TV}:8001/api/v2/applications/xvvl3S1bvH.TizenBrewStandalone`, {
    method: 'POST',
    mode: 'no-cors',
    body: JSON.stringify({ moduleName: name, moduleType: type }),
  }).catch(() => {});
}

// MARK: the mac (optional: ps5, ad stats)

function post(path) {
  fetch(HUSH + path, { method: 'POST' }).catch(() => {});
}

async function pollMac() {
  try {
    const res = await fetch(`${HUSH}/api/state`, { cache: 'no-store' });
    state.mac = await res.json();
  } catch (e) {
    state.mac = null;
  }
  if (!document.getElementById('home').hidden) renderCards();
}

async function loadNames() {
  try {
    const res = await fetch(`${HUSH}/api/profiles`, { cache: 'no-store' });
    names = await res.json();
    storage('hush.names', JSON.stringify(names));
    paintNames();
  } catch (e) {}
}

paintNames();
showWho();
report(`boot origin=${location.origin} tizen=${!!window.tizen} appApi=${!!(window.tizen && tizen.application)} ua=${navigator.userAgent}`);
loadNames();
pollMac();
setInterval(pollMac, 15000);
