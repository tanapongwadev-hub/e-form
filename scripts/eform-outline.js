// Usage: node outline.js <file.html>  -> condensed outline of the form markup (no scripts/styles)
const fs = require("fs");
let s = fs.readFileSync(process.argv[2], "utf8");
s = s.replace(/<(script|style)\b[\s\S]*?<\/\1>/g, "").replace(/<!--[\s\S]*?-->/g, "");
const body = s.slice(s.indexOf("<body"));
const out = [];
const attr = (tag, name) => (tag.match(new RegExp(`\s${name}\s*=\s*"([^"]*)"`, "i")) || [])[1];
const KEEP = ["id", "name", "type", "required", "pattern", "maxlength", "data-[a-z-]+", "for", "value", "readonly", "disabled", "accept", "min", "max"];
const re = /<(\/?)([a-zA-Z0-9]+)\b([^>]*)>|([^<]+)/g;
let m, depth = 0;
const interesting = new Set(["h1","h2","h3","h4","h5","h6","label","input","select","option","textarea","button","table","th","form","legend","fieldset","section","p","span","div","li","small","strong","b"]);
for (; (m = re.exec(body)); ) {
  if (m[4]) {
    const t = m[4].replace(/\s+/g, " ").trim();
    if (t && t.length > 1 && out.length) out[out.length - 1] += " «" + t.slice(0, 160) + "»";
    continue;
  }
  const [, close, tag, rest] = m;
  const tl = tag.toLowerCase();
  if (close) continue;
  if (!interesting.has(tl)) continue;
  const keep = [];
  for (const a of rest.matchAll(/\s([a-zA-Z_:][-a-zA-Z0-9_:.]*)(?:\s*=\s*"([^"]*)")?/g)) {
    const [_, n, v] = a;
    if (KEEP.some((k) => new RegExp(`^${k}$`, "i").test(n))) keep.push(v === undefined ? n : `${n}="${v.slice(0, 60)}"`);
    if (n === "class" && /\b(d-none|hidden|modal|list-field|collapse)\b/.test(v || "")) keep.push(`class~${(v.match(/\b(d-none|hidden|modal|list-field|collapse)\b/g) || []).join(",")}`);
    if (n === "style" && /display\s*:\s*none/.test(v || "")) keep.push("display:none");
  }
  if (["div","span","p","li","small","strong","b","section"].includes(tl) && !keep.length) { out.push(`${tl}`); continue; }
  out.push(`<${tl}${keep.length ? " " + keep.join(" ") : ""}>`);
}
// drop structural lines without text/attrs
console.log(out.filter((l) => !/^(div|span|p|li|small|strong|b|section)$/.test(l)).join("\n"));
