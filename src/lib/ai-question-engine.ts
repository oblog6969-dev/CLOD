/**
 * LifeOS Psychometric & Multi-Cycle AI Question Generation Engine
 * Derived from MatchWise clinical and human development frameworks (D:\AI\MatchWise).
 *
 * Integrates 14 frameworks:
 * 1. Dr. Taylor Hartman Color Code (Core Motives: Red, Blue, White, Yellow)
 * 2. DISC Assessment (Pace & Focus: D, I, S, C)
 * 3. The Birkman Method (Usual Style, Underlying Needs, Stress Triggers & Reactions)
 * 4. David Hawkins Map of Consciousness (Force <200 vs Power >=200, 200 Courage Pivot)
 * 5. Abraham Hicks Emotional Guidance Scale (22 Calibrated Set-Points)
 * 6. Abraham Maslow Hierarchy of Needs (6 Tiers: Physiological to Transcendence, D/B Needs)
 * 7. Schwartz Theory of Basic Human Values (10 Trans-situational Motivators)
 * 8. Robert Kegan Orders of Mind (Socialized Stage 3 vs Self-Authoring Stage 4) & Bowen Differentiation
 * 9. Adult Attachment Theory (ECR: Secure, Anxious, Avoidant)
 * 10. Thomas-Kilmann Conflict Modes (TKI: Competing, Collaborating, Compromising, Avoiding, Accommodating)
 * 11. Gottman Sound Relationship House (Four Horsemen Risks & Shared Meaning)
 * 12. FIRO-B Reciprocity (Inclusion, Control, Affection)
 * 13. Big Five / OCEAN (Empirical Trait Baseline)
 * 14. MBTI / Jungian Cognitive Style (Information Intake & Energy Orientation)
 *
 * Lifecycle Phases:
 * - Assessment: Diagnostic probing & defense mechanism resolution
 * - Vision & Mission: Anti-Vision, Purpose, and Schwartz 1-Year Goal formulation
 * - Planning & Levers: Daily actionable levers calibrated to DISC pace & Birkman recovery
 * - Execution & Check-ins: Daytime interrupts, pattern breakers, and state shifts
 * - Multi-Cycle Review: Reflection and calibration across 5 recursive time cycles
 *
 * Recursive Time Cycles:
 * - Daily: Morning reset (m1..m14), midday check-in, evening synthesis (e1..e7)
 * - Weekly: Friction audit, habit fidelity, boundary review, stress trigger recovery
 * - Monthly: Boss Fight milestone review, Maslow tier shifts, capacity recalibration
 * - Quarterly: Psychological re-assessment, Hawkins LoC check, strategic pivot
 * - Annual: Vision & Mission trajectory, Kegan self-authoring check, identity evolution
 */

import type { AssessmentProfile, Plan } from "./domain.ts";
import type { Locale } from "./language.tsx";

export type CycleType = "daily" | "weekly" | "monthly" | "quarterly" | "annual";

export type QuestionPhase =
  | "assessment"
  | "vision_mission"
  | "planning_levers"
  | "execution_checkin"
  | "multi_cycle_review";

export type QuestionOption = {
  id: string;
  label: string;
  subtext: string;
  scores?: {
    motive?: "red" | "blue" | "white" | "yellow";
    disc?: "D" | "I" | "S" | "C";
    need?: "structure" | "freedom" | "empathy" | "esteem";
    stress?: "chaos" | "restriction" | "conflict" | "dismissal";
    consciousnessDelta?: number;
    value?: string;
    maslowTier?: string;
  };
};

export type GeneratedQuestion = {
  id: string;
  cycle: CycleType;
  phase: QuestionPhase;
  title: string;
  subtitle: string;
  frameworks: string[];
  options: QuestionOption[];
};

export type EnginePromptInput = {
  cycle?: CycleType;
  phase?: QuestionPhase;
  promptId?: string;
  promptTitle?: string;
  promptSubtitle?: string;
  profile?: Partial<AssessmentProfile>;
  plan?: Partial<Plan>;
  historyObservations?: string[];
  locale?: Locale;
};

