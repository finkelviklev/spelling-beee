// ===== TRANSLATIONS =====
const i18n = {
  en: {
    subtitle: "Practice your spelling!",
    wordsInList: "words in your list",
    addWords: "Add Words",
    play: "Play!",
    bestScore: "Best score:",
    typeWord: "Type a word...",
    add: "Add",
    or: "or",
    uploadPhoto: "Upload Photo",
    processingPhoto: "Reading your photo...",
    foundWords: "Found these words:",
    addSelected: "Add Selected",
    cancel: "Cancel",
    yourWords: "Your Words",
    clearAll: "Clear All",
    word: "Word",
    of: "of",
    tapToHear: "Tap to hear",
    typeHere: "Type what you hear...",
    check: "Check",
    correct: "Correct!",
    incorrect: "Oops!",
    correctAnswer: "The answer was:",
    greatJob: "Great job!",
    goodWork: "Good work!",
    keepPracticing: "Keep practicing!",
    time: "Time:",
    breakdown: "Breakdown",
    playAgain: "Play Again",
    shareScore: "Share Score",
    backToHome: "Back to Home",
    copied: "Copied to clipboard!",
    needWords: "Add at least 1 word to play!",
    alreadyExists: "Word already in list!",
    noWordsFound: "No words found in photo",
    settings: "Settings",
    wordsPerRound: "Words per round",
    voiceSelection: "Voice",
    preview: "Preview",
    voiceHint: "Select a voice for word pronunciation",
    all: "All",
    perfectScore: "PERFECT! You're a spelling champion!",
    next: "Next",
  },
  it: {
    subtitle: "Pratica la tua ortografia!",
    wordsInList: "parole nella tua lista",
    addWords: "Aggiungi Parole",
    play: "Gioca!",
    bestScore: "Miglior punteggio:",
    typeWord: "Scrivi una parola...",
    add: "Aggiungi",
    or: "oppure",
    uploadPhoto: "Carica Foto",
    processingPhoto: "Leggendo la foto...",
    foundWords: "Parole trovate:",
    addSelected: "Aggiungi Selezionate",
    cancel: "Annulla",
    yourWords: "Le Tue Parole",
    clearAll: "Cancella Tutto",
    word: "Parola",
    of: "di",
    tapToHear: "Tocca per sentire",
    typeHere: "Scrivi quello che senti...",
    check: "Controlla",
    correct: "Corretto!",
    incorrect: "Ops!",
    correctAnswer: "La risposta era:",
    greatJob: "Ottimo lavoro!",
    goodWork: "Bel lavoro!",
    keepPracticing: "Continua a esercitarti!",
    time: "Tempo:",
    breakdown: "Dettagli",
    playAgain: "Gioca Ancora",
    shareScore: "Condividi Punteggio",
    backToHome: "Torna alla Home",
    copied: "Copiato negli appunti!",
    needWords: "Aggiungi almeno 1 parola per giocare!",
    alreadyExists: "Parola già nella lista!",
    noWordsFound: "Nessuna parola trovata nella foto",
    settings: "Impostazioni",
    wordsPerRound: "Parole per turno",
    voiceSelection: "Voce",
    preview: "Anteprima",
    voiceHint: "Seleziona una voce per la pronuncia",
    all: "Tutte",
    perfectScore: "PERFETTO! Sei un campione di ortografia!",
    next: "Avanti",
  },
};

// ===== CONFIG =====
const MAX_GAME_WORDS = 15;
const FEEDBACK_DELAY_CORRECT = 1200;
const FEEDBACK_DELAY_INCORRECT = 2000;
const STORAGE_KEY = "spellbee_data";

// ===== STATE =====
let state = {
  language: "en",
  words: { en: [], it: [] },
  bestScores: { en: null, it: null },
  currentScreen: "home",
  game: null,
  settings: {
    wordsPerRound: 15,
    selectedVoice: { en: "normal", it: "normal" },
  },
};

// ===== SOUND EFFECTS =====
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let audioCtx = null;

function getAudioCtx() {
  if (!audioCtx) audioCtx = new AudioCtx();
  return audioCtx;
}

