/**
 * Educational Maslow need-tier model aligned with MatchWise v3.0 concepts.
 * Heuristic derivation from baseline answers — not a clinical instrument.
 */

export type MaslowTier =
  | "somatic"
  | "safety"
  | "belonging"
  | "esteem"
  | "actualization"
  | "transcendence";

export type MaslowOrientation =
  | "deficiency_anchored"
  | "growth_driven"
  | "balanced";

export type MaslowProfile = {
  tiers: Record<MaslowTier, number>;
  centerOfGravity: MaslowTier;
  orientation: MaslowOrientation;
};

export const MASLOW_TIER_LABELS: Record<
  MaslowTier,
  { en: string; ar: string }
> = {
  somatic: { en: "Somatic & vitality", ar: "الجسد والحيوية" },
  safety: { en: "Safety & stability", ar: "الأمان والاستقرار" },
  belonging: { en: "Belonging & connection", ar: "الانتماء والترابط" },
  esteem: { en: "Esteem & mastery", ar: "التقدير والإتقان" },
  actualization: { en: "Self-actualization", ar: "تحقيق الذات" },
  transcendence: { en: "Meaning & transcendence", ar: "المعنى والتجاوز" },
};

export type DeriveMaslowInput = {
  coreMotive: "red" | "blue" | "white" | "yellow";
  primaryNeed: "structure" | "freedom" | "empathy" | "esteem";
  stressTrigger: "chaos" | "restriction" | "conflict" | "dismissal";
  consciousnessLevel: number;
  topValues: string[];
};

export { deriveMaslowProfile } from "./maslow.mjs";

export function maslowOrientationLabel(
  orientation: MaslowOrientation,
  locale: "en" | "ar",
): string {
  const labels: Record<MaslowOrientation, { en: string; ar: string }> = {
    deficiency_anchored: {
      en: "Deficiency-focused (stability & unmet basics)",
      ar: "تركيز على النقص (استقرار واحتياجات أساسية)",
    },
    growth_driven: {
      en: "Growth-focused (expansion & meaning)",
      ar: "تركيز على النمو (توسع ومعنى)",
    },
    balanced: {
      en: "Balanced mix of stability and growth",
      ar: "مزيج متوازن بين الاستقرار والنمو",
    },
  };
  return labels[orientation][locale];
}
