const MOTIVE_DEFAULT_VALUE = {
  red: "achievement",
  blue: "benevolence",
  white: "security",
  yellow: "stimulation",
};

export const MSQ_VALUE_OVERRIDES = {
  m1_red: "achievement",
  m1_blue: "benevolence",
  m1_white: "security",
  m1_yellow: "stimulation",
  m6_health: "security",
  m6_sovereignty: "self_direction",
  m6_respect: "achievement",
  m6_relationships: "benevolence",
  m7_venture: "self_direction",
  m7_craft: "mastery",
  m7_freedom: "self_direction",
  m7_impact: "stimulation",
  m8_warning: "wisdom",
  m8_mentor: "mastery",
  m8_peer: "achievement",
  m8_future_self: "self_direction",
  m10_judgment: "security",
  m10_isolation: "benevolence",
  m10_uncertainty: "wisdom",
  m10_responsibility: "self_direction",
  m11_ego: "security",
  m11_comfort: "security",
  m11_belonging: "benevolence",
  m11_energy: "security",
  m14_90min: "achievement",
  m14_boundary: "self_direction",
  m14_ship: "achievement",
  m14_body: "security",
  e1_friction: "rationality",
  e1_power: "achievement",
  e1_boundary: "self_direction",
  e1_grace: "benevolence",
  e2_phone: "security",
  e2_rushing: "security",
  e2_delaying: "rationality",
  e2_perfection: "mastery",
  e4_sovereignty: "self_direction",
  e4_harmony: "security",
  e4_impact: "benevolence",
  e4_adventure: "stimulation",
  e5_freedom: "self_direction",
  e5_craft: "mastery",
  e5_vitality: "security",
  e6_system: "rationality",
  e6_health: "security",
  e6_writing: "mastery",
  e7_deepwork: "achievement",
  e7_workout: "security",
  e7_ship: "achievement",
  e7_stillness: "security",
  m12_deep_work: "achievement",
  m12_artisan: "mastery",
  m12_minimalist: "self_direction",
  m13_sovereign: "self_direction",
};

const VALUE_TAG_EN = {
  self_direction: "Self-Direction",
  achievement: "Achievement",
  security: "Security & Harmony",
  benevolence: "Benevolence",
  stimulation: "Vitality & Play",
  mastery: "Mastery",
  wisdom: "Clarity",
  rationality: "Reason",
};

const VALUE_TAG_AR = {
  self_direction: "استقلال ذاتي",
  achievement: "إنجاز",
  security: "أمان وانسجام",
  benevolence: "عطاء وتأثير",
  stimulation: "حيوية ومرح",
  mastery: "إتقان",
  wisdom: "وضوح",
  rationality: "منطق",
};

const RELATED_VALUES = {
  achievement: ["mastery"],
  mastery: ["achievement"],
  self_direction: ["rationality", "wisdom"],
  wisdom: ["self_direction", "rationality"],
  rationality: ["self_direction", "wisdom"],
  stimulation: ["achievement"],
};

export function resolveValueAffinity(opt) {
  if (MSQ_VALUE_OVERRIDES[opt.id]) return MSQ_VALUE_OVERRIDES[opt.id];
  if (opt.valueAffinity) return opt.valueAffinity;
  if (opt.motiveAffinity) return MOTIVE_DEFAULT_VALUE[opt.motiveAffinity];
  return undefined;
}

export function valueTagForKey(key, locale) {
  return locale === "ar" ? VALUE_TAG_AR[key] : VALUE_TAG_EN[key];
}

export function valueAlignsWithProfile(key, topValues) {
  if (topValues.includes(key)) return true;
  return (RELATED_VALUES[key] ?? []).some((related) => topValues.includes(related));
}

export function msqOptionRank(opt, profile, motiveBoost) {
  let score = 0;
  if (opt.motiveAffinity === motiveBoost) score += 100;
  if (opt.motiveAffinity === profile.coreMotive) score += 50;
  const valueKey = resolveValueAffinity(opt);
  if (valueKey) {
    const exactIndex = profile.topValues.indexOf(valueKey);
    if (exactIndex >= 0) {
      score += 40 - exactIndex * 5;
    } else if (valueAlignsWithProfile(valueKey, profile.topValues)) {
      score += 20;
    }
  }
  return score;
}

export function sortMsqOptions(options, profile, motiveBoost) {
  return [...options].sort(
    (a, b) =>
      msqOptionRank(b, profile, motiveBoost) -
      msqOptionRank(a, profile, motiveBoost),
  );
}

export function enrichMsqOption(opt, locale, profile) {
  const key = resolveValueAffinity(opt);
  if (!key) return opt;
  const valueTag = valueTagForKey(key, locale);
  const valueAligned = profile
    ? valueAlignsWithProfile(key, profile.topValues)
    : undefined;
  return { ...opt, valueTag, valueAligned };
}
