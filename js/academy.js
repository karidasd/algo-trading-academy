/* ==========================================================================
   🌑 DARKAIS ACADEMY — PROGRESS, THEME & QUIZ ENGINE (ENHANCED)
   ========================================================================== */

const STORAGE_KEY = 'darkais_academy_progress';
const THEME_KEY = 'darkais_academy_theme';
const MUTE_KEY = 'darkais_academy_muted';

// Audio Effects (Web Audio API synthesis)
let isMuted = localStorage.getItem(MUTE_KEY) === 'true';
const audioCtx = (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) ? new (window.AudioContext || window.webkitAudioContext)() : null;

function playSound(type) {
    if (isMuted || !audioCtx) return;
    if (audioCtx.state === 'suspended') audioCtx.resume();
    
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    if (type === 'success') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, now); // C5
        osc.frequency.exponentialRampToValueAtTime(783.99, now + 0.15); // G5
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
    } else if (type === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(146.83, now + 0.2);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
        osc.start(now);
        osc.stop(now + 0.25);
    } else if (type === 'trade') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(880, now);
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
        osc.start(now);
        osc.stop(now + 0.1);
    }
}

// ── THEME MANAGEMENT ─────────────────────────────────────────────
function initTheme() {
    const saved = localStorage.getItem(THEME_KEY) || 'cyan';
    setTheme(saved);
}

function setTheme(theme) {
    document.body.classList.remove('theme-matrix', 'theme-gold', 'theme-purple');
    if (theme !== 'cyan') {
        document.body.classList.add(`theme-${theme}`);
    }
    localStorage.setItem(THEME_KEY, theme);
}

function toggleMute() {
    isMuted = !isMuted;
    localStorage.setItem(MUTE_KEY, isMuted);
    const btn = document.getElementById('muteBtn');
    if (btn) btn.innerText = isMuted ? '🔇' : '🔊';
}

// ── PROGRESS MANAGEMENT ──────────────────────────────────────────
function getProgress() {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : { completed: [], score: 0 };
    } catch (e) {
        return { completed: [], score: 0 };
    }
}

function markLessonCompleted(lessonId) {
    const prog = getProgress();
    if (!prog.completed.includes(lessonId)) {
        prog.completed.push(lessonId);
        prog.score += 100;
        localStorage.setItem(STORAGE_KEY, JSON.stringify(prog));
        playSound('success');
    }
    updateProgressUI();
}

function updateProgressUI() {
    const TOTAL_LESSONS = 12;
    const prog = getProgress();
    const count = prog.completed.length;
    const pct = Math.round((count / TOTAL_LESSONS) * 100);
    
    // Update header progress badge
    const barEl = document.getElementById('globalProgressBar');
    const textEl = document.getElementById('globalProgressText');
    if (barEl) barEl.style.width = `${pct}%`;
    if (textEl) textEl.innerText = `${pct}% (${count}/${TOTAL_LESSONS})`;
    
    // Highlight completed cards on homepage
    prog.completed.forEach(id => {
        const card = document.querySelector(`[data-lesson-id="${id}"]`);
        if (card) card.classList.add('completed');
        const sideItem = document.querySelector(`[data-sidebar-id="${id}"]`);
        if (sideItem) sideItem.classList.add('done');
    });
}

// ── QUIZ VALIDATION ENGINE ────────────────────────────────────────
function setupQuiz(correctIndex, explanation, lessonId) {
    const container = document.getElementById('quizBox');
    if (!container) return;
    
    const options = container.querySelectorAll('.quiz-option');
    const feedback = document.getElementById('quizFeedback');
    const submitBtn = document.getElementById('quizSubmitBtn');
    let selectedIdx = null;
    
    options.forEach((opt, idx) => {
        opt.addEventListener('click', () => {
            if (container.dataset.locked === 'true') return;
            options.forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            selectedIdx = idx;
            if (submitBtn) submitBtn.disabled = false;
        });
    });
    
    if (submitBtn) {
        submitBtn.addEventListener('click', () => {
            if (selectedIdx === null) return;
            container.dataset.locked = 'true';
            submitBtn.disabled = true;
            
            if (selectedIdx === correctIndex) {
                options[selectedIdx].classList.add('correct');
                feedback.className = 'quiz-feedback show success';
                feedback.innerHTML = `<strong>✓ Correct!</strong> ${explanation}`;
                markLessonCompleted(lessonId);
            } else {
                options[selectedIdx].classList.add('wrong');
                options[correctIndex].classList.add('correct');
                feedback.className = 'quiz-feedback show error';
                feedback.innerHTML = `<strong>✕ Incorrect.</strong> ${explanation}`;
                playSound('error');
            }
        });
    }
}

// ── COPY CODE UTILITY ─────────────────────────────────────────────
function copyCode(btn) {
    const pre = btn.closest('.code-block').querySelector('pre code');
    if (!pre) return;
    navigator.clipboard.writeText(pre.innerText).then(() => {
        const oldText = btn.innerText;
        btn.innerText = 'COPIED!';
        setTimeout(() => { btn.innerText = oldText; }, 2000);
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    updateProgressUI();
    const muteBtn = document.getElementById('muteBtn');
    if (muteBtn) muteBtn.innerText = isMuted ? '🔇' : '🔊';
});
