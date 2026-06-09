// Build messages_{en,ja,zh_CN}.properties from the Korean base + workflow translations.
// Preserves comments/blank lines & key order; untranslated keys fall back to Korean.
// Validates {0},{1} MessageFormat placeholder parity (keeps ko on mismatch).
// Usage: node apply-messages.mjs <translateOutput.json>
import fs from "node:fs";
import path from "node:path";

const DIR = "src/main/resources/messages";
const BASE = path.resolve(DIR, "messages.properties");
const outFile = process.argv[2];
if (!outFile) { console.error("no output file"); process.exit(1); }

const baseText = fs.readFileSync(BASE, "utf8");
const lines = baseText.split(/\r?\n/);

const parsed = JSON.parse(fs.readFileSync(outFile, "utf8"));
const r = parsed.result || parsed;
const be = r.backend || {};

const PH = (s) => (String(s).match(/\{\d+\}/g) || []).sort();
const samePH = (a, b) => { const x = PH(a), y = PH(b); return x.length === y.length && x.every((v, i) => v === y[i]); };
const esc = (v) => String(v).replace(/\\/g, "\\\\").replace(/\r?\n/g, "\\n");

// parse base into [{kind:'raw'|'kv', text, key, ko}]
const parsedLines = lines.map((l) => {
  const m = l.match(/^([^#=\s][^=]*)=(.*)$/);
  if (m) return { kind: "kv", key: m[1].trim(), ko: m[2] };
  return { kind: "raw", text: l };
});

const LANGS = [["en", "messages_en.properties"], ["ja", "messages_ja.properties"], ["zh-CN", "messages_zh_CN.properties"]];
for (const [lang, fname] of LANGS) {
  const map = new Map();
  for (const e of (be[lang] || [])) if (e && e.key) map.set(e.key, e.v);
  let applied = 0, missing = 0, phBad = 0;
  const out = parsedLines.map((p) => {
    if (p.kind === "raw") return p.text;
    const tr = map.get(p.key);
    if (tr == null) { missing++; return `${p.key}=${esc(p.ko)}`; }
    if (!samePH(p.ko, tr)) { phBad++; return `${p.key}=${esc(p.ko)}`; }
    applied++;
    return `${p.key}=${esc(tr)}`;
  });
  fs.writeFileSync(path.resolve(DIR, fname), out.join("\n"), "utf8");
  console.log(`[${lang}] -> ${fname} applied=${applied} missing(fallback ko)=${missing} placeholderMismatch=${phBad}`);
}