/**
 * Constructs the clinical framework instruction prompt for any connected AI.
 */
export function buildFrameworkSystemPrompt(input: EnginePromptInput): string {
  const cycle = input.cycle || "daily";
  const phase = input.phase || "multi_cycle_review";
  const profile = input.profile || {};
  const plan = input.plan || {};
  const locale = input.locale || "en";

  const coreMotive = profile.coreMotive || "white";
  const discStyle = profile.discStyle || "C";
  const primaryNeed = profile.primaryNeed || "freedom";
  const stressTrigger = profile.stressTrigger || "restriction";
  const consciousnessLevel = profile.consciousnessLevel || 280;
  const maslowCenter = profile.maslowCenter || "actualization";
  const topValues = (profile.topValues || ["self_direction", "achievement"]).join(", ");

  const cycleDirectives: Record<CycleType, string> = {
    daily:
      "DAILY CYCLE DIRECTIVE: Focus on immediate behavioral friction, morning posture, and evening synthesis. Ensure options address tangible actions for today within the user's DISC execution pace and Hartman motive.",
    weekly:
      "WEEKLY CYCLE DIRECTIVE: Focus on habit consistency, weekly friction audit, boundary defense, and identifying if Birkman stress triggers (chaos/restriction/conflict/dismissal) were tripped during the past 7 days.",
    monthly:
      "MONTHLY CYCLE DIRECTIVE: Focus on monthly 'Boss Fight' project milestones, Maslow need-tier stability (checking if deficiency D-needs pulled energy away from growth), and milestone execution.",
    quarterly:
      "QUARTERLY CYCLE DIRECTIVE: Focus on Hawkins Map of Consciousness calibration (Force <200 vs Power >=200), psychological re-assessment, archetype drift, and strategic life pivots.",
    annual:
      "ANNUAL CYCLE DIRECTIVE: Focus on Kegan Stage 4 Self-Authoring (living one's own values vs socialized expectations), Schwartz foundational values alignment, 1-Year Goal trajectory, and identity evolution.",
  };

  const phaseDirectives: Record<QuestionPhase, string> = {
    assessment:
      "PHASE DIRECTIVE: Diagnostic calibration. Probe subconscious motives and unacknowledged behavioral patterns. Eliminate defensive rationalization.",
    vision_mission:
      "PHASE DIRECTIVE: Vision & Mission setting. Probe what the user refuses to tolerate (Anti-Vision), their non-negotiable standards, and their Schwartz-aligned 1-Year Goal.",
    planning_levers:
      "PHASE DIRECTIVE: Action planning. Break abstract desires into high-leverage daily levers calibrated to the user's DISC tempo (D: power blocks, I: dynamic creative flow, S: steady ritual, C: precision checklists).",
    execution_checkin:
      "PHASE DIRECTIVE: Midday state reset. Detect emotional downward spirals (Hicks scale) or resistance (Hawkins <200) and provide an immediate mental reframe.",
    multi_cycle_review:
      "PHASE DIRECTIVE: Honest retrospective. Measure actual behavioral outcomes against internal standards without judgment or toxic positivity.",
  };

  return `You are an elite cognitive mentor and behavioral architect in LifeOS, integrating 14 clinical and human development frameworks derived from MatchWise (Hartman Color Code, Hawkins LoC, Birkman Method, DISC, Schwartz Values, Maslow 6 Tiers, Kegan Orders of Mind, Gottman House, Adult Attachment, TKI Conflict, FIRO-B, Big Five, MBTI, Hicks Scale).

USER PSYCHOMETRIC & SITUATIONAL PROFILE:
- Hartman Core Motive: ${coreMotive.toUpperCase()} (Red: Results/Power | Blue: Depth/Quality | White: Peace/Clarity | Yellow: Fun/Vitality)
- DISC Pace & Focus: Style ${discStyle} (D: Decisive/High-Tempo | I: Expressive/People | S: Steady/Harmony | C: Methodical/Precision)
- Birkman Underlying Need: ${primaryNeed} (Violating this creates severe stress)
- Birkman Stress Trigger: ${stressTrigger} (Leads to withdrawal, demanding, or digging in)
- Hawkins Consciousness Baseline: ~${consciousnessLevel} LoC (Pivot is 200 Courage; <200 is Force/fear/apathy, >=200 is Power/acceptance/reason)
- Maslow Center of Gravity: ${maslowCenter} tier
- Schwartz Guiding Values: ${topValues}
- Active Anti-Vision: "${plan.antiVision || "Unspecified"}"
- Active Vision: "${plan.vision || "Unspecified"}"
- 1-Year Goal: "${plan.year || "Unspecified"}"
- Current Constraints: "${plan.constraints || "Unspecified"}"

${cycleDirectives[cycle]}
${phaseDirectives[phase]}

CRITICAL ANTI-IDEALIZATION RULES (MATCHWISE CLINICAL STANDARD):
1. NO ABSTRACT VIRTUES: Do NOT provide generic, self-flattering options (e.g., "I choose kindness and wisdom"). Every option must represent a concrete, realistic behavioral trade-off or recognizable psychological posture.
2. GROUND IN STRESS REALITY: Account for the user's stress trigger ("${stressTrigger}") and primary need ("${primaryNeed}"). Include options that honestly reflect when someone feels overwhelmed, defensive, or in avoidance.
3. PRESERVE DIGNITY & AGENCY: Frame options with warm, non-judgmental clinical precision. The user should feel seen, not judged.
4. LANGUAGE: Generate all output labels and subtexts in ${locale === "ar" ? "fluent, modern Arabic (العربية الفصحى)" : "clear, punchy English"}.

OUTPUT FORMAT:
Return ONLY a valid JSON object matching this exact schema:
{
  "title": "string (the sharp, tailored reflection question)",
  "subtitle": "string (the psychological context or prompt nuance)",
  "frameworks": ["string (e.g. Hartman Color Code, DISC, Birkman)"],
  "options": [
    {
      "id": "opt_1",
      "label": "string (punchy, authentic 1-sentence statement)",
      "subtext": "string (the underlying psychological mechanism or trade-off)",
      "scores": {
        "motive": "red" | "blue" | "white" | "yellow",
        "disc": "D" | "I" | "S" | "C",
        "need": "structure" | "freedom" | "empathy" | "esteem",
        "stress": "chaos" | "restriction" | "conflict" | "dismissal",
        "consciousnessDelta": number (-20 to +30),
        "value": "string"
      }
    }
  ]
}`;
}

