(function () {
  "use strict";

  var DRAFT_KEY = "the-meow-sutra:editor-draft";
  var PREVIEW_KEY = "the-meow-sutra:draft";
  var MARK = {
    hanja: "----- 원문 -----",
    recitation: "----- 한글번역 -----",
    explanation: "----- 해설 -----",
    english: "----- 영문 -----",
    explanationEn: "----- 영문해설 -----",
  };

  var state = {
    pages: [],
    toc: [],
    index: 0,
    tab: "all",
    view: "pages",
    dirty: false,
    draftTimer: null,
    statusTimer: null,
    dirHandle: null,
  };

  var FIELDS = ["chapter", "chapterEn", "hanja", "recitation", "explanation", "english", "explanationEn"];

  function $(id) {
    return document.getElementById(id);
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function emptyPage() {
    return {
      id: 0,
      chapter: "",
      chapterEn: "",
      hanja: "",
      recitation: "",
      explanation: "",
      english: "",
      explanationEn: "",
      sutraId: "",
      chapterId: "",
    };
  }

  function normalize(item, id) {
    var page = emptyPage();
    if (!item || typeof item !== "object") {
      page.id = id;
      return page;
    }
    page.id = id;
    page.chapter = String(item.chapter || "");
    page.chapterEn = String(item.chapterEn || "");
    page.hanja = String(item.hanja || "");
    page.recitation = String(item.recitation || "");
    page.explanation = String(item.explanation || "");
    page.english = String(item.english || "");
    page.explanationEn = String(item.explanationEn || "");
    page.sutraId = String(item.sutraId || "");
    page.chapterId = String(item.chapterId || "");
    return page;
  }

  function normalizeAll(list) {
    var source = Array.isArray(list) ? list : [];
    return source.map(function (item, i) {
      return normalize(item, i + 1);
    });
  }

  function currentPage() {
    if (!state.pages[state.index]) state.pages[state.index] = emptyPage();
    return state.pages[state.index];
  }

  function grabSection(body, marker, nextMarkers) {
    var start = body.indexOf(marker);
    if (start < 0) return "";
    start += marker.length;
    var end = body.length;
    for (var i = 0; i < nextMarkers.length; i += 1) {
      var at = body.indexOf(nextMarkers[i], start);
      if (at >= 0 && at < end) end = at;
    }
    return body.slice(start, end).replace(/^\n+/, "").replace(/\s+$/, "");
  }

  function parsePageText(raw) {
    var text = String(raw || "")
      .replace(/^\uFEFF/, "")
      .replace(/\r\n/g, "\n");
    var page = emptyPage();
    var markAt = text.search(/----- /);
    var header = markAt >= 0 ? text.slice(0, markAt) : text;
    var body = markAt >= 0 ? text.slice(markAt) : "";
    header.split("\n").forEach(function (line) {
      if (line.indexOf("품영:") === 0) page.chapterEn = line.slice(3).trim();
      else if (line.indexOf("품:") === 0) page.chapter = line.slice(2).trim();
    });
    page.hanja = grabSection(body, MARK.hanja, [MARK.recitation, MARK.explanation, MARK.english, MARK.explanationEn]);
    page.recitation = grabSection(body, MARK.recitation, [MARK.explanation, MARK.english, MARK.explanationEn]);
    page.explanation = grabSection(body, MARK.explanation, [MARK.english, MARK.explanationEn]);
    page.english = grabSection(body, MARK.english, [MARK.explanationEn]);
    page.explanationEn = grabSection(body, MARK.explanationEn, []);
    return page;
  }

  function parseBundledText(raw) {
    var text = String(raw || "")
      .replace(/^\uFEFF/, "")
      .replace(/\r\n/g, "\n");
    if (!/========\s*페이지/.test(text)) return [parsePageText(text)];
    return text
      .split(/========\s*페이지\s*\d+\s*========/)
      .map(function (chunk) {
        return chunk.trim();
      })
      .filter(Boolean)
      .map(parsePageText);
  }

  function parseJsonOrData(raw) {
    var text = String(raw || "")
      .replace(/^\uFEFF/, "")
      .replace(/\r\n/g, "\n")
      .trim();
    var jsonText = text;
    var dataMatch = text.match(/window\.SUTRAS_DATA\s*=\s*([\s\S]*?);?\s*$/);
    if (dataMatch) jsonText = dataMatch[1];
    var data = JSON.parse(jsonText);
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.pages)) return data.pages;
    if (data && typeof data === "object") return [data];
    throw new Error("empty");
  }

  function serializePage(page) {
    return [
      "품: " + (page.chapter || ""),
      "품영: " + (page.chapterEn || ""),
      "",
      MARK.hanja,
      page.hanja || "",
      "",
      MARK.recitation,
      page.recitation || "",
      "",
      MARK.explanation,
      page.explanation || "",
      "",
      MARK.english,
      page.english || "",
      "",
      MARK.explanationEn,
      page.explanationEn || "",
      "",
    ].join("\n");
  }

  function serializeBundled(pages) {
    return pages
      .map(function (page, i) {
        return "======== 페이지 " + (i + 1) + " ========\n" + serializePage(page);
      })
      .join("\n");
  }

  function toSitePages() {
    return normalizeAll(state.pages);
  }

  function toDataJs(pages) {
    return "window.SUTRAS_DATA=" + JSON.stringify(pages) + ";\n";
  }

  function toTocJs(toc) {
    return "window.SUTRAS_TOC = " + JSON.stringify(toc, null, 2) + ";\n";
  }

  function parsePageNum(value) {
    var n = parseInt(String(value || "").trim(), 10);
    return n > 0 ? n : null;
  }

  function cloneToc(list) {
    var source = Array.isArray(list) ? list : [];
    return clone(source);
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
      /* private mode */
    }
  }

  function storageRemove(key) {
    try {
      localStorage.removeItem(key);
    } catch (err) {
      /* private mode */
    }
  }

  function setDirty(on) {
    state.dirty = !!on;
    var flag = $("dirty-flag");
    if (flag) flag.classList.toggle("hidden", !state.dirty);
  }

  function showStatus(message, isError) {
    var el = $("status");
    if (!el) return;
    el.textContent = message;
    el.classList.remove("hidden");
    el.style.color = isError ? "#8e1d1d" : "#6b5a45";
    if (state.statusTimer) window.clearTimeout(state.statusTimer);
    state.statusTimer = window.setTimeout(function () {
      el.classList.add("hidden");
    }, 5200);
  }

  function pullForm() {
    var page = currentPage();
    page.chapter = $("field-chapter").value;
    page.chapterEn = $("field-chapterEn").value;
    page.hanja = $("field-hanja").value;
    page.recitation = $("field-recitation").value;
    page.explanation = $("field-explanation").value;
    page.english = $("field-english").value;
    page.explanationEn = $("field-explanationEn").value;
  }

  function pushForm() {
    var page = currentPage();
    $("field-chapter").value = page.chapter;
    $("field-chapterEn").value = page.chapterEn;
    $("field-hanja").value = page.hanja;
    $("field-recitation").value = page.recitation;
    $("field-explanation").value = page.explanation;
    $("field-english").value = page.english;
    $("field-explanationEn").value = page.explanationEn;
    updateCounts();
  }

  function updateCounts() {
    ["hanja", "recitation", "explanation", "english", "explanationEn"].forEach(function (key) {
      var el = $("count-" + key);
      if (el) el.textContent = String(($("field-" + key).value || "").length);
    });
  }

  function applyTab() {
    var tab = state.tab;
    ["hanja", "recitation", "explanation", "english", "explanationEn"].forEach(function (key) {
      var box = $("box-" + key);
      var show = tab === "all" || tab === key;
      box.classList.toggle("hidden", !show);
      var area = $("field-" + key);
      area.rows = tab === key ? 22 : key === "hanja" || key === "recitation" ? 8 : 6;
    });
    Array.prototype.forEach.call(document.querySelectorAll("#tabs [data-tab]"), function (btn) {
      var on = btn.getAttribute("data-tab") === tab;
      btn.className =
        "rounded-full px-3 py-1 font-serif text-xs " +
        (on ? "tab-on" : "text-ink-muted hover:text-ink");
    });
  }

  function renderList() {
    var list = $("page-list");
    var html = "";
    for (var i = 0; i < state.pages.length; i += 1) {
      var page = state.pages[i];
      var title = page.chapter || "(제목 없음)";
      var snippet = (page.recitation || page.hanja || "").replace(/\s+/g, " ").slice(0, 42);
      html +=
        '<button type="button" data-index="' +
        i +
        '" class="list-item mb-1 w-full rounded-sm border border-transparent px-2 py-2 text-left ' +
        (i === state.index ? "active" : "hover:bg-white/70") +
        '">' +
        '<span class="font-display text-[11px] tracking-[0.14em] text-seal">' +
        String(i + 1).padStart(2, "0") +
        "</span>" +
        '<span class="mt-0.5 block truncate font-serif text-sm text-ink">' +
        escapeHtml(title) +
        "</span>" +
        (snippet
          ? '<span class="mt-0.5 block truncate font-serif text-[11px] text-ink-faint">' +
            escapeHtml(snippet) +
            "</span>"
          : "") +
        "</button>";
    }
    list.innerHTML = html;
    $("page-count").textContent = String(state.pages.length);
  }

  function rangeInput(si, ci, field, value) {
    return (
      '<input class="toc-range" type="number" min="1" inputmode="numeric" data-si="' +
      si +
      '" data-ci="' +
      ci +
      '" data-field="' +
      field +
      '" value="' +
      (value || "") +
      '">'
    );
  }

  function rangeRow(si, ci, item) {
    return (
      '<div class="mt-1 flex items-center gap-1 font-serif text-[11px] text-ink-faint">' +
      "<span>부터</span>" +
      rangeInput(si, ci, "startPage", item.startPage) +
      "<span>까지</span>" +
      rangeInput(si, ci, "endPage", item.endPage) +
      "<span>쪽</span>" +
      "</div>"
    );
  }

  function renderTocEditor() {
    var el = $("toc-editor");
    if (!el) return;
    var html = "";
    for (var si = 0; si < state.toc.length; si += 1) {
      var sutra = state.toc[si];
      var chapters = sutra.chapters || [];
      html +=
        '<section class="mb-2 rounded-sm border border-[#e5dac4] bg-white/70 p-2">' +
        '<p class="font-display text-[10px] tracking-[0.18em] text-gold">' +
        escapeHtml(sutra.role || "") +
        "</p>" +
        '<p class="mt-0.5 font-serif text-sm leading-snug text-ink">' +
        escapeHtml(sutra.ko) +
        (sutra.hanja ? ' <span class="text-ink-faint">(' + escapeHtml(sutra.hanja) + ")</span>" : "") +
        "</p>";
      if (!chapters.length) {
        html += rangeRow(si, -1, sutra);
      } else {
        for (var ci = 0; ci < chapters.length; ci += 1) {
          var ch = chapters[ci];
          html +=
            '<div class="mt-2 border-t border-[#efe6d4] pt-2">' +
            '<p class="font-serif text-xs text-ink">제' +
            ch.no +
            "품 " +
            escapeHtml(ch.ko) +
            (ch.hanja ? ' <span class="text-ink-faint">(' + escapeHtml(ch.hanja) + ")</span>" : "") +
            (ch.note ? ' <span class="text-gold">(' + escapeHtml(ch.note) + ")</span>" : "") +
            "</p>" +
            rangeRow(si, ci, ch) +
            "</div>";
        }
      }
      html += "</section>";
    }
    el.innerHTML = html;
  }

  function applyView() {
    var pagesOn = state.view === "pages";
    var pagePanel = $("page-panel");
    var tocPanel = $("toc-panel");
    var pagesBtn = $("view-pages");
    var tocBtn = $("view-toc");
    if (pagePanel) {
      pagePanel.classList.toggle("hidden", !pagesOn);
      pagePanel.classList.toggle("flex", pagesOn);
    }
    if (tocPanel) {
      tocPanel.classList.toggle("hidden", pagesOn);
      tocPanel.classList.toggle("flex", !pagesOn);
    }
    if (pagesBtn) {
      pagesBtn.className =
        "flex-1 rounded-sm px-2 py-1.5 font-serif text-xs " +
        (pagesOn ? "tab-on" : "text-ink-muted hover:text-ink");
    }
    if (tocBtn) {
      tocBtn.className =
        "flex-1 rounded-sm px-2 py-1.5 font-serif text-xs " +
        (!pagesOn ? "tab-on" : "text-ink-muted hover:text-ink");
    }
  }

  function tocTarget(si, ci) {
    var sutra = state.toc[si];
    if (!sutra) return null;
    if (ci < 0) return sutra;
    return sutra.chapters && sutra.chapters[ci] ? sutra.chapters[ci] : null;
  }

  function onTocRangeInput(input) {
    var target = tocTarget(Number(input.getAttribute("data-si")), Number(input.getAttribute("data-ci")));
    if (!target) return;
    target[input.getAttribute("data-field")] = parsePageNum(input.value);
    scheduleDraft();
  }

  function escapeHtml(str) {
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function renderAll() {
    renderList();
    renderTocEditor();
    applyView();
    pushForm();
    applyTab();
  }

  function persistDraft() {
    pullForm();
    storageSet(DRAFT_KEY, JSON.stringify({ pages: toSitePages(), toc: state.toc }));
  }

  function scheduleDraft() {
    setDirty(true);
    if (state.draftTimer) window.clearTimeout(state.draftTimer);
    state.draftTimer = window.setTimeout(persistDraft, 350);
  }

  function selectPage(nextIndex) {
    if (nextIndex < 0 || nextIndex >= state.pages.length) return;
    pullForm();
    state.index = nextIndex;
    renderAll();
  }

  function addPage(copyFrom) {
    pullForm();
    var page = copyFrom ? normalize(copyFrom, 0) : emptyPage();
    if (!copyFrom) page.chapter = "";
    state.pages.push(page);
    state.index = state.pages.length - 1;
    setDirty(true);
    persistDraft();
    renderAll();
    $("field-chapter").focus();
  }

  function duplicatePage() {
    pullForm();
    var page = normalize(currentPage(), 0);
    state.pages.splice(state.index + 1, 0, page);
    state.index += 1;
    setDirty(true);
    persistDraft();
    renderAll();
  }

  function deletePage() {
    pullForm();
    if (state.pages.length <= 1) {
      state.pages = [emptyPage()];
      state.index = 0;
    } else {
      state.pages.splice(state.index, 1);
      if (state.index >= state.pages.length) state.index = state.pages.length - 1;
    }
    setDirty(true);
    persistDraft();
    renderAll();
  }

  function movePage(dir) {
    pullForm();
    var next = state.index + dir;
    if (next < 0 || next >= state.pages.length) return;
    var swap = state.pages[state.index];
    state.pages[state.index] = state.pages[next];
    state.pages[next] = swap;
    state.index = next;
    setDirty(true);
    persistDraft();
    renderAll();
  }

  function download(filename, text, mime) {
    var blob = new Blob([text], { type: mime || "text/plain;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(function () {
      URL.revokeObjectURL(url);
    }, 1000);
  }

  async function writeFile(dir, name, contents) {
    var handle = await dir.getFileHandle(name, { create: true });
    var writable = await handle.createWritable();
    await writable.write(contents);
    await writable.close();
  }

  async function writePagesFolder(root, pages) {
    var pagesDir = await root.getDirectoryHandle("pages", { create: true });
    try {
      var stale = [];
      for await (var entry of pagesDir.entries()) {
        var name = entry[0];
        if (/^\d+\.txt$/.test(name)) stale.push(name);
      }
      for (var s = 0; s < stale.length; s += 1) {
        await pagesDir.removeEntry(stale[s]);
      }
    } catch (err) {
      /* 정리에 실패해도 새 파일 저장은 진행 */
    }
    for (var i = 0; i < pages.length; i += 1) {
      var fileName = String(i + 1).padStart(3, "0") + ".txt";
      await writeFile(pagesDir, fileName, serializePage(pages[i]));
    }
    await writeFile(pagesDir, "_양식.txt", serializePage(emptyPage()));
  }

  async function saveToFolder() {
    pullForm();
    var pages = toSitePages();
    if (!window.showDirectoryPicker) {
      download("sutras.data.js", toDataJs(pages), "text/javascript;charset=utf-8");
      download("sutras.json", JSON.stringify(pages, null, 2), "application/json;charset=utf-8");
      download("toc.data.js", toTocJs(state.toc), "text/javascript;charset=utf-8");
      showStatus("이 브라우저에서는 폴더 저장이 안 됩니다. 받은 sutras.data.js, sutras.json, toc.data.js 를 사이트 폴더에 덮어 주세요.");
      setDirty(false);
      return;
    }

    try {
      if (!state.dirHandle) {
        state.dirHandle = await window.showDirectoryPicker({
          id: "cat-sutra-root",
          mode: "readwrite",
        });
      }
      var root = state.dirHandle;
      try {
        await root.getFileHandle("index.html");
      } catch (missing) {
        var ok = window.confirm(
          "이 폴더에 index.html 이 없습니다.\nCat-Sutra 사이트 폴더가 맞으면 확인을 눌러 주세요."
        );
        if (!ok) {
          state.dirHandle = null;
          return;
        }
      }
      await writeFile(root, "sutras.data.js", toDataJs(pages));
      await writeFile(root, "sutras.json", JSON.stringify(pages, null, 2));
      await writeFile(root, "toc.data.js", toTocJs(state.toc));
      await writePagesFolder(root, pages);
      storageRemove(DRAFT_KEY);
      setDirty(false);
      showStatus("사이트에 반영했습니다. index.html 을 새로고침하면 방문자가 보는 내용이 바뀝니다.");
    } catch (err) {
      if (err && err.name === "AbortError") return;
      state.dirHandle = null;
      showStatus("폴더 저장에 실패했습니다. Chrome 또는 Edge에서 Cat-Sutra 폴더를 선택해 주세요.", true);
    }
  }

  function openPreview() {
    pullForm();
    storageSet(PREVIEW_KEY, JSON.stringify({ pages: toSitePages(), toc: state.toc }));
    persistDraft();
    window.open("index.html?preview=1", "cat-sutra-preview");
  }

  function readFileAsText(file) {
    return new Promise(function (resolve, reject) {
      var reader = new FileReader();
      reader.onload = function () {
        resolve(String(reader.result || ""));
      };
      reader.onerror = reject;
      reader.readAsText(file, "utf-8");
    });
  }

  async function importFiles(fileList) {
    var files = Array.prototype.slice.call(fileList || []).filter(function (file) {
      return file && file.name && file.name.charAt(0) !== "_";
    });
    if (!files.length) return;
    files.sort(function (a, b) {
      return a.name.localeCompare(b.name, "en", { numeric: true });
    });

    var collected = [];
    for (var i = 0; i < files.length; i += 1) {
      var file = files[i];
      var text = await readFileAsText(file);
      var name = file.name.toLowerCase();
      try {
        if (name.slice(-5) === ".json" || name.slice(-3) === ".js") {
          collected = collected.concat(parseJsonOrData(text));
        } else {
          collected = collected.concat(parseBundledText(text));
        }
      } catch (err) {
        showStatus(file.name + " 을 읽지 못했습니다. 텍스트 양식을 확인해 주세요.", true);
        return;
      }
    }

    var cleaned = collected.filter(function (page) {
      return page.chapter || page.hanja || page.recitation || page.explanation || page.english || page.explanationEn;
    });
    if (!cleaned.length) {
      showStatus("가져온 파일에 내용이 없습니다.", true);
      return;
    }
    if (state.pages.some(hasContent) && !window.confirm("지금 목록을 가져온 내용으로 바꿀까요?")) {
      return;
    }
    state.pages = normalizeAll(cleaned);
    state.index = 0;
    setDirty(true);
    persistDraft();
    renderAll();
    showStatus(state.pages.length + "쪽을 불러왔습니다.");
  }

  function hasContent(page) {
    return !!(page.chapter || page.hanja || page.recitation || page.explanation || page.english || page.explanationEn);
  }

  function bindEvents() {
    $("page-list").addEventListener("click", function (event) {
      var btn = event.target.closest("[data-index]");
      if (!btn) return;
      selectPage(Number(btn.getAttribute("data-index")));
    });

    $("view-pages").addEventListener("click", function () {
      state.view = "pages";
      applyView();
    });
    $("view-toc").addEventListener("click", function () {
      state.view = "toc";
      applyView();
    });
    $("toc-editor").addEventListener("input", function (event) {
      var input = event.target.closest("[data-field]");
      if (input) onTocRangeInput(input);
    });

    FIELDS.forEach(function (key) {
      $("field-" + key).addEventListener("input", function () {
        pullForm();
        updateCounts();
        renderList();
        scheduleDraft();
      });
    });

    $("btn-new").addEventListener("click", function () {
      addPage(null);
    });
    $("btn-dup").addEventListener("click", duplicatePage);
    $("btn-del").addEventListener("click", function () {
      if (window.confirm("이 페이지를 삭제할까요?")) deletePage();
    });
    $("btn-up").addEventListener("click", function () {
      movePage(-1);
    });
    $("btn-down").addEventListener("click", function () {
      movePage(1);
    });
    $("btn-save").addEventListener("click", function () {
      saveToFolder();
    });
    $("btn-preview").addEventListener("click", openPreview);
    $("btn-download-data").addEventListener("click", function () {
      pullForm();
      var pages = toSitePages();
      download("sutras.data.js", toDataJs(pages), "text/javascript;charset=utf-8");
      download("sutras.json", JSON.stringify(pages, null, 2), "application/json;charset=utf-8");
      download("toc.data.js", toTocJs(state.toc), "text/javascript;charset=utf-8");
      showStatus("받은 파일을 사이트 폴더에 덮어 주세요.");
    });
    $("btn-download-txt").addEventListener("click", function () {
      pullForm();
      download("pages.txt", serializeBundled(toSitePages()), "text/plain;charset=utf-8");
    });
    $("btn-import").addEventListener("click", function () {
      $("file-import").click();
    });
    $("file-import").addEventListener("change", function (event) {
      importFiles(event.target.files).then(function () {
        event.target.value = "";
      });
    });

    Array.prototype.forEach.call(document.querySelectorAll("#tabs [data-tab]"), function (btn) {
      btn.addEventListener("click", function () {
        state.tab = btn.getAttribute("data-tab");
        applyTab();
      });
    });

    $("btn-restore").addEventListener("click", function () {
      var draft = storageGet(DRAFT_KEY);
      if (!draft) return;
      try {
        var parsed = parseDraftPayload(draft);
        if (parsed.pages && parsed.pages.length) state.pages = normalizeAll(parsed.pages);
        if (parsed.toc && parsed.toc.length) state.toc = cloneToc(parsed.toc);
        state.index = 0;
        setDirty(true);
        $("restore-banner").classList.add("hidden");
        renderAll();
      } catch (err) {
        showStatus("임시 저장을 읽지 못했습니다.", true);
      }
    });
    $("btn-discard-draft").addEventListener("click", function () {
      storageRemove(DRAFT_KEY);
      $("restore-banner").classList.add("hidden");
    });

    window.addEventListener("keydown", function (event) {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "s") {
        event.preventDefault();
        saveToFolder();
      }
    });
    window.addEventListener("beforeunload", function (event) {
      if (!state.dirty) return;
      event.preventDefault();
      event.returnValue = "";
    });
  }

  function sameContent(a, b) {
    return JSON.stringify(normalizeAll(a)) === JSON.stringify(normalizeAll(b));
  }

  function sameToc(a, b) {
    return JSON.stringify(a || []) === JSON.stringify(b || []);
  }

  function parseDraftPayload(raw) {
    var data = JSON.parse(raw);
    if (Array.isArray(data)) return { pages: data, toc: null };
    if (data && typeof data === "object") {
      return {
        pages: Array.isArray(data.pages) ? data.pages : null,
        toc: Array.isArray(data.toc) ? data.toc : null,
      };
    }
    return { pages: null, toc: null };
  }

  function init() {
    var site = Array.isArray(window.SUTRAS_DATA) ? normalizeAll(window.SUTRAS_DATA) : [];
    if (!site.length) site = [emptyPage()];
    state.pages = site;
    state.toc = cloneToc(window.SUTRAS_TOC);
    state.index = 0;

    var draftRaw = storageGet(DRAFT_KEY);
    if (draftRaw) {
      try {
        var parsed = parseDraftPayload(draftRaw);
        var pagesDiffer = parsed.pages && parsed.pages.length && !sameContent(parsed.pages, site);
        var tocDiffer = parsed.toc && parsed.toc.length && !sameToc(parsed.toc, state.toc);
        if (pagesDiffer || tocDiffer) {
          $("restore-banner").classList.remove("hidden");
        }
      } catch (err) {
        storageRemove(DRAFT_KEY);
      }
    }

    bindEvents();
    renderAll();
  }

  init();
})();
