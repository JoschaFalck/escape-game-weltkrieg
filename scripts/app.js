/* ============================================================
   ARCHIV 45 – app.js
   Alle JavaScript-Funktionen für Fortschritt, Navigation,
   Validierung und Sidebar-Steuerung
   ============================================================ */

const STORAGE_KEY = 'archiv45_progress_v1';

// ════════════════════════════════════════
// 0. SOUND-SYSTEM (Web Audio API – keine Datei nötig)
// ════════════════════════════════════════

const _audioCtx = (function() {
  try { return new (window.AudioContext || window.webkitAudioContext)(); } catch(e) { return null; }
})();

function _tone(freq, type, vol, start, dur) {
  if (!_audioCtx) return;
  try {
    const o = _audioCtx.createOscillator();
    const g = _audioCtx.createGain();
    o.connect(g); g.connect(_audioCtx.destination);
    o.type = type; o.frequency.setValueAtTime(freq, _audioCtx.currentTime + start);
    g.gain.setValueAtTime(vol, _audioCtx.currentTime + start);
    g.gain.exponentialRampToValueAtTime(0.0001, _audioCtx.currentTime + start + dur);
    o.start(_audioCtx.currentTime + start);
    o.stop(_audioCtx.currentTime + start + dur);
  } catch(e) {}
}

function playSound(type) {
  if (!_audioCtx) return;
  if (_audioCtx.state === 'suspended') _audioCtx.resume();
  if (type === 'correct') {
    _tone(523, 'sine', 0.22, 0,    0.18);
    _tone(659, 'sine', 0.18, 0.1,  0.22);
    _tone(784, 'sine', 0.16, 0.2,  0.35);
  } else if (type === 'incorrect') {
    _tone(220, 'sawtooth', 0.18, 0,   0.18);
    _tone(175, 'sawtooth', 0.14, 0.1, 0.22);
  } else if (type === 'warning') {
    _tone(440, 'sine', 0.18, 0, 0.12);
    _tone(440, 'sine', 0.14, 0.18, 0.1);
  } else if (type === 'unlock') {
    _tone(392, 'sine', 0.18, 0,    0.1);
    _tone(523, 'sine', 0.2,  0.1,  0.12);
    _tone(659, 'sine', 0.2,  0.22, 0.14);
    _tone(784, 'sine', 0.22, 0.36, 0.3);
    _tone(1047,'sine', 0.2,  0.55, 0.45);
  }
}

// ════════════════════════════════════════
// 0b. STEMPEL-ANIMATION
// ════════════════════════════════════════

function showStamp(taskNum) {
  const taskEl = document.getElementById('task-' + taskNum);
  const docCard = taskEl && taskEl.querySelector('.document-card');
  if (!docCard) return;
  const stamp = document.createElement('div');
  stamp.className = 'analysiert-stamp';
  stamp.textContent = 'ANALYSIERT ✓';
  docCard.appendChild(stamp);
  // Trigger animation after paint
  requestAnimationFrame(function() {
    requestAnimationFrame(function() { stamp.classList.add('stamped'); });
  });
  setTimeout(function() { stamp.classList.add('stamp-settle'); }, 600);
}

// ════════════════════════════════════════
// 0c. KONFETTI
// ════════════════════════════════════════

function launchConfetti() {
  const canvas = document.createElement('canvas');
  canvas.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:9998;';
  document.body.appendChild(canvas);
  const ctx = canvas.getContext('2d');
  canvas.width  = window.innerWidth;
  canvas.height = window.innerHeight;
  const colors  = ['#c9a227','#27ae60','#2980b9','#e67e22','#9b59b6','#e74c3c','#1a8fa5'];
  const pieces  = [];
  for (let i = 0; i < 130; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: -10 - Math.random() * 250,
      w: 6 + Math.random() * 8,
      h: 3 + Math.random() * 5,
      color: colors[Math.floor(Math.random() * colors.length)],
      angle: Math.random() * Math.PI * 2,
      spin:  (Math.random() - 0.5) * 0.25,
      vx:    (Math.random() - 0.5) * 3.5,
      vy:    2.5 + Math.random() * 4,
      op:    1
    });
  }
  let f = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    pieces.forEach(function(p) {
      p.x += p.vx; p.y += p.vy; p.angle += p.spin;
      if (f > 80) p.op = Math.max(0, p.op - 0.013);
      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate(p.angle);
      ctx.globalAlpha = p.op;
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.w/2, -p.h/2, p.w, p.h);
      ctx.restore();
    });
    f++;
    if (f < 190) requestAnimationFrame(draw);
    else canvas.remove();
  }
  draw();
}