/**
 * Autonomous / Offline Psychometric Question Generator.
 * Provides instant, clinically grounded fallback questions for any cycle and phase
 * without requiring network connectivity or external LLM API tokens.
 */
export function generateOfflineFallbackQuestion(input: EnginePromptInput): GeneratedQuestion {
  const cycle = input.cycle || "daily";
  const phase = input.phase || "multi_cycle_review";
  const profile = input.profile || {};
  const isAr = input.locale === "ar";
  const motive = profile.coreMotive || "white";
  const disc = profile.discStyle || "C";
  const need = profile.primaryNeed || "freedom";

  // Cycle & Phase specific templates
  if (cycle === "weekly") {
    return {
      id: "weekly_friction_audit",
      cycle: "weekly",
      phase: "multi_cycle_review",
      title: isAr
        ? "أين استُنزفت طاقتك النفسية هذا الأسبوع؟"
        : "Where was your psychological energy drained this week?",
      subtitle: isAr
        ? "تشخيص مواطن الاحتكاك واستجابات الضغط غير الواعية بناءً على نموذج بيركمان وهارتمان."
        : "Diagnosing friction points and unconscious stress reactions via Birkman & Hartman.",
      frameworks: ["The Birkman Method", "Dr. Taylor Hartman Color Code", "DISC Assessment"],
      options: [
        {
          id: "w_opt_red",
          label: isAr
            ? "شعرت بالإحباط من البطء والتردد في محيطي واضطررت للضغط بنفسي."
            : "Felt blocked by slow execution or indecision and took forceful control.",
          subtext: isAr
            ? "نمط دافع القوة (Red) واحتياج الإنجاز الحاسم تحت الضغط."
            : "Red motive: urgency and control under perceived stagnation.",
          scores: { motive: "red", disc: "D", stress: "chaos", consciousnessDelta: 10 },
        },
        {
          id: "w_opt_blue",
          label: isAr
            ? "شعرت بعدم التقدير أو أن معايير الجودة والعمق تم تجاهلها."
            : "Felt unappreciated or that high standards and care were compromised.",
          subtext: isAr
            ? "نمط دافع العمق (Blue) وحساسية تجاوز المعايير أو الروابط."
            : "Blue motive: vulnerability to perceived neglect or superficiality.",
          scores: { motive: "blue", disc: "C", stress: "dismissal", consciousnessDelta: 10 },
        },
        {
          id: "w_opt_white",
          label: isAr
            ? "شعرت بالإرهاق من كثرة المتطلبات والضجيج واحتجت للانعزال واستعادة الهدوء."
            : "Felt overwhelmed by external demands and withdrew to preserve inner peace.",
          subtext: isAr
            ? "نمط دافع السلام (White) والانسحاب لحماية الاستقلالية والسكينة."
            : "White motive: self-protection through retreat and space.",
          scores: { motive: "white", disc: "S", stress: "restriction", consciousnessDelta: 15 },
        },
        {
          id: "w_opt_yellow",
          label: isAr
            ? "شعرت بالملل والروتين الخانق وفقدت الحافز لإكمال المهام الرتيبة."
            : "Felt drained by monotonous routines and struggled with follow-through.",
          subtext: isAr
            ? "نمط دافع الحيوية (Yellow) والحاجة إلى التجديد والتحفيز الإبداعي."
            : "Yellow motive: resistance to rigid repetition without novelty.",
          scores: { motive: "yellow", disc: "I", stress: "restriction", consciousnessDelta: 10 },
        },
      ],
    };
  }

  if (cycle === "monthly") {
    return {
      id: "monthly_boss_fight_review",
      cycle: "monthly",
      phase: "multi_cycle_review",
      title: isAr
        ? "كيف تقيّم مسار مشروعك الرئيسي (Boss Fight) لهذا الشهر؟"
        : "How do you evaluate your monthly milestone ('Boss Fight') trajectory?",
      subtitle: isAr
        ? "موازنة هرم ماسلو للحاجات (الاحتياجات الأساسية مقابل النمو) ومعدل التقدم الفعلي."
        : "Balancing Maslow's need hierarchy (D-needs vs B-growth) and actual progress.",
      frameworks: ["Maslow Hierarchy of Needs", "DISC Assessment", "Schwartz Basic Values"],
      options: [
        {
          id: "m_opt_growth",
          label: isAr
            ? "حققت تقدماً جوهرياً في المشروع المركزي مع الحفاظ على تركيز واضح."
            : "Made tangible, high-agency progress on the core milestone with clear focus.",
          subtext: isAr
            ? "حالة توازن هرمي تدعم تحقيق الذات (Self-Actualization)."
            : "Operating in self-actualization growth zone with solid foundation.",
          scores: { motive: "red", disc: "D", consciousnessDelta: 25 },
        },
        {
          id: "m_opt_deficiency",
          label: isAr
            ? "تشتت طاقتي في معالجة ضغوطات يومية ونواقص أساسية حالت دون التركيز على المشروع."
            : "Deficiency needs (energy, security, schedule chaos) consumed project bandwidth.",
          subtext: isAr
            ? "انحسار الطاقة نحو حاجات النقص (D-Needs) يتطلب إعادة ترتيب الأولويات."
            : "Energy pulled back to lower Maslow tiers; needs stabilization first.",
          scores: { motive: "white", disc: "S", stress: "chaos", consciousnessDelta: 5 },
        },
        {
          id: "m_opt_refine",
          label: isAr
            ? "أحتاج إلى تبسيط معالم المشروع وتقسيمها إلى روافع يومية أكثر دقة."
            : "Need to ruthlessly simplify milestone scope into smaller methodical daily levers.",
          subtext: isAr
            ? "تطبيق وتيرة DISC المنهجية (C) لخفض المقاومة الإدراكية."
            : "Applying Conscientious (C) pacing to reduce cognitive friction.",
          scores: { motive: "blue", disc: "C", stress: "chaos", consciousnessDelta: 15 },
        },
      ],
    };
  }

  if (cycle === "quarterly") {
    return {
      id: "quarterly_consciousness_pivot",
      cycle: "quarterly",
      phase: "multi_cycle_review",
      title: isAr
        ? "ما هي الحالة الإدراكية المهيمنة على قراراتك خلال الربع الماضي؟"
        : "What was your dominant consciousness posture across the past quarter?",
      subtitle: isAr
        ? "معايرة سلم ديفيد هوكينز: هل تحركت من منطلق القوة الواعية (>=200) أم رد الفعل والاضطرار (<200)؟"
        : "David Hawkins Map calibration: operating from Power (>=200) vs Force/Fear (<200).",
      frameworks: ["David Hawkins Map of Consciousness", "Robert Kegan Orders of Mind"],
      options: [
        {
          id: "q_opt_power",
          label: isAr
            ? "تحركت من منطلق الشجاعة والمسؤولية الكاملة (Courage & Willingness)."
            : "Operated from intentional courage, willingness, and personal accountability (LoC 200–310).",
          subtext: isAr
            ? "تجاوز عتبة القوة: رؤية العقبات كفرص للتطور وليس كتهديد."
            : "Transpassed the 200 threshold: challenges are feedback, not identity threats.",
          scores: { consciousnessDelta: 30, motive: "red" },
        },
        {
          id: "q_opt_force",
          label: isAr
            ? "تكررت نوبات القلق والتردد والمماطلة بسبب الخوف من الفشل أو فقدان السيطرة."
            : "Fell into reactive loops of anxiety, hesitation, or avoidance (LoC < 200).",
          subtext: isAr
            ? "مؤشر على استهلاك الطاقة في المقاومة الدفاعية؛ يتطلب تفعيل Anti-Vision."
            : "Force-based resistance; requires grounding in Anti-Vision boundaries.",
          scores: { consciousnessDelta: -10, stress: "restriction" },
        },
        {
          id: "q_opt_acceptance",
          label: isAr
            ? "تقبلت الواقع بوضوح وهدوء، وأعدت توجيه أهدافي بما يتناسب مع المعطيات."
            : "Practiced calm acceptance and clarity, recalibrating direction without self-blame.",
          subtext: isAr
            ? "مستوى القبول والتفكير العقلاني (LoC 350-400)."
            : "Acceptance & Reason (LoC 350–400): mature self-differentiation.",
          scores: { consciousnessDelta: 20, motive: "white" },
        },
      ],
    };
  }

  if (cycle === "annual") {
    return {
      id: "annual_identity_evolution",
      cycle: "annual",
      phase: "vision_mission",
      title: isAr
        ? "من هو الشخص الذي أصبحت عليه، وما هو الاتجاه الذي يمثّل هويتك القادمة؟"
        : "Who have you become this year, and what direction defines your emerging identity?",
      subtitle: isAr
        ? "مراجعة كيجان للسيادة الذاتية (Self-Authoring) وقيم شوارتز الحاكمة ومسار الرؤية لعام كامل."
        : "Kegan Stage 4 Self-Authoring, Schwartz Values, and your living 1-Year Vision.",
      frameworks: [
        "Robert Kegan Orders of Mind",
        "Schwartz Basic Values",
        "Dr. Taylor Hartman Color Code",
      ],
      options: [
        {
          id: "a_opt_authoring",
          label: isAr
            ? "تخلصت من توقعات الآخرين وبدأت أبني معاييري الذاتية بوضوح واستقلالية."
            : "Discarded borrowed social scripts to deliberately author my own standards and craft.",
          subtext: isAr
            ? "كيجان المرحلة 4: السيادة الذاتية والتحرر من الرغبة في إرضاء المحيط."
            : "Kegan Stage 4: Self-Authoring and internal locus of evaluation.",
          scores: { consciousnessDelta: 25, motive: "white", value: "self_direction" },
        },
        {
          id: "a_opt_mastery",
          label: isAr
            ? "رسخت مهارة حاسمة وأثبت قدرتي على تحقيق نتائج ملموسة تحت الضغط."
            : "Cemented decisive leverage and proven execution capabilities in my core domain.",
          subtext: isAr
            ? "قيمة الإنجاز والسيادة (Achievement & Mastery)."
            : "Schwartz Mastery/Achievement grounded in tangible capability.",
          scores: { consciousnessDelta: 20, motive: "red", value: "achievement" },
        },
        {
          id: "a_opt_purpose",
          label: isAr
            ? "أصبحت أكثر ارتباطاً برسالتي الأخلاقية والإنسانية ومساعدة من حولي على النمو."
            : "Deepened alignment with transcendent meaning, integrity, and supporting others.",
          subtext: isAr
            ? "دافع العطاء والاتصال العميق (Benevolence & Purpose)."
            : "Benevolence and deep purpose; legacy over immediate gratification.",
          scores: { consciousnessDelta: 25, motive: "blue", value: "benevolence" },
        },
      ],
    };
  }

  // Default Daily Reset Question
  return {
    id: "daily_morning_alignment",
    cycle: "daily",
    phase: "execution_checkin",
    title: input.promptTitle || (isAr ? "ما هو الموقف الإدراكي الذي تختاره لبدء يومك؟" : "What is your primary cognitive posture for today?"),
    subtitle: input.promptSubtitle || (isAr ? "معايرة دافع هارتمان ووتيرة الإنجاز لتوجيه طاقتك نحو المهام الأساسية." : "Calibrating your Hartman motive and execution tempo to protect high-leverage focus."),
    frameworks: ["Dr. Taylor Hartman Color Code", "DISC Assessment", "The Birkman Method"],
    options: [
      {
        id: "d_opt_direct",
        label: isAr
          ? "التركيز على النتيجة الحاسمة وإنهاء المهمة الأكثر تأثيراً أولاً دون تسويف."
          : "Attack the highest-leverage priority first with decisive execution and zero noise.",
        subtext: isAr ? "دافع القوة (Red) ووتيرة الحسم (D)." : "Red motive / D pace: maximum agency and tangible momentum.",
        scores: { motive: "red", disc: "D", consciousnessDelta: 15 },
      },
      {
        id: "d_opt_calm",
        label: isAr
          ? "حماية صفاء ذهني، والعمل بهدوء وتأنٍ على خطوة واحدة واضحة ومتقنة."
          : "Protect mental clarity and work with steady, unhurried precision on one key step.",
        subtext: isAr ? "دافع السلام (White) ووتيرة الاستقرار (S)." : "White motive / S pace: calm boundary defense and high focus.",
        scores: { motive: "white", disc: "S", consciousnessDelta: 15 },
      },
      {
        id: "d_opt_craft",
        label: isAr
          ? "الارتقاء بجودة العمل والاهتمام بالتفاصيل التي تمنح الجهد معنى حقيقياً."
          : "Infuse deep craft, care, and excellence into every detail of the work.",
        subtext: isAr ? "دافع العمق (Blue) والمنهجية الدقيقة (C)." : "Blue motive / C pace: craft mastery and intellectual honesty.",
        scores: { motive: "blue", disc: "C", consciousnessDelta: 15 },
      },
      {
        id: "d_opt_vitality",
        label: isAr
          ? "مقاربة المهام بمرونة وطاقة إبداعية متجددة والتخلص من الرتابة."
          : "Approach tasks with creative curiosity, lightness, and enthusiasm.",
        subtext: isAr ? "دافع الحيوية (Yellow) ووتيرة التحفيز (I)." : "Yellow motive / I pace: creative catalytic flow.",
        scores: { motive: "yellow", disc: "I", consciousnessDelta: 15 },
      },
    ],
  };
}
