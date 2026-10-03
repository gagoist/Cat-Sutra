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
      blessings: "가피",
      dreams: "꿈",
      work: "법화삼부경",
      comingSoon: "준비 중",
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
      shareText: "{title} {n}쪽부터 이어서 보기",
      footerAbout: "About",
      footerPrivacy: "개인정보처리방침",
      footerContact: "문의",
      footerNav: "사이트 정보",
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
      blessings: "Blessings",
      dreams: "Dreams",
      work: "Threefold Lotus Sutra",
      comingSoon: "Coming soon",
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
      shareText: "Continue {title} from page {n}",
      footerAbout: "About",
      footerPrivacy: "Privacy Policy",
      footerContact: "Contact",
      footerNav: "Site information",
    },
  };

  var MOMENTS = [
    {
      id: "lotus",
      ko: "연꽃 곁에서, 한 장을 기다립니다.",
      en: "Beside a lotus, waiting for the next page.",
    },
    {
      id: "sleep",
      ko: "경전을 덮어도, 숨은 고르게 이어집니다.",
      en: "Even with the sutra closed, the breath stays even.",
    },
    {
      id: "reading",
      ko: "이 구절이 마음에 든다.",
      en: "This verse sits well in the heart.",
    },
    {
      id: "stretch",
      ko: "오늘도 한 장, 천천히.",
      en: "One page today — slowly, kindly.",
    },
    {
      id: "samantabhadra",
      ko: "한 걸음이 곧 보현행입니다.",
      en: "A single step is already Samantabhadra’s path.",
    },
  ];

  var SCRIPT_EL = document.currentScript;
  var CATEGORY_LEVELS = ["journey", "blessings", "dreams"];

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
      journey: false,
      blessings: false,
      dreams: false,
    },
    shareOpen: false,
    shareCopyTimer: null,
    cmsView: {
      category: null,
      slug: null,
    },
    infoPage: null,
    contactSent: false,
    contactSending: false,
    contactDraft: null,
  };

  function $(id) {
    return document.getElementById(id);
  }

  function setText(id, value) {
    var el = $(id);
    if (el) el.textContent = value;
  }

  function renderSiteTitle(title) {
    var el = $("site-title");
    if (!el) return;
    var text = String(title || "");
    var space = text.indexOf(" ");
    if (state.lang === "ko" && space > 0) {
      el.innerHTML =
        escapeHtml(text.slice(0, space)) +
        ' <br class="site-title-break">' +
        escapeHtml(text.slice(space + 1));
      return;
    }
    el.textContent = text;
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
    if (state.infoPage) {
      renderToc();
      renderInfoPage(state.infoPage);
      renderHealingCaption();
      return;
    }
    if (state.cmsView && state.cmsView.slug) {
      renderToc();
      renderCmsPost(state.cmsView.category, state.cmsView.slug);
      renderHealingCaption();
      return;
    }
    renderPage(false);
    renderHealingCaption();
    syncGreetingMode();
  }

  function goTo(nextIndex, dir, options) {
    options = options || {};
    if (nextIndex < 0 || nextIndex >= state.sutras.length) return;
    if (nextIndex === state.index) {
      if ((state.cmsView && state.cmsView.slug) || state.infoPage) {
        renderPage(false);
        syncUrl(false);
      }
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

    var total = scopeCount(state.index);
    var current = scopeOrdinal(state.index);
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
    var total = scopeCount(state.index);
    var raw = input ? String(input.value || "").trim() : "";
    var nextPage = parseInt(raw, 10);
    closePageJump();
    if (!nextPage || nextPage < 1 || nextPage > total) return;
    var nextIndex = indexFromScopeOrdinal(state.index, nextPage);
    if (nextIndex < 0) return;
    goTo(nextIndex, nextIndex >= state.index ? 1 : -1);
  }

  function renderChrome() {
    var copy = t();
    setText("archive-label", copy.archive);
    renderSiteTitle(copy.siteTitle);
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
    setText("toc-blessings-label", copy.blessings);
    setText("toc-dreams-label", copy.dreams);
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
        "rounded-full px-3.5 py-1.5 font-sans text-sm tracking-wide transition-all duration-300 sm:px-4 " +
        (koOn ? "bg-seal text-paper-deep" : "text-ink-muted hover:text-ivory");
    }
    if (enBtn) {
      enBtn.setAttribute("aria-pressed", koOn ? "false" : "true");
      enBtn.className =
        "rounded-full px-3.5 py-1.5 font-sans text-sm tracking-wide transition-all duration-300 sm:px-4 " +
        (!koOn ? "bg-seal text-paper-deep" : "text-ink-muted hover:text-ivory");
    }
    renderSiteInfoFooter();
  }

  var JOURNEY_SUBHEADS = {
    "이 작은 공간을 만들게 된 이야기": 1,
    "저에게도 남아 있던 일곱 글자": 1,
    "한 권의 경전에서 시작된 생각": 1,
    "작은 기록도 하나의 인연이 될 수 있기에": 1,
    "작은 기록 하나도 누군가에게는 새로운 인연의 시작이 될 수 있다는 것.": 1,
    "어머니께 드리는 작은 효도": 1,
    "언젠가 다시 경전을 세상에 내놓을 수 있기를": 1,
    "단 한 사람의 인연이라도": 1,
    "연뿌리봉사단의 이야기": 1,
    "묘현사의 이야기": 1,
    "묘련대사": 1,
    "묘각스님": 1,
    "다시 세워진 도량": 1,
    "그리고, 이곳에서 다시 시작되는 이야기": 1,
    "부처님을 향한 오랜 믿음과 하나의 숙제": 1,
    "어머니의 발자취를 따라, 나에게로 이어진 인연": 1,
    "우리가 생각하는 광선유포와 세상으로 향하는 나눔": 1,
    "받은 복을 세상에 나누며: 새로운 인연을 기다리며": 1,
    "The Story Behind This Little Space": 1,
    "The Seven Words That Remained With Me": 1,
    "A Thought That Began With a Single Scripture": 1,
    "Because Even a Small Record Can Become a New Connection": 1,
    "Even a small record can become the beginning of a new connection for someone.": 1,
    "A Small Offering to My Mother": 1,
    "Hoping to Bring the Scriptures Back Into the World Someday": 1,
    "If It Reaches Even One Person": 1,
    "The Story of Yeonroot Volunteer Group": 1,
    "The Story of Myohyeonsa": 1,
    "Master Myoryeon": 1,
    "Master Myogak": 1,
    "A Temple Reborn": 1,
    "A Continuing Connection": 1,
    "A Lifelong Faith and a Long-Awaited Answer": 1,
    "From Mother's Footsteps to My Own Path": 1,
    "Our Vision of Propagation and Sharing with the World": 1,
    "Sharing the Blessings We Have Received: Waiting for New Encounters": 1,
  };

  function normalizeSubheadKey(text) {
    return String(text || "")
      .replace(/^##\s+/, "")
      .replace(/[\u2018\u2019\u02BC]/g, "'")
      .replace(/\s+/g, " ")
      .trim();
  }

  function isJourneySubhead(text) {
    return !!JOURNEY_SUBHEADS[normalizeSubheadKey(text)];
  }

  function readingParagraphs(text, options) {
    var allowSubheads = !!(options && options.subheads);
    var chunks = String(text || "")
      .replace(/\r\n/g, "\n")
      .split(/\n+/);
    var html = "";
    var i;
    for (i = 0; i < chunks.length; i += 1) {
      if (!chunks[i].trim()) continue;
      if (allowSubheads && isJourneySubhead(chunks[i])) {
        html += '<h3 class="sutra-subhead">' + escapeHtml(normalizeSubheadKey(chunks[i])) + "</h3>";
      } else {
        html += '<p class="sutra-para">' + escapeHtml(chunks[i]) + "</p>";
      }
    }
    return html;
  }

  function columnHtml(kicker, body, kind, bordered) {
    var isPrimary = kind === "ko" || kind === "en";
    var sectionClass = "sutra-section" + (bordered ? " is-bordered" : "") + (isPrimary ? " is-primary" : " is-secondary");
    var bodyClass = "sutra-body";
    if (kind === "ko") bodyClass += " sutra-ko";
    else if (kind === "en") bodyClass += " sutra-en";
    else if (kind === "commentary-en") bodyClass += " sutra-commentary sutra-en";
    else bodyClass += " sutra-commentary";
    return (
      '<section class="' +
      sectionClass +
      '">' +
      '<div class="sutra-measure">' +
      '<p class="column-kicker">' +
      escapeHtml(kicker) +
      "</p>" +
      '<div class="' +
      bodyClass +
      '">' +
      readingParagraphs(body) +
      "</div>" +
      "</div>" +
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

  function safeMarkdownUrl(url) {
    var value = String(url || "")
      .replace(/&amp;/g, "&")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .trim();
    if (!value || /[\s"'<>]/.test(value) || value.indexOf("\\") >= 0) return "";
    if (/^https?:\/\//i.test(value)) return escapeHtml(value);
    if (value.charAt(0) === "/" && value.charAt(1) !== "/") return escapeHtml(value);
    return "";
  }

  function renderInlineMarkdown(escaped) {
    var html = String(escaped || "");
    html = html.replace(/!\[([^\]]*)\]\(([^)\s]+)\)/g, function (match, alt, url) {
      var href = safeMarkdownUrl(url);
      if (!href) return alt;
      return '<img src="' + href + '" alt="' + alt + '">';
    });
    html = html.replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, function (match, label, url) {
      var href = safeMarkdownUrl(url);
      if (!href) return label;
      return '<a href="' + href + '">' + label + "</a>";
    });
    html = html.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/(^|[^*])\*([^*\n]+)\*/g, "$1<em>$2</em>");
    return html;
  }

  function isMarkdownBlockLine(line) {
    return /^(?:#{2,3}\s+|-\s+|>\s?)/.test(line);
  }

  function renderSimpleMarkdown(markdown) {
    var text = String(markdown || "").replace(/\r\n/g, "\n");
    var lines = text.split("\n");
    var html = "";
    var i = 0;
    while (i < lines.length) {
      var line = lines[i];
      if (!line.trim()) {
        i += 1;
        continue;
      }
      if (/^###\s+/.test(line)) {
        html +=
          '<h3 class="sutra-subhead">' +
          renderInlineMarkdown(escapeHtml(line.replace(/^###\s+/, ""))) +
          "</h3>";
        i += 1;
        continue;
      }
      if (/^##\s+/.test(line)) {
        html +=
          '<h2 class="sutra-subhead">' +
          renderInlineMarkdown(escapeHtml(line.replace(/^##\s+/, ""))) +
          "</h2>";
        i += 1;
        continue;
      }
      if (/^>\s?/.test(line)) {
        var quote = [];
        while (i < lines.length && /^>\s?/.test(lines[i])) {
          quote.push(escapeHtml(lines[i].replace(/^>\s?/, "")));
          i += 1;
        }
        html += "<blockquote>" + renderInlineMarkdown(quote.join("\n")).replace(/\n/g, "<br>") + "</blockquote>";
        continue;
      }
      if (/^-\s+/.test(line)) {
        html += "<ul>";
        while (i < lines.length && /^-\s+/.test(lines[i])) {
          html += "<li>" + renderInlineMarkdown(escapeHtml(lines[i].replace(/^-\s+/, ""))) + "</li>";
          i += 1;
        }
        html += "</ul>";
        continue;
      }
      var para = [];
      while (i < lines.length && lines[i].trim() && !isMarkdownBlockLine(lines[i])) {
        para.push(escapeHtml(lines[i]));
        i += 1;
      }
      html += '<p class="sutra-para">' + renderInlineMarkdown(para.join("\n")).replace(/\n/g, "<br>") + "</p>";
    }
    return html;
  }

  function renderPage(animate) {
    clearCmsView();
    leaveInfoPage();
    var page = currentPage();
    if (!page) return;

    var copy = t();
    var greeting = isGreetingView();
    var total = scopeCount(state.index);
    var current = scopeOrdinal(state.index);
    var columns = $("columns");
    var progress = $("progress-bar");
    var prevBtn = $("btn-prev");
    var nextBtn = $("btn-next");
    var card = $("sutra-card");

    var titleEl = $("chapter-title");
    if (titleEl) {
      titleEl.classList.remove("turn-next", "turn-prev");
      titleEl.innerHTML = pageHeadingHtml();
      if (animate) {
        void titleEl.offsetWidth;
        titleEl.classList.add(state.direction < 0 ? "turn-prev" : "turn-next");
      }
    }
    setText("hanja-text", page.hanja);
    var hanjaText = $("hanja-text");
    var hanjaHeader = hanjaText && hanjaText.closest("header");
    if (hanjaHeader) {
      hanjaHeader.hidden = !String(page.hanja || "").trim();
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
          ? page.english || page.explanationEn || page.recitation || page.hanja || ""
          : page.recitation || page.explanation || page.hanja || page.english || "";
      if (hanjaHeader) {
        hanjaHeader.hidden = true;
      }
      if (columns) {
        columns.innerHTML = String(greetBody).trim()
          ? '<section class="sutra-section is-primary">' +
            '<div class="sutra-measure">' +
            '<div class="sutra-body is-essay ' +
            (state.lang === "en" ? "sutra-en" : "sutra-ko") +
            '">' +
            readingParagraphs(greetBody, { subheads: true }) +
            "</div></div></section>"
          : "";
      }
      if (card) card.hidden = !String(greetBody).trim();
    } else {
      if (card) card.hidden = false;
      var order =
        state.lang === "en"
          ? [
              { kicker: copy.english, body: page.english, kind: "en" },
              { kicker: copy.explanation, body: page.explanationEn, kind: "commentary-en" },
            ]
          : [
              { kicker: copy.recitation, body: page.recitation, kind: "ko" },
              { kicker: copy.explanation, body: page.explanation, kind: "commentary" },
            ];

      var html = "";
      var shown = 0;
      for (var i = 0; i < order.length; i += 1) {
        if (!String(order[i].body || "").trim()) continue;
        html += columnHtml(order[i].kicker, order[i].body, order[i].kind, shown > 0);
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
    showToast(t().resume + " · " + pad2(scopeOrdinal(state.index)));
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

  function itemEndPage(item) {
    var start = pageNumOf(item);
    var end = Number(item && item.endPage);
    if (!start) return 0;
    if (!end || end < start) return start;
    return end;
  }

  function itemPageCount(item) {
    var start = pageNumOf(item);
    var end = itemEndPage(item);
    return start ? end - start + 1 : 0;
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

  function chapterLineText(chapter, sutra) {
    if (!chapter) return "";
    if (isCategorySutra(sutra)) {
      var label = (state.lang === "en" ? chapter.en : chapter.ko) || chapter.ko || chapter.en || "";
      return pad2(chapter.no) + ". " + label;
    }
    if (state.lang === "en") {
      var enLine = "Chapter " + chapter.no + " · " + (chapter.en || chapter.ko || "");
      if (chapter.noteEn) enLine += " (" + chapter.noteEn + ")";
      return enLine;
    }
    var koLine = "제" + chapter.no + "품 " + (chapter.ko || "");
    if (chapter.note) koLine += " (" + chapter.note + ")";
    return koLine;
  }

  function chapterTitleHtml(chapter, sutra) {
    if (isCategorySutra(sutra)) {
      return escapeHtml(chapterLineText(chapter, sutra));
    }
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
        '<span class="toc-chevron" aria-hidden="true">›</span>' +
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
          var chCount = itemPageCount(ch);
          html +=
            '<li><a class="toc-chapter' +
            (chActive ? " is-active" : "") +
            '" href="' +
            escapeHtml(chStart ? pathForIndex(chStart - 1) : pathForIndex(state.index)) +
            '" data-toc-chapter="' +
            escapeHtml(ch.id) +
            '">' +
            '<span class="toc-chapter-name">' +
            chapterTitleHtml(ch, sutra) +
            "</span>" +
            (chCount
              ? '<span class="toc-pages">' +
                (state.lang === "en" ? chCount + " pp." : chCount + "쪽") +
                "</span>"
              : "") +
            "</a></li>";
        }
        html += "</ul>";
      }
      html += "</section>";
    }
    root.innerHTML = html;
    root.scrollTop = savedScroll;
    renderAllCategoryNavs();

    var activeEl = root.querySelector(".is-active");
    if (activeEl && typeof activeEl.scrollIntoView === "function") {
      activeEl.scrollIntoView({ block: "nearest" });
    }
  }

  function renderAllCategoryNavs() {
    for (var i = 0; i < CATEGORY_LEVELS.length; i += 1) {
      renderCategoryNav(CATEGORY_LEVELS[i]);
    }
  }

  function getCmsPosts(categoryId) {
    var content = window.LOTUS_CONTENT;
    if (!content) return [];
    if (categoryId !== "blessings" && categoryId !== "dreams") return [];
    var posts = content[categoryId];
    return Array.isArray(posts) ? posts : [];
  }

  function getCmsPost(categoryId, slug) {
    var posts = getCmsPosts(categoryId);
    var key = String(slug || "");
    for (var i = 0; i < posts.length; i += 1) {
      if (String((posts[i] && posts[i].slug) || "") === key) return posts[i];
    }
    return null;
  }

  function cmsPathParts(pathname) {
    var path = String(pathname || "").split("?")[0].split("#")[0];
    path = path.replace(/\/index\.html$/i, "");
    return path.split("/").filter(function (part) {
      return part !== "";
    });
  }

  var CONTACT_TOPICS = [
    {
      value: "경전·번역 오류 / Scripture or translation",
      ko: "경전·번역 오류",
      en: "Scripture or translation",
    },
    {
      value: "사이트 오류 / Site issue",
      ko: "사이트 오류",
      en: "Site issue",
    },
    {
      value: "콘텐츠 관련 / Content",
      ko: "콘텐츠 관련",
      en: "Content",
    },
    {
      value: "기타 문의 / Other",
      ko: "기타 문의",
      en: "Other",
    },
  ];

  var INFO = {
    ko: {
      about: {
        title: "Lotus Root 소개",
        blocks: [
          {
            p: "Lotus Root는 법화경과 불교의 가르침을 더 많은 사람이 쉽게 접하고, 관련된 기록과 경험을 오래 보존하기 위해 만들어진 온라인 공간입니다.",
          },
          {
            p: "이곳에는 법화삼부경의 원문과 번역, 해설을 비롯해 불교를 믿으며 살아가는 사람들이 경험한 가피와 꿈, 그리고 신앙과 삶에 관한 여러 기록을 차근차근 담아가고 있습니다.",
          },
          { h: "법화삼부경과 Lotus Root" },
          {
            p: "Lotus Root에서 소개하는 법화삼부경 관련 자료 중 일부는 묘현사 묘각스님이 소유한 자료를 바탕으로 하고 있습니다.",
          },
          {
            p: "관련 자료의 출처와 권리를 존중하며, 경전의 내용을 더 많은 사람이 읽고 오래 보존할 수 있는 방법을 찾아가는 것을 중요한 목표로 삼고 있습니다.",
          },
          {
            p: "장기적으로는 온라인에서 경전을 보다 편리하게 읽을 수 있는 환경을 만들고, 종이 경전과 전자 경전 등 새로운 형태로 다시 전할 수 있는 방법도 차근차근 준비하고자 합니다.",
          },
          { h: "기록에서 실천으로" },
          {
            p: "Lotus Root는 경전을 읽고 기록하는 것에만 머무르지 않고, 그 인연이 작은 실천과 나눔으로 이어질 수 있는 공간을 지향합니다.",
          },
          {
            p: "사이트를 운영하며 만들어지는 여러 자원 역시 가능한 범위에서 경전 제작과 보존, 불교 콘텐츠, 나눔과 불교를 알리는 활동에 다시 활용하고자 합니다.",
          },
          {
            p: "앞으로 여건이 마련된다면 과거 연뿌리 봉사단의 활동과 새로운 나눔의 기록 역시 이곳에 차근차근 담아가려고 합니다.",
          },
          {
            p: "지금은 작은 온라인 공간이지만, 시간이 지나면서 경전과 사람, 그리고 또 다른 인연을 이어주는 하나의 뿌리가 되기를 바랍니다.",
          },
        ],
      },
      privacy: {
        title: "개인정보처리방침",
        blocks: [
          {
            p: "Lotus Root는 이용자의 개인정보를 소중히 여기며, 이 페이지에서 개인정보를 어떻게 다루는지 안내합니다.",
          },
          { h: "1. 회원가입", legal: 1 },
          { p: "이 사이트는 별도의 회원가입 기능을 두지 않습니다." },
          { h: "2. 문의를 통해 수집하는 정보", legal: 1 },
          {
            p: "문의 기능을 이용할 경우, 이름 또는 닉네임(선택), 이메일 주소, 문의 내용이 수집될 수 있습니다.",
          },
          { h: "3. 이용 과정에서 처리될 수 있는 정보", legal: 1 },
          {
            p: "호스팅과 보안 과정에서 IP 주소, 브라우저 및 기기 정보, 접속 기록 등이 기술적으로 처리될 수 있습니다.",
          },
          { h: "4. 이용 목적", legal: 1 },
          {
            p: "수집한 정보는 문의 확인과 답변, 사이트 운영, 보안, 오류 확인을 위해 사용합니다.",
          },
          { h: "5. 외부 서비스 제공자", legal: 1 },
          {
            p: "사이트 운영을 위해 Netlify 등 외부 서비스 제공자를 이용할 수 있습니다.",
          },
          { h: "6. 광고", legal: 1 },
          {
            p: "향후 Google AdSense 등 제3자 광고 서비스를 사용할 수 있습니다. 광고 서비스가 적용되는 경우, Google 등 제3자가 쿠키(cookies), 웹 비콘(web beacons), IP 주소 또는 그 밖의 식별자(identifiers)를 사용할 수 있습니다.",
          },
          {
            rich: [
              "광고 서비스가 적용되는 경우, Google 및 파트너사는 방문 정보를 바탕으로 광고를 제공할 수 있습니다. 맞춤 광고 설정은 ",
              {
                external: 1,
                href: "https://adssettings.google.com/",
                label: "Google 광고 설정",
              },
              "에서 관리할 수 있습니다.",
            ],
          },
          { h: "7. 외부 사이트", legal: 1 },
          {
            p: "이 사이트에서 연결되는 외부 사이트에는 해당 사이트의 개인정보처리방침이 적용됩니다.",
          },
          { h: "8. 방침의 변경", legal: 1 },
          { p: "이 방침은 서비스의 변경에 따라 수정될 수 있습니다." },
          { p: "시행일: 2026-10-03" },
          {
            rich: [
              "개인정보 문의는 ",
              { page: "contact", label: "문의" },
              " 페이지를 이용해 주세요.",
            ],
          },
        ],
      },
      contact: {
        title: "문의",
        blocks: [
          { p: "Lotus Root의 콘텐츠에 관한 의견이나 문의를 남겨주세요." },
          {
            p: "법화경 원문이나 번역·표기의 오류, 사이트 이용 중 발견한 문제, 콘텐츠와 관련된 제안도 환영합니다.",
          },
          {
            p: "모든 문의에 답변을 드리지는 못할 수 있지만, 보내주신 내용은 사이트를 운영하고 자료를 정리하는 데 참고하겠습니다.",
          },
        ],
        nameLabel: "이름 또는 닉네임",
        nameOptional: "선택",
        emailLabel: "이메일",
        topicLabel: "문의 유형",
        topicPlaceholder: "선택해 주세요",
        messageLabel: "문의 내용",
        consentBefore:
          "문의 답변을 위해 이름 또는 닉네임(선택), 이메일 주소 및 문의 내용을 수집·이용합니다. 이메일 주소와 문의 내용은 문의 처리를 위해 사용되며, ",
        consentLink: "개인정보처리방침",
        consentAfter:
          "에 따라 관리됩니다. 개인정보 수집·이용에 동의하지 않을 수 있으나 이 경우 문의 접수가 어렵습니다.",
        submit: "보내기",
        success: "문의가 접수되었습니다. 감사합니다.",
        error: "문의 전송 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.",
      },
    },
    en: {
      about: {
        title: "About Lotus Root",
        blocks: [
          {
            p: "Lotus Root is an online space created so that more people can come to the Lotus Sutra and the teachings of Buddhism with ease, and so that the records and experiences around them can be kept for a long time.",
          },
          {
            p: "It is slowly gathering the original text, translations, and commentary of the Threefold Lotus Sutra, together with blessings and dreams experienced by people who live their Buddhist faith, and other records of faith and daily life.",
          },
          { h: "The Threefold Lotus Sutra and Lotus Root" },
          {
            p: "Some of the Threefold Lotus Sutra materials presented on Lotus Root are based on sources held by Venerable Myogak of Myohyeonsa.",
          },
          {
            p: "The site respects the origin and rights of those materials. An important aim is to find ways for more people to read the scriptures, and for the scriptures to be preserved over time.",
          },
          {
            p: "Over the long term, Lotus Root hopes to make the sutras easier to read online, and to prepare, step by step, for passing them on again in new forms, including printed editions and electronic texts.",
          },
          { h: "From Record to Practice" },
          {
            p: "Lotus Root is not meant to stop at reading and recording. It hopes to be a place where that connection can continue into small acts of practice and sharing.",
          },
          {
            p: "Resources that come from running the site will, wherever possible, be used again for making and preserving the scriptures, for Buddhist writing, and for sharing Buddhism with others.",
          },
          {
            p: "If the time comes, the earlier work of the Yeonroot Volunteer Group, and new records of giving, will also be gathered here little by little.",
          },
          {
            p: "This is still a small online space. With time, we hope it becomes a root that joins the scriptures, the people who read them, and connections still to come.",
          },
        ],
      },
      privacy: {
        title: "Privacy Policy",
        blocks: [
          {
            p: "Lotus Root cares about your privacy. This page explains how personal information is handled on the site.",
          },
          { h: "1. Accounts", legal: 1 },
          { p: "Lotus Root does not offer a separate sign-up or membership feature." },
          { h: "2. Information collected through the contact form", legal: 1 },
          {
            p: "If you use the contact form, we may collect your name or nickname (optional), email address, and the content of your message.",
          },
          { h: "3. Information processed while you use the site", legal: 1 },
          {
            p: "In the course of hosting and security, an IP address, browser and device information, and access logs may be processed for technical reasons.",
          },
          { h: "4. How the information is used", legal: 1 },
          {
            p: "Information that is collected is used to read and reply to inquiries, to operate the site, to keep it secure, and to look into errors.",
          },
          { h: "5. Service providers", legal: 1 },
          { p: "Lotus Root may use outside service providers, such as Netlify, to operate the site." },
          { h: "6. Advertising", legal: 1 },
          {
            p: "In the future, Lotus Root may use third-party advertising services such as Google AdSense. If an advertising service is applied, third parties such as Google may use cookies, web beacons, IP addresses, or other identifiers.",
          },
          {
            rich: [
              "If an advertising service is applied, Google and its partners may serve ads based on information about your visit. You can manage personalized ads in ",
              {
                external: 1,
                href: "https://adssettings.google.com/",
                label: "Google Ads Settings",
              },
              ".",
            ],
          },
          { h: "7. Links to other sites", legal: 1 },
          { p: "When this site links to another website, that website's own privacy policy applies." },
          { h: "8. Changes to this policy", legal: 1 },
          { p: "This policy may be updated as the service changes." },
          { p: "Effective date: 2026-10-03" },
          {
            rich: [
              "For questions about your personal information, please use the ",
              { page: "contact", label: "Contact" },
              " page.",
            ],
          },
        ],
      },
      contact: {
        title: "Contact",
        blocks: [
          { p: "Please leave a note or a question about anything on Lotus Root." },
          {
            p: "You are welcome to tell us about errors in the Lotus Sutra text, its translation, or its wording, problems you find while using the site, and suggestions about the content.",
          },
          {
            p: "We may not be able to reply to every message. What you send will still help us run the site and organize its materials.",
          },
        ],
        nameLabel: "Name or nickname",
        nameOptional: "Optional",
        emailLabel: "Email",
        topicLabel: "Type of inquiry",
        messageLabel: "Message",
        topicPlaceholder: "Please choose",
        consentBefore:
          "To reply to your message, we collect and use your name or nickname (optional), your email address, and your message. Your email address and message are used to handle the inquiry and are managed under the ",
        consentLink: "Privacy Policy",
        consentAfter: ". You may decline, but if you do, we will not be able to receive your inquiry.",
        submit: "Send",
        success: "Your message has been received. Thank you.",
        error: "Something went wrong while sending your message. Please try again in a moment.",
      },
    },
  };

  function infoModel(page) {
    var pack = INFO[state.lang] || INFO.ko;
    return pack[page] || pack.about;
  }

  function infoPageUrl(page) {
    if (location.protocol === "file:") return "#/" + page;
    return appBase() + page + "/" + preservedSearch();
  }

  function infoAbsoluteUrl(page) {
    if (location.protocol === "file:") return location.href.split("#")[0] + "#/" + page;
    try {
      return new URL(appBase() + page + "/", location.origin).href;
    } catch (err) {
      return location.origin + appBase() + page + "/";
    }
  }

  function parseInfoRoute() {
    var route = "";
    if (location.hash.indexOf("#/") === 0) {
      route = location.hash.slice(2);
    } else {
      var parts = cmsPathParts(location.pathname);
      if (parts.length >= 2) {
        var prev = String(parts[parts.length - 2] || "").toLowerCase();
        if (prev === "blessings" || prev === "dreams") return null;
      }
      route = parts.length ? parts[parts.length - 1] : "";
    }
    route = String(route || "")
      .replace(/^\/+|\/+$/g, "")
      .toLowerCase();
    if (route === "about" || route === "privacy" || route === "contact") return route;
    return null;
  }

  function repairInfoDocumentBase() {
    if (location.protocol === "file:") return;
    var parts = cmsPathParts(location.pathname);
    if (!parts.length) return;
    var last = String(parts[parts.length - 1] || "").toLowerCase();
    if (last !== "about" && last !== "privacy" && last !== "contact") return;
    if (parts.length >= 2) {
      var prev = String(parts[parts.length - 2] || "").toLowerCase();
      if (prev === "blessings" || prev === "dreams") return;
    }
    var prefixParts = parts.slice(0, -1);
    var prefix = prefixParts.length ? "/" + prefixParts.join("/") + "/" : "/";
    var baseEl = document.querySelector("base");
    if (!baseEl) return;
    baseEl.setAttribute("href", location.origin + prefix);
  }

  function renderSiteInfoFooter() {
    var copy = t();
    var nav = $("site-info-nav");
    if (nav) nav.setAttribute("aria-label", copy.footerNav);
    setText("footer-about", copy.footerAbout);
    setText("footer-privacy", copy.footerPrivacy);
    setText("footer-contact", copy.footerContact);
    var pages = ["about", "privacy", "contact"];
    for (var i = 0; i < pages.length; i += 1) {
      var link = $("footer-" + pages[i]);
      if (!link) continue;
      link.setAttribute("href", infoPageUrl(pages[i]));
      if (state.infoPage === pages[i]) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    }
  }

  function leaveInfoPage() {
    state.infoPage = null;
    state.contactSent = false;
    state.contactDraft = null;
    state.contactSending = false;
    document.body.classList.remove("is-info");
    var actions = document.querySelector(".page-actions");
    if (actions) actions.hidden = false;
    renderSiteInfoFooter();
  }

  function infoRichParagraph(parts) {
    var html = "";
    for (var i = 0; i < parts.length; i += 1) {
      var part = parts[i];
      if (typeof part === "string") html += escapeHtml(part);
      else if (part && part.external) {
        html +=
          '<a href="' +
          escapeHtml(part.href) +
          '" target="_blank" rel="noopener noreferrer">' +
          escapeHtml(part.label) +
          "</a>";
      } else if (part && part.page) {
        html +=
          '<a href="' +
          escapeHtml(infoPageUrl(part.page)) +
          '" data-info-page="' +
          escapeHtml(part.page) +
          '">' +
          escapeHtml(part.label) +
          "</a>";
      }
    }
    return '<p class="sutra-para">' + html + "</p>";
  }

  function renderInfoBlocks(blocks) {
    var html = "";
    for (var i = 0; i < blocks.length; i += 1) {
      var block = blocks[i];
      if (!block) continue;
      if (block.h) {
        html +=
          '<h3 class="' +
          (block.legal ? "info-heading" : "sutra-subhead") +
          '">' +
          escapeHtml(block.h) +
          "</h3>";
      } else if (block.rich) html += infoRichParagraph(block.rich);
      else if (block.p) html += '<p class="sutra-para">' + escapeHtml(block.p) + "</p>";
    }
    return html;
  }

  function contactBodyHtml(model) {
    if (state.contactSent) {
      return (
        '<p id="contact-status" class="contact-status" role="status" tabindex="-1">' +
        escapeHtml(model.success) +
        "</p>"
      );
    }
    var topics = "";
    for (var i = 0; i < CONTACT_TOPICS.length; i += 1) {
      var topic = CONTACT_TOPICS[i];
      var label = state.lang === "en" ? topic.en : topic.ko;
      topics += '<option value="' + escapeHtml(topic.value) + '">' + escapeHtml(label) + "</option>";
    }
    return (
      '<form id="contact-form" class="contact-form" name="lotus-contact" method="POST" action="/" data-netlify="true" data-netlify-honeypot="bot-field">' +
      '<input type="hidden" name="form-name" value="lotus-contact">' +
      '<p hidden><label>Leave this field empty <input name="bot-field" tabindex="-1" autocomplete="off"></label></p>' +
      '<div class="contact-field"><label for="contact-name">' +
      escapeHtml(model.nameLabel) +
      ' <span class="contact-optional">' +
      escapeHtml(model.nameOptional) +
      "</span></label>" +
      '<input id="contact-name" name="name" type="text" autocomplete="name" maxlength="80"></div>' +
      '<div class="contact-field"><label for="contact-email">' +
      escapeHtml(model.emailLabel) +
      "</label>" +
      '<input id="contact-email" name="email" type="email" autocomplete="email" required maxlength="200"></div>' +
      '<div class="contact-field"><label for="contact-topic">' +
      escapeHtml(model.topicLabel) +
      "</label>" +
      '<select id="contact-topic" name="topic" required><option value="" selected disabled>' +
      escapeHtml(model.topicPlaceholder) +
      "</option>" +
      topics +
      "</select></div>" +
      '<div class="contact-field"><label for="contact-message">' +
      escapeHtml(model.messageLabel) +
      "</label>" +
      '<textarea id="contact-message" name="message" required maxlength="5000"></textarea></div>' +
      '<div class="contact-consent"><input id="contact-consent" name="consent" type="checkbox" value="yes" required>' +
      '<label class="contact-consent-text" for="contact-consent">' +
      escapeHtml(model.consentBefore) +
      '<a href="' +
      escapeHtml(infoPageUrl("privacy")) +
      '" data-info-page="privacy">' +
      escapeHtml(model.consentLink) +
      "</a>" +
      escapeHtml(model.consentAfter) +
      "</label></div>" +
      '<button class="contact-submit" type="submit">' +
      escapeHtml(model.submit) +
      "</button></form>" +
      '<p id="contact-status" class="contact-status" role="status" aria-live="polite"></p>'
    );
  }

  function captureContactDraft() {
    var form = $("contact-form");
    if (!form || !form.elements) return;
    state.contactDraft = {
      name: form.elements.name ? form.elements.name.value : "",
      email: form.elements.email ? form.elements.email.value : "",
      topic: form.elements.topic ? form.elements.topic.value : "",
      message: form.elements.message ? form.elements.message.value : "",
      consent: !!(form.elements.consent && form.elements.consent.checked),
    };
  }

  function restoreContactDraft() {
    var draft = state.contactDraft;
    var form = $("contact-form");
    if (!draft || !form || !form.elements) return;
    if (form.elements.name) form.elements.name.value = draft.name || "";
    if (form.elements.email) form.elements.email.value = draft.email || "";
    if (form.elements.topic && draft.topic) form.elements.topic.value = draft.topic;
    if (form.elements.message) form.elements.message.value = draft.message || "";
    if (form.elements.consent) form.elements.consent.checked = !!draft.consent;
  }

  function updateInfoDocumentMeta(page, model) {
    document.title = model.title + " · " + t().siteTitle;
    var desc = "";
    var blocks = model.blocks || [];
    for (var i = 0; i < blocks.length; i += 1) {
      if (blocks[i] && blocks[i].p) {
        desc = blocks[i].p;
        break;
      }
    }
    desc = String(desc).replace(/\s+/g, " ").trim().slice(0, 180);
    var meta = document.querySelector('meta[name="description"]');
    if (meta && desc) meta.setAttribute("content", desc);
    var absUrl = infoAbsoluteUrl(page);
    var canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.setAttribute("rel", "canonical");
      document.head.appendChild(canonical);
    }
    canonical.setAttribute("href", absUrl);
    var ogTitle = document.querySelector('meta[property="og:title"]');
    var ogDesc = document.querySelector('meta[property="og:description"]');
    var ogUrl = document.querySelector('meta[property="og:url"]');
    var twTitle = document.querySelector('meta[name="twitter:title"]');
    var twDesc = document.querySelector('meta[name="twitter:description"]');
    if (ogTitle) ogTitle.setAttribute("content", document.title);
    if (ogDesc && desc) ogDesc.setAttribute("content", desc);
    if (ogUrl) ogUrl.setAttribute("content", absUrl);
    if (twTitle) twTitle.setAttribute("content", document.title);
    if (twDesc && desc) twDesc.setAttribute("content", desc);
  }

  function renderInfoPage(page) {
    if (page !== "about" && page !== "privacy" && page !== "contact") return;
    var stayingOnContact = page === "contact" && state.infoPage === "contact";
    if (stayingOnContact && !state.contactSent) captureContactDraft();
    if (page !== "contact") {
      state.contactSent = false;
      state.contactDraft = null;
      state.contactSending = false;
    }
    clearCmsView();
    state.infoPage = page;
    document.body.classList.add("is-info");
    document.body.classList.remove("is-greeting");
    setCmsChrome(true);
    var actions = document.querySelector(".page-actions");
    if (actions) actions.hidden = true;
    if (state.shareOpen) setShareSheet(false);
    closeCategoryMenu();
    closePageJump();
    if (!state.healingTimer) restartHealingTimer();

    var model = infoModel(page);
    var titleEl = $("chapter-title");
    if (titleEl) {
      titleEl.classList.remove("turn-next", "turn-prev");
      titleEl.innerHTML = '<span class="chapter-line is-sutra">' + escapeHtml(model.title) + "</span>";
    }
    var hanjaText = $("hanja-text");
    var hanjaHeader = hanjaText && hanjaText.closest("header");
    if (hanjaHeader) hanjaHeader.hidden = true;
    var card = $("sutra-card");
    if (card) card.hidden = false;
    var progress = $("progress-bar");
    if (progress) progress.style.width = "0%";

    var columns = $("columns");
    if (columns) {
      var html =
        '<section class="sutra-section is-primary"><div class="sutra-measure info-prose"><div class="sutra-body is-essay ' +
        (state.lang === "en" ? "sutra-en" : "sutra-ko") +
        '">';
      html += renderInfoBlocks(model.blocks || []);
      if (page === "contact") html += contactBodyHtml(model);
      html += "</div></div></section>";
      columns.innerHTML = html;
      if (page === "contact" && !state.contactSent) restoreContactDraft();
    }
    updateInfoDocumentMeta(page, model);
    syncCategoryTabs();
    renderSiteInfoFooter();
  }

  function openInfoPage(page) {
    if (page !== "about" && page !== "privacy" && page !== "contact") return;
    if (state.infoPage === page) return;
    if (page === "contact") {
      state.contactSent = false;
      state.contactDraft = null;
    }
    renderInfoPage(page);
    if (!history || !history.pushState) {
      window.scrollTo(0, 0);
      return;
    }
    var next = infoPageUrl(page);
    try {
      var current =
        location.protocol === "file:" || location.hash.indexOf("#/") === 0
          ? location.hash || ""
          : location.pathname + location.search;
      if (current !== next) history.pushState({ info: page }, "", next);
    } catch (err) {
      /* ignore */
    }
    window.scrollTo(0, 0);
  }

  function normalizeInfoUrl(page) {
    if (location.protocol === "file:" || !history || !history.replaceState) return;
    var next = infoPageUrl(page);
    var current = location.pathname + location.search;
    if (current === next) return;
    try {
      history.replaceState({ info: page }, "", next);
    } catch (err) {
      /* ignore */
    }
  }

  function submitContactForm(form) {
    if (!form || state.contactSending) return;
    state.contactSending = true;
    var button = form.querySelector("button[type='submit']");
    var status = $("contact-status");
    if (button) button.disabled = true;
    if (status) {
      status.textContent = "";
      status.classList.remove("is-error");
    }
    fetch("/", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(new FormData(form)).toString(),
    })
      .then(function (res) {
        if (!res.ok) throw new Error("form failed");
        state.contactSending = false;
        state.contactSent = true;
        state.contactDraft = null;
        if (state.infoPage === "contact") {
          renderInfoPage("contact");
          var done = $("contact-status");
          if (done && done.focus) done.focus();
        }
      })
      .catch(function () {
        state.contactSending = false;
        var currentForm = $("contact-form");
        var currentButton = currentForm ? currentForm.querySelector("button[type='submit']") : button;
        var currentStatus = $("contact-status");
        var model = infoModel("contact");
        if (currentButton) currentButton.disabled = false;
        if (currentStatus) {
          currentStatus.textContent = model && model.error ? model.error : "";
          currentStatus.classList.add("is-error");
        }
      });
  }

  function parseCmsRoute(pathname) {
    var parts = cmsPathParts(pathname);
    if (parts.length < 2) return null;
    var category = parts[parts.length - 2];
    if (category !== "blessings" && category !== "dreams") return null;
    var slug = parts[parts.length - 1];
    try {
      slug = decodeURIComponent(slug);
    } catch (err) {
      return null;
    }
    if (!slug) return null;
    return { category: category, slug: slug };
  }

  function repairCmsDocumentBase() {
    if (location.protocol === "file:") return;
    var parts = cmsPathParts(location.pathname);
    if (parts.length < 2) return;
    var category = parts[parts.length - 2];
    if (category !== "blessings" && category !== "dreams") return;
    var prefixParts = parts.slice(0, -2);
    var prefix = prefixParts.length ? "/" + prefixParts.join("/") + "/" : "/";
    var baseEl = document.querySelector("base");
    if (!baseEl) return;
    baseEl.setAttribute("href", location.origin + prefix);
  }

  function cmsPostUrl(categoryId, slug) {
    var encoded = encodeURIComponent(String(slug || ""));
    var rel = String(categoryId || "") + "/" + encoded + "/";
    if (location.protocol === "file:") return "#/" + rel;
    return appBase() + rel + preservedSearch();
  }

  function updateCmsDocumentTitle(categoryId, post) {
    var copy = t();
    var categoryLabel = categoryId === "dreams" ? copy.dreams : copy.blessings;
    var articleTitle = post
      ? cmsPostTitle(post)
      : state.lang === "en"
        ? "Post not found."
        : "글을 찾을 수 없습니다.";
    document.title = articleTitle + " | " + categoryLabel + " | Lotus Root";
  }

  function cmsPostTitle(post) {
    if (!post) return "";
    if (state.lang === "en") return post.titleEn || post.title || "";
    return post.title || "";
  }

  function cmsBodySource(post) {
    if (!post) return "";
    if (state.lang === "en") return post.bodyEn || post.bodyMarkdown || "";
    return post.bodyMarkdown || "";
  }

  function setCmsChrome(active) {
    var rails = document.querySelectorAll(".page-nav-rail");
    var i;
    for (i = 0; i < rails.length; i += 1) rails[i].hidden = !!active;
    var pageNav = $("page-nav");
    if (pageNav) pageNav.hidden = !!active;
  }

  function clearCmsView() {
    if (state.cmsView) {
      state.cmsView.category = null;
      state.cmsView.slug = null;
    }
    setCmsChrome(false);
  }

  function renderCmsPost(categoryId, slug) {
    if (categoryId !== "blessings" && categoryId !== "dreams") return;
    leaveInfoPage();
    var post = getCmsPost(categoryId, slug);
    state.cmsView.category = categoryId;
    state.cmsView.slug = String((post && post.slug) || slug || "");
    setCmsChrome(true);
    document.body.classList.remove("is-greeting");
    if (!state.healingTimer) restartHealingTimer();

    var copy = t();
    var categoryLabel = categoryId === "dreams" ? copy.dreams : copy.blessings;
    var articleTitle = post
      ? cmsPostTitle(post)
      : state.lang === "en"
        ? "Post not found."
        : "글을 찾을 수 없습니다.";
    var titleEl = $("chapter-title");
    if (titleEl) {
      titleEl.classList.remove("turn-next", "turn-prev");
      titleEl.innerHTML =
        '<span class="chapter-line is-sutra">' +
        escapeHtml(categoryLabel) +
        '</span><span class="chapter-line is-chapter">' +
        escapeHtml(articleTitle) +
        "</span>";
    }

    var hanjaText = $("hanja-text");
    var hanjaHeader = hanjaText && hanjaText.closest("header");
    if (hanjaHeader) hanjaHeader.hidden = true;

    var card = $("sutra-card");
    if (card) card.hidden = false;
    var columns = $("columns");
    if (!post) {
      if (columns) {
        columns.innerHTML =
          '<section class="sutra-section is-primary"><div class="sutra-measure cms-article">' +
          '<p class="sutra-para">' +
          escapeHtml(articleTitle) +
          "</p></div></section>";
      }
      updateCmsDocumentTitle(categoryId, null);
      syncCategoryTabs();
      if (state.shareOpen) fillShareUrl();
      return;
    }
    if (columns) {
      var html = '<section class="sutra-section is-primary"><div class="sutra-measure cms-article">';
      if (String(post.date || "").trim()) {
        html += '<p class="column-kicker">' + escapeHtml(post.date) + "</p>";
      }
      var cover = safeMarkdownUrl(post.coverImage || "");
      if (cover) {
        html += '<img class="cms-cover" src="' + cover + '" alt="' + escapeHtml(cmsPostTitle(post)) + '">';
      }
      if (String(post.summary || "").trim()) {
        html +=
          '<p class="cms-summary">' +
          escapeHtml(post.summary).replace(/\r\n/g, "\n").replace(/\n/g, "<br>") +
          "</p>";
      }
      html +=
        '<div class="sutra-body is-essay ' +
        (state.lang === "en" ? "sutra-en" : "sutra-ko") +
        '">' +
        renderSimpleMarkdown(cmsBodySource(post)) +
        "</div>";
      var tags = Array.isArray(post.tags) ? post.tags : [];
      var tagHtml = "";
      for (var tIndex = 0; tIndex < tags.length; tIndex += 1) {
        if (!String(tags[tIndex] || "").trim()) continue;
        tagHtml += "<li>" + escapeHtml(tags[tIndex]) + "</li>";
      }
      if (tagHtml) html += '<ul class="cms-tags">' + tagHtml + "</ul>";
      html += "</div></section>";
      columns.innerHTML = html;
    }
    updateCmsDocumentTitle(categoryId, post);
    syncCategoryTabs();
    if (state.shareOpen) fillShareUrl();
  }

  function renderCategoryNav(sutraId) {
    var root = $("toc-" + sutraId + "-nav");
    if (!root) return;
    if (sutraId === "blessings" || sutraId === "dreams") {
      var posts = getCmsPosts(sutraId);
      if (posts.length) {
        var cmsHtml = '<ul class="cat-sections">';
        for (var p = 0; p < posts.length; p += 1) {
          var post = posts[p] || {};
          var label =
            state.lang === "en" ? post.titleEn || post.title || "" : post.title || "";
          cmsHtml +=
            '<li><span class="cat-section" data-cms-category="' +
            escapeHtml(sutraId) +
            '" data-cms-slug="' +
            escapeHtml(post.slug || "") +
            '">' +
            escapeHtml(label) +
            "</span></li>";
        }
        cmsHtml += "</ul>";
        root.innerHTML = cmsHtml;
        return;
      }
    }
    var sutra = findSutra(sutraId);
    if (!sutra || !sutraHasChapters(sutra)) {
      root.innerHTML =
        '<ul class="cat-sections"><li><span class="cat-section is-empty" role="menuitem" aria-disabled="true">' +
        escapeHtml(t().comingSoon) +
        "</span></li></ul>";
      return;
    }

    var active = findActiveToc(state.index + 1);
    var html = '<ul class="cat-sections">';
    for (var c = 0; c < sutra.chapters.length; c += 1) {
      var ch = sutra.chapters[c];
      var chStart = pageNumOf(ch);
      var chActive = active.chapterId === ch.id;
      var title = chapterTitleHtml(ch, sutra);
      if (chStart) {
        html +=
          '<li><a class="cat-section' +
          (chActive ? " is-active" : "") +
          '" href="' +
          escapeHtml(pathForIndex(chStart - 1)) +
          '" data-toc-chapter="' +
          escapeHtml(ch.id) +
          '" role="menuitem">' +
          title +
          "</a></li>";
      } else {
        html +=
          '<li><span class="cat-section is-empty" role="menuitem" aria-disabled="true">' +
          title +
          "</span></li>";
      }
    }
    html += "</ul>";
    root.innerHTML = html;
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

  function chapterSlugSet(chapter) {
    var set = {};
    var primary = chapterPrimarySlug(chapter);
    if (primary) set[primary] = true;
    if (chapter && chapter.id) set[String(chapter.id).toLowerCase()] = true;
    var aliases = (chapter && chapter.aliases) || [];
    for (var i = 0; i < aliases.length; i += 1) {
      var key = normalizeChapterSlug(aliases[i]);
      if (key) set[key] = true;
    }
    return set;
  }

  function findChapterBySlug(sutra, slug) {
    if (!sutra || !sutraHasChapters(sutra)) return null;
    var key = normalizeChapterSlug(slug);
    var raw = String(slug || "").toLowerCase();
    if (!key && !raw) return null;
    for (var i = 0; i < sutra.chapters.length; i += 1) {
      var ch = sutra.chapters[i];
      var slugs = chapterSlugSet(ch);
      if (slugs[key] || slugs[raw]) return ch;
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

  function scopeItemOfIndex(index) {
    var loc = locationOfIndex(index);
    if (!loc) return null;
    if (loc.chapter) return loc.chapter;
    return loc.sutra || null;
  }

  function scopeOfIndex(index) {
    var item = scopeItemOfIndex(index);
    var startPage = pageNumOf(item);
    var endPage = itemEndPage(item);
    if (!startPage) {
      return { startIndex: index, endIndex: index, item: item };
    }
    return {
      startIndex: startPage - 1,
      endIndex: endPage - 1,
      item: item,
    };
  }

  function scopeCount(index) {
    var scope = scopeOfIndex(index);
    return scope.endIndex - scope.startIndex + 1;
  }

  function scopeOrdinal(index) {
    var scope = scopeOfIndex(index);
    return index - scope.startIndex + 1;
  }

  function indexFromScopeOrdinal(fromIndex, ordinal) {
    var scope = scopeOfIndex(fromIndex);
    var next = scope.startIndex + ordinal - 1;
    if (next < scope.startIndex || next > scope.endIndex) return -1;
    return next;
  }

  function indexFromLocalPage(item, localPage) {
    var start = pageNumOf(item);
    var total = itemPageCount(item);
    if (!start || !localPage || localPage < 1 || localPage > total) return -1;
    return start - 1 + localPage - 1;
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
      if (chapter) chapterLine = chapterLineText(chapter, sutra);
    } else {
      if (sutra) sutraLine = sutra.ko || "";
      if (chapter) chapterLine = chapterLineText(chapter, sutra);
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
      if (state.lang === "en" || !parts.chapter || isCategorySutra(parts.sutra)) {
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
    if (loc.sutra && isCategorySutra(loc.sutra)) {
      if (loc.chapter) segs.push(chapterPrimarySlug(loc.chapter));
      return segs;
    }
    if (loc.chapter) segs.push(chapterPrimarySlug(loc.chapter));
    var ordinal = scopeOrdinal(index);
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
    var parts = pageHeadingLines(state.index);
    var title = "";
    if (state.lang === "en") {
      title = (parts.chapter && (parts.chapter.en || parts.chapter.ko)) || parts.sutraLine || "";
    } else {
      title = (parts.chapter && parts.chapter.ko) || parts.sutraLine || "";
    }
    var template = t().shareText;
    if (!title) {
      template = state.lang === "en"
        ? "Continue the Threefold Lotus Sutra from page {n}"
        : "법화삼부경 {n}쪽부터 이어서 보기";
    }
    return template.replace("{title}", title).replace("{n}", String(scopeOrdinal(state.index)));
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
      if (chapterSlug) {
        var categoryChapter = findChapterBySlug(sutra, chapterSlug);
        if (categoryChapter && pageNumOf(categoryChapter)) return pageNumOf(categoryChapter) - 1;
      }
      return firstStartPage(sutra) ? firstStartPage(sutra) - 1 : 0;
    }

    if (chapterSlug && sutra) {
      var chapter = findChapterBySlug(sutra, chapterSlug);
      if (chapter) {
        var chapterLocal = indexFromLocalPage(chapter, pageNum);
        if (chapterLocal >= 0) return chapterLocal;
        if (pageNum > itemPageCount(chapter)) {
          var oldGlobal = indexFromScriptureOrdinal(pageNum);
          if (oldGlobal >= 0) return oldGlobal;
        }
        if (pageNumOf(chapter)) return pageNumOf(chapter) - 1;
      }
    }

    if (sutra && pageNum > 0) {
      var sutraLocal = indexFromLocalPage(sutra, pageNum);
      if (sutraLocal >= 0) return sutraLocal;
    }

    if (pageNum > 0) {
      var fromOrdinal = indexFromScriptureOrdinal(pageNum);
      if (fromOrdinal >= 0) return fromOrdinal;
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
      titleParts.push(state.lang === "en" ? "Page " + scopeOrdinal(state.index) : scopeOrdinal(state.index) + "쪽");
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
    if (state.infoPage) return;
    if (state.cmsView && state.cmsView.slug) return;
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
    var infoPage = parseInfoRoute();
    if (infoPage) {
      renderInfoPage(infoPage);
      return;
    }
    var cmsRoute = parseCmsRoute(location.pathname);
    if (cmsRoute) {
      renderCmsPost(cmsRoute.category, cmsRoute.slug);
      return;
    }
    var idx = indexFromLocation();
    if (idx < 0) idx = 0;
    if (idx === state.index) {
      if ((state.cmsView && state.cmsView.slug) || state.infoPage) renderPage(false);
      else updateDocumentMeta();
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
    for (var i = 0; i < CATEGORY_LEVELS.length; i += 1) {
      setTreeLevel(CATEGORY_LEVELS[i], false);
    }
  }

  function syncCategoryTabs() {
    var loc = locationOfIndex(state.index);
    var cmsCategory = state.cmsView && state.cmsView.slug ? state.cmsView.category : null;
    var activeId = state.infoPage
      ? null
      : cmsCategory || (loc && loc.sutra && isCategorySutra(loc.sutra) ? loc.sutra.id : null);
    for (var i = 0; i < CATEGORY_LEVELS.length; i += 1) {
      var id = CATEGORY_LEVELS[i];
      var wrap = $("toc-" + id + "-wrap");
      if (wrap) wrap.classList.toggle("is-current", activeId === id);
    }
    var scriptureWrap = $("toc-scripture-wrap");
    if (scriptureWrap) scriptureWrap.classList.toggle("is-current", !state.infoPage && !activeId);
  }

  function onCategoryClick(event, level) {
    event.preventDefault();
    toggleTreeLevel(level);
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
    for (var i = 0; i < CATEGORY_LEVELS.length; i += 1) {
      var id = CATEGORY_LEVELS[i];
      var wrap = $("toc-" + id + "-wrap");
      var btn = $("toc-" + id);
      if (wrap) wrap.classList.toggle("is-open", !!state.treeOpen[id]);
      if (btn) btn.setAttribute("aria-expanded", state.treeOpen[id] ? "true" : "false");
    }
  }

  function isCategoryLevel(level) {
    return CATEGORY_LEVELS.indexOf(level) >= 0;
  }

  function anyCategoryMenuOpen() {
    for (var i = 0; i < CATEGORY_LEVELS.length; i += 1) {
      if (state.treeOpen[CATEGORY_LEVELS[i]]) return true;
    }
    return false;
  }

  function setTreeLevel(level, open) {
    if (level !== "scripture" && level !== "work" && !isCategoryLevel(level)) return;
    state.treeOpen[level] = !!open;
    if (level === "scripture" && !open) state.treeOpen.work = false;
    if (level === "scripture" && open) {
      for (var i = 0; i < CATEGORY_LEVELS.length; i += 1) {
        state.treeOpen[CATEGORY_LEVELS[i]] = false;
      }
    }
    if (isCategoryLevel(level) && open) {
      state.treeOpen.scripture = false;
      state.treeOpen.work = false;
      for (var j = 0; j < CATEGORY_LEVELS.length; j += 1) {
        if (CATEGORY_LEVELS[j] !== level) state.treeOpen[CATEGORY_LEVELS[j]] = false;
      }
    }
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
    if (input) input.value = currentShareUrl();
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
    if (state.cmsView && state.cmsView.slug) return location.href;
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
      if (event.key === "Escape" && (state.treeOpen.scripture || state.treeOpen.work || anyCategoryMenuOpen())) {
        closeCategoryMenu();
        return;
      }
      if (isPageJumpOpen()) return;
      if (state.shareOpen) return;
      if (isGreetingView()) return;
      if (state.cmsView && state.cmsView.slug) return;
      if (state.infoPage) return;
      if (event.key === "ArrowLeft") goPrev();
      if (event.key === "ArrowRight") goNext();
    });
    window.addEventListener("popstate", applyLocationFromUrl);
    window.addEventListener("hashchange", function () {
      if (location.protocol === "file:" || location.hash.indexOf("#/") === 0) {
        applyLocationFromUrl();
      }
    });

    for (var ci = 0; ci < CATEGORY_LEVELS.length; ci += 1) {
      (function (level) {
        var link = $("toc-" + level);
        if (link) {
          link.addEventListener("click", function (event) {
            event.stopPropagation();
            onCategoryClick(event, level);
          });
        }
        var nav = $("toc-" + level + "-nav");
        if (nav) {
          nav.addEventListener("click", function (event) {
            var cmsItem = event.target.closest("[data-cms-category][data-cms-slug]");
            if (cmsItem) {
              if (shouldLetBrowserNavigate(event)) return;
              event.preventDefault();
              var cmsCategory = cmsItem.getAttribute("data-cms-category");
              var cmsSlug = cmsItem.getAttribute("data-cms-slug");
              renderCmsPost(cmsCategory, cmsSlug);
              if (history && history.pushState) {
                var cmsNext = cmsPostUrl(cmsCategory, cmsSlug);
                var cmsCurrent =
                  location.protocol === "file:" || location.hash.indexOf("#/") === 0
                    ? location.hash || ""
                    : location.pathname + location.search;
                if (cmsCurrent !== cmsNext) {
                  history.pushState(
                    { cms: true, category: cmsCategory, slug: cmsSlug },
                    "",
                    cmsNext
                  );
                }
              }
              closeCategoryMenu();
              return;
            }
            var chBtn = event.target.closest("[data-toc-chapter]");
            if (!chBtn) return;
            if (shouldLetBrowserNavigate(event)) return;
            event.preventDefault();
            onTocChapterClick(chBtn.getAttribute("data-toc-chapter"));
          });
        }
      })(CATEGORY_LEVELS[ci]);
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
      if (state.treeOpen.scripture || state.treeOpen.work || anyCategoryMenuOpen()) closeCategoryMenu();
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

    document.addEventListener("click", function (event) {
      var link = event.target && event.target.closest ? event.target.closest("a[data-info-page]") : null;
      if (!link) return;
      if (shouldLetBrowserNavigate(event)) return;
      var page = link.getAttribute("data-info-page");
      if (page !== "about" && page !== "privacy" && page !== "contact") return;
      event.preventDefault();
      openInfoPage(page);
    });
    document.addEventListener("submit", function (event) {
      var form = event.target;
      if (!form || form.id !== "contact-form") return;
      event.preventDefault();
      submitContactForm(form);
    });
  }

  function init(sutras) {
    state.sutras = sutras && sutras.length ? sutras : [emptyPage()];
    state.toc = loadToc();
    hydrateTocFromPages();
    var firstScripture = scriptureSutras()[0];
    if (firstScripture) state.tocOpen[firstScripture.id] = true;
    state.lang = readSavedLang();
    var infoPage = parseInfoRoute();
    if (infoPage) repairInfoDocumentBase();
    var cmsRoute = infoPage ? null : parseCmsRoute(location.pathname);
    if (cmsRoute) repairCmsDocumentBase();
    var fromUrl = cmsRoute || infoPage ? -1 : indexFromLocation();
    var saved = readSavedIndex(state.sutras);
    var usedResume = false;
    if (fromUrl >= 0) {
      state.index = fromUrl;
    } else {
      state.index = saved.index;
      usedResume = cmsRoute || infoPage ? false : saved.resumed;
    }
    ensureActiveTocOpen();
    storageSet(PAGE_KEY, String(currentPage().id));
    storageSet(LANG_KEY, state.lang);
    document.documentElement.lang = state.lang === "ko" ? "ko" : "en";

    var banner = $("preview-banner");
    if (banner && isPreviewMode()) banner.classList.remove("hidden");

    bindEvents();
    renderChrome();
    if (infoPage) {
      renderToc();
      renderInfoPage(infoPage);
      normalizeInfoUrl(infoPage);
    } else if (cmsRoute) {
      renderToc();
      renderCmsPost(cmsRoute.category, cmsRoute.slug);
    } else {
      renderPage(false);
      syncUrl(true);
    }
    applyMoment(pickMoment());
    if (!isGreetingView()) restartHealingTimer();

    if (usedResume && !isPreviewMode() && !isGreetingView()) showResumeToast();
  }

  loadSutrasFromJson().then(init);
})();
