/* ============================================================
   ARCHIV 45 – app.js
   Alle JavaScript-Funktionen für Fortschritt, Navigation,
   Validierung und Sidebar-Steuerung
   ============================================================ */

const STORAGE_KEY = 'archiv45_progress_v1';

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
// 2. NAVIGATION & KAPITELKREISE
// ════════════════════════════════════════

function updateChapterNav(currentMappe) {
  const circles = document.querySelectorAll('.chapter-circle');
  circles.forEach(circle => {
    const num = parseInt(circle.dataset.mappe, 10);
    circle.classList.remove('current', 'completed', 'available', 'locked');

    if (num === currentMappe) {
      circle.classList.add('current');
      circle.removeAttribute('href'); // Kein Link auf aktuelle Seite
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
    if (currentMappe >= 7 || !isMappeUnlocked(currentMappe + 1)) {
      nextBtn.classList.add('disabled');
    } else {
      nextBtn.href = `mappe-0${currentMappe + 1}.html`;
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
// 3. AUFGABEN-STEUERUNG
// ════════════════════════════════════════

let currentMappe = 1;
let totalTasks = 5;

function initApp(mappeNum, numTasks) {
  currentMappe = mappeNum;
  totalTasks = numTasks;

  updateChapterNav(mappeNum);
  restoreTaskProgress(mappeNum, numTasks);
  initSidebarToggle();
  initSidebar(mappeNum);
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

    const weiterLink = nextMappeUrl
      ? `<br><br><a href="${nextMappeUrl}" class="unlock-btn">Weiter zu Mappe ${nextMappeNum} →</a>`
      : `<br><br><a href="../index.html" class="unlock-btn">🏆 Zur Übersicht</a>`;

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
  el.innerHTML = `<div class="feedback feedback-${type}">${message}</div>`;
}

// ════════════════════════════════════════
// 6. SIDEBAR
// ════════════════════════════════════════

function initSidebar(mappeNum) {
  // Restore alle bereits abgeschlossenen Aufgaben in der Sidebar
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
// 9. LANDING PAGE INITIALISIERUNG
// ════════════════════════════════════════

function initLandingPage() {
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
}