function playTone(freq, duration, type = "sine", volume = 0.15) {
  try {
    const ctx = getAudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.value = volume;
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}

function playCorrectSound() {
  playTone(523, 0.15);
  setTimeout(() => playTone(659, 0.15), 100);
  setTimeout(() => playTone(784, 0.2), 200);
}

function playIncorrectSound() {
  playTone(330, 0.2, "triangle");
  setTimeout(() => playTone(277, 0.3, "triangle"), 150);
}

function playCompleteSound() {
  [523, 659, 784, 1047].forEach((f, i) => {
    setTimeout(() => playTone(f, 0.2, "sine", 0.12), i * 120);
  });
}

// ===== STORAGE =====
function loadState() {
  try {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      state.language = parsed.language || "en";
      state.words = parsed.words || { en: [], it: [] };
      state.bestScores = parsed.bestScores || { en: null, it: null };
      state.settings = parsed.settings || {
        wordsPerRound: 15,
        selectedVoice: { en: "normal", it: "normal" },
      };
    }
  } catch (e) {}
}

function saveState() {
  try {
    sessionStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        language: state.language,
        words: state.words,
        bestScores: state.bestScores,
        settings: state.settings,
      })
    );
  } catch (e) {}
}

// ===== TRANSLATION =====
function t(key) {
  return i18n[state.language][key] || i18n.en[key] || key;
}

function updateUI() {
  // Update all data-i18n elements
  document.querySelectorAll("[data-i18n]").forEach((el) => {
    el.textContent = t(el.dataset.i18n);
  });
  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });

  // Language buttons
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.lang === state.language);
  });

  // Word count on home
  const count = state.words[state.language].length;
  document.getElementById("home-word-count").textContent = count;
  document.getElementById("btn-play").disabled = count === 0;

  // Best score
  const best = state.bestScores[state.language];
  const bestDisplay = document.getElementById("best-score-display");
  if (best !== null) {
    bestDisplay.style.display = "flex";
    document.getElementById("best-score-value").textContent = `${best}%`;
  } else {
    bestDisplay.style.display = "none";
  }

  // Update html lang
  document.documentElement.lang = state.language;
}

// ===== SCREEN NAVIGATION =====
function showScreen(name) {
  document.querySelectorAll(".screen").forEach((s) => s.classList.remove("active"));
  document.getElementById(`screen-${name}`).classList.add("active");
  state.currentScreen = name;
}

// ===== WORD LIST RENDERING =====
function renderWordList() {
  const list = document.getElementById("word-list");
  const words = state.words[state.language];
  const countEl = document.getElementById("word-list-count");
  const clearBtn = document.getElementById("btn-clear-all");

  countEl.textContent = words.length;
  clearBtn.style.display = words.length > 0 ? "block" : "none";

  if (words.length === 0) {
    list.innerHTML = `
      <div class="empty-state">
        <div class="empty-state-icon">📝</div>
        <div class="empty-state-text">${state.language === "it" ? "Nessuna parola ancora. Aggiungine qualcuna!" : "No words yet. Add some!"}</div>
      </div>`;
    return;
  }

  list.innerHTML = words
    .map(
      (word, i) => `
    <div class="word-item">
      <span class="word-item-text">${escapeHtml(word)}</span>
      <button class="word-item-delete" data-index="${i}" aria-label="Delete">✕</button>
    </div>`
    )
    .join("");

  list.querySelectorAll(".word-item-delete").forEach((btn) => {
    btn.addEventListener("click", () => {
      const idx = parseInt(btn.dataset.index);
      state.words[state.language].splice(idx, 1);
      saveState();
      renderWordList();
      updateUI();
    });
  });
}

function escapeHtml(str) {
  const div = document.createElement("div");
  div.textContent = str;
  return div.innerHTML;
}

// ===== ADD WORD =====
function addWord(word) {
  const cleaned = word.trim().toLowerCase();
  if (!cleaned) return false;

  const words = state.words[state.language];
  if (words.includes(cleaned)) {
    showToast(t("alreadyExists"));
    return false;
  }

  words.push(cleaned);
  saveState();
  renderWordList();
  updateUI();
  return true;
}

