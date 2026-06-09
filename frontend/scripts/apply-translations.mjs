// Apply workflow translations to en/ja/zh-CN translation.json.
// Starts from the ko structure (so every key exists; untranslated keys fall back to ko),
// overrides with translated values, and validates {{placeholder}} parity.
// Usage: node scripts/apply-translations.mjs <translateOutput.json>
import fs from "node:fs";
import path from "node:path";

const LOC = "src/i18n/locales";
const KO_PATH = path.resolve(LOC, "ko/translation.json");
const outFile = process.argv[2];
if (!outFile) { console.error("no output file"); process.exit(1); }

const ko = JSON.parse(fs.readFileSync(KO_PATH, "utf8"));
const parsed = JSON.parse(fs.readFileSync(outFile, "utf8"));
const r = parsed.result || parsed;
const fe = r.frontend || {};

function flatten(obj, prefix, out) {
  for (const k in obj) {
    const v = obj[k];
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object") flatten(v, key, out);
    else out[key] = v;
  }
  return out;
}
const koFlat = flatten(ko, "", {});
const koKeys = new Set(Object.keys(koFlat));

function clone(o) { return JSON.parse(JSON.stringify(o)); }
function setDeep(obj, dottedKey, value) {
  const parts = dottedKey.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    if (cur[parts[i]] == null || typeof cur[parts[i]] !== "object") return false;
    cur = cur[parts[i]];
  }
  cur[parts[parts.length - 1]] = value;
  return true;
}
const PH = (s) => (String(s).match(/{{\s*[\w.]+\s*}}/g) || []).sort();
const samePH = (a, b) => { const x = PH(a), y = PH(b); return x.length === y.length && x.every((v, i) => v === y[i]); };

const LANGS = ["en", "ja", "zh-CN"];
for (const lang of LANGS) {
  const tree = clone(ko);
  const entries = fe[lang] || [];
  let applied = 0, unknown = 0, phBad = 0;
  const seen = new Set();
  for (const e of entries) {
    if (!e || !e.key) continue;
    if (!koKeys.has(e.key)) { unknown++; continue; }
    if (!samePH(koFlat[e.key], e.v)) { phBad++; continue; } // keep ko fallback on placeholder mismatch
    if (setDeep(tree, e.key, e.v)) { applied++; seen.add(e.key); }
  }
  const missing = koKeys.size - seen.size;
  fs.writeFileSync(path.resolve(LOC, `${lang}/translation.json`), JSON.stringify(tree, null, 2) + "\n", "utf8");
  console.log(`[${lang}] applied=${applied} missing(fallback ko)=${missing} unknownKeys=${unknown} placeholderMismatch=${phBad}`);
}
console.log(`ko total keys=${koKeys.size}`);