// ════════════════════════════════════════
// 0d. HINTERGRUNDMUSIK-PLAYER
// ════════════════════════════════════════

let _musicEl    = null;
let _musicOn    = false;
let _trackIdx   = 0;
const MUSIC_KEY  = 'archiv45_music_v1';
const TRACK_KEY  = 'archiv45_track_v1';

const _TRACKS = [
  { file: 'hitslab-epic-war-background-music-333128.mp3',         name: 'Kriegsatmosphäre' },
  { file: 'sergepavkinmusic-soldiers-154022.mp3',                  name: 'Soldaten' },
  { file: 'lexin_music-inspiring-cinematic-ambient-116199.mp3',    name: 'Cinematic Ambient' },
  { file: 'ob-lix-heilir-sir-norse-viking-background-music-114582.mp3', name: 'Nordisch I' },
  { file: 'ob-lix-the-gift-pagan-norse-background-music-117479.mp3',    name: 'Nordisch II' },
];

function _getAudioPath(file) {
  const isMappe = document.body.classList.contains('mappe-page');
  return (isMappe ? '../' : './') + 'audio/' + file;
}

function _updateMusicBtn() {
  const btn   = document.getElementById('music-toggle');
  const label = document.getElementById('music-track-name');
  if (btn) btn.classList.toggle('music-on', _musicOn);
  if (label) label.textContent = _TRACKS[_trackIdx].name;
}

function initMusicPlayer() {
  _trackIdx = parseInt(sessionStorage.getItem(TRACK_KEY) || '0', 10);
  if (_trackIdx < 0 || _trackIdx >= _TRACKS.length) _trackIdx = 0;

  _musicEl = document.createElement('audio');
  _musicEl.id      = 'bg-music';
  _musicEl.loop    = false;   // kein Loop – Auto-Advance übernimmt das Weiterlaufen
  _musicEl.volume  = 0.3;
  _musicEl.preload = 'none';
  _musicEl.src     = _getAudioPath(_TRACKS[_trackIdx].file);
  document.body.appendChild(_musicEl);

  // Auto-Advance: wenn ein Track zu Ende ist, automatisch den nächsten starten
  _musicEl.addEventListener('ended', function() {
    changeTrack(+1);
  });

  // Player-Container
  const wrap = document.createElement('div');
  wrap.id = 'music-player';
  wrap.innerHTML =
    '<button id="music-toggle" title="Musik ein/aus" aria-label="Musik ein/aus">' +
      '<span class="music-icon">🎵</span>' +
      '<span id="music-track-name" class="music-label">' + _TRACKS[_trackIdx].name + '</span>' +
    '</button>' +
    '<button id="music-prev" title="Vorheriger Track" aria-label="Vorheriger Track">‹</button>' +
    '<button id="music-next" title="Nächster Track" aria-label="Nächster Track">›</button>';
  document.body.appendChild(wrap);

  document.getElementById('music-toggle').addEventListener('click', toggleMusic);
  document.getElementById('music-prev').addEventListener('click', function() { changeTrack(-1); });
  document.getElementById('music-next').addEventListener('click', function() { changeTrack(+1); });

  // In jeder Mappe Musik automatisch starten – unabhängig davon ob der Nutzer
  // sie in der vorherigen Mappe ausgeschaltet hatte.
  _musicOn = true;
  sessionStorage.setItem(MUSIC_KEY, 'on');
  _musicEl.play().catch(function() {
    // Browser-Autoplay-Policy hat abgelehnt (z. B. kein vorheriger User-Klick).
    // Player zeigt dann „aus"-Zustand; Nutzer kann manuell starten.
    _musicOn = false;
    sessionStorage.removeItem(MUSIC_KEY);
  });
  _updateMusicBtn();
}

