import type { AssessmentProfile } from "./domain";
import type { Locale } from "./language";
import { deriveMaslowProfile } from "./maslow.mjs";
import {
  ASSESSMENT_QUESTIONS_AR,
  ASSESSMENT_OPTIONS_AR,
  ARCHETYPE_AR,
} from "./locale/assessment-ar.mjs";

export type AssessmentQuestion = {
  id: string;
  category: string;
  framework: string;
  title: string;
  subtitle: string;
  options: {
    id: string;
    text: string;
    description: string;
    tag: string;
    scores: {
      coreMotive?: "red" | "blue" | "white" | "yellow";
      discStyle?: "D" | "I" | "S" | "C";
      primaryNeed?: "structure" | "freedom" | "empathy" | "esteem";
      stressTrigger?: "chaos" | "restriction" | "conflict" | "dismissal";
      consciousnessDelta?: number;
      value?: string;
    };
  }[];
};

export const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: "aq1",
    category: "Natural Pace & Energy",
    framework: "DISC & Social Pace",
    title: "How do you recharge and find your rhythm after demanding days?",
    subtitle: "Notice your spontaneous energy restoration pattern.",
    options: [
      {
        id: "aq1_d",
        text: "Direct physical action or tackling an exciting solo challenge.",
        description: "Regaining control and agency through tangible momentum.",
        tag: "High Tempo / Direct",
        scores: { discStyle: "D", coreMotive: "red" },
      },
      {
        id: "aq1_i",
        text: "Connecting with lively friends or engaging creative brainstorms.",
        description: "Energized by interaction, shared ideas, and novelty.",
        tag: "Expressive / People",
        scores: { discStyle: "I", coreMotive: "yellow" },
      },
      {
        id: "aq1_s",
        text: "A peaceful evening in a calm, familiar, and unhurried space.",
        description: "Protecting balance, stability, and emotional warmth.",
        tag: "Steady / Harmony",
        scores: { discStyle: "S", coreMotive: "white" },
      },
      {
        id: "aq1_c",
        text: "Solitary focus on deep reading, organizing, or a personal craft.",
        description: "Restoring mental clarity and order in quiet stillness.",
        tag: "Analytical / Quiet",
        scores: { discStyle: "C", coreMotive: "blue" },
      },
    ],
  },
  {
    id: "aq2",
    category: "Core Motive",
    framework: "Dr. Taylor Hartman Color Code",
    title: "At the deepest level, what must your daily work and life produce?",
    subtitle: "Your innate motive that makes effort feel truly worthwhile.",
    options: [
      {
        id: "aq2_red",
        text: "Measurable impact, leadership, and mastery over results.",
        description: "Driven by accomplishment, efficiency, and real progress.",
        tag: "Red Motive: Power & Results",
        scores: { coreMotive: "red", value: "achievement" },
      },
      {
        id: "aq2_blue",
        text: "Deep meaning, excellence, genuine integrity, and connection.",
        description: "Driven by depth, loyalty, purpose, and understanding.",
        tag: "Blue Motive: Intimacy & Purpose",
        scores: { coreMotive: "blue", value: "benevolence" },
      },
      {
        id: "aq2_white",
        text: "Clarity, inner peace, autonomy, and freedom from unnecessary drama.",
        description: "Driven by calm composure, space, and quiet resilience.",
        tag: "White Motive: Peace & Clarity",
        scores: { coreMotive: "white", value: "self_direction" },
      },
      {
        id: "aq2_yellow",
        text: "Enthusiasm, playful exploration, variety, and creative joy.",
        description: "Driven by optimism, freedom of expression, and celebration.",
        tag: "Yellow Motive: Fun & Vitality",
        scores: { coreMotive: "yellow", value: "stimulation" },
      },
    ],
  },
  {
    id: "aq3",
    category: "Underlying Psychological Needs",
    framework: "The Birkman Method (Needs)",
    title: "What environmental condition is essential for you to perform at your best?",
    subtitle: "When this is missing, your motivation quickly erodes.",
    options: [
      {
        id: "aq3_freedom",
        text: "Autonomy and independence to decide how, when, and where to work.",
        description: "Need freedom from micro-management and rigid bottlenecks.",
        tag: "Need: Freedom & Agency",
        scores: { primaryNeed: "freedom", stressTrigger: "restriction" },
      },
      {
        id: "aq3_structure",
        text: "Predictable rhythm, clear criteria, and consistent standards.",
        description: "Need reliable boundaries, order, and unambiguous rules.",
        tag: "Need: Structure & Order",
        scores: { primaryNeed: "structure", stressTrigger: "chaos" },
      },
      {
        id: "aq3_empathy",
        text: "Respectful dialogue, mutual trust, and empathetic consideration.",
        description: "Need emotional safety and sincere human acknowledgement.",
        tag: "Need: Empathy & Respect",
        scores: { primaryNeed: "empathy", stressTrigger: "dismissal" },
      },
      {
        id: "aq3_esteem",
        text: "Explicit appreciation for your standards, ideas, and dedication.",
        description: "Need recognition of your contribution and excellence.",
        tag: "Need: Esteem & Respect",
        scores: { primaryNeed: "esteem", stressTrigger: "conflict" },
      },
    ],
  },
  {
    id: "aq4",
    category: "Stress & Friction Responses",
    framework: "The Birkman Method (Stress)",
    title: "When feeling overwhelmed, tired, or cornered, what is your instinctive reaction?",
    subtitle: "Your unconscious defense pattern when needs go unmet.",
    options: [
      {
        id: "aq4_demanding",
        text: "Impatience, forceful pushback, or taking over everything myself.",
        description: "Reacting by tightening grip, demanding speed, or asserting control.",
        tag: "Direct Pressure / Demanding",
        scores: { stressTrigger: "restriction", discStyle: "D" },
      },
      {
        id: "aq4_withdrawing",
        text: "Stepping back, going quiet, or mentally detaching from the noise.",
        description: "Retreating to solitude to protect energy and avoid friction.",
        tag: "Protective Withdrawal",
        scores: { stressTrigger: "conflict", discStyle: "C" },
      },
      {
        id: "aq4_resisting",
        text: "Digging in heels, passive resistance, or over-analyzing decisions.",
        description: "Slowing down to resist external chaos or unreasonable demands.",
        tag: "Stubborn Resistance",
        scores: { stressTrigger: "chaos", discStyle: "S" },
      },
      {
        id: "aq4_anxious",
        text: "Distraction, restlessness, or scattered energy seeking an escape.",
        description: "Abandoning the tedious task in search of stimulation or relief.",
        tag: "Scattered Avoidance",
        scores: { stressTrigger: "dismissal", discStyle: "I" },
      },
    ],
  },
  {
    id: "aq5",
    category: "Consciousness & Inner Posture",
    framework: "David Hawkins Map of Consciousness",
    title: "When facing a major setback or self-doubt, what mindset pulls you through?",
    subtitle: "Moving from reactive force (<200) into generative power (≥200).",
    options: [
      {
        id: "aq5_courage",
        text: "Courage: 'This is hard, but I have the agency to step up and learn.'",
        description: "Taking 100% radical responsibility without making excuses.",
        tag: "Level 200+: Courage & Agency",
        scores: { consciousnessDelta: 250, value: "self_direction" },
      },
      {
        id: "aq5_willingness",
        text: "Willingness: 'I embrace the practice and refine my daily systems.'",
        description: "Approaching challenges as an artisan enjoying the craft.",
        tag: "Level 310+: Willingness & Craft",
        scores: { consciousnessDelta: 310, value: "mastery" },
      },
      {
        id: "aq5_acceptance",
        text: "Acceptance: 'Reality is what it is; I accept the facts and adapt with calm.'",
        description: "Zero victim mentality; clear vision without emotional storm.",
        tag: "Level 350+: Acceptance & Clarity",
        scores: { consciousnessDelta: 350, value: "wisdom" },
      },
      {
        id: "aq5_reason",
        text: "Reason: 'I dissect the pattern, find the leverage point, and solve it.'",
        description: "Lucid mental synthesis, strategic objectivity, and wisdom.",
        tag: "Level 400+: Reason & Synthesis",
        scores: { consciousnessDelta: 400, value: "rationality" },
      },
    ],
  },
  {
    id: "aq6",
    category: "Value Priorities",
    framework: "Schwartz Theory of Basic Values",
    title: "Which core principle would you refuse to compromise for fast money or status?",
    subtitle: "Your true internal compass when making high-stakes trade-offs.",
    options: [
      {
        id: "aq6_selfdir",
        text: "Sovereignty: Absolute ownership of my calendar, craft, and mind.",
        description: "I refuse to be a cog in anyone else's machine.",
        tag: "Self-Direction",
        scores: { value: "self_direction" },
      },
      {
        id: "aq6_mastery",
        text: "Excellence: Delivering work that represents highest quality and rigor.",
        description: "True pride in craftsmanship, deep mastery, and lasting impact.",
        tag: "Mastery & Achievement",
        scores: { value: "achievement" },
      },
      {
        id: "aq6_peace",
        text: "Peace & Family: Physical health, emotional serenity, and loving relationships.",
        description: "Success without inner peace and grounded relationships is failure.",
        tag: "Harmony & Security",
        scores: { value: "security" },
      },
      {
        id: "aq6_impact",
        text: "Service & Generosity: Lifting others, mentoring, and leaving things better.",
        description: "Making a tangible positive difference in the lives of others.",
        tag: "Benevolence & Impact",
        scores: { value: "benevolence" },
      },
    ],
  },
  {
    id: "aq7",
    category: "Emotional Set-Point",
    framework: "Abraham Hicks Emotional Continuum",
    title: "When you wake up in the morning, where does your mind naturally settle?",
    subtitle: "Your default emotional baseline heading into an ordinary day.",
    options: [
      {
        id: "aq7_high",
        text: "Anticipation, curiosity, and eagerness to get into the zone.",
        description: "Upward spiral: Optimism, eagerness, and flow.",
        tag: "Eager / In Flow",
        scores: { consciousnessDelta: 350 },
      },
      {
        id: "aq7_calm",
        text: "Steady, deliberate focus with a quiet, grounded perspective.",
        description: "Equanimity: Neutral, poised, and ready for whatever arises.",
        tag: "Grounded / Centered",
        scores: { consciousnessDelta: 300 },
      },
      {
        id: "aq7_tense",
        text: "Mental urgency, counting remaining tasks, feeling slightly behind.",
        description: "Alert vigilance: Driven by urgency, duty, and performance.",
        tag: "Driven / Vigilant",
        scores: { consciousnessDelta: 240 },
      },
      {
        id: "aq7_heavy",
        text: "Heavy inertia, resisting obligations, or craving more space/rest.",
        description: "Depleted battery: In need of replenishment and boundary reset.",
        tag: "Depleted / Reset Needed",
        scores: { consciousnessDelta: 200 },
      },
    ],
  },
  {
    id: "aq8",
    category: "Execution Rhythm",
    framework: "DISC Daily Levers",
    title: "How do you prefer to tackle needle-moving daily actions?",
    subtitle: "Your optimal leverage state for consistent daily execution.",
    options: [
      {
        id: "aq8_d",
        text: "Intense, uninterrupted power blocks attacking the hardest task first.",
        description: "High intensity, high velocity, clear targets.",
        tag: "Power Block Sprinter (D)",
        scores: { discStyle: "D" },
      },
      {
        id: "aq8_i",
        text: "Dynamic flow sessions combining creativity, music, and novel angles.",
        description: "Inspiration-led, expressive, avoiding repetitive monotony.",
        tag: "Creative Catalyst (I)",
        scores: { discStyle: "I" },
      },
      {
        id: "aq8_s",
        text: "A peaceful, ritualized cadence: steady, unhurried, and predictable.",
        description: "Consistency over spikes; protected daily rhythm.",
        tag: "Steady Architect (S)",
        scores: { discStyle: "S" },
      },
      {
        id: "aq8_c",
        text: "Methodical breakdown: checklists, systems, and impeccable precision.",
        description: "Flawless attention to detail, structured clarity, and quality.",
        tag: "Methodical Strategist (C)",
        scores: { discStyle: "C" },
      },
    ],
  },
];

