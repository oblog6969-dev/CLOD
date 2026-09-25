/** @typedef {'somatic'|'safety'|'belonging'|'esteem'|'actualization'|'transcendence'} MaslowTier */
/** @typedef {'deficiency_anchored'|'growth_driven'|'balanced'} MaslowOrientation */

const DEFICIENCY = ["somatic", "safety", "belonging", "esteem"];
const GROWTH = ["actualization", "transcendence"];

function bump(tiers, tier, amount) {
  tiers[tier] += amount;
}

function normalize(tiers) {
  const total = Object.values(tiers).reduce((n, v) => n + v, 0) || 1;
  const out = { ...tiers };
  for (const tier of Object.keys(out)) {
    out[tier] = Math.round((out[tier] / total) * 100);
  }
  const drift = 100 - Object.values(out).reduce((n, v) => n + v, 0);
  if (drift !== 0) {
    const maxTier = Object.entries(out).sort((a, b) => b[1] - a[1])[0]?.[0] || "safety";
    out[maxTier] = Math.max(0, out[maxTier] + drift);
  }
  return out;
}

export function deriveMaslowProfile(input) {
  /** @type {Record<MaslowTier, number>} */
  const tiers = {
    somatic: 8,
    safety: 14,
    belonging: 14,
    esteem: 14,
    actualization: 14,
    transcendence: 8,
  };

  if (input.primaryNeed === "structure" || input.stressTrigger === "chaos") {
    bump(tiers, "safety", 12);
    bump(tiers, "somatic", 4);
  }
  if (input.primaryNeed === "freedom" || input.stressTrigger === "restriction") {
    bump(tiers, "actualization", 10);
    bump(tiers, "esteem", 4);
  }
  if (input.primaryNeed === "empathy" || input.coreMotive === "blue") {
    bump(tiers, "belonging", 14);
  }
  if (input.primaryNeed === "esteem" || input.coreMotive === "red") {
    bump(tiers, "esteem", 12);
  }
  if (input.coreMotive === "white") {
    bump(tiers, "safety", 6);
    bump(tiers, "somatic", 6);
  }
  if (input.coreMotive === "yellow") {
    bump(tiers, "actualization", 8);
    bump(tiers, "transcendence", 4);
  }

  if (input.consciousnessLevel >= 350) bump(tiers, "transcendence", 10);
  else if (input.consciousnessLevel >= 275) bump(tiers, "actualization", 8);

  if (input.topValues.includes("security") || input.topValues.includes("tradition")) {
    bump(tiers, "safety", 8);
  }
  if (input.topValues.includes("benevolence")) bump(tiers, "belonging", 6);
  if (input.topValues.includes("achievement")) bump(tiers, "esteem", 8);
  if (input.topValues.includes("self_direction")) bump(tiers, "actualization", 8);

  if (input.stressTrigger === "conflict") bump(tiers, "belonging", 6);
  if (input.stressTrigger === "dismissal") bump(tiers, "esteem", 6);

  const normalized = normalize(tiers);
  const centerOfGravity = /** @type {MaslowTier} */ (
    Object.entries(normalized).sort((a, b) => b[1] - a[1])[0]?.[0] || "safety"
  );

  const dSum = DEFICIENCY.reduce((n, t) => n + normalized[t], 0);
  const bSum = GROWTH.reduce((n, t) => n + normalized[t], 0);
  /** @type {MaslowOrientation} */
  let orientation = "balanced";
  if (dSum >= bSum + 18) orientation = "deficiency_anchored";
  else if (bSum >= dSum + 18) orientation = "growth_driven";

  return { tiers: normalized, centerOfGravity, orientation };
}