function toggleMusic() {
  if (!_musicEl) return;
  if (_musicOn) {
    _musicEl.pause();
    _musicOn = false;
    sessionStorage.setItem(MUSIC_KEY, 'off');
  } else {
    _musicEl.play().catch(function() {});
    _musicOn = true;
    sessionStorage.setItem(MUSIC_KEY, 'on');
  }
  _updateMusicBtn();
}

function changeTrack(dir) {
  _trackIdx = (_trackIdx + dir + _TRACKS.length) % _TRACKS.length;
  sessionStorage.setItem(TRACK_KEY, String(_trackIdx));
  const wasPlaying = _musicOn;
  _musicEl.pause();
  _musicEl.src = _getAudioPath(_TRACKS[_trackIdx].file);
  _musicEl.load();
  if (wasPlaying) _musicEl.play().catch(function() {});
  _updateMusicBtn();
}

// Automatischer Track-Wechsel beim Mappe-Abschluss.
// Wird von checkCode() aufgerufen, wenn der Code korrekt ist.
// Wechselt sofort auf den nächsten Track (während Konfetti läuft)
// und stellt sicher, dass die nächste Mappe automatisch startet.
function _autoAdvanceToNextMappe() {
  var nextIdx = (_trackIdx + 1) % _TRACKS.length;
  // Für die nächste Seite merken: welcher Track + Musik an
  sessionStorage.setItem(TRACK_KEY, String(nextIdx));
  sessionStorage.setItem(MUSIC_KEY, 'on');
  // Sofort wechseln, falls der Player bereits läuft
  if (_musicEl) {
    _trackIdx = nextIdx;
    _musicEl.pause();
    _musicEl.src = _getAudioPath(_TRACKS[_trackIdx].file);
    _musicEl.load();
    // Kurze Pause: erst den Unlock-Sound ausspielen lassen (ca. 1,1 s)
    setTimeout(function() {
      _musicEl.play().catch(function() {});
      _musicOn = true;
      _updateMusicBtn();
    }, 1100);
  }
}

// ════════════════════════════════════════
// 1. SPEICHER-FUNKTIONEN (localStorage)
// ════════════════════════════════════════

function getProgress() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return freshProgress();
    return JSON.parse(stored);
  } catch (e) {
    return freshProgress();
  }
}

function freshProgress() {
  return { unlockedMappes: [1], completedTasks: {} };
}

function saveProgress(progress) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
  } catch (e) { /* storage not available */ }
}

function isMappeUnlocked(num) {
  if (num === 1) return true;
  const p = getProgress();
  return Array.isArray(p.unlockedMappes) && p.unlockedMappes.includes(num);
}

function isMappeCompleted(num) {
  const p = getProgress();
  const completed = p.completedTasks && p.completedTasks[num];
  if (!completed) return false;
  return completed.includes('done');
}

function unlockMappe(num) {
  const p = getProgress();
  if (!Array.isArray(p.unlockedMappes)) p.unlockedMappes = [1];
  if (!p.unlockedMappes.includes(num)) p.unlockedMappes.push(num);
  saveProgress(p);
}

function markTaskDone(mappeNum, taskId) {
  const p = getProgress();
  if (!p.completedTasks) p.completedTasks = {};
  if (!Array.isArray(p.completedTasks[mappeNum])) p.completedTasks[mappeNum] = [];
  if (!p.completedTasks[mappeNum].includes(taskId)) {
    p.completedTasks[mappeNum].push(taskId);
  }
  saveProgress(p);
}

function isTaskDone(mappeNum, taskId) {
  const p = getProgress();
  const tasks = p.completedTasks && p.completedTasks[mappeNum];
  return Array.isArray(tasks) && tasks.includes(taskId);
}

function resetProgress() {
  if (confirm('Wirklich zurücksetzen? Alle Fortschritte gehen verloren.')) {
    localStorage.removeItem(STORAGE_KEY);
    window.location.reload();
  }
}

// ════════════════════════════════════════
// 2. LEHRER-MODUS
// ════════════════════════════════════════

