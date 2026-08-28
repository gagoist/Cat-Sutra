/**
 * pages/*.txt 를 읽어 방문자가 받는 얇은 데이터 파일로 만듭니다.
 * 사용: node compile.js
 */
var fs = require("fs");
var path = require("path");

var MARK = {
  hanja: "----- 원문 -----",
  recitation: "----- 한글번역 -----",
  explanation: "----- 해설 -----",
  english: "----- 영문 -----",
  explanationEn: "----- 영문해설 -----",
};

function grabSection(body, marker, nextMarkers) {
  var start = body.indexOf(marker);
  if (start < 0) return "";
  start += marker.length;
  var end = body.length;
  nextMarkers.forEach(function (item) {
    var at = body.indexOf(item, start);
    if (at >= 0 && at < end) end = at;
  });
  return body.slice(start, end).replace(/^\n+/, "").replace(/\s+$/, "");
}

function parsePageText(raw) {
  var text = String(raw || "")
    .replace(/^\uFEFF/, "")
    .replace(/\r\n/g, "\n");
  var page = {
    chapter: "",
    chapterEn: "",
    hanja: "",
    recitation: "",
    explanation: "",
    english: "",
    explanationEn: "",
  };
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

var pagesDir = path.join(__dirname, "pages");
if (!fs.existsSync(pagesDir)) {
  console.error("pages 폴더가 없습니다.");
  process.exit(1);
}

var files = fs
  .readdirSync(pagesDir)
  .filter(function (name) {
    return /^\d+\.txt$/i.test(name);
  })
  .sort(function (a, b) {
    return a.localeCompare(b, "en", { numeric: true });
  });

if (!files.length) {
  console.error("pages 폴더에 001.txt 같은 페이지 파일이 없습니다.");
  process.exit(1);
}

function loadToc() {
  var tocPath = path.join(__dirname, "toc.data.js");
  if (!fs.existsSync(tocPath)) return [];
  var src = fs.readFileSync(tocPath, "utf8");
  var start = src.indexOf("[");
  var end = src.lastIndexOf("]");
  if (start < 0 || end < start) return [];
  try {
    return JSON.parse(src.slice(start, end + 1));
  } catch (err) {
    console.warn("toc.data.js 를 읽지 못해 품 매핑을 건너뜁니다.");
    return [];
  }
}

function haystackOf(page) {
  return String((page && page.chapter) || "") + "\n" + String((page && page.chapterEn) || "");
}

function containsToken(hay, token) {
  return !!(token && hay.indexOf(token) >= 0);
}

function matchPageToToc(page, toc, lastMatch) {
  var hay = haystackOf(page);
  var found = null;
  for (var i = 0; i < toc.length; i += 1) {
    var sutra = toc[i];
    var sutraHit =
      containsToken(hay, sutra.ko) ||
      containsToken(hay, sutra.hanja) ||
      containsToken(hay, sutra.en);
    var chapters = sutra.chapters || [];
    if (chapters.length) {
      for (var c = 0; c < chapters.length; c += 1) {
        var chapter = chapters[c];
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

var toc = loadToc();
var lastMatch = null;
var pages = files.map(function (name, i) {
  var parsed = parsePageText(fs.readFileSync(path.join(pagesDir, name), "utf8"));
  parsed.id = i + 1;
  var located = matchPageToToc(parsed, toc, lastMatch);
  if (located) lastMatch = located;
  if (located && located.sutra) {
    parsed.sutraId = located.sutra.id;
    parsed.chapterId = located.chapter ? located.chapter.id : "";
  }
  return parsed;
});

fs.writeFileSync(
  path.join(__dirname, "sutras.json"),
  JSON.stringify(pages, null, 2) + "\n",
  "utf8"
);
fs.writeFileSync(
  path.join(__dirname, "sutras.data.js"),
  "window.SUTRAS_DATA=" + JSON.stringify(pages) + ";\n",
  "utf8"
);

console.log(pages.length + "쪽을 sutras.data.js / sutras.json 에 반영했습니다.");
