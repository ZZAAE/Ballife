// Append workflow-produced {key, ko} entries into messages.properties (flat, UTF-8),
// skipping keys that already exist. Usage: node merge-messages.mjs <outputFile.json>
import fs from "node:fs";
import path from "node:path";

const PROPS = path.resolve("src/main/resources/messages/messages.properties");
const outFile = process.argv[2];
if (!outFile) { console.error("no output file"); process.exit(1); }

const parsed = JSON.parse(fs.readFileSync(outFile, "utf8"));
const r = parsed.result || parsed;
const keys = r.keys || [];

let content = fs.readFileSync(PROPS, "utf8");
const existing = new Set(
  content.split(/\r?\n/).map((l) => {
    const m = l.match(/^([^#=\s][^=]*)=/);
    return m ? m[1].trim() : null;
  }).filter(Boolean)
);

const toAppend = [];
let skipped = 0;
for (const { key, ko } of keys) {
  if (!key) continue;
  if (existing.has(key)) { skipped++; continue; }
  existing.add(key);
  // properties: escape backslash; keep value on one line (collapse newlines)
  const val = String(ko).replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n");
  toAppend.push(`${key}=${val}`);
}

if (toAppend.length) {
  if (!content.endsWith("\n")) content += "\n";
  content += "\n# ---------- (auto-merged: validation.* / report.*) ----------\n" + toAppend.join("\n") + "\n";
  fs.writeFileSync(PROPS, content, "utf8");
}
console.log(`appended=${toAppend.length} skipped(existing)=${skipped} totalIncoming=${keys.length}`);