function isTeacherMode() {
  return sessionStorage.getItem('archiv45_teacher_v1') === 'ok';
}

// ════════════════════════════════════════
// 3. NAVIGATION & KAPITELKREISE
// ════════════════════════════════════════

function updateChapterNav(currentMappe) {
  const teacher = isTeacherMode();
  const circles = document.querySelectorAll('.chapter-circle');
  circles.forEach(circle => {
    const num = parseInt(circle.dataset.mappe, 10);
    circle.classList.remove('current', 'completed', 'available', 'locked');

    if (num === currentMappe) {
      circle.classList.add('current');
      circle.removeAttribute('href'); // Kein Link auf aktuelle Seite
    } else if (teacher) {
      // Lehrer sieht alle Mappen als navigierbar
      circle.classList.add('available');
      circle.title = circle.dataset.title || `Mappe ${num}`;
    } else if (isMappeCompleted(num)) {
      circle.classList.add('completed');
      circle.title = circle.dataset.title || `Mappe ${num}`;
    } else if (isMappeUnlocked(num)) {
      circle.classList.add('available');
      circle.title = circle.dataset.title || `Mappe ${num}`;
    } else {
      circle.classList.add('locked');
      circle.setAttribute('aria-disabled', 'true');
      circle.addEventListener('click', (e) => {
        e.preventDefault();
        showLockedHint();
      });
    }
  });

  // Prev / Next Arrows
  const prevBtn = document.getElementById('prev-mappe');
  const nextBtn = document.getElementById('next-mappe');
  if (prevBtn) {
    if (currentMappe <= 1) { prevBtn.classList.add('disabled'); }
    else { prevBtn.href = `mappe-0${currentMappe - 1}.html`; }
  }
  if (nextBtn) {
    if (currentMappe >= 7) {
      nextBtn.classList.add('disabled');
    } else if (teacher || isMappeUnlocked(currentMappe + 1)) {
      nextBtn.href = `mappe-0${currentMappe + 1}.html`;
    } else {
      nextBtn.classList.add('disabled');
    }
  }
}

function showLockedHint() {
  const hint = document.createElement('div');
  hint.style.cssText = 'position:fixed;top:80px;left:50%;transform:translateX(-50%);background:#8b0000;color:#fff;padding:0.7rem 1.4rem;border-radius:30px;font-family:Lato,sans-serif;font-size:0.88rem;font-weight:700;z-index:9999;box-shadow:0 4px 20px rgba(0,0,0,0.5);';
  hint.textContent = '🔒 Diese Mappe ist noch gesperrt. Löse erst alle Aufgaben der aktuellen Mappe!';
  document.body.appendChild(hint);
  setTimeout(() => hint.remove(), 3500);
}

// ════════════════════════════════════════
// 4. AUFGABEN-STEUERUNG
// ════════════════════════════════════════

let currentMappe = 1;
let totalTasks = 5;

function initApp(mappeNum, numTasks) {
  currentMappe = mappeNum;
  totalTasks = numTasks;

  updateChapterNav(mappeNum);

  if (isTeacherMode()) {
    // Lehrer-Modus: alle Tasks sofort sichtbar, keine Sperren
    unlockAllForTeacher(numTasks);
  } else {
    restoreTaskProgress(mappeNum, numTasks);
  }

  initSidebarToggle();
  initSidebar(mappeNum);
  addTeacherUI();
  initMusicPlayer();
}

// Alle Tasks + Code-Section für Lehrende freischalten
function unlockAllForTeacher(numTasks) {
  for (let i = 1; i <= numTasks; i++) {
    const el = document.getElementById('task-' + i);
    if (el) { el.style.display = 'block'; el.classList.add('visible'); }
  }
  revealCodeSection();
}

function restoreTaskProgress(mappeNum, numTasks) {
  // Alle bereits erledigten Aufgaben wiederherstellen
  for (let i = 1; i <= numTasks; i++) {
    if (isTaskDone(mappeNum, i)) {
      revealTask(i + 1);
      updateSidebarItem(i, 'completed');
    }
  }
  // Code-Section, wenn alle Tasks erledigt
  if (isTaskDone(mappeNum, numTasks)) {
    revealCodeSection();
  }
}

