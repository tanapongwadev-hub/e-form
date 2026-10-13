// Usage: node scripts/eform-script.js src/forms/<file>.html [fromLine] [toLine]
// Prints the original form's main inline <script> (the eform:ready handler with all the form logic).
// With no range it lists the functions and their line numbers.
const fs = require("fs");
const [file, from, to] = process.argv.slice(2);
const s = fs.readFileSync(file, "utf8");
const js = [...s.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1]).filter((x) => x.length > 5000)[0] ?? "";
const lines = js.split("\n");
if (from === undefined) {
  console.log(`${lines.length} lines`);
  lines.forEach((l, i) => /^\s*function \w+/.test(l) && console.log(i, l.trim().slice(0, 100)));
} else {
  console.log(lines.slice(Number(from), Number(to ?? lines.length)).filter((l) => !/^\s*(\/\/|$)/.test(l)).join("\n"));
}