// ===== OCR =====
async function processImage(file) {
  const ocrLoading = document.getElementById("ocr-loading");
  const ocrResults = document.getElementById("ocr-results");

  ocrLoading.style.display = "flex";
  ocrResults.style.display = "none";

  try {
    const result = await Tesseract.recognize(file, state.language === "it" ? "ita" : "eng", {
      logger: () => {},
    });

    // Use word-level data with confidence scores for accurate extraction
    const words = result.data.words || [];
    const rawWords = words
      .filter((w) => w.confidence > 60)  // Only confident recognitions
      .map((w) => w.text.replace(/[^a-zA-ZàèéìòùÀÈÉÌÒÙ'-]/g, "").trim().toLowerCase())
      .filter((w) => w.length >= 3)       // Skip fragments (1-2 chars)
      .filter((w) => !/^[^aeiouàèéìòù]*$/i.test(w))  // Must contain a vowel (real word)
      .filter((w) => !/(.)\1{2,}/.test(w));            // No repeated chars like "aaa"

    // Deduplicate
    const uniqueWords = [...new Set(rawWords)];

    ocrLoading.style.display = "none";

    if (uniqueWords.length === 0) {
      showToast(t("noWordsFound"));
      return;
    }

    // Show results for user to select
    const ocrWordList = document.getElementById("ocr-word-list");
    ocrWordList.innerHTML = uniqueWords
      .map(
        (word) =>
          `<button class="ocr-word-chip" data-word="${escapeHtml(word)}">${escapeHtml(word)}</button>`
      )
      .join("");

    ocrWordList.querySelectorAll(".ocr-word-chip").forEach((chip) => {
      chip.addEventListener("click", () => {
        chip.classList.toggle("deselected");
      });
    });

    ocrResults.style.display = "block";
  } catch (e) {
    ocrLoading.style.display = "none";
    showToast("OCR failed. Try another photo.");
    console.error(e);
  }
}

// ===== SPEECH SYNTHESIS =====
const VOICE_OPTIONS = {
  normal: { rate: 0.9,  labelEn: "🎙 Normal", labelIt: "🎙 Normale" },
  slow:   { rate: 0.65, labelEn: "🐢 Slow & Clear", labelIt: "🐢 Lento e Chiaro" },
  fast:   { rate: 1.15, labelEn: "🐇 Fast", labelIt: "🐇 Veloce" },
};

let cachedVoice = { en: null, it: null, loaded: false };

function loadBestVoices() {
  const voices = speechSynthesis.getVoices();
  if (voices.length === 0) return;
  cachedVoice.loaded = true;

  ["en", "it"].forEach((lang) => {
    const matching = voices.filter((v) => v.lang.startsWith(lang));
    // Priority: Google cloud voices (best in Chrome), then premium, then known good voices
    // Skip novelty voices (Eddy, Flo, Grandma, Grandpa, Rocko, Sandy, Shelley, Reed)
    const novelty = /eddy|flo|grandma|grandpa|rocko|sandy|shelley|reed/i;
    const good = matching.filter((v) => !novelty.test(v.name));
    let best =
      good.find((v) => v.name.toLowerCase().includes("google")) ||
      good.find((v) => /enhanced|premium|natural/i.test(v.name)) ||
      (lang === "en" && good.find((v) => /samantha|karen|moira|daniel|fiona/i.test(v.name))) ||
      (lang === "it" && good.find((v) => /federica|luca/i.test(v.name))) ||
      (lang === "it" && good.find((v) => /alice/i.test(v.name))) ||
      good.find((v) => v.localService) ||
      good[0] ||
      matching[0];
    cachedVoice[lang] = best || null;
  });
}

function speak(word) {
  if (!("speechSynthesis" in window)) return;
  speechSynthesis.cancel();

  // Ensure voices are loaded
  if (!cachedVoice.loaded) loadBestVoices();

  const selected = state.settings.selectedVoice[state.language] || "normal";
  const cfg = VOICE_OPTIONS[selected] || VOICE_OPTIONS.normal;

  const utterance = new SpeechSynthesisUtterance(word);
  utterance.lang = state.language === "it" ? "it-IT" : "en-US";
  utterance.rate = state.language === "it" ? cfg.rate * 0.95 : cfg.rate;
  utterance.pitch = state.language === "it" ? 1.1 : 1.0;

  const voice = cachedVoice[state.language];
  if (voice) utterance.voice = voice;

  speechSynthesis.speak(utterance);
}

// ===== GAME ENGINE =====
function startGame() {
  const allWords = [...state.words[state.language]];
  if (allWords.length === 0) return;

  shuffle(allWords);
  const limit = state.settings.wordsPerRound;
  const gameWords = (limit === "all") ? allWords : allWords.slice(0, limit);

  state.game = {
    words: gameWords,
    currentIndex: 0,
    answers: [],
    startTime: Date.now(),
    timerInterval: null,
  };

  showScreen("game");
  updateGameUI();
  startTimer();

  // Small delay then speak first word
  setTimeout(() => {
    speak(state.game.words[0]);
  }, 500);
}

function updateGameUI() {
  const game = state.game;
  const total = game.words.length;
  const current = game.currentIndex + 1;

  document.getElementById("current-word-num").textContent = current;
  document.getElementById("total-words").textContent = total;
  document.getElementById("game-progress").style.width = `${((current - 1) / total) * 100}%`;

  const input = document.getElementById("game-input");
  input.value = "";
  input.focus();

  // Hide feedback
  const overlay = document.getElementById("feedback-overlay");
  overlay.classList.remove("show", "correct", "incorrect");
}

function startTimer() {
  const timerEl = document.getElementById("game-timer");
  state.game.timerInterval = setInterval(() => {
    const elapsed = Math.floor((Date.now() - state.game.startTime) / 1000);
    const mins = Math.floor(elapsed / 60);
    const secs = elapsed % 60;
    timerEl.textContent = `${mins}:${secs.toString().padStart(2, "0")}`;
  }, 250);
}

function stopTimer() {
  if (state.game && state.game.timerInterval) {
    clearInterval(state.game.timerInterval);
  }
}

function checkAnswer() {
  const game = state.game;
  if (!game) return;

  const input = document.getElementById("game-input");
  const typed = input.value.trim().toLowerCase();
  if (!typed) return;

  const correctWord = game.words[game.currentIndex];
  const isCorrect = typed === correctWord;

  game.answers.push({
    word: correctWord,
    typed: typed,
    correct: isCorrect,
  });

  // No mid-game feedback - just advance silently
  game.currentIndex++;

  if (game.currentIndex >= game.words.length) {
    endGame();
  } else {
    // Brief visual transition
    const gameBody = document.querySelector(".game-body");
    gameBody.classList.add("transitioning");
    setTimeout(() => gameBody.classList.remove("transitioning"), 300);

    updateGameUI();
    setTimeout(() => speak(game.words[game.currentIndex]), 300);
  }
}

function showFeedback(isCorrect, correctWord) {
  const overlay = document.getElementById("feedback-overlay");
  const icon = document.getElementById("feedback-icon");
  const text = document.getElementById("feedback-text");
  const correctEl = document.getElementById("feedback-correct");

  overlay.className = "feedback-overlay show " + (isCorrect ? "correct" : "incorrect");
  icon.textContent = isCorrect ? "✅" : "❌";
  text.textContent = isCorrect ? t("correct") : t("incorrect");
  correctEl.textContent = isCorrect ? "" : `${t("correctAnswer")} ${correctWord}`;
}

function endGame() {
  stopTimer();
  playCompleteSound();

  const game = state.game;
  const totalTime = Math.floor((Date.now() - game.startTime) / 1000);
  const correctCount = game.answers.filter((a) => a.correct).length;
  const total = game.answers.length;
  const percent = Math.round((correctCount / total) * 100);

  // Update best score
  if (state.bestScores[state.language] === null || percent > state.bestScores[state.language]) {
    state.bestScores[state.language] = percent;
    saveState();
  }

  // Show results
  showResults(correctCount, total, percent, totalTime, game.answers);
}

function showResults(correct, total, percent, time, answers) {
  showScreen("results");

  // Emoji & title based on score
  const emoji = document.getElementById("results-emoji");
  const title = document.getElementById("results-title");

  const resultsHero = document.querySelector(".results-hero");
  resultsHero.classList.remove("perfect");

  if (percent === 100) {
    emoji.textContent = "🌟";
    title.textContent = t("perfectScore");
    resultsHero.classList.add("perfect");
  } else if (percent >= 80) {
    emoji.textContent = "🏆";
    title.textContent = t("greatJob");
  } else if (percent >= 50) {
    emoji.textContent = "💪";
    title.textContent = t("goodWork");
  } else {
    emoji.textContent = "📚";
    title.textContent = t("keepPracticing");
  }

  // Score
  document.getElementById("score-number").textContent = correct;
  document.getElementById("score-total").textContent = `/${total}`;
  document.getElementById("score-percent").textContent = `${percent}%`;

  // Score circle color
  const circle = document.getElementById("score-circle");
  if (percent >= 80) circle.style.borderColor = "var(--green)";
  else if (percent >= 50) circle.style.borderColor = "var(--orange)";
  else circle.style.borderColor = "var(--red)";

  document.getElementById("score-number").style.color =
    percent >= 80 ? "var(--green-dark)" : percent >= 50 ? "var(--orange-dark)" : "var(--red-dark)";

  // Stars
  const stars = document.getElementById("score-stars");
  const starCount = percent >= 90 ? 3 : percent >= 70 ? 2 : percent >= 40 ? 1 : 0;
  stars.textContent = "⭐".repeat(starCount) + "☆".repeat(3 - starCount);

  // Time
  const mins = Math.floor(time / 60);
  const secs = time % 60;
  document.getElementById("score-time-value").textContent = `${mins}:${secs.toString().padStart(2, "0")}`;

  // Breakdown list
  const list = document.getElementById("results-list");
  list.innerHTML = answers
    .map(
      (a) => `
    <div class="result-item ${a.correct ? "correct" : "incorrect"}">
      <span class="result-icon">${a.correct ? "✅" : "❌"}</span>
      <span class="result-word">${escapeHtml(a.word)}</span>
      ${!a.correct ? `<span class="result-typed">${escapeHtml(a.typed)}</span>` : ""}
    </div>`
    )
    .join("");

  // Confetti celebrations
  if (typeof confetti === "function") {
    if (percent === 100) {
      // PERFECT - spectacular multi-wave celebration
      setTimeout(() => {
        confetti({ particleCount: 150, spread: 100, origin: { y: 0.5 },
          colors: ["#FFD700", "#FFA500", "#FF69B4", "#58CC02", "#1CB0F6"] });
      }, 300);
      setTimeout(() => {
        confetti({ particleCount: 80, angle: 60, spread: 55, origin: { x: 0, y: 0.6 } });
        confetti({ particleCount: 80, angle: 120, spread: 55, origin: { x: 1, y: 0.6 } });
      }, 700);
      setTimeout(() => {
        confetti({ particleCount: 100, spread: 160, origin: { y: 0 }, gravity: 0.8,
          colors: ["#FFD700", "#CE82FF", "#58CC02"] });
      }, 1200);
      setTimeout(() => {
        confetti({ particleCount: 60, angle: 45, spread: 40, origin: { x: 0.1, y: 0.8 } });
        confetti({ particleCount: 60, angle: 135, spread: 40, origin: { x: 0.9, y: 0.8 } });
        confetti({ particleCount: 80, spread: 90, origin: { y: 0.6 } });
      }, 1800);
    } else if (percent >= 90) {
      setTimeout(() => {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }, 400);
      setTimeout(() => {
        confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 } });
        confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 } });
      }, 800);
    } else if (percent >= 70) {
      setTimeout(() => {
        confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
      }, 400);
    }
  }

  // Store results for sharing
  state.lastResult = { correct, total, percent, time };
}

