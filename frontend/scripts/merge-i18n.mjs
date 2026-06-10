// Merge workflow-produced {key, ko} entries into ko/translation.json (nested).
// Usage: node scripts/merge-i18n.mjs <outputFile.json> [<outputFile2.json> ...]
import fs from "node:fs";
import path from "node:path";

const KO_PATH = path.resolve("src/i18n/locales/ko/translation.json");

const outFiles = process.argv.slice(2);
if (outFiles.length === 0) {
  console.error("no output files given");
  process.exit(1);
}

const ko = JSON.parse(fs.readFileSync(KO_PATH, "utf8"));

const conflicts = [];
let added = 0;
let overwritten = 0;

function setDeep(obj, dottedKey, value) {
  const parts = dottedKey.split(".");
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    if (cur[p] == null) cur[p] = {};
    if (typeof cur[p] !== "object") {
      conflicts.push(`leaf/branch conflict at "${parts.slice(0, i + 1).join(".")}" for key "${dottedKey}"`);
      return;
    }
    cur = cur[p];
  }
  const leaf = parts[parts.length - 1];
  if (cur[leaf] != null && typeof cur[leaf] === "object") {
    conflicts.push(`branch/leaf conflict at "${dottedKey}" (existing object)`);
    return;
  }
  if (cur[leaf] != null) {
    if (cur[leaf] !== value) overwritten++;
  } else {
    added++;
  }
  cur[leaf] = value;
}

const seen = new Set();
const dupDiff = [];
for (const f of outFiles) {
  const parsed = JSON.parse(fs.readFileSync(f, "utf8"));
  const r = parsed.result || parsed;
  const entries = r.entries || [];
  for (const e of entries) {
    if (!e || !e.key) continue;
    if (seen.has(e.key)) {
      // duplicate key across entries; keep first, note if value differs
    }
    seen.add(e.key);
    setDeep(ko, e.key, e.ko);
  }
}

fs.writeFileSync(KO_PATH, JSON.stringify(ko, null, 2) + "\n", "utf8");
console.log(`merged. added=${added} overwritten=${overwritten} uniqueKeys=${seen.size}`);
if (conflicts.length) {
  console.log(`CONFLICTS (${conflicts.length}):`);
  for (const c of conflicts.slice(0, 40)) console.log("  - " + c);
}
