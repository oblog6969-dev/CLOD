import type { AssessmentProfile, Plan } from "./domain";
import type { Locale } from "./language";
import type { MaslowTier } from "./maslow";
import { MSQ_HEADINGS_AR } from "./locale/msq-ar-headings.mjs";
import { MSQ_OPTIONS_AR } from "./locale/msq-ar-options.mjs";

const ARCHETYPE_TAG_AR: Record<string, string> = {
  "Red: Power / Results": "أحمر: إنجاز وقوة",
  "Blue: Connection / Care": "أزرق: معنى وترابط",
  "White: Peace / Clarity": "أبيض: سلام ووضوح",
  "Yellow: Fun / Vitality": "أصفر: حيوية ومرح",
};

function localizeMsq(def: MsqPromptDefinition, locale: Locale): MsqPromptDefinition {
  if (locale !== "ar") return def;
  const headings = (MSQ_HEADINGS_AR as Record<string, { title: string; subtitle: string }>)[
    def.id
  ];
  const optionsAr = MSQ_OPTIONS_AR as Record<
    string,
    { label: string; subtext?: string }
  >;
  return {
    ...def,
    title: headings?.title ?? def.title,
    subtitle: headings?.subtitle ?? def.subtitle,
    options: def.options.map((opt) => {
      const tr = optionsAr[opt.id];
      return {
        ...opt,
        label: tr?.label ?? opt.label,
        subtext: tr?.subtext ?? opt.subtext,
        archetypeTag: opt.archetypeTag
          ? ARCHETYPE_TAG_AR[opt.archetypeTag] ?? opt.archetypeTag
          : undefined,
      };
    }),
  };
}

export type MsqOption = {
  id: string;
  label: string;
  subtext?: string;
  motiveAffinity?: "red" | "blue" | "white" | "yellow";
  archetypeTag?: string;
};

export type MsqPromptDefinition = {
  id: string;
  title: string;
  subtitle: string;
  multiSelect?: boolean;
  options: MsqOption[];
};