// ===== SHARE =====
function shareScore() {
  const r = state.lastResult;
  if (!r) return;

  const mins = Math.floor(r.time / 60);
  const secs = r.time % 60;
  const timeStr = `${mins}:${secs.toString().padStart(2, "0")}`;
  const starCount = r.percent >= 90 ? 3 : r.percent >= 70 ? 2 : r.percent >= 40 ? 1 : 0;
  const stars = "⭐".repeat(starCount);

  const text = `🐝 SpellBee Score! 🐝\n\nI got ${r.correct}/${r.total} correct! (${r.percent}%)\n⏱ Time: ${timeStr}\n${stars}\n\nCan you beat my score?\n\nhttps://spellingbeee.com`;

  if (navigator.share) {
    navigator.share({ title: "SpellBee Score", text, url: "https://spellingbeee.com" }).catch(() => {
      copyToClipboard(text);
    });
  } else {
    copyToClipboard(text);
  }
}

function copyToClipboard(text) {
  navigator.clipboard
    .writeText(text)
    .then(() => showToast(t("copied")))
    .catch(() => showToast(t("copied")));
}

// ===== TOAST =====
function showToast(message) {
  const toast = document.getElementById("toast");
  toast.textContent = message;
  toast.classList.add("show");
  setTimeout(() => toast.classList.remove("show"), 2500);
}