function revealTask(taskNum) {
  const el = document.getElementById('task-' + taskNum);
  if (el) {
    el.style.display = 'block';
    el.classList.add('visible');
    updateSidebarItem(taskNum, 'active');
  }
}

function revealCodeSection() {
  const el = document.getElementById('code-section');
  if (el) {
    el.style.display = 'block';
    el.classList.add('visible');
    updateSidebarItem('code', 'active');
  }
}

// Wird aus dem Inline-Script jeder Mappe aufgerufen, wenn eine Aufgabe richtig gelöst wurde
function completeTask(taskNum) {
  markTaskDone(currentMappe, taskNum);
  updateSidebarItem(taskNum, 'completed');

  // Sound + Stempel
  playSound('correct');
  showStamp(taskNum);

  // Feedback-Button ausblenden (Check-Button)
  const checkBtn = document.querySelector(`#task-${taskNum} .check-btn`);
  if (checkBtn) checkBtn.disabled = true;

  // Next-Task-Button einblenden (verzögert)
  setTimeout(() => {
    const nextBtn = document.getElementById('next-btn-' + taskNum);
    if (nextBtn) {
      nextBtn.classList.add('visible');
      nextBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, 800);
}

// Wird vom Next-Button aufgerufen
function goToNextTask(completedTaskNum) {
  const next = completedTaskNum + 1;
  if (next <= totalTasks) {
    revealTask(next);
    const el = document.getElementById('task-' + next);
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  } else {
    revealCodeSection();
    const el = document.getElementById('code-section');
    if (el) setTimeout(() => el.scrollIntoView({ behavior: 'smooth', block: 'start' }), 100);
  }
}

// ════════════════════════════════════════
// 4. CODE-FREISCHALTUNG
// ════════════════════════════════════════

// Wird aus HTML aufgerufen: checkCode(correctCode, nextMappeNum, nextMappeUrl)
function checkCode(correctCode, nextMappeNum, nextMappeUrl) {
  const input = document.getElementById('unlock-input');
  const feedback = document.getElementById('code-feedback');
  if (!input || !feedback) return;

  const userInput = input.value.trim().toLowerCase().replace(/\s+/g, '');
  const expected = correctCode.toLowerCase().replace(/\s+/g, '');

  if (userInput === expected) {
    // Nächste Mappe freischalten
    if (nextMappeNum <= 7) {
      unlockMappe(nextMappeNum);
      markTaskDone(currentMappe, 'done');
    } else {
      // Letzte Mappe – alles abgeschlossen
      markTaskDone(currentMappe, 'done');
    }
    updateChapterNav(currentMappe);
    playSound('unlock');
    launchConfetti();
    _autoAdvanceToNextMappe(); // Track wechseln + nächste Mappe startet mit Musik

    const weiterLink = `<br><br><a href="../karte.html" class="unlock-btn">🗂 Zurück zur Archiv-Karte →</a>`;

    feedback.innerHTML = `
      <div class="feedback feedback-correct unlock-success">
        <strong>🔓 Richtig! Mappe ${nextMappeNum <= 7 ? nextMappeNum + ' freigeschaltet' : 'abgeschlossen'}!</strong><br>
        Du hast alle Dokumente dieser Akte erfolgreich ausgewertet.
        ${weiterLink}
      </div>`;
  } else {
    feedback.innerHTML = `
      <div class="feedback feedback-incorrect">
        Dieser Code ist nicht korrekt. Überprüfe nochmal deine Antworten – der Code ergibt sich aus einem wichtigen Begriff dieser Mappe.
      </div>`;
  }
}

// ════════════════════════════════════════
// 5. FEEDBACK ANZEIGEN
// ════════════════════════════════════════

function showFeedback(feedbackId, message, type) {
  const el = document.getElementById(feedbackId);
  if (!el) return;
  // Sound basierend auf Feedback-Typ
  if (type === 'incorrect') playSound('incorrect');
  else if (type === 'warning') playSound('warning');
  el.innerHTML = `<div class="feedback feedback-${type}">${message}</div>`;
  // Immer scrollen – ohne Bedingung, damit das Feedback garantiert sichtbar ist.
  // Beide Methoden als Absicherung: scrollIntoView + window.scrollTo.
  setTimeout(() => {
    // Methode 1: scrollIntoView (einfach, funktioniert in den meisten Fällen)
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    // Methode 2: window.scrollTo als Backup (zuverlässiger bei overflow:hidden)
    const rect = el.getBoundingClientRect();
    const targetY = window.pageYOffset + rect.top - 120;
    window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
  }, 200);
}

// ════════════════════════════════════════
// 7. SIDEBAR
// ════════════════════════════════════════

function initSidebar(mappeNum) {
  if (isTeacherMode()) {
    // Lehrer sieht alle Aufgaben und Code-Bereich als zugänglich
    for (let i = 1; i <= totalTasks; i++) {
      updateSidebarItem(i, 'active');
    }
    updateSidebarItem('code', 'active');
    return;
  }
  // Normalmodus: Fortschritt aus localStorage wiederherstellen
  const p = getProgress();
  const done = (p.completedTasks && p.completedTasks[mappeNum]) || [];
  done.forEach(taskId => {
    if (taskId !== 'done') updateSidebarItem(taskId, 'completed');
  });
  // Erste offene Aufgabe als aktiv markieren
  for (let i = 1; i <= totalTasks; i++) {
    if (!done.includes(i)) { updateSidebarItem(i, 'active'); break; }
  }
}

function updateSidebarItem(taskId, state) {
  const item = document.querySelector(`.task-nav-item[data-task="${taskId}"]`);
  if (!item) return;
  item.classList.remove('locked', 'active', 'completed');
  item.classList.add(state);
  const statusEl = item.querySelector('.task-status');
  if (statusEl) {
    if (state === 'completed') statusEl.textContent = '✓';
    else if (state === 'active') statusEl.textContent = '';
    else statusEl.textContent = '🔒';
  }
}

// ════════════════════════════════════════
// 7. VALIDIERUNGS-HELFER
// ════════════════════════════════════════

function validateMC(name) {
  const selected = document.querySelector(`input[name="${name}"]:checked`);
  if (!selected) return { valid: false, value: null };
  return { valid: true, value: selected.value };
}

function validateTF(rowNames) {
  const results = {};
  let allAnswered = true;
  rowNames.forEach(name => {
    const sel = document.querySelector(`input[name="${name}"]:checked`);
    if (!sel) { allAnswered = false; }
    else results[name] = sel.value;
  });
  return { allAnswered, results };
}

function validateMS(name) {
  const checked = document.querySelectorAll(`input[name="${name}"]:checked`);
  return Array.from(checked).map(cb => cb.value);
}

function validateMatching(selectIds) {
  const results = {};
  let allAnswered = true;
  selectIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el || !el.value) { allAnswered = false; }
    else results[id] = el.value;
  });
  return { allAnswered, results };
}

