import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const LINE =
  "Rain hammered the tin roof in Lisbon while my father and I tore into sardines still crackling from the grill, salt and charcoal on our fingers, lemon stinging a cut I'd forgotten.";

const MAX_CHARS = 200;

function fail(message: string): never {
  console.error(`error: ${message}`);
  process.exit(1);
}

function guard(line: string): void {
  if (line.trim().length === 0) fail("entry is only whitespace");
  if (line.length > MAX_CHARS) {
    fail(`entry must be 1-200 characters, got ${line.length}`);
  }
  if (line !== line.trim()) fail("entry has leading or trailing whitespace");
  for (const ch of line) {
    if (ch.charCodeAt(0) < 0x20 && ch !== "\n" && ch !== "\t") {
      fail("entry contains a control character");
    }
  }
  if (line.includes("\n")) fail("entry must be a single line");
  // One sentence: exactly one sentence-terminating period (the final one).
  const terminators = (line.match(/[.!?]/g) ?? []).length;
  if (terminators !== 1 || !line.endsWith(".")) {
    fail("entry must be exactly one sentence");
  }
  // A second sentence hides behind ". " + capital; catch it even if the
  // terminator count above was somehow bypassed.
  if (/[.!?]\s+[A-Z]/.test(line)) fail("entry contains more than one sentence");
  // No collapsed spacing: a clean single sentence has no double spaces.
  if (line.includes("  ")) fail("entry contains double spaces");
}

guard(LINE);

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
const outPath = join(outDir, "entry.txt");
writeFileSync(outPath, LINE + "\n", "utf8");

// Read-back check: what landed on disk must be exactly the line.
const written = readFileSync(outPath, "utf8");
if (written !== LINE + "\n") fail("read-back mismatch: entry.txt differs from the line");
console.log(`wrote ${outPath} (${LINE.length} characters, one sentence)`);