export function calculateAssessment(
  answers: Record<string, string>,
): AssessmentProfile {
  const motiveCounts: Record<"red" | "blue" | "white" | "yellow", number> = {
    red: 0,
    blue: 0,
    white: 0,
    yellow: 0,
  };
  const discCounts: Record<"D" | "I" | "S" | "C", number> = {
    D: 0,
    I: 0,
    S: 0,
    C: 0,
  };
  const needCounts: Record<
    "structure" | "freedom" | "empathy" | "esteem",
    number
  > = {
    structure: 0,
    freedom: 0,
    empathy: 0,
    esteem: 0,
  };
  const stressCounts: Record<
    "chaos" | "restriction" | "conflict" | "dismissal",
    number
  > = {
    chaos: 0,
    restriction: 0,
    conflict: 0,
    dismissal: 0,
  };

  let totalConsciousness = 0;
  let consciousnessItems = 0;
  const valuesSet = new Set<string>();

  for (const q of assessmentQuestions) {
    const chosenOptionId = answers[q.id];
    const option = q.options.find((o) => o.id === chosenOptionId);
    if (!option) continue;

    if (option.scores.coreMotive) {
      motiveCounts[option.scores.coreMotive] += 2;
    }
    if (option.scores.discStyle) {
      discCounts[option.scores.discStyle] += 2;
    }
    if (option.scores.primaryNeed) {
      needCounts[option.scores.primaryNeed] += 2;
    }
    if (option.scores.stressTrigger) {
      stressCounts[option.scores.stressTrigger] += 2;
    }
    if (option.scores.consciousnessDelta) {
      totalConsciousness += option.scores.consciousnessDelta;
      consciousnessItems++;
    }
    if (option.scores.value) {
      valuesSet.add(option.scores.value);
    }
  }

  // Determine dominant core motive
  const coreMotive = (
    Object.entries(motiveCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "white"
  ) as "red" | "blue" | "white" | "yellow";

  // Determine dominant DISC style
  const discStyle = (
    Object.entries(discCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "C"
  ) as "D" | "I" | "S" | "C";

  // Determine primary need
  const primaryNeed = (
    Object.entries(needCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "freedom"
  ) as "structure" | "freedom" | "empathy" | "esteem";

  // Determine stress trigger
  const stressTrigger = (
    Object.entries(stressCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
    "restriction"
  ) as "chaos" | "restriction" | "conflict" | "dismissal";

  // Calculate consciousness level (default ~275 if unanswered)
  const consciousnessLevel = consciousnessItems > 0
    ? Math.round(totalConsciousness / consciousnessItems)
    : 280;

  // Derive archetype name and motive description
  const archetypeMap: Record<
    string,
    { title: string; description: string }
  > = {
    "red-D": {
      title: "The Sovereign Commander",
      description: "Driven by results, decisive execution, and high-agency independence.",
    },
    "red-C": {
      title: "The Strategic Architect",
      description: "Combines uncompromising standards with rigorous analytical execution.",
    },
    "blue-C": {
      title: "The Deep Craftsman",
      description: "Guided by integrity, mastery of nuance, and devotion to quality.",
    },
    "blue-S": {
      title: "The Empathetic Anchor",
      description: "Builds enduring foundations through loyalty, care, and quiet consistency.",
    },
    "white-S": {
      title: "The Grounded Harmonizer",
      description: "Navigates life with unshakeable composure, patience, and clear boundaries.",
    },
    "white-D": {
      title: "The Stoic Operator",
      description: "Calm under pressure, cutting through noise with focused minimalist action.",
    },
    "yellow-I": {
      title: "The Visionary Catalyst",
      description: "Ignites momentum with infectious optimism, creative sparks, and playful boldness.",
    },
    "yellow-D": {
      title: "The Dynamic Pioneer",
      description: "Turns bold, adventurous ideas into fast reality with enthusiastic speed.",
    },
  };

  const key = `${coreMotive}-${discStyle}`;
  const archetype = archetypeMap[key] || {
    title: `The ${coreMotive.toUpperCase()} / ${discStyle} Practitioner`,
    description: "Balancing personal vision, core needs, and daily deliberate practice.",
  };

  const maslow = deriveMaslowProfile({
    coreMotive,
    primaryNeed,
    stressTrigger,
    consciousnessLevel,
    topValues: Array.from(valuesSet),
  });

  return {
    completedAt: new Date().toISOString(),
    coreMotive,
    discStyle,
    primaryNeed,
    stressTrigger,
    consciousnessLevel,
    topValues: Array.from(valuesSet),
    archetypeName: archetype.title,
    motiveDescription: archetype.description,
    maslowCenter: maslow.centerOfGravity,
    maslowOrientation: maslow.orientation,
    maslowTiers: maslow.tiers,
  };
}

export function getAssessmentQuestions(locale: Locale): AssessmentQuestion[] {
  if (locale !== "ar") return assessmentQuestions;
  return assessmentQuestions.map((q) => {
    const meta = (ASSESSMENT_QUESTIONS_AR as Record<
      string,
      { category: string; framework: string; title: string; subtitle: string }
    >)[q.id];
    return {
      ...q,
      category: meta?.category ?? q.category,
      framework: meta?.framework ?? q.framework,
      title: meta?.title ?? q.title,
      subtitle: meta?.subtitle ?? q.subtitle,
      options: q.options.map((opt) => {
        const tr = (ASSESSMENT_OPTIONS_AR as Record<
          string,
          { text: string; description: string; tag: string }
        >)[opt.id];
        return tr
          ? {
              ...opt,
              text: tr.text,
              description: tr.description,
              tag: tr.tag,
            }
          : opt;
      }),
    };
  });
}

export function displayArchetype(
  profile: AssessmentProfile,
  locale: Locale,
): { name: string; description: string } {
  if (locale !== "ar") {
    return {
      name: profile.archetypeName,
      description: profile.motiveDescription,
    };
  }
  const key = `${profile.coreMotive}-${profile.discStyle}`;
  const ar = (ARCHETYPE_AR as Record<
    string,
    { title: string; description: string }
  >)[key];
  if (ar) return { name: ar.title, description: ar.description };
  return {
    name: profile.archetypeName,
    description: profile.motiveDescription,
  };
}
