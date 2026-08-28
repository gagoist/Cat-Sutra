(function () {
  "use strict";

  var PAGE_KEY = "the-meow-sutra:last-id";
  var LANG_KEY = "the-meow-sutra:lang";
  var HEALING_INTERVAL_MS = 12000;

  var COPY = {
    ko: {
      siteTitle: "법화삼부경과 연뿌리 이야기",
      archive: "법화삼부경을 통한 축복의 여정",
      recitation: "한글번역",
      explanation: "해설",
      english: "English",
      hanja: "원문",
      prev: "이전 페이지",
      next: "다음 페이지",
      page: "쪽",
      of: "/",
      goToPage: "페이지로 이동",
      goToPageHint: "번호 입력 후 Enter",
      resume: "이어서 읽는 중",
      ad: "광고",
      adHint: "AdSense 영역",
      footer: "한 장의 경전, 한 번의 숨.",
      toc: "불경",
      tocOpen: "불경 열기",
      tocClose: "닫기",
      categories: "카테고리",
      journey: "마음의 여정",
      scripture: "불경",
      work: "법화삼부경",
      share: "이 페이지 공유",
      shareTitle: "이 페이지 이어보기",
      shareHint: "이 주소를 보내면, 나중에 같은 쪽부터 다시 볼 수 있습니다.",
      shareCopy: "주소 복사",
      shareCopied: "주소를 복사했습니다",
      shareNative: "메신저·앱으로 보내기",
      shareKakao: "카카오톡",
      shareLine: "라인",
      shareFacebook: "페이스북",
      shareX: "X",
      shareBand: "밴드",
      shareEmail: "메일",
      shareClose: "닫기",
      shareKakaoHint: "주소를 복사했습니다. 카카오톡에 붙여넣어 보내세요.",
      shareText: "법화삼부경 {n}쪽부터 이어서 보기",
    },
    en: {
      siteTitle: "Lotus Root & Sutra",
      archive: "The Journey of Blessing Through The Threefold Lotus Sutra",
      recitation: "Korean Translation",
      explanation: "Commentary",
      english: "English",
      hanja: "Original",
      prev: "Previous",
      next: "Next",
      page: "Page",
      of: "of",
      goToPage: "Go to page",
      goToPageHint: "Type a number, then Enter",
      resume: "Resuming where you left off",
      ad: "Ad",
      adHint: "AdSense slot",
      footer: "One page, one quiet breath.",
      toc: "Sutras",
      tocOpen: "Open sutras",
      tocClose: "Close",
      categories: "Categories",
      journey: "Journey of the Mind",
      scripture: "Sutras",
      work: "Threefold Lotus Sutra",
      share: "Share this page",
      shareTitle: "Continue from this page",
      shareHint: "Send this link and you can open it later on the same page.",
      shareCopy: "Copy link",
      shareCopied: "Link copied",
      shareNative: "Send via app or messenger",
      shareKakao: "KakaoTalk",
      shareLine: "LINE",
      shareFacebook: "Facebook",
      shareX: "X",
      shareBand: "Band",
      shareEmail: "Email",
      shareClose: "Close",
      shareKakaoHint: "Link copied. Paste it into KakaoTalk to send.",
      shareText: "Continue the Threefold Lotus Sutra from page {n}",
    },
  };

  var MOMENTS = [
    {
      id: "lotus",
      ko: "연꽃 옆에 앉아, 한 장을 기다립니다.",
      en: "Beside a lotus, waiting for the next page.",
      svg:
        '<svg viewBox="0 0 220 140" aria-hidden="true">' +
        '<ellipse class="breathe" cx="108" cy="108" rx="40" ry="22" fill="#e8d4b0" stroke="#2c2418" stroke-width="1.7"/>' +
        '<path d="M146 100c18 4 28 18 22 28" fill="none" stroke="#2c2418" stroke-width="1.7" stroke-linecap="round" class="tail-wag"/>' +
        '<circle cx="100" cy="72" r="28" fill="#e8d4b0" stroke="#2c2418" stroke-width="1.7"/>' +
        '<path d="M78 58 L74 34 L94 50Z" fill="#e8d4b0" stroke="#2c2418" stroke-width="1.7"/>' +
        '<path d="M122 58 L126 34 L106 50Z" fill="#e8d4b0" stroke="#2c2418" stroke-width="1.7"/>' +
        '<g class="eye-blink"><ellipse cx="90" cy="72" rx="3.2" ry="4" fill="#2c2418"/><ellipse cx="110" cy="72" rx="3.2" ry="4" fill="#2c2418"/></g>' +
        '<path d="M100 80 c-3 6 3 6 0 0" fill="none" stroke="#8e1d1d" stroke-width="1.3"/>' +
        '<path d="M88 84 h-12 M112 84 h12" stroke="#2c2418" stroke-width="1"/>' +
        '<path d="M168 78c0-10 14-18 14-4 8-2 16 10 4 16-12 2-18-4-18-12z" fill="#f4eee0" stroke="#8e1d1d" stroke-width="1.4" class="float-y"/>' +
        '<circle cx="176" cy="86" r="2" fill="#8e1d1d"/>' +
        "</svg>",
    },
    {
      id: "sleep",
      ko: "경전을 덮어도, 숨은 고르게 이어집니다.",
      en: "Even with the sutra closed, the breath stays even.",
      svg:
        '<svg viewBox="0 0 220 140" aria-hidden="true">' +
        '<ellipse cx="110" cy="108" rx="52" ry="18" fill="#e8d4b0" stroke="#2c2418" stroke-width="1.7" class="breathe"/>' +
        '<circle cx="68" cy="92" r="24" fill="#e8d4b0" stroke="#2c2418" stroke-width="1.7"/>' +
        '<path d="M50 80 L46 58 L66 74Z" fill="#e8d4b0" stroke="#2c2418" stroke-width="1.6"/>' +
        '<path d="M86 80 L90 58 L70 74Z" fill="#e8d4b0" stroke="#2c2418" stroke-width="1.6"/>' +
        '<path d="M58 92 q4 3 8 0" fill="none" stroke="#2c2418" stroke-width="1.4"/>' +
        '<path d="M70 92 q4 3 8 0" fill="none" stroke="#2c2418" stroke-width="1.4"/>' +
        '<path d="M68 100 c-2 4 2 4 0 0" stroke="#8e1d1d" fill="none"/>' +
        '<path d="M162 96c16 8 24 2 18-10" fill="none" stroke="#2c2418" stroke-width="1.7" class="tail-wag"/>' +
        '<text x="150" y="48" fill="#8a7760" font-size="18" class="float-y">z</text>' +
        '<text x="164" y="34" fill="#8a7760" font-size="13" class="float-y">z</text>' +
        "</svg>",
    },
    {
      id: "reading",
      ko: "냥. 이 구절이 마음에 든다.",
      en: "Meow. This verse sits well in the heart.",
      svg:
        '<svg viewBox="0 0 220 140" aria-hidden="true">' +
        '<rect x="78" y="86" width="70" height="36" rx="3" fill="#f4eee0" stroke="#2c2418" stroke-width="1.5"/>' +
        '<line x1="113" y1="86" x2="113" y2="122" stroke="#8e1d1d" stroke-width="1.2"/>' +
        '<circle cx="110" cy="62" r="26" fill="#e8d4b0" stroke="#2c2418" stroke-width="1.7"/>' +
        '<path d="M88 48 L84 26 L104 42Z" fill="#e8d4b0" stroke="#2c2418" stroke-width="1.6"/>' +
        '<path d="M132 48 L136 26 L116 42Z" fill="#e8d4b0" stroke="#2c2418" stroke-width="1.6"/>' +
        '<g class="eye-blink"><ellipse cx="100" cy="64" rx="3" ry="3.6" fill="#2c2418"/><ellipse cx="120" cy="64" rx="3" ry="3.6" fill="#2c2418"/></g>' +
        '<circle cx="110" cy="74" r="2.2" fill="#8e1d1d"/>' +
        '<path d="M58 70c-10 18 6 34 24 28" fill="none" stroke="#2c2418" stroke-width="1.6" class="tail-wag"/>' +
        "</svg>",
    },
    {
      id: "stretch",
      ko: "오늘도 한 장, 천천히.",
      en: "One page today — slowly, kindly.",
      svg:
        '<svg viewBox="0 0 220 140" aria-hidden="true">' +
        '<ellipse cx="120" cy="100" rx="48" ry="16" fill="#e8d4b0" stroke="#2c2418" stroke-width="1.7" class="breathe"/>' +
        '<circle cx="58" cy="86" r="22" fill="#e8d4b0" stroke="#2c2418" stroke-width="1.7"/>' +
        '<path d="M42 74 L28 58 L54 70Z" fill="#e8d4b0" stroke="#2c2418" stroke-width="1.5"/>' +
        '<path d="M74 74 L86 54 L62 70Z" fill="#e8d4b0" stroke="#2c2418" stroke-width="1.5"/>' +
        '<g class="eye-blink"><path d="M48 86 q6 -6 10 0" fill="none" stroke="#2c2418" stroke-width="1.5"/><path d="M60 86 q6 -6 10 0" fill="none" stroke="#2c2418" stroke-width="1.5"/></g>' +
        '<circle cx="56" cy="94" r="2" fill="#8e1d1d"/>' +
        '<path d="M170 96c18-16 28-2 22 14" fill="none" stroke="#2c2418" stroke-width="1.7" class="tail-wag"/>' +
        '<path d="M36 108 v16 M48 108 v18 M152 108 v16 M166 108 v18" stroke="#2c2418" stroke-width="1.5" stroke-linecap="round"/>' +
        "</svg>",
    },
    {
      id: "samantabhadra",
      ko: "한 걸음이 곧 보현행입니다.",
      en: "A single step is already Samantabhadra’s path.",
      svg:
        '<svg viewBox="0 0 220 140" aria-hidden="true">' +
        '<ellipse class="breathe" cx="108" cy="108" rx="40" ry="22" fill="#e8d4b0" stroke="#2c2418" stroke-width="1.7"/>' +
        '<path d="M146 100c18 4 28 18 22 28" fill="none" stroke="#2c2418" stroke-width="1.7" stroke-linecap="round" class="tail-wag"/>' +
        '<circle cx="100" cy="72" r="28" fill="#e8d4b0" stroke="#2c2418" stroke-width="1.7"/>' +
        '<path d="M78 58 L74 34 L94 50Z" fill="#e8d4b0" stroke="#2c2418" stroke-width="1.7"/>' +
        '<path d="M122 58 L126 34 L106 50Z" fill="#e8d4b0" stroke="#2c2418" stroke-width="1.7"/>' +
        '<g class="eye-blink"><ellipse cx="90" cy="72" rx="3.2" ry="4" fill="#2c2418"/><ellipse cx="110" cy="72" rx="3.2" ry="4" fill="#2c2418"/></g>' +
        '<path d="M100 80 c-3 6 3 6 0 0" fill="none" stroke="#8e1d1d" stroke-width="1.3"/>' +
        '<path d="M168 78c0-10 14-18 14-4 8-2 16 10 4 16-12 2-18-4-18-12z" fill="#f4eee0" stroke="#8e1d1d" stroke-width="1.4" class="float-y"/>' +
        "</svg>",
    },
  ];

  var SCRIPT_EL = document.currentScript;

  var state = {
    sutras: [],
    index: 0,
    lang: "ko",
    direction: 1,
    moment: null,
    healingTimer: null,
    fadeTimer: null,
    resumeTimer: null,
    toc: [],
    tocOpen: {},
    treeOpen: {
      scripture: false,
      work: false,
    },
    shareOpen: false,
    shareCopyTimer: null,
  };

  function $(id) {
    return document.getElementById(id);
  }

  function setText(id, value) {
    var el = $(id);
    if (el) el.textContent = value;
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function storageGet(key) {
    try {
      return localStorage.getItem(key);
    } catch (err) {
      return null;
    }
  }

  function storageSet(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (err) {
      /* private mode 등 */
    }
  }

  function isValidSutra(item) {
    return item && item.id != null && (item.chapter || item.hanja || item.recitation);
  }

  function isPreviewMode() {
    return /(?:\?|&)preview=1(?:&|$)/.test(window.location.search);
  }

  function loadPreviewDraft() {
    if (!isPreviewMode()) return null;
    var raw = storageGet("the-meow-sutra:draft");
    if (!raw) return null;
      try {
        var data = JSON.parse(raw);
        if (Array.isArray(data)) {
          var cleaned = data.filter(isValidSutra);
          return cleaned.length ? cleaned : null;
        }
        if (data && Array.isArray(data.pages)) {
          if (Array.isArray(data.toc) && data.toc.length) window.SUTRAS_TOC = data.toc;
          var fromWrap = data.pages.filter(isValidSutra);
          return fromWrap.length ? fromWrap : null;
        }
        return null;
      } catch (err) {
        return null;
      }
  }

  function emptyPage() {
    return {
      id: 1,
      chapter: "",
      chapterEn: "",
      hanja: "",
      recitation: "",
      explanation: "",
      explanationEn: "",
      english: "",
    };
  }

  function loadSutrasFromJson() {
    return new Promise(function (resolve) {
      var preview = loadPreviewDraft();
      if (preview) {
        resolve(preview);
        return;
      }

      if (Array.isArray(window.SUTRAS_DATA) && window.SUTRAS_DATA.length) {
        var embedded = window.SUTRAS_DATA.filter(isValidSutra);
        if (embedded.length) {
          resolve(embedded);
          return;
        }
      }

      var url = "sutras.json";
      if (SCRIPT_EL && SCRIPT_EL.src) {
        try {
          url = new URL("sutras.json", SCRIPT_EL.src).href;
        } catch (err) {
          url = "sutras.json";
        }
      }

      if (typeof fetch !== "function") {
        resolve([emptyPage()]);
        return;
      }

      fetch(url)
        .then(function (res) {
          if (!res.ok) throw new Error("fetch failed");
          return res.json();
        })
        .then(function (data) {
          if (!Array.isArray(data) || !data.length) throw new Error("empty");
          var cleaned = data.filter(isValidSutra);
          if (!cleaned.length) throw new Error("invalid");
          resolve(cleaned);
        })
        .catch(function () {
          resolve([emptyPage()]);
        });
    });
  }

  function readSavedLang() {
    var saved = storageGet(LANG_KEY);
    return saved === "en" ? "en" : "ko";
  }

  function readSavedIndex(sutras) {
    var saved = storageGet(PAGE_KEY);
    if (!saved) return { index: 0, resumed: false };
    var found = -1;
    for (var i = 0; i < sutras.length; i += 1) {
      if (String(sutras[i].id) === String(saved)) {
        found = i;
        break;
      }
    }
    if (found >= 0) return { index: found, resumed: true };
    return { index: 0, resumed: false };
  }

  function t() {
    return COPY[state.lang] || COPY.ko;
  }

  function currentPage() {
    return state.sutras[state.index] || state.sutras[0] || emptyPage();
  }

  function setLang(nextLang) {
    state.lang = nextLang === "en" ? "en" : "ko";
    storageSet(LANG_KEY, state.lang);
    document.documentElement.lang = state.lang === "ko" ? "ko" : "en";
    renderChrome();
    renderPage(false);
    renderHealingCaption();
    syncGreetingMode();
  }

  function goTo(nextIndex, dir, options) {
    options = options || {};
    if (nextIndex < 0 || nextIndex >= state.sutras.length || nextIndex === state.index) {
      return;
    }
    state.direction = dir;
    state.index = nextIndex;
    storageSet(PAGE_KEY, String(currentPage().id));
    hideResumeToast();
    ensureActiveTocOpen();
    renderPage(true);
    if (!isGreetingIndex(nextIndex)) swapHealing(true);
    if (!options.skipUrl) syncUrl(!!options.replace);
  }

  function goPrev() {
    if (isGreetingView()) return;
    var prevIndex = adjacentScriptureIndex(state.index, -1);
    if (prevIndex < 0) return;
    goTo(prevIndex, -1);
  }

  function goNext() {
    if (isGreetingView()) return;
    var nextIndex = adjacentScriptureIndex(state.index, 1);
    if (nextIndex < 0) return;
    goTo(nextIndex, 1);
  }

  function isPageJumpOpen() {
    var form = $("page-jump-form");
    return !!(form && !form.hidden);
  }

  function closePageJump() {
    var form = $("page-jump-form");
    var btn = $("page-jump-btn");
    var input = $("page-jump-input");
    if (form) form.hidden = true;
    if (btn) btn.hidden = false;
    if (input) input.blur();
  }

  function openPageJump() {
    if (isGreetingView()) return;
    var form = $("page-jump-form");
    var btn = $("page-jump-btn");
    var input = $("page-jump-input");
    if (!form || !input) return;

    var total = scriptureCount();
    var current = scriptureOrdinal(state.index);
    input.min = "1";
    input.max = String(total);
    input.value = String(current);
    input.setAttribute("placeholder", pad2(current));
    if (btn) btn.hidden = true;
    form.hidden = false;
    window.setTimeout(function () {
      input.focus();
      input.select();
    }, 0);
  }

  function submitPageJump(event) {
    if (event) event.preventDefault();
    var input = $("page-jump-input");
    var total = scriptureCount();
    var raw = input ? String(input.value || "").trim() : "";
    var nextPage = parseInt(raw, 10);
    closePageJump();
    if (!nextPage || nextPage < 1 || nextPage > total) return;
    var nextIndex = indexFromScriptureOrdinal(nextPage);
    if (nextIndex < 0) return;
    goTo(nextIndex, nextIndex >= state.index ? 1 : -1);
  }

  function renderChrome() {
    var copy = t();
    setText("archive-label", copy.archive);
    setText("site-title", copy.siteTitle);
    setText("hanja-label", copy.hanja);
    setText("btn-prev-label", copy.prev);
    setText("btn-next-label", copy.next);
    var prevBtnChrome = $("btn-prev");
    var nextBtnChrome = $("btn-next");
    if (prevBtnChrome) prevBtnChrome.setAttribute("aria-label", copy.prev);
    if (nextBtnChrome) nextBtnChrome.setAttribute("aria-label", copy.next);
    setText("page-of", copy.of);
    setText("page-word", copy.page);
    setText("page-jump-label", copy.goToPage);
    setText("page-jump-of", copy.of);
    setText("page-jump-suffix", copy.page);
    var jumpBtn = $("page-jump-btn");
    var jumpInput = $("page-jump-input");
    if (jumpBtn) {
      jumpBtn.setAttribute("aria-label", copy.goToPage);
      jumpBtn.setAttribute("title", copy.goToPageHint);
    }
    if (jumpInput) jumpInput.setAttribute("aria-label", copy.goToPage);
    setText("site-footer", copy.footer);
    setText("toc-journey-label", copy.journey);
    setText("toc-scripture-label", copy.scripture);
    setText("toc-work-label", copy.work);
    var catBar = $("cat-bar");
    if (catBar) catBar.setAttribute("aria-label", copy.categories);
    syncCategoryTabs();
    syncTreeOpen();
    setText("ad-desktop-label", copy.ad);
    setText("ad-desktop-hint", copy.adHint);
    setText("ad-mobile-label", copy.ad + " · " + copy.adHint + " · 320×50");
    renderShareChrome();

    var koBtn = $("lang-ko");
    var enBtn = $("lang-en");
    var koOn = state.lang === "ko";
    if (koBtn) {
      koBtn.setAttribute("aria-pressed", koOn ? "true" : "false");
      koBtn.className =
        "rounded-full px-3 py-1.5 font-serif text-sm transition-all duration-300 sm:px-4 " +
        (koOn ? "bg-seal text-[#fbf6ea] shadow-sm" : "text-ink-muted hover:text-ink");
    }
    if (enBtn) {
      enBtn.setAttribute("aria-pressed", koOn ? "false" : "true");
      enBtn.className =
        "rounded-full px-3 py-1.5 font-serif text-sm transition-all duration-300 sm:px-4 " +
        (!koOn ? "bg-seal text-[#fbf6ea] shadow-sm" : "text-ink-muted hover:text-ink");
    }
  }

  function columnHtml(kicker, body, emphasize, serif, bordered) {
    var sectionClass = "flex flex-col px-6 py-6 sm:px-8 sm:py-8 transition-all duration-500";
    if (bordered) sectionClass += " border-t border-[#e5dac4]";
    sectionClass += emphasize ? " bg-[#faf6ed]/50" : " bg-transparent";
    var textClass = serif ? "font-serif " : "font-display ";
    textClass += emphasize
      ? "text-[1.05rem] sm:text-lg leading-loose text-ink"
      : "text-[0.95rem] leading-relaxed text-ink-muted sm:text-base";
    return (
      '<section class="' +
      sectionClass +
      '">' +
      '<p class="mb-2 font-display text-[11px] uppercase tracking-[0.32em] text-seal">' +
      escapeHtml(kicker) +
      "</p>" +
      '<p class="whitespace-pre-wrap ' +
      textClass +
      '">' +
      escapeHtml(body) +
      "</p>" +
      "</section>"
    );
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderPage(animate) {
    var page = currentPage();
    if (!page) return;

    var copy = t();
    var greeting = isGreetingView();
    var total = greeting ? state.sutras.length : scriptureCount();
    var current = greeting ? state.index + 1 : scriptureOrdinal(state.index);
    var columns = $("columns");
    var progress = $("progress-bar");
    var prevBtn = $("btn-prev");
    var nextBtn = $("btn-next");
    var card = $("sutra-card");

    var titleEl = $("chapter-title");
    if (titleEl) titleEl.innerHTML = pageHeadingHtml();
    setText("hanja-text", page.hanja);
    var hanjaText = $("hanja-text");
    if (hanjaText && hanjaText.parentElement) {
      hanjaText.parentElement.hidden = !String(page.hanja || "").trim();
    }
    setText("page-current", pad2(current));
    setText("page-total", pad2(total));
    setText("page-jump-total", pad2(total));

    if (progress) progress.style.width = greeting || !total ? "0%" : (current / total) * 100 + "%";
    var prevIndex = adjacentScriptureIndex(state.index, -1);
    var nextIndex = adjacentScriptureIndex(state.index, 1);
    setNavLink(prevBtn, prevIndex, greeting || prevIndex < 0);
    setNavLink(nextBtn, nextIndex, greeting || nextIndex < 0);
    updateDocumentMeta();

    if (greeting) {
      var greetBody =
        state.lang === "en"
          ? page.english || page.explanationEn || page.recitation || ""
          : page.recitation || page.explanation || page.english || "";
      if (columns) {
        columns.innerHTML = String(greetBody).trim()
          ? '<section class="flex flex-col px-6 py-8 sm:px-10 sm:py-12">' +
            '<p class="whitespace-pre-wrap font-serif text-[1.05rem] sm:text-lg leading-loose text-ink">' +
            escapeHtml(greetBody) +
            "</p></section>"
          : "";
      }
      if (card) card.hidden = !String(greetBody).trim();
    } else {
      if (card) card.hidden = false;
      var order =
        state.lang === "en"
          ? [
              { kicker: copy.english, body: page.english, emphasize: true, serif: false },
              { kicker: copy.explanation, body: page.explanationEn, emphasize: false, serif: true },
            ]
          : [
              { kicker: copy.recitation, body: page.recitation, emphasize: true, serif: true },
              { kicker: copy.explanation, body: page.explanation, emphasize: false, serif: true },
            ];

      var html = "";
      var shown = 0;
      for (var i = 0; i < order.length; i += 1) {
        if (!String(order[i].body || "").trim()) continue;
        html += columnHtml(
          order[i].kicker,
          order[i].body,
          order[i].emphasize,
          order[i].serif,
          shown > 0
        );
        shown += 1;
      }
      if (columns) columns.innerHTML = html;
    }

    if (card) {
      card.classList.remove("turn-next", "turn-prev");
      if (animate) {
        void card.offsetWidth;
        card.classList.add(state.direction < 0 ? "turn-prev" : "turn-next");
      }
    }

    renderToc();
    syncCategoryTabs();
    syncGreetingMode();
    if (state.shareOpen) fillShareUrl();
  }

  function showToast(message) {
    var toast = $("resume-toast");
    if (!toast) return;
    toast.textContent = message;
    toast.classList.remove("hidden");
    if (state.resumeTimer) window.clearTimeout(state.resumeTimer);
    state.resumeTimer = window.setTimeout(hideResumeToast, 4200);
  }

  function showResumeToast() {
    showToast(t().resume + " · " + pad2(state.index + 1));
  }

  function hideResumeToast() {
    $("resume-toast").classList.add("hidden");
    if (state.resumeTimer) {
      window.clearTimeout(state.resumeTimer);
      state.resumeTimer = null;
    }
  }

  function pickMoment(exceptId) {
    var pool = MOMENTS;
    if (exceptId && MOMENTS.length > 1) {
      pool = MOMENTS.filter(function (item) {
        return item.id !== exceptId;
      });
    }
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function renderHealingCaption() {
    if (!state.moment) return;
    $("healing-caption").textContent =
      state.lang === "en" ? state.moment.en : state.moment.ko;
  }

  function applyMoment(moment) {
    state.moment = moment;
    $("healing-art").innerHTML = moment.svg;
    renderHealingCaption();
  }

  function swapHealing(immediatePick) {
    var zone = $("healing-zone");
    var next = pickMoment(state.moment && state.moment.id);

    if (immediatePick && !state.moment) {
      applyMoment(next);
      zone.style.opacity = "1";
      zone.style.transform = "translateY(0)";
      restartHealingTimer();
      return;
    }

    zone.style.opacity = "0";
    zone.style.transform = "translateY(8px)";
    if (state.fadeTimer) window.clearTimeout(state.fadeTimer);
    state.fadeTimer = window.setTimeout(function () {
      applyMoment(next);
      zone.style.opacity = "1";
      zone.style.transform = "translateY(0)";
    }, 280);
    restartHealingTimer();
  }

  function restartHealingTimer() {
    if (state.healingTimer) window.clearInterval(state.healingTimer);
    state.healingTimer = window.setInterval(function () {
      swapHealing(false);
    }, HEALING_INTERVAL_MS);
  }

  function loadToc() {
    return Array.isArray(window.SUTRAS_TOC) ? window.SUTRAS_TOC : [];
  }

  function isCategorySutra(sutra) {
    return !!(sutra && sutra.kind === "category");
  }

  function isGreetingIndex(index) {
    var loc = locationOfIndex(index);
    return !!(loc && loc.sutra && isCategorySutra(loc.sutra));
  }

  function isGreetingView() {
    return isGreetingIndex(state.index);
  }

  function scriptureCount() {
    var n = 0;
    for (var i = 0; i < state.sutras.length; i += 1) {
      if (!isGreetingIndex(i)) n += 1;
    }
    return n;
  }

  function scriptureOrdinal(index) {
    var n = 0;
    for (var i = 0; i <= index && i < state.sutras.length; i += 1) {
      if (!isGreetingIndex(i)) n += 1;
    }
    return n;
  }

  function indexFromScriptureOrdinal(ordinal) {
    var n = 0;
    for (var i = 0; i < state.sutras.length; i += 1) {
      if (isGreetingIndex(i)) continue;
      n += 1;
      if (n === ordinal) return i;
    }
    return -1;
  }

  function adjacentScriptureIndex(from, dir) {
    var i = from + dir;
    while (i >= 0 && i < state.sutras.length) {
      if (!isGreetingIndex(i)) return i;
      i += dir;
    }
    return -1;
  }

  function syncGreetingMode() {
    var greeting = isGreetingView();
    document.body.classList.toggle("is-greeting", greeting);
    if (greeting) {
      setShareSheet(false);
      if (state.healingTimer) {
        window.clearInterval(state.healingTimer);
        state.healingTimer = null;
      }
    } else if (!state.healingTimer) {
      restartHealingTimer();
    }
  }

  function sutraHasChapters(sutra) {
    return !!(sutra && sutra.chapters && sutra.chapters.length);
  }

  function scriptureSutras() {
    var list = [];
    for (var i = 0; i < state.toc.length; i += 1) {
      if (!isCategorySutra(state.toc[i])) list.push(state.toc[i]);
    }
    return list;
  }

  function pageNumOf(item) {
    var n = Number(item && item.startPage);
    return n > 0 ? n : 0;
  }

  function itemCoversPage(item, pageNum) {
    var start = Number(item && item.startPage);
    if (!start) return false;
    var end = Number(item && item.endPage);
    if (!end) end = start;
    return pageNum >= start && pageNum <= end;
  }

  function firstStartPage(sutra) {
    var start = pageNumOf(sutra);
    if (start) return start;
    if (!sutraHasChapters(sutra)) return 0;
    for (var i = 0; i < sutra.chapters.length; i += 1) {
      var n = pageNumOf(sutra.chapters[i]);
      if (n) return n;
    }
    return 0;
  }

  function findActiveToc(pageNum) {
    var found = { sutraId: "", chapterId: "" };
    for (var i = 0; i < state.toc.length; i += 1) {
      var sutra = state.toc[i];
      if (sutraHasChapters(sutra)) {
        for (var c = 0; c < sutra.chapters.length; c += 1) {
          if (itemCoversPage(sutra.chapters[c], pageNum)) {
            found.sutraId = sutra.id;
            found.chapterId = sutra.chapters[c].id;
            return found;
          }
        }
      } else if (itemCoversPage(sutra, pageNum)) {
        found.sutraId = sutra.id;
        return found;
      }
    }
    return found;
  }

  function ensureActiveTocOpen() {
    var active = findActiveToc(state.index + 1);
    if (active.sutraId) state.tocOpen[active.sutraId] = true;
  }

  function sutraTitleHtml(sutra) {
    if (state.lang === "en") {
      return (
        '<span class="toc-role">' +
        escapeHtml(sutra.roleEn || "") +
        "</span>" +
        '<span class="toc-title">' +
        escapeHtml(sutra.en || sutra.ko) +
        "</span>"
      );
    }
    return (
      '<span class="toc-role">' +
      escapeHtml(sutra.role || "") +
      "</span>" +
      '<span class="toc-title">' +
      escapeHtml(sutra.ko) +
      (sutra.hanja
        ? ' <span class="toc-hanja">(' + escapeHtml(sutra.hanja) + ")</span>"
        : "") +
      "</span>"
    );
  }

  function chapterTitleHtml(chapter) {
    if (state.lang === "en") {
      return (
        "Chapter " +
        chapter.no +
        " · " +
        escapeHtml(chapter.en) +
        (chapter.noteEn
          ? ' <span class="toc-note">(' + escapeHtml(chapter.noteEn) + ")</span>"
          : "")
      );
    }
    return (
      "제" +
      chapter.no +
      "품 " +
      escapeHtml(chapter.ko) +
      (chapter.hanja
        ? ' <span class="toc-hanja">(' + escapeHtml(chapter.hanja) + ")</span>"
        : "") +
      (chapter.note
        ? ' <span class="toc-note">(' + escapeHtml(chapter.note) + ")</span>"
        : "")
    );
  }

  function renderToc() {
    var root = $("toc-nav");
    if (!root) return;

    var savedScroll = root.scrollTop;
    var pageNum = state.index + 1;
    var active = findActiveToc(pageNum);

    var html = "";
    var sutras = scriptureSutras();
    for (var i = 0; i < sutras.length; i += 1) {
      var sutra = sutras[i];
      var hasKids = sutraHasChapters(sutra);
      var isOpen = hasKids && !!state.tocOpen[sutra.id];
      var sutraActive = active.sutraId === sutra.id && !active.chapterId;
      var sutraStart = firstStartPage(sutra);
      var sutraHref = sutraStart ? pathForIndex(sutraStart - 1) : "";
      html +=
        '<section class="toc-group">' +
        (hasKids
          ? '<button type="button" class="toc-sutra' +
            (isOpen ? " is-open" : "") +
            (sutraActive ? " is-active" : "") +
            '" data-toc-sutra="' +
            escapeHtml(sutra.id) +
            '" aria-expanded="' +
            (isOpen ? "true" : "false") +
            '">'
          : '<a class="toc-sutra has-no-children' +
            (sutraActive ? " is-active" : "") +
            '" href="' +
            escapeHtml(sutraHref || pathForIndex(state.index)) +
            '" data-toc-sutra="' +
            escapeHtml(sutra.id) +
            '">') +
        '<span class="toc-chevron" aria-hidden="true">▸</span>' +
        "<span>" +
        sutraTitleHtml(sutra) +
        "</span>" +
        (hasKids ? "</button>" : "</a>");
      if (hasKids) {
        html += '<ul class="toc-chapters">';
        for (var c = 0; c < sutra.chapters.length; c += 1) {
          var ch = sutra.chapters[c];
          var chActive = active.chapterId === ch.id;
          var chStart = pageNumOf(ch);
          html +=
            '<li><a class="toc-chapter' +
            (chActive ? " is-active" : "") +
            '" href="' +
            escapeHtml(chStart ? pathForIndex(chStart - 1) : pathForIndex(state.index)) +
            '" data-toc-chapter="' +
            escapeHtml(ch.id) +
            '">' +
            chapterTitleHtml(ch) +
            "</a></li>";
        }
        html += "</ul>";
      }
      html += "</section>";
    }
    root.innerHTML = html;
    root.scrollTop = savedScroll;

    var activeEl = root.querySelector(".is-active");
    if (activeEl && typeof activeEl.scrollIntoView === "function") {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }

  function findSutra(id) {
    for (var i = 0; i < state.toc.length; i += 1) {
      if (state.toc[i].id === id) return state.toc[i];
    }
    return null;
  }

  function findChapter(id) {
    for (var i = 0; i < state.toc.length; i += 1) {
      var chapters = state.toc[i].chapters || [];
      for (var c = 0; c < chapters.length; c += 1) {
        if (chapters[c].id === id) return chapters[c];
      }
    }
    return null;
  }

  function findSutraOwningChapter(chapterId) {
    for (var i = 0; i < state.toc.length; i += 1) {
      var chapters = state.toc[i].chapters || [];
      for (var c = 0; c < chapters.length; c += 1) {
        if (chapters[c].id === chapterId) return state.toc[i];
      }
    }
    return null;
  }

  function sutraPrimarySlug(sutra) {
    if (!sutra) return "";
    return sutra.slug || sutra.id || "";
  }

  function chapterPrimarySlug(chapter) {
    if (!chapter) return "";
    if (chapter.slug) return normalizeChapterSlug(chapter.slug);
    if (chapter.no) return "chapter-" + chapter.no;
    return chapter.id || "";
  }

  function normalizeChapterSlug(value) {
    var s = String(value || "").toLowerCase();
    var m = s.match(/^chapter-?(\d+)$/);
    if (m) return "chapter-" + Number(m[1]);
    return s;
  }

  function sutraSlugSet(sutra) {
    var set = {};
    var primary = sutraPrimarySlug(sutra).toLowerCase();
    if (primary) set[primary] = true;
    if (sutra.id) set[String(sutra.id).toLowerCase()] = true;
    var aliases = sutra.aliases || [];
    for (var i = 0; i < aliases.length; i += 1) {
      set[String(aliases[i]).toLowerCase()] = true;
    }
    return set;
  }

  function findSutraBySlug(slug) {
    var key = String(slug || "").toLowerCase();
    if (!key) return null;
    for (var i = 0; i < state.toc.length; i += 1) {
      if (sutraSlugSet(state.toc[i])[key]) return state.toc[i];
    }
    return null;
  }

  function findChapterBySlug(sutra, slug) {
    if (!sutra || !sutraHasChapters(sutra)) return null;
    var key = normalizeChapterSlug(slug);
    var raw = String(slug || "").toLowerCase();
    for (var i = 0; i < sutra.chapters.length; i += 1) {
      var ch = sutra.chapters[i];
      if (chapterPrimarySlug(ch) === key) return ch;
      if (String(ch.id).toLowerCase() === raw) return ch;
    }
    return null;
  }

  function haystackOf(page) {
    return String((page && page.chapter) || "") + "\n" + String((page && page.chapterEn) || "");
  }

  function containsToken(hay, token) {
    return !!(token && hay.indexOf(token) >= 0);
  }

  function matchPageToToc(page, lastMatch) {
    if (page && page.chapterId) {
      var ch = findChapter(page.chapterId);
      var fromId = page.sutraId ? findSutra(page.sutraId) : null;
      if (!fromId && ch) fromId = findSutraOwningChapter(page.chapterId);
      if (fromId) return { sutra: fromId, chapter: ch };
    }
    if (page && page.sutraId) {
      var onlySutra = findSutra(page.sutraId);
      if (onlySutra) return { sutra: onlySutra, chapter: null };
    }

    var hay = haystackOf(page);
    var found = null;
    for (var i = 0; i < state.toc.length; i += 1) {
      var sutra = state.toc[i];
      var sutraHit =
        containsToken(hay, sutra.ko) ||
        containsToken(hay, sutra.hanja) ||
        containsToken(hay, sutra.en);
      if (sutraHasChapters(sutra)) {
        for (var c = 0; c < sutra.chapters.length; c += 1) {
          var chapter = sutra.chapters[c];
          var chapterHit =
            containsToken(hay, chapter.ko) ||
            containsToken(hay, chapter.hanja) ||
            containsToken(hay, chapter.en);
          if (chapterHit && (sutraHit || !found)) {
            found = { sutra: sutra, chapter: chapter };
            if (sutraHit) return found;
          }
        }
      } else if (sutraHit) {
        return { sutra: sutra, chapter: null };
      }
    }
    return found || lastMatch || null;
  }

  function hydrateTocFromPages() {
    var last = null;
    var byChapter = {};
    var bySutra = {};
    for (var i = 0; i < state.sutras.length; i += 1) {
      var pageNum = i + 1;
      var located = matchPageToToc(state.sutras[i], last);
      if (located) last = located;
      if (!located || !located.sutra) continue;
      var sid = located.sutra.id;
      if (!bySutra[sid]) bySutra[sid] = { start: pageNum, end: pageNum };
      else bySutra[sid].end = pageNum;
      if (located.chapter) {
        var cid = located.chapter.id;
        if (!byChapter[cid]) byChapter[cid] = { start: pageNum, end: pageNum };
        else byChapter[cid].end = pageNum;
      }
    }
    for (var s = 0; s < state.toc.length; s += 1) {
      var sutra = state.toc[s];
      var sr = bySutra[sutra.id];
      if (sr) {
        if (!sutra.startPage) sutra.startPage = sr.start;
        if (!sutra.endPage) sutra.endPage = sr.end;
      }
      var chapters = sutra.chapters || [];
      for (var c = 0; c < chapters.length; c += 1) {
        var cr = byChapter[chapters[c].id];
        if (!cr) continue;
        if (!chapters[c].startPage) chapters[c].startPage = cr.start;
        if (!chapters[c].endPage) chapters[c].endPage = cr.end;
      }
    }
  }

  function locationOfIndex(index) {
    var page = state.sutras[index];
    var located = matchPageToToc(page, null);
    if (located && located.sutra) return located;
    var active = findActiveToc(index + 1);
    if (active.sutraId) {
      return {
        sutra: findSutra(active.sutraId),
        chapter: active.chapterId ? findChapter(active.chapterId) : null,
      };
    }
    return { sutra: scriptureSutras()[0] || state.toc[0] || null, chapter: null };
  }

  function withHanja(name, hanja) {
    if (!hanja) return escapeHtml(name);
    return escapeHtml(name) + '<span class="chapter-hanja">(' + escapeHtml(hanja) + ")</span>";
  }

  function pageHeadingLines(index) {
    var loc = locationOfIndex(index);
    var sutra = loc && loc.sutra;
    var chapter = loc && loc.chapter;
    var page = state.sutras[index] || currentPage();
    var sutraLine = "";
    var chapterLine = "";

    if (state.lang === "en") {
      if (sutra) sutraLine = sutra.en || sutra.ko || "";
      if (chapter) {
        chapterLine = "Chapter " + chapter.no + " · " + (chapter.en || chapter.ko || "");
        if (chapter.noteEn) chapterLine += " (" + chapter.noteEn + ")";
      }
    } else {
      if (sutra) sutraLine = sutra.ko || "";
      if (chapter) {
        chapterLine = "제" + chapter.no + "품 " + (chapter.ko || "");
        if (chapter.note) chapterLine += " (" + chapter.note + ")";
      }
    }

    if (!sutraLine && !chapterLine && page) {
      sutraLine = state.lang === "en" && page.chapterEn ? page.chapterEn : page.chapter || "";
    }

    return { sutraLine: sutraLine, chapterLine: chapterLine, sutra: sutra, chapter: chapter };
  }

  function pageHeadingHtml() {
    var parts = pageHeadingLines(state.index);
    var html = "";
    if (parts.sutraLine) {
      var sutraHtml =
        state.lang === "en" || !parts.sutra
          ? escapeHtml(parts.sutraLine)
          : withHanja(parts.sutra.ko, parts.sutra.hanja);
      html += '<span class="chapter-line is-sutra">' + sutraHtml + "</span>";
    }
    if (parts.chapterLine) {
      var chapterHtml;
      if (state.lang === "en" || !parts.chapter) {
        chapterHtml = escapeHtml(parts.chapterLine);
      } else {
        chapterHtml = withHanja("제" + parts.chapter.no + "품 " + parts.chapter.ko, parts.chapter.hanja);
        if (parts.chapter.note) {
          chapterHtml +=
            ' <span class="chapter-hanja">(' + escapeHtml(parts.chapter.note) + ")</span>";
        }
      }
      html += '<span class="chapter-line is-chapter">' + chapterHtml + "</span>";
    }
    return html;
  }

  function appBase() {
    var baseEl = document.querySelector("base");
    if (baseEl && baseEl.getAttribute("href")) {
      try {
        var pathname = new URL(baseEl.href, location.href).pathname;
        if (!pathname) return "/";
        return pathname.slice(-1) === "/" ? pathname : pathname + "/";
      } catch (err) {
        /* ignore */
      }
    }
    return "/";
  }

  function preservedSearch() {
    if (String(location.search || "").indexOf("?/") === 0) return "";
    var params = new URLSearchParams(location.search);
    return params.get("preview") === "1" ? "?preview=1" : "";
  }

  function routeSegmentsForIndex(index) {
    var loc = locationOfIndex(index);
    var segs = [];
    if (loc.sutra) segs.push(sutraPrimarySlug(loc.sutra));
    if (loc.sutra && isCategorySutra(loc.sutra)) return segs;
    if (loc.chapter) segs.push(chapterPrimarySlug(loc.chapter));
    var ordinal = scriptureOrdinal(index);
    if (ordinal) segs.push(String(ordinal));
    return segs;
  }

  function pathForIndex(index) {
    var rel = routeSegmentsForIndex(index).join("/");
    if (location.protocol === "file:") return "#/" + rel;
    return appBase() + rel + preservedSearch();
  }

  function publicUrlForIndex(index) {
    var segs = routeSegmentsForIndex(index).join("/");
    if (location.protocol === "file:") {
      return location.href.split("#")[0] + "#/" + segs;
    }
    try {
      return new URL(appBase() + segs, location.origin).href;
    } catch (err) {
      return location.origin + appBase() + segs;
    }
  }

  function shareMessage() {
    return t().shareText.replace("{n}", String(scriptureOrdinal(state.index)));
  }

  function parsePageToken(token) {
    var m = String(token || "").match(/^(\d+)/);
    return m ? parseInt(m[1], 10) : 0;
  }

  function routeFromLocation() {
    if (location.hash.indexOf("#/") === 0) return location.hash.slice(2);
    var base = appBase();
    var path = location.pathname.replace(/\/index\.html$/i, "");
    var route = path.indexOf(base) === 0 ? path.slice(base.length) : path.replace(/^\//, "");
    return String(route || "").replace(/^\/+|\/+$/g, "");
  }

  function indexFromLocation() {
    var route = routeFromLocation();
    if (!route) return -1;
    var segs = route.split("/").filter(Boolean);
    if (!segs.length) return -1;

    var pageNum = 0;
    var chapterSlug = "";
    var sutraSlug = "";
    if (/^\d+(?:page)?$/i.test(segs[segs.length - 1])) {
      pageNum = parsePageToken(segs.pop());
    }
    if (segs.length && /^chapter-?\d+$/i.test(segs[segs.length - 1])) {
      chapterSlug = normalizeChapterSlug(segs.pop());
    } else if (segs.length > 1) {
      chapterSlug = segs.pop();
    }
    if (segs.length) sutraSlug = segs[segs.length - 1];

    var sutra = findSutraBySlug(sutraSlug);
    if (sutra && isCategorySutra(sutra)) {
      return firstStartPage(sutra) ? firstStartPage(sutra) - 1 : 0;
    }

    if (pageNum > 0) {
      var fromOrdinal = indexFromScriptureOrdinal(pageNum);
      if (fromOrdinal >= 0) return fromOrdinal;
    }

    if (chapterSlug && sutra) {
      var chapter = findChapterBySlug(sutra, chapterSlug);
      if (chapter && pageNumOf(chapter)) return pageNumOf(chapter) - 1;
    }
    if (sutra && firstStartPage(sutra)) return firstStartPage(sutra) - 1;
    return -1;
  }

  function updateDocumentMeta() {
    var page = currentPage();
    var heading = pageHeadingLines(state.index);
    var chapterLabel = [heading.sutraLine, heading.chapterLine].filter(Boolean).join(" · ");
    if (!chapterLabel) {
      chapterLabel = state.lang === "en" && page.chapterEn ? page.chapterEn : page.chapter;
    }
    var titleParts = [];
    if (chapterLabel) titleParts.push(chapterLabel);
    if (!isGreetingView()) {
      titleParts.push(state.lang === "en" ? "Page " + scriptureOrdinal(state.index) : scriptureOrdinal(state.index) + "쪽");
    }
    document.title = titleParts.join(" · ") + " · " + t().siteTitle;

    var descSource =
      (state.lang === "en" ? page.english || page.explanationEn : page.recitation || page.explanation) ||
      page.hanja ||
      "";
    var desc = String(descSource).replace(/\s+/g, " ").trim().slice(0, 180);
    var meta = document.querySelector('meta[name="description"]');
    if (meta && desc) meta.setAttribute("content", desc);

    var canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    var absUrl = publicUrlForIndex(state.index);
    try {
      canonical.setAttribute("href", absUrl);
    } catch (err) {
      canonical.setAttribute("href", pathForIndex(state.index));
    }

    var title = document.title;
    var ogTitle = document.querySelector('meta[property="og:title"]');
    var ogDesc = document.querySelector('meta[property="og:description"]');
    var ogUrl = document.querySelector('meta[property="og:url"]');
    var twTitle = document.querySelector('meta[name="twitter:title"]');
    var twDesc = document.querySelector('meta[name="twitter:description"]');
    if (ogTitle) ogTitle.setAttribute("content", title);
    if (ogDesc && desc) ogDesc.setAttribute("content", desc);
    if (ogUrl) ogUrl.setAttribute("content", absUrl);
    if (twTitle) twTitle.setAttribute("content", title);
    if (twDesc && desc) twDesc.setAttribute("content", desc);
  }

  function setNavLink(el, targetIndex, disabled) {
    if (!el) return;
    var valid = !disabled && targetIndex >= 0 && targetIndex < state.sutras.length;
    if (!valid) {
      el.setAttribute("aria-disabled", "true");
      el.setAttribute("tabindex", "-1");
      el.setAttribute("href", pathForIndex(state.index));
      return;
    }
    el.removeAttribute("aria-disabled");
    el.setAttribute("tabindex", "0");
    el.setAttribute("href", pathForIndex(targetIndex));
  }

  function syncUrl(replace) {
    if (typeof history === "undefined" || !history.pushState) return;
    var next = pathForIndex(state.index);
    try {
      var current =
        location.protocol === "file:" || location.hash.indexOf("#/") === 0
          ? location.hash || ""
          : location.pathname + location.search;
      if (current === next) {
        updateDocumentMeta();
        return;
      }
      history[replace ? "replaceState" : "pushState"]({ index: state.index }, "", next);
    } catch (err) {
      /* ignore */
    }
    updateDocumentMeta();
  }

  function applyLocationFromUrl() {
    var idx = indexFromLocation();
    if (idx < 0) idx = 0;
    if (idx === state.index) {
      updateDocumentMeta();
      return;
    }
    goTo(idx, idx >= state.index ? 1 : -1, { skipUrl: true });
  }

  function shouldLetBrowserNavigate(event) {
    return (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey
    );
  }

  function closeCategoryMenu() {
    setTreeLevel("scripture", false);
  }

  function syncCategoryTabs() {
    var loc = locationOfIndex(state.index);
    var onJourney = !!(loc && loc.sutra && isCategorySutra(loc.sutra));
    var journeyWrap = $("toc-journey-wrap");
    var scriptureWrap = $("toc-scripture-wrap");
    if (journeyWrap) journeyWrap.classList.toggle("is-current", onJourney);
    if (scriptureWrap) scriptureWrap.classList.toggle("is-current", !onJourney);

    var journeyLink = $("toc-journey");
    if (journeyLink) {
      var journey = findSutra("journey");
      var start = journey ? firstStartPage(journey) : 1;
      journeyLink.setAttribute("href", pathForIndex(start ? start - 1 : 0));
    }
  }

  function onJourneyClick(event) {
    if (shouldLetBrowserNavigate(event)) return;
    event.preventDefault();
    closeCategoryMenu();
    var journey = findSutra("journey");
    var start = journey ? firstStartPage(journey) : 1;
    goToPageNumber(start || 1);
  }

  function goToPageNumber(pageNum) {
    if (!pageNum) return false;
    var nextIndex = pageNum - 1;
    if (nextIndex < 0 || nextIndex >= state.sutras.length) return false;
    goTo(nextIndex, nextIndex >= state.index ? 1 : -1);
    return true;
  }

  function onTocSutraClick(sutraId) {
    var sutra = findSutra(sutraId);
    if (!sutra) return;
    if (sutraHasChapters(sutra)) {
      state.tocOpen[sutraId] = !state.tocOpen[sutraId];
      renderToc();
      return;
    }
    if (goToPageNumber(firstStartPage(sutra))) closeCategoryMenu();
  }

  function onTocChapterClick(chapterId) {
    var chapter = findChapter(chapterId);
    if (!chapter) return;
    if (goToPageNumber(pageNumOf(chapter))) closeCategoryMenu();
  }

  function syncTreeOpen() {
    var scriptureWrap = $("toc-scripture-wrap");
    var workWrap = $("toc-work-wrap");
    var scriptureBtn = $("toc-scripture");
    var workBtn = $("toc-work");
    if (scriptureWrap) scriptureWrap.classList.toggle("is-open", !!state.treeOpen.scripture);
    if (workWrap) workWrap.classList.toggle("is-open", !!state.treeOpen.work);
    if (scriptureBtn) scriptureBtn.setAttribute("aria-expanded", state.treeOpen.scripture ? "true" : "false");
    if (workBtn) workBtn.setAttribute("aria-expanded", state.treeOpen.work ? "true" : "false");
  }

  function setTreeLevel(level, open) {
    if (level !== "scripture" && level !== "work") return;
    state.treeOpen[level] = !!open;
    if (level === "scripture" && !open) state.treeOpen.work = false;
    syncTreeOpen();
  }

  function toggleTreeLevel(level) {
    setTreeLevel(level, !state.treeOpen[level]);
  }

  function canNativeShare() {
    return typeof navigator.share === "function";
  }

  function fillShareUrl() {
    var input = $("share-url");
    if (input) input.value = publicUrlForIndex(state.index);
  }

  function renderShareChrome() {
    var copy = t();
    setText("btn-share-label", copy.share);
    setText("share-heading", copy.shareTitle);
    setText("share-hint", copy.shareHint);
    setText("btn-share-copy", copy.shareCopy);
    setText("btn-share-native", copy.shareNative);
    var shareBtn = $("btn-share");
    var closeBtn = $("btn-share-close");
    var urlLabel = $("share-url-label");
    var nativeBtn = $("btn-share-native");
    if (shareBtn) shareBtn.setAttribute("aria-label", copy.share);
    if (closeBtn) closeBtn.setAttribute("aria-label", copy.shareClose);
    if (urlLabel) urlLabel.textContent = copy.share;
    if (nativeBtn) {
      nativeBtn.classList.toggle("is-available", canNativeShare());
    }
    var labels = {
      kakao: copy.shareKakao,
      line: copy.shareLine,
      facebook: copy.shareFacebook,
      x: copy.shareX,
      band: copy.shareBand,
      email: copy.shareEmail,
    };
    var nodes = document.querySelectorAll("[data-share-label]");
    for (var i = 0; i < nodes.length; i += 1) {
      var key = nodes[i].getAttribute("data-share-label");
      if (labels[key]) nodes[i].textContent = labels[key];
    }
    if (state.shareOpen) fillShareUrl();
  }

  function setShareSheet(open) {
    state.shareOpen = !!open;
    if (state.shareOpen) closeCategoryMenu();
    var sheet = $("share-sheet");
    var backdrop = $("share-backdrop");
    var btn = $("btn-share");
    if (sheet) {
      sheet.hidden = !state.shareOpen;
      sheet.classList.toggle("is-open", state.shareOpen);
    }
    if (backdrop) {
      backdrop.hidden = !state.shareOpen;
      backdrop.classList.toggle("is-open", state.shareOpen);
    }
    if (btn) btn.setAttribute("aria-expanded", state.shareOpen ? "true" : "false");
    document.body.style.overflow = state.shareOpen ? "hidden" : "";
    if (state.shareOpen) {
      fillShareUrl();
      renderShareChrome();
      var copyBtn = $("btn-share-copy");
      window.setTimeout(function () {
        if (copyBtn) copyBtn.focus();
      }, 0);
    } else if (btn) {
      btn.focus();
    }
  }

  function copyTextFallback(text) {
    return new Promise(function (resolve, reject) {
      var ta = document.createElement("textarea");
      ta.value = text;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.left = "-9999px";
      document.body.appendChild(ta);
      ta.select();
      try {
        var ok = document.execCommand("copy");
        document.body.removeChild(ta);
        if (ok) resolve();
        else reject(new Error("copy failed"));
      } catch (err) {
        document.body.removeChild(ta);
        reject(err);
      }
    });
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(text).catch(function () {
        return copyTextFallback(text);
      });
    }
    return copyTextFallback(text);
  }

  function currentShareUrl() {
    return publicUrlForIndex(state.index);
  }

  function copyShareUrl(successMessage) {
    var url = currentShareUrl();
    var input = $("share-url");
    var copyBtn = $("btn-share-copy");
    if (input) {
      input.value = url;
      input.select();
    }
    return copyText(url)
      .then(function () {
        showToast(successMessage || t().shareCopied);
        if (copyBtn) {
          copyBtn.textContent = t().shareCopied;
          if (state.shareCopyTimer) window.clearTimeout(state.shareCopyTimer);
          state.shareCopyTimer = window.setTimeout(function () {
            if (copyBtn) copyBtn.textContent = t().shareCopy;
            state.shareCopyTimer = null;
          }, 1800);
        }
      })
      .catch(function () {
        if (input) input.focus();
      });
  }

  function nativeShare() {
    var url = currentShareUrl();
    var payload = {
      title: document.title,
      text: shareMessage(),
      url: url,
    };
    if (!canNativeShare()) return copyShareUrl();
    return navigator.share(payload).catch(function (err) {
      if (err && err.name === "AbortError") return;
      copyShareUrl();
    });
  }

  function openShareWindow(url) {
    window.open(url, "_blank", "noopener,noreferrer,width=640,height=560");
  }

  function shareVia(channel) {
    var url = currentShareUrl();
    var text = shareMessage();
    var title = document.title;
    var encodedUrl = encodeURIComponent(url);
    var encodedText = encodeURIComponent(text);
    if (channel === "kakao") {
      if (canNativeShare()) {
        nativeShare();
        return;
      }
      copyShareUrl(t().shareKakaoHint);
      return;
    }
    if (channel === "line") {
      openShareWindow("https://social-plugins.line.me/lineit/share?url=" + encodedUrl);
      return;
    }
    if (channel === "facebook") {
      openShareWindow("https://www.facebook.com/sharer/sharer.php?u=" + encodedUrl);
      return;
    }
    if (channel === "x") {
      openShareWindow(
        "https://twitter.com/intent/tweet?text=" + encodedText + "&url=" + encodedUrl
      );
      return;
    }
    if (channel === "band") {
      openShareWindow(
        "https://www.band.us/plugin/share?body=" +
          encodeURIComponent(text + "\n" + url) +
          "&route=" +
          encodedUrl
      );
      return;
    }
    if (channel === "email") {
      location.href =
        "mailto:?subject=" +
        encodeURIComponent(title) +
        "&body=" +
        encodeURIComponent(text + "\n\n" + url);
    }
  }

  function bindEvents() {
    $("lang-ko").addEventListener("click", function () {
      setLang("ko");
    });
    $("lang-en").addEventListener("click", function () {
      setLang("en");
    });
    $("btn-prev").addEventListener("click", function (event) {
      if (shouldLetBrowserNavigate(event)) return;
      event.preventDefault();
      goPrev();
    });
    $("btn-next").addEventListener("click", function (event) {
      if (shouldLetBrowserNavigate(event)) return;
      event.preventDefault();
      goNext();
    });
    $("page-jump-btn").addEventListener("click", openPageJump);
    $("page-jump-form").addEventListener("submit", submitPageJump);
    $("page-jump-input").addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        event.preventDefault();
        closePageJump();
      }
    });
    $("page-jump-input").addEventListener("blur", function () {
      if (isPageJumpOpen()) submitPageJump();
    });
    window.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && state.shareOpen) {
        setShareSheet(false);
        return;
      }
      if (event.key === "Escape" && (state.treeOpen.scripture || state.treeOpen.work)) {
        closeCategoryMenu();
        return;
      }
      if (isPageJumpOpen()) return;
      if (state.shareOpen) return;
      if (isGreetingView()) return;
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    });
    window.addEventListener("popstate", applyLocationFromUrl);
    window.addEventListener("hashchange", function () {
      if (location.protocol === "file:" || location.hash.indexOf("#/") === 0) {
        applyLocationFromUrl();
      }
    });

    var journeyLink = $("toc-journey");
    if (journeyLink) {
      journeyLink.addEventListener("click", function (event) {
        event.stopPropagation();
        onJourneyClick(event);
      });
    }
    var scriptureBtn = $("toc-scripture");
    if (scriptureBtn) {
      scriptureBtn.addEventListener("click", function (event) {
        event.stopPropagation();
        toggleTreeLevel("scripture");
      });
    }
    var workBtn = $("toc-work");
    if (workBtn) {
      workBtn.addEventListener("click", function (event) {
        event.stopPropagation();
        if (!state.treeOpen.scripture) setTreeLevel("scripture", true);
        toggleTreeLevel("work");
      });
    }
    document.addEventListener("click", function (event) {
      var bar = $("cat-bar");
      if (!bar || bar.contains(event.target)) return;
      if (state.treeOpen.scripture || state.treeOpen.work) closeCategoryMenu();
    });
    var tocNav = $("toc-nav");
    if (tocNav) {
      tocNav.addEventListener("click", function (event) {
        var sutraBtn = event.target.closest("[data-toc-sutra]");
        if (sutraBtn) {
          if (sutraBtn.tagName === "A" && shouldLetBrowserNavigate(event)) return;
          if (sutraBtn.tagName === "A") event.preventDefault();
          onTocSutraClick(sutraBtn.getAttribute("data-toc-sutra"));
          return;
        }
        var chBtn = event.target.closest("[data-toc-chapter]");
        if (chBtn) {
          if (shouldLetBrowserNavigate(event)) return;
          event.preventDefault();
          onTocChapterClick(chBtn.getAttribute("data-toc-chapter"));
        }
      });
    }

    var shareBtn = $("btn-share");
    if (shareBtn) {
      shareBtn.addEventListener("click", function () {
        setShareSheet(!state.shareOpen);
      });
    }
    var shareClose = $("btn-share-close");
    if (shareClose) {
      shareClose.addEventListener("click", function () {
        setShareSheet(false);
      });
    }
    var shareBackdrop = $("share-backdrop");
    if (shareBackdrop) {
      shareBackdrop.addEventListener("click", function () {
        setShareSheet(false);
      });
    }
    var shareCopy = $("btn-share-copy");
    if (shareCopy) {
      shareCopy.addEventListener("click", function () {
        copyShareUrl();
      });
    }
    var shareNative = $("btn-share-native");
    if (shareNative) {
      shareNative.addEventListener("click", function () {
        nativeShare();
      });
    }
    var shareUrlInput = $("share-url");
    if (shareUrlInput) {
      shareUrlInput.addEventListener("click", function () {
        shareUrlInput.select();
      });
    }
    var shareChannels = document.querySelector(".share-channels");
    if (shareChannels) {
      shareChannels.addEventListener("click", function (event) {
        var channelBtn = event.target.closest("[data-share]");
        if (!channelBtn) return;
        shareVia(channelBtn.getAttribute("data-share"));
      });
    }
  }

  function init(sutras) {
    state.sutras = sutras && sutras.length ? sutras : [emptyPage()];
    state.toc = loadToc();
    hydrateTocFromPages();
    var firstScripture = scriptureSutras()[0];
    if (firstScripture) state.tocOpen[firstScripture.id] = true;
    state.lang = readSavedLang();
    var fromUrl = indexFromLocation();
    var saved = readSavedIndex(state.sutras);
    var usedResume = false;
    if (fromUrl >= 0) {
      state.index = fromUrl;
    } else {
      state.index = saved.index;
      usedResume = saved.resumed;
    }
    ensureActiveTocOpen();
    storageSet(PAGE_KEY, String(currentPage().id));
    storageSet(LANG_KEY, state.lang);
    document.documentElement.lang = state.lang === "ko" ? "ko" : "en";

    var banner = $("preview-banner");
    if (banner && isPreviewMode()) banner.classList.remove("hidden");

    bindEvents();
    renderChrome();
    renderPage(false);
    syncUrl(true);
    applyMoment(pickMoment());
    if (!isGreetingView()) restartHealingTimer();

    if (usedResume && !isPreviewMode() && !isGreetingView()) showResumeToast();
  }

  loadSutrasFromJson().then(init);
})();
