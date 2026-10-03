/**
 * content/blessings, content/dreams 의 Decap CMS Markdown을
 * content.data.js / content.json 으로 만듭니다.
 * 사용: node build-content.js
 */
var fs = require("fs");
var path = require("path");

var ROOT = __dirname;
var CATEGORIES = ["blessings", "dreams"];

function splitDocument(raw) {
  var text = String(raw || "").replace(/^\uFEFF/, "");
  if (text.slice(0, 3) !== "---") {
    return { frontmatter: "", body: text };
  }
  var open = 3;
  if (text.charAt(open) === "\r") open += 1;
  if (text.charAt(open) !== "\n") {
    return { frontmatter: "", body: text };
  }
  open += 1;
  var lines = text.slice(open).split("\n");
  var frontmatter = [];
  var index = 0;
  for (; index < lines.length; index += 1) {
    var line = lines[index].replace(/\r$/, "");
    if (line === "---") {
      index += 1;
      break;
    }
    frontmatter.push(line);
  }
  return {
    frontmatter: frontmatter.join("\n"),
    body: lines.slice(index).join("\n"),
  };
}

function unquote(value) {
  var quote = value.charAt(0);
  var inner = value.slice(1, -1);
  if (quote === "'") return inner.replace(/''/g, "'");
  var out = "";
  for (var i = 0; i < inner.length; i += 1) {
    if (inner.charAt(i) === "\\" && i + 1 < inner.length) {
      var next = inner.charAt(i + 1);
      if (next === "n") out += "\n";
      else if (next === "r") out += "\r";
      else if (next === "t") out += "\t";
      else out += next;
      i += 1;
    } else {
      out += inner.charAt(i);
    }
  }
  return out;
}