export const MSQ_CATALOG: Record<string, MsqPromptDefinition> = {
  m1: {
    id: "m1",
    title: "What feels quietly out of balance?",
    subtitle: "Notice the small dissatisfaction you have become used to.",
    multiSelect: true,
    options: [
      {
        id: "m1_red",
        label: "Low leverage & scattered focus",
        subtext: "Spending excessive energy on low-impact admin instead of high-leverage execution.",
        motiveAffinity: "red",
        archetypeTag: "Red: Power / Results",
      },
      {
        id: "m1_blue",
        label: "Emotional exhaustion & relational drain",
        subtext: "Over-extending for others while neglecting deep personal craft and meaningful rest.",
        motiveAffinity: "blue",
        archetypeTag: "Blue: Connection / Care",
      },
      {
        id: "m1_white",
        label: "Mental clutter & constant background noise",
        subtext: "Too many open loops, chaotic inputs, and a lack of quiet, unhurried space.",
        motiveAffinity: "white",
        archetypeTag: "White: Peace / Clarity",
      },
      {
        id: "m1_yellow",
        label: "Monotony & creative stagnation",
        subtext: "Days feeling repetitive and mechanical, lacking playful exploration or spark.",
        motiveAffinity: "yellow",
        archetypeTag: "Yellow: Fun / Vitality",
      },
    ],
  },
  m2: {
    id: "m2",
    title: "Which frustrations keep returning?",
    subtitle: "List recurring friction points, without judging yourself.",
    multiSelect: true,
    options: [
      {
        id: "m2_1",
        label: "Reactive procrastination on the hard needle-moving task",
        subtext: "Doing busywork to avoid the emotional resistance of high-stakes focus.",
        motiveAffinity: "red",
      },
      {
        id: "m2_2",
        label: "Saying yes to requests I secretly wish I had declined",
        subtext: "Letting external obligations dictate my sacred morning hours.",
        motiveAffinity: "blue",
      },
      {
        id: "m2_3",
        label: "Overthinking the perfect system instead of taking messy action",
        subtext: "Paralysis by analysis; refining tools rather than shipping work.",
        motiveAffinity: "white",
      },
      {
        id: "m2_4",
        label: "Losing momentum halfway through new projects",
        subtext: "Excitement fades as soon as tedious consistency is required.",
        motiveAffinity: "yellow",
      },
    ],
  },
  m3: {
    id: "m3",
    title: "What do your choices reveal?",
    subtitle: "Consider what your recent actions seem to prioritize.",
    multiSelect: false,
    options: [
      {
        id: "m3_comfort",
        label: "Prioritizing short-term comfort over long-term compound growth",
        subtext: "Choosing immediate relief over the necessary friction of leveling up.",
        motiveAffinity: "white",
      },
      {
        id: "m3_obligation",
        label: "Prioritizing others' urgency over my own non-negotiable vision",
        subtext: "Operating in firefighting mode rather than proactive creation.",
        motiveAffinity: "blue",
      },
      {
        id: "m3_control",
        label: "Prioritizing micromanagement over delegation and scalable systems",
        subtext: "Holding tightly to every detail out of perfectionism or anxiety.",
        motiveAffinity: "red",
      },
      {
        id: "m3_distraction",
        label: "Prioritizing cheap dopamine and novel inputs over deep sustained focus",
        subtext: "Scattered across tabs, notifications, and surface stimulation.",
        motiveAffinity: "yellow",
      },
    ],
  },
  m4: {
    id: "m4",
    title: "What is difficult to acknowledge?",
    subtitle: "Name something honest you rarely share. You can skip anytime.",
    multiSelect: false,
    options: [
      {
        id: "m4_fear",
        label: "I fear putting my full effort into something and still failing.",
        subtext: "Holding back gives me a convenient excuse if it doesn't work out.",
        motiveAffinity: "red",
      },
      {
        id: "m4_tired",
        label: "I am genuinely exhausted from maintaining an appearance of having it all together.",
        subtext: "The mask of effortless competence is draining my inner reserves.",
        motiveAffinity: "blue",
      },
      {
        id: "m4_outgrown",
        label: "I have quietly outgrown my current environment, routines, or expectations.",
        subtext: "Staying here is safe, but it is slowly stifling my potential.",
        motiveAffinity: "white",
      },
      {
        id: "m4_directionless",
        label: "I drift because I haven't committed to a single, polarizing direction.",
        subtext: "Keeping all options open means making no real progress in any.",
        motiveAffinity: "yellow",
      },
    ],
  },
  m5: {
    id: "m5",
    title: "Where does your current path lead?",
    subtitle: "Picture an ordinary day 5 years from now if your routines stay unchanged.",
    multiSelect: false,
    options: [
      {
        id: "m5_stuck",
        label: "Trapped in the same cycle with heavier regrets and lower energy.",
        subtext: "Financial or career ceiling reached; autonomy severely constrained.",
        motiveAffinity: "red",
      },
      {
        id: "m5_numb",
        label: "Comfortable mediocrity where days blur into numb routine.",
        subtext: "No major disaster, but a slow erosion of spirit and vitality.",
        motiveAffinity: "white",
      },
      {
        id: "m5_burnout",
        label: "Chronic burnout and resentful exhaustion from constant hustle without joy.",
        subtext: "Running on empty, health compromised, feeling alienated from myself.",
        motiveAffinity: "blue",
      },
      {
        id: "m5_scattered",
        label: "A dozen half-finished dreams and projects with nothing tangible to show.",
        subtext: "Scattered potential that never crystallized into real mastery.",
        motiveAffinity: "yellow",
      },
    ],
  },
  m6: {
    id: "m6",
    title: "What could a decade of this cost?",
    subtitle: "Consider opportunities, health, relationships, and self-respect.",
    multiSelect: true,
    options: [
      {
        id: "m6_health",
        label: "Physical vitality and peak cognitive sharpness",
        subtext: "Compounding stress, poor sleep, and neglected physical foundation.",
      },
      {
        id: "m6_sovereignty",
        label: "True financial independence and sovereignty over my time",
        subtext: "Trading my prime years for someone else's bottom line.",
      },
      {
        id: "m6_respect",
        label: "Self-trust and self-respect from broken promises to myself",
        subtext: "The internal knowing that I settled when I was capable of greatness.",
      },
      {
        id: "m6_relationships",
        label: "Deep presence with the people I love",
        subtext: "Being physically present but mentally absent, stressed, or irritable.",
      },
    ],
  },
  m7: {
    id: "m7",
    title: "What would you wish you had tried?",
    subtitle: "Look back from later life with kindness toward yourself today.",
    multiSelect: false,
    options: [
      {
        id: "m7_venture",
        label: "Building my own sovereign enterprise and independent creative work.",
        subtext: "Going all-in on my unique ability and creating tangible leverage.",
        motiveAffinity: "red",
      },
      {
        id: "m7_craft",
        label: "Mastering a high-value craft with singular devotion and beauty.",
        subtext: "Producing work of undeniable excellence that stands the test of time.",
        motiveAffinity: "blue",
      },
      {
        id: "m7_freedom",
        label: "Designing a peaceful, unhurried life with complete geographical freedom.",
        subtext: "Living on my own terms without alarm clocks or toxic rush.",
        motiveAffinity: "white",
      },
      {
        id: "m7_impact",
        label: "Living boldly and unapologetically, inspiring others through real adventure.",
        subtext: "Taking courageous leaps and experiencing life to the fullest.",
        motiveAffinity: "yellow",
      },
    ],
  },
  m8: {
    id: "m8",
    title: "Who illustrates this possible future?",
    subtitle: "Reflect on someone whose trajectory helps you see your own.",
    multiSelect: false,
    options: [
      {
        id: "m8_warning",
        label: "A cautionary example: Someone who settled, became cynical, and gave up.",
        subtext: "Their apathy and excuses serve as my ultimate anti-vision warning.",
      },
      {
        id: "m8_mentor",
        label: "An inspirational artisan: Someone who achieved sovereignty through relentless focus.",
        subtext: "Their quiet discipline and mastery prove what is possible.",
      },
      {
        id: "m8_peer",
        label: "A bold contemporary: Someone stepping into the arena and shipping daily.",
        subtext: "Reminding me that perfection is not required—only consistent momentum.",
      },
      {
        id: "m8_future_self",
        label: "My own future self: The person I know I am destined to become.",
        subtext: "Calm, capable, grounded, and unapologetically focused on what matters.",
      },
    ],
  },
  m9: {
    id: "m9",
    title: "Which old role are you ready to loosen?",
    subtitle: "What might change in how other people see you?",
    multiSelect: false,
    options: [
      {
        id: "m9_pleaser",
        label: "The Compliant Pleaser: Always available, always agreeing to keep peace.",
        subtext: "Ready to embrace healthy boundaries and comfortable 'no's.",
        motiveAffinity: "blue",
      },
      {
        id: "m9_hustler",
        label: "The Exhausted Hustler: Measuring self-worth purely through frantic output.",
        subtext: "Ready to embrace strategic leverage, stillness, and smart rest.",
        motiveAffinity: "red",
      },
      {
        id: "m9_ghost",
        label: "The Passive Observer: Playing it small and staying safely unnoticed.",
        subtext: "Ready to put my work into the arena and take sovereign responsibility.",
        motiveAffinity: "white",
      },
      {
        id: "m9_dabbler",
        label: "The Perpetual Dabbler: Chasing every shiny object without finishing.",
        subtext: "Ready to embrace deep craft and finish what I start.",
        motiveAffinity: "yellow",
      },
    ],
  },
  m10: {
    id: "m10",
    title: "What reason have you been avoiding?",
    subtitle: "Give yourself permission to name the underlying fear without self-criticism.",
    multiSelect: false,
    options: [
      {
        id: "m10_judgment",
        label: "Fear of judgment, ridicule, or misunderstandings from peers.",
        subtext: "Caring too much about the opinions of people whose lives I don't desire.",
      },
      {
        id: "m10_isolation",
        label: "Fear of outgrowing my social circle and feeling isolated during the climb.",
        subtext: "Worrying that evolving will separate me from familiar connections.",
      },
      {
        id: "m10_uncertainty",
        label: "Unwillingness to tolerate the ambiguity of beginning as a novice again.",
        subtext: "Clinging to current competence even when it leads to a dead end.",
      },
      {
        id: "m10_responsibility",
        label: "The terrifying weight of absolute responsibility with no one else to blame.",
        subtext: "Once I claim full agency, every outcome is entirely my own creation.",
      },
    ],
  },
  m11: {
    id: "m11",
    title: "What is this pattern protecting?",
    subtitle: "Notice both the hidden benefit and the heavy cost of staying where you are.",
    multiSelect: false,
    options: [
      {
        id: "m11_ego",
        label: "Protecting my ego from the sting of public failure or rejection.",
        subtext: "If I never put myself on the line, my self-image remains intact.",
      },
      {
        id: "m11_comfort",
        label: "Protecting my comfort zone and predictable, unchallenging routines.",
        subtext: "Trading my potential for the sedation of certainty.",
      },
      {
        id: "m11_belonging",
        label: "Protecting social belonging by not making waves or standing out.",
        subtext: "Staying synchronized with group consensus at the expense of my calling.",
      },
      {
        id: "m11_energy",
        label: "Conserving emotional energy because I feel chronically depleted.",
        subtext: "Survival mode masquerading as rational caution.",
      },
    ],
  },
  m12: {
    id: "m12",
    title: "What would a fulfilling ordinary day look like?",
    subtitle: "Imagine life 3 years ahead, including work, rest, and people.",
    multiSelect: false,
    options: [
      {
        id: "m12_deep_work",
        label: "Deep work mornings, high-leverage business, afternoon training & nature.",
        subtext: "Clear mind, zero alarm, 3–4 hours of peak focus, complete autonomy.",
        motiveAffinity: "red",
      },
      {
        id: "m12_artisan",
        label: "A quiet, beautiful studio space, unhurried craft, rich dinners with close family.",
        subtext: "Meaningful creation, physical wellbeing, deep presence with loved ones.",
        motiveAffinity: "blue",
      },
      {
        id: "m12_minimalist",
        label: "Minimalist simplicity: low overhead, total calendar ownership, peaceful reading.",
        subtext: "Freedom from manufactured emergencies; mental stillness and clarity.",
        motiveAffinity: "white",
      },
      {
        id: "m12_explorer",
        label: "Travel, collaborative creative sprints, high energy, and inspiring community.",
        subtext: "Vibrant exploration, playful projects, and diverse experiences.",
        motiveAffinity: "yellow",
      },
    ],
  },
  m13: {
    id: "m13",
    title: "Who would you practice becoming?",
    subtitle: "Describe a way of being that would naturally support that day.",
    multiSelect: false,
    options: [
      {
        id: "m13_sovereign",
        label: "A sovereign, high-agency creator who moves with decisive calm.",
        subtext: "I do not react to chaos; I architect my reality and execute with discipline.",
        motiveAffinity: "red",
      },
      {
        id: "m13_grounded",
        label: "A grounded, patient craftsman who respects time and deep compounding.",
        subtext: "Unshaken by short-term noise, focused on enduring quality and character.",
        motiveAffinity: "white",
      },
      {
        id: "m13_empathetic",
        label: "An empathetic leader who acts with integrity, generosity, and poise.",
        subtext: "Leading by example, holding high standards with warm human presence.",
        motiveAffinity: "blue",
      },
      {
        id: "m13_vital",
        label: "An energized, resilient explorer who brings courage and joy to every arena.",
        subtext: "Refusing to be weighed down; seeing life as a creative grand experiment.",
        motiveAffinity: "yellow",
      },
    ],
  },
  m14: {
    id: "m14",
    title: "What is one small experiment for this week?",
    subtitle: "Choose something within your control that expresses this identity.",
    multiSelect: false,
    options: [
      {
        id: "m14_90min",
        label: "Protect a daily 90-minute morning deep-work block with zero phone/inbox.",
        subtext: "Attack the highest-leverage task before the world wakes up.",
      },
      {
        id: "m14_boundary",
        label: "Set a clear 6:00 PM digital shutdown boundary to protect sleep and calm.",
        subtext: "No screens, no work communication; restore nervous system baseline.",
      },
      {
        id: "m14_ship",
        label: "Ship one complete deliverable or writing piece without waiting for perfection.",
        subtext: "Replace endless revision with courageous exposure to feedback.",
      },
      {
        id: "m14_body",
        label: "Daily 30-minute outdoor walk or workout to reset mental clarity.",
        subtext: "Use physical movement to flush cortisol and ignite fresh thought.",
      },
    ],
  },

  // --- EVENING PROMPTS ---
  e1: {
    id: "e1",
    title: "What did today help you understand?",
    subtitle: "Connect your morning answers with the moments you noticed today.",
    multiSelect: false,
    options: [
      {
        id: "e1_friction",
        label: "Noticed where my energy leaked into low-leverage distractions.",
        subtext: "Awareness of the friction is the first step toward eliminating it.",
      },
      {
        id: "e1_power",
        label: "Felt the tangible power of staying present during my deep work block.",
        subtext: "When I protect my focus, quality and speed compound effortlessly.",
      },
      {
        id: "e1_boundary",
        label: "Recognized that my boundaries were tested and I held my ground.",
        subtext: "Saying no to secondary things felt uncomfortable but empowering.",
      },
      {
        id: "e1_grace",
        label: "Things didn't go perfectly, but I adapted with patience and self-grace.",
        subtext: "Replaced self-criticism with curious observation.",
      },
    ],
  },
  e2: {
    id: "e2",
    title: "Which pattern deserves your attention?",
    subtitle: "Name a changeable habit or belief, without turning it into a label.",
    multiSelect: false,
    options: [
      {
        id: "e2_phone",
        label: "Reaching for my phone during micro-moments of cognitive boredom.",
        subtext: "Habitual dopamine checking rather than letting the mind settle.",
      },
      {
        id: "e2_rushing",
        label: "Rushing frantically between tasks instead of breathing between transitions.",
        subtext: "Carrying residual tension from one meeting/task into the next.",
      },
      {
        id: "e2_delaying",
        label: "Delaying difficult decisions and letting them occupy background RAM.",
        subtext: "Decide quickly, iterate openly.",
      },
      {
        id: "e2_perfection",
        label: "Over-polishing details that don't move the real needle.",
        subtext: "Good enough to ship beats perfect in private.",
      },
    ],
  },
  e3: {
    id: "e3",
    title: "What direction do you want to leave behind?",
    subtitle: "Condense your anti-vision into one clear, powerful sentence.",
    multiSelect: false,
    options: [
      {
        id: "e3_mediocrity",
        label: "I refuse a life of comfortable apathy, scattered distraction, and quiet regret.",
        subtext: "The ultimate trap: safe, numbed-out, and unfulfilled.",
        motiveAffinity: "red",
      },
      {
        id: "e3_burnout",
        label: "I leave behind chronic people-pleasing, frantic hustle, and self-abandonment.",
        subtext: "No longer sacrificing my health and sanity for external validation.",
        motiveAffinity: "blue",
      },
      {
        id: "e3_chaos",
        label: "I refuse reactive chaos, zero calendar ownership, and living on others' terms.",
        subtext: "No more waking up to emergencies dictated by someone else's agenda.",
        motiveAffinity: "white",
      },
      {
        id: "e3_dabbling",
        label: "I leave behind half-hearted commitments and chasing every shiny distraction.",
        subtext: "Stopping the endless loop of starting without finishing.",
        motiveAffinity: "yellow",
      },
    ],
  },
  e4: {
    id: "e4",
    title: "What direction would you like to explore?",
    subtitle: "A provisional vision is enough. You can revise it as you learn.",
    multiSelect: false,
    options: [
      {
        id: "e4_sovereignty",
        label: "A sovereign life of creative mastery, location independence, and high leverage.",
        subtext: "Owning my calendar, building enduring assets, and choosing who I work with.",
        motiveAffinity: "red",
      },
      {
        id: "e4_harmony",
        label: "A calm, grounded life of deep craftsmanship, vibrant health, and loving presence.",
        subtext: "Living in rhythm with nature, physical vitality, and deep peace.",
        motiveAffinity: "white",
      },
      {
        id: "e4_impact",
        label: "An impactful journey of authentic leadership, generosity, and high contribution.",
        subtext: "Lifting others, creating lasting value, and leaving a legacy of integrity.",
        motiveAffinity: "blue",
      },
      {
        id: "e4_adventure",
        label: "A bold, curious life of continuous learning, creative flow, and vital celebration.",
        subtext: "Treating reality as a playground for growth, art, and inspiring projects.",
        motiveAffinity: "yellow",
      },
    ],
  },
  e5: {
    id: "e5",
    title: "What would meaningful progress look like in a year?",
    subtitle: "Choose one clear, observable outcome for your 1-Year Goal.",
    multiSelect: false,
    options: [
      {
        id: "e5_business",
        label: "An independent income stream generating predictable monthly revenue.",
        subtext: "Tangible proof of market value and personal sovereignty.",
        motiveAffinity: "red",
      },
      {
        id: "e5_craft",
        label: "A flagship project, portfolio, or body of work completed and shipped.",
        subtext: "Demonstrating deep mastery and professional excellence.",
        motiveAffinity: "blue",
      },
      {
        id: "e5_freedom",
        label: "Full control of my schedule with at least 4 completely open days every month.",
        subtext: "Systematized workflows and uncompromised personal freedom.",
        motiveAffinity: "white",
      },
      {
        id: "e5_vitality",
        label: "Peak physical health, body composition, and steady all-day mental stamina.",
        subtext: "Unshakeable biological energy powering everything else.",
        motiveAffinity: "yellow",
      },
    ],
  },
  e6: {
    id: "e6",
    title: "What could you finish in the next month?",
    subtitle: "Define a project small enough to begin now (your Boss Fight).",
    multiSelect: false,
    options: [
      {
        id: "e6_launch",
        label: "Build and publish the core minimum viable version of my project.",
        subtext: "Get the first iteration into the hands of real users or readers.",
        motiveAffinity: "red",
      },
      {
        id: "e6_system",
        label: "Architect and automate my personal knowledge & productivity operating system.",
        subtext: "Eliminate friction and establish rock-solid daily execution habits.",
        motiveAffinity: "white",
      },
      {
        id: "e6_health",
        label: "Complete a 30-day streak of clean nutrition, daily movement, and sleep hygiene.",
        subtext: "Locking down biological vitality as my non-negotiable anchor.",
        motiveAffinity: "blue",
      },
      {
        id: "e6_writing",
        label: "Write and publish 4 comprehensive essays or deep-dive newsletters.",
        subtext: "Clarify my thinking in public and build intellectual equity.",
        motiveAffinity: "yellow",
      },
    ],
  },
  e7: {
    id: "e7",
    title: "Which actions belong on tomorrow’s calendar?",
    subtitle: "Make them specific and realistic for your energy and time.",
    multiSelect: true,
    options: [
      {
        id: "e7_deepwork",
        label: "Execute a 90-minute uninterrupted deep work block at 9:00 AM.",
        subtext: "Advance the primary monthly project before checking email or messages.",
      },
      {
        id: "e7_workout",
        label: "Complete 45 minutes of strength training or brisk outdoor cardio.",
        subtext: "Energize the physiology and oxygenate the brain.",
      },
      {
        id: "e7_ship",
        label: "Finalize and send one key proposal, article draft, or outreach message.",
        subtext: "Take one decisive action that invites external feedback.",
      },
      {
        id: "e7_stillness",
        label: "20 minutes of silent reading or mindfulness before bed with no devices.",
        subtext: "Protect calm sleep hygiene and decompress the mind.",
      },
    ],
  },
};