function validateSorting(selectIds) {
  const results = {};
  let allAnswered = true;
  const usedValues = new Set();
  selectIds.forEach(id => {
    const el = document.getElementById(id);
    if (!el || !el.value) { allAnswered = false; }
    else {
      if (usedValues.has(el.value)) allAnswered = false; // Dopplung
      else { usedValues.add(el.value); results[id] = el.value; }
    }
  });
  return { allAnswered, results };
}

// ════════════════════════════════════════
// 8. MOBILE SIDEBAR TOGGLE
// ════════════════════════════════════════

function initSidebarToggle() {
  const btn = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('task-sidebar');
  if (btn && sidebar) {
    btn.addEventListener('click', () => sidebar.classList.toggle('open'));
  }
}

// ════════════════════════════════════════
// 9. LEHRER-UI (Floating Controls + Lösungen-Modal)
// ════════════════════════════════════════

function addTeacherUI() {
  if (!isTeacherMode()) return;

  // Floating-Bar: Lehrer-Kontrollen unten rechts
  const fab = document.createElement('div');
  fab.id = 'teacher-fab';
  fab.innerHTML =
    '<a href="../lehrer.html" id="teacher-back-btn" title="Zur Lehrer-Übersicht">&#8592; Lehrer-Übersicht</a>' +
    '<button id="teacher-solutions-btn" onclick="showSolutions()" title="Alle Musterlösungen anzeigen">&#128203; Lösungen</button>' +
    '<button id="teacher-exit-btn" onclick="exitTeacherMode()" title="Lehrer-Modus beenden – zurück zur Schüler-Ansicht">&#10005; Schüler-Ansicht</button>';
  document.body.appendChild(fab);

  // Modal-Overlay (leer – wird von showSolutions befüllt)
  const overlay = document.createElement('div');
  overlay.id = 'solutions-overlay';
  overlay.innerHTML =
    '<div id="solutions-modal">' +
      '<div id="solutions-header">' +
        '<h2 id="solutions-title">&#128203; Musterlösungen</h2>' +
        '<button id="solutions-close" onclick="hideSolutions()">&#10005;</button>' +
      '</div>' +
      '<div id="solutions-body"></div>' +
    '</div>';
  overlay.addEventListener('click', function(e){ if (e.target === overlay) hideSolutions(); });
  document.body.appendChild(overlay);
}