function parseScalar(raw) {
  var value = String(raw == null ? "" : raw).trim();
  if (value === "" || value === "null" || value === "~" || value === "''" || value === '""') {
    return "";
  }
  if (value === "true") return true;
  if (value === "false") return false;
  if (
    value.length >= 2 &&
    ((value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') ||
      (value.charAt(0) === "'" && value.charAt(value.length - 1) === "'"))
  ) {
    return unquote(value);
  }
  return value;
}

function parseInlineArray(raw) {
  var inner = String(raw || "").trim();
  if (inner.charAt(0) === "[") inner = inner.slice(1);
  if (inner.charAt(inner.length - 1) === "]") inner = inner.slice(0, -1);
  inner = inner.trim();
  if (!inner) return [];
  var items = [];
  var current = "";
  var quote = "";
  for (var i = 0; i < inner.length; i += 1) {
    var ch = inner.charAt(i);
    if (quote) {
      if (ch === "\\" && quote === '"' && i + 1 < inner.length) {
        current += inner.charAt(i + 1);
        i += 1;
        continue;
      }
      if (ch === quote) {
        if (quote === "'" && inner.charAt(i + 1) === "'") {
          current += "'";
          i += 1;
          continue;
        }
        quote = "";
        continue;
      }
      current += ch;
      continue;
    }
    if (ch === '"' || ch === "'") {
      quote = ch;
      continue;
    }
    if (ch === ",") {
      items.push(parseScalar(current));
      current = "";
      continue;
    }
    current += ch;
  }
  if (current.trim()) items.push(parseScalar(current));
  return items;
}

function readBlock(lines, start, indicator) {
  var content = [];
  var base = null;
  var i = start;
  while (i < lines.length) {
    var line = lines[i].replace(/\r$/, "");
    if (!line.trim()) {
      content.push("");
      i += 1;
      continue;
    }
    var indent = (line.match(/^( *)/) || ["", ""])[1].length;
    if (indent === 0) break;
    if (base === null) base = indent;
    if (indent < base) break;
    content.push(line.slice(base));
    i += 1;
  }
  var text = content.join("\n");
  if (indicator === "|-" || indicator === ">-") text = text.replace(/\n+$/, "");
  else if (indicator === "|" || indicator === ">") text = text.replace(/\n+$/, "") + "\n";
  return { text: text, next: i };
}

function readList(lines, start) {
  var items = [];
  var i = start;
  while (i < lines.length) {
    var line = lines[i].replace(/\r$/, "");
    if (!line.trim()) {
      i += 1;
      continue;
    }
    var item = line.match(/^\s*-\s*(.*)$/);
    if (!item) break;
    items.push(parseScalar(item[1]));
    i += 1;
  }
  return { items: items, next: i };
}

function parseFrontmatter(src) {
  var lines = String(src || "").split("\n");
  var data = {};
  var i = 0;
  while (i < lines.length) {
    var line = lines[i].replace(/\r$/, "");
    if (!line.trim() || line.trim().charAt(0) === "#") {
      i += 1;
      continue;
    }
    var match = line.match(/^([A-Za-z0-9_]+):\s*(.*)$/);
    if (!match) {
      i += 1;
      continue;
    }
    var key = match[1];
    var raw = match[2].trim();
    if (
      raw === "|" ||
      raw === "|-" ||
      raw === "|+" ||
      raw === ">" ||
      raw === ">-" ||
      raw === ">+"
    ) {
      var block = readBlock(lines, i + 1, raw);
      data[key] = block.text;
      i = block.next;
      continue;
    }
    if (raw === "" || raw === "null" || raw === "~") {
      var next = i + 1 < lines.length ? lines[i + 1].replace(/\r$/, "") : "";
      if (/^\s*-\s*/.test(next)) {
        var list = readList(lines, i + 1);
        data[key] = list.items;
        i = list.next;
        continue;
      }
      data[key] = "";
      i += 1;
      continue;
    }
    if (raw.charAt(0) === "[" && raw.charAt(raw.length - 1) === "]") {
      data[key] = parseInlineArray(raw);
      i += 1;
      continue;
    }
    data[key] = parseScalar(raw);
    i += 1;
  }
  return data;
}

function asString(value) {
  if (value == null) return "";
  return String(value);
}

function asTags(value) {
  if (Array.isArray(value)) {
    return value.map(function (item) {
      return item == null ? "" : String(item);
    });
  }
  if (value == null || value === "") return [];
  return [String(value)];
}

function asDate(value) {
  var text = value == null ? "" : String(value).trim();
  var match = text.match(/^(\d{4}-\d{2}-\d{2})/);
  return match ? match[1] : text;
}

function isPublished(value) {
  return !(value === false || value === "false");
}

function listMarkdown(category) {
  var dir = path.join(ROOT, "content", category);
  if (!fs.existsSync(dir)) return [];
  return fs
    .readdirSync(dir)
    .filter(function (name) {
      return name.toLowerCase().endsWith(".md");
    })
    .sort()
    .map(function (name) {
      return path.join(dir, name);
    });
}

function buildPost(filePath, category) {
  var split = splitDocument(fs.readFileSync(filePath, "utf8"));
  var frontmatter = parseFrontmatter(split.frontmatter);
  var slug = path.basename(filePath, path.extname(filePath));
  var published = isPublished(frontmatter.published);
  return {
    published: published,
    post: {
      slug: slug,
      category: category,
      title: asString(frontmatter.title),
      titleEn: asString(frontmatter.titleEn),
      date: asDate(frontmatter.date),
      summary: asString(frontmatter.summary),
      coverImage: asString(frontmatter.coverImage),
      published: published,
      tags: asTags(frontmatter.tags),
      bodyMarkdown: split.body,
      bodyEn: asString(frontmatter.bodyEn),
      url: "/" + category + "/" + slug + "/",
    },
  };
}

function comparePosts(a, b) {
  if (a.date !== b.date) return a.date < b.date ? 1 : -1;
  var byTitle = a.title.localeCompare(b.title, "ko");
  if (byTitle !== 0) return byTitle;
  return a.slug.localeCompare(b.slug, "ko");
}

function main() {
  var output = { blessings: [], dreams: [] };
  CATEGORIES.forEach(function (category) {
    output[category] = listMarkdown(category)
      .map(function (filePath) {
        return buildPost(filePath, category);
      })
      .filter(function (item) {
        return item.published;
      })
      .map(function (item) {
        return item.post;
      })
      .sort(comparePosts);
  });

  var json = JSON.stringify(output, null, 2);
  fs.writeFileSync(path.join(ROOT, "content.json"), json + "\n", "utf8");
  fs.writeFileSync(
    path.join(ROOT, "content.data.js"),
    "window.LOTUS_CONTENT = " + json + ";\n",
    "utf8"
  );
  console.log("Blessings: " + output.blessings.length + " published post(s)");
  console.log("Dreams: " + output.dreams.length + " published post(s)");
  console.log("Generated content.data.js and content.json");
}

if (require.main === module) {
  main();
}

module.exports = {
  splitDocument: splitDocument,
  parseFrontmatter: parseFrontmatter,
};
