import assert from "node:assert/strict";

import { buildRouteSummary, buildRoutePath } from "../src/utils/routes";
import type { QuoteRoutePlan } from "../src/types/jupiter";

type RoutePlanStep = QuoteRoutePlan;

type StepOptions = {
  percent?: number;
  bps?: number;
  swapInfo?: Partial<RoutePlanStep["swapInfo"]>;
};

const createStep = ({ percent, bps, swapInfo }: StepOptions = {}): RoutePlanStep => ({
  swapInfo: {
    ammKey: "amm",
    label: "",
    inputMint: "input",
    outputMint: "output",
    inAmount: "0",
    outAmount: "0",
    feeAmount: "0",
    feeMint: "input",
    ...swapInfo,
  },
  percent: percent ?? 100,
  bps: bps ?? 0,
});

const run = (name: string, fn: () => void) => {
  try {
    fn();
    console.log(`✓ ${name}`);
  } catch (error) {
    console.error(`✗ ${name}`);
    throw error;
  }
};

run("buildRouteSummary replaces fallback labels with Jupiter", () => {
  const plan: RoutePlanStep[][] = [
    [
      createStep({
        swapInfo: {
          label: "Fallback",
          ammKey: "fallback",
          inputMint: "mintA",
          outputMint: "mintB",
        },
      }),
    ],
  ];

  const summary = buildRouteSummary(plan);
  assert.equal(summary.length, 1);
  assert.equal(summary[0].length, 1);
  assert.equal(summary[0][0].label, "Jupiter");
});

run("buildRouteSummary aggregates platform usage by label", () => {
  const plan: RoutePlanStep[][] = [
    [
      createStep({
        percent: 60,
        swapInfo: { label: "Orca", inputMint: "mintA", outputMint: "mintB" },
      }),
      createStep({
        percent: 20,
        swapInfo: { label: "Orca", inputMint: "mintA", outputMint: "mintB" },
      }),
      createStep({
        percent: 20,
        swapInfo: { label: "Raydium", inputMint: "mintA", outputMint: "mintB" },
      }),
    ],
  ];

  const summary = buildRouteSummary(plan);
  assert.equal(summary.length, 1);
  assert.equal(summary[0].length, 2);
  const [orca, raydium] = summary[0];
  assert.equal(orca.label, "Orca");
  assert.equal(Math.round(orca.percent), 80);
  assert.equal(raydium.label, "Raydium");
  assert.equal(Math.round(raydium.percent), 20);
});

run("buildRoutePath returns readable token sequences", () => {
  const plan: RoutePlanStep[][] = [
    [
      createStep({
        swapInfo: { label: "Orca", inputMint: "mintA", outputMint: "mintB" },
      }),
      createStep({
        swapInfo: { label: "Raydium", inputMint: "mintA", outputMint: "mintB" },
      }),
    ],
    [
      createStep({
        swapInfo: { label: "Jupiter", inputMint: "mintB", outputMint: "mintC" },
      }),
    ],
  ];

  const tokenMap = new Map([
    ["mintA", "SOL"],
    ["mintB", "USDC"],
    ["mintC", "BONK"],
  ]);

  const path = buildRoutePath(plan, (mint) => tokenMap.get(mint));
  assert.deepEqual(path, [
    ["SOL", "USDC"],
    ["USDC", "BONK"],
  ]);
});

run("buildRoutePath shortens mint addresses when missing symbols", () => {
  const plan: RoutePlanStep[][] = [
    [
      createStep({
        swapInfo: { label: "Unknown", inputMint: "mintX", outputMint: "mintY" },
      }),
    ],
  ];

  const path = buildRoutePath(plan);
  assert.equal(path.length, 1);
  assert.equal(path[0][0].startsWith("mint"), true);
  assert.equal(path[0][0].includes("…"), true);
});