function exitTeacherMode() {
  sessionStorage.removeItem('archiv45_teacher_v1');
  location.reload();
}

function showSolutions() {
  const overlay = document.getElementById('solutions-overlay');
  const body    = document.getElementById('solutions-body');
  if (!overlay || !body) return;

  // Lösungen aus window.TASK_SOLUTIONS (von der jeweiligen Mappe definiert)
  const solutions = window.TASK_SOLUTIONS;
  if (!solutions || !solutions.tasks || solutions.tasks.length === 0) {
    body.innerHTML = '<p style="color:#555;font-style:italic">Keine Lösungsdaten für diese Mappe hinterlegt.</p>';
  } else {
    const title = document.getElementById('solutions-title');
    if (title && solutions.mappeTitle) title.textContent = '📋 Musterlösungen – ' + solutions.mappeTitle;

    body.innerHTML = solutions.tasks.map(function(t) {
      return '<div class="sol-task">' +
        '<div class="sol-task-header">Aufgabe ' + t.num + ': ' + t.title + '</div>' +
        '<div class="sol-answer">' + t.answer + '</div>' +
        (t.note ? '<div class="sol-note">' + t.note + '</div>' : '') +
      '</div>';
    }).join('');
  }

  // Code-Wort anzeigen
  if (solutions && solutions.code) {
    body.innerHTML += '<div class="sol-code">🔑 Geheimcode: <strong>' + solutions.code + '</strong></div>';
  }

  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
}

function hideSolutions() {
  const overlay = document.getElementById('solutions-overlay');
  if (overlay) overlay.style.display = 'none';
  document.body.style.overflow = '';
}

// ════════════════════════════════════════
// 10. LANDING PAGE INITIALISIERUNG
// ════════════════════════════════════════

function initLandingPage() {
  // ── Startseite = Schüler-Einstieg: Teacher-Session immer beenden ──────────
  // Wer über lehrer.html eingeloggt war und zur Startseite navigiert,
  // soll automatisch im Schüler-Modus landen. Teacher-Login ist über
  // lehrer.html jederzeit erneut möglich.
  sessionStorage.removeItem('archiv45_teacher_v1');

  const cards = document.querySelectorAll('.mappe-card');
  cards.forEach(card => {
    const num = parseInt(card.dataset.mappe, 10);
    card.classList.remove('locked-card', 'completed-card');
    if (isMappeCompleted(num)) {
      card.classList.add('completed-card');
    } else if (!isMappeUnlocked(num)) {
      card.classList.add('locked-card');
    }
  });

  // Reset-Button
  const resetBtn = document.getElementById('reset-btn');
  if (resetBtn) resetBtn.addEventListener('click', resetProgress);

  // Musik automatisch starten, wenn Schüler:in auf "Mission beginnen" klickt.
  // MUSIC_KEY wird gesetzt → mappe-01 erkennt das in initMusicPlayer() und spielt ab.
  var startBtn = document.querySelector('.start-btn');
  if (startBtn) {
    startBtn.addEventListener('click', function() {
      sessionStorage.setItem(MUSIC_KEY, 'on');
    });
  }
}