const MASLOW_MOTIVE: Partial<Record<MaslowTier, AssessmentProfile["coreMotive"]>> =
  {
    somatic: "white",
    safety: "white",
    belonging: "blue",
    esteem: "red",
    actualization: "yellow",
    transcendence: "yellow",
  };

export function getPromptMsq(
  promptId: string,
  profile?: AssessmentProfile | null,
  locale: Locale = "en",
): MsqPromptDefinition | null {
  const def = MSQ_CATALOG[promptId];
  if (!def) return null;

  let working = def;
  if (profile) {
    const motiveBoost =
      (profile.maslowCenter && MASLOW_MOTIVE[profile.maslowCenter]) ||
      profile.coreMotive;
    const sortedOptions = [...def.options].sort((a, b) => {
      if (a.motiveAffinity === motiveBoost) return -1;
      if (b.motiveAffinity === motiveBoost) return 1;
      if (a.motiveAffinity === profile.coreMotive) return -1;
      if (b.motiveAffinity === profile.coreMotive) return 1;
      return 0;
    });
    working = { ...def, options: sortedOptions };
  }

  return localizeMsq(working, locale);
}

export function formatMsqAnswer(
  def: MsqPromptDefinition,
  selectedIds: string[],
  customText?: string,
): string {
  const chosen = def.options.filter((o) => selectedIds.includes(o.id));
  const chosenTexts = chosen.map((c) => c.label);

  const parts: string[] = [];
  if (chosenTexts.length > 0) {
    parts.push(chosenTexts.join("; "));
  }
  if (customText?.trim()) {
    if (chosenTexts.length > 0) {
      parts.push(`Note: ${customText.trim()}`);
    } else {
      parts.push(customText.trim());
    }
  }
  return parts.join("\n\n");
}

export function synthesizePlanFromAnswers(
  answers: Record<string, string>,
  existingPlan: Plan,
  profile?: AssessmentProfile | null,
): Plan {
  return {
    ...existingPlan,
    antiVision: answers.e3 || existingPlan.antiVision,
    vision: answers.e4 || existingPlan.vision,
    identity: answers.m13 || existingPlan.identity,
    year: answers.e5 || existingPlan.year,
    month: answers.e6 || existingPlan.month,
    constraints: existingPlan.constraints ||
      (profile?.primaryNeed === "freedom"
        ? "Protect 90-min deep work morning\nZero screen time after 9 PM\nNo meetings before 1 PM"
        : "Protect consistent morning routine\nTake lunch away from desk\nShutdown work by 6 PM"),
  };
}