// ===== UTILITY =====
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ===== SETTINGS =====
function populateVoiceList() {
  const select = document.getElementById("voice-select");
  if (!select) return;

  const saved = state.settings.selectedVoice[state.language] || "normal";
  const isIt = state.language === "it";
  select.innerHTML = "";

  Object.entries(VOICE_OPTIONS).forEach(([key, cfg]) => {
    const opt = document.createElement("option");
    opt.value = key;
    opt.textContent = isIt ? cfg.labelIt : cfg.labelEn;
    opt.selected = key === saved;
    select.appendChild(opt);
  });
}

function renderWordsPerRoundSelector() {
  const container = document.getElementById("words-per-round-selector");
  const options = [5, 10, 15, 20, "all"];
  const current = state.settings.wordsPerRound;

  container.innerHTML = options
    .map((opt) => {
      const label = opt === "all" ? t("all") : opt;
      const isActive = opt === current;
      return `<button class="settings-pill${isActive ? " active" : ""}" data-value="${opt}">${label}</button>`;
    })
    .join("");

  container.querySelectorAll(".settings-pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      const val = btn.dataset.value;
      state.settings.wordsPerRound = val === "all" ? "all" : parseInt(val);
      saveState();
      renderWordsPerRoundSelector();
    });
  });
}

// ===== INIT & EVENT LISTENERS =====
function init() {
  loadState();

  // Preload voices and pick best one
  if ("speechSynthesis" in window) {
    loadBestVoices();
    speechSynthesis.onvoiceschanged = () => loadBestVoices();
  }

  // Language toggle
  document.querySelectorAll(".lang-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.language = btn.dataset.lang;
      saveState();
      updateUI();
    });
  });

  // Settings button
  document.getElementById("btn-settings").addEventListener("click", () => {
    showScreen("settings");
    populateVoiceList();
    renderWordsPerRoundSelector();
  });

  // Back from settings
  document.getElementById("btn-back-settings").addEventListener("click", () => {
    showScreen("home");
    updateUI();
  });

  // Voice select change
  document.getElementById("voice-select").addEventListener("change", (e) => {
    state.settings.selectedVoice[state.language] = e.target.value || null;
    saveState();
  });

  // Preview voice
  document.getElementById("btn-preview-voice").addEventListener("click", () => {
    const sampleWord = state.language === "it" ? "ciao" : "hello";
    speak(sampleWord);
  });

  // Home buttons
  document.getElementById("btn-add-words").addEventListener("click", () => {
    showScreen("words");
    renderWordList();
  });

  document.getElementById("btn-play").addEventListener("click", () => {
    if (state.words[state.language].length === 0) {
      showToast(t("needWords"));
      return;
    }
    startGame();
  });

  // Back button
  document.getElementById("btn-back-home").addEventListener("click", () => {
    showScreen("home");
    updateUI();
  });

  // Add word
  const wordInput = document.getElementById("word-input");
  const btnAddWord = document.getElementById("btn-add-word");

  btnAddWord.addEventListener("click", () => {
    // Support comma-separated words
    const raw = wordInput.value;
    const parts = raw.split(/[,;\n]+/);
    let added = 0;
    parts.forEach((p) => {
      if (addWord(p)) added++;
    });
    if (added > 0) wordInput.value = "";
    wordInput.focus();
  });

  wordInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      btnAddWord.click();
    }
  });

  // Upload photo
  const photoInput = document.getElementById("photo-input");
  document.getElementById("btn-upload-photo").addEventListener("click", () => {
    photoInput.click();
  });

  photoInput.addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      processImage(file);
    }
    photoInput.value = "";
  });

  // OCR add selected
  document.getElementById("btn-add-ocr-words").addEventListener("click", () => {
    const chips = document.querySelectorAll(".ocr-word-chip:not(.deselected)");
    chips.forEach((chip) => addWord(chip.dataset.word));
    document.getElementById("ocr-results").style.display = "none";
  });

  document.getElementById("btn-cancel-ocr").addEventListener("click", () => {
    document.getElementById("ocr-results").style.display = "none";
  });

  // Clear all words
  document.getElementById("btn-clear-all").addEventListener("click", () => {
    state.words[state.language] = [];
    saveState();
    renderWordList();
    updateUI();
  });

  // Game: speak button
  document.getElementById("btn-speak").addEventListener("click", () => {
    if (state.game) {
      speak(state.game.words[state.game.currentIndex]);
    }
  });

  // Game: check button
  document.getElementById("btn-check").addEventListener("click", checkAnswer);

  // Game: enter key
  document.getElementById("game-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      checkAnswer();
    }
  });

  // Game: quit
  document.getElementById("btn-quit-game").addEventListener("click", () => {
    stopTimer();
    showScreen("home");
    updateUI();
  });

  // Results buttons
  document.getElementById("btn-play-again").addEventListener("click", () => {
    startGame();
  });

  document.getElementById("btn-share").addEventListener("click", shareScore);

  document.getElementById("btn-go-home").addEventListener("click", () => {
    showScreen("home");
    updateUI();
  });

  // Initial UI update
  updateUI();
}

// Start the app
document.addEventListener("DOMContentLoaded", init);
