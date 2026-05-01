/**
 * scripts/eval-recommender.ts
 *
 * Offline evaluation of the TF-IDF event recommender.
 *
 * Metric: Category Match Rate (CMR)
 *   For each event, we get its top-3 recommendations and check what
 *   fraction share the same category. A perfect recommender on a
 *   single-category dataset would score 100%; a random baseline
 *   scores roughly equal to the largest category's proportion.
 *
 * Run with:  npm run eval:recs
 */

import { getSimilarEvents, type Event } from "../src/lib/ml/recommender";
import eventsData from "../src/data/events.json";

const allEvents = eventsData as Event[];
const K = 3;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** ANSI colour codes for readability in terminal output */
const C = {
  reset:  "\x1b[0m",
  bold:   "\x1b[1m",
  green:  "\x1b[32m",
  yellow: "\x1b[33m",
  cyan:   "\x1b[36m",
  gray:   "\x1b[90m",
  red:    "\x1b[31m",
};

function pct(n: number): string {
  return `${(n * 100).toFixed(1)}%`;
}

// ---------------------------------------------------------------------------
// Random baseline
// ---------------------------------------------------------------------------

/**
 * Compute expected category match rate for a random recommender.
 * Random picks k events uniformly at random (excluding self).
 * E[matches] = Σ_i P(random pick has same category as event i)
 *            = Σ_i (count_i - 1) / (N - 1)
 * where count_i = number of events in the same category as event i.
 */
function randomBaseline(events: Event[], k: number): number {
  const N = events.length;
  let totalExpected = 0;

  for (const event of events) {
    const sameCategory = events.filter(
      (e) => e.id !== event.id && e.category === event.category
    ).length;
    const pMatch = sameCategory / (N - 1); // P(a random pick matches)
    totalExpected += pMatch * k;           // expected matches for this event
  }

  // Average match rate across all events
  return totalExpected / (events.length * k);
}

// ---------------------------------------------------------------------------
// Main evaluation loop
// ---------------------------------------------------------------------------

console.log(`\n${C.bold}${C.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}`);
console.log(`${C.bold}${C.cyan}  Campus Companion — Recommender Evaluation${C.reset}`);
console.log(`${C.cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${C.reset}\n`);
console.log(`${C.gray}Events: ${allEvents.length}  |  k = ${K}${C.reset}\n`);

let totalMatches = 0;
let totalRecs = 0;

const rows: {
  title: string;
  category: string;
  recs: string[];
  matches: number;
  rate: string;
}[] = [];

for (const event of allEvents) {
  const similar = getSimilarEvents(event.id, allEvents, K);
  const matches = similar.filter(
    (s) => s.event.category === event.category
  ).length;

  totalMatches += matches;
  totalRecs += similar.length;

  rows.push({
    title: event.title,
    category: event.category,
    recs: similar.map(
      (s) => `${s.event.title} [${s.event.category}] (${pct(s.score)})`
    ),
    matches,
    rate: pct(matches / similar.length),
  });
}

// ---------------------------------------------------------------------------
// Print per-event table
// ---------------------------------------------------------------------------

console.log(`${C.bold}Per-Event Results${C.reset}`);
console.log("─".repeat(72));

for (const row of rows) {
  const matchColour = row.matches === K ? C.green : row.matches > 0 ? C.yellow : C.red;
  console.log(
    `${C.bold}${row.title}${C.reset} ${C.gray}[${row.category}]${C.reset}`
  );
  for (const rec of row.recs) {
    console.log(`  → ${rec}`);
  }
  console.log(
    `  ${matchColour}Category matches: ${row.matches}/${K} (${row.rate})${C.reset}\n`
  );
}

// ---------------------------------------------------------------------------
// Aggregate results
// ---------------------------------------------------------------------------

const modelCMR = totalMatches / totalRecs;
const baselineCMR = randomBaseline(allEvents, K);
const lift = modelCMR / baselineCMR;

console.log("═".repeat(72));
console.log(`${C.bold}Summary${C.reset}\n`);
console.log(
  `  Total recommendations evaluated : ${totalRecs} (${allEvents.length} events × ${K})`
);
console.log(
  `  Total category matches           : ${totalMatches}`
);
console.log(
  `  ${C.bold}TF-IDF CMR                       : ${C.green}${pct(modelCMR)}${C.reset}`
);
console.log(
  `  ${C.bold}Random baseline CMR              : ${C.yellow}${pct(baselineCMR)}${C.reset}`
);
console.log(
  `  ${C.bold}Lift over random                 : ${C.cyan}${lift.toFixed(2)}×${C.reset}`
);

// ---------------------------------------------------------------------------
// Per-category breakdown
// ---------------------------------------------------------------------------

const categories = [...new Set(allEvents.map((e) => e.category))].sort();
console.log(`\n${C.bold}Per-Category Breakdown${C.reset}`);
console.log("─".repeat(40));

for (const cat of categories) {
  const catRows = rows.filter((r) => r.category === cat);
  const catMatches = catRows.reduce((s, r) => s + r.matches, 0);
  const catTotal = catRows.length * K;
  const catRate = catMatches / catTotal;
  const bar = "█".repeat(Math.round(catRate * 20));
  console.log(
    `  ${cat.padEnd(12)} ${(pct(catRate)).padStart(6)}  ${bar}`
  );
}

console.log(`\n${C.gray}Done.${C.reset}\n`);