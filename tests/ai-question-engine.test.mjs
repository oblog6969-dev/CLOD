import test from "node:test";
import assert from "node:assert/strict";
import {
  buildFrameworkSystemPrompt,
  generateOfflineFallbackQuestion,
} from "../src/lib/ai-question-engine.ts";

test("buildFrameworkSystemPrompt incorporates 14 MatchWise frameworks and user psychometrics", () => {
  const prompt = buildFrameworkSystemPrompt({
    cycle: "weekly",
    phase: "multi_cycle_review",
    profile: {
      coreMotive: "red",
      discStyle: "D",
      primaryNeed: "freedom",
      stressTrigger: "restriction",
      consciousnessLevel: 310,
      maslowCenter: "actualization",
      topValues: ["self_direction", "achievement"],
    },
    plan: {
      antiVision: "Trapped in mindless bureaucracy",
      vision: "Sovereign creator building high-agency tools",
      year: "Launch autonomous system",
    },
    locale: "en",
  });

  // Verify framework integrations
  assert.ok(prompt.includes("Hartman Color Code"), "Mentions Hartman");
  assert.ok(prompt.includes("Hawkins LoC"), "Mentions Hawkins");
  assert.ok(prompt.includes("Birkman Method"), "Mentions Birkman");
  assert.ok(prompt.includes("DISC"), "Mentions DISC");
  assert.ok(prompt.includes("Schwartz Values"), "Mentions Schwartz");
  assert.ok(prompt.includes("Maslow 6 Tiers"), "Mentions Maslow");
  assert.ok(prompt.includes("Kegan Orders of Mind"), "Mentions Kegan");

  // Verify profile injection
  assert.ok(prompt.includes("RED"), "Contains user motive");
  assert.ok(prompt.includes("Style D"), "Contains user DISC style");
  assert.ok(prompt.includes("freedom"), "Contains user primary need");
  assert.ok(prompt.includes("restriction"), "Contains user stress trigger");
  assert.ok(prompt.includes("310 LoC"), "Contains user consciousness level");
  assert.ok(prompt.includes("WEEKLY CYCLE DIRECTIVE"), "Contains cycle directive");
  assert.ok(prompt.includes("CRITICAL ANTI-IDEALIZATION RULES"), "Contains anti-idealization rules");
});

test("generateOfflineFallbackQuestion generates valid questions across all 5 cycles", () => {
  const cycles = ["daily", "weekly", "monthly", "quarterly", "annual"];

  for (const cycle of cycles) {
    const questionEn = generateOfflineFallbackQuestion({
      cycle,
      locale: "en",
      profile: {
        coreMotive: "blue",
        discStyle: "C",
        primaryNeed: "structure",
      },
    });

    assert.equal(questionEn.cycle, cycle);
    assert.ok(questionEn.title.length > 5, `${cycle} title is populated`);
    assert.ok(questionEn.subtitle.length > 5, `${cycle} subtitle is populated`);
    assert.ok(questionEn.options.length >= 3, `${cycle} has at least 3 options`);
    assert.ok(questionEn.frameworks.length >= 2, `${cycle} cites multiple frameworks`);

    for (const opt of questionEn.options) {
      assert.ok(opt.label.length > 5, "Option label is populated");
      assert.ok(opt.subtext.length > 5, "Option subtext is populated");
      assert.ok(opt.scores, "Option has psychological scores");
    }

    // Arabic localization check
    const questionAr = generateOfflineFallbackQuestion({
      cycle,
      locale: "ar",
      profile: {
        coreMotive: "white",
        discStyle: "S",
      },
    });

    assert.equal(questionAr.cycle, cycle);
    assert.ok(/[\u0600-\u06FF]/.test(questionAr.title), `${cycle} Arabic title contains Arabic text`);
    assert.ok(/[\u0600-\u06FF]/.test(questionAr.options[0].label), `${cycle} Arabic option contains Arabic text`);
  }
});
